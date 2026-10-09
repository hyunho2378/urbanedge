// ops/api.js: 운영 서버(apps/server)와 말하는 얇은 클라이언트.
// 주소와 키는 빌드할 때 환경 변수로 넣는다.
//   VITE_API_URL     예) https://urbanedge-api.onrender.com  (없으면 서버 없이 이 탭 메모리에서만 동작한다)
//   VITE_DEVICE_KEY  키오스크가 결제와 촬영 기록을 쓸 때 보내는 키(서버의 DEVICE_KEY)
//   VITE_ADMIN_KEY   운영 화면이 상품, 쿠폰, 환불, 설정을 바꿀 때 보내는 키(서버의 ADMIN_KEY)
// 주의: Vite 환경 변수는 화면 코드에 그대로 들어간다. 시연 빌드용이며, 실제 운영에서는 로그인 뒤에 관리자 키를 내려받는 방식으로 바꾼다.
const env = import.meta.env || {}
export const API_URL = (env.VITE_API_URL || '').replace(/\/$/, '')
export const apiEnabled = !!API_URL

export class ApiError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

// kind: 'device' | 'admin' | 'read'
export async function api(method, path, body, kind = 'read') {
  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (kind === 'device' && env.VITE_DEVICE_KEY) headers['X-Device-Key'] = env.VITE_DEVICE_KEY
  if (kind === 'admin' && env.VITE_ADMIN_KEY) headers['X-Admin-Key'] = env.VITE_ADMIN_KEY
  // 기기 쓰기는 관리자 키도 받아 준다. 기기 키가 없는 빌드(운영 화면만)에서도 쓸 수 있게 둘 다 보낸다.
  if (kind === 'device' && !env.VITE_DEVICE_KEY && env.VITE_ADMIN_KEY) headers['X-Admin-Key'] = env.VITE_ADMIN_KEY
  const res = await fetch(API_URL + path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) })
  let data = null
  try {
    data = await res.json()
  } catch {
    /* 본문이 없을 수 있다 */
  }
  if (!res.ok) throw new ApiError(res.status, data?.error || `HTTP ${res.status}`)
  return data
}

// 실시간 스트림(SSE). 끊기면 브라우저가 알아서 다시 붙는다.
export function openStream(handlers) {
  if (typeof EventSource === 'undefined') return () => {}
  const es = new EventSource(API_URL + '/api/stream')
  for (const [type, fn] of Object.entries(handlers)) {
    if (type === 'open') es.onopen = () => fn()
    else if (type === 'error') es.onerror = () => fn()
    else
      es.addEventListener(type, (e) => {
        try {
          fn(JSON.parse(e.data))
        } catch {
          /* 깨진 메시지는 무시한다 */
        }
      })
  }
  return () => es.close()
}

// 보내기 줄. 순서를 지키고, 서버에 닿지 않거나 5xx이면 간격을 늘려 가며 다시 보낸다. 4xx는 버린다(다시 보내도 같다).
// localStorage는 쓰지 않으므로 탭을 닫으면 아직 못 보낸 것은 사라진다.
export function createQueue({ onChange } = {}) {
  const items = []
  let running = false
  let failures = 0
  let lastError = null
  const emit = () => onChange?.({ queued: items.length, failing: failures > 0, lastError })
  async function run() {
    if (running) return
    running = true
    while (items.length) {
      const it = items[0]
      try {
        const out = await api(it.method, it.path, it.body, it.kind)
        items.shift()
        failures = 0
        lastError = null
        it.done?.(out)
      } catch (e) {
        if (e instanceof ApiError && e.status >= 400 && e.status < 500 && e.status !== 429) {
          items.shift()
          lastError = `${e.status} ${e.message}`
          it.fail?.(e)
        } else {
          failures += 1
          lastError = e.message
          emit()
          await new Promise((r) => setTimeout(r, Math.min(15000, 1000 * 2 ** Math.min(failures, 4))))
          continue
        }
      }
      emit()
    }
    running = false
    emit()
  }
  return {
    push(method, path, body, kind, cbs = {}) {
      if (items.length >= 800) items.shift()
      items.push({ method, path, body, kind, ...cbs })
      emit()
      run()
    },
    get size() {
      return items.length
    },
  }
}

// 서버가 만든 파일을 내려받는다(관리자 키). 파일 이름은 서버가 보낸 한글 이름(Content-Disposition filename*)을 쓴다.
export async function downloadFile(path, fallbackName = 'export') {
  const headers = {}
  if (env.VITE_ADMIN_KEY) headers['X-Admin-Key'] = env.VITE_ADMIN_KEY
  const res = await fetch(API_URL + path, { headers })
  if (!res.ok) {
    let msg = `HTTP ${res.status}`
    try { msg = (await res.json())?.error || msg } catch { /* 본문 없음 */ }
    throw new ApiError(res.status, msg)
  }
  const cd = res.headers.get('Content-Disposition') || ''
  const star = /filename\*=UTF-8''([^;]+)/i.exec(cd)
  const name = star ? decodeURIComponent(star[1]) : (/filename="?([^";]+)"?/i.exec(cd) || [])[1] || fallbackName
  const url = URL.createObjectURL(await res.blob())
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
  return name
}
