# UrbanEdge

경북 경주시 황리단길 무인 셀프 사진관 어반엣지 메트로그래피의 브랜드 웹과 키오스크 시뮬레이터 저장소다.

| 앱 | 폴더 | 로컬 실행 |
| --- | --- | --- |
| 브랜드 웹 | `apps/web` | `cd apps/web && npx vite --port 5184` |
| 키오스크 시뮬레이터 | `apps/kiosk` | `cd apps/kiosk && npx vite --port 5185` |
| 디자인시스템 | `packages/design-system` | 두 앱이 `@urbanedge/ds`로 가져온다 |

문서: `UI.md`(디자인시스템), `DESIGN.md`, `IA.md`, `ROUTES.md`, `COMPONENTS.md`, `PATTERNS.md`, `PROGRESS.md`, `docs/AGENT_CONTRACTS.md`.

## 설치와 빌드

```bash
npm install
npm run build:web
npm run build:kiosk
npm run lint:rules
```

## Vercel 배포

프로젝트를 둘 만든다. 같은 GitHub 저장소를 연결하고 Root Directory만 다르게 지정한다. 두 프로젝트 모두 "Include source files outside of the Root Directory"를 켠다.

| 프로젝트 | Root Directory | Framework | 환경변수 |
| --- | --- | --- | --- |
| urbanedge-web | `apps/web` | Vite | `VITE_KIOSK_URL`(키오스크 배포 주소) |
| urbanedge-kiosk | `apps/kiosk` | Vite | 없음 |
