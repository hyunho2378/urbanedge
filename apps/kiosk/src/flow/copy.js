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
    station: { en: 'UrbanEdge', ko: '어반엣지' },
    platformN: { en: 'Platform {n}', ko: '{n}번 승강장' },
    zoomClose: { en: 'Tap to close', ko: '눌러서 닫기' },
    zoomOpen: { en: 'Enlarge', ko: '크게 보기' },
  },

  // 상단 길찾기 표지
  rail: {
    where: { en: 'Platform {n}, {platform}', ko: '{n}번 승강장 {platform}' },
    next: { en: 'Next', ko: '다음' },
    last: { en: 'Done', ko: '완료' },
    lang: { en: '한국어', ko: 'English' },
    langLabel: { en: 'Switch to Korean', ko: '영어로 바꾸기' },
    status: { en: 'Step {n} of {total}: {name}', ko: '{total}단계 중 {n}단계 {name}' },
  },

  attract: {
    title: { en: 'UrbanEdge', ko: '어반엣지' },
    sub: { en: 'Self photo studio', ko: '셀프 사진관' },
    touch: { en: 'Touch to start', ko: '화면을 눌러 시작' },
  },

  language: {
    title: { en: 'Language', ko: '언어' },
  },

  cuts: {
    title: { en: 'Number of cuts', ko: '촬영 컷 수' },
    sub: { en: '{sec}-second countdown per cut', ko: '컷마다 {sec}초 뒤에 찍혀요' },
    four: { en: '4 cuts', ko: '4컷' },
    eight: { en: '8 cuts', ko: '8컷' },
    fourBody: { en: '4 photos', ko: '사진 4장' },
    eightBody: { en: 'Keep your favorites', ko: '마음에 드는 컷만 인화' },
  },

  frame: {
    title: { en: 'Frame', ko: '프레임 선택' },
    sub: { en: 'Swipe to browse', ko: '옆으로 밀어 고르기' },
    use: { en: 'Select', ko: '선택' },
    slots: { en: '{n} photos per print', ko: '사진 {n}장' },
    label: { en: 'Frames', ko: '프레임 목록' },
  },

  pay: {
    title: { en: 'Payment method', ko: '결제 수단' },
    fare: { en: 'Total', ko: '결제 금액' },
    amount: { en: '{price} KRW', ko: '{price}원' },
    due: { en: 'Left to pay: {price} KRW', ko: '남은 금액 {price}원' },
    couponPartial: { en: 'Coupon applied. Pay the rest by card.', ko: '쿠폰이 적용되었습니다. 남은 금액은 카드로 결제하세요.' },
    methodsLabel: { en: 'Payment methods', ko: '결제 수단' },
    methods: {
      card: { title: { en: 'Card', ko: '카드' }, body: { en: 'Insert', ko: '꽂기' } },
      samsung: { title: { en: 'Samsung Pay', ko: '삼성페이' }, body: { en: 'Tap phone', ko: '휴대폰 대기' } },
      cash: { title: { en: 'Cash', ko: '현금' }, body: { en: 'Bills only', ko: '지폐만' } },
      coupon: { title: { en: 'Coupon', ko: '쿠폰' }, body: { en: 'QR or code', ko: 'QR 또는 코드' } },
    },
    cardTitle: { en: 'Insert your card', ko: '카드를 꽂으세요' },
    cardHint: { en: 'Drag the card into the slot', ko: '카드를 투입구로 끌어 놓으세요' },
    phoneHint: { en: 'Drag the phone onto the reader', ko: '휴대폰을 단말기로 끌어 놓으세요' },
    reading: { en: 'Reading', ko: '읽는 중' },
    readerOkCard: { en: 'Take your card', ko: '카드를 가져가세요' },
    readerOkPhone: { en: 'Approved', ko: '승인 완료' },
    cardAria: { en: 'Card. Press Enter to insert it into the slot.', ko: '카드. 엔터를 누르면 투입구에 꽂아요.' },
    phoneAria: { en: 'Phone. Press Enter to tap it on the reader.', ko: '휴대폰. 엔터를 누르면 단말기에 대요.' },
    simInsert: { en: 'Insert card', ko: '카드 꽂기' },
    simPhone: { en: 'Tap the phone', ko: '휴대폰 대기' },
    samsungTitle: { en: 'Tap your phone', ko: '휴대폰을 대세요' },
    readerHint: { en: 'Under the screen, on the right', ko: '화면 아래 오른쪽' },
    simTap: { en: 'Tap', ko: '대기' },
    processing: { en: 'Approving', ko: '승인 중' },
    cashTitle: { en: 'Insert {price} KRW in bills', ko: '지폐 {price}원을 넣으세요' },
    cashHint: { en: 'Bill slot: under the screen', ko: '지폐 투입구는 화면 아래' },
    simBill: { en: 'Insert bill', ko: '지폐 넣기' },
    couponTitle: { en: 'Coupon code', ko: '쿠폰 코드 입력' },
    couponScanTitle: { en: 'Show the QR to the lens', ko: '렌즈에 QR을 보여 주세요' },
    couponScanHint: { en: 'Lens: right below the screen', ko: '렌즈는 화면 바로 아래' },
    simScan: { en: 'Scan', ko: '스캔' },
    couponApply: { en: 'Apply', ko: '적용' },
    couponBad: { en: 'Invalid code', ko: '올바르지 않은 코드입니다' },
    couponLine: { en: 'Coupon {code}', ko: '쿠폰 {code}' },
    paidTitle: { en: 'Paid', ko: '결제 완료' },
    paidBody: { en: 'Choose cuts next', ko: '다음: 컷 수 선택' },
    paidCoupon: { en: 'Coupon applied', ko: '쿠폰이 적용되었습니다' },
    failTitle: { en: 'Payment failed', ko: '결제 실패' },
    failBody: { en: 'Try again or choose another method', ko: '다시 시도하거나 다른 수단을 선택하세요' },
    retry: { en: 'Try again', ko: '다시 시도' },
    useScan: { en: 'Use QR', ko: 'QR 사용' },
    useType: { en: 'Type code', ko: '코드 입력' },
    codeEmpty: { en: 'UE-XXXX-XXXX', ko: 'UE-XXXX-XXXX' },
    change: { en: 'Change method', ko: '수단 변경' },
    continue: { en: 'Continue', ko: '계속' },
    del: { en: 'Delete', ko: '지우기' },
    codeKeys: { en: 'Coupon code keypad', ko: '쿠폰 코드 키패드' },
  },

  guide: {
    title: { en: '{room} poses', ko: '{room} 포즈' },
    tip: { en: 'Look at the lens below', ko: '시선은 아래 렌즈로' },
  },

  ready: {
    start: { en: 'Start shooting', ko: '촬영 시작' },
  },

  shoot: {
    firstUp: { en: 'Get ready', ko: '준비하세요' },
    rest: { en: 'Change pose', ko: '포즈를 바꾸세요' },
    last: { en: 'Done', ko: '촬영 완료' },
    pose: { en: 'Pose', ko: '포즈' },
    cutOf: { en: 'Cut {n} of {total}', ko: '{total}컷 중 {n}번째' },
    cuts: { en: 'Cuts', ko: '컷' },
  },

  select: {
    titleArrange: { en: 'Arrange cuts', ko: '컷 순서 정하기' },
    titlePick: { en: 'Choose {n} cuts', ko: '{n}컷 선택' },
    hint: { en: 'Tap in order or drag into slots', ko: '순서대로 누르거나 칸으로 끌어 놓기' },
    tray: { en: 'Your shots', ko: '찍은 컷' },
    stripOrder: { en: 'Print order', ko: '인화 순서' },
    slotN: { en: 'Slot {n}', ko: '{n}번 칸' },
    shotN: { en: 'Shot {n}', ko: '{n}번 컷' },
    retake: { en: 'Retake', ko: '다시 찍기' },
    print: { en: 'Print', ko: '인화하기' },
  },

  print: {
    title: { en: 'Printing', ko: '인화 중' },
    titleDone: { en: 'Printing done', ko: '인화 완료' },
    sub: { en: 'Add a stamp or note while you wait', ko: '기다리는 동안 스탬프와 메모를 넣을 수 있어요' },
    stamps: { en: 'Stamps', ko: '스탬프' },
    noteAdd: { en: 'Add a note', ko: '메모 남기기' },
    notePlaceholder: { en: 'Note for the print', ko: '인화물에 넣을 메모' },
    clear: { en: 'Clear', ko: '지우기' },
    progress: { en: 'Print progress', ko: '인화 진행' },
    locked: { en: 'Edits are locked', ko: '더 이상 수정할 수 없습니다' },
    toFinish: { en: 'Next', ko: '다음' },
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
    title: { en: 'Take your prints from the tray', ko: '아래 트레이에서 인화물을 가져가세요' },
    body: { en: '2 prints', ko: '인화물 2장' },
    exit: { en: 'Tray', ko: '트레이' },
    exitSub: { en: 'Prints are here', ko: '인화물은 여기' },
    qrTitle: { en: 'Photos and video', ko: '사진과 영상 받기' },
    qrBody: { en: 'Scan to save to your phone', ko: '스캔해서 휴대폰에 저장' },
    toStart: { en: 'Start over', ko: '처음으로' },
  },

  idle: {
    title: { en: 'Still there?', ko: '계속 이용하시나요?' },
    body: { en: 'Returning to start in {sec} seconds', ko: '{sec}초 뒤 처음 화면으로 돌아갑니다' },
    keep: { en: 'Continue', ko: '계속 이용' },
    home: { en: 'Start over', ko: '처음으로' },
  },
}

// 승강장(방) 3곳: 이름은 브랜드 사실, 설명은 웹 사이트 데이터와 같은 뜻이다.
export const ROOM_COPY = {
  subway: {
    summary: { en: 'Subway car with yellow seats and straps', ko: '노란 좌석과 손잡이가 있는 지하철 객실' },
    poses: [
      { fig: 'reach', en: ['Grab the strap', 'One hand up, like the train is packed.'], ko: ['손잡이 잡기', '붐비는 열차처럼 한 손을 높이 뻗으세요.'] },
      { fig: 'sit', en: ['Take the yellow seat', 'Sit shoulder to shoulder and face the lens.'], ko: ['노란 좌석에 앉기', '어깨를 맞대고 앉아 렌즈를 바라보세요.'] },
      { fig: 'lean', en: ['Lean on the door', 'Rest a shoulder on it and look unbothered.'], ko: ['문에 기대기', '어깨를 문에 기대고 느긋한 표정을 지어 보세요.'] },
      { fig: 'duo', en: ['Squeeze in', 'Stand close, rush hour style.'], ko: ['바짝 붙어 서기', '출근 시간 열차처럼 가깝게 서세요.'] },
    ],
  },
  karaoke: {
    summary: { en: 'Karaoke room with a mic', ko: '마이크가 있는 노래방' },
    poses: [
      { fig: 'hold', en: ['Sing it', 'Mic close to your mouth, full chorus face.'], ko: ['열창하기', '마이크를 입 가까이 대고 후렴 표정을 지으세요.'] },
      { fig: 'reach', en: ['One hand up', 'Raise it when the chorus hits.'], ko: ['한 손 번쩍', '후렴이 터지는 순간처럼 손을 드세요.'] },
      { fig: 'duo', en: ['One mic, two voices', 'Lean in to share it.'], ko: ['마이크 하나로 둘이', '얼굴을 맞대고 한 마이크를 나눠 쓰세요.'] },
      { fig: 'cheer', en: ['Cheer', 'Both hands up and a big laugh.'], ko: ['환호하기', '양손을 들고 크게 웃으세요.'] },
    ],
  },
  retro: {
    summary: { en: 'Red curtain and wooden floor', ko: '붉은 커튼과 나무 바닥' },
    poses: [
      { fig: 'duo', en: ['Stand straight', 'Face the lens, arms at your sides.'], ko: ['정면 서기', '팔을 내리고 렌즈를 바라보세요.'] },
      { fig: 'lean', en: ['Rest your chin', 'Chin on hand, head tilted.'], ko: ['턱 괴기', '한 손으로 턱을 괴고 고개를 기울이세요.'] },
      { fig: 'reach', en: ['Peace by the curtain', 'Raise a hand and flash a V.'], ko: ['커튼 앞 브이', '손을 들어 브이를 하세요.'] },
      { fig: 'duo', en: ['Back to back', 'Stand with your backs together.'], ko: ['등 맞대기', '일행과 등을 맞대고 서세요.'] },
    ],
  },
}
