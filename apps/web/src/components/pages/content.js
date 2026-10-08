// content.js: W2 하위 페이지가 공유하는 사진 목록과 방별 상세 문구.
// 사진은 apps/web/public/img 의 실제 파일이며, 방 배정은 사진을 직접 보고 정했다.
// 수치와 사실은 docs/AGENT_CONTRACTS.md 의 현장 사실과 data/site.js 에 있는 것만 쓴다.
import { ROOMS } from '../../data/site.js'

// public/img/lg 에 큰 원본이 있는 파일. 확대 보기에서 우선 사용한다.
const LARGE = new Set([
  'o_01', 'o_02', 'o_04', 'o_05', 'o_17', 'o_18', 'o_19', 'o_20', 'o_21', 'o_22', 'o_23', 'o_24',
  'o_26', 'o_27', 'o_28', 'o_29', 'o_30', 'o_31', 'o_52', 'biz_00', 'biz_02', 'biz_07', 'biz_09',
])

// [너비, 높이, 한국어 대체 텍스트, 영어 대체 텍스트]
const RAW = {
  o_21: [1100, 825, '검은 외관에 UrbanEdge 간판이 붙고 체커보드 바닥이 이어지는 매장 외관', 'The storefront with a black facade, the UrbanEdge sign and a checkerboard floor'],
  o_34: [825, 1100, '골목에서 바라본 어반엣지 매장 입구와 체커보드 바닥', 'The UrbanEdge entrance and checkerboard floor seen from the alley'],
  o_24: [825, 1100, '둥근 빨간 거울 아홉 개가 붙은 벽에 체커보드 바닥이 비친 모습', 'A wall of nine round red mirrors reflecting the checkerboard floor'],
  o_43: [825, 1100, '빨간 테두리의 둥근 거울 벽과 체커보드 바닥', 'The red-rimmed round mirror wall above the checkerboard floor'],
  o_18: [1100, 825, '파란 타일과 흰 타일 벽 앞에 노란 대기 의자가 놓인 안쪽 공간', 'The inner space with yellow seats in front of blue and white tiled walls'],
  o_36: [825, 1100, '파란 타일 벽과 노란 포스터 앞의 노란 대기 의자', 'Yellow seats under a blue-tiled wall with yellow posters'],
  o_35: [825, 1100, '체커보드 바닥 위 라바콘과 경고 테이프가 붙은 셔터', 'Traffic cones on a checkerboard floor in front of a shutter wrapped in caution tape'],
  o_20: [825, 1100, '경고 테이프가 붙은 셔터와 라바콘, 체커보드 바닥', 'A shutter with caution tape, cones and a checkerboard floor'],
  o_44: [825, 1100, '노선도 포스터와 손님 인화지가 빽빽하게 붙은 파란 타일 벽', 'A blue tiled wall covered with a route-map poster and guests prints'],
  o_17: [825, 1100, '갈색 커튼 앞에 나무 의자 두 개와 나무 상자가 놓인 레트로 방', 'The Retro room with two wooden stools and a wooden box in front of a brown curtain'],
  o_39: [825, 1100, '갈색 커튼과 나무 의자 두 개', 'A brown curtain and two wooden stools'],
  o_29: [825, 1100, '손잡이가 달린 봉과 스테인리스 문, 양옆 벤치가 있는 지하철 방', 'The Subway room with a hand-strap rail, steel doors and benches on both sides'],
  o_27: [825, 1100, '스테인리스 문틀 안쪽으로 지하철 객실 문이 보이는 방', 'A steel door frame opening onto the subway car doors'],
  o_19: [825, 1100, '창이 달린 스테인리스 지하철 문과 문 위에 붙은 인화물', 'Steel subway doors with windows and prints taped above them'],
  o_41: [825, 1100, '손잡이가 걸린 스테인리스 지하철 문', 'Steel subway doors with hand straps'],
  o_37: [733, 1100, '지하철 문 앞에서 손잡이를 잡고 찍은 네 칸 인화물', 'A four-frame print shot at the subway doors holding the straps'],
  o_28: [825, 1100, '갈색 타일 벽에 홀로그램 장식과 미러볼, 흰 벤치가 있는 노래방', 'The karaoke room with brown tiles, holographic decoration, a mirror ball and a white bench'],
  o_10: [900, 506, 'KARAOKE SHOT 간판 옆에 놓인 흰색 키오스크', 'The white kiosk next to the KARAOKE SHOT sign'],
  o_31: [825, 1100, '선반에 마이크와 탬버린이 놓인 흰 타공판', 'A white pegboard shelf with a microphone and tambourine'],
  o_26: [825, 1100, '갈색 타일 벽 앞에서 두 손으로 들어 보이는 네 칸 인화물', 'Two four-frame prints held up against a brown tiled wall'],
  o_40: [825, 1100, '갈색 타일 벽과 노래 목록판, 흰 벤치', 'Brown tiles, a song list board and a white bench'],
  o_30: [825, 1100, 'PUBLIC PHONE 간판이 붙은 창구형 부스와 인화물로 덮인 타일 벽', 'A window booth under the PUBLIC PHONE sign on a tiled wall covered with prints'],
  o_49: [900, 676, '스테인리스 문틀 위에 수신 화면 장식이 붙은 공중전화 방 입구', 'The Public Phone room doorway with an incoming-call decoration above the steel frame'],
  o_32: [825, 1100, '스테인리스 문틀 위 수신 화면 장식과 거울에 비친 방문객', 'Visitors reflected in the mirror under the incoming-call decoration'],
  o_23: [825, 1100, '바닥에 TOILET SHOT 글자와 검은 선이 이어지는 타일 복도', 'A tiled corridor with TOILET SHOT lettering and a black line on the floor'],
  o_22: [825, 1100, '파란 타일과 흰 타일 사이로 거울 문이 보이는 화장실 방', 'The Toilet room with a mirrored doorway between blue and white tiles'],
  o_15: [825, 1100, '양쪽 타일 벽 사이로 검은 선이 길게 이어지는 복도', 'A long corridor with a black line running between tiled walls'],
  o_14: [875, 657, '인화물이 가득 붙은 파란 타일 벽', 'A blue tiled wall packed with prints'],
  o_52: [880, 1100, '체커보드 바닥과 셔터 앞에서 들어 보이는 네 칸 인화물', 'A four-frame print held up in front of the shutter and checkerboard floor'],
  o_25: [733, 1100, '갈색 타일 벽 앞에서 찍은 네 칸 인화물', 'A four-frame print shot in front of a brown tiled wall'],
  o_04: [780, 1100, 'RETRO, TOILET, SUBWAY, PHOTOZONE이 노란 선으로 그려진 평면도 포스터', 'A floor-plan poster drawn in yellow lines with RETRO, TOILET, SUBWAY and PHOTOZONE'],
  biz_02: [779, 1100, '횡단보도를 내려다본 사진 위에 UrbanEdge 로고가 올라간 포스터', 'A poster with the UrbanEdge logo over an aerial crosswalk photo'],
  biz_07: [780, 1100, '노란 바탕에 UrbanEdge 로고를 올린 포스터', 'A yellow poster carrying the UrbanEdge logo'],
  biz_09: [779, 1100, 'FLUSH OUT THE BOREDOM 문구와 화장실 사진이 겹쳐진 포스터', 'A poster pairing FLUSH OUT THE BOREDOM with restroom photos'],
}

const make = (id) => {
  const [w, h, ko, en] = RAW[id]
  const thumb = `/img/${id}.jpg`
  return { id, thumb, full: LARGE.has(id) ? `/img/lg/${id}.jpg` : thumb, w, h, alt: { ko, en } }
}

export const photo = (id) => make(id)

// 갤러리 분류: space(공간), rooms(포토 룸), prints(인화물), posters(포스터)
export const GALLERY_FILTERS = [
  { id: 'all', label: { ko: '전체', en: 'All' } },
  { id: 'space', label: { ko: '공간', en: 'Space' } },
  { id: 'rooms', label: { ko: '포토 룸', en: 'Rooms' } },
  { id: 'prints', label: { ko: '인화물', en: 'Prints' } },
  { id: 'posters', label: { ko: '포스터', en: 'Posters' } },
]

const G = (tag, ids) => ids.map((id) => ({ ...make(id), tag }))

// 보여 주는 순서: 바깥에서 안쪽으로 들어가는 순서를 따른다.
export const GALLERY = [
  ...G('space', ['o_21', 'o_34', 'o_24']),
  ...G('rooms', ['o_29']),
  ...G('space', ['o_18']),
  ...G('rooms', ['o_28']),
  ...G('prints', ['o_26']),
  ...G('space', ['o_35']),
  ...G('rooms', ['o_17']),
  ...G('posters', ['biz_02']),
  ...G('rooms', ['o_23']),
  ...G('space', ['o_44']),
  ...G('rooms', ['o_30']),
  ...G('prints', ['o_52']),
  ...G('rooms', ['o_27', 'o_22']),
  ...G('posters', ['o_04']),
  ...G('rooms', ['o_31', 'o_19']),
  ...G('space', ['o_36', 'o_43']),
  ...G('prints', ['o_37']),
  ...G('rooms', ['o_39', 'o_41', 'o_10']),
  ...G('space', ['o_20']),
  ...G('rooms', ['o_15', 'o_49']),
  ...G('posters', ['biz_09', 'biz_07']),
  ...G('prints', ['o_25']),
  ...G('rooms', ['o_40', 'o_14']),
]

// 방별 상세. id, name, code, color, title 은 data/site.js 의 ROOMS 를 그대로 쓴다.
// tagline 과 본문은 사진에서 확인되는 소품만 적는다.
export const ROOM_EXTRA = {
  subway: {
    photos: ['o_29', 'o_27', 'o_19', 'o_41', 'o_37'],
    tagline: { ko: '스테인리스 객실 문과 손잡이가 있는 지하철 칸', en: 'A subway car with steel doors and hand straps' },
    lead: { ko: '스테인리스 문과 손잡이 앞에서 지하철 승객이 되어 찍는 방', en: 'A room where you shoot as a subway passenger in front of steel doors and hand straps' },
    body: {
      ko: '창이 달린 스테인리스 문과 손잡이를 건 봉, 양옆 벤치가 실제 객실처럼 놓여 있어 출퇴근길 장면을 그대로 연출할 수 있으며, 문 위에는 앞서 다녀간 손님의 인화물이 붙어 있다.',
      en: 'Steel doors with windows, a rail of hand straps and benches on both sides are laid out like a real car, so a commute scene needs no extra props, and prints from earlier guests are taped above the doors.',
    },
    props: [
      { ko: '스테인리스 객실 문', en: 'Steel car doors' },
      { ko: '손잡이', en: 'Hand straps' },
      { ko: '양옆 벤치', en: 'Side benches' },
    ],
    poses: [
      { title: { ko: '손잡이 잡기', en: 'Hold the strap' }, desc: { ko: '한 손으로 손잡이를 잡고 시선을 창 쪽으로 돌리면 출근길 같은 장면이 된다.', en: 'Hold a strap with one hand and look toward the window for a morning-commute frame.' } },
      { title: { ko: '문 앞에 나란히 서기', en: 'Line up at the doors' }, desc: { ko: '일행과 문 앞에 나란히 서서 문이 열리기를 기다리는 표정을 짓는다.', en: 'Stand shoulder to shoulder with your group and wait for the doors with a deadpan face.' } },
      { title: { ko: '벤치에 앉기', en: 'Take a seat' }, desc: { ko: '벤치에 기대어 앉아 휴대폰을 보거나 졸고 있는 승객을 흉내 낸다.', en: 'Slump on the bench and play a passenger scrolling a phone or dozing off.' } },
    ],
  },
  karaoke: {
    photos: ['o_28', 'o_10', 'o_31', 'o_26', 'o_40'],
    tagline: { ko: '마이크와 탬버린이 놓인 갈색 타일 노래방', en: 'A brown-tiled karaoke booth with a mic and tambourine' },
    lead: { ko: '마이크와 탬버린을 들고 노래 한 곡을 통째로 찍는 방', en: 'A room for shooting a whole song with a mic and tambourine in hand' },
    body: {
      ko: '갈색 타일 벽에 노래 목록판과 홀로그램 장식, 미러볼이 걸려 있고 선반에는 마이크와 탬버린이 놓여 있어, 소품을 챙기지 않아도 노래방 무대를 바로 만들 수 있다.',
      en: 'A song-list board, holographic decoration and a mirror ball hang on the brown tiled wall, and a shelf holds a microphone and tambourine, so a karaoke stage is ready without bringing anything.',
    },
    props: [
      { ko: '마이크', en: 'Microphone' },
      { ko: '탬버린', en: 'Tambourine' },
      { ko: '노래 목록판', en: 'Song list board' },
      { ko: '홀로그램 장식과 미러볼', en: 'Holographic decor and mirror ball' },
    ],
    poses: [
      { title: { ko: '열창하기', en: 'Belt it out' }, desc: { ko: '마이크를 입 가까이 대고 눈을 질끈 감은 채 후렴을 부르는 모습을 만든다.', en: 'Hold the mic close, squeeze your eyes shut and sing the chorus.' } },
      { title: { ko: '탬버린 흔들기', en: 'Shake the tambourine' }, desc: { ko: '탬버린을 얼굴 옆으로 들어 올리고 어깨를 들썩이면 파티 분위기가 난다.', en: 'Raise the tambourine beside your face and bounce your shoulders for a party mood.' } },
      { title: { ko: '벤치에서 곡 고르기', en: 'Pick the next song' }, desc: { ko: '벤치에 나란히 앉아 노래 목록판을 가리키며 다음 곡을 고르는 장면을 연출한다.', en: 'Sit side by side on the bench and point at the song board as if choosing the next track.' } },
    ],
  },
  phone: {
    photos: ['o_30', 'o_49'],
    tagline: { ko: '창구형 부스와 수신 화면 장식의 공중전화 방', en: 'A public-phone room with a booth window and an incoming-call decoration' },
    lead: { ko: '공중전화 창구 앞에서 통화 장면을 찍는 방', en: 'A room for shooting a phone-call scene in front of the booth window' },
    body: {
      ko: 'PUBLIC PHONE 간판이 붙은 창구형 부스에 키오스크가 놓여 있고, 방 입구의 스테인리스 문틀 위에는 수신 화면을 닮은 장식이 붙어 있어 전화를 주고받는 순간을 포즈로 옮기기 좋다.',
      en: 'A kiosk sits inside the booth window under the PUBLIC PHONE sign, and a decoration styled like an incoming-call screen hangs above the steel door frame at the entrance, which suits poses that act out a call.',
    },
    props: [
      { ko: '창구형 공중전화 부스', en: 'Window-style phone booth' },
      { ko: '수신 화면 장식', en: 'Incoming-call decoration' },
      { ko: '스테인리스 문틀', en: 'Steel door frame' },
    ],
    poses: [
      { title: { ko: '수화기 들기', en: 'Pick up the receiver' }, desc: { ko: '수화기를 귀에 대는 손짓을 하고 놀란 표정으로 카메라를 바라본다.', en: 'Raise a hand to your ear as if holding a receiver and look at the lens, surprised.' } },
      { title: { ko: '창구 앞에서 마주 보기', en: 'Face each other at the window' }, desc: { ko: '둘이 서로를 마주 보며 각자 통화하는 척하면 대화가 오가는 장면이 된다.', en: 'Face a friend and each pretend to be on the line for a back-and-forth scene.' } },
      { title: { ko: '기다리는 사람', en: 'The one waiting' }, desc: { ko: '벽에 기대 팔짱을 끼고 전화가 오기를 기다리는 사람처럼 선다.', en: 'Lean on the wall with arms crossed like someone waiting for a call to come in.' } },
    ],
  },
  retro: {
    photos: ['o_17', 'o_39'],
    tagline: { ko: '갈색 커튼과 나무 의자가 있는 레트로 부스', en: 'A retro booth with a brown curtain and wooden stools' },
    lead: { ko: '갈색 커튼과 나무 의자로 오래된 사진관을 닮게 꾸민 방', en: 'A room dressed like an old photo studio with a brown curtain and wooden stools' },
    body: {
      ko: '벽을 덮은 갈색 커튼 앞에 나무 의자 두 개와 나무 상자가 놓여 있어, 소품이 많지 않은 만큼 표정과 자세로 차분한 인물 사진을 만들기 좋다.',
      en: 'Two wooden stools and a wooden box stand in front of a wall-length brown curtain, and with so few props the frame leans on expression and posture for a calm portrait.',
    },
    props: [
      { ko: '갈색 커튼', en: 'Brown curtain' },
      { ko: '나무 의자 두 개', en: 'Two wooden stools' },
      { ko: '나무 상자', en: 'Wooden box' },
    ],
    poses: [
      { title: { ko: '의자에 걸터앉기', en: 'Perch on a stool' }, desc: { ko: '의자 끝에 걸터앉아 무릎에 손을 올리고 정면을 바라보면 증명사진 같은 분위기가 난다.', en: 'Sit on the edge of a stool, hands on knees, and face the lens for a studio-portrait feel.' } },
      { title: { ko: '커튼 사이로 내밀기', en: 'Peek through the curtain' }, desc: { ko: '커튼을 한쪽으로 젖히고 얼굴만 살짝 내밀어 장난스러운 컷을 만든다.', en: 'Pull the curtain aside and lean out just your face for a playful frame.' } },
      { title: { ko: '상자에 기대기', en: 'Lean on the box' }, desc: { ko: '나무 상자에 팔을 얹고 비스듬히 서서 옆모습과 정면 사이의 각도를 잡는다.', en: 'Rest an arm on the wooden box and stand at a slant, halfway between profile and front.' } },
    ],
  },
  toilet: {
    photos: ['o_23', 'o_22', 'o_15', 'o_14'],
    tagline: { ko: '흰 타일과 파란 타일, 바닥의 검은 선이 이어지는 화장실 세트', en: 'A restroom set of white and blue tiles with a black line on the floor' },
    lead: { ko: '흰 타일과 파란 타일 사이로 검은 선이 이어지는 화장실 세트', en: 'A restroom set where a black line runs between white and blue tiles' },
    body: {
      ko: '복도처럼 길게 이어진 타일 벽과 거울 문, 바닥에 그려진 TOILET SHOT 글자와 검은 선이 공간의 깊이를 만들어, 먼 곳까지 시선이 이어지는 사진을 찍을 수 있다.',
      en: 'A corridor of tiled walls, a mirrored doorway and the TOILET SHOT lettering with a black line on the floor build depth, so you can shoot frames where the eye runs far into the space.',
    },
    props: [
      { ko: '흰 타일과 파란 타일 벽', en: 'White and blue tiled walls' },
      { ko: '거울 문', en: 'Mirrored doorway' },
      { ko: '바닥의 검은 선', en: 'Black line on the floor' },
    ],
    poses: [
      { title: { ko: '타일 벽에 기대기', en: 'Lean on the tiles' }, desc: { ko: '벽에 어깨를 기대고 시선을 살짝 내려 무심한 표정을 지으면 화장실 세트와 어울린다.', en: 'Rest a shoulder on the wall and lower your gaze for a nonchalant look that suits the set.' } },
      { title: { ko: '검은 선 따라 걷기', en: 'Walk the black line' }, desc: { ko: '바닥의 검은 선 위에 한 발씩 올리며 걷는 동작을 잡으면 길이 이어지는 느낌이 난다.', en: 'Step along the black line on the floor to give the frame a sense of a path.' } },
      { title: { ko: '거울 앞에 서기', en: 'Face the mirror' }, desc: { ko: '거울 문 앞에 서서 거울 속 자신을 바라보는 옆모습을 만든다.', en: 'Stand in front of the mirrored doorway and look at yourself for a side-view frame.' } },
    ],
  },
}

// ROOMS(site.js) 와 방별 상세를 합친 목록
export const ROOM_LIST = ROOMS.map((r) => ({
  ...r,
  ...ROOM_EXTRA[r.id],
  photoList: (ROOM_EXTRA[r.id]?.photos ?? []).map(make),
}))

export const findRoom = (id) => ROOM_LIST.find((r) => r.id === id)

// 노선 색 이름을 Tailwind 클래스로 바꾸는 표. 동적 클래스 조합은 purge 되므로 문자열로 모두 적는다.
export const LINE_BG = { yellow: 'bg-line-yellow', red: 'bg-line-red', blue: 'bg-line-blue', green: 'bg-line-green' }
export const LINE_BORDER = { yellow: 'border-line-yellow', red: 'border-line-red', blue: 'border-line-blue', green: 'border-line-green' }
