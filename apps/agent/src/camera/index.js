import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { mkdir, readFile, stat } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { existsSync } from 'node:fs'
import { run, has } from '../util.js'

const here = dirname(fileURLToPath(import.meta.url))
const BIN = join(tmpdir(), 'ue-camera')

// macOS 도우미를 한 번 컴파일해 둔다(Info.plist에 카메라 사용 설명을 심는다).
async function ensureMacHelper() {
  if (process.platform !== 'darwin') return { ok: false, why: 'not_macos' }
  if (existsSync(BIN)) return { ok: true }
  const r = await run('/usr/bin/swiftc', ['-O', join(here, 'camera.swift'), '-o', BIN, '-Xlinker', '-sectcreate', '-Xlinker', '__TEXT', '-Xlinker', '__info_plist', '-Xlinker', join(here, 'Info.plist')], { timeout: 120000 })
  if (r.code) return { ok: false, why: 'swiftc_failed', detail: r.stderr.slice(0, 300) }
  await run('/usr/bin/codesign', ['-s', '-', '-f', BIN])
  return { ok: true }
}

// 사용 가능한 경로를 모두 점검해 보고한다. 각 항목은 { ok, ... }이며 실패 이유를 그대로 담는다.
export async function listCameras() {
  const out = { webcam: null, dslr: null, ffmpeg: await has('ffmpeg'), imagesnap: await has('imagesnap') }
  const h = await ensureMacHelper()
  if (h.ok) {
    const r = await run(BIN, ['list'])
    if (r.signal === 'SIGKILL' || r.code === 137) out.webcam = { ok: false, error: 'camera_permission_killed', message: 'macOS가 이 프로세스의 카메라 접근을 차단해 종료시켰다. 터미널 앱(카메라 권한 부여)에서 에이전트를 직접 실행해야 한다.' }
    else { try { out.webcam = JSON.parse(r.stdout) } catch { out.webcam = { ok: false, error: 'parse', detail: r.stdout.slice(0, 200) || r.stderr.slice(0, 200) } } }
  } else out.webcam = { ok: false, error: h.why, detail: h.detail }
  if (await has('gphoto2')) { const g = await run('gphoto2', ['--auto-detect']); out.dslr = { ok: g.code === 0, tool: 'gphoto2', output: g.stdout.trim() } }
  else out.dslr = { ok: false, error: 'gphoto2_missing', message: 'DSLR 제어 도구 gphoto2가 없다. macOS는 brew install gphoto2, Windows는 digiCamControl 또는 Canon EDSDK가 필요하다.' }
  return out
}

export async function capture({ index = 0 } = {}) {
  const dir = join(tmpdir(), 'ue-agent'); await mkdir(dir, { recursive: true })
  const file = join(dir, `shot-${Date.now()}.jpg`)
  if (await has('gphoto2')) {
    const g = await run('gphoto2', ['--capture-image-and-download', '--filename', file, '--force-overwrite'], { timeout: 30000 })
    if (!g.code) return { ok: true, source: 'gphoto2', file, bytes: (await stat(file)).size }
  }
  if (await has('imagesnap')) {
    const s = await run('imagesnap', ['-w', '1.5', file], { timeout: 20000 })
    if (!s.code) return { ok: true, source: 'imagesnap', file, bytes: (await stat(file)).size }
  }
  if (await has('ffmpeg') && process.platform === 'darwin') {
    const f = await run('ffmpeg', ['-y', '-f', 'avfoundation', '-framerate', '30', '-i', String(index), '-frames:v', '1', file], { timeout: 20000 })
    if (!f.code) return { ok: true, source: 'ffmpeg', file, bytes: (await stat(file)).size }
  }
  const h = await ensureMacHelper()
  if (h.ok) {
    const r = await run(BIN, ['capture', file, String(index)], { timeout: 30000 })
    if (r.signal === 'SIGKILL' || r.code === 137) return { ok: false, error: 'camera_permission_killed', message: 'macOS가 카메라 접근을 막고 프로세스를 종료했다. 카메라 권한이 있는 터미널에서 실행해야 한다.' }
    if (!r.code) return { ok: true, source: 'avfoundation', file, bytes: (await stat(file)).size }
    try { return JSON.parse(r.stderr.trim().split('\n').pop()) } catch { return { ok: false, error: 'capture_failed', detail: r.stderr.slice(0, 300) } }
  }
  return { ok: false, error: 'no_capture_path', message: 'gphoto2, imagesnap, ffmpeg, AVFoundation 도우미 모두 사용할 수 없다.' }
}

export async function readShot(file) { return (await readFile(file)).toString('base64') }
