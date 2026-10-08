# CREDITS


## Metro kit (task M, packages/design-system/src/metro)

- johnwalley/d3-tube-map (BSD-3-Clause, license read from the GitHub API): reference only for the look of parallel lines, station ticks and interchange markers on a tube map. No code copied.
- ad-freiburg/loom and its octilinear tool (GPL-3.0, license read from the GitHub API): reference only for the idea of drawing a map from octilinear edges and offsetting parallel lines. No code copied, because GPL would not fit this repository.
- The route drawing is our own implementation (`geometry.js`): each edge is one horizontal or vertical run plus one 45 degree run, corners are circular fillets, parallel tracks are offset curves of a shared center path so arcs stay concentric, labels are placed by a collision cost over eight candidate directions, and the grid size comes from a binary search against the container.
- lucide (ISC): station and step icons (`icons.jsx`) follow lucide shapes. Written by hand in this session, not copied from the package, so re-check against the package if exact parity matters.
- voltra by callstackincubator (MIT, license read from the GitHub API): reference only for the compact, expanded and minimal regions of a Live Activity. No code copied.
- make-interfaces-feel-better (kits) and emil-skills: read for concentric radii, interruptible CSS transitions, no `transition: all`, tabular numbers.
- Not used although installed: animejs, d3-shape (our own tween and path code were enough).

## 작업 B: 브랜드와 공유(packages/brand, share, og, icons)

- 공유 채널 글리프(Instagram, X, Facebook, WhatsApp, LINE, Telegram, KakaoTalk): simple-icons 13.21.0, 라이선스 CC0-1.0, https://github.com/simple-icons/simple-icons. 경로 데이터를 `packages/design-system/src/share/glyphs.js`에 옮겼고, 상표는 각 소유자의 것이며 공유 채널 식별에만 쓴다.
- 이메일, 문자, 복사, 저장, 닫기, 뒤로 아이콘: lucide-react(ISC), 이미 설치된 패키지.
- 인화 프레임 문법의 기준: 어반엣지 공식 인스타그램 게시물(`apps/web/public/img/ig/`, 업주 본인 게시물)과 기기 인화 샘플 `docs/reference/print/sample-strip-karaoke.jpg`. 프레임 구성(2열 컷, 워드마크 아래, 흰색과 검정과 파랑 바탕)만 참고했고 이미지를 그대로 쓰지 않았다.
- 프레임 목업과 OG 이미지 속 사진: 팀 인화 샘플 `apps/*/public/img/team/shot-1..5.jpg`(팀 자체 촬영물).
- 쿠폰 체크섬: FNV-1a 32비트 해시(공개 알고리즘)를 직접 구현했다. 외부 코드를 가져오지 않았다.
- 폰트: Barlow Condensed, Poppins(SIL OFL 1.1, Google Fonts), Pretendard(SIL OFL 1.1), SUIT(SIL OFL 1.1). 캔버스 텍스트와 OG 렌더링에 쓰며 `packages/design-system/src/styles/base.css`로 불러온다.
- 사선 경고 테이프 띠, 체커, 횡단보도 패턴: 어반엣지 브랜드 포스터(`apps/web/public/img/lg/biz_*.jpg`, `cr_*.jpg`)의 문법을 캔버스 도형으로 다시 그렸다.
- 서울교통공사와 코레일의 로고, 노선 표식, 서체는 쓰지 않았다. 승차권과 노선 알약은 어반엣지 자체 표식(UE 심볼, GY 원형 코드)으로만 그렸다.


## 작업 T: Three.js 장면(packages/scenes, apps/web/public/img/illus)

- pmndrs/react-three-fiber 문서 "Scaling performance"(MIT, https://r3f.docs.pmnd.rs/advanced/scaling-performance): `frameloop="demand"` 온디맨드 렌더링과 `invalidate()`, 반복 오브젝트 인스턴싱, 재질과 지오메트리 공유 기준을 따랐다. 화면 밖과 동작 줄이기에서 프레임이 0으로 멈추는 것을 직접 측정했다.
- pmndrs/drei `PerformanceMonitor`(MIT, https://drei.docs.pmnd.rs/performances/performance-monitor): 프레임이 떨어지면 `dpr`를 0.25씩 내리고(바닥값 1, 낮은 등급 기기는 0.75) 회복되면 올린다. `flipflops={3}`으로 진동을 막았다.
- three.js `BufferGeometryUtils.mergeGeometries`(MIT, https://threejs.org/docs/pages/module-BufferGeometryUtils.html): 문틀 8개 분량과 대차 바퀴를 지오메트리 한 덩어리로 합쳐 드로콜을 줄였다(승강장 전체 112 호출, 삼각형 약 4.8천).
- three.js `InstancedMesh`: 객실 창 14개와 UE 마크 7개를 인스턴스로 그린다.
- oso95/scroll-world(MIT): 스크롤이 시간만 정하고 카메라와 장면이 연속으로 흐른다는 방식을 참고했다. 영상 스크럽 대신 프로시저럴 장면과 지수 감쇠로 구현했다. 코드는 가져오지 않았다.
- img2threejs(Apache-2.0): 블록아웃, 구조, 형태, 재질, 조명 순의 단계와 반복부는 인스턴싱한다는 원칙을 참고했다. 코드는 가져오지 않았다.
- MengTo/Skills `3d-paper-material`(MIT): 종이를 평면 하나로 두지 않고 곡률, 접촉 그림자, 지연 시간 보정(dt 상한), DPR 상한, 숨김 탭 정지, 동작 줄이기 정지 프레임을 두는 방식을 PhotoStrip3D에 참고했다. 섬유 셰이더와 가장자리 처리는 가져오지 않았다.
- 쓰지 않은 것: KTX2와 Draco는 외부 모델과 큰 텍스처가 없어 필요하지 않았다(모든 형태는 코드로, 모든 질감은 캔버스로 만든다). drei `Preload`는 미리 불러올 에셋이 없어 쓰지 않았다.
- `@react-three/fiber` 8이 three 0.186에서 내는 `THREE.Clock` deprecated 경고 한 줄만 `packages/scenes/src/lib/quiet.js`에서 걸러 콘솔을 비웠다. fiber 9로 올리면 이 파일을 지운다.
- UE 블록 심볼 경로: `packages/brand`의 `UE_MARK_PATH`와 같은 값을 캔버스에 그린다(열차 옆면 마크, 인화 스트립 하단).
- 열차 도색(흰색 차체, 노란 줄, UE 마크)은 어반엣지 자체 표식이다. 서울교통공사와 코레일의 로고, 노선 표식, 서체는 쓰지 않았다. "Gyeongju Metro" 승강장은 브랜드가 만든 가상의 이야기이며 실제 교통시설이 아니다.
- 스트립 텍스처의 사진: 팀 인화 샘플 `apps/web/public/img/team/shot-1..4.jpg`(팀 자체 촬영물). 장식 포스터는 같은 사진이다.
- `apps/web/public/img/illus/platform-poster.jpg`: 이 장면을 브라우저에서 렌더한 스냅샷(WebGL 실패와 로딩용 대체 이미지).
- `apps/web/public/img/illus/station-*.jpg`(entrance, subway, karaoke, phone, retro): Image Generation 스킬로 생성한 AI 일러스트다. 프롬프트에 위 포스터를 스타일 참고 이미지로 넣었고, 사람과 실제 상표는 넣지 않았다. 이미지 안의 "GY-01 UrbanEdge"와 "Platform N" 글자는 생성 결과이므로 문구가 바뀌면 다시 생성한다.
- 폰트: Barlow Condensed, Pretendard(SIL OFL 1.1)를 캔버스 텍스트에 쓴다(`base.css`가 불러온다).

## 작업 G: 지도(packages/map)

- 지도 데이터: OpenStreetMap 기여자, ODbL 1.0, https://www.openstreetmap.org/copyright. 건물 윤곽, 길, 장소 이름, 도보 경로의 바탕이다. 지도 안 출처 표기와 `apps/web/public/map/*.json`의 `attribution` 필드에 남겼다. 건물 높이는 OSM 태그가 있는 9동만 실제 값이고 나머지는 2층(6.4m) 예시 값이다.
- 벡터 타일: OpenFreeMap(https://openfreemap.org, 코드 MIT, 공개 인스턴스 키 없음). 출처 표기 규칙은 사이트 안내를 따라 "OpenFreeMap, © OpenMapTiles, Data from OpenStreetMap"을 MapLibre 출처 컨트롤에 둔다. 타일 스키마는 OpenMapTiles(https://github.com/openmaptiles/openmaptiles, 스키마 그대로). 스타일 레이어는 직접 정의했다.
- 지도 엔진: maplibre/maplibre-gl-js 6.13(BSD-3-Clause, node_modules 패키지 파일에서 확인). 사용자 정의 레이어 인터페이스는 공식 예제 "Add a 3D model using three.js"와 "Display buildings in 3D"의 방식을 따랐다.
- 3D: mrdoob/three.js 0.186(MIT, GitHub API 확인). 지붕 삼각분할은 three가 포함한 mapbox/earcut(ISC, node_modules 확인)을 `ShapeUtils`로 쓴다. 건물 한 덩어리 지오메트리, 미분 법선 셰이딩, 신호탑 빛기둥은 직접 짰다.
- 도보 경로: Project-OSRM/osrm-backend(BSD-2-Clause, GitHub API 확인)를 FOSSGIS 공개 서버 routing.openstreetmap.de(foot 프로필)로 호출한다. `router.project-osrm.org`는 자동차 프로필만 제공해 쓰지 않았다. 사전 굽기(`tools/bake-map.mjs`)와 내 위치 경로(런타임, 출발 좌표 소수 4자리)에서 호출한다.
- 장소와 건물 조회: Overpass API(overpass.openstreetmap.fr 미러 우선, ODbL 데이터). 가게 좌표는 Nominatim과 네이버 플레이스 공개 페이지의 좌표를 OSM 도로와 건물 윤곽으로 교차 확인했다(근거는 `packages/map/src/shop.js`).
- 아이콘: lucide-react(ISC, node_modules 확인).
- 설계 참고: 사용자 프로젝트 miri(MapLibre + three.js 사용자 정의 레이어 `barsLayer.js`, `buildingBuild.js`, OpenFreeMap 스타일 사용 방식). 코드는 이 저장소에 맞게 새로 썼다.
- 검토만 하고 쓰지 않은 것: osmbuildings/osmbuildings(3D 건물 뷰어, 라이선스는 확인하지 않음). 사전 굽기와 직접 압출이 번들이 더 작아 쓰지 않았다.
- 구글 지도: Maps Embed API 또는 키 없는 임베드. 구글 약관에 따라 임베드 내용을 가리거나 필터로 바꾸지 않고 로고와 약관 링크를 그대로 둔다. 키는 `apps/web/.env.local`의 `VITE_GOOGLE_MAPS_KEY`로만 읽고 커밋하지 않는다.

## 작업 W1: 홈, 헤더, 푸터, 메트로 페이지(apps/web)

- darkroomengineering/lenis 1.3.26(MIT, node_modules의 package.json에서 확인, https://github.com/darkroomengineering/lenis): 부드러운 스크롤. `apps/web/src/layout/scroll.js`와 `SmoothScroll.jsx`에서 쓴다. 동작 줄이기(`prefers-reduced-motion`)에서는 켜지 않고 브라우저 기본 스크롤을 쓴다. 모달과 공유 시트는 `data-lenis-prevent`로 스크롤을 넘기지 않는다.
- lucide-react(ISC, 이미 설치된 패키지): 헤더, 푸터, 홈 섹션의 아이콘.
- UE 블록 심볼과 워드마크: `packages/brand`의 `UEMark`, `UrbanEdgeWordmark`. 헤더와 푸터와 favicon(`apps/web/public/favicon.svg`)이 같은 경로를 쓴다.
- 홈과 브랜드 페이지 사진: 네이버 플레이스 공개 사진(`apps/web/public/img/place/`), 어반엣지 공식 인스타그램 게시물(`apps/web/public/img/ig/`, 업주 본인 게시물), 팀 인화 샘플(`apps/web/public/img/team/`), 승강장 일러스트(`apps/web/public/img/illus/`, 작업 T가 만든 것). 브랜드 페이지의 포스터 갤러리도 `img/ig/`의 공식 게시물이다. 사진 파일별 출처는 `apps/web/src/data/site.js`의 `ROOMS[].photo`, `IG_PHOTOS`, `TEAM_SHOTS`에 남겼다.
- 출발 안내판, 역명판, 라이브 아일랜드, 열차 트랙: 작업 M의 `@urbanedge/ds` 컴포넌트를 쓰고 노선과 역 이름만 GY 체계로 넘긴다. 안내판의 버튼에서 줄바꿈이 막히는 문제는 `components/home/board-fix.css`에서 CSS로만 보정했고 ds 코드는 고치지 않았다.
- 영문과 한글의 레이아웃 고정: ds의 `.t-*` 행간이 html lang에 따라 바뀌어 언어 전환 때 높이가 달라지는 문제를 `layout/lang-stable.css`로 보정했다. Bi 안쪽 span의 lang으로 행간과 자간을 고정한다.
- Metro Pass는 쿠키 `ue_pass`에 방문한 역 id와 날짜만 저장한다. `localStorage`와 `sessionStorage`는 쓰지 않았다. 쿠폰 잠금 해제는 메모리 상태만 쓴다.
- 서울교통공사와 코레일의 로고, 노선 표식, 서체는 쓰지 않았다. "Gyeongju Metro"와 GY-02부터 GY-04는 브랜드가 만든 가상의 이야기이며 실제 교통시설이 아니다. 화면에 "Imaginary Metro · Travel Experience"를 항상 둔다.
- 스크래치 쿠폰의 코드(`GY01-SHARE`)와 혜택은 아직 매장과 확정하지 않은 자리표시다. 혜택 금액은 정하지 않았다.

## Metro art (task MA, packages/design-system/src/metro/art, badges, train glyphs)

All train, badge, glyph and platform-scene art in this pass is drawn by hand as React SVG in this repository. No third-party vector paths were copied. Sources below were opened, their licenses read, and used only as references or rejected.

- Visual references (not redistributed): Seoul subway app platform scene and Live Activity card, Seoul Metro series toy-train packaging photos (train proportions, sloped black cab glass, door rhythm, stripe height, line pill with dotted route), iPhone line-badge screenshots, and the team's own AI poster "No subway in Gyeongju. So we built one." No Seoul Metro, Korail or toy-maker logos, typefaces or symbols were used; the livery carries only the UrbanEdge UE block mark.
- UE mark: path copied from our own `@urbanedge/brand` (`packages/brand/src/logo/UEMark.jsx`) into `metro/art/ueMark.jsx`, because importing brand from the design system would make a circular dependency.
- louh/mta-subway-bullets (CC0-1.0, LICENSE read): reference for how tightly a bold numeral should fill a circular bullet. No paths used; our badges use Barlow Condensed 800 with a white inner ring.
- lucide-icons/lucide (ISC, LICENSE read): station icons in `icons.jsx` still follow lucide shapes. The `subway` (front) and new `train` (side) icons were redrawn to match this kit.
- microsoft/fluentui-emoji (MIT), jdecked/twemoji (code MIT, graphics CC-BY-4.0, LICENSE-GRAPHICS read), googlefonts/noto-emoji (fonts OFL-1.1, images Apache-2.0 per README), tabler/tabler-icons (MIT), phosphor-icons/core (MIT): metro and train glyphs downloaded and compared. Not used. They are emoji or icon scale and do not match a Korean EMU side elevation.
- hfg-gmuend/openmoji (CC-BY-SA-4.0): rejected because of share-alike.
- Wikimedia Commons: searched through the API for Korean EMU and Seoul Metro rolling-stock SVGs. Nothing usable under a free license came back in the categories searched.
- robonyong/react-split-flap-display (MIT) and callstackincubator/voltra (MIT): read as references for flip-board and Live Activity behaviour. No code copied.
- Three.js subway train repos (for example nsalloums/metrovivo-santiago, MIT): checked, not used. This pass is flat SVG.
- Colors come only from token CSS variables. Shades are `color-mix()` of token variables (`metro/art/paint.js`).
