import { useEffect, useState } from 'react'

// 오늘의 쿠폰 코드: 서버의 GET /api/coupons/today(channel 'web')에서 받는다. 한국 날짜가 바뀌면 다시 받는다.
const API = (import.meta.env?.VITE_API_URL || 'https://urbanedge-api-fswm.onrender.com').replace(/\/$/, '')
const kstDate = () => new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10)
let cache = null // { date, code }

export async function fetchTodayCode() {
  const d = kstDate()
  if (cache && cache.date === d) return cache.code
  const r = await fetch(`${API}/api/coupons/today`, { headers: { accept: 'application/json' } })
  if (!r.ok) throw new Error('coupon api ' + r.status)
  const j = await r.json()
  const hit = (j.codes || []).find((c) => c.channel === 'web') || (j.codes || [])[0]
  if (!hit?.code) throw new Error('no code')
  cache = { date: d, code: hit.code }
  return hit.code
}

// code: 문자열 또는 null(불러오는 중), failed: 서버에 닿지 못함
export function useTodayCode(fallback) {
  const [state, setState] = useState({ code: null, failed: false })
  useEffect(() => {
    let dead = false
    fetchTodayCode().then((code) => !dead && setState({ code, failed: false })).catch(() => !dead && setState({ code: fallback || null, failed: true }))
    return () => { dead = true }
  }, [fallback])
  return state
}
