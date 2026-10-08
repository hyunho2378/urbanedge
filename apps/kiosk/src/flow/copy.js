// copy.js: 키오스크 화면의 모든 문구. 노드는 { ko, en } 형태이고 tr()로 언어를 고른다.
// 한국어는 명사형 정보 전달과 두괄식으로 쓴다. {name} 자리는 vars로 채운다.
// 시간 수치는 flow/config.js의 값만 문구에 넣는다(장당 촬영 시간).

export function tr(node, lang, vars) {
  if (node == null) return ''
  const v = node[lang] ?? node.ko
  if (!vars || typeof v !== 'string') return v
  return v.replace(/\{(\w+)\}/g, (_, k) => (vars[k] == null ? '' : String(vars[k])))
}

export const COPY = {
  common: {
    back: { ko: '이전', en: 'Back' },
    next: { ko: '다음', en: 'Next' },
    home: { ko: '처음으로', en: 'Start over' },
    selected: { ko: '선택됨', en: 'Selected' },
    sample: { ko: '샘플 화면', en: 'Sample view' },
    live: { ko: '카메라 연결됨', en: 'Camera on' },
    cameraBelow: { ko: '카메라는 이 화면 아래에 있어요', en: 'The camera is below this screen' },
    lensBelow: { ko: '렌즈는 이 화면 바로 아래', en: 'The lens is right below this screen' },
    lens: { ko: '렌즈', en: 'Lens' },
    progress: { ko: '진행 단계', en: 'Progress' },
    thisRoom: { ko: '지금 이 방', en: 'You are here' },
  },

  attract: {
    kicker: { ko: 'EVERY SHOT IS A JOURNEY!', en: 'EVERY SHOT IS A JOURNEY!' },
    title1: { ko: 'Beyond the Lens,', en: 'Beyond the Lens,' },
    title2: { ko: 'Into the Streets', en: 'Into the Streets' },
    sub: { ko: '렌즈 너머, 거리 속으로', en: 'Gyeongju Hwangridan-gil' },
    touchEn: { ko: 'Touch to start', en: 'Touch to start' },
    touchKo: { ko: '화면을 터치해 주세요', en: '화면을 터치해 주세요' },
    samples: { ko: '이런 인화물이 나와요', en: 'Prints made here' },
    pause: { ko: '움직임 멈추기', en: 'Pause motion' },
    play: { ko: '움직임 다시 켜기', en: 'Resume motion' },
  },

  language: {
    title: { ko: '언어를 선택해 주세요', en: 'Choose your language' },
    titleAlt: { ko: 'Choose your language', en: '언어를 선택해 주세요' },
    ko: { ko: '한국어', en: '한국어' },
    en: { ko: 'English', en: 'English' },
    koSub: { ko: '한국어로 안내해요', en: 'Guide in Korean' },
    enSub: { ko: '영어로 안내해요', en: 'Guide in English' },
  },

  intro: {
    pageLabel: {
      ko: ['01 이용 순서', '02 카메라 위치', '03 서는 곳과 인화물'],
      en: ['01 How it works', '02 Camera position', '03 Where to stand'],
    },
    a: {
      title: { ko: '네 단계로 끝나요', en: 'Four steps to your print' },
      note: { ko: '걸리는 시간은 촬영 컷 수에 따라 달라요', en: 'Total time depends on the number of shots' },
      steps: {
        ko: [
          { t: '고르기', d: '컷 수와 프레임을 정해요' },
          { t: '준비하기', d: '포즈와 보정을 확인해요' },
          { t: '촬영하기', d: '카운트다운에 맞춰 렌즈를 봐요' },
          { t: '받아가기', d: '마음에 드는 컷으로 인화 2장이 나와요' },
        ],
        en: [
          { t: 'Choose', d: 'Pick the shot count and frame' },
          { t: 'Prepare', d: 'Check poses and retouch' },
          { t: 'Shoot', d: 'Look at the lens on the countdown' },
          { t: 'Collect', d: 'Two prints of your favorite shots' },
        ],
      },
    },
    b: {
      title: { ko: '시선은 화면 아래 렌즈로', en: 'Eyes on the lens below' },
      body: {
        ko: '카메라는 화면 바로 아래에 있어요',
        en: 'The camera sits right below the screen',
      },
      tiles: {
        ko: [
          { t: '화면', d: '내 모습을 확인하는 곳' },
          { t: '렌즈', d: '사진에 담기는 시선' },
        ],
        en: [
          { t: 'Screen', d: 'Where you check yourself' },
          { t: 'Lens', d: 'Where your gaze is captured' },
        ],
      },
      screenLabel: { ko: '화면은 확인용', en: 'Screen is a mirror' },
      lensLabel: { ko: '카메라 렌즈', en: 'Camera lens' },
    },
    c: {
      title: { ko: '서는 곳과 받는 곳', en: 'Stand and collect' },
      stand: { ko: '서는 곳', en: 'Where to stand' },
      standBody: {
        ko: '렌즈 정면에 일행과 나란히 서요',
        en: 'Stand in front of the lens, side by side with your group',
      },
      move: { ko: '촬영 중 자리를 옮겨도 돼요', en: 'You can move between shots' },
      slot: { ko: '인화물이 나오는 곳', en: 'Where prints come out' },
      slotLabel: { ko: '출구 슬롯', en: 'Exit slot' },
      slotBody: {
        ko: '기기 아래 출구 슬롯에서 나와 흰색 트레이에 놓여요',
        en: 'Prints slide out of the slot at the bottom onto the white tray',
      },
      you: { ko: '나', en: 'You' },
      wall: { ko: '기기', en: 'Device' },
    },
    dots: { ko: '안내 {n} / {total}', en: 'Guide {n} / {total}' },
  },

  cuts: {
    title: { ko: '몇 컷으로 찍을까요', en: 'How many shots?' },
    four: {
      name: { ko: '4컷', en: '4 shots' },
      big: { ko: '4', en: '4' },
      unit: { ko: '컷', en: 'shots' },
      how: { ko: '4장을 찍고 전부 프레임에 담아요', en: 'Take 4 photos and use all of them' },
      count: { ko: '촬영 횟수 4회', en: '4 shots taken' },
      pick: { ko: '컷 선택 없음', en: 'No picking' },
    },
    eight: {
      name: { ko: '8컷', en: '8 shots' },
      big: { ko: '8', en: '8' },
      unit: { ko: '컷', en: 'shots' },
      how: { ko: '8장을 찍고 마음에 드는 4장을 골라요', en: 'Take 8 photos and pick your favorite 4' },
      count: { ko: '촬영 횟수 8회', en: '8 shots taken' },
      pick: { ko: '8장 중 4장 선택', en: 'Pick 4 of 8' },
    },
    per: { ko: '1회 촬영 {sec}초', en: '{sec} sec per shot' },
    chosenFrame: { ko: '프레임 칸은 항상 4개예요', en: 'Every frame has 4 photo slots' },
  },

  frame: {
    title: { ko: '프레임을 골라 주세요', en: 'Choose a frame' },
    preview: { ko: '선택한 프레임', en: 'Your frame' },
    cutsLine: { ko: '{n}컷으로 촬영', en: 'Shooting {n} shots' },
    families: {
      signature: { ko: 'Signature Cut', en: 'Signature Cut' },
      layer: { ko: 'Layer Cut', en: 'Layer Cut' },
    },
    variants: {
      strip: { ko: '스트립', en: 'Strip' },
      grid: { ko: '그리드', en: 'Grid' },
      hero: { ko: '히어로', en: 'Hero' },
      side: { ko: '사이드', en: 'Side' },
    },
    noteFamily: {
      signature: { ko: '같은 크기 사진을 가지런히 배열해요', en: 'Equal-sized photos in a clean layout' },
      layer: { ko: '큰 사진 하나에 작은 사진을 겹쳐 쌓아요', en: 'One large photo with smaller ones layered around it' },
    },
  },

  guide: {
    title: { ko: '촬영 가이드', en: 'Shooting guide' },
    poses: { ko: '이 방에 어울리는 포즈', en: 'Poses that suit this room' },
    tipsTitle: { ko: '알아두면 좋아요', en: 'Good to know' },
    tips: {
      ko: [
        { t: '렌즈는 화면 아래', d: '화면 아래 렌즈를 바라봐요' },
        { t: '턱은 살짝 위로', d: '정면보다 조금 들면 얼굴선이 살아나요' },
        { t: '촬영 사이에는 이동 가능', d: '쉬는 동안 자세와 자리를 바꿔요' },
      ],
      en: [
        { t: 'Lens is below the screen', d: 'Look at the lens under the display' },
        { t: 'Chin slightly up', d: 'Lift a little above straight-on to sharpen your jawline' },
        { t: 'Move between shots', d: 'Change pose and position while you rest' },
      ],
    },
  },

  retouch: {
    title: { ko: '보정 설정', en: 'Retouch' },
    live: { ko: '화면 속 모습으로 바로 확인해요', en: 'Check the result live' },
    skin: { ko: '피부 보정', en: 'Skin smoothing' },
    skinOn: { ko: '켜짐', en: 'On' },
    skinOff: { ko: '꺼짐', en: 'Off' },
    skinLevels: { ko: ['약', '보통', '강'], en: ['Soft', 'Medium', 'Strong'] },
    brightness: { ko: '밝기', en: 'Brightness' },
    brightLevels: { ko: ['어둡게', '기본', '밝게'], en: ['Darker', 'Normal', 'Brighter'] },
    filter: { ko: '필터', en: 'Filter' },
    filters: {
      original: { ko: '원본', en: 'Original' },
      mono: { ko: '흑백', en: 'Mono' },
      film: { ko: '필름', en: 'Film' },
      flash: { ko: '플래시 옐로우', en: 'Flash Yellow' },
    },
  },

  ready: {
    title: { ko: '카메라 확인', en: 'Camera check' },
    guideLine: { ko: '얼굴을 안내선 안에 맞춰 주세요', en: 'Fit your face inside the guide' },
    checks: {
      ko: [
        '얼굴이 안내선 안에 오게 서요',
        '눈은 화면 아래 렌즈에',
        '촬영은 {cuts}컷, 컷마다 {sec}초 카운트다운',
      ],
      en: [
        'Stand so your face fits the guide',
        'Eyes on the lens below the screen',
        '{cuts} shots, {sec} second countdown each',
      ],
    },
    start: { ko: '준비되면 촬영 시작', en: 'Start when ready' },
    fallback: { ko: '웹캠을 찾지 못해 샘플 화면으로 보여줘요', en: 'No webcam found, showing a sample view' },
  },

  shoot: {
    shotOf: { ko: '컷 {n} / {total}', en: 'Shot {n} / {total}' },
    getReady: { ko: '렌즈를 바라봐 주세요', en: 'Look at the lens' },
    firstUp: { ko: '곧 첫 컷이 시작돼요', en: 'First shot starts soon' },
    rest: { ko: '잠깐 쉬어요', en: 'Short break' },
    restBody: { ko: '자세를 바꾸거나 자리를 옮겨도 돼요', en: 'Change pose or move around' },
    last: { ko: '마지막 컷까지 찍었어요', en: 'All shots taken' },
    lookLens: { ko: '시선은 화면 아래 렌즈로', en: 'Eyes on the lens below' },
    pose: { ko: '이번 컷 제안', en: 'Pose idea' },
    flashHint: { ko: '셔터와 함께 조명이 밝아져요', en: 'The light bars brighten at the shutter' },
  },

  select: {
    titleEight: { ko: '마음에 드는 4장을 골라 주세요', en: 'Pick your favorite 4' },
    titleFour: { ko: '촬영한 4장을 확인해 주세요', en: 'Check your 4 shots' },
    tapHint: { ko: '눌러서 선택하고, 다시 누르면 취소돼요', en: 'Tap to select, tap again to cancel' },
    count: { ko: '선택 {n} / 4', en: 'Selected {n} / 4' },
    shot: { ko: '컷 {n}', en: 'Shot {n}' },
    preview: { ko: '프레임 미리보기', en: 'Frame preview' },
    retake: { ko: '다시 찍기', en: 'Retake' },
    print: { ko: '이대로 인화하기', en: 'Print this' },
    needMore: { ko: '4장을 모두 골라 주세요', en: 'Pick all 4 to continue' },
  },

  print: {
    title: { ko: '인화 중이에요', en: 'Printing your photos' },
    titleDone: { ko: '인화가 끝났어요', en: 'Your prints are ready' },
    progress: { ko: '인화 진행', en: 'Print progress' },
    pct: { ko: '{n}%', en: '{n}%' },
    waitLine: { ko: '기다리는 동안 스탬프와 메시지를 남겨 보세요', en: 'While you wait, add stamps and a message' },
    doneLine: { ko: '아래 출구의 흰색 트레이를 확인해 주세요', en: 'Check the white tray below' },
    locked: { ko: '인화가 끝나 더 바꿀 수 없어요', en: 'Printing is done, edits are locked' },
    tabs: {
      stamp: { ko: '노선 스탬프', en: 'Route stamps' },
      message: { ko: '한 줄 메시지', en: 'One-line message' },
      rooms: { ko: '다른 방 소개', en: 'Other rooms' },
    },
    stampHint: { ko: '찍고 싶은 방의 스탬프를 눌러 보세요', en: 'Tap a room stamp to put it on your print' },
    stampOn: { ko: '찍힘', en: 'Stamped' },
    msgHint: { ko: '인화물 아래쪽에 한 줄로 들어가요', en: 'It prints as one line at the bottom' },
    msgPlaceholder: { ko: '여기에 남길 말을 적어 보세요', en: 'Type your message here' },
    msgLimit: { ko: '{n} / {max}', en: '{n} / {max}' },
    roomsHint: { ko: '다음엔 다른 방에서 찍어 보세요', en: 'Next time, try another room' },
    toFinish: { ko: '완료', en: 'Finish' },
  },

  keyboard: {
    toKo: { ko: '한글', en: '한글' },
    toEn: { ko: 'ENG', en: 'ENG' },
    space: { ko: '띄어쓰기', en: 'Space' },
    del: { ko: '지우기', en: 'Delete' },
    shift: { ko: '쌍자음', en: 'Shift' },
    shiftEn: { ko: '대문자', en: 'Shift' },
    enter: { ko: '입력 완료', en: 'Done' },
    clear: { ko: '모두 지우기', en: 'Clear' },
    groupKo: { ko: '한글 키보드', en: 'Korean keyboard' },
    groupEn: { ko: '영문 키보드', en: 'English keyboard' },
  },

  finish: {
    title: { ko: '인화물은 아래 출구에서 나와요', en: 'Your prints come out below' },
    body: { ko: '기기 아래 슬롯의 흰색 트레이에서 가져가세요', en: 'Take them from the white tray under the slot' },
    prints: { ko: '인화 2장', en: '2 prints' },
    qrTitle: { ko: '사진을 올려 주세요', en: 'Share your shot' },
    qrBody: { ko: '인스타그램에서 태그해 주세요', en: 'Tag us on Instagram' },
    qrNote: { ko: '화면 속 QR 모양은 자리표시예요', en: 'The QR pattern here is a placeholder' },
    routeTitle: { ko: '다른 방도 찍어 보세요', en: 'Try the other rooms' },
    toStart: { ko: '처음으로', en: 'Start over' },
  },

  idle: {
    title: { ko: '계속 이용하시겠어요?', en: 'Still there?' },
    body: { ko: '{sec}초 뒤에 처음 화면으로 돌아가요', en: 'Returning to the start in {sec} seconds' },
    keep: { ko: '계속하기', en: 'Keep going' },
    home: { ko: '처음으로', en: 'Start over' },
  },
}

// 방 5곳: 이름은 브랜드 사실, 설명은 웹 사이트 데이터와 같은 문장이다.
export const ROOM_COPY = {
  subway: {
    title: { ko: '지하철 칸', en: 'Subway Car' },
    summary: { ko: '노란 좌석과 손잡이가 놓인 지하철 객실 세트', en: 'A subway-car set with yellow seats and hand straps' },
    poses: [
      { fig: 'reach', ko: ['손잡이 잡기', '한 손을 높이 뻗어 손잡이를 잡아요'], en: ['Grab the strap', 'Reach up and hold the hand strap'] },
      { fig: 'sit', ko: ['나란히 앉기', '노란 좌석에 나란히 앉아 정면을 봐요'], en: ['Sit side by side', 'Sit on the yellow seats and face the lens'] },
      { fig: 'lean', ko: ['문에 기대 서기', '문에 어깨를 기대고 여유롭게 서요'], en: ['Lean on the door', 'Rest a shoulder on the door'] },
      { fig: 'duo', ko: ['어깨 맞대기', '일행과 어깨를 맞대고 붙어 서요'], en: ['Shoulder to shoulder', 'Stand close with your group'] },
    ],
  },
  karaoke: {
    title: { ko: '노래방', en: 'Karaoke Booth' },
    summary: { ko: '마이크를 들고 찍는 노래방 부스', en: 'A karaoke booth made for mic-in-hand poses' },
    poses: [
      { fig: 'hold', ko: ['마이크 잡고 열창', '마이크를 입 가까이 대고 노래해요'], en: ['Sing into the mic', 'Hold the mic close and belt it'] },
      { fig: 'reach', ko: ['한 손 번쩍', '후렴처럼 한 손을 번쩍 들어요'], en: ['One hand up', 'Raise a hand like the chorus'] },
      { fig: 'duo', ko: ['둘이 한 마이크', '한 마이크에 얼굴을 맞대요'], en: ['Share a mic', 'Lean in to one microphone'] },
      { fig: 'cheer', ko: ['박수 치며 웃기', '양손을 들고 신나게 웃어요'], en: ['Cheer and laugh', 'Hands up and big smiles'] },
    ],
  },
  phone: {
    title: { ko: '공중전화', en: 'Public Phone' },
    summary: { ko: '수화기를 든 장면을 찍는 공중전화 부스', en: 'A phone-booth set for receiver-in-hand shots' },
    poses: [
      { fig: 'hold', ko: ['수화기 귀에 대기', '수화기를 귀에 대고 통화하는 척해요'], en: ['Receiver to ear', 'Pretend to be mid-call'] },
      { fig: 'reach', ko: ['수화기 건네기', '수화기를 일행에게 내밀어요'], en: ['Hand it over', 'Pass the receiver to a friend'] },
      { fig: 'lean', ko: ['유리문에 기대기', '부스 벽에 기대 한쪽 다리를 꼬아요'], en: ['Lean on the booth', 'Rest against the wall, legs crossed'] },
      { fig: 'duo', ko: ['번갈아 통화', '둘이 수화기 하나를 나눠 써요'], en: ['Take turns', 'Share one receiver'] },
    ],
  },
  retro: {
    title: { ko: '레트로', en: 'Retro' },
    summary: { ko: '커튼과 나무 의자가 있는 레트로 부스', en: 'A retro booth with a curtain and wooden stools' },
    poses: [
      { fig: 'sit', ko: ['의자에 앉아 정면', '나무 의자에 앉아 정면을 바라봐요'], en: ['Sit and face front', 'Sit on the wooden stool'] },
      { fig: 'lean', ko: ['턱 괴기', '한 손으로 턱을 괴고 고개를 기울여요'], en: ['Rest your chin', 'Chin on hand, head tilted'] },
      { fig: 'reach', ko: ['커튼 앞 브이', '커튼 앞에서 손을 들어 브이를 해요'], en: ['V sign by the curtain', 'Raise a hand and flash a V'] },
      { fig: 'duo', ko: ['등 맞대기', '일행과 등을 맞대고 서요'], en: ['Back to back', 'Stand back to back'] },
    ],
  },
  toilet: {
    title: { ko: '화장실', en: 'Toilet' },
    summary: { ko: '타일 벽 앞에서 찍는 화장실 세트', en: 'A tiled restroom set' },
    poses: [
      { fig: 'hold', ko: ['거울 보는 포즈', '거울을 보듯 머리를 매만져요'], en: ['Mirror check', 'Fix your hair like at a mirror'] },
      { fig: 'lean', ko: ['타일 벽에 기대기', '타일 벽에 기대 시크하게 서요'], en: ['Lean on the tiles', 'Lean against the tiled wall'] },
      { fig: 'reach', ko: ['한 손 짚기', '벽에 한 손을 짚고 렌즈를 봐요'], en: ['Hand on the wall', 'Brace a hand on the wall'] },
      { fig: 'duo', ko: ['나란히 줄 서기', '일행과 줄을 선 듯 나란히 서요'], en: ['Line up', 'Stand in a line with your group'] },
    ],
  },
}
