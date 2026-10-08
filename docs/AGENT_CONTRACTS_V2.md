# AGENT_CONTRACTS_V2.md

v2 병렬 작업 8개. v1(`AGENT_CONTRACTS.md`)의 공통 규칙 1에서 8번은 그대로 적용되고, 이 문서와 `UI.md` 11장 이후, `docs/VOICE.md`가 우선한다. 자신의 소유 파일만 만들고 고친다. 다른 소유 파일이 필요하면 최종 보고에 요청으로 적는다.

## 사용자 피드백 요약(10월 9일 새벽, 원문 의도)

현재 결과물은 품질이 낮다. 템플릿 사이트 같고 모바일에서 찌그러지고 맞지 않는 곳이 많다. 노선도의 원과 선이 조잡하다. 오픈소스와 실제 레퍼런스를 찾아 쓴다. 한국 지하철의 느낌(다이내믹 아일랜드 라이브 액티비티, 승강장 일러스트의 노란 의자와 타일, 옥틸리니어 정확한 노선도)을 디자인으로 가져온다. 기차나 버스처럼 이동 수단 이미지가 하나도 없는 것이 문제다. Three.js를 쓴다. 영어가 메인이고 번역이 아니라 영어로 새로 쓴다. 문구가 AI 투이고 나열식이라 안 된다. 온보딩이 CX의 핵심이며 외국인 사용자는 아무것도 모른다. 사진을 어떻게 찍는지가 사이트에 다 나와야 한다. 인터랙션이 많아야 한다. 공유하고 싶은 힙한 카드와 썸네일(카카오톡, 인스타그램), 공유 시트는 시스템 공유창이 아니라 우리 디자인시스템으로 만든다. 숫자와 글자만 강조하는 디자인, 박스만 쓰는 디자인, 손톱형 포인트 보더 금지. 굵기를 섞고 자간과 행간을 신경 쓴다. 복잡하지 않게, 오고 싶게 만든다. 모바일 스크롤이 길면 안 된다. 어떤 해상도에서도 대응한다. 한국어는 줄바꿈 CSS(keep-all, balance, pretty)를 지킨다. 구글 지도를 넣고 miri 방식의 3D 지도도 쓴다. 로고와 파비콘은 UE 로고를 쓴다(범용 아이콘 금지). 포인트색(노랑)으로 쓴 경고 테이프 띠 섹션으로 사이트를 정형에서 벗어나게 한다. 인화 프레임은 경쟁사처럼 다양하게 만들고, 날짜를 작게 인쇄한다. 팀 인화 사진(`apps/*/public/img/team/shot-*.jpg`)을 실제 프레임에 넣는다. 키오스크 프로그램은 새 창에서 화면만 전체 화면으로 열 수 있어야 하고, 온보딩 코치마크, 짧은 로딩, 상세 UX를 갖춘다. 영상은 쓰지 않는다.

## 오픈소스와 참고 자료

내려받은 사용자의 GitHub 스타 저장소(읽기 전용 참고): `/Users/juhyunho/.aside/u/0/sessions/2026-10-04_j64ZIb72QbwbaCRv/tmp/oss/` 아래 `scroll-world`, `img2threejs`, `Skills`(MengTo), `threeui`, `kage`, `sketchbook`, `complete-shelf`, `hairline`, `shaders`, `anime`, `hallmark`, `impeccable`, `gesso-skills`, `emil-skills`, `fluent-korean`, `im-not-ai`, `korean-writing-reviewer`, `world-class-web-design-os`, 그리고 `kits/`(make-interfaces-feel-better, ux-writing, material-3-skill, liquidGL).
사용자 프로젝트 miri(MapLibre + three.js 3D 지도): `/Users/juhyunho/Desktop/00. 26-2학기/01. 교과목/01. 서비스 디자인/프로토타입/miri`(`client/src/three`, `tools/bake-basemap`, README). 라이브: https://miri-indol.vercel.app/console/map.
설치된 라이브러리: three, @react-three/fiber(8), @react-three/drei(9), maplibre-gl, animejs(4), lenis, d3-shape, d3-interpolate, qrcode, lucide-react. 새 패키지가 필요하면 자기 워크스페이스에 `npm install -w <워크스페이스> <패키지>`로 추가하고(동시에 여러 설치가 겹치면 잠시 뒤 재시도), 필요한 이유를 보고한다. 라이선스가 허용하는 오픈소스만 쓰고 출처를 `docs/CREDITS.md`에 한 줄로 적는다.
이미지 생성: Image Generation 스킬(`/Users/juhyunho/.aside/u/0/skills/builtin/imagegen/SKILL.md`)로 일러스트를 만들 수 있다.

## 확정 사실

로고: `@urbanedge/brand`의 `UEMark`(UE 블록 심볼, 파비콘과 인화 하단), `UrbanEdgeWordmark`(공식 워드마크 벡터). 색은 `currentColor`. 포인트색 `#F5C518`은 토큰으로만 쓴다. 팀 인화 샘플 원본: `docs/reference/print/sample-strip-karaoke.jpg`(1200x1800, 4컷 2열 스트립 두 줄과 큰 사진 한 줄, 워드마크와 UE 하단 배치). 현장 사진: `docs/reference/device/`. 공개 사진(인스타그램과 네이버 플레이스): 작업 중 `apps/web/public/img/ig/`와 `apps/web/public/img/place/`에 사용자 쪽에서 추가한다(`index.json`에 파일, 출처, 캡션). 이미 있는 `apps/web/public/img/lg/`와 `o_*.jpg`도 쓴다.
Google Maps Embed API 키는 환경변수 `VITE_GOOGLE_MAPS_KEY`다. 없으면 키 없는 임베드로 대체한다.

## 작업 M: 지하철 키트(새 에이전트)

소유: `packages/design-system/src/metro/**`, `packages/design-system/src/components/Line.jsx`, `apps/web/metro-lab.html`과 `apps/web/src/metro-lab.jsx`(작업 끝에 삭제).
`packages/design-system/src/metro/index.js` 주석의 계약을 지키며 실제 구현한다: `LineBadge`(서울 지하철식 원형, 크기 xs부터 xl), `StationSign`(승강장 역명판), `TrainTrack`(남은 정거장과 이동하는 열차), `LiveIsland`(다이내믹 아일랜드형 라이브 액티비티: 검정 알약, 접힘과 펼침 전환, 노선 배지, "이번 역/다음 역", 남은 정거장, 도착 예정, 선을 따라 움직이는 열차 아이콘. 참고 이미지는 서울 지하철 앱 라이브 액티비티), `TransitMap`(옥틸리니어 노선도. 수평, 수직, 45도 꺾임, 둥근 모서리, 선 굵기와 정거장 틱의 정교한 타이포, 환승역 표시, 노선 색 4개와 방 5곳, 가로형과 세로형 자동 전환, 정거장 탭 시 선택과 열차 이동, 키보드 접근). 노선도는 직접 그리되 d3-shape와 오픈소스 노선도 레이아웃 알고리즘(예: 옥틸리니어 라우팅 논문과 구현, Metro Map Maker, tube map 계열)을 조사해 근거를 `docs/CREDITS.md`에 남긴다. 기본 네트워크 데이터 `metro/network.js`를 제공한다: 입구(Entrance)에서 안쪽 방들로 이어지는 실제 동선 구조를 노선도로 표현하고, 방 5곳(SUBWAY, KARAOKE SHOT, PUBLIC PHONE, RETRO, TOILET)이 5개 노선 또는 하나의 환승 구조를 이룬다. 확인되지 않은 실제 위치는 만들지 않는다. 이용 단계(Board, Choose, Pose, Print)도 같은 컴포넌트가 노선으로 그린다. 장면 하나당 컴포넌트를 `apps/web/metro-lab.html`에서 확인한다.

## 작업 B: 브랜드와 공유(새 에이전트)

소유: `packages/brand/**`, `packages/design-system/src/share/**`, `apps/web/public/og/**`, `apps/web/public/icons/**`, `docs/CREDITS.md`의 자기 줄.
(1) 로고 확장: `UEMark`와 `UrbanEdgeWordmark`는 이미 있다. 파비콘 세트(SVG, 32, 180, 512 PNG, maskable)를 UE 심볼로 만들어 `apps/web/public/icons/`와 `apps/kiosk/public/icons/`에 둔다.
(2) 인화 프레임: 경쟁사 프레임(`docs/reference/competitor/`, 현장 사진 IMG_1727)처럼 다양하게 만든다. 최소 6종: 4컷 세로 스트립 2종, 8컷 2종, 2x2 그리드 1종, 큰 사진 1종. 블랙과 옐로우, UE 심볼, 워드마크, 노선 리본, 경고 테이프, 체커 장식을 쓰되 프레임마다 개성이 달라야 한다. 모든 프레임에 촬영 날짜를 작게 인쇄한다(예: 2026.10.09 형식, 방 이름과 노선 코드 포함). `composeStrip`은 canvas로 합성하고 사진 슬롯 수, 비율, 테두리 없는 컷 처리를 지킨다. 4x6인치 인화지 비율(1200x1800)을 기준으로 한다. `StripPreview`, `makeShareCard`(스토리 1080x1920, 피드 1080x1350)를 구현한다. 팀 샘플 사진 5장(`apps/web/public/img/team/shot-1..5.jpg`)으로 모든 프레임의 실물 목업을 만들어 `apps/web/public/img/frames/`와 `apps/kiosk/public/img/frames/`에 저장한다.
(3) 공유 UI: `ShareSheet`와 `ShareButton`을 구현한다. 시스템 공유창을 쓰지 않는다. 모바일은 하단 시트(드래그로 닫기), 데스크톱은 팝오버. 채널은 Instagram, KakaoTalk, X, Facebook, WhatsApp, LINE, Telegram, Messages, Email, 링크 복사, 이미지 저장. Instagram은 카드 이미지를 저장하고 앱 또는 프로필을 여는 흐름을 안내한다. 공유 이미지가 있으면 시트에 카드 미리보기가 보인다. 포커스 가두기, Esc, 키보드 조작, 동작 줄이기를 지킨다.
(4) OG 이미지: 경로별 1200x630 카드(홈, rooms, guide, visit, gallery)를 `apps/web/public/og/`에 PNG로 만든다. 카카오톡과 인스타그램 링크 미리보기에서 힙하게 보이도록 인화 스트립, UE 심볼, 노랑 경고 테이프 띠를 쓴다. 브라우저에서 HTML을 렌더해 스크린샷으로 저장한다. 경로별 메타 태그를 만드는 프리렌더 스크립트 `apps/web/scripts/prerender-meta.mjs`와 그 호출(`apps/web/package.json`의 build)도 소유한다. 라우트별 `dist/<route>/index.html`에 title, description, og:image(절대 URL은 `VITE_SITE_URL`), twitter:card를 넣는다.

## 작업 T: Three.js 장면(새 에이전트)

소유: `packages/scenes/**`, `apps/web/public/img/illus/**`.
`packages/scenes/src/index.js` 계약을 실제로 구현한다. (1) `PlatformDiorama`: 지하철 승강장 장면을 Three.js로 만든다. 타일 벽과 기둥, 노란 점자 블록, 체커 바닥, 이 사진관의 실제 노란 플라스틱 의자와 푸른 타일(`apps/web/public/img/lg/o_*.jpg`, `cr_*.jpg`를 보고 확인), 행선지 전광판, 도착하는 열차(실제 한국 지하철 열차 느낌, 노란 줄무늬). 참고 이미지는 한국 지하철 일러스트 앱(승강장 일러스트, 열차, 의자). 프로시저럴 지오메트리와 토온 또는 플랫 셰이딩으로 일러스트 느낌을 낸다. `progress`(스크롤)로 열차가 도착하고 문이 열린다. 포인터와 기기 기울기로 카메라가 움직인다. 방 문 5곳이 노선 색으로 보이고 클릭하면 `onSelectRoom`. (2) `PhotoStrip3D`: 팀 인화 사진으로 만든 스트립이 포인터에 따라 기울고 휘는 3D 오브젝트. (3) 성능: dpr 상한, 화면 밖 일시정지(IntersectionObserver), `prefers-reduced-motion`에서 정지 프레임, WebGL 실패 시 포스터 이미지 대체(Image Generation 스킬이나 장면 스냅샷으로 `illus/platform-poster.jpg` 제작). 모바일에서 30fps 이상을 목표로 한다. 참고: `scroll-world`, `img2threejs`, MengTo 저장소, `hairline`, `shaders`. `/apps/web/scenes-lab.html`과 `apps/web/src/scenes-lab.jsx`에서 단독 확인한다(끝에 삭제).

## 작업 G: 지도(새 에이전트)

소유: `packages/map/**`, `apps/web/map-lab.html`과 `apps/web/src/map-lab.jsx`(끝에 삭제), `apps/web/public/map/**`.
`packages/map/src/index.js` 계약을 구현한다. (1) 가게 좌표를 지오코딩해 확정한다(경북 경주시 포석로1079번길 6, Nominatim과 OSM으로 확인하고 지도에서 가게 위치를 교차 확인). (2) `HwangnidanMap`: miri 방식으로 만든다. MapLibre GL 위에 three.js 커스텀 레이어를 얹어 황리단길 일대 건물(OSM 건물 데이터를 사전 가공해 `public/map/*.json`으로 둔다. miri의 `tools/bake-basemap`과 `client/src/three`를 읽고 참고)을 압출하고, 가게를 노랑 신호탑처럼 표시하며, 황리단길 진입점에서 가게까지 도보 경로를 노선처럼 그린다(선은 노란 노선, 정거장 점). 2D와 3D 전환, 밝게와 어둡게, 핀치와 회전, 가게 재중심 버튼. 바탕 타일은 키가 필요 없는 소스(OpenFreeMap, OSM 래스터)를 쓰고 출처 표기를 넣는다. 모바일에서 가볍게 동작해야 하고 WebGL 실패 시 2D로 대체한다. (3) `GoogleMapEmbed`: Embed API(`VITE_GOOGLE_MAPS_KEY`)와 키 없는 임베드 대체. 어두운 사이트에 어울리게 감싸되 구글 지도 약관을 지킨다. (4) 길 찾기 링크 헬퍼(구글, 네이버, 카카오 지도) `directionsLinks()`를 내보낸다.

## 작업 W1: 웹 홈과 레이아웃(기존 에이전트 재개)

소유: v1과 같다(`App.jsx`, `main.jsx`, `layout/**`, `pages/Home.jsx`, `components/home/**`, `data/**`, `i18n/**`, `index.html`, `public/` 메타). 홈 전면 재작성이다.
컨셉 Metrography로 홈을 다시 설계한다. 기존 홈의 균일 카드, 큰 숫자 강조, 손톱형 보더를 모두 없앤다. 구성 예: 1) 히어로: 횡단보도 사진 위에 `t-display` 영문 헤드라인과 `LiveIsland`가 떠 있고, 스크롤하면 `PlatformDiorama`(작업 T)로 이어져 열차가 도착한다. 2) 경고 테이프 띠: 노랑 테이프에 검정 글자가 흐르는 구간 두세 번(안내 문구, "Do not skip the camera", "Mind the lens" 같은 안내 방송형 문구, 일시정지 제공). 3) 노선도(작업 M `TransitMap`)로 방 5곳과 이용 4단계를 탐색한다. 4) 사진을 어떻게 찍는지: 4단계 여정을 가로 스냅 또는 스크롤 고정 연출로 보여주고 키오스크 시뮬레이터를 iframe으로 체험(`SITE.kioskUrl` + `/screen?embed=1`). 5) 실제 사진(인스타그램과 네이버 공개 사진)과 팀 인화물 갤러리를 비대칭 레이아웃으로. 6) 지도(작업 G)와 길 찾기. 7) 공유(`ShareButton`)와 하단 고정 행동 바. 영어가 기본이고 한국어는 별도로 쓴다(`VOICE.md`). 모바일 6.5화면 이내. Lenis 부드러운 스크롤(동작 줄이기 존중), anime.js 또는 CSS로 인터랙션. 헤더와 푸터에 `UEMark`를 쓰고 파비콘은 `public/icons`(작업 B)를 연결한다. `index.html`에는 기본 OG 메타를 넣는다. 작업 M, B, T, G의 컴포넌트는 계약 시그니처로 먼저 연결하고, 실제 구현이 들어오면 화면을 확인해 다듬는다(약 20분 뒤부터 순차 도착한다. 도착 전에는 자체 임시 표시로 레이아웃을 잡는다).

## 작업 W2: 웹 하위 페이지(기존 에이전트 재개)

소유: v1과 같다(`pages/Rooms.jsx`, `RoomDetail.jsx`, `Guide.jsx`, `Visit.jsx`, `Gallery.jsx`, `NotFound.jsx`, `components/pages/**`). 전면 재작성이다.
Rooms는 `TransitMap`이 중심이다. Guide는 "사진은 이렇게 찍는다"의 핵심 페이지로, 입구 찾기에서 인화까지 5정거장 여정(Enter, Choose cuts, Frame, Pose, Print)을 스크롤 연동 `TrainTrack`과 함께 보여주고, 카메라가 화면 아래에 있다는 안내 도식, 4컷과 8컷의 차이를 실제 프레임 목업(작업 B의 `frames` 이미지)으로 보여주며, 키오스크 시뮬레이터 iframe 체험 구역을 둔다. Visit은 `HwangnidanMap`과 `GoogleMapEmbed`, 길 찾기 링크, 입구에서 기기까지의 동선을 노선도형으로 그린다. Gallery는 실제 공개 사진과 팀 인화물을 비대칭 그리드로, 확대 보기(공유 버튼 포함)를 가진다. RoomDetail은 방마다 노선 색을 쓰고 포즈 아이디어를 `hairline` 스타일 라인 도식으로 보여준다. 영어 기본, 한국어 별도 작성. 모바일 우선.

## 작업 K1: 키오스크 기기와 시뮬레이터(기존 에이전트 재개)

소유: v1과 같다(`device/**`, `pages/**`, `App.jsx`, `main.jsx`, `index.html`). 
(1) 기기 비율 재측정. 현재 모니터가 본체에 비해 작다. 현장 사진에서 모니터가 본체 상단 대부분을 차지하는 비율로 다시 맞춘다(`docs/reference/device/IMG_1644.jpg`, `IMG_1651.jpg`). 기기 하단부가 사진에서 잘려 있으므로 전체 높이는 모니터 중심의 상반신 구도로 재해석하고, 표시 높이를 줄여 화면이 한눈에 들어오게 한다. (2) 전체 화면 새 창: 시뮬레이터에서 "Open full screen in new window" 버튼이 `/screen`을 `window.open`으로 새 창에 연다. `/screen`은 화면만 1920x1080 비율로 꽉 채우고, 첫 진입에 코치마크 투어(`Tour`)가 뜬다. 코치마크는 `device/Tour.jsx`로 만들며(스포트라이트, 말풍선, 다음 이전 건너뛰기, 키보드 조작, 모바일 대응) 시뮬레이터(`/`)에서도 "Take the tour"로 시작한다. 투어 단계는 화면 터치, 카메라 위치(아래), 카드 단말기는 결제 범위 밖이라는 설명, 인화 출구, 시뮬레이터 패널 사용법이다. 투어 상태는 저장소 없이 메모리와 URL(`?tour=0`)로만 관리한다. (3) 시뮬레이터 패널을 모바일에서도 쓰기 좋게 다듬는다(단계 점프를 가로 스크롤 칩 또는 시트로, 화면이 먼저 보이게). 기기 위에 LiveIsland(작업 M)로 현재 단계를 보여주는 보조 표시를 넣을 수 있다. (4) 브랜드: 파비콘과 앱 메타(작업 B 아이콘), OG 메타. (5) `?embed=1`일 때 웹 iframe용으로 크롬 없는 화면 모드를 제공한다(스텝 점프 숨김, 코치마크 간략). 
## 작업 K2: 키오스크 화면 흐름(기존 에이전트 재개)

소유: v1과 같다(`flow/**`, `components/**`). 전면 재설계다.
(1) 시각: 현재 화면은 박스가 많고 평평하다. 블랙 바탕과 노랑 포인트로 Metrography를 구현한다. 상단에 `LiveIsland`(작업 M)로 이용 단계를 항상 보여주고(현재 역, 다음 역, 남은 정거장, 열차 이동), 하단 바와 단계 레일은 이것으로 대체한다. 큰 타이포(`t-display`, `t-title`)와 굵기 혼합, 카드 테두리 제거, 손톱형 보더 제거, 숫자만 강조하는 연출 제거. (2) 온보딩: 코치마크 투어를 화면 안에도 넣는다(키오스크 UI를 처음 만지는 외국인을 위해 단계마다 가볍게). 카메라가 아래에 있다는 안내를 화면 하단 가장자리에서 아래로 향하는 시각 신호(`hintZone`과 함께)로 강하게 보여준다. 4컷과 8컷은 실제 프레임 미리보기(작업 B의 `FRAMES`와 `composeStrip`)로 선택한다. 한 단계에 정보를 너무 담지 않는다. (3) 프레임: 작업 B가 만든 6종 이상을 쓰고, 합성 결과에 날짜가 작게 찍힌다. 샘플 모드에서 `apps/kiosk/public/img/team/shot-*.jpg`를 카메라 대체 이미지로 쓴다. (4) 로딩: 어떤 로딩도 2초 이내이거나, 2초를 넘으면 의미 있는 진행 표시(현상되는 인화지 애니메이션, 정거장 이동)와 할 거리를 보여준다. (5) 완료: 공유(`ShareSheet`, 스토리 카드 저장)와 실제 동작하는 QR(`qrcode` 라이브러리, 가게 인스타그램 주소). (6) 한국어 줄바꿈과 영문 어색함을 점검한다. 영문이 기본 언어이며 새로 쓴다(`VOICE.md`). (7) 프레임 선택과 컷 선택의 터치 인터랙션(드래그로 순서 바꾸기 같은 직접 조작)을 넣는다. 

## 작업 순서와 통합

M, B, T, G는 약 20분에서 40분 안에 첫 실사용 가능한 버전을 `packages/*`에 올린다. W1, W2, K1, K2는 계약 시그니처로 먼저 연결하고 도착하는 대로 실제 컴포넌트로 교체한다. 각자 마지막에 `npm run lint:rules`와 자기 앱 `vite build` 통과, 320에서 3840 폭에서 가로 스크롤 없음, 콘솔 에러 0건을 확인하고 보고한다. 보고에는 스크린샷 경로를 포함한다.
