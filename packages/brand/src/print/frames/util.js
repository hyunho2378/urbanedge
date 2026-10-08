// frames/util.js: 프레임 정의가 함께 쓰는 보조 함수
export function grid(p, x, y, cols, rows, w, h, gx, gy, o = {}) {
  let i = o.start || 0
  const rects = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const rx = x + c * (w + gx)
      const ry = y + r * (h + gy)
      p.photo(i++, rx, ry, w, h, o)
      rects.push([rx, ry, w, h])
    }
  }
  return rects
}

export const TWIN = { w: 600, h: 1800 }
export const FULL = { w: 1200, h: 1800 }
