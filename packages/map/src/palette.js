// palette.js: 지도 색은 전부 디자인 토큰(@urbanedge/ds/tokens palette)에서 가져온다. 색 리터럴을 직접 쓰지 않는다.
import { palette } from '@urbanedge/ds/tokens'

const ch = (name) => palette[name].split(' ').map(Number)
const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t))
export const rgb = ([r, g, b]) => `rgb(${r},${g},${b})`
export const rgba = ([r, g, b], a) => `rgba(${r},${g},${b},${a})`
export const to01 = ([r, g, b]) => [r / 255, g / 255, b / 255]

const T = {
  base: ch('bg-base'), elev: ch('bg-elev'), panel: ch('bg-panel'), raised: ch('bg-raised'),
  pri: ch('text-pri'), sec: ch('text-sec'), meta: ch('text-meta'),
  yellow: ch('yellow'), yellowHover: ch('yellow-hover'), blue: ch('line-blue'), green: ch('line-green'), red: ch('line-red'),
  white: ch('white'), black: ch('black'),
}

// 테마별 지도 색. 어두운 쪽은 블랙과 옐로우 브랜드, 밝은 쪽은 같은 토큰을 뒤집어 쓴다.
export function themeColors(theme) {
  const dark = theme !== 'light'
  if (dark) {
    return {
      dark,
      bg: T.base,
      land: mix(T.base, T.elev, 0.9),
      park: mix(T.base, T.green, 0.16),
      wood: mix(T.base, T.green, 0.1),
      water: mix(T.base, T.blue, 0.2),
      waterLine: mix(T.base, T.blue, 0.3),
      roadCase: T.base,
      roadMinor: mix(T.raised, T.meta, 0.1),
      roadMajor: mix(T.raised, T.meta, 0.3),
      roadPath: mix(T.raised, T.meta, 0.18),
      building2d: mix(T.panel, T.raised, 0.5),
      buildingLine: mix(T.raised, T.meta, 0.14),
      label: T.sec,
      labelDim: T.meta,
      halo: T.base,
      wall: mix(T.raised, T.sec, 0.16),
      roof: mix(T.raised, T.sec, 0.34),
      fog: T.base,
      lineCase: T.base,
      routeLine: T.yellow,
      stationFill: T.pri,
      stationRing: T.base,
      yellow: T.yellow,
      yellowHi: T.yellowHover,
    }
  }
  return {
    dark,
    bg: mix(T.white, T.pri, 0.55),
    land: mix(T.white, T.pri, 0.55),
    park: mix(T.white, T.green, 0.2),
    wood: mix(T.white, T.green, 0.14),
    water: mix(T.white, T.blue, 0.34),
    waterLine: mix(T.white, T.blue, 0.5),
    roadCase: mix(T.pri, T.meta, 0.4),
    roadMinor: T.white,
    roadMajor: T.white,
    roadPath: mix(T.pri, T.meta, 0.3),
    building2d: mix(T.pri, T.sec, 0.5),
    buildingLine: mix(T.sec, T.meta, 0.4),
    label: T.panel,
    labelDim: mix(T.panel, T.meta, 0.4),
    halo: T.white,
    wall: mix(T.pri, T.sec, 0.55),
    roof: mix(T.white, T.pri, 0.4),
    fog: mix(T.white, T.pri, 0.55),
    lineCase: T.base,
    routeLine: T.yellow,
    stationFill: T.white,
    stationRing: T.base,
    yellow: T.yellow,
    yellowHi: T.yellowHover,
  }
}
