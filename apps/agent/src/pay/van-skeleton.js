// 실제 VAN 어댑터 뼈대. 공식 전문 규격은 VAN사와 계약해야 받는다(공개 문서 없음, 확인 못함).
// 아래 필드는 "승인 요청과 응답이 일반적으로 담는 항목"이며 이름과 길이는 VAN마다 다르다. 규격서를 받으면 이 파일의 map 함수만 바꾼다.
// 확인한 사실: NICE D-VAN 결제 모듈 상담 신청은 개발 장비(키오스크, 포스, 단말기), 프로토콜(TCP/IP, X25), 모듈 유형을 묻는다(https://direct.nicevan.co.kr/kiosk.html).
// KPN 키오스크 사양은 IC(EMV L1/L2), MS, NFC 리더와 Windows 10 IoT, USB와 시리얼 포트를 밝힌다(https://www.kpn.co.kr 제품 페이지).
// 해석: 앱은 단말기와 직접 통신하지 않고 VAN이 주는 로컬 모듈(Windows 서비스나 DLL)을 거친다. 이 에이전트가 그 모듈을 호출하는 자리다.
import net from 'node:net'

export function vanAdapter({ vendor = 'kicc', host = '127.0.0.1', port = 0, timeoutMs = 60000, mapRequest, mapResponse }) {
  return {
    name: vendor,
    async approve(req) {
      if (!port) return { ok: false, code: 'NOT_CONFIGURED', message: `${vendor} 로컬 모듈 주소(port)가 설정되지 않았다. VAN 계약 후 받은 모듈의 호스트와 포트를 넣는다.` }
      const payload = mapRequest ? mapRequest(req) : Buffer.from(JSON.stringify({ type: 'APPROVE', amount: req.amount, installment: req.installment ?? 0 }))
      return new Promise((resolve) => {
        const s = net.createConnection({ host, port, timeout: timeoutMs }, () => s.write(payload))
        const chunks = []
        s.on('data', (d) => chunks.push(d))
        s.on('end', () => resolve(mapResponse ? mapResponse(Buffer.concat(chunks)) : { ok: false, code: 'NO_MAPPER', message: '응답 변환 함수가 없다' }))
        s.on('error', (e) => resolve({ ok: false, code: e.code || 'NET', message: e.message }))
        s.on('timeout', () => { s.destroy(); resolve({ ok: false, code: 'TIMEOUT', message: '단말기 응답 없음. 망취소(승인 조회) 절차가 필요하다.' }) })
      })
    },
    async cancel() { return { ok: false, code: 'NOT_IMPLEMENTED' } },
  }
}
