// stations.js: Gyeongju Metro(코드 GY)와 GY-01 UrbanEdge 역. docs/NAMING.md 기준.
// 경주에는 지하철이 없고, 이것은 어반엣지가 만든 가상의 지하철 관광 경험이다(실제 교통시설이 아님).
// 실제 역은 GY-01 어반엣지(황리단길) 하나이고, 방 4곳이 그 역의 승강장(Platform 1에서 4)이다. 화장실 방은 없다.
export const SYSTEM = {
  code: 'GY',
  name: { en: 'Gyeongju Metro', ko: '경주 메트로' },
  tagline: { en: 'Explore Gyeongju, One Station at a Time.', ko: '경주를 한 역씩 탐험하세요.' },
  notice: 'Imaginary Metro · Travel Experience',
}
export const LINE = SYSTEM // 예전 이름. 같은 값을 돌려 준다.

export const STATION = { id: 'gy-01', code: 'GY-01', name: 'URBANEDGE', title: { en: 'UrbanEdge Station', ko: '어반엣지역' }, area: { en: 'Hwangridan-gil', ko: '황리단길' } }

// 노선도에 그리는 정거장. 후보 역은 Concept stop으로만 표시하고 열렸다고 말하지 않는다(코드는 GY-02부터 임시).
export const METRO_STOPS = [
  { id: 'gy-01', code: 'GY-01', name: { en: 'UrbanEdge', ko: '어반엣지' }, area: { en: 'Hwangridan-gil', ko: '황리단길' }, status: 'open' },
  { id: 'gy-02', code: 'GY-02', name: { en: 'Daereungwon', ko: '대릉원' }, status: 'concept' },
  { id: 'gy-03', code: 'GY-03', name: { en: 'Cheomseongdae', ko: '첨성대' }, status: 'concept' },
  { id: 'gy-04', code: 'GY-04', name: { en: 'Donggung & Wolji', ko: '동궁과 월지' }, status: 'concept' },
]

const PLATFORMS = [
  { id: 'subway', platform: 1, shot: 'SUBWAY SHOT', color: 'yellow', title: { en: 'Subway Shot', ko: '지하철 샷' } },
  { id: 'karaoke', platform: 2, shot: 'KARAOKE SHOT', color: 'red', title: { en: 'Karaoke Shot', ko: '노래방 샷' } },
  { id: 'phone', platform: 3, shot: 'PUBLIC PHONE SHOT', color: 'blue', title: { en: 'Public Phone Shot', ko: '공중전화 샷' } },
  { id: 'retro', platform: 4, shot: 'RETRO SHOT', color: 'green', title: { en: 'Retro Shot', ko: '레트로 샷' } },
]

// STATIONS: 승강장 4곳. 항목마다 역 정보(code 'GY-01', name 'URBANEDGE')와 승강장 정보(platform, platformText, pCode, shot, color)가 같이 있다.
export const STATIONS = PLATFORMS.map((pl) => ({
  ...pl,
  code: STATION.code,
  name: STATION.name,
  platformText: `PLATFORM ${pl.platform}`,
  pCode: `P${pl.platform}`,
}))

// roomId: 'karaoke' 같은 id, 'P2', 2, 'Platform 2', 예전 노선 코드 'L2'. 알 수 없으면 karaoke(팀 샘플 인화물이 찍힌 승강장).
// 없어진 'toilet'과 5 이상의 번호는 Subway Shot으로 돌려 오류를 막고, 화면에는 나타나지 않는다.
export function getStation(roomId) {
  const k = String(roomId ?? '').trim().toLowerCase().replace(/[\s_-]+/g, '')
  const num = k.match(/^(?:p|l|platform)?([1-9])$/)
  return (
    STATIONS.find((s) => s.id === k || s.shot.toLowerCase().replace(/\s/g, '') === k || s.title.en.toLowerCase().replace(/\s/g, '') === k) ||
    (num && (STATIONS[Number(num[1]) - 1] || STATIONS[0])) ||
    (/toilet/.test(k) && STATIONS[0]) ||
    (k === 'publicphone' && STATIONS[2]) ||
    STATIONS[1]
  )
}

const pad = (n) => String(n).padStart(2, '0')

// 2026.10.09 형식. Date, 타임스탬프, 'YYYY-MM-DD', 'YYYY.MM.DD' 문자열을 받는다. 없으면 오늘.
export function formatShotDate(input) {
  if (typeof input === 'string' && /^\d{4}[.\-/]\d{2}[.\-/]\d{2}/.test(input)) return input.slice(0, 10).replace(/[-/]/g, '.')
  const d = input instanceof Date ? input : input != null ? new Date(input) : new Date()
  if (Number.isNaN(d.getTime())) return formatShotDate(new Date())
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`
}
