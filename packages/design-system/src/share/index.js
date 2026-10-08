// share/index.js: 공유 UI. 작업 B가 구현했다. 시스템 공유창을 쓰지 않는다.
//
// ShareSheet({ open, onClose, url, title, text, image, lang, size, placement, anchorRef, portal, instagram, fileName })
//   하단 시트(모바일, 드래그로 닫기)와 팝오버(데스크톱). image는 Blob, canvas 또는 URL.
//   채널: Instagram(카드 저장 후 앱 열기 안내), KakaoTalk(링크 복사 후 앱 열기 안내), X, Facebook, WhatsApp, LINE, Telegram, Messages(sms:), Email, 링크 복사, 이미지 저장
// ShareButton({ url, title, text, image, variant, size, lang, children, className })  눌렀을 때 ShareSheet를 연다
export { ShareSheet } from './ShareSheet.jsx'
export { ShareButton } from './ShareButton.jsx'
export { buildTargets, copyText, saveImageFile } from './channels.js'
