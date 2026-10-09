import { randomInt, randomUUID } from 'node:crypto'

// 모의 VAN 어댑터. 실제 카드번호는 다루지 않는다. 시험용 BIN에 Luhn이 맞는 번호를 만든 뒤 즉시 마스킹해 앞 6자리와 뒤 4자리만 남긴다.
// 원번호(PAN)는 이 함수 밖으로 나가지 않고 저장하지 않는다(PCI DSS: 승인 후 PAN 저장 금지).
const ISSUERS = [
  { bin: '457973', name: '신한카드' }, { bin: '537122', name: '삼성카드' }, { bin: '434090', name: '국민카드' },
  { bin: '940012', name: '현대카드' }, { bin: '916002', name: '롯데카드' }, { bin: '518120', name: '우리카드' },
]
function luhnComplete(prefix, len = 16) {
  let s = prefix; while (s.length < len - 1) s += randomInt(0, 10)
  const d = s.split('').reverse().map(Number)
  const sum = d.reduce((a, n, i) => a + (i % 2 === 0 ? ((n * 2 > 9) ? n * 2 - 9 : n * 2) : n), 0)
  return s + ((10 - (sum % 10)) % 10)
}
export const mask = (pan) => `${pan.slice(0, 4)}-${pan.slice(4, 6)}**-****-${pan.slice(-4)}`

export const mockVan = {
  name: 'mock',
  tid: 'UE-MOCK-0001',
  merchantNo: '0000000000',
  async approve({ amount, installment = 0, method = 'card', failRate = 0 }) {
    if (!Number.isInteger(amount) || amount <= 0) return { ok: false, code: 'E101', message: '금액 오류' }
    await new Promise((r) => setTimeout(r, 400))
    if (Math.random() < failRate) return { ok: false, code: 'E402', message: '카드사 승인 거절' }
    const issuer = ISSUERS[randomInt(0, ISSUERS.length)]
    const pan = luhnComplete(issuer.bin)
    return {
      ok: true, method, amount, installment,
      installmentLabel: installment ? `${installment}개월` : '일시불',
      issuer: issuer.name, cardMasked: mask(pan), cardLast4: pan.slice(-4),
      approvalNo: String(randomInt(10000000, 99999999)), approvedAt: new Date().toISOString(),
      tid: this.tid, merchantNo: this.merchantNo, txRef: randomUUID(),
      raw: undefined,
    }
  },
  async cancel({ approvalNo, amount }) {
    await new Promise((r) => setTimeout(r, 300))
    return { ok: true, canceledApprovalNo: String(randomInt(10000000, 99999999)), originalApprovalNo: approvalNo, amount, canceledAt: new Date().toISOString() }
  },
}
