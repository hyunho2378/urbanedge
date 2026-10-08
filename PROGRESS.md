# PROGRESS.md

## 2026-10-08 23:59

- 레퍼런스 분석 완료(전시회 사이트 색과 타이포 측정, dah-hallym 구조, 현장 사진 10장, 경쟁사 영상 2개)
- 모노레포와 디자인시스템 기반 완료(`tokens.js`, Tailwind 프리셋, 컴포넌트 10종, `UI.md`)
- 로컬 샌드박스는 네이티브 바이너리를 실행하지 못해 Vite 8의 wasm 바인딩(`@rolldown/binding-wasm32-wasi`)과 `cssMinify: false`로 우회한다. Vercel 빌드는 `VERCEL` 환경변수로 기본 압축기를 쓴다.
- 다음: 키오스크 기기 외형(K1), 키오스크 화면 흐름(K2), 웹 홈과 레이아웃(W1), 웹 하위 페이지(W2)를 병렬 진행

## 키오스크 QR 결과 페이지

- 경로 `/result/:sessionId`(예: `/result/demo?lang=ko`). `apps/web/src/pages/Result.jsx`와 `apps/web/src/components/result/**`. 헤더와 푸터가 없는 모바일 우선 단독 화면이다. 사진 3장 캐러셀과 저장, 영상 재생과 저장, 한영 전환을 갖춘다.
- 키오스크 `finish` 화면의 QR은 `flow/config.js`의 `resultUrl(lang)`이 만든 `${VITE_SITE_URL}/result/demo?lang=ko|en`을 가리킨다.
- 자산: 사진은 기존 `apps/web/public/img/frames/{signature,layer,classic-black}.jpg`(각 1200x1800), 영상은 `apps/web/public/media/result/demo-video.mp4`(10,784,616 bytes, 약 10.3 MB, 960x640, 32.8초)를 쓴다.
- 한계: 업로드 서버와 저장소가 없다. 어떤 세션 id든 같은 샘플 사진과 영상을 보여 주며, 실제 촬영본과 연결되어 있지 않다. 화면에도 샘플 표시가 있다.
