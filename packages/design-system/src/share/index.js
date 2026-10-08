// share/index.js: 공유 UI 계약. 작업 B(A2)가 실제 구현으로 교체한다. 시스템 공유창(navigator.share)을 쓰지 않는다.
//
// ShareSheet({ open, onClose, url, title, text, image })   하단 시트(모바일)와 팝오버(데스크톱). image는 Blob 또는 URL
//   채널: Instagram(스토리 카드 저장 후 앱 열기), KakaoTalk(링크 복사), X, Facebook, WhatsApp, LINE, Telegram, Messages(sms:), Email, 링크 복사, 이미지 저장
// ShareButton({ url, title, text, image, variant, children })  눌렀을 때 ShareSheet를 연다
export function ShareSheet() { return null }
export function ShareButton() { return null }
