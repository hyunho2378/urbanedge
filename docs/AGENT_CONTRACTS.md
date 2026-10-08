# AGENT_CONTRACTS.md

병렬 작업 4개의 파일 소유와 인터페이스 계약. 자신의 소유 파일만 만들고 고친다. 소유가 아닌 파일이 필요하면 만들지 말고 최종 보고에 요청으로 적는다.

| 작업 | 소유 파일 | 포트 |
| --- | --- | --- |
| K1 키오스크 기기 | `apps/kiosk/src/device/**`, `apps/kiosk/src/pages/**`, `apps/kiosk/src/App.jsx`, `apps/kiosk/src/main.jsx`, `apps/kiosk/index.html`, `apps/kiosk/public/` 중 기기 자산 | 5185 |
| K2 키오스크 화면 흐름 | `apps/kiosk/src/flow/**`, `apps/kiosk/src/components/**` | 5195 |
| W1 웹 홈과 레이아웃 | `apps/web/src/App.jsx`, `main.jsx`, `layout/**`, `pages/Home.jsx`, `components/home/**`, `data/**`, `i18n/**`, `apps/web/index.html`, `apps/web/public/` 메타 파일 | 5184 |
| W2 웹 하위 페이지 | `apps/web/src/pages/` 중 Rooms, RoomDetail, Guide, Visit, Gallery, NotFound, `apps/web/src/components/pages/**` | 5194 |

공용 `packages/design-system`은 읽기 전용이다. 필요한 컴포넌트는 앱 안에 만든다.

## 공통 규칙

1. 시작 전에 `UI.md`, `DESIGN.md`, `docs/AGENT_CONTRACTS.md`를 읽는다. 색과 간격과 폰트는 Tailwind 토큰 클래스로만 쓴다. hex, rgb, 임의값(`[12px]`)을 쓰지 않는다. 기기 외형처럼 실측 비율이 필요한 곳만 해당 줄에 `check-rules:ignore` 주석을 단다.
2. JavaScript JSX만 쓴다. `localStorage`와 `sessionStorage`를 쓰지 않는다. 이모지 대신 lucide-react 아이콘이나 inline SVG를 쓴다. 네이티브 select와 date input을 쓰지 않는다.
3. hover에는 `scale`을 쓰지 않는다. 누름은 `.ue-press`의 `scale(0.97)`만 쓴다. 애니메이션은 `transform`과 `opacity`만 쓴다. `prefers-reduced-motion`에서 움직임이 멈춰야 한다.
4. 한국어 문구는 명사형 정보 전달, 두괄식이다. 가운데점, 줄표, 이모지, "A가 아니라 B" 대비 구문을 쓰지 않는다. 마침표로 끝난 짧은 문장을 연달아 나열하지 않는다. 수치와 사실은 `apps/web/src/data/site.js`와 이 문서에 있는 것만 쓰고 새로 만들지 않는다.
5. 개발 서버는 앱 폴더 안에서 `npx vite --port <포트> --strictPort`로 띄운다. 루트에서 띄우면 Tailwind가 동작하지 않는다. 이미 떠 있는 서버는 끄지 말고 다른 포트를 쓴다.
6. 완료 전에 브라우저로 실제 화면을 열어 확인한다. 웹은 390, 768, 1440, 3840 너비를 확인하고 키오스크는 1920x1080과 작은 창에서 확인한다. 콘솔 에러 0건이어야 한다.
7. 마지막에 `npm run lint:rules`(루트)에서 자신의 파일에 위반이 없는지 확인한다. `cd apps/<앱> && npx vite build`가 통과해야 한다.
8. 최종 보고에는 만든 파일 목록, 확인한 화면, 남은 문제, 다른 작업에 대한 요청을 적는다.

## 현장 사실(근거)

어반엣지 기기의 외형: 흰색 본체. 상단에 CCTV 안내문 두 장(기기이동금지, 녹화중). 가운데에 가로형 모니터. 모니터 양옆에 세로 LED 조명바(방에 따라 한 줄 또는 위아래 두 칸). 이 기기는 카메라가 모니터 아래에 있다. 카메라 아래 오른쪽에 카드 단말기(초록 LED). 그 아래 하단 캐비닛 문, 안내 스티커, 인화 출구 슬롯과 흰색 트레이. 기기 위 벽에 손님 인화지 콜라주가 붙는다. 참고 사진은 `docs/reference/device/`에 있다(IMG_1644, IMG_1649, IMG_1651이 카메라가 아래에 있는 기기, IMG_1638은 카메라가 모니터 위에 있는 다른 기기).

현재 화면의 문제: 로딩만 보인다, 온보딩이 없다, 블랙과 옐로우 브랜드가 없다, 4컷인지 8컷인지 알려주지 않는다, 카메라가 아래에 있다는 안내가 없다, 촬영 가이드가 없다, 기다리는 동안 할 것이 없다.

경쟁사 화면 흐름(참고, `docs/reference/competitor/`): 대기 화면 터치 시작, 프레임 선택, 수량 선택, 결제, 촬영 안내(촬영 횟수와 1회 촬영 시간), 보정 설정, 라이브 촬영과 카운트다운, 컷 선택(사진을 터치하면 취소), 인화. 어반엣지는 이 흐름에 온보딩과 안내를 더해 앞서간다.

브랜드 사실: 슬로건 "Beyond the Lens, Into the Streets"(렌즈 너머, 거리 속으로), "EVERY SHOT IS A JOURNEY!". 방 5곳 SUBWAY(L1), KARAOKE SHOT(L2), PUBLIC PHONE(L3), RETRO(L4), TOILET(L5). 방마다 키오스크가 따로 있다. 주소 경북 경주시 포석로1079번길 6. 영업 10:00에서 24:00. 기본 7,000원에 인화 2장. 인스타그램 @__urbanedge. 이미지는 `apps/*/public/img`에 있다(웹 `lg/hero-crosswalk.jpg` 히어로, `lg/o_17`부터 `o_31` 방 사진, `biz_*` 포스터, `cr_*` 패턴 크롭).

## K1 키오스크 기기

목표: 사진 속 실제 기기를 외형 100% 재현하고 웹에서 기기처럼 조작한다.

- `device/DeviceFrame.jsx`: 흰색 본체, 모니터 베젤, LED 바, 렌즈(모니터 아래), 카드 단말기, 하단 캐비닛, 인화 슬롯과 트레이, CCTV 안내문 두 장을 CSS와 inline SVG로 그린다. 비율은 참고 사진에서 측정한다. 본체는 화면 높이에 맞춰 `transform: scale()` 없이 비율 박스(aspect-ratio)로 반응한다. 모니터 영역에는 children(1920x1080 `Stage`)이 들어간다.
- props: `hint`('camera','card','slot','screen',null이면 해당 부품에 노랑 링 펄스와 라벨), `flashing`(true면 LED 바가 밝아짐), `printUrl`(있으면 슬롯에서 종이가 transform으로 밀려 나옴), `cameraActive`(렌즈 표시등), `children`.
- `device/Stage.jsx`: 1920x1080 박스를 부모 너비에 맞춰 `scale`하고, 내부 터치 입력은 그대로 전달한다.
- `pages/Simulator.jsx`(`/`): 가운데 기기, 오른쪽 또는 아래 주석 패널. 패널에는 단계 목록(점프), 언어 전환, 카메라 모드(샘플과 웹캠) 토글, 처음으로, 부품 주석 보기 토글, "결제는 구현 범위에서 제외" 안내가 있다. 320에서 3840까지 반응형이고 모바일에서는 기기가 위, 패널이 아래다.
- `pages/ScreenOnly.jsx`(`/screen`): 화면만 전체 화면으로 표시. 우클릭과 텍스트 선택 방지.
- `App.jsx`: 라우팅. `useKioskController()`(`flow/controller.js`)와 `KioskScreen`(`flow/KioskScreen.jsx`)을 가져온다. K2가 실제 구현을 채우므로 계약 필드(`controller.js` 주석)만 쓴다. K2 구현이 아직 없으면 스텁으로 동작한다.
- 키보드: 화살표로 단계 이동, Esc로 처음으로를 시뮬레이터 패널 단축키로 제공한다(기기 화면 안에는 영향 없음).

## K2 키오스크 화면 흐름

목표: 1920x1080 화면 안의 모든 UI와 UX. 결제 화면은 만들지 않는다. 블랙과 옐로우 디자인시스템을 쓰고 전시회 사이트 같은 대형 타이포를 쓴다.

- `flow/controller.js`의 `useKioskController`를 실제 구현으로 교체한다. 반환 필드는 주석의 계약을 지킨다(이름 변경 금지). 추가 필드는 자유다.
- `flow/KioskScreen.jsx`: 단계별 화면 렌더, 단계 전환 애니메이션(opacity와 transform), 하단 공통 바(뒤로, 노선형 단계 레일, 다음), 무입력 90초 뒤 안내 대화상자와 15초 뒤 대기 복귀.
- 화면 상단에 어반엣지 브랜드 바(작은 워드마크, 방 이름과 노선 코드, 현재 단계). 노선 레일은 지하철 노선도처럼 정거장 점이 이어지는 진행 표시다.
- 단계별 요구:
  1. `attract`: 풀블리드 어두운 화면, 어반엣지 워드마크, "Touch to start / 화면을 터치해 주세요"가 숨쉬듯 펄스. 천천히 넘어가는 샘플 결과물 스트립(이미지는 `public/img` 포스터와 패턴 사용). 화면 아래쪽에 "카메라는 이 화면 아래에 있어요" 힌트 아이콘.
  2. `language`: 한국어, English 큰 버튼 두 개. 터치 영역 120px 이상.
  3. `intro`(핵심 온보딩): 3장 카드가 가로로 넘어간다(자동 진행 없이 다음 버튼). (가) 이용 순서 4단계와 총 소요 안내(시간 수치는 만들지 말고 "촬영 컷 수에 따라 달라요" 식으로 쓴다), (나) 카메라 위치: 화면 하단 중앙에서 실제 렌즈 방향을 화살표로 가리키고 `hintZone='camera'`를 켠다. "화면이 아니라 화면 아래 렌즈를 보세요" 문구, (다) 서는 위치와 인화물이 나오는 곳(`hintZone='slot'`).
  4. `cuts`: 4컷과 8컷을 나란히 크게 비교. 각 카드에 컷 배열 미리보기, "4컷은 한 번에 4장 촬영, 8컷은 8장 촬영 후 4장 선택" 같은 설명은 실제 동작과 일치하게 쓴다. 촬영 횟수와 장당 촬영 시간을 숫자로 명시한다.
  5. `frame`: 선택한 컷 수에 맞는 프레임 3종 이상(Signature Cut, Layer Cut 이름 사용). 프레임 카드는 실제 합성 미리보기. 선택하면 큰 미리보기가 오른쪽에 나온다. 이 다음에 결제가 끝났다고 가정한다(화면은 만들지 않는다).
  6. `guide`: 촬영 가이드. 포즈 아이디어 카드 4장(inline SVG 실루엣, 방 이름과 어울리는 제안), "렌즈는 화면 아래", "정면보다 살짝 위로 턱", "촬영 사이 이동 가능" 같은 팁. 방 이름과 노선 코드 표시. `hintZone='camera'`.
  7. `retouch`: 보정 설정. 피부 보정 강도, 밝기, 필터(원본, 흑백, 필름, 플래시 옐로우 틴트)를 큰 토글과 세그먼트로. 실시간 미리보기는 카메라 영상 또는 샘플 이미지에 CSS filter와 canvas로 적용한다.
  8. `ready`: 카메라 확인. 프레임 안내선(얼굴 위치 가이드), 하단에 렌즈 위치를 가리키는 화살표와 `hintZone='camera'`, "준비되면 촬영 시작" 큰 버튼.
  9. `shoot`: 카운트다운(큰 숫자, 컷 n 중 m 표시, 컷마다 포즈 제안 한 줄), 셔터 순간 `flashing=true` 300ms와 화면 플래시. 촬영 컷 수는 `cuts`와 같다. 컷 사이 간격 안내.
  10. `select`: 8컷이면 8장 중 4장 선택(터치하면 선택, 다시 터치하면 취소, 선택 수 n/4), 4컷이면 확인과 다시 찍기 선택. 프레임에 즉시 합성 미리보기.
  11. `print`: 인화 대기. 체류 경험을 둔다: 노선 스탬프 고르기(방 5곳 스탬프를 인화물에 얹기), 한 줄 메시지 입력용 온스크린 키보드(한글과 영문), 다른 방 소개. 진행률 바는 transform으로 표시한다. 끝나면 `printUrl`에 합성 결과 data URL을 넣는다.
  12. `finish`: "인화물은 아래 출구에서 나와요" 안내와 `hintZone='slot'`, QR(inline SVG로 인스타그램 주소를 표현하는 QR 모양 자리표시. 실제 QR 생성 라이브러리를 쓰지 않고 `@__urbanedge` 태그 안내), 다른 방으로 가는 노선도(5개 방), 처음으로.
- 카메라: `cameraMode`가 `live`이면 `getUserMedia`로 웹캠, 실패하거나 `sample`이면 샘플 이미지(`public/img`의 포스터 크롭)로 대체한다. 얼굴을 서버로 보내지 않는다. 촬영 결과는 메모리에만 둔다.
- 언어는 한국어와 영어. 모든 문구를 `flow/copy.js`에 `{ko, en}`으로 둔다.
- 접근성: 모든 버튼에 텍스트 라벨, 대비 4.5:1, 포커스 링, 키보드 조작(Enter, 화살표), 동작 줄이기.

## W1 웹 홈과 레이아웃

목표: dah-hallym 수준의 완성도에 전시회 사이트의 색과 타이포. 전시회 사이트처럼 풀블리드 횡단보도 히어로와 포인트 라인이 있는 상단 내비게이션을 쓴다.

- `index.html`: 제목, 설명, OG 메타(절대 URL은 환경변수 `VITE_SITE_URL` 기반이 아니므로 상대 경로를 쓰지 말고 자리표시와 주석으로 표기), 파비콘, theme-color.
- `App.jsx`: `LangProvider`, 라우터, `Layout`, 모든 경로 등록(W2의 페이지는 `pages/` 파일명 그대로 import. 파일이 아직 없으면 `React.lazy`로 감싸고 Suspense 폴백을 둔다).
- `layout/Header.jsx`: 왼쪽 워드마크, 가운데 내비게이션(Barlow Condensed 대문자, 활성 항목 노랑, 하단 1px 노랑 라인), 오른쪽 KR/EN 알약 토글. 모바일은 풀스크린 메뉴(포커스 가두기, Esc 닫기, 스크롤 잠금). 스크롤하면 배경이 불투명해진다.
- `layout/Footer.jsx`: 주소, 영업시간, 인스타그램, 네이버와 구글 지도 링크, 슬로건, 노선 리본.
- 홈 구성: (1) 히어로: `lg/hero-crosswalk.jpg` 전면, 어두운 스크림, 대형 `Beyond the Lens, Into the Streets`, 한국어 부제, 버튼 2개(방문 안내, 키오스크 체험). 모바일은 `hero-crosswalk-m.jpg`. (2) 노선 마퀴(방 이름). (3) 01 소개: 두괄식 소개 문단과 핵심 사실 4칸(주소, 시간, 가격, 방 수). (4) 02 포토 룸 5곳: 노선도형 목록, 방 사진 카드. (5) 03 이용 방법 4단계. (6) 04 처음 오는 분께: 카메라 위치, 4컷과 8컷 안내(`/guide`로 이동). (7) 05 갤러리 띠. (8) 06 방문 정보와 지도 링크. (9) 키오스크 체험 CTA(`SITE.kioskUrl`).
- 수치와 사실은 `data/site.js`만 쓴다. 한국어와 영어 문구는 `{ko, en}`으로 컴포넌트 옆에 둔다.
- 메타 파일: `public/robots.txt`, `public/favicon.svg`.

## W2 웹 하위 페이지

목표: 홈과 같은 품질의 5개 페이지. 모두 페이지 상단에 `PageHero`(`components/pages/PageHero.jsx`, 번호 라벨, 대형 제목, 설명, 노선 리본)를 쓴다. 내비게이션과 푸터는 W1의 `Layout`이 감싸므로 만들지 않는다. `useLang`과 `usePick`(`i18n/index.jsx`)과 `ROOMS`, `SITE`(`data/site.js`)를 읽기만 한다.

- `Rooms.jsx`: 노선도형 인덱스(5개 방을 노선 색 선과 정거장 점으로 연결), 방 카드 그리드.
- `RoomDetail.jsx`: 방 사진(`lg/o_17`부터 `o_31`에서 사진을 직접 보고 방에 맞게 배정한다), 설명, 포즈 제안 3개, 이전과 다음 방 이동. 없는 id는 NotFound로.
- `Guide.jsx`: 이용 4단계(방 찾기, 컷 수와 프레임 선택, 촬영, 인화), 4컷과 8컷 비교표, 카메라는 화면 아래에 있다는 안내(inline SVG 도식), 포즈 팁, 자주 묻는 질문(아코디언, 키보드 조작).
- `Visit.jsx`: 주소, 영업시간, 지도 링크 2개, 입구에서 기기까지 단계별 동선(안쪽 공간까지 어떻게 가는지. 확인되지 않은 세부 위치는 만들지 말고 "입구에서 안쪽으로 들어가면 방 5곳이 이어진다" 수준으로 쓴다), 접근성 안내, 사진 3장.
- `Gallery.jsx`: 사진 그리드(masonry 또는 반응형 그리드)와 확대 보기(모달, 포커스 가두기, Esc, 좌우 이동).
- `NotFound.jsx`: 노선도 느낌의 404와 홈 링크.
