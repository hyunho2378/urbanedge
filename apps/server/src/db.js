// db.js: Postgres 연결, 처음 시작할 때 테이블 만들기(여러 번 실행해도 안전), 기본 상품과 프레임 채우기.
import pg from 'pg'

const { Pool } = pg

export const TZ = 'Asia/Seoul'
export const BOOTHS = [
  { id: 'subway', name: '지하철 샷' },
  { id: 'karaoke', name: '노래방 샷' },
  { id: 'retro', name: '레트로 샷' },
]
// 승강장 번호: 1 지하철, 2 노래방, 3 레트로
export const DEFAULT_FRAME_NAMES = {
  'classic-white': '클래식 화이트', 'classic-black': '클래식 블랙', 'classic-blue': '클래식 블루', reel: '릴 컷', signature: '시그니처 컷',
  poster: '포스터 컷', crosswalk: '횡단보도 컷', layer: '레이어 컷', stack: '스택 컷', crossroad: '교차로 컷', route: '노선 컷',
  tape: '테이프 컷', train: '열차 컷', ticket: '승차권', 'ticket-night': '야간 승차권', pill: '노선 알약',
}
export const DEFAULT_CAMERA = { mirror: true, zoom: 1, brightness: 1, contrast: 1, warmth: 0, filter: 'original' }
// @urbanedge/brand의 FRAMES id. 서버는 브랜드 패키지를 가져오지 않으므로 목록을 여기에 둔다(새 기본 프레임이 생기면 한 줄 추가).
export const DEFAULT_FRAME_IDS = ['classic-white', 'classic-black', 'classic-blue', 'signature', 'ticket', 'ticket-night', 'pill', 'poster', 'route', 'crosswalk', 'reel', 'layer', 'train', 'tape', 'crossroad', 'stack']
export const DEFAULT_PRODUCTS = [
  { id: 'strip4', name: { en: '4-cut strip', ko: '4컷 스트립' }, cuts: 4, prints: 2, price: 5000 },
  { id: 'grid4', name: { en: '4-cut photo', ko: '4컷 사진' }, cuts: 4, prints: 2, price: 7000 },
  { id: 'grid8', name: { en: '8-cut photo', ko: '8컷 사진' }, cuts: 8, prints: 2, price: 9000 },
  { id: 'premium', name: { en: 'Platform frame', ko: '승강장 프레임' }, cuts: 4, prints: 4, price: 10000 },
]

export function makePool(url = process.env.DATABASE_URL) {
  if (!url) throw new Error('DATABASE_URL이 없다.')
  const local = /localhost|127\.0\.0\.1/.test(url)
  return new Pool({
    connectionString: url,
    max: Number(process.env.PG_POOL_MAX) || 10,
    ssl: local || process.env.PGSSL === 'off' ? false : { rejectUnauthorized: false },
  })
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS booths (
  id text PRIMARY KEY,
  name text NOT NULL,
  online boolean NOT NULL DEFAULT true,
  step text NOT NULL DEFAULT 'attract',
  lang text NOT NULL DEFAULT 'en',
  camera_active boolean NOT NULL DEFAULT false,
  last_shot timestamptz,
  last_seen timestamptz
);
CREATE TABLE IF NOT EXISTS products (
  id text PRIMARY KEY,
  name jsonb NOT NULL,
  cuts int NOT NULL DEFAULT 4,
  prints int NOT NULL DEFAULT 2,
  price int NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  sort serial
);
CREATE TABLE IF NOT EXISTS frames (
  id text PRIMARY KEY,
  enabled boolean NOT NULL DEFAULT true,
  custom jsonb,
  sort serial
);
CREATE TABLE IF NOT EXISTS coupons (
  code text PRIMARY KEY,
  label text NOT NULL DEFAULT '',
  kind text NOT NULL DEFAULT 'single',
  discount int NOT NULL DEFAULT 0,
  uses int NOT NULL DEFAULT 0,
  max_uses int NOT NULL DEFAULT 0,
  date text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS camera_settings (
  booth text PRIMARY KEY,
  settings jsonb NOT NULL
);
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY,
  booth text NOT NULL,
  ts timestamptz NOT NULL DEFAULT now(),
  method text NOT NULL,
  product text,
  amount int NOT NULL DEFAULT 0,
  discount int NOT NULL DEFAULT 0,
  coupon text,
  cuts int,
  frame_id text,
  status text NOT NULL DEFAULT 'paid',
  refunded_at timestamptz,
  origin text NOT NULL DEFAULT 'kiosk',
  sim boolean NOT NULL DEFAULT false
);
CREATE INDEX IF NOT EXISTS transactions_ts_idx ON transactions (ts DESC);
CREATE INDEX IF NOT EXISTS transactions_booth_ts_idx ON transactions (booth, ts DESC);
CREATE TABLE IF NOT EXISTS files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booth text NOT NULL,
  ts timestamptz NOT NULL DEFAULT now(),
  kind text NOT NULL DEFAULT 'shot',
  thumb text NOT NULL
);
CREATE INDEX IF NOT EXISTS files_booth_ts_idx ON files (booth, ts DESC);
CREATE TABLE IF NOT EXISTS settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL
);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS coupon_channel text;
CREATE TABLE IF NOT EXISTS partners (
  id text PRIMARY KEY,
  label text NOT NULL,
  discount int NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS coupon_redemptions (
  code text PRIMARY KEY,
  tx_id uuid,
  ts timestamptz NOT NULL DEFAULT now()
);
`

export async function migrate(pool) {
  // 서버가 둘 이상 동시에 시작해도 한 번에 하나만 실행되게 잠근다.
  const c = await pool.connect()
  try {
    await c.query('SELECT pg_advisory_lock(7470001)')
    await c.query(SCHEMA)
    for (const b of BOOTHS) {
      await c.query('INSERT INTO booths (id, name) VALUES ($1,$2) ON CONFLICT (id) DO NOTHING', [b.id, b.name])
      await c.query('INSERT INTO camera_settings (booth, settings) VALUES ($1,$2) ON CONFLICT (booth) DO NOTHING', [b.id, DEFAULT_CAMERA])
    }
    const { rows: p } = await c.query('SELECT count(*)::int AS n FROM products')
    if (p[0].n === 0) {
      for (const x of DEFAULT_PRODUCTS) {
        await c.query('INSERT INTO products (id, name, cuts, prints, price) VALUES ($1,$2,$3,$4,$5)', [x.id, x.name, x.cuts, x.prints, x.price])
      }
    }
    const { rows: f } = await c.query('SELECT count(*)::int AS n FROM frames')
    if (f[0].n === 0) {
      for (const id of DEFAULT_FRAME_IDS) await c.query('INSERT INTO frames (id, enabled) VALUES ($1,true)', [id])
    }
    await c.query("INSERT INTO settings (key, value) VALUES ('price', '7000'::jsonb) ON CONFLICT (key) DO NOTHING")
  } finally {
    await c.query('SELECT pg_advisory_unlock(7470001)').catch(() => {})
    c.release()
  }
}
