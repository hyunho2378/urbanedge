// export.js: 매출 내보내기. csv(엑셀에서 한글이 깨지지 않게 BOM), xlsx(요약+거래내역), hwpx(한글 보고서, kordoc), pdf(pdfkit + Pretendard).
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { TZ, BOOTHS, DEFAULT_FRAME_NAMES } from './db.js'
import { stats } from './stats.js'

const FONT_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'fonts')
const METHOD = { card: '카드', samsungpay: '삼성페이', cash: '현금', coupon: '쿠폰' }
const CHANNEL = { web: '웹사이트', single: '1회용 코드', legacy: '이전 웹 코드', registered: '등록 코드' }
export const RANGE_KO = { today: '오늘', week: '이번 주', month: '이번 달', year: '올해' }
const won = (n) => `${Number(n || 0).toLocaleString('ko-KR')}원`
const kst = (d) => new Intl.DateTimeFormat('sv-SE', { timeZone: TZ, dateStyle: 'short', timeStyle: 'medium' }).format(new Date(d))
const kstDay = (d) => new Intl.DateTimeFormat('sv-SE', { timeZone: TZ, dateStyle: 'short' }).format(new Date(d))

export async function buildData(pool, range) {
  const st = await stats(pool, range)
  const [pr, fr, pa] = await Promise.all([
    pool.query('SELECT id, name FROM products'),
    pool.query('SELECT id, custom FROM frames'),
    pool.query('SELECT id, label FROM partners'),
  ])
  const productName = Object.fromEntries(pr.rows.map((r) => [r.id, r.name?.ko || r.id]))
  const frameName = { ...DEFAULT_FRAME_NAMES }
  for (const r of fr.rows) {
    const n = r.custom?.name
    if (n) frameName[r.id] = typeof n === 'string' ? n : n.ko || r.id
  }
  const partner = Object.fromEntries(pa.rows.map((r) => [r.id, r.label]))
  const boothName = Object.fromEntries(BOOTHS.map((b) => [b.id, b.name]))
  const { rows } = await pool.query(`SELECT * FROM transactions WHERE ts >= $1 AND ts < $2 ORDER BY ts DESC LIMIT 100000`, [st.from, st.to])
  const tx = rows.map((r) => ({
    시각: kst(r.ts),
    부스: boothName[r.booth] || r.booth,
    상품: productName[r.product] || r.product || '',
    프레임: r.frame_id ? frameName[r.frame_id] || r.frame_id : '',
    결제수단: METHOD[r.method] || r.method,
    쿠폰: r.coupon || '',
    쿠폰채널: r.coupon_channel ? CHANNEL[r.coupon_channel] || partner[r.coupon_channel] || r.coupon_channel : '',
    금액: r.amount,
    할인: r.discount,
    상태: r.status === 'refunded' ? '환불' : '결제',
  }))
  const nm = (rowsIn, f) => rowsIn.map((r) => ({ 항목: f(r), 건수: r.count, 매출: r.revenue, 비중: r.share }))
  const share = (rowsIn) => {
    const sum = rowsIn.reduce((a, r) => a + r.revenue, 0)
    return rowsIn.map((r) => ({ ...r, share: sum ? Math.round((r.revenue / sum) * 1000) / 10 : 0 }))
  }
  const sections = [
    { title: '부스별', rows: nm(share(st.byBooth), (r) => boothName[r.key] || r.key) },
    { title: '상품별', rows: nm(share(st.byProduct), (r) => productName[r.key] || (r.key === '-' ? '상품 미선택' : r.key)) },
    { title: '프레임별', rows: nm(st.byFrame, (r) => r.name) },
    { title: '결제수단별', rows: nm(share(st.byMethod), (r) => METHOD[r.key] || r.key) },
    { title: '쿠폰 채널별', rows: nm(share(st.byCouponChannel), (r) => CHANNEL[r.key] || partner[r.key] || r.key) },
  ].filter((s) => s.rows.length)
  const c = st.current
  const kpi = [
    ['매출', won(c.revenue)],
    ['결제 건수', `${c.count}건`],
    ['객단가', won(c.avg)],
    ['환불', `${c.refundCount}건 ${won(c.refundAmount)}`],
  ]
  const period = `${kstDay(st.from)} ~ ${kstDay(st.to)} (${RANGE_KO[range]})`
  return { range, title: `UrbanEdge 매출 보고서 ${RANGE_KO[range]}`, period, kpi, sections, tx }
}

const csvCell = (v) => {
  const s = String(v ?? '')
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}
export function toCsv(d, kind) {
  const lines = []
  if (kind === 'summary') {
    lines.push(['구분', '항목', '건수', '매출', '비중(%)'].map(csvCell).join(','))
    for (const s of d.sections) for (const r of s.rows) lines.push([s.title, r.항목, r.건수, r.매출, r.비중].map(csvCell).join(','))
  } else {
    const head = ['시각', '부스', '상품', '프레임', '결제수단', '쿠폰', '쿠폰채널', '금액', '할인', '상태']
    lines.push(head.join(','))
    for (const t of d.tx) lines.push(head.map((h) => csvCell(t[h])).join(','))
  }
  return Buffer.from('\uFEFF' + lines.join('\r\n') + '\r\n', 'utf8')
}

export async function toXlsx(d) {
  const { default: ExcelJS } = await import('exceljs')
  const wb = new ExcelJS.Workbook()
  wb.creator = 'UrbanEdge'
  const bold = (row) => row.eachCell((c) => { c.font = { bold: true }; c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFD400' } } })
  const s1 = wb.addWorksheet('요약')
  s1.addRow([d.title]).font = { bold: true, size: 14 }
  s1.addRow([d.period])
  s1.addRow([])
  for (const [k, v] of d.kpi) s1.addRow([k, v])
  for (const s of d.sections) {
    s1.addRow([])
    s1.addRow([s.title]).font = { bold: true }
    bold(s1.addRow(['항목', '건수', '매출', '비중(%)']))
    for (const r of s.rows) {
      const row = s1.addRow([r.항목, r.건수, r.매출, r.비중])
      row.getCell(3).numFmt = '#,##0"원"'
      row.getCell(4).numFmt = '0.0'
    }
  }
  s1.columns = [{ width: 24 }, { width: 14 }, { width: 18 }, { width: 12 }]
  const s2 = wb.addWorksheet('거래내역')
  const head = ['시각', '부스', '상품', '프레임', '결제수단', '쿠폰', '쿠폰채널', '금액', '할인', '상태']
  bold(s2.addRow(head))
  for (const t of d.tx) {
    const row = s2.addRow(head.map((h) => t[h]))
    row.getCell(8).numFmt = '#,##0"원"'
    row.getCell(9).numFmt = '#,##0"원"'
  }
  s2.columns = [20, 12, 14, 14, 10, 16, 12, 12, 10, 8].map((width) => ({ width }))
  s2.views = [{ state: 'frozen', ySplit: 1 }]
  s2.autoFilter = { from: 'A1', to: 'J1' }
  return Buffer.from(await wb.xlsx.writeBuffer())
}

const mdCell = (v) => String(v ?? '').replace(/\|/g, '/').replace(/\r?\n/g, ' ')
const mdTable = (head, rows) => [`| ${head.join(' | ')} |`, `| ${head.map(() => '---').join(' | ')} |`, ...rows.map((r) => `| ${r.map(mdCell).join(' | ')} |`)].join('\n')

export function toMarkdown(d, kind) {
  const out = [`# ${d.title}`, '', `기간: ${d.period}`, '', '## 요약', '', mdTable(['항목', '값'], d.kpi)]
  for (const s of d.sections) {
    out.push('', `## ${s.title} 매출`, '', mdTable(['항목', '건수', '매출', '비중'], s.rows.map((r) => [r.항목, `${r.건수}건`, won(r.매출), `${r.비중}%`])))
  }
  if (kind !== 'summary') {
    const last = d.tx.slice(0, 50)
    out.push('', `## 최근 거래 ${last.length}건`, '', mdTable(['시각', '부스', '상품', '프레임', '결제수단', '금액', '상태'], last.map((t) => [t.시각, t.부스, t.상품, t.프레임, t.결제수단, won(t.금액), t.상태])))
  }
  return out.join('\n') + '\n'
}

export async function toHwpx(d, kind) {
  const k = await import('kordoc')
  const warnings = []
  const raw = await k.markdownToHwpx(toMarkdown(d, kind), { gongmun: { preset: k.normalizeGongmunPreset('보고서') }, warnings })
  const buf = Buffer.from(raw.buffer ? raw.buffer : raw)
  const v = await k.validateHwpx(buf)
  if (!v.ok) throw Object.assign(new Error(`한글 문서 검사 실패: ${(v.issues || []).map((i) => i.message || i).join(', ').slice(0, 200)}`), { status: 502 })
  return buf
}

export async function toPdf(d, kind) {
  const { default: PDFDocument } = await import('pdfkit')
  const doc = new PDFDocument({ size: 'A4', margin: 40, info: { Title: d.title, Author: 'UrbanEdge' } })
  doc.registerFont('R', path.join(FONT_DIR, 'Pretendard-Regular.otf'))
  doc.registerFont('B', path.join(FONT_DIR, 'Pretendard-Bold.otf'))
  const chunks = []
  doc.on('data', (c) => chunks.push(c))
  const done = new Promise((resolve) => doc.on('end', resolve))
  const W = doc.page.width - 80
  const table = (head, rows, widths) => {
    const draw = (cells, bold) => {
      const y = doc.y
      if (y > doc.page.height - 70) { doc.addPage(); }
      const yy = doc.y
      doc.font(bold ? 'B' : 'R').fontSize(9)
      let x = 40
      cells.forEach((c, i) => {
        doc.text(String(c ?? ''), x + 2, yy, { width: widths[i] - 4, lineBreak: false, ellipsis: true })
        x += widths[i]
      })
      doc.y = yy + 15
      if (bold) doc.moveTo(40, doc.y - 2).lineTo(40 + W, doc.y - 2).lineWidth(0.8).stroke('#000')
    }
    draw(head, true)
    for (const r of rows) draw(r, false)
  }
  doc.font('B').fontSize(18).text(d.title, 40, 40)
  doc.font('R').fontSize(10).text(`기간: ${d.period}`, 40, doc.y + 4)
  doc.moveDown(0.8)
  doc.font('B').fontSize(12).text('요약')
  doc.moveDown(0.3)
  for (const [kx, v] of d.kpi) doc.font('R').fontSize(10).text(`${kx}: ${v}`)
  for (const s of d.sections) {
    doc.moveDown(0.8)
    if (doc.y > doc.page.height - 120) doc.addPage()
    doc.font('B').fontSize(12).text(`${s.title} 매출`, 40)
    doc.moveDown(0.3)
    table(['항목', '건수', '매출', '비중'], s.rows.map((r) => [r.항목, `${r.건수}건`, won(r.매출), `${r.비중}%`]), [W * 0.4, W * 0.15, W * 0.3, W * 0.15])
  }
  if (kind !== 'summary') {
    doc.addPage()
    const last = d.tx.slice(0, 200)
    doc.font('B').fontSize(12).text(`거래 내역 ${last.length}건`, 40, 40)
    doc.moveDown(0.3)
    table(['시각', '부스', '상품', '프레임', '결제수단', '금액', '상태'], last.map((t) => [t.시각, t.부스, t.상품, t.프레임, t.결제수단, won(t.금액), t.상태]), [W * 0.22, W * 0.12, W * 0.16, W * 0.16, W * 0.1, W * 0.14, W * 0.1])
  }
  doc.end()
  await done
  return Buffer.concat(chunks)
}

export const FORMATS = {
  csv: { mime: 'text/csv; charset=utf-8', ext: 'csv' },
  xlsx: { mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', ext: 'xlsx' },
  hwpx: { mime: 'application/hwp+zip', ext: 'hwpx' },
  pdf: { mime: 'application/pdf', ext: 'pdf' },
}

export async function makeExport(pool, { format, range, kind }) {
  const f = FORMATS[format]
  if (!f) throw Object.assign(new Error('format은 csv, xlsx, hwpx, pdf 중 하나다.'), { status: 400 })
  if (!RANGE_KO[range]) throw Object.assign(new Error('range는 today, week, month, year 중 하나다.'), { status: 400 })
  kind = kind === 'summary' ? 'summary' : 'tx'
  const d = await buildData(pool, range)
  const body = format === 'csv' ? toCsv(d, kind) : format === 'xlsx' ? await toXlsx(d) : format === 'hwpx' ? await toHwpx(d, kind) : await toPdf(d, kind)
  const day = kstDay(new Date())
  return { body, mime: f.mime, filename: `UrbanEdge_매출_${RANGE_KO[range].replace(/ /g, '')}_${kind === 'summary' ? '요약' : '거래'}_${day}.${f.ext}` }
}
