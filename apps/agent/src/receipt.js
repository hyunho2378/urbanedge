import iconv from 'iconv-lite'
import net from 'node:net'
import { writeFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

// ESC/POS 영수증. 한글은 CP949(EUC-KR 확장)로 인코딩한다. 프린터마다 한글 코드페이지 설정이 다르므로 프린터 DIP/설정에서 한글 모드(KS5601)를 켜야 한다.
const ESC = 0x1b, GS = 0x1d
const cp949 = (s) => iconv.encode(s, 'cp949')
export function buildReceipt({ shop = 'UrbanEdge', lines = [], total, method, approvalNo, cardMasked, tid, at = new Date(), cut = true }) {
  const out = []
  const push = (...b) => out.push(Buffer.from(b))
  const text = (s) => out.push(cp949(s))
  push(ESC, 0x40)                 // 초기화
  push(ESC, 0x61, 1); push(ESC, 0x45, 1); text(shop + '\n'); push(ESC, 0x45, 0)   // 가운데, 굵게
  push(ESC, 0x61, 0)
  text('--------------------------------\n')
  for (const [k, v] of lines) text(`${k}`.padEnd(14) + `${v}`.padStart(18) + '\n')
  text('--------------------------------\n')
  if (total != null) { push(ESC, 0x45, 1); text('합계'.padEnd(14) + `${Number(total).toLocaleString('ko-KR')}원`.padStart(18) + '\n'); push(ESC, 0x45, 0) }
  if (method) text(`결제수단: ${method}\n`)
  if (cardMasked) text(`카드번호: ${cardMasked}\n`)
  if (approvalNo) text(`승인번호: ${approvalNo}\n`)
  if (tid) text(`단말기ID: ${tid}\n`)
  text(`${at.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}\n\n\n`)
  if (cut) push(GS, 0x56, 0x42, 0x00) // 부분 절단
  return Buffer.concat(out)
}

export async function sendReceipt(bytes, { host, port = 9100 } = {}) {
  const dir = join(tmpdir(), 'ue-agent'); await mkdir(dir, { recursive: true })
  const file = join(dir, `receipt-${Date.now()}.bin`); await writeFile(file, bytes)
  if (!host) return { ok: true, file, bytes: bytes.length, sent: false }
  return new Promise((resolve) => {
    const s = net.createConnection({ host, port, timeout: 4000 }, () => s.end(bytes))
    s.on('close', () => resolve({ ok: true, file, bytes: bytes.length, sent: true }))
    s.on('error', (e) => resolve({ ok: false, file, error: e.code || 'net', message: e.message }))
    s.on('timeout', () => { s.destroy(); resolve({ ok: false, file, error: 'timeout' }) })
  })
}
