import { writeFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { run } from './util.js'

export async function listPrinters() {
  const p = await run('/usr/bin/lpstat', ['-p']), d = await run('/usr/bin/lpstat', ['-d'])
  const printers = (p.stdout.match(/^printer\s+(\S+)/gm) || []).map((l) => l.replace(/^printer\s+/, ''))
  const def = (d.stdout.match(/:\s*(\S+)\s*$/m) || [])[1] || null
  return { ok: true, printers, default: def, raw: (p.stdout + p.stderr).trim().slice(0, 300) }
}

// PNG(base64)를 임시 파일로 쓰고 lp로 보낸다. dryRun이면 명령줄만 만든다.
// DNP DS620/DS-RX1HS는 OS 드라이버가 용지 크기(예: 4x6, 2x6 컷)를 옵션으로 받는다. media 값은 드라이버 PPD마다 다르다(lpoptions -p <printer> -l로 확인).
export async function print({ pngBase64, copies = 1, printer, media, dryRun = false }) {
  if (!pngBase64) return { ok: false, error: 'no_image' }
  const buf = Buffer.from(pngBase64, 'base64')
  if (buf.length < 8 || buf.subarray(1, 4).toString() !== 'PNG') return { ok: false, error: 'not_png' }
  const dir = join(tmpdir(), 'ue-agent'); await mkdir(dir, { recursive: true })
  const file = join(dir, `print-${Date.now()}.png`); await writeFile(file, buf)
  const args = []
  if (printer) args.push('-d', printer)
  args.push('-n', String(Math.max(1, Math.min(20, copies | 0))))
  if (media) args.push('-o', `media=${media}`)
  args.push('-o', 'fit-to-page', file)
  const cmd = ['lp', ...args]
  if (dryRun) return { ok: true, dryRun: true, file, command: cmd.join(' ') }
  const r = await run('/usr/bin/lp', args)
  return { ok: r.code === 0, file, command: cmd.join(' '), stdout: r.stdout.trim(), stderr: r.stderr.trim() }
}

// 프린터가 없을 때도 인쇄 파이프라인(PNG 래스터 → PDF)이 되는지 CUPS 필터로 증명한다.
export async function renderToPdf(pngFile, outFile) {
  const r = await run('/usr/sbin/cupsfilter', ['-m', 'application/pdf', pngFile], { binary: true, timeout: 30000 })
  if (r.code || !r.stdout?.length) return { ok: false, stderr: String(r.stderr).slice(0, 300) }
  await writeFile(outFile, r.stdout)
  return { ok: true, outFile, bytes: r.stdout.length }
}
