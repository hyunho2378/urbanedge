// copy.js: 키오스크 화면의 모든 문구. 노드는 { en, ko } 형태이고 화면은 <T n={노드} />로 두 언어를 같은 칸에 겹쳐 그린다.
// 영문이 기본 언어다. 두 언어를 따로 썼다(docs/VOICE.md). 번역하지 않는다.
// 이야기: 경주에는 지하철이 없으므로 어반엣지가 "경주 메트로(Gyeongju Metro)"를 지어냈고 첫 역이 GY-01 어반엣지다(docs/NAMING.md).
// 가상의 관광 경험이며 실제 교통시설이 아니다. 그렇게 읽히는 문구를 쓰지 않는다. 수치는 flow/config.js와 사이트 사실만 쓴다.

// vars의 값이 { en, ko } 객체이면 언어에 맞는 쪽을 쓴다.
export function fillVars(v, lang, vars) {
  if (!vars || typeof v !== 'string') return v
  return v.replace(/\{(\w+)\}/g, (_, k) => {
    const x = vars[k]
    if (x == null) return ''
    return typeof x === 'object' ? String(x[lang] ?? x.en) : String(x)
  })
}

export function tr(node, lang, vars) {
  if (node == null) return ''
  return fillVars(node[lang] ?? node.en, lang, vars)
}

export const COPY = {
  common: {
    back: { en: 'Back', ko: '이전' },
    next: { en: 'Next', ko: '다음' },
    cameraSample: { en: 'Sample view', ko: '샘플 화면' },
    cameraLive: { en: 'Camera on', ko: '카메라 연결됨' },
    lensCue: { en: 'Camera is right below', ko: '카메라는 바로 아래' },
    lensCueSub: { en: 'Look here at the countdown', ko: '카운트다운 때 이곳을 보세요' },
    lensName: { en: 'Camera lens', ko: '카메라 렌즈' },
    gotIt: { en: 'Got it', ko: '확인' },
    skipTips: { en: 'Skip tips', ko: '안내 끄기' },
    progress: { en: 'Journey progress', ko: '이용 진행' },
    imaginary: { en: 'Imaginary Metro · Travel Experience', ko: '가상의 지하철 관광 경험' },
    station: { en: 'GY-01 UrbanEdge', ko: 'GY-01 어반엣지' },
    platformN: { en: 'Platform {n}', ko: '{n}번 승강장' },
  },

  // 라이브 액티비티(다이내믹 아일랜드)
  island: {
    next: { en: 'Next: {name}', ko: '다음 {name}' },
    last: { en: 'Last stop', ko: '마지막 역' },
    stopsLeft: { en: '{n} stops left', ko: '{n}개 역 남음' },
    stopLeft: { en: '1 stop left', ko: '1개 역 남음' },
    cutOf: { en: 'Cut {n} of {total}', ko: '{total}컷 중 {n}컷' },
    // 단계별 안내 방송 한 줄
    announce: {
      attract: { en: 'Now boarding: Platform {n}, {platform}', ko: '지금 탑승 {n}번 승강장 {platform}' },
      language: { en: 'Doors are open', ko: '문이 열렸습니다' },
      intro: { en: 'Please mind the lens', ko: '렌즈를 조심하세요' },
      cuts: { en: 'Pick your ride length', ko: '이용 길이를 고르세요' },
      frame: { en: 'Choose your Metro Ticket', ko: '승차권을 고르세요' },
      pay: { en: 'Tap in at the gate', ko: '게이트에서 결제하세요' },
      guide: { en: 'Find your pose', ko: '포즈를 찾으세요' },
      retouch: { en: 'Optional glow', ko: '선택 사항 보정' },
      ready: { en: 'Mind the lens', ko: '렌즈 주의' },
      shoot: { en: 'Doors closing', ko: '문이 닫힙니다' },
      select: { en: 'Arrange your strip', ko: '컷을 배치하세요' },
      print: { en: 'Your ticket is printing', ko: '승차권 인화 중' },
      finish: { en: 'Please exit here', ko: '이쪽으로 하차하세요' },
    },
  },

  attract: {
    kicker: { en: 'Gyeongju Metro, powered by UrbanEdge', ko: '어반엣지가 만든 경주 메트로' },
    title: { en: 'Welcome to GY‑01 UrbanEdge.', ko: 'GY‑01 어반엣지역에 오신 것을 환영합니다' },
    boarding: { en: 'Now boarding: Platform {n}, {platform}', ko: '지금 탑승 {n}번 승강장 {platform}' },
    sub: { en: 'Gyeongju has no subway, so we made one up. Touch the screen to step on.', ko: '경주에는 지하철이 없어서 하나 지어냈습니다. 화면을 터치하면 탑승합니다.' },
    touch: { en: 'Touch to board', ko: '화면을 터치하세요' },
    tape: { en: 'MIND THE LENS', ko: '렌즈 주의' },
    tapeSub: { en: 'IT SITS BELOW THE SCREEN', ko: '카메라는 화면 아래에 있습니다' },
    pause: { en: 'Pause motion', ko: '움직임 멈추기' },
    play: { en: 'Resume motion', ko: '움직임 다시 켜기' },
  },

  language: {
    title: { en: 'Choose a language', ko: '언어 선택' },
    en: { en: 'English', ko: 'English' },
    ko: { en: '한국어', ko: '한국어' },
    enSub: { en: 'Guide in English', ko: 'Guide in English' },
    koSub: { en: '한국어로 안내합니다', ko: '한국어로 안내합니다' },
  },

  intro: {
    slides: {
      how: {
        title: { en: 'Four stops to your Metro Ticket.', ko: '네 정거장이면 승차권이 나옵니다' },
        body: {
          en: 'Gyeongju has no subway, so we made one up: Gyeongju Metro, with GY-01 UrbanEdge as its first station. Choose a frame, pose at the lens, arrange your shots, and collect two Metro Tickets at Exit 1.',
          ko: '경주에는 지하철이 없어서 경주 메트로를 지어냈고 첫 역이 GY-01 어반엣지입니다. 프레임을 고르고 렌즈 앞에서 포즈를 취한 뒤 컷을 배치하면 1번 출구에서 승차권 두 장이 인화됩니다.',
        },
        stops: {
          en: ['Choose', 'Pose', 'Arrange', 'Print'],
          ko: ['선택', '촬영', '배치', '인화'],
        },
      },
      lens: {
        title: { en: 'The camera sits under the screen.', ko: '카메라는 화면 아래에 있습니다' },
        body: {
          en: 'The screen only shows you a mirror. The photo comes from the round lens below the bottom edge, so look down there when the countdown runs.',
          ko: '화면은 내 모습을 비추는 거울입니다. 사진은 아래쪽 가장자리의 둥근 렌즈가 찍으니 카운트다운 중에는 그 렌즈를 바라보세요.',
        },
        screen: { en: 'Mirror', ko: '거울' },
        lens: { en: 'Camera', ko: '카메라' },
      },
      stand: {
        title: { en: 'Stand at the lens. Exit 1 is below.', ko: '렌즈 앞에 서고 인화물은 1번 출구에서 받습니다' },
        body: {
          en: 'Stand in front of the lens with your group side by side. Tickets drop into the white tray under the slot.',
          ko: '일행과 나란히 렌즈 앞에 서세요. 인화물은 1번 출구 아래의 흰색 트레이에 떨어집니다.',
        },
        stand: { en: 'Stand here', ko: '서는 곳' },
        slot: { en: 'Exit 1', ko: '1번 출구' },
      },
      touch: {
        title: { en: 'You can drag things here.', ko: '끌어서 바꿀 수 있습니다' },
        body: {
          en: 'Drag shots to reorder your strip. While it prints, drag a platform stamp onto it.',
          ko: '컷을 끌어 순서를 바꾸고, 인화 중에는 승강장 스탬프를 끌어 인화물 위에 올리세요.',
        },
      },
      coupon: {
        title: { en: 'Got a coupon?', ko: '쿠폰이 있나요?' },
        body: {
          en: 'Scratch cards from our website hide a code like UE-XXXX-XXXX. At payment, hold its QR in front of the lens or type the code.',
          ko: '웹사이트 스크래치 카드에는 UE-XXXX-XXXX 형식의 코드가 있습니다. 결제 단계에서 QR을 렌즈 앞에 대거나 코드를 입력하세요.',
        },
      },
    },
    page: { en: 'Tip {n} of {total}', ko: '안내 {n}/{total}' },
  },

  cuts: {
    title: { en: 'How many cuts?', ko: '컷 수 선택' },
    sub: { en: 'Each cut gets its own countdown, {sec} seconds long.', ko: '컷마다 {sec}초 카운트다운이 따로 있습니다.' },
    four: { en: '4 cuts', ko: '4컷' },
    eight: { en: '8 cuts', ko: '8컷' },
    fourBody: { en: 'Four cuts, four photos on the print.', ko: '4컷을 찍고 4장이 인화물에 담깁니다.' },
    eightBody: { en: 'Eight cuts. Some frames print all of them, others keep your best.', ko: '8컷을 찍습니다. 프레임에 따라 모두 인화하거나 마음에 드는 컷만 담습니다.' },
  },

  frame: {
    title: { en: 'Pick a frame.', ko: '프레임 선택' },
    sub: { en: 'Swipe sideways. Every Metro Ticket carries today’s date and GY-01.', ko: '옆으로 밀어 보세요. 모든 승차권에 오늘 날짜와 GY-01 역 번호가 찍힙니다.' },
    use: { en: 'Use this frame', ko: '이 프레임 쓰기' },
    slots: { en: '{n} photos on the print', ko: '인화물에 사진 {n}장' },
    label: { en: 'Frames', ko: '프레임 목록' },
  },

  pay: {
    title: { en: 'Choose how to pay.', ko: '결제 수단 선택' },
    sessionLine: { en: 'One session', ko: '촬영 1회' },
    printsLine: { en: '{n} printed tickets', ko: '인화 {n}장' },
    total: { en: 'Due now', ko: '결제 금액' },
    won: { en: '{n} KRW', ko: '{n}원' },
    methods: {
      card: {
        title: { en: 'Card or phone', ko: '카드 또는 휴대폰' },
        body: { en: 'Insert, tap, or hold your phone to the terminal at the bottom right.', ko: '오른쪽 아래 단말기에 카드를 꽂거나 대고, 삼성페이도 쓸 수 있습니다.' },
      },
      cash: {
        title: { en: 'Cash', ko: '현금' },
        body: { en: 'Feed bills into the bill slot.', ko: '지폐 투입구에 지폐를 넣으세요.' },
      },
      coupon: {
        title: { en: 'Coupon', ko: '쿠폰' },
        body: { en: 'Scan the QR or type the code.', ko: 'QR을 보여 주거나 코드를 입력하세요.' },
      },
    },
    samsung: { en: 'Samsung Pay', ko: '삼성페이' },
    contactless: { en: 'Contactless', ko: '비접촉' },
    terminalTitle: { en: 'Use the terminal.', ko: '단말기를 사용하세요' },
    terminalBody: { en: 'Insert or tap now. The light blinks green while it reads.', ko: '지금 카드를 꽂거나 대세요. 읽는 동안 초록 불이 깜박입니다.' },
    terminalHint: { en: 'Bottom right of the machine', ko: '기기 오른쪽 아래' },
    demoTap: { en: 'Tap a demo card', ko: '데모 카드 대기' },
    demoDecline: { en: 'Try a declined card', ko: '거절되는 카드 시험' },
    processing: { en: 'Checking with the bank', ko: '승인 중입니다' },
    cashTitle: { en: 'Feed in bills.', ko: '지폐를 넣으세요' },
    cashBody: { en: 'The bar fills as the machine counts.', ko: '기기가 세는 동안 막대가 차오릅니다.' },
    cashDemo: { en: 'Insert a bill (demo)', ko: '지폐 넣기(데모)' },
    couponTitle: { en: 'Have a coupon?', ko: '쿠폰이 있나요?' },
    couponBody: { en: 'Hold the QR in front of the lens below, or type the code.', ko: 'QR을 아래 렌즈 앞에 대거나 코드를 입력하세요.' },
    couponScan: { en: 'Show a QR (demo)', ko: 'QR 보여 주기(데모)' },
    couponApply: { en: 'Apply coupon', ko: '쿠폰 적용' },
    couponBad: { en: 'That code does not check out. Look at each character again.', ko: '코드를 확인하지 못했습니다. 글자를 다시 살펴보세요.' },
    couponApplied: { en: 'Coupon applied', ko: '쿠폰 적용됨' },
    couponCovered: { en: 'Covered by coupon', ko: '쿠폰으로 결제' },
    couponLine: { en: 'Coupon {code}', ko: '쿠폰 {code}' },
    paidTitle: { en: 'Paid.', ko: '결제 완료' },
    paidBody: { en: 'Take your card. The poses come next.', ko: '카드를 챙겨 주세요. 이어서 포즈 안내가 나옵니다.' },
    paidCoupon: { en: 'Coupon accepted. The poses come next.', ko: '쿠폰을 확인했습니다. 이어서 포즈 안내가 나옵니다.' },
    failTitle: { en: 'Card declined.', ko: '승인하지 못했습니다' },
    failBody: { en: 'Nothing was charged. Try again or pick another way to pay.', ko: '결제되지 않았습니다. 다시 시도하거나 다른 수단을 고르세요.' },
    retry: { en: 'Try again', ko: '다시 시도' },
    other: { en: 'Other ways to pay', ko: '다른 수단' },
    useScan: { en: 'Scan a QR instead', ko: 'QR로 대신 하기' },
    useType: { en: 'Type the code instead', ko: '코드를 직접 입력하기' },
    codeEmpty: { en: 'UE-XXXX-XXXX', ko: 'UE-XXXX-XXXX' },
    scanning: { en: 'Looking for a QR', ko: 'QR을 찾는 중' },
    change: { en: 'Change method', ko: '수단 바꾸기' },
    continue: { en: 'Continue', ko: '계속' },
    demoNote: { en: 'Simulated. Nothing is charged.', ko: '시뮬레이션입니다. 실제로 결제되지 않습니다.' },
    del: { en: 'Delete', ko: '지우기' },
    codeKeys: { en: 'Coupon code keypad', ko: '쿠폰 코드 키패드' },
  },

  guide: {
    title: { en: 'Pose ideas for {room}', ko: '{room} 포즈 제안' },
    tip: {
      en: 'Chin a little up, eyes on the lens below, and move freely between shots.',
      ko: '턱을 살짝 들고 시선은 아래 렌즈에 두세요. 컷 사이에는 자유롭게 움직여도 됩니다.',
    },
  },

  retouch: {
    title: { en: 'Glow, if you like.', ko: '보정 설정' },
    live: { en: 'Live preview', ko: '실시간 미리보기' },
    skin: { en: 'Skin glow', ko: '피부 보정' },
    bright: { en: 'Brightness', ko: '밝기' },
    filter: { en: 'Filter', ko: '필터' },
    off: { en: 'Off', ko: '끔' },
    max: { en: 'Max', ko: '강' },
    dark: { en: 'Darker', ko: '어둡게' },
    light: { en: 'Brighter', ko: '밝게' },
    filters: {
      original: { en: 'Original', ko: '원본' },
      mono: { en: 'Mono', ko: '흑백' },
      film: { en: 'Film', ko: '필름' },
      flash: { en: 'Flash yellow', ko: '플래시 옐로우' },
    },
  },

  ready: {
    title: { en: 'Line up in the oval.', ko: '카메라 확인' },
    body: { en: 'Then look at the round lens under the screen.', ko: '얼굴을 타원에 맞춘 뒤 화면 아래의 둥근 렌즈를 바라보세요.' },
    start: { en: 'Start shooting', ko: '촬영 시작' },
    fallback: { en: 'No webcam found. Showing a sample view.', ko: '웹캠을 찾지 못해 샘플 화면을 보여 드립니다.' },
    guideLine: { en: 'Face in the oval', ko: '얼굴을 타원 안에' },
  },

  shoot: {
    firstUp: { en: 'First cut in a moment.', ko: '곧 첫 컷입니다' },
    firstSub: { en: 'Eyes on the lens below.', ko: '시선은 아래 렌즈에 두세요.' },
    rest: { en: 'Break.', ko: '잠깐 쉬세요' },
    restBody: { en: 'Change your pose or swap places.', ko: '자세를 바꾸거나 자리를 바꿔도 됩니다.' },
    last: { en: 'That was the last cut.', ko: '촬영이 끝났습니다' },
    pose: { en: 'Try this', ko: '이렇게 해 보세요' },
    lookDown: { en: 'Look down at the lens', ko: '아래 렌즈를 보세요' },
  },

  select: {
    titleArrange: { en: 'Arrange your strip.', ko: '인화물 배치' },
    titlePick: { en: 'Keep your best {n}.', ko: '마음에 드는 {n}컷 선택' },
    hint: { en: 'Drag a shot into a slot. Drag between slots to swap.', ko: '컷을 끌어 칸에 놓으세요. 칸끼리 끌면 순서가 바뀝니다.' },
    tray: { en: 'Your shots', ko: '찍은 컷' },
    stripOrder: { en: 'Print order', ko: '인화 순서' },
    slotN: { en: 'Slot {n}', ko: '{n}번 칸' },
    shotN: { en: 'Shot {n}', ko: '{n}번 컷' },
    retake: { en: 'Retake', ko: '다시 찍기' },
    print: { en: 'Print my strip', ko: '인화하기' },
    needMore: { en: 'Fill every slot to print.', ko: '모든 칸을 채우면 인화할 수 있습니다.' },
  },

  print: {
    title: { en: 'Printing. Stamp it while you wait.', ko: '인화 중입니다' },
    titleDone: { en: 'Your Metro Ticket is ready.', ko: '승차권이 나왔습니다' },
    stampHint: { en: 'Drag a platform stamp onto your strip.', ko: '승강장 스탬프를 끌어 인화물 위에 놓으세요.' },
    noteAdd: { en: 'Add a note', ko: '메모 남기기' },
    noteEdit: { en: 'Edit note', ko: '메모 고치기' },
    notePlaceholder: { en: 'Type a note for the strip', ko: '인화물에 넣을 메모를 입력하세요' },
    noteDone: { en: 'Done', ko: '완료' },
    clear: { en: 'Clear stamps', ko: '스탬프 지우기' },
    progress: { en: 'Print progress', ko: '인화 진행' },
    locked: { en: 'Printing is done. The strip is final.', ko: '인화가 끝나 더 바꿀 수 없습니다.' },
    toFinish: { en: 'Get my prints', ko: '인화물 받기' },
    dragOut: { en: 'Drag a stamp off the strip to remove it.', ko: '스탬프를 인화물 밖으로 끌면 지워집니다.' },
  },

  keyboard: {
    toKo: { en: '한글', ko: '한글' },
    toEn: { en: 'ENG', ko: 'ENG' },
    space: { en: 'Space', ko: '띄어쓰기' },
    del: { en: 'Delete', ko: '지우기' },
    shift: { en: 'Shift', ko: '쌍자음' },
    enter: { en: 'Done', ko: '완료' },
    groupKo: { en: 'Korean keyboard', ko: '한글 키보드' },
    groupEn: { en: 'English keyboard', ko: '영문 키보드' },
  },

  finish: {
    title: { en: 'Your Metro Ticket is in the tray below.', ko: '승차권은 아래 트레이에 있습니다' },
    body: {
      en: 'Two copies drop into the white tray under Exit 1. Thanks for riding Gyeongju Metro.',
      ko: '1번 출구 아래 흰색 트레이에 승차권 두 장이 나옵니다. 경주 메트로를 이용해 주셔서 감사합니다.',
    },
    exit: { en: 'EXIT', ko: '출구' },
    exitSub: { en: 'Tickets this way', ko: '승차권은 이쪽' },
    qrTitle: { en: 'Scan for the result page', ko: '스캔해서 결과 페이지 열기' },
    qrBody: { en: 'View and save photos and video on your phone.', ko: '휴대폰에서 사진과 영상을 보고 저장합니다.' },
    share: { en: 'Share my ticket', ko: '승차권 공유하기' },
    shareTitle: { en: 'My Metro Ticket from GY-01 UrbanEdge', ko: 'GY-01 어반엣지 승차권' },
    shareText: { en: 'Boarded Gyeongju Metro at GY-01 UrbanEdge.', ko: '경주 메트로 GY-01 어반엣지에 탑승했습니다.' },
    mapTitle: { en: 'Platforms at GY-01 UrbanEdge', ko: 'GY-01 어반엣지 승강장' },
    here: { en: 'You are here', ko: '현재 위치' },
    toStart: { en: 'Start over', ko: '처음으로' },
  },

  idle: {
    title: { en: 'Still there?', ko: '계속 이용하시나요?' },
    body: { en: 'This ride resets in {sec} seconds.', ko: '{sec}초 뒤에 처음 화면으로 돌아갑니다.' },
    keep: { en: 'Keep going', ko: '계속하기' },
    home: { en: 'Start over', ko: '처음으로' },
  },

  // 화면 안 코치마크
  coach: {
    cuts: { en: 'Tap a strip to pick it.', ko: '인화물을 눌러 고르세요.' },
    frame: { en: 'Swipe sideways to browse frames.', ko: '옆으로 밀어 프레임을 둘러보세요.' },
    pay: { en: 'Have a coupon? Scan the QR or type the code here.', ko: '쿠폰이 있나요? 여기서 QR을 보여 주거나 코드를 입력하세요.' },
    retouch: { en: 'Drag the sliders. The preview follows.', ko: '슬라이더를 끌어 보세요. 미리보기가 따라옵니다.' },
    ready: { en: 'Look at the lens down here.', ko: '시선은 이 아래 렌즈에 두세요.' },
    select: { en: 'Drag a shot into a slot.', ko: '컷을 끌어 칸에 놓으세요.' },
    print: { en: 'Drag a stamp onto the strip.', ko: '스탬프를 끌어 인화물에 올리세요.' },
  },
}

// 승강장(방) 4곳: 이름은 브랜드 사실, 설명은 웹 사이트 데이터와 같은 뜻이다.
export const ROOM_COPY = {
  subway: {
    summary: { en: 'A subway-car set with yellow seats and hand straps', ko: '노란 좌석과 손잡이가 놓인 지하철 객실 세트' },
    poses: [
      { fig: 'reach', en: ['Grab the strap', 'One hand up, like the train is packed.'], ko: ['손잡이 잡기', '붐비는 열차처럼 한 손을 높이 뻗으세요.'] },
      { fig: 'sit', en: ['Take the yellow seat', 'Sit shoulder to shoulder and face the lens.'], ko: ['노란 좌석에 앉기', '어깨를 맞대고 앉아 렌즈를 바라보세요.'] },
      { fig: 'lean', en: ['Lean on the door', 'Rest a shoulder on it and look unbothered.'], ko: ['문에 기대기', '어깨를 문에 기대고 느긋한 표정을 지어 보세요.'] },
      { fig: 'duo', en: ['Squeeze in', 'Stand close, rush hour style.'], ko: ['바짝 붙어 서기', '출근 시간 열차처럼 가깝게 서세요.'] },
    ],
  },
  karaoke: {
    summary: { en: 'A karaoke booth made for mic-in-hand poses', ko: '마이크를 들고 찍는 노래방 부스' },
    poses: [
      { fig: 'hold', en: ['Sing it', 'Mic close to your mouth, full chorus face.'], ko: ['열창하기', '마이크를 입 가까이 대고 후렴 표정을 지으세요.'] },
      { fig: 'reach', en: ['One hand up', 'Raise it when the chorus hits.'], ko: ['한 손 번쩍', '후렴이 터지는 순간처럼 손을 드세요.'] },
      { fig: 'duo', en: ['One mic, two voices', 'Lean in to share it.'], ko: ['마이크 하나로 둘이', '얼굴을 맞대고 한 마이크를 나눠 쓰세요.'] },
      { fig: 'cheer', en: ['Cheer', 'Both hands up and a big laugh.'], ko: ['환호하기', '양손을 들고 크게 웃으세요.'] },
    ],
  },
  phone: {
    summary: { en: 'A phone-booth set for receiver-in-hand shots', ko: '수화기를 든 장면을 찍는 공중전화 부스' },
    poses: [
      { fig: 'hold', en: ['Pick up', 'Receiver to your ear, someone is on the line.'], ko: ['전화 받기', '수화기를 귀에 대고 통화 중인 척하세요.'] },
      { fig: 'reach', en: ['Pass the receiver', 'Hold it out to a friend.'], ko: ['수화기 건네기', '수화기를 일행에게 내미세요.'] },
      { fig: 'lean', en: ['Lean on the booth', 'Cross your legs and take your time.'], ko: ['부스에 기대기', '다리를 꼬고 여유롭게 서세요.'] },
      { fig: 'duo', en: ['Take turns', 'Share one receiver.'], ko: ['번갈아 통화', '수화기 하나를 나눠 쓰세요.'] },
    ],
  },
  retro: {
    summary: { en: 'A retro booth with a curtain and wooden stools', ko: '커튼과 나무 의자가 있는 레트로 부스' },
    poses: [
      { fig: 'sit', en: ['Sit on the stool', 'Face the lens as if it is 1998.'], ko: ['의자에 앉기', '1998년 사진처럼 정면을 바라보세요.'] },
      { fig: 'lean', en: ['Rest your chin', 'Chin on hand, head tilted.'], ko: ['턱 괴기', '한 손으로 턱을 괴고 고개를 기울이세요.'] },
      { fig: 'reach', en: ['Peace by the curtain', 'Raise a hand and flash a V.'], ko: ['커튼 앞 브이', '손을 들어 브이를 하세요.'] },
      { fig: 'duo', en: ['Back to back', 'Stand with your backs together.'], ko: ['등 맞대기', '일행과 등을 맞대고 서세요.'] },
    ],
  },
}
