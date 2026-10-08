// palette.js: 색은 :root의 --ue-* CSS 변수를 런타임에 읽는다. 변수가 없으면 tokens.js 값을 쓴다.
import { Color, SRGBColorSpace } from 'three'
import { palette as TOKENS, lines as TOKEN_LINES } from '@urbanedge/ds/tokens'

function readVar(name) {
  let raw = ''
  if (typeof document !== 'undefined') raw = getComputedStyle(document.documentElement).getPropertyValue(`--ue-${name}`).trim()
  const src = /^\d+\s+\d+\s+\d+$/.test(raw) ? raw : TOKENS[name]
  const [r, g, b] = src.split(/\s+/).map(Number)
  return new Color().setRGB(r / 255, g / 255, b / 255, SRGBColorSpace)
}

export const css = (c) => `#${c.getHexString()}`
const mix = (a, b, t) => a.clone().lerp(b, t)

// 승강장 장면에 쓰는 색 모음. 전부 토큰에서 파생한다.
export function readPalette() {
  const P = {}
  const keys = ['bg-base', 'bg-elev', 'bg-panel', 'bg-raised', 'yellow', 'yellow-hover', 'yellow-pressed', 'text-pri', 'text-sec', 'text-meta', 'line-red', 'line-blue', 'line-green', 'white', 'black']
  for (const k of keys) P[k] = readVar(k)
  P.bg = P['bg-base']
  P.tileWhite = mix(P.white, P['text-sec'], 0.12)
  P.tileGrout = mix(P.white, P['text-meta'], 0.62)
  P.tileBlue = mix(P['line-blue'], P.black, 0.62)
  P.tileBlueGrout = mix(P.tileBlue, P['line-blue'], 0.28)
  P.tileBlack = mix(P.black, P['bg-raised'], 0.5)
  P.steel = mix(P['text-sec'], P['bg-raised'], 0.28)
  P.steelDark = mix(P['text-meta'], P['bg-panel'], 0.55)
  P.glass = mix(P['bg-panel'], P['line-blue'], 0.18)
  P.interior = mix(P.white, P['text-pri'], 0.5)
  P.track = mix(P['bg-elev'], P['bg-raised'], 0.35)
  P.ceiling = mix(P['bg-elev'], P['bg-raised'], 0.5)
  return P
}

export const accentOf = (P, color) => (color === 'red' ? P['line-red'] : color === 'blue' ? P['line-blue'] : color === 'green' ? P['line-green'] : P.yellow)
// 노선 색 위의 글자색(노랑, 초록은 검정 글자, 빨강, 파랑은 흰 글자)
export const inkOn = (P, color) => (color === 'red' || color === 'blue' ? P.white : P['bg-base'])

// Gyeongju Metro(GY). 첫 역 GY-01 UrbanEdge 안에 승강장(방) 4곳이 있다(docs/NAMING.md).
export const LINE = { name: 'Gyeongju Metro', code: 'GY', color: 'yellow' }
export const STATION = { id: 'urbanedge', no: 'GY-01', name: 'UrbanEdge' }
const NAMES = { subway: 'Subway Shot', karaoke: 'Karaoke Shot', phone: 'Public Phone Shot', retro: 'Retro Shot' }
const COLORS = { subway: 'yellow', karaoke: 'red', phone: 'blue', retro: 'green' }
// 방은 4곳(화장실 방은 없어졌다). 색은 tokens.lines에 같은 id가 있으면 그 값을 따른다.
export const PLATFORMS = Object.keys(NAMES).map((id, i) => ({ id, no: String(i + 1), platform: i + 1, name: NAMES[id], color: TOKEN_LINES.find((l) => l.id === id)?.color || COLORS[id] }))
export const ROOM_STATIONS = PLATFORMS
export const STATIONS = PLATFORMS
