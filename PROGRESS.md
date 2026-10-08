# PROGRESS.md

## 2026-10-08 23:59

- 레퍼런스 분석 완료(전시회 사이트 색과 타이포 측정, dah-hallym 구조, 현장 사진 10장, 경쟁사 영상 2개)
- 모노레포와 디자인시스템 기반 완료(`tokens.js`, Tailwind 프리셋, 컴포넌트 10종, `UI.md`)
- 로컬 샌드박스는 네이티브 바이너리를 실행하지 못해 Vite 8의 wasm 바인딩(`@rolldown/binding-wasm32-wasi`)과 `cssMinify: false`로 우회한다. Vercel 빌드는 `VERCEL` 환경변수로 기본 압축기를 쓴다.
- 다음: 키오스크 기기 외형(K1), 키오스크 화면 흐름(K2), 웹 홈과 레이아웃(W1), 웹 하위 페이지(W2)를 병렬 진행
