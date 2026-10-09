// daily.js: 채널(웹사이트, 제휴처)마다 날짜별로 새로 나오는 쿠폰 코드.
// 코드 = makeCoupon(HMAC-SHA256(비밀값, 채널|날짜)의 앞 7바이트를 알파벳 32자로 바꾼 것). 한국 시간 자정에 바뀌고 손으로 고칠 일이 없다.
// 비밀값이 없으면 코드를 만들 수 없다(추측 가능한 코드가 나가지 않게 한다).
import { createHmac } from 'node:crypto'
import { ALPHABET, makeCoupon } from './coupon.js'
import { TZ } from './db.js'

export function dailyCode(secret, channel, date) {
  if (!secret) throw Object.assign(new Error('쿠폰 비밀값(COUPON_SECRET 또는 ADMIN_KEY)이 설정되어 있지 않다.'), { status: 503 })
  const h = createHmac('sha256', secret).update(`${channel}|${date}`).digest()
  let s = ''
  for (let i = 0; i < 7; i++) s += ALPHABET[h[i] % 32]
  return makeCoupon(s)
}

const fmt = (d, opts) => new Intl.DateTimeFormat('en-CA', { timeZone: TZ, ...opts }).format(d)
export const kstDate = (d = new Date()) => fmt(d, { year: 'numeric', month: '2-digit', day: '2-digit' })
export const kstHour = (d = new Date()) => Number(new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hour: '2-digit', hourCycle: 'h23' }).format(d))

// 지금 받아 주는 날짜: 오늘, 그리고 새벽 2시(한국 시간) 전까지는 어제 코드도 받는다.
export function activeDates(now = new Date(), graceHour = 2) {
  const today = kstDate(now)
  if (kstHour(now) >= graceHour) return [today]
  return [today, kstDate(new Date(now.getTime() - 24 * 3600_000))]
}
