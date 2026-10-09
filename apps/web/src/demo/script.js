// demo/script.js: 사이트 시연 대본. 장면은 서로 독립이고, 실패한 장면은 건너뛰고 다음으로 간다.
// 자막은 짧은 정보성 명사구로 쓴다(가운데점과 줄표를 쓰지 않는다).
const TOTAL = 10

export function buildScenes({ t, navigate, lang, setSite, S }) {
  const cap = (n, label, text) => S.setCap({ n, label, text })
  const nowPath = () => window.location.pathname
  const hdrLink = (kit, prefix) => kit.$$('header nav a').find((a) => kit.visible(a) && (a.getAttribute('href') || '').startsWith(prefix))
  const goNav = async (kit, path) => {
    const link = hdrLink(kit, path)
    if (link) await kit.click(link)
    else navigate(path)
    await kit.waitFor(() => nowPath().startsWith(path), 8000)
    await kit.sleep(900)
    window.scrollTo({ top: 0, behavior: 'instant' })
    S.ringEl = null
  }

  return [
    {
      name: '홈 히어로',
      run: async (kit) => {
        if (nowPath() !== '/') { navigate('/'); await kit.waitFor(() => nowPath() === '/', 6000) }
        await kit.scrollToY(0)
        await kit.sleep(900)
        const title = await kit.waitFor(() => kit.$('#hero-title'), 8000)
        cap(1, t('홈 히어로', 'Home hero'), t('슬로건: 시간을 싣고 달리는 열차, 철길 따라 흐르는 우리의 기억', 'Slogan: a train carrying time, our memories along the rails'))
        if (title) await kit.pointAt(title, { dur: 900 })
        await kit.sleep(3400)
        const island = kit.$('section[aria-labelledby="hero-title"] button[aria-expanded]')
        cap(1, t('홈 히어로', 'Home hero'), t('다이내믹 아일랜드: 3개 승강장이 차례로 순환', 'Dynamic Island: three platforms cycling'))
        if (island) {
          await kit.pointAt(island, { dur: 800 })
          await kit.sleep(2600)
          await kit.click(island)
          cap(1, t('홈 히어로', 'Home hero'), t('누르면 펼침: 방 사진과 방 보기 버튼', 'Tap to expand: room photo and View room'))
          await kit.sleep(2200)
          const dots = kit.$$('section[aria-labelledby="hero-title"] [role="group"] button[aria-pressed]')
          for (const d of dots.slice(1, 3)) { await kit.click(d); await kit.sleep(1500) }
          await kit.click(island)
          await kit.sleep(800)
        }
        const go = kit.$('section[aria-labelledby="hero-title"] a[href^="/visit"]')
        cap(1, t('홈 히어로', 'Home hero'), t('길 안내 버튼: 방문 페이지로 연결', 'Directions button: opens the Visit page'))
        if (go) { await kit.pointAt(go, { dur: 800 }); await kit.sleep(2200) }
      },
    },
    {
      name: '타임 플랫폼',
      run: async (kit) => {
        const sec = await kit.waitFor(() => kit.$('#time-title'), 6000)
        cap(2, t('타임 플랫폼', 'Time Platform'), t('들어갈수록 시간이 거꾸로 흐른다: 2026, 2008, 1968', 'Walk in and time runs backward: 2026, 2008, 1968'))
        await kit.scrollToEl(sec, { at: 0.18 })
        await kit.sleep(2000)
        const cards = kit.$$('#time a[href^="/rooms/"]')
        const notes = [
          t('1번 승강장 지하철 샷: 2026 현재', 'Platform 1 Subway Shot: 2026, today'),
          t('2번 승강장 노래방 샷: 2008 추억', 'Platform 2 Karaoke Shot: 2008, memories'),
          t('3번 승강장 레트로 샷: 1968 뿌리', 'Platform 3 Retro Shot: 1968, the roots'),
        ]
        for (let i = 0; i < cards.length && i < 3; i++) {
          cap(2, t('타임 플랫폼', 'Time Platform'), notes[i])
          await kit.pointAt(cards[i], { dur: 800 })
          await kit.sleep(2300)
        }
      },
    },
    {
      name: '방 탐색',
      run: async (kit) => {
        await goNav(kit, '/rooms')
        const rx = await kit.waitFor(() => kit.$('.rx'), 8000)
        cap(3, t('방 탐색', 'Rooms'), t('입구가 기본 선택: 한 화면 안에서 매장 전체 확인', 'Entrance by default: the whole shop in one screen'))
        await kit.sleep(900)
        if (rx) await kit.pointAt(rx, { dur: 900 })
        await kit.sleep(3200)
        const choices = kit.$$('.rx__choice')
        const names = [
          t('입구: 유리문과 볼록거울', 'Entrance: glass door and convex mirrors'),
          t('지하철: 전동차 문과 스테인리스 좌석', 'Subway: train doors and a steel bench'),
          t('노래방: 붉은 타일과 하트 네온', 'Karaoke: red tiles and heart neon'),
          t('레트로: 붉은 커튼과 나무 바닥', 'Retro: red curtain and wooden floor'),
          t('지하철 앞 공간', 'In front of Subway'),
          t('대기 의자', 'Waiting seats'),
          t('전신거울', 'Full-length mirror'),
          t('셔터 포토존', 'Shutter photo spot'),
        ]
        for (let i = 0; i < choices.length; i++) {
          cap(3, t('방 탐색', 'Rooms'), names[i] || choices[i].textContent)
          await kit.click(choices[i])
          await kit.sleep(i < 4 ? 2100 : 1400)
        }
        const sub = kit.byExact('.rx__choice', ['지하철', 'Subway'])
        if (sub) await kit.click(sub)
        cap(3, t('방 탐색', 'Rooms'), t('방 보기 버튼: 방 상세 페이지로 이동', 'View room button: opens the room page'))
        const info = kit.$('.rx__info')
        if (info) { kit.setRing(info); await kit.sleep(1800) }
        const go = kit.$('.rx__go')
        if (go) await kit.click(go)
        await kit.waitFor(() => /^\/rooms\/.+/.test(nowPath()), 8000)
        await kit.sleep(900)
      },
    },
    {
      name: '방 상세',
      run: async (kit) => {
        if (!/^\/rooms\/.+/.test(nowPath())) navigate('/rooms/subway')
        await kit.waitFor(() => kit.$('h1'), 8000)
        await kit.sleep(900)
        await kit.scrollToY(0)
        const h1 = kit.$('h1')
        cap(4, t('방 상세', 'Room page'), t('1번 승강장 지하철 샷: 역명판과 방 사진', 'Platform 1 Subway Shot: station sign and room photo'))
        if (h1) await kit.pointAt(h1, { dur: 800 })
        await kit.sleep(3200)
        const poses = kit.$('#poses')
        if (poses) {
          cap(4, t('방 상세', 'Room page'), t('추천 포즈 안내: 처음 온 방문객의 촬영 가이드', 'Pose guide: shooting tips for first-time visitors'))
          await kit.scrollToEl(poses, { at: 0.12 })
          kit.setRing(poses)
          await kit.sleep(3600)
        }
        const more = kit.$('#more')
        if (more) {
          cap(4, t('방 상세', 'Room page'), t('방 사진 더 보기', 'More room photos'))
          await kit.scrollToEl(more, { at: 0.12 })
          kit.setRing(more)
          await kit.sleep(2600)
        }
        S.ringEl = null
      },
    },
    {
      name: '이용 방법',
      run: async (kit) => {
        await goNav(kit, '/guide')
        const glance = await kit.waitFor(() => kit.$('section[aria-labelledby="guide-glance"]'), 8000)
        cap(5, t('이용 방법', 'How to'), t('방문 여정 5단계: 찾아오기, 도착, 결제, 촬영, 인화물 수령', 'Visit journey in 5 steps: get here, arrive, pay, shoot, collect'))
        await kit.sleep(1500)
        if (glance) { await kit.pointAt(kit.$('div', glance) || glance, { dur: 900 }); await kit.sleep(900) }
        cap(5, t('이용 방법', 'How to'), t('한눈에 보기: 영업시간, 주소, 가까운 버스 정류장', 'At a glance: hours, address, nearest bus stop'))
        await kit.sleep(3200)
        const steps = kit.$('section[aria-labelledby="guide-steps"]')
        if (steps) {
          const labels = [
            t('1단계 찾아오기: 검은 외관과 체커보드 문턱', 'Step 1 Get here: black front and checkerboard step'),
            t('2단계 도착하기: 콘과 테이프와 체커보드 바닥', 'Step 2 Arrive: cones, tape and checkerboard floor'),
            t('3단계 고르고 결제하기', 'Step 3 Choose and pay'),
            t('4단계 촬영하기', 'Step 4 Shoot'),
            t('5단계 인화물과 사진 받기', 'Step 5 Collect prints and photos'),
          ]
          const top = window.scrollY + steps.getBoundingClientRect().top
          const h = steps.getBoundingClientRect().height
          for (let i = 0; i < 5; i++) {
            cap(5, t('이용 방법', 'How to'), labels[i])
            await kit.scrollToY(top - 80 + (h * i) / 5, 900)
            await kit.sleep(i === 2 ? 2400 : 2000)
          }
        }
        S.ringEl = null
      },
    },
    {
      name: '오시는 길',
      run: async (kit) => {
        await goNav(kit, '/visit')
        await kit.sleep(1200)
        cap(6, t('오시는 길', 'Visit'), t('3D 지도: 황리단길 위치와 걸어오는 경로', '3D map: Hwangridan-gil and the walking route'))
        const map = await kit.waitFor(() => kit.$('section.ue-light [class*="rounded-lg"]'), 8000)
        if (map) { await kit.scrollToEl(map, { at: 0.2 }); await kit.pointAt(map, { dur: 900 }) }
        await kit.sleep(4200)
        const naver = kit.$('a[href*="naver"]')
        const google = kit.$('a[href*="google"]')
        cap(6, t('오시는 길', 'Visit'), t('네이버 지도와 구글 지도 연결', 'Links to Naver Map and Google Maps'))
        if (naver) { await kit.pointAt(naver, { dur: 800 }); await kit.sleep(1800) }
        if (google) { await kit.pointAt(google, { dur: 800 }); await kit.sleep(1800) }
        cap(6, t('오시는 길', 'Visit'), t('영업시간 표시: 지금 영업 여부', 'Opening hours: open now or not'))
        const hrs = kit.byText('p, div', ['10:00']) 
        if (hrs) { await kit.pointAt(hrs, { dur: 700 }); await kit.sleep(2200) }
        S.ringEl = null
      },
    },
    {
      name: '쿠폰',
      run: async (kit) => {
        await kit.scrollToY(0)
        const fab = kit.$('button[aria-label="쿠폰"], button[aria-label="Coupon"]')
        cap(7, t('쿠폰', 'Coupon'), t('쿠폰 버튼: 모든 페이지 오른쪽 아래', 'Coupon button: bottom right on every page'))
        if (fab) { await kit.pointAt(fab, { dur: 900 }); await kit.sleep(1800) }
        // 시연 중 기기 공유 창이 뜨지 않도록 공유 API를 잠시 끈다
        const hadShare = Object.getOwnPropertyDescriptor(navigator, 'share')
        try { Object.defineProperty(navigator, 'share', { value: undefined, configurable: true }) } catch { /* 무시 */ }
        try {
          if (fab) await kit.click(fab)
          const dlg = await kit.waitFor(() => kit.$('[role="dialog"]'), 5000)
          if (!dlg) return
          kit.setRing(dlg)
          cap(7, t('쿠폰', 'Coupon'), t('공유해야 열리는 스크래치 쿠폰', 'Scratch coupon unlocked by sharing'))
          await kit.sleep(2400)
          const share = kit.byText('[role="dialog"] button', ['공유하기', 'Share'])
          if (share) await kit.click(share)
          const copy = await kit.waitFor(() => kit.byText('[role="dialog"] button', ['링크 복사', 'Copy link']), 4000)
          if (copy) { cap(7, t('쿠폰', 'Coupon'), t('링크 복사로 공유 완료', 'Sharing done by copying the link')); await kit.click(copy) }
          const canvas = await kit.waitFor(() => kit.$('[role="dialog"] canvas'), 5000)
          if (canvas) {
            cap(7, t('쿠폰', 'Coupon'), t('긁어서 오늘의 코드 확인', 'Scratch to reveal today\'s code'))
            const r = canvas.getBoundingClientRect()
            await kit.moveCursor(r.left + 24, r.top + r.height * 0.35, 600)
            for (let i = 0; i < 4; i++) {
              await kit.moveCursor(r.right - 24, r.top + r.height * (0.35 + 0.1 * i), 420)
              await kit.moveCursor(r.left + 24, r.top + r.height * (0.4 + 0.1 * i), 420)
            }
          }
          const reveal = kit.byText('[role="dialog"] button', ['바로 확인', 'Reveal'])
          if (reveal) await kit.click(reveal)
          await kit.sleep(900)
          const codeEl = kit.$('[role="dialog"] [aria-live="polite"]')
          cap(7, t('쿠폰', 'Coupon'), t('오늘의 코드: 서버에서 받고 매일 00:00 새 코드', 'Today\'s code from the server, a new code every day at 00:00'))
          if (codeEl) await kit.pointAt(codeEl, { dur: 700 })
          await kit.sleep(4200)
          const close = kit.$('[role="dialog"] button[aria-label*="Close"], [role="dialog"] button[aria-label*="닫기"]')
          if (close) await kit.click(close)
          else window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
          await kit.sleep(700)
        } finally {
          if (hadShare) Object.defineProperty(navigator, 'share', hadShare)
          else try { delete navigator.share } catch { /* 무시 */ }
          S.ringEl = null
        }
      },
    },
    {
      name: '언어 전환',
      run: async (kit) => {
        const group = kit.$('header [role="group"][aria-label]')
        const other = lang === 'ko' ? 'en' : 'ko'
        cap(8, t('언어 전환', 'Language'), t('EN과 KR 전환: 레이아웃 흔들림 없음', 'EN and KR toggle: no layout shift'))
        if (group) { await kit.pointAt(group, { dur: 900 }); await kit.sleep(1200) }
        const btnOther = kit.$(`header button[lang="${other}"]`)
        if (btnOther) { await kit.click(btnOther); await kit.sleep(3200) }
        const btnBack = kit.$(`header button[lang="${lang}"]`)
        if (btnBack) { await kit.click(btnBack); await kit.sleep(1800) }
        S.ringEl = null
      },
    },
    {
      name: '브랜드',
      run: async (kit) => {
        await goNav(kit, '/brand')
        await kit.waitFor(() => kit.$('#brand-title'), 8000)
        cap(9, t('어반엣지 브랜드', 'UrbanEdge brand'), t('슬로건: 시간을 싣고 달리는 열차', 'Slogan: a train carrying time'))
        await kit.sleep(3200)
        const id = kit.$('section[aria-labelledby="brand-identity"]')
        if (id) {
          cap(9, t('어반엣지 브랜드', 'UrbanEdge brand'), t('정체성 2가지: 시간여행 플랫폼과 시공간의 압축', 'Two identities: time-traveling platform and chronological journey'))
          await kit.scrollToEl(id, { at: 0.1 }); kit.setRing(id); await kit.sleep(3600)
        }
        const tm = kit.$('section[aria-labelledby="brand-time"]')
        if (tm) {
          cap(9, t('어반엣지 브랜드', 'UrbanEdge brand'), t('시간 승강장: 현재에서 1968로 거슬러 올라가는 3개 방', 'Time Platform: three rooms back from today to 1968'))
          await kit.scrollToEl(tm, { at: 0.1 }); kit.setRing(tm); await kit.sleep(4200)
        }
        const as = kit.$('section[aria-labelledby="brand-assets"]')
        if (as) {
          cap(9, t('어반엣지 브랜드', 'UrbanEdge brand'), t('브랜드 자산: 워드마크, 색, 열차, 포스터', 'Brand assets: wordmark, colors, train, posters'))
          await kit.scrollToEl(as, { at: 0.1 }); kit.setRing(as); await kit.sleep(3000)
        }
        S.ringEl = null
      },
    },
    {
      name: '마무리',
      run: async (kit) => {
        S.ringEl = null
        S.setCap(null)
        S.setEnd(true)
        await kit.sleep(8000)
        // 끝 화면에 머문다. 방향키나 R 로 다른 장면으로 이동한다
        for (;;) await kit.sleep(1000)
      },
    },
  ]
}
export { TOTAL }
