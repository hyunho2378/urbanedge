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
    cameraSample: { en: 'Camera preview', ko: '카메라 미리보기' },
    cameraLive: { en: 'Camera on', ko: '카메라 켜짐' },
    lensCue: { en: 'Lens is right below', ko: '렌즈는 바로 아래' },
    lookLens: { en: 'Look at the lens below', ko: '아래 렌즈를 보세요' },
    gotIt: { en: 'Got it', ko: '알겠어요' },
    imaginary: { en: 'Imaginary Metro · Travel Experience', ko: '가상의 지하철 여행 경험' },
    station: { en: 'GY-01 UrbanEdge', ko: 'GY-01 어반엣지' },
    platformN: { en: 'Platform {n}', ko: '{n}번 승강장' },
    zoomClose: { en: 'Tap to close', ko: '눌러서 닫기' },
    zoomOpen: { en: 'Enlarge the print', ko: '인화물 크게 보기' },
    simulated: { en: 'Simulated payment. Nothing is charged.', ko: '결제 시뮬레이션이라 실제로 청구되지 않습니다.' },
  },

  // 상단 길찾기 표지
  rail: {
    where: { en: 'Platform {n}, {platform}', ko: '{n}번 승강장 {platform}' },
    next: { en: 'Next stop', ko: '다음 정거장' },
    last: { en: 'Exit', ko: '하차' },
    lang: { en: '한국어', ko: 'English' },
    langLabel: { en: 'Switch to Korean', ko: '영어로 바꾸기' },
    status: { en: 'Stop {n} of {total}: {name}', ko: '{total}개 중 {n}번째 정거장 {name}' },
  },

  // 온보딩 팁(세 번만)
  tip: {
    kicker: { en: 'First time here', ko: '처음이라면' },
    cardTitle: { en: 'The reader is under the screen, on the right.', ko: '단말기는 화면 아래 오른쪽에 있어요' },
    cardBody: { en: 'Tap your card or phone on the black box with the green light.', ko: '초록 불이 켜진 검은 단말기에 카드나 휴대폰을 대 주세요.' },
    lensTitle: { en: 'The camera is below the screen.', ko: '카메라는 화면 아래에 있어요' },
    lensBody: { en: 'The screen is only a mirror. Look at the round lens under it when the countdown runs.', ko: '화면은 거울 역할만 하니 카운트다운이 시작되면 화면 아래 둥근 렌즈를 바라봐 주세요.' },
  },

  attract: {
    title: { en: 'Welcome to GY‑01 UrbanEdge.', ko: 'GY‑01 어반엣지역입니다' },
    sub: { en: 'A self photo booth on Gyeongju Metro. Two prints for 7,000 KRW.', ko: '경주 메트로의 셀프 사진관이에요. 7,000원에 두 장을 인화해요.' },
    touch: { en: 'Touch to start', ko: '터치해서 시작' },
  },

  language: {
    title: { en: 'Choose a language', ko: '언어 선택' },
    kicker: { en: 'Choose a language  /  언어를 고르세요', ko: 'Choose a language  /  언어를 고르세요' },
  },

  intro: {
    title: { en: 'Four stops to your prints.', ko: '네 정거장이면 인화물이 나와요' },
    body: { en: 'Pay first, choose cuts and a frame, pose at the lens, then collect two prints at Exit 1.', ko: '먼저 결제하고 컷 수와 프레임을 고른 뒤 렌즈 앞에서 촬영하면 1번 출구로 두 장이 나와요.' },
    stops: [
      { en: 'Pay', ko: '결제', sub: { en: '7,000 KRW', ko: '7,000원' } },
      { en: 'Choose', ko: '선택', sub: { en: 'Cuts and frame', ko: '컷 수와 프레임' } },
      { en: 'Pose', ko: '촬영', sub: { en: 'At the lens below', ko: '아래 렌즈 앞에서' } },
      { en: 'Print', ko: '인화', sub: { en: 'Two copies, Exit 1', ko: '1번 출구에서 두 장' } },
    ],
  },

  cuts: {
    title: { en: 'How many cuts?', ko: '몇 컷을 찍을까요?' },
    sub: { en: 'Each cut gets its own {sec}-second countdown.', ko: '컷마다 {sec}초 카운트다운이 있어요.' },
    four: { en: '4 cuts', ko: '4컷' },
    eight: { en: '8 cuts', ko: '8컷' },
    fourBody: { en: 'Quick and classic', ko: '빠르고 기본적인 구성' },
    eightBody: { en: 'More poses, pick your best', ko: '포즈를 더 찍고 골라 담기' },
  },

  frame: {
    title: { en: 'Pick a frame.', ko: '프레임을 고르세요' },
    sub: { en: 'Swipe sideways. Each print carries today’s date.', ko: '옆으로 밀어 보세요. 인화물마다 오늘 날짜가 찍혀요.' },
    use: { en: 'Use this frame', ko: '이 프레임으로' },
    slots: { en: '{n} photos on the print', ko: '사진 {n}장 인화' },
    label: { en: 'Frames', ko: '프레임 목록' },
  },

  pay: {
    title: { en: 'How would you like to pay?', ko: '결제 방법을 고르세요' },
    fare: { en: 'Fare', ko: '요금' },
    amount: { en: '7,000 KRW', ko: '7,000원' },
    printsLine: { en: '{n} prints of your strip', ko: '인화물 {n}장' },
    methodsLabel: { en: 'Payment methods', ko: '결제 수단' },
    methods: {
      card: { title: { en: 'Card', ko: '카드' }, body: { en: 'Insert into the slot', ko: '투입구에 꽂기' } },
      samsung: { title: { en: 'Samsung Pay', ko: '삼성페이' }, body: { en: 'Hold your phone', ko: '휴대폰 대기' } },
      cash: { title: { en: 'Cash', ko: '현금' }, body: { en: 'Bills only', ko: '지폐만 가능' } },
      coupon: { title: { en: 'Coupon', ko: '쿠폰' }, body: { en: 'QR or code', ko: 'QR 또는 코드' } },
    },
    cardTitle: { en: 'Insert your card.', ko: '카드를 꽂아 주세요' },
    cardHint: { en: 'Drag the card down into the slot', ko: '카드를 아래 투입구로 끌어 내리세요' },
    phoneHint: { en: 'Drag the phone down onto the reader', ko: '휴대폰을 아래 단말기로 끌어 내리세요' },
    reading: { en: 'Reading', ko: '읽는 중' },
    readerOkCard: { en: 'Take your card', ko: '카드를 가져가세요' },
    readerOkPhone: { en: 'Approved', ko: '승인됐어요' },
    cardAria: { en: 'Card. Press Enter to insert it into the slot.', ko: '카드. 엔터를 누르면 투입구에 꽂아요.' },
    phoneAria: { en: 'Phone. Press Enter to tap it on the reader.', ko: '휴대폰. 엔터를 누르면 단말기에 대요.' },
    simInsert: { en: 'Insert the card', ko: '카드 꽂기' },
    simPhone: { en: 'Tap the phone', ko: '휴대폰 대기' },
    samsungTitle: { en: 'Tap your phone.', ko: '휴대폰을 대 주세요' },
    readerHint: { en: 'Under the screen, on the right', ko: '화면 아래 오른쪽' },
    simTap: { en: 'Simulate a tap', ko: '대기 시뮬레이션' },
    processing: { en: 'Checking with the bank', ko: '승인 중이에요' },
    cashTitle: { en: 'Insert 7,000 KRW in bills.', ko: '지폐로 7,000원을 넣어 주세요' },
    cashHint: { en: 'The bill slot is under the screen.', ko: '지폐 투입구는 화면 아래에 있어요.' },
    simBill: { en: 'Simulate a bill', ko: '지폐 투입 시뮬레이션' },
    couponTitle: { en: 'Type your coupon code.', ko: '쿠폰 코드를 입력하세요' },
    couponScanTitle: { en: 'Hold the QR up to the lens.', ko: '렌즈 앞에 QR을 보여 주세요' },
    couponScanHint: { en: 'The lens is right below the screen.', ko: '렌즈는 화면 바로 아래에 있어요.' },
    simScan: { en: 'Simulate a scan', ko: '스캔 시뮬레이션' },
    couponApply: { en: 'Apply', ko: '적용' },
    couponBad: { en: 'That code does not match. Check each character.', ko: '코드가 맞지 않아요. 글자를 다시 확인해 주세요.' },
    couponLine: { en: 'Coupon {code}', ko: '쿠폰 {code}' },
    paidTitle: { en: 'Paid.', ko: '결제 완료' },
    paidBody: { en: 'Next, choose your cuts.', ko: '이어서 컷 수를 고르세요.' },
    paidCoupon: { en: 'Coupon accepted. Next, choose your cuts.', ko: '쿠폰을 확인했어요. 이어서 컷 수를 고르세요.' },
    failTitle: { en: 'Card declined.', ko: '승인되지 않았어요' },
    failBody: { en: 'Nothing was charged. Try again or pick another way.', ko: '청구되지 않았어요. 다시 시도하거나 다른 수단을 골라 주세요.' },
    retry: { en: 'Try again', ko: '다시 시도' },
    useScan: { en: 'Scan a QR instead', ko: 'QR로 하기' },
    useType: { en: 'Type the code instead', ko: '코드 입력으로 하기' },
    codeEmpty: { en: 'UE-XXXX-XXXX', ko: 'UE-XXXX-XXXX' },
    change: { en: 'Change method', ko: '수단 바꾸기' },
    continue: { en: 'Continue', ko: '계속' },
    del: { en: 'Delete', ko: '지우기' },
    codeKeys: { en: 'Coupon code keypad', ko: '쿠폰 코드 키패드' },
  },

  guide: {
    title: { en: 'Pose ideas for {room}', ko: '{room} 포즈 아이디어' },
    tip: { en: 'Eyes on the lens below. Move freely between cuts.', ko: '시선은 아래 렌즈에 두고, 컷 사이에는 자유롭게 움직이세요.' },
  },

  ready: {
    start: { en: 'Start shooting', ko: '촬영 시작' },
  },

  shoot: {
    firstUp: { en: 'First cut coming up.', ko: '곧 첫 컷이에요' },
    rest: { en: 'Change your pose.', ko: '포즈를 바꿔 보세요' },
    last: { en: 'That was the last cut.', ko: '촬영이 끝났어요' },
    pose: { en: 'Try this', ko: '이렇게 해 보세요' },
    cutOf: { en: 'Cut {n} of {total}', ko: '{total}컷 중 {n}번째' },
    cuts: { en: 'Cuts', ko: '컷' },
  },

  select: {
    titleArrange: { en: 'Arrange your strip.', ko: '컷 순서를 정하세요' },
    titlePick: { en: 'Keep your best {n}.', ko: '마음에 드는 {n}컷을 고르세요' },
    hint: { en: 'Tap shots in order, or drag them into slots.', ko: '컷을 순서대로 누르거나 칸으로 끌어 놓으세요.' },
    tray: { en: 'Your shots', ko: '찍은 컷' },
    stripOrder: { en: 'Print order', ko: '인화 순서' },
    slotN: { en: 'Slot {n}', ko: '{n}번 칸' },
    shotN: { en: 'Shot {n}', ko: '{n}번 컷' },
    retake: { en: 'Retake', ko: '다시 찍기' },
    print: { en: 'Print', ko: '인화하기' },
  },

  print: {
    title: { en: 'Printing now.', ko: '인화하고 있어요' },
    titleDone: { en: 'Your prints are ready.', ko: '인화가 끝났어요' },
    sub: { en: 'While you wait, drop a platform stamp or a note on it.', ko: '기다리는 동안 승강장 스탬프나 메모를 올려 보세요.' },
    stamps: { en: 'Platform stamps', ko: '승강장 스탬프' },
    noteAdd: { en: 'Add a note', ko: '메모 남기기' },
    notePlaceholder: { en: 'Type a note for the print', ko: '인화물에 넣을 메모를 입력하세요' },
    clear: { en: 'Clear stamps', ko: '스탬프 지우기' },
    progress: { en: 'Print progress', ko: '인화 진행' },
    locked: { en: 'The print is final now.', ko: '인화가 끝나 더 바꿀 수 없어요.' },
    toFinish: { en: 'Get my prints', ko: '인화물 받기' },
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
    title: { en: 'Your prints are in the tray below.', ko: '인화물은 아래 트레이에 있어요' },
    body: { en: 'Two copies drop at Exit 1. Thanks for riding Gyeongju Metro.', ko: '1번 출구로 두 장이 나와요. 이용해 주셔서 고마워요.' },
    exit: { en: 'Exit', ko: '출구' },
    exitSub: { en: 'Prints this way', ko: '인화물은 이쪽' },
    qrTitle: { en: 'Scan for your photos', ko: '스캔해서 사진 받기' },
    qrBody: { en: 'Open the result page on your phone to save photos and video.', ko: '휴대폰에서 결과 페이지를 열어 사진과 영상을 저장하세요.' },
    toStart: { en: 'Start over', ko: '처음으로' },
  },

  idle: {
    title: { en: 'Still there?', ko: '계속 이용하시나요?' },
    body: { en: 'This ride resets in {sec} seconds.', ko: '{sec}초 뒤에 처음 화면으로 돌아가요.' },
    keep: { en: 'Keep going', ko: '계속하기' },
    home: { en: 'Start over', ko: '처음으로' },
  },
}

// 승강장(방) 3곳: 이름은 브랜드 사실, 설명은 웹 사이트 데이터와 같은 뜻이다.
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
