// demo/demoScript.js: 시연 대본. 장(chapter) 단위로 나뉘어 있고, 장마다 필요한 화면 상태(phase, kstep, tab)를 선언한다.
// 요소를 못 찾으면 그 줄만 건너뛰고 다음으로 간다. 자막은 정보성 명사형으로 쓴다.
import { STOP } from './demoKit.js'

export function buildChapters({ kit, say, nav, getCtrl, ops, autoRun, onEnd }) {
  const { reveal, sleep, $, $$, isVisible, btn, waitFor, click, hover, slide, typeNumber, key, highlight } = kit
  const log = (window.__demoLog = window.__demoLog || [])
  const sec = (label) => $$('section[aria-label]').find((s) => isVisible(s) && s.getAttribute('aria-label').includes(label))
  const inSec = (label, text) => {
    const s = sec(label)
    return s ? btn(text, s) : null
  }
  const tab = (id) => $(`#op-tab-${id}`)
  const gotoTab = async (id) => {
    const t = tab(id)
    if (t && t.getAttribute('aria-selected') !== 'true') await click(t)
    await sleep(500)
  }
  const step = async (name, fn) => {
    log.push({ name, at: Math.round(performance.now()) })
    try {
      await fn()
    } catch (e) {
      if (e === STOP) throw e
      console.warn('[demo] 건너뜀:', name, e)
      log.push({ name: `건너뜀 ${name}`, err: String(e) })
    }
  }
  // 자막과 강조: 대상이 있으면 테두리를 두르고 글자 수만큼 읽을 시간을 준다.
  const note = async (chip, text, el, extra = 0) => {
    if (!el) log.push({ name: `대상 없음 ${chip}`, err: 'no target' })
    if (el) await reveal(el)
    highlight(el || null)
    say({ chip, text, el })
    await sleep(Math.max(2600, text.length * 150) + extra)
  }
  const kioskText = () => (document.querySelector('main')?.innerText || '').replace(/\s+/g, ' ')
  const kiosk = () => $('[data-tour="screen"], .screen-only-box')
  const original = { price: null, frameWasOn: null }

  const chapters = []
  const ch = (id, title, need, fn) => chapters.push({ id, title, need, fn })

  // ===== A. 키오스크 한 대 =====
  ch('a1', '키오스크 한 대: 시작, 언어, 상품', { phase: 'A', kstep: 'attract' }, async () => {
    await step('a1 대기 화면', async () => {
      await note('키오스크 한 대', '손님이 보는 화면 그대로, 시작부터 인화까지', kiosk(), 600)
      const start = await waitFor(() => btn('화면을 눌러'))
      if (!start) log.push({ name: '대상 없음 시작 버튼', err: 'x' })
      if (start) {
        say({ chip: '대기 화면', text: '화면을 눌러 시작' })
        await click(start)
      }
    })
    await step('a1 언어', async () => {
      const ko = await waitFor(() => btn('한국어'))
      await note('언어', '한국어와 영어 선택, 방문객 대부분이 외국인', kiosk())
      if (ko) await click(ko)
    })
    await step('a1 상품', async () => {
      const p = await waitFor(() => btn('4컷 사진'))
      await note('상품과 가격', '상품 4종, 가격과 구성은 운영 화면에서 수정', kiosk(), 800)
      if (p) await click(p)
    })
  })

  ch('a2', '키오스크 한 대: 결제', { phase: 'A', kstep: 'pay' }, async () => {
    await step('a2 결제수단', async () => {
      const c = await waitFor(() => btn('Card카드') || btn('카드Insert'))
      await note('결제수단', '카드, 삼성페이, 현금, 쿠폰 네 가지', kiosk(), 600)
      if (c) await click(c)
    })
    await step('a2 카드 꽂기', async () => {
      const ins = await waitFor(() => btn('카드 꽂기'))
      await note('카드 결제', '카드 투입구에 카드를 꽂으면 승인 요청', kiosk())
      if (ins) await click(ins)
      await waitFor(() => /결제 완료/.test(kioskText()), 15000)
      say({ chip: '승인 결과', text: '카드사, 마스킹 카드번호, 승인번호, 할부 표시' })
      await sleep(1900)
    })
  })

  ch('a3', '키오스크 한 대: 프레임과 촬영', { phase: 'A', kstep: 'frame' }, async () => {
    await step('a3 프레임', async () => {
      const sel = await waitFor(() => btn('Select선택') || btn('Select'))
      await note('프레임', '운영 화면에서 켜 둔 프레임만 표시', kiosk(), 600)
      if (sel) await click(sel)
    })
    await step('a3 촬영 안내', async () => {
      const go = await waitFor(() => btn('Start shooting') || btn('촬영 시작'))
      await note('포즈 안내', '방마다 포즈 문구 제공', kiosk())
      if (go) await click(go)
    })
    await step('a3 촬영', async () => {
      say({ chip: '촬영', text: '5초 카운트다운, 컷마다 포즈 변경' })
      await waitFor(() => /컷 순서 정하기/.test(kioskText()), 70000)
    })
  })

  ch('a4', '키오스크 한 대: 컷 선택, 인화, 완료', { phase: 'A', kstep: 'select' }, async () => {
    await step('a4 컷 순서', async () => {
      const p = await waitFor(() => btn('Print인화') || btn('인화하기'))
      await note('컷 순서', '찍은 컷을 인화 칸에 순서대로 배치', kiosk(), 400)
      if (p) await click(p)
    })
    await step('a4 인화', async () => {
      say({ chip: '인화', text: '인화 중 스탬프와 메모 추가' })
      await waitFor(() => /인화 완료/.test(kioskText()), 30000)
      await sleep(900)
      const nx = await waitFor(() => btn('Next다음') || btn('Next'))
      if (nx) await click(nx)
    })
    await step('a4 완료', async () => {
      await waitFor(() => /가져가세요/.test(kioskText()), 10000)
      await note('완료', '인화물 수령, QR로 사진과 영상 받기', kiosk())
      const big = btn('크게 보기')
      if (big) {
        say({ chip: '인화물 확대', text: '인화물을 누르면 화면 가운데에 크게 표시' })
        await click(big)
        await sleep(3200)
        key('Escape')
        await sleep(600)
      }
    })
  })

  // ===== B. 키오스크 3대 =====
  ch('b1', '키오스크 3대 동시 운영', { phase: 'S' }, async () => {
    await step('b1 3대', async () => {
      await waitFor(() => $$('[data-booth]').length >= 3, 10000)
      await note('키오스크 3대', '부스 하나에 키오스크 한 대, 3대 동시 운영', $('section[aria-label="키오스크"]'), 400)
    })
    for (const [id, name] of [['subway', '1 지하철 샷'], ['karaoke', '2 노래방 샷'], ['retro', '3 레트로 샷']]) {
      // eslint-disable-next-line no-await-in-loop
      await step(`b1 ${id}`, async () => {
        const el = $(`[data-booth="${id}"]`)
        if (el) await note('부스', `${name}`, el, -900)
      })
    }
    await step('b1 자동 운영', async () => {
      const a = btn('자동 운영')
      if (a && !autoRun.get().on) await click(a)
      const m = btn('16x')
      if (m) await click(m)
      await note('자동 운영', '3대가 손님처럼 결제부터 인화까지 동시에 진행', $('section[aria-label="키오스크"]'), 1200)
    })
  })

  // ===== C. 대시보드 =====
  const needDash = { phase: 'S', tab: 'dash' }
  ch('c1', '대시보드: 상단과 기간', needDash, async () => {
    await step('c1 상단', async () => {
      const h = $('.op-dash-head')
      await note('상단', '날짜, 초 단위 시계, 실시간 연결 표시', h, 300)
    })
    await step('c1 기간', async () => {
      const t = $('[role=tablist][aria-label="기간"]')
      await note('기간 탭', '오늘, 이번 주, 이번 달, 올해 전환, 모든 카드가 함께 변경', t)
      const w = t && btn('이번 주', t)
      if (w) await click(w)
      await sleep(1100)
      const y = t && btn('올해', t)
      if (y) await click(y)
      await sleep(1100)
      const d = t && btn('오늘', t)
      if (d) await click(d)
      await sleep(600)
    })
  })

  ch('c2', '대시보드: 매출 요약, 시간대, 확인할 일', needDash, async () => {
    await step('c2 매출 요약', async () => {
      await note('매출 요약', '오늘 매출, 어제 같은 시각 대비, 결제 건수, 객단가, 환불, 월 누계', sec('매출 요약'), 400)
    })
    await step('c2 시간대별', async () => {
      const s = sec('시간대별')
      await note('시간대별 매출', '막대 하나가 한 시간, 노란색은 지금 시간', s)
      const b = s && btn('노래방', s)
      if (b) {
        say({ chip: '부스 필터', text: '부스를 고르면 해당 부스만 표시' })
        await click(b)
        await sleep(1500)
        const all = btn('전체', s)
        if (all) await click(all)
      }
    })
    await step('c2 확인할 일', async () => {
      await note('확인할 일', '환불, 오프라인 부스, 쿠폰 소진 등 처리 항목 자동 표시', sec('확인할 일'))
    })
  })

  ch('c3', '대시보드: 부스별 현황, 실시간 결제', needDash, async () => {
    await step('c3 부스별', async () => {
      await note('부스별 현황', '부스마다 진행 단계, 마지막 결제 시각, 건수, 매출, 비중', sec('부스별 현황'), 300)
    })
    await step('c3 실시간', async () => {
      await note('실시간 결제', '결제 즉시 한 줄 추가, 카드사와 마스킹 카드번호 표시', sec('실시간 결제'), 700)
    })
  })

  ch('c4', '대시보드: 판매 분석', needDash, async () => {
    await step('c4 상품별', async () => {
      await note('상품별 판매', '상품마다 판매 건수와 매출', sec('상품별 판매'))
    })
    await step('c4 프레임별', async () => {
      await note('프레임별 판매', '프레임마다 몇 건, 얼마 팔렸는지 순위 표시', sec('프레임별 판매'), 500)
    })
    await step('c4 결제수단', async () => {
      await note('결제수단과 쿠폰 채널', '카드, 삼성페이, 현금, 쿠폰 비중과 쿠폰 채널별 사용', sec('결제수단'), 500)
    })
    await step('c4 내보내기', async () => {
      const ex = btn('내보내기')
      if (!ex) return
      await note('내보내기', 'CSV, 엑셀, 한글, PDF로 저장', ex)
      await click(ex)
      await sleep(900)
      const menu = $('[role=menu][aria-label="내보내기 형식"]')
      highlight(menu)
      const item = btn('엑셀', menu || document)
      const pick = item && !item.disabled ? item : btn('CSV', menu || document)
      say({ chip: '파일 저장', text: '선택한 기간의 거래와 요약을 파일로 저장' })
      if (pick) await click(pick)
      await sleep(2600)
      if ($('[role=menu][aria-label="내보내기 형식"]')) key('Escape')
    })
  })

  ch('c5', '운영 화면: 카메라 설정', needDash, async () => {
    await step('c5 카메라', async () => {
      const cam = $('section.op-camera')
      await note('카메라 설정', '부스마다 좌우 반전, 줌, 밝기, 대비, 색온도, 필터 조정', cam, 300)
      const bright = $('input[type=range][aria-label="밝기"]', cam)
      if (bright) {
        say({ chip: '밝기', text: '어둡게 나오는 방은 밝기를 올려 보정' })
        await slide(bright, 1.2)
        await sleep(1000)
        await slide(bright, 1.0)
      }
    })
    await step('c5 필터', async () => {
      const cam = $('section.op-camera')
      const mono = cam && btn('흑백', cam)
      if (mono) {
        say({ chip: '필터', text: '흑백으로 바꾸면 키오스크 미리보기와 촬영 컷에 즉시 적용' })
        await click(mono)
        await sleep(4200)
        const orig = btn('원본', cam)
        if (orig) await click(orig)
      }
    })
    await step('c5 저장 폴더', async () => {
      await note('저장 폴더', '촬영 컷과 인화본을 부스별로 보관, 눌러서 확대', $('.op-cam-files'))
    })
  })

  ch('c6', '관리: 상품과 가격, 프레임', needDash, async () => {
    await step('c6 상품', async () => {
      await gotoTab('products')
      await note('상품과 가격', '이름, 컷 수, 인화 장수, 가격을 표에서 바로 수정', sec('상품과 가격표'), 200)
      const inp = $('input[aria-label="4컷 사진 가격"]')
      if (inp) {
        original.price = inp.value
        say({ chip: '가격 수정', text: '7,000원을 7,500원으로 수정, 수정 즉시 키오스크 반영' })
        await typeNumber(inp, 7500)
        await sleep(2600)
        await typeNumber(inp, original.price)
        original.price = null
      }
    })
    await step('c6 프레임', async () => {
      await gotoTab('frame')
      await note('프레임', '프레임마다 켜고 끄기, 끄면 키오스크 선택 화면에서 제외', sec('프레임'), 200)
      const sw = $('.op-frames [role=switch]')
      if (sw) {
        original.frameWasOn = sw.getAttribute('aria-checked') === 'true'
        await click(sw)
        await sleep(1700)
        await click(sw)
      }
    })
    await step('c6 프레임 추가', async () => {
      await note('프레임 추가', '이름과 색만 입력하면 새 프레임 등록, 프로그램 수정 불필요', sec('프레임 추가'))
    })
  })

  ch('c7', '관리: 쿠폰, 거래와 환불, 설정', needDash, async () => {
    await step('c7 쿠폰', async () => {
      await gotoTab('coupon')
      await note('통합 코드', '웹사이트와 제휴처 코드가 매일 00:00 새로 발급, 수작업 없음', sec('오늘의 통합 코드'), 400)
      await note('제휴처 코드', '제휴처 영수증 하단에 넣는 일일 코드', sec('제휴처 일일 코드'))
      await note('1회용 코드', '이벤트용 1회용 코드 묶음 발급', sec('1회용 코드'))
    })
    await step('c7 거래', async () => {
      await gotoTab('pos')
      await note('일 마감', '결제수단별 합계와 영수증 형태의 마감표', sec('일 마감'))
      await note('거래 내역', '시간, 부스, 결제수단, 쿠폰, 프레임, 금액, 상태', sec('거래 내역'))
      const row = $('.op-tx tbody tr')
      if (row) {
        say({ chip: '상세 영수증', text: '행을 누르면 결제 상세 영수증 표시' })
        await click(row, { dx: 0.3 })
        await sleep(2600)
        const close = $('[role=dialog] button[aria-label="닫기"]')
        if (close) await click(close)
        else key('Escape')
      }
    })
    await step('c7 환불', async () => {
      const rf = $$('.op-tx tbody tr button').find((b) => isVisible(b) && /환불/.test(b.textContent))
      if (!rf) return
      say({ chip: '환불', text: '환불 버튼, 확인 뒤 매출에서 제외' })
      await click(rf)
      await sleep(1500)
      const ok = $$('[role=dialog] button').find((b) => isVisible(b) && /환불/.test(b.textContent) && !/취소/.test(b.textContent))
      if (ok) await click(ok)
      await sleep(1200)
    })
    await step('c7 설정', async () => {
      await gotoTab('settings')
      await note('설정 백업', '가격, 상품, 프레임, 쿠폰, 카메라 설정을 파일 하나로 저장과 복원', sec('설정 백업'))
    })
  })

  ch('c8', '전체화면 TV 모드', needDash, async () => {
    await step('c8 TV', async () => {
      await gotoTab('dash')
      await note('전체화면', 'F 키로 TV 모드, 매장 모니터용 큰 화면', $('.op-dash-head'), 200)
      key('f')
      await sleep(900)
      say({ chip: 'TV 모드', text: 'F 또는 Esc로 나가기' })
      highlight(null)
      await sleep(6500)
      key('Escape')
      await sleep(900)
    })
  })

  ch('end', '마무리', needDash, async () => {
    await step('end 정리', async () => {
      autoRun.stop()
      const inp = $('input[aria-label="4컷 사진 가격"]')
      void inp
      ops.resetCamera?.('subway')
      highlight(null)
      onEnd()
    })
  })

  return chapters
}
