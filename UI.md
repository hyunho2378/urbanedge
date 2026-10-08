# UI.md

어반엣지 디자인시스템 문서. 웹(apps/web)과 키오스크(apps/kiosk)가 같은 문서와 같은 토큰을 쓴다. 값의 단일 진실 소스는 `packages/design-system/src/tokens.js`이며, 이 문서는 값을 쓰는 규칙을 설명한다.

## 1. 기준과 근거

색, 타이포, 레이아웃 감각의 기준은 26-1 DAH EXHIBITION 사이트(https://26-1-dah-exhibition.vercel.app/)다. 코드 구조와 토큰 운영 방식의 기준은 dah-hallym 사이트 저장소(tokens.js 단일 소스, Tailwind 프리셋, 컴포넌트 계층)다.

전시회 사이트에서 직접 측정한 값은 다음과 같다.

| 항목 | 측정값 |
| --- | --- |
| 바탕 | `#0A0A0A` |
| 본문 글자 | `#F0F0F0` |
| 포인트 | `#F5C518` |
| 히어로 타이틀 | Pretendard Variable 900, 140px, 자간 -2.8px, 행간 161px |
| 내비게이션 | Barlow Condensed 계열, 넓은 자간, 하단 1px 포인트 라인 |
| 버튼 | 1px 포인트 테두리, 반경 8px, 글자 포인트색, SUIT Variable 14px |
| 이징 | `cubic-bezier(.16, 1, .3, 1)` |
| 페이지 좌우 패딩 | 모바일 1.5rem, 태블릿 2.5rem, 데스크톱 4rem |
| 섹션 라벨 | 작은 자간 텍스트 `01 전시회 소개` 아래 헤어라인 |

어반엣지 브랜드 요소(횡단보도, 체커보드, 경고 테이프, 노선 4색, 이중 십자 `‡`)는 이 감각 위에 얹는다. 브랜드 원본 노랑 `#FFD821`은 로고 이미지에만 남기고, 화면 UI의 포인트는 `#F5C518`로 통일한다.

## 2. 색

모든 색은 `--ue-*` CSS 변수로 노출되고 Tailwind 클래스로 쓴다. 컴포넌트에 hex, rgb 값을 직접 쓰지 않는다.

| 역할 | 토큰 | 값 | 사용처 |
| --- | --- | --- | --- |
| 바탕 | `bg-bg-base` | 10 10 10 | 페이지 기본 |
| 바탕 한 단계 위 | `bg-bg-elev` | 18 18 18 | 교차 섹션 |
| 패널 | `bg-bg-panel` | 26 26 26 | 카드, 시트 |
| 띄운 면 | `bg-bg-raised` | 36 36 36 | 눌린 상태, 입력 |
| 포인트 면 | `bg-yellow` | 245 197 24 | 주 버튼, 강조 면 |
| 본문 | `text-text-pri` | 240 240 240 | 제목, 본문 |
| 보조 | `text-text-sec` | 214 214 214 | 설명 |
| 메타 | `text-text-meta` | 176 176 176 | 캡션, 날짜 |
| 포인트 글자 | `text-yellow` | 245 197 24 | 링크, 숫자, 라벨 번호 |
| 노선 | `bg-line-yellow/red/blue/green` | 노선 4색 | 방 구분, 진행 표시 |
| 경계 | `border-hairline`, `border-hairlineStrong` | 본문색 14%, 34% | 카드, 구분선 |

규칙은 다음과 같다. 회색 계열 글자는 `text-meta`(대비 8:1 이상)까지만 쓴다. 옅은 크림 틴트와 탁한 회색 배경은 쓰지 않는다. 포인트 면 위의 글자는 항상 `text-onYellow`다. 대비 높임(`prefers-contrast: more`) 설정에서는 보조, 메타, 비활성 글자가 본문색에 가깝게 올라간다.

## 3. 타이포그래피

| 역할 | 패밀리 | 클래스 |
| --- | --- | --- |
| 제목과 본문 | Pretendard Variable | `font-display`, `font-sans` |
| 버튼과 UI 문구 | SUIT Variable | `font-ui` |
| 영문 라벨, 내비게이션, 번호 | Barlow Condensed | `font-label` 또는 `.ue-label` |
| 워드마크 | Poppins Bold | `font-brand` |

웹 크기는 390px에서 1440px 사이를 선형 보간하는 `clamp` 값이다. 제목 클래스는 `text-display-xl`(56에서 168), `text-display-l`(44에서 120), `text-display-m`, `text-h1`부터 `text-h4`, `text-lead`, `text-body`, `text-body-sm`, `text-label`, `text-caption`이다. 대형 제목은 `font-black tracking-tightest leading-tight`로 쓴다.

키오스크 크기는 1920x1080 캔버스 기준 고정 px 값이다. `text-k-hero`(168), `text-k-title`(104), `text-k-h2`(72), `text-k-h3`(52), `text-k-lead`(44), `text-k-body`(36), `text-k-btn`(40), `text-k-label`(28), `text-k-caption`(24). 키오스크 본문은 36px 미만으로 내리지 않는다. 팔 길이 거리에서 읽히는 하한이다.

## 4. 간격과 레이아웃

간격은 `spacing.scale`의 px 숫자 키를 쓴다(`p-24` = 24px). 페이지 좌우 패딩은 `.px-page`, 섹션 상하 여백은 `.section-y`다.

브레이크포인트는 xs 320, sm 390, md 768, lg 1024, xl 1280, 2xl 1440, 3xl 1920, 4xl 2560, 5xl 3840이다. 탐색 중심 그리드는 상한 없이 컬럼 수를 늘리고, 읽기 본문은 `max-w-read`(68ch)로 제한한다. 3840px에서 좌우 여백이 콘텐츠보다 커지지 않도록 `Container`의 `wide`(1760px) 상한을 쓰되 타이포와 여백을 clamp로 키운다.

키오스크는 1920x1080 고정 캔버스를 `transform: scale()`로 화면에 맞춘다. 최소 터치 영역은 120px(`min-h-touch`, `min-w-touch`), 화면 안전 여백은 64px다.

## 5. 반경, 그림자, 층위

반경은 `rounded-md`(8px)가 기본이고 카드는 `rounded-lg`(16px), 기기 외형은 `rounded-device`(28px)다. 그림자는 `shadow-focus`, `shadow-lift`, `shadow-device`, `shadow-glowYellow`만 쓴다. z-index는 `base 0, sticky 10, dropdown 30, header 50, overlay 90, modal 100, toast 110`이다.

## 6. 모션

이징은 `ease-out`(`cubic-bezier(.16, 1, .3, 1)`) 하나를 기본으로 쓴다. 길이는 `duration-fast`(160ms), `base`(320ms), `slow`(640ms)다.

| 허용 | 금지 |
| --- | --- |
| `transform`, `opacity` 전환 | `width`, `height`, `top`, `left`, `margin` 전환 |
| 누름 `scale(0.97)`(`.ue-press`) | hover에 `scale()` |
| 등장 `fade-up`, `pop-in`, `slide-left` | 자동 재생 영상 소리, 번쩍임 3회 초과 |

`prefers-reduced-motion: reduce`에서는 모든 애니메이션과 전환이 즉시 끝난다. `prefers-reduced-transparency: reduce`에서는 `.ue-glass`가 불투명 패널이 된다. 자동으로 움직이는 글자(`Marquee`)는 일시정지 버튼과 hover 정지를 제공한다(WCAG 2.2.2).

## 7. 컴포넌트

| 컴포넌트 | 변형과 상태 |
| --- | --- |
| `Button` | primary(노랑 면), outline(노랑 1px, 전시회 방식), ghost, dark. 크기 md, lg, kiosk. hover, active(scale 0.97), focus-visible, disabled |
| `Container` | wide, read, full |
| `SectionLabel` | 번호 + 라벨 + 헤어라인 |
| `Reveal` | 스크롤 등장. JS 실패와 동작 줄이기에서는 항상 보임 |
| `Marquee` | 일시정지, hover 정지, 동작 줄이기 정지 |
| `Crosswalk`, `Checker`, `CautionTape`, `RouteRibbon` | 브랜드 패턴 4종, 전부 inline SVG |
| `LineBadge` | 노선 코드 원형 배지(L1부터 L5), 크기 md, lg, kiosk |
| `Tag` | line, yellow |
| `Wordmark` | UrbanEdge Metrography 텍스트 워드마크 |

새 컴포넌트는 먼저 이 표에 올리고, 상태(기본, hover, active, focus, disabled, loading, empty, error)를 정의한 뒤 구현한다.

## 8. 브랜드 패턴 사용 규칙

횡단보도는 히어로와 구분선, 체커보드는 방 소개와 코너 장식, 경고 테이프는 안내와 주의 영역, 노선 리본은 진행 표시와 방 구분에 쓴다. 한 화면에 패턴 두 종류를 넘기지 않는다. 이중 십자 `‡`는 항목 사이 구분자로 쓴다. 이모지 아이콘은 쓰지 않고 lucide-react 또는 inline SVG만 쓴다.

## 9. 접근성

본문 대비 4.5:1 이상, 큰 글자 3:1 이상이다. 포커스 링은 2px `focus` 색 + 3px 오프셋이며 모든 인터랙티브 요소에서 보인다. 키보드 조작이 가능해야 하고(Tab 순서, Enter, Space, Esc), 터치 영역은 웹 44px, 키오스크 120px 이상이다. 이미지는 대체 텍스트를 가진다. 언어 전환은 페이지를 리마운트하지 않고 텍스트만 교체한다.

## 10. 금지 목록(자동 점검 대상)

`scripts/check-rules.mjs`가 다음 항목을 grep으로 점검한다. TypeScript 파일, `localStorage`와 `sessionStorage`, 컴포넌트 안의 hex와 rgb 색 리터럴, 네이티브 `<select>`와 `type="date"`, hover의 `scale`, 이모지 문자, Tailwind 임의값(`[#...]`, `[12px]`).
