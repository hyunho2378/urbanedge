import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ArrowLeft, Check, Copy, Download, Mail, MessageSquare, X as CloseIcon } from 'lucide-react'
import { cx } from '../components/cx.js'
import { Bi, LangContext, pickLang, useLangValue } from '../components/Bi.jsx'
import { GLYPHS } from './glyphs.js'
import { buildTargets, copyText, isIOS, isMobileUA, saveImageFile } from './channels.js'

const INSTAGRAM = { handle: '@__urbanedge', url: 'https://www.instagram.com/__urbanedge/' }
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

// 채널 이름은 영한 쌍으로 둔다(Bi로 그리고, aria-label은 useLangValue로 고른다).
const CH = {
  instagram: { en: 'Instagram', ko: '인스타그램' },
  kakao: { en: 'Kakao', ko: '카카오톡', aria: 'KakaoTalk' },
  whatsapp: { en: 'WhatsApp', ko: '왓츠앱' },
  line: { en: 'LINE', ko: '라인' },
  x: { en: 'X', ko: 'X' },
  facebook: { en: 'Facebook', ko: '페이스북' },
  telegram: { en: 'Telegram', ko: '텔레그램' },
  messages: { en: 'Messages', ko: '문자' },
  email: { en: 'Email', ko: '이메일' },
}
const NOTES = {
  copied: { en: 'Link copied.', ko: '링크를 복사했어요.' },
  saved: { en: 'Image saved.', ko: '이미지를 저장했어요.' },
  copyFailed: { en: 'Copy failed. Select the link and copy it by hand.', ko: '복사하지 못했어요. 링크를 직접 선택해 복사해 주세요.' },
  saveFailed: { en: 'Save failed. Press and hold the card to save it.', ko: '저장하지 못했어요. 카드를 길게 눌러 저장해 주세요.' },
}

function Glyph({ name, className }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={cx('h-24 w-24 shrink-0 fill-current', className)}>
      <path d={GLYPHS[name]} />
    </svg>
  )
}

function useMedia(query) {
  const [m, setM] = useState(() => (typeof window === 'undefined' ? false : window.matchMedia(query).matches))
  useEffect(() => {
    const mq = window.matchMedia(query)
    const on = () => setM(mq.matches)
    on()
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [query])
  return m
}

// 카드 미리보기. Blob이면 객체 주소를 만들고 닫을 때 해제한다.
function useImageUrl(image) {
  const [url, setUrl] = useState(null)
  useEffect(() => {
    if (!image) return setUrl(null)
    if (typeof image === 'string') return setUrl(image)
    let made
    if (typeof Blob !== 'undefined' && image instanceof Blob) {
      made = URL.createObjectURL(image)
      setUrl(made)
    } else if (typeof image.toDataURL === 'function') {
      setUrl(image.toDataURL('image/png'))
    }
    return () => made && URL.revokeObjectURL(made)
  }, [image])
  return url
}

// 채널 하나. 아이콘 아래에 짧은 이름. 가장 중요한 하나(Instagram)만 노랑 면이다.
function Channel({ ch, hot, href, onClick, kiosk, onNavigate, children }) {
  const lang = useLangValue()
  const label = CH[ch].aria || pickLang(lang, CH[ch].en, CH[ch].ko)
  const cls = cx(
    'ue-press group flex min-w-0 flex-col items-center gap-8 rounded-lg px-4 py-10 text-center transition-[transform,opacity,background-color] duration-fast ease-out',
    kiosk ? 'min-h-touch' : 'min-h-56',
    'hover:bg-tint',
  )
  const icon = (
    <span className={cx('flex items-center justify-center rounded-pill', kiosk ? 'h-72 w-72' : 'h-48 w-48', hot ? 'bg-yellow text-text-onYellow' : 'bg-bg-raised text-text-pri')}>{children}</span>
  )
  const name = <Bi en={CH[ch].en} ko={CH[ch].ko} inline className={cx('font-ui font-medium text-text-sec', kiosk ? 'text-k-caption' : 'text-caption')} />
  if (href) {
    const ext = /^https?:/.test(href)
    return (
      <a className={cls} data-share-item="" aria-label={label} href={href} {...(ext ? { target: '_blank', rel: 'noopener noreferrer' } : {})} onClick={onNavigate}>
        {icon}
        {name}
      </a>
    )
  }
  return (
    <button type="button" className={cls} data-share-item="" aria-label={label} onClick={onClick}>
      {icon}
      {name}
    </button>
  )
}

// 인스타그램과 카카오톡 안내. 한 가지 행동(앱 열기)만 크게 둔다.
function Guide({ kind, image, previewUrl, instagram, onBack, onOpen }) {
  const ig = kind === 'instagram'
  const steps = ig
    ? [
        image ? { en: 'Card saved to your device.', ko: '카드를 기기에 저장했어요.' } : { en: 'Link copied.', ko: '링크를 복사했어요.' },
        { en: 'Open Instagram and swipe to Story.', ko: '인스타그램을 열고 스토리로 넘어가세요.' },
        { en: 'Pick the card and tag @__urbanedge.', ko: '앨범에서 카드를 고르고 @__urbanedge를 태그하세요.' },
      ]
    : [
        { en: 'Link copied.', ko: '링크를 복사했어요.' },
        { en: 'Open KakaoTalk, pick a chat, and paste.', ko: '카카오톡에서 채팅방을 고르고 붙여넣으세요.' },
      ]
  return (
    <div className="flex flex-col gap-16 px-20 pb-20">
      <button type="button" data-share-item="" onClick={onBack} className="ue-press -ml-8 inline-flex min-h-48 items-center gap-8 self-start rounded-md px-8 text-text-sec hover:text-text-pri">
        <ArrowLeft className="h-20 w-20" aria-hidden="true" />
        <Bi en="Back" ko="뒤로" inline className="t-caption" />
      </button>
      <h3 className="t-subhead">{ig ? <Bi en="Post it to Instagram" ko="인스타그램에 올리기" /> : <Bi en="Send it on KakaoTalk" ko="카카오톡으로 보내기" />}</h3>
      {ig && previewUrl && <img src={previewUrl} alt="" style={{ maxHeight: 160 }} className="w-auto self-center rounded-md shadow-lift" />}
      <ol className="flex flex-col gap-12">
        {steps.map((s, i) => (
          <li key={s.en} className="flex items-start gap-12">
            <span className={cx('mt-2 flex h-24 w-24 shrink-0 items-center justify-center rounded-pill text-label font-semibold', i === 0 ? 'bg-yellow text-text-onYellow' : 'bg-bg-raised text-text-pri')}>
              {i === 0 ? <Check className="h-16 w-16" aria-hidden="true" /> : i + 1}
            </span>
            <Bi en={s.en} ko={s.ko} className="t-body text-text-sec" />
          </li>
        ))}
      </ol>
      {ig && image && isIOS() && <Bi en="On iPhone, press and hold the card, then tap Add to Photos." ko="아이폰은 카드를 길게 누른 뒤 사진에 추가를 누르세요." className="t-caption text-text-meta" />}
      <button type="button" data-share-item="" onClick={onOpen} className="ue-press inline-flex min-h-48 items-center justify-center gap-8 self-start rounded-md bg-yellow px-24 font-ui font-semibold text-text-onYellow hover:bg-yellow-hover">
        <Glyph name={ig ? 'instagram' : 'kakaotalk'} className="h-20 w-20" />
        {ig ? <Bi en="Open Instagram" ko="인스타그램 열기" inline /> : <Bi en="Open KakaoTalk" ko="카카오톡 열기" inline />}
      </button>
      {ig && (
        <a href={instagram.url} target="_blank" rel="noopener noreferrer" data-share-item="" className="t-caption self-start text-text-sec underline underline-offset-4 hover:text-text-pri">
          <Bi en={`Open the shop profile ${instagram.handle}`} ko={`매장 프로필 ${instagram.handle} 열기`} inline />
        </a>
      )}
    </div>
  )
}

// ShareSheet({ open, onClose, url, title, text, image, lang, size, placement, anchorRef, portal, instagram, fileName })
//  화면 중앙의 작은 대화상자(모바일, 앵커가 없을 때)와 트리거 옆 팝오버(데스크톱). 하단 시트를 쓰지 않는다.
//  내용: 제목, 카드 미리보기(image가 있을 때), 채널 한 줄, 링크 복사. 나머지 채널은 "More"로 펼친다.
//  image는 Blob, canvas 또는 URL. lang을 주면 그 언어로 고정하고, 없으면 LangContext를 따른다. 문구는 Bi로 그린다.
export function ShareSheet({
  open,
  onClose,
  url = typeof window !== 'undefined' ? window.location.href : '',
  title = 'UrbanEdge Metrography',
  text = '',
  image,
  lang,
  size = 'md',
  placement = 'auto',
  anchorRef,
  portal = true,
  instagram = INSTAGRAM,
  fileName = 'urbanedge',
}) {
  const ctxLang = useLangValue()
  const L = lang || ctxLang
  const desktop = useMedia('(min-width: 768px)')
  const kiosk = size === 'kiosk'
  const titleId = useId()
  const panelRef = useRef(null)
  const returnRef = useRef(null)
  const [view, setView] = useState('main')
  const [more, setMore] = useState(false)
  const [note, setNote] = useState(null)
  const [pos, setPos] = useState(null)
  const previewUrl = useImageUrl(image)
  const targets = useMemo(() => buildTargets({ url, title, text }), [url, title, text])
  const popover = placement === 'popover' || (placement === 'auto' && desktop && !!anchorRef?.current)

  useEffect(() => {
    if (!open) return
    returnRef.current = document.activeElement
    setView('main')
    setMore(false)
    setNote(null)
  }, [open])

  // 스크롤 잠금(대화상자일 때), 첫 채널로 포커스 이동, 닫을 때 포커스 복귀
  useEffect(() => {
    if (!open) return
    const html = document.documentElement
    const prev = html.style.overflow
    if (!popover) html.style.overflow = 'hidden'
    const f = setTimeout(() => panelRef.current?.querySelector('[data-share-item]')?.focus({ preventScroll: true }), 50)
    return () => {
      clearTimeout(f)
      html.style.overflow = prev
      const back = anchorRef?.current || returnRef.current
      if (back && typeof back.focus === 'function') back.focus({ preventScroll: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, popover])

  // 팝오버 위치(트리거 아래, 모자라면 위). 뷰포트 밖으로 나가지 않는다.
  useLayoutEffect(() => {
    if (!open || !popover) return setPos(null)
    const calc = () => {
      const a = anchorRef?.current
      if (!a) return setPos(null)
      const r = a.getBoundingClientRect()
      const width = Math.min(380, window.innerWidth - 24)
      const left = Math.min(Math.max(r.right - width, 12), window.innerWidth - width - 12)
      const below = window.innerHeight - r.bottom
      const placeBelow = below > 460 || below >= r.top
      setPos(placeBelow ? { left, width, top: r.bottom + 12, maxH: below - 24 } : { left, width, bottom: window.innerHeight - r.top + 12, maxH: r.top - 24 })
    }
    calc()
    window.addEventListener('resize', calc)
    window.addEventListener('scroll', calc, true)
    return () => {
      window.removeEventListener('resize', calc)
      window.removeEventListener('scroll', calc, true)
    }
  }, [open, popover, anchorRef])

  const doCopy = async () => {
    const ok = await copyText(url)
    setNote(ok ? 'copied' : 'copyFailed')
    return ok
  }
  const doSave = async () => {
    try {
      const ok = await saveImageFile(image, fileName)
      setNote(ok ? 'saved' : 'saveFailed')
      return ok
    } catch {
      setNote('saveFailed')
      return false
    }
  }
  const openApp = (scheme, fallbackUrl) => {
    if (!isMobileUA()) {
      window.open(fallbackUrl, '_blank', 'noopener,noreferrer')
      return
    }
    const t = setTimeout(() => {
      if (document.visibilityState === 'visible') window.open(fallbackUrl, '_blank', 'noopener,noreferrer')
    }, 1100)
    document.addEventListener('visibilitychange', () => clearTimeout(t), { once: true })
    window.location.href = scheme
  }
  const onInstagram = async () => {
    const ok = image ? await doSave() : await doCopy()
    if (ok === false) return
    setNote(null)
    setView('instagram')
  }
  const onKakao = async () => {
    if (await doCopy()) {
      setNote(null)
      setView('kakao')
    }
  }

  // 키보드: Tab 가두기, Esc 닫기, 채널 줄 화살표 이동
  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.stopPropagation()
      onClose?.()
      return
    }
    if (e.key === 'Tab') {
      const nodes = [...panelRef.current.querySelectorAll(FOCUSABLE)].filter((n) => n.offsetParent !== null || n === document.activeElement)
      if (!nodes.length) return
      const first = nodes[0]
      const last = nodes[nodes.length - 1]
      if (e.shiftKey && (document.activeElement === first || document.activeElement === panelRef.current)) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
      return
    }
    if (!['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) return
    const row = document.activeElement?.closest?.('[data-share-row]')
    if (!row) return
    const items = [...panelRef.current.querySelectorAll('[data-share-row] [data-share-item]')]
    const i = items.indexOf(document.activeElement)
    if (i < 0) return
    let n = i
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') n = Math.min(i + 1, items.length - 1)
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') n = Math.max(i - 1, 0)
    if (e.key === 'Home') n = 0
    if (e.key === 'End') n = items.length - 1
    e.preventDefault()
    items[n].focus()
  }

  if (!open || typeof document === 'undefined') return null

  const iconSize = kiosk ? 'h-32 w-32' : 'h-24 w-24'
  const clearNote = () => setNote(null)
  const panelStyle = popover
    ? { width: pos ? pos.width : 380, maxHeight: pos ? pos.maxH : '86dvh', ...(pos ? { position: 'fixed', left: pos.left, top: pos.top, bottom: pos.bottom } : {}) }
    : { width: 'min(100%, 380px)', maxHeight: '86dvh' }

  const panel = (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      tabIndex={-1}
      onKeyDown={onKeyDown}
      data-lenis-prevent
      style={panelStyle}
      className="animate-pop-in z-modal flex flex-col overflow-hidden rounded-xl bg-bg-panel text-text-pri shadow-lift outline-none"
    >
      <div className="flex shrink-0 items-center justify-between gap-12 px-20 pb-4 pt-16">
        <h2 id={titleId} className={cx('t-subhead', kiosk && 'text-k-h3')}>
          {image ? <Bi en="Share this ticket" ko="승차권 공유" /> : <Bi en="Share" ko="공유" />}
        </h2>
        <button type="button" onClick={onClose} aria-label={pickLang(L, 'Close', '닫기')} className="ue-press -mr-8 flex h-48 w-48 items-center justify-center rounded-pill text-text-sec hover:bg-tint hover:text-text-pri">
          <CloseIcon className="h-20 w-20" aria-hidden="true" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {view !== 'main' ? (
          <Guide
            kind={view}
            image={image}
            previewUrl={previewUrl}
            instagram={instagram}
            onBack={() => setView('main')}
            onOpen={() => (view === 'instagram' ? openApp('instagram://story-camera', instagram.url) : openApp('kakaotalk://launch', 'https://www.kakaocorp.com/page/service/service/KakaoTalk'))}
          />
        ) : (
          <div className="flex flex-col gap-16 px-20 pb-20">
            {previewUrl && (
              <div className="relative flex justify-center pb-4 pt-8">
                <img src={previewUrl} alt={title} style={{ maxHeight: 200 }} className="w-auto -rotate-2 rounded-md shadow-lift" />
                <span aria-hidden="true" className="absolute left-1/2 top-4 h-16 w-96 -translate-x-1/2 rotate-3 bg-yellow" />
              </div>
            )}
            <div data-share-row className="grid grid-cols-5 gap-4">
              <Channel ch="instagram" hot kiosk={kiosk} onClick={onInstagram}>
                <Glyph name="instagram" className={iconSize} />
              </Channel>
              <Channel ch="kakao" kiosk={kiosk} onClick={onKakao}>
                <Glyph name="kakaotalk" className={iconSize} />
              </Channel>
              <Channel ch="whatsapp" kiosk={kiosk} href={targets.whatsapp} onNavigate={clearNote}>
                <Glyph name="whatsapp" className={iconSize} />
              </Channel>
              <Channel ch="line" kiosk={kiosk} href={targets.line} onNavigate={clearNote}>
                <Glyph name="line" className={iconSize} />
              </Channel>
              <Channel ch="x" kiosk={kiosk} href={targets.x} onNavigate={clearNote}>
                <Glyph name="x" className={iconSize} />
              </Channel>
            </div>
            {more && (
              <div data-share-row className="grid grid-cols-5 gap-4">
                <Channel ch="facebook" kiosk={kiosk} href={targets.facebook} onNavigate={clearNote}>
                  <Glyph name="facebook" className={iconSize} />
                </Channel>
                <Channel ch="telegram" kiosk={kiosk} href={targets.telegram} onNavigate={clearNote}>
                  <Glyph name="telegram" className={iconSize} />
                </Channel>
                <Channel ch="messages" kiosk={kiosk} href={targets.messages} onNavigate={clearNote}>
                  <MessageSquare className={iconSize} aria-hidden="true" />
                </Channel>
                <Channel ch="email" kiosk={kiosk} href={targets.email} onNavigate={clearNote}>
                  <Mail className={iconSize} aria-hidden="true" />
                </Channel>
              </div>
            )}
            <div className="flex items-center justify-between gap-12">
              <button type="button" onClick={() => setMore((m) => !m)} aria-expanded={more} className="t-caption min-h-48 text-text-sec underline underline-offset-4 hover:text-text-pri">
                {more ? <Bi en="Fewer apps" ko="앱 접기" inline /> : <Bi en="More apps" ko="앱 더 보기" inline />}
              </button>
              {image && (
                <button type="button" onClick={doSave} className="t-caption inline-flex min-h-48 items-center gap-8 text-text-sec hover:text-text-pri">
                  <Download className="h-16 w-16" aria-hidden="true" />
                  <Bi en="Save image" ko="이미지 저장" inline />
                </button>
              )}
            </div>
            {/* 링크 한 줄과 복사 */}
            <div className="flex items-center gap-12 rounded-lg bg-bg-raised py-8 pl-16 pr-8">
              <span className="min-w-0 flex-1 truncate t-caption text-text-sec" title={url}>
                {url}
              </span>
              <button type="button" data-share-item="" onClick={doCopy} className="ue-press inline-flex min-h-48 shrink-0 items-center gap-8 rounded-md px-16 font-ui font-semibold text-yellow hover:bg-tint">
                <Copy className="h-16 w-16" aria-hidden="true" />
                <Bi en="Copy" ko="복사" inline />
              </button>
            </div>
          </div>
        )}
        <p role="status" aria-live="polite" className={cx('px-20 pb-16 t-caption text-text-sec', !note && 'sr-only')}>
          {note ? <Bi en={NOTES[note].en} ko={NOTES[note].ko} /> : ''}
        </p>
      </div>
    </div>
  )

  const wrapper = (
    <LangContext.Provider value={L}>
      <div className="fixed inset-0 z-modal" data-ue-share="">
        <div aria-hidden="true" onClick={onClose} className={cx('absolute inset-0 animate-fade-in', popover ? '' : 'bg-scrim')} />
        {popover && pos ? (
          panel
        ) : (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-24">
            <div className="pointer-events-auto flex max-h-full w-full justify-center">{panel}</div>
          </div>
        )}
      </div>
    </LangContext.Provider>
  )
  return portal ? createPortal(wrapper, document.body) : wrapper
}
