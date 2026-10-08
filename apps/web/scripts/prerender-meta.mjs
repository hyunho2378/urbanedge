// prerender-meta.mjs: vite build 뒤에 실행한다. 경로마다 dist/<route>/index.html 사본을 만들고
// title, description, og:*, twitter:* 와 아이콘 링크를 경로별로 바꿔 넣는다. 카카오톡과 인스타그램 링크 미리보기는
// 자바스크립트를 실행하지 않으므로 정적 HTML 안에 메타 태그가 있어야 한다.
// 절대 주소 기준은 환경변수 VITE_SITE_URL(없으면 https://urbanedge.vercel.app).
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadEnv } from 'vite'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
const env = { ...loadEnv('production', root, 'VITE_'), ...process.env }
const SITE_URL = (env.VITE_SITE_URL || 'https://urbanedge.vercel.app').replace(/\/+$/, '')

const NAME = 'UrbanEdge Metrography'
// 문구는 영어가 먼저이고 한국어는 뒤에 따로 쓴다. 사실은 data/site.js의 것만 쓴다.
const ROUTES = [
  {
    path: '',
    og: 'home',
    title: NAME,
    description: 'Self-service photo studio in Hwangridan-gil, Gyeongju. Subway, Karaoke and Retro rooms, open 10:00 to 24:00. 경주 황리단길 셀프 사진관.',
    alt: 'UrbanEdge photo strips and a yellow caution tape band: Explore Gyeongju, one station at a time.',
  },
  {
    path: 'rooms',
    og: 'rooms',
    title: `Platforms | ${NAME}`,
    description: 'Three photo rooms at UrbanEdge: Subway, Karaoke and Retro. 촬영 방 세 곳.',
    alt: 'UrbanEdge photo strips with platform color badges.',
  },
  {
    path: 'guide',
    og: 'guide',
    title: `How to | ${NAME}`,
    description: 'The camera sits below the screen. Pick 4 or 8 cuts, choose a frame, pose, and print. 이용 안내.',
    alt: 'A kiosk monitor with an arrow pointing to the lens below it.',
  },
  {
    path: 'visit',
    og: 'visit',
    title: `Visit | ${NAME}`,
    description: 'GY-01 UrbanEdge, 6, Poseok-ro 1079beon-gil, Gyeongju. Open 10:00 to 24:00. 경북 경주시 포석로1079번길 6.',
    alt: 'GY-01 UrbanEdge station sign with printed photo strips.',
  },
  {
    path: 'gallery',
    og: 'gallery',
    title: `Gallery | ${NAME}`,
    description: 'Prints from UrbanEdge. 어반엣지 인화물.',
    alt: 'A collage of UrbanEdge prints in several frames.',
  },
  // 경주 메트로 화면(노선도, 메트로 패스, 역 상세)은 전용 카드가 생기기 전까지 홈 카드를 쓴다.
  // 방 상세(/rooms/:id)는 승강장 이름만 바꾸고 rooms 카드 이미지를 쓴다.
  ...[
    ['subway', 'Platform 1, Subway Shot', '1번 승강장, 지하철 샷'],
    ['karaoke', 'Platform 2, Karaoke Shot', '2번 승강장, 노래방 샷'],
    ['retro', 'Platform 3, Retro Shot', '3번 승강장, 레트로 샷'],
  ].map(([id, en, ko]) => ({
    path: `rooms/${id}`,
    og: 'rooms',
    title: `${en} | ${NAME}`,
    description: `${en} at GY-01 UrbanEdge, Gyeongju. ${ko}.`,
    alt: 'UrbanEdge photo strips with platform color badges.',
  })),
]

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function stripOld(html) {
  return html
    .replace(/<title>[\s\S]*?<\/title>\s*/i, '')
    .replace(/<meta\s+[^>]*name=["']description["'][^>]*>\s*/gi, '')
    .replace(/<meta\s+[^>]*property=["']og:[^"']+["'][^>]*>\s*/gi, '')
    .replace(/<meta\s+[^>]*name=["']twitter:[^"']+["'][^>]*>\s*/gi, '')
    .replace(/<link\s+[^>]*rel=["'](?:canonical|icon|shortcut icon|apple-touch-icon|manifest)["'][^>]*>\s*/gi, '')
}

function headBlock(r) {
  const url = `${SITE_URL}/${r.path}`.replace(/\/$/, r.path ? '' : '/')
  const image = `${SITE_URL}/og/${r.og}.png`
  return `
    <title>${esc(r.title)}</title>
    <meta name="description" content="${esc(r.description)}" />
    <link rel="canonical" href="${url}" />
    <link rel="icon" href="/icons/favicon.ico" sizes="48x48" />
    <link rel="icon" type="image/svg+xml" href="/icons/icon.svg" />
    <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32.png" />
    <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
    <link rel="manifest" href="/icons/manifest.webmanifest" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="${NAME}" />
    <meta property="og:title" content="${esc(r.title)}" />
    <meta property="og:description" content="${esc(r.description)}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:image:type" content="image/png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${esc(r.alt)}" />
    <meta property="og:locale" content="en_US" />
    <meta property="og:locale:alternate" content="ko_KR" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(r.title)}" />
    <meta name="twitter:description" content="${esc(r.description)}" />
    <meta name="twitter:image" content="${image}" />
    <meta name="twitter:image:alt" content="${esc(r.alt)}" />
`
}

const indexPath = join(dist, 'index.html')
if (!existsSync(indexPath)) {
  console.error('prerender-meta: dist/index.html 이 없다. vite build를 먼저 실행한다.')
  process.exit(1)
}
const base = stripOld(readFileSync(indexPath, 'utf8'))
let count = 0
for (const r of ROUTES) {
  const html = base.replace(/<head([^>]*)>/i, (m) => `${m}${headBlock(r)}`)
  const out = r.path ? join(dist, r.path, 'index.html') : indexPath
  mkdirSync(dirname(out), { recursive: true })
  writeFileSync(out, html)
  count++
  console.log(`prerender-meta: ${r.path || '/'} -> ${out.replace(root + '/', '')} (og:image ${SITE_URL}/og/${r.og}.png)`)
}
console.log(`prerender-meta: ${count}개 경로, 기준 주소 ${SITE_URL}`)
