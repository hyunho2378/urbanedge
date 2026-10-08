// steps.js: 키오스크 단계 목록. K2(flow)가 소유한다. K1(device)은 읽기만 한다.
// v5: 결제(pay)가 언어 선택 바로 뒤(안내 화면 없음), 컷 수 고르기 전에 온다(요금은 컷 수와 무관한 7,000원). 라벨은 지하철 역명 어휘를 쓴다(영문이 기본).
export const STEPS = [
  { id: 'attract', label: { ko: '승강장', en: 'Platform' } },
  { id: 'language', label: { ko: '언어', en: 'Language' } },
  { id: 'pay', label: { ko: '결제', en: 'Pay' } },
  { id: 'cuts', label: { ko: '컷 수', en: 'Cuts' } },
  { id: 'frame', label: { ko: '프레임', en: 'Frame' } },
  { id: 'guide', label: { ko: '포즈', en: 'Poses' } },
  { id: 'shoot', label: { ko: '촬영', en: 'Shoot' } },
  { id: 'select', label: { ko: '컷 순서', en: 'Arrange' } },
  { id: 'print', label: { ko: '인화', en: 'Print' } },
  { id: 'finish', label: { ko: '완료', en: 'Done' } },
]
export const STEP_IDS = STEPS.map((s) => s.id)
