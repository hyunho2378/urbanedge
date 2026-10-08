// tailwind-preset.js: tokens.js를 Tailwind 테마와 :root CSS 변수로 변환한다.
// 앱의 tailwind.config.js는 이 프리셋만 쓰고, content에 디자인시스템 경로를 추가한다.
import plugin from 'tailwindcss/plugin'
import {
  palette,
  paletteHighContrast,
  colors,
  typography,
  spacing,
  layout,
  radius,
  shadow,
  motion,
  zIndex,
} from './tokens.js'

const px = (n) => `${n}px`
const kebab = (k) => k.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()

// 390~1440 구간 선형 보간. 모바일과 데스크탑 값이 같으면 고정값.
const fluid = (m, d) =>
  m === d ? px(d) : `clamp(${m}px, calc(${m}px + ${d - m} * ((100vw - 390px) / 1050)), ${d}px)`

const fontSize = {}
for (const [name, [m, d]] of Object.entries(typography.size)) {
  fontSize[kebab(name)] = fluid(m, d)
}
for (const [name, v] of Object.entries(typography.kiosk)) {
  fontSize[`k-${kebab(name)}`] = px(v)
}

const spacingScale = Object.fromEntries(spacing.scale.map((n) => [String(n), px(n)]))

const cssVars = Object.fromEntries(Object.entries(palette).map(([k, v]) => [`--ue-${k}`, v]))
const cssVarsHC = Object.fromEntries(Object.entries(paletteHighContrast).map(([k, v]) => [`--ue-${k}`, v]))

export default {
  theme: {
    screens: Object.fromEntries(Object.entries(layout.breakpoints).map(([k, v]) => [k, px(v)])),
    extend: {
      colors,
      fontFamily: {
        display: typography.family.display,
        sans: typography.family.sans,
        ui: typography.family.ui,
        label: typography.family.label,
        brand: typography.family.brand,
      },
      fontSize,
      fontWeight: typography.weight,
      lineHeight: typography.leading,
      letterSpacing: typography.tracking,
      spacing: spacingScale,
      borderRadius: radius,
      boxShadow: shadow,
      zIndex: Object.fromEntries(Object.entries(zIndex).map(([k, v]) => [k, String(v)])),
      transitionTimingFunction: { out: motion.ease.out, 'in-out': motion.ease.inOut },
      transitionDuration: Object.fromEntries(Object.entries(motion.duration).map(([k, v]) => [k, `${v}ms`])),
      scale: { press: String(motion.pressScale) },
      keyframes: {
        marquee: { from: { transform: 'translate3d(0,0,0)' }, to: { transform: 'translate3d(-50%,0,0)' } },
        'pulse-soft': { '0%,100%': { opacity: '1', transform: 'scale(1)' }, '50%': { opacity: '0.55', transform: 'scale(1.06)' } },
        'nudge-down': { '0%,100%': { transform: 'translate3d(0,0,0)' }, '50%': { transform: 'translate3d(0,24px,0)' } },
        'nudge-right': { '0%,100%': { transform: 'translate3d(0,0,0)' }, '50%': { transform: 'translate3d(16px,0,0)' } },
        'fade-up': { from: { opacity: '0', transform: 'translate3d(0,24px,0)' }, to: { opacity: '1', transform: 'translate3d(0,0,0)' } },
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'pop-in': { from: { opacity: '0', transform: 'translate3d(0,0,0) scale(0.92)' }, to: { opacity: '1', transform: 'translate3d(0,0,0) scale(1)' } },
        'slide-left': { from: { opacity: '0', transform: 'translate3d(64px,0,0)' }, to: { opacity: '1', transform: 'translate3d(0,0,0)' } },
        'ring-out': { '0%': { opacity: '0.8', transform: 'scale(1)' }, '100%': { opacity: '0', transform: 'scale(1.9)' } },
        flash: { '0%': { opacity: '0' }, '12%': { opacity: '1' }, '100%': { opacity: '0' } },
      },
      animation: {
        marquee: 'marquee 48s linear infinite',
        'pulse-soft': 'pulse-soft 2.4s var(--ue-ease-out) infinite',
        'nudge-down': 'nudge-down 1.4s var(--ue-ease-out) infinite',
        'nudge-right': 'nudge-right 1.4s var(--ue-ease-out) infinite',
        'fade-up': 'fade-up 640ms var(--ue-ease-out) both',
        'fade-in': 'fade-in 320ms var(--ue-ease-out) both',
        'pop-in': 'pop-in 320ms var(--ue-ease-out) both',
        'slide-left': 'slide-left 480ms var(--ue-ease-out) both',
        'ring-out': 'ring-out 1.6s var(--ue-ease-out) infinite',
        flash: 'flash 600ms var(--ue-ease-out) both',
      },
      maxWidth: { read: layout.contentMax.read, wide: layout.contentMax.wide },
      height: { header: px(layout.headerHeight.desktop), 'header-m': px(layout.headerHeight.mobile) },
      minHeight: { touch: px(layout.kiosk.minTouch) },
      minWidth: { touch: px(layout.kiosk.minTouch) },
    },
  },
  plugins: [
    plugin(({ addBase, addComponents, addUtilities }) => {
      addBase({
        ':root': {
          ...cssVars,
          '--ue-ease-out': motion.ease.out,
          '--ue-page-px': spacing.pagePx.mobile,
          '--ue-header-h': px(layout.headerHeight.mobile),
          colorScheme: 'dark',
        },
        [`@media (min-width: ${px(layout.breakpoints.md)})`]: {
          ':root': { '--ue-page-px': spacing.pagePx.tablet },
        },
        [`@media (min-width: ${px(layout.breakpoints.lg)})`]: {
          ':root': { '--ue-page-px': spacing.pagePx.desktop, '--ue-header-h': px(layout.headerHeight.desktop) },
        },
        '@media (prefers-contrast: more)': { ':root': cssVarsHC },
        html: { backgroundColor: 'rgb(var(--ue-bg-base))', textSizeAdjust: '100%' },
        body: {
          backgroundColor: 'rgb(var(--ue-bg-base))',
          color: 'rgb(var(--ue-text-pri))',
          fontFamily: typography.family.sans,
          lineHeight: String(typography.leading.normal),
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          textRendering: 'optimizeLegibility',
        },
        '::selection': { backgroundColor: 'rgb(var(--ue-yellow))', color: 'rgb(var(--ue-text-on-yellow))' },
        ':focus-visible': { outline: '2px solid rgb(var(--ue-focus))', outlineOffset: '3px' },
        'button, [role="button"], a': { WebkitTapHighlightColor: 'transparent' },
        // 동작 줄이기: 모든 전환과 애니메이션을 즉시 완료
        '@media (prefers-reduced-motion: reduce)': {
          '*, *::before, *::after': {
            animationDuration: '0.001ms !important',
            animationIterationCount: '1 !important',
            transitionDuration: '0.001ms !important',
            scrollBehavior: 'auto !important',
          },
        },
        // 투명도 줄이기: 반투명 표면을 불투명으로
        '@media (prefers-reduced-transparency: reduce)': {
          '.ue-glass': { backgroundColor: 'rgb(var(--ue-bg-panel)) !important', backdropFilter: 'none !important' },
        },
      })
      addComponents({
        '.px-page': { paddingLeft: 'var(--ue-page-px)', paddingRight: 'var(--ue-page-px)' },
        '.section-y': {
          paddingTop: `clamp(${spacing.section.mobile}px, 12vw, ${spacing.section.desktop}px)`,
          paddingBottom: `clamp(${spacing.section.mobile}px, 12vw, ${spacing.section.desktop}px)`,
        },
        '.ue-glass': {
          backgroundColor: `rgb(var(--ue-bg-panel) / 0.6)`,
          backdropFilter: 'blur(16px)',
        },
        '.ue-press': { transitionProperty: 'transform, opacity', transitionDuration: `${motion.duration.fast}ms`, transitionTimingFunction: motion.ease.out },
        '.ue-press:active': { transform: `scale(${motion.pressScale})` },
        '.ue-label': {
          fontFamily: typography.family.label,
          letterSpacing: typography.tracking.wider,
          textTransform: 'uppercase',
          fontWeight: String(typography.weight.medium),
        },
      })
      addUtilities({
        '.text-balance': { textWrap: 'balance' },
        '.text-pretty': { textWrap: 'pretty' },
        '.min-h-dvh': { minHeight: '100dvh' },
        '.h-dvh': { height: '100dvh' },
      })
    }),
  ],
}
