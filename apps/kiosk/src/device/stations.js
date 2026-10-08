// stations.js: 경주 메트로 용어. docs/NAMING.md가 기준이다(10월 9일 새벽).
// 시스템 Gyeongju Metro(GY), 첫 역 GY-01 UrbanEdge(어반엣지역, 황리단길). 유료 촬영 방 3곳이 이 역 안의 승강장 1에서 3이다.
// 역 안내판은 항상 "GY-01 UrbanEdge"이고 방 이름은 승강장 태그로 붙는다. 화장실 방은 없다.
// 승강장 강조색: Subway 노랑, Karaoke 빨강, Retro 초록. 이 키오스크는 승강장마다 따로 있다.
export const SYSTEM = { code: 'GY', name: { en: 'Gyeongju Metro', ko: '경주 메트로' } }

export const STATION = { id: 'urbanedge', code: 'GY-01', name: { en: 'UrbanEdge', ko: '어반엣지' }, place: { en: 'Hwangridan-gil', ko: '황리단길' } }

export const PLATFORMS = [
  { id: 'subway', n: 1, color: 'yellow', title: { en: 'Subway Shot', ko: '지하철 샷' } },
  { id: 'karaoke', n: 2, color: 'red', title: { en: 'Karaoke Shot', ko: '노래방 샷' } },
  { id: 'retro', n: 3, color: 'green', title: { en: 'Retro Shot', ko: '레트로 샷' } },
]

export const platformOf = (id) => PLATFORMS.find((p) => p.id === id) ?? null

// 가상 서사 고지. 실제 교통시설이나 공식 역이 아니다(NAMING.md).
export const NOTICE = { en: 'Imaginary Metro · Travel Experience', ko: '가상의 지하철 여행 경험' }

// 승강장 태그: "Platform 2 Karaoke Shot" / "2번 승강장 노래방 샷". 승강장이 없으면 시스템 이름.
export function platformTag(id, lang) {
  const p = platformOf(id)
  if (lang === 'ko') return p ? `${p.n}번 승강장 ${p.title.ko}` : SYSTEM.name.ko
  return p ? `Platform ${p.n} ${p.title.en}` : SYSTEM.name.en
}
