// channels.js: 공유 채널 정의와 주소 조립. 시스템 공유창은 쓰지 않는다. 모든 채널은 웹 주소 또는 앱 주소 체계(sms:, mailto:)로 연다.
const enc = encodeURIComponent

export function buildTargets({ url = '', title = '', text = '' }) {
  const body = [text || title, url].filter(Boolean).join(' ')
  return {
    x: `https://twitter.com/intent/tweet?text=${enc(text || title)}&url=${enc(url)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`,
    whatsapp: `https://wa.me/?text=${enc(body)}`,
    line: `https://social-plugins.line.me/lineit/share?url=${enc(url)}&text=${enc(text || title)}`,
    telegram: `https://t.me/share/url?url=${enc(url)}&text=${enc(text || title)}`,
    messages: `sms:?&body=${enc(body)}`,
    email: `mailto:?subject=${enc(title)}&body=${enc([text, url].filter(Boolean).join('\n\n'))}`,
  }
}

export const isMobileUA = () => typeof navigator !== 'undefined' && /android|iphone|ipad|ipod/i.test(navigator.userAgent)
export const isIOS = () => typeof navigator !== 'undefined' && /iphone|ipad|ipod/i.test(navigator.userAgent)

export async function copyText(text) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    /* 아래 대체 경로로 */
  }
  try {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.setAttribute('readonly', '')
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(ta)
    return ok
  } catch {
    return false
  }
}

// image: Blob | canvas | URL 문자열 -> Blob
export async function toBlob(image) {
  if (!image) return null
  if (typeof Blob !== 'undefined' && image instanceof Blob) return image
  if (typeof image.toBlob === 'function') return new Promise((res) => image.toBlob((b) => res(b), 'image/png'))
  if (typeof image === 'string') {
    const r = await fetch(image)
    return r.blob()
  }
  return null
}

export async function saveImageFile(image, name = 'urbanedge') {
  const blob = await toBlob(image)
  if (!blob) return false
  const ext = blob.type === 'image/png' ? 'png' : blob.type === 'image/webp' ? 'webp' : 'jpg'
  const href = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = href
  a.download = `${name}.${ext}`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(href), 4000)
  return true
}
