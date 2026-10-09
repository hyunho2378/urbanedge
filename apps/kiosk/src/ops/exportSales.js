// ops/exportSales.js: 서버 없이도 되는 CSV 내보내기. 엑셀에서 한글이 깨지지 않게 BOM을 붙인다.
import { BOOTHS } from './store.js'
import { allFrames } from '../flow/prints.js'

const esc = (v) => {
  const s = v == null ? '' : String(v)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}
const p2 = (n) => String(n).padStart(2, '0')
const stamp = (ts) => {
  const d = new Date(ts)
  return `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())} ${p2(d.getHours())}:${p2(d.getMinutes())}:${p2(d.getSeconds())}`
}

export function salesCsv(rows) {
  const names = Object.fromEntries(allFrames().map((f) => [f.id, f.name?.ko || f.id]))
  const head = ['시각', '부스', '상품', '프레임', '결제수단', '쿠폰', '할인', '금액', '상태']
  const lines = [head.join(',')]
  for (const t of rows) {
    const b = BOOTHS.find((x) => x.id === t.booth)
    lines.push([stamp(t.ts), b ? b.name.ko : t.booth, t.product || '', t.frameId ? names[t.frameId] || t.frameId : '', t.method, t.coupon || '', t.discount || 0, t.amount, t.status === 'refunded' ? '환불' : '완료'].map(esc).join(','))
  }
  return `\uFEFF${lines.join('\r\n')}\r\n`
}

export function exportSales(rows, range) {
  const blob = new Blob([salesCsv(rows)], { type: 'text/csv;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `urbanedge-sales-${range}-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(a.href), 2000)
}
