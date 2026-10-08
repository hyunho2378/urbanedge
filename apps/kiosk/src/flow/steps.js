// steps.js: 키오스크 단계 목록. K2(flow)가 소유한다. K1(device)은 읽기만 한다.
// 결제 단계는 구현 범위에서 제외한다. frame 다음에 결제가 끝났다고 가정하고 guide로 이어진다.
export const STEPS = [
  { id: 'attract', label: { ko: '대기 화면', en: 'Attract' } },
  { id: 'language', label: { ko: '언어 선택', en: 'Language' } },
  { id: 'intro', label: { ko: '이용 안내', en: 'Onboarding' } },
  { id: 'cuts', label: { ko: '컷 수 선택', en: 'Cut count' } },
  { id: 'frame', label: { ko: '프레임 선택', en: 'Frame' } },
  { id: 'guide', label: { ko: '촬영 가이드', en: 'Shooting guide' } },
  { id: 'retouch', label: { ko: '보정 설정', en: 'Retouch' } },
  { id: 'ready', label: { ko: '카메라 확인', en: 'Camera check' } },
  { id: 'shoot', label: { ko: '촬영', en: 'Shoot' } },
  { id: 'select', label: { ko: '컷 선택', en: 'Select' } },
  { id: 'print', label: { ko: '인화 대기', en: 'Printing' } },
  { id: 'finish', label: { ko: '완료', en: 'Finish' } },
]
export const STEP_IDS = STEPS.map((s) => s.id)
