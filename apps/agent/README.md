# UrbanEdge 로컬 에이전트
키오스크 PC에서 도는 작은 서버(127.0.0.1:8790). 카메라, 프린터, 영수증, 카드(VAN) 어댑터를 HTTP와 WebSocket으로 열어 준다.
- 실행: `npm start -w @urbanedge/agent` (환경변수: `AGENT_PORT`, `AGENT_ORIGINS`, `AGENT_TOKEN`, `VAN=mock|kicc|ksnet`, `KICC_PORT`, `KSNET_PORT`)
- 시험: `npm test -w @urbanedge/agent` (21개, 증거는 `test/evidence.json`)
- 키오스크에서 쓰기: `client/agentClient.js`를 가져와 `await agent.available()`가 참이면 `agent.pay`, `agent.capture`, `agent.print`를 쓰고, 아니면 기존 브라우저 모의 흐름으로 돌아간다.
- 자세한 내용과 한계: `docs/INTEGRATION_REDTEAM.md`
