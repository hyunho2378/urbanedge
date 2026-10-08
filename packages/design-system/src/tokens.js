// tokens.js: UrbanEdge 디자인 토큰의 단일 진실 소스
// 웹(apps/web)과 키오스크(apps/kiosk)가 같은 값을 쓴다. 색, 간격, 폰트, 모션 값은 이 파일에만 둔다.
// 색 기준은 26-1 DAH EXHIBITION 사이트(검정 #0A0A0A, 글자 #F0F0F0, 포인트 #F5C518)이고,
// 노선 4색은 어반엣지 브랜드 리본에서 가져왔다. 자세한 근거는 UI.md.

// 1) 원시 색 (RGB 3채널 문자열). tailwind-preset이 :root CSS 변수로 내보낸다.
export const palette = {
  'bg-base': '10 10 10',
  'bg-elev': '18 18 18',
  'bg-panel': '26 26 26',
  'bg-raised': '36 36 36',
  'bg-yellow': '245 197 24',
  'text-pri': '237 237 237',
  'text-sec': '214 214 214',
  'text-meta': '176 176 176',
  'text-disabled': '120 120 120',
  'text-on-yellow': '10 10 10',
  yellow: '245 197 24',
  'yellow-hover': '255 217 77',
  'yellow-pressed': '214 168 0',
  'line-yellow': '245 197 24',
  'line-red': '231 65 53',
  'line-blue': '90 130 205',
  'line-green': '63 166 107',
  'state-error': '255 107 94',
  'state-success': '74 222 128',
  focus: '255 217 77',
  white: '255 255 255',
  black: '0 0 0',
}

// prefers-contrast: more 일 때 덮어쓰는 값
export const paletteHighContrast = {
  'text-sec': '240 240 240',
  'text-meta': '224 224 224',
  'text-disabled': '176 176 176',
}

// 투명도가 필요한 값은 알파 변수로 둔다 (border는 rgb 변수 + 알파)
export const alpha = {
  hairline: 0.14,
  hairlineStrong: 0.34,
  yellowLine: 1,
  scrim: 0.72,
  glass: 0.6,
  tint: 0.08,
}

const cssColor = (name) => `rgb(var(--ue-${name}) / <alpha-value>)`

export const colors = {
  bg: {
    base: cssColor('bg-base'),
    elev: cssColor('bg-elev'),
    panel: cssColor('bg-panel'),
    raised: cssColor('bg-raised'),
    yellow: cssColor('bg-yellow'),
  },
  text: {
    pri: cssColor('text-pri'),
    sec: cssColor('text-sec'),
    meta: cssColor('text-meta'),
    disabled: cssColor('text-disabled'),
    onYellow: cssColor('text-on-yellow'),
  },
  yellow: {
    DEFAULT: cssColor('yellow'),
    hover: cssColor('yellow-hover'),
    pressed: cssColor('yellow-pressed'),
  },
  line: {
    yellow: cssColor('line-yellow'),
    red: cssColor('line-red'),
    blue: cssColor('line-blue'),
    green: cssColor('line-green'),
  },
  state: { error: cssColor('state-error'), success: cssColor('state-success') },
  focus: cssColor('focus'),
  white: cssColor('white'),
  black: cssColor('black'),
  // 보더는 text-pri 채널에 알파를 얹는다. Tailwind에서 border-hairline, border-hairline-strong
  hairline: `rgb(var(--ue-text-pri) / ${alpha.hairline})`,
  hairlineStrong: `rgb(var(--ue-text-pri) / ${alpha.hairlineStrong})`,
  scrim: `rgb(var(--ue-black) / ${alpha.scrim})`,
  glass: `rgb(var(--ue-bg-panel) / ${alpha.glass})`,
  tint: `rgb(var(--ue-yellow) / ${alpha.tint})`,
}

// 2) 타이포그래피
export const typography = {
  family: {
    display: "'Wanted Sans Variable', 'Wanted Sans', 'SUIT Variable', SUIT, -apple-system, 'Apple SD Gothic Neo', sans-serif",
    sans: "'Wanted Sans Variable', 'Wanted Sans', 'SUIT Variable', SUIT, -apple-system, 'Apple SD Gothic Neo', sans-serif",
    ui: "'SUIT Variable', SUIT, 'Wanted Sans Variable', 'Wanted Sans', 'SUIT Variable', SUIT, sans-serif",
    brand: "'Poppins', 'Wanted Sans Variable', 'Wanted Sans', 'SUIT Variable', SUIT, sans-serif",
    label: "'Barlow Condensed', 'Wanted Sans Variable', 'Wanted Sans', 'SUIT Variable', SUIT, sans-serif",
  },
  // [모바일 390px, 데스크탑 1440px] 웹 유동 스케일. tailwind-preset이 clamp로 보간한다.
  size: {
    displayXL: [56, 168],
    displayL: [44, 120],
    displayM: [36, 80],
    h1: [32, 56],
    h2: [26, 40],
    h3: [20, 28],
    h4: [17, 22],
    lead: [17, 22],
    body: [16, 18],
    bodySm: [14, 15],
    label: [12, 14],
    caption: [12, 13],
  },
  // 키오스크 1920x1080 캔버스 전용 고정 px 스케일
  kiosk: {
    hero: 168,
    title: 104,
    h2: 72,
    h3: 52,
    lead: 44,
    body: 36,
    btn: 40,
    label: 28,
    caption: 24,
  },
  weight: { regular: 400, medium: 500, semibold: 600, bold: 700, extrabold: 800, black: 900 },
  leading: { tight: 1.04, snug: 1.2, normal: 1.5, relaxed: 1.7 },
  tracking: { tightest: '-0.02em', tight: '-0.01em', normal: '0em', wide: '0.12em', wider: '0.22em' },
}

// 2-1) 타이포 레시피. 역할마다 굵기, 행간, 자간을 묶어 쓴다. 가벼운 굵기만 쓰지 않고 굵은 제목과 보통 본문을 짝지운다.
// 영문(기본)과 한글(:lang(ko))의 자간과 행간을 따로 둔다. 한글은 자간을 덜 줄이고 행간을 넓힌다.
export const recipes = {
  display: { size: 'display-l', weight: 800, leading: 0.96, tracking: '-0.04em', ko: { leading: 1.08, tracking: '-0.035em' } },
  title: { size: 'h1', weight: 750, leading: 1.04, tracking: '-0.03em', ko: { leading: 1.16, tracking: '-0.03em' } },
  headline: { size: 'h2', weight: 700, leading: 1.12, tracking: '-0.022em', ko: { leading: 1.22, tracking: '-0.025em' } },
  subhead: { size: 'h3', weight: 650, leading: 1.2, tracking: '-0.015em', ko: { leading: 1.32, tracking: '-0.02em' } },
  lead: { size: 'lead', weight: 450, leading: 1.5, tracking: '-0.008em', ko: { leading: 1.62, tracking: '-0.012em' } },
  body: { size: 'body', weight: 420, leading: 1.6, tracking: '-0.004em', ko: { leading: 1.72, tracking: '-0.01em' } },
  strong: { size: 'body', weight: 650, leading: 1.5, tracking: '-0.006em', ko: { leading: 1.64, tracking: '-0.01em' } },
  label: { size: 'label', weight: 600, leading: 1.2, tracking: '0.14em', ko: { leading: 1.3, tracking: '0.08em' } },
  caption: { size: 'caption', weight: 500, leading: 1.45, tracking: '0.005em', ko: { leading: 1.55, tracking: '0em' } },
}

// 3) 간격 (px). Tailwind에서 p-24 = 24px
export const spacing = {
  scale: [0, 2, 4, 6, 8, 10, 12, 14, 16, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 80, 96, 112, 120, 128, 144, 160, 192, 240],
  pagePx: { mobile: '1.5rem', tablet: '2.5rem', desktop: '4rem' },
  section: { mobile: 72, desktop: 160 },
}

// 4) 레이아웃
export const layout = {
  breakpoints: { xs: 320, sm: 390, md: 768, lg: 1024, xl: 1280, '2xl': 1440, '3xl': 1920, '4xl': 2560, '5xl': 3840 },
  headerHeight: { mobile: 64, desktop: 76 },
  contentMax: { read: '68ch', wide: '1760px' },
  // 키오스크 캔버스: 가로형 16:9 모니터. 실제 기기 모니터 비율에 맞춘다.
  kiosk: { width: 1920, height: 1080, minTouch: 120, safe: 64 },
}

// 5) 반경, 그림자
export const radius = { none: '0px', sm: '4px', md: '8px', lg: '16px', xl: '24px', pill: '999px', device: '28px' }
export const shadow = {
  focus: '0 0 0 3px rgb(var(--ue-focus) / 0.9)',
  lift: '0 24px 64px rgb(var(--ue-black) / 0.55)',
  device: '0 40px 120px rgb(var(--ue-black) / 0.6)',
  glowYellow: '0 0 48px rgb(var(--ue-yellow) / 0.35)',
}

// 6) 모션. transform과 opacity만 애니메이션한다.
export const motion = {
  ease: { out: 'cubic-bezier(.16, 1, .3, 1)', inOut: 'cubic-bezier(.65, 0, .35, 1)', linear: 'linear' },
  duration: { instant: 80, fast: 160, base: 320, slow: 640, hero: 1100 },
  pressScale: 0.97,
}

// 7) z-index 위계
export const zIndex = { base: 0, sticky: 10, dropdown: 30, header: 50, overlay: 90, modal: 100, toast: 110 }

// 8) 노선 정보: 5개 방과 노선 색. 웹과 키오스크가 같은 목록을 쓴다.
export const lines = [
  { id: 'subway', color: 'yellow', code: 'L1' },
  { id: 'karaoke', color: 'red', code: 'L2' },
  { id: 'phone', color: 'blue', code: 'L3' },
  { id: 'retro', color: 'green', code: 'L4' },
  { id: 'toilet', color: 'yellow', code: 'L5' },
]
