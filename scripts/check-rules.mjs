// check-rules.mjs: UI.md 10장 금지 목록을 grep으로 점검한다. 위반이 있으면 종료 코드 1.
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, extname } from 'node:path'

const roots = ['apps/web/src', 'apps/kiosk/src', 'packages/design-system/src']
const skipFiles = ['tokens.js', 'tailwind-preset.js']
const rules = [
  ['localStorage/sessionStorage', /\b(localStorage|sessionStorage)\b/],
  ['hex 색 리터럴', /#[0-9a-fA-F]{3,8}\b(?![\w-])/],
  ['rgb/hsl 색 리터럴', /\b(rgba?|hsla?)\(\s*\d/],
  ['native select', /<select[\s>]/],
  ['native date input', /type=["'](date|datetime-local)["']/],
  ['hover scale', /hover:scale-/],
  ['Tailwind 임의값', /\b(?!transition-)[a-z-]+-\[[^\]]+\]/],
  ['이모지', /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/u],
  ['손톱형 보더(좌측 또는 상단 굵은 선)', /\bborder-(l|t)-(2|4|8|\[)/],
  ['시스템 공유창', /navigator\.share\b/],
  ['가벼운 굵기 단독(font-thin/extralight/light)', /\bfont-(thin|extralight|light)\b/],
  ['TypeScript 파일', /^$/],
]
let bad = 0
const walk = (d) => {
  for (const f of readdirSync(d)) {
    const p = join(d, f)
    if (statSync(p).isDirectory()) { walk(p); continue }
    const ext = extname(p)
    if (ext === '.ts' || ext === '.tsx') { console.log(`TypeScript 파일: ${p}`); bad++; continue }
    if (!['.js', '.jsx', '.css'].includes(ext) || skipFiles.includes(f)) continue
    const lines = readFileSync(p, 'utf8').split('\n')
    lines.forEach((line, i) => {
      for (const [name, re] of rules.slice(0, -1)) {
        if (re.test(line) && !line.includes('check-rules:ignore')) { console.log(`${name}: ${p}:${i + 1}: ${line.trim().slice(0, 100)}`); bad++ }
      }
    })
  }
}
roots.forEach(walk)
console.log(bad ? `위반 ${bad}건` : '위반 0건')
process.exit(bad ? 1 : 0)
