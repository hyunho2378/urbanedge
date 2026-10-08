# SESSION_HEADER.md

새 세션을 시작하면 이 순서로 읽는다.

1. `UI.md`와 `DESIGN.md`
2. `docs/AGENT_CONTRACTS.md`(파일 소유와 인터페이스)
3. `PROGRESS.md`(마지막 기록)

규칙: JavaScript JSX만, 브라우저 저장소 금지, 색과 간격과 폰트는 토큰으로만, 이모지 금지, hover에 scale 금지, 애니메이션은 transform과 opacity만, 문구는 한국어 명사형 정보 전달과 두괄식.
로컬 실행: `cd apps/web && npx vite --port 5184`, `cd apps/kiosk && npx vite --port 5185`. 반드시 앱 폴더 안에서 실행한다(루트에서 실행하면 Tailwind 설정을 찾지 못한다).
