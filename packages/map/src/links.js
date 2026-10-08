// links.js: 길 찾기 링크 헬퍼. 구글, 네이버, 카카오 지도와 네이버 플레이스.
// 구글 URL은 Google Maps URLs 문서의 dir 액션(destination, travelmode=walking)이다.
// 네이버 웹 길찾기는 map.naver.com/p/directions/{출발}/{도착}/{경유}/{수단} 형식이며 출발을 "-"로 두면 현재 위치를 쓴다. 수단 walk가 도보다.
// 카카오는 공식 링크 스킴 map.kakao.com/link/to/이름,위도,경도(도착지만 지정, 수단은 앱에서 고른다).
import { SHOP, NAVER_PLACE_ID } from './shop.js'

const enc = encodeURIComponent
const LABELS = {
  en: { naver: 'Open in Naver Map', google: 'Open in Google Maps', naverPlace: 'Naver Place', kakao: 'Open in Kakao Map' },
  ko: { naver: '네이버 지도에서 열기', google: '구글 지도에서 열기', naverPlace: '네이버 플레이스', kakao: '카카오맵에서 열기' },
}

/**
 * directionsLinks({ lang?, origin? })
 * lang: 'en' | 'ko'(기본 en). 라벨 언어.
 * origin: { lat, lng, name? } 출발지를 지정할 때. 없으면 각 앱이 현재 위치를 쓴다.
 * 반환: { google, naver, kakao, naverPlace, items }
 *   google, naver, kakao: 도보 길찾기 URL, naverPlace: 네이버 플레이스 URL
 *   items: 화면 순서대로(네이버 지도, 구글 지도, 네이버 플레이스, 카카오맵) [{ id, label, labelKo, href, kind }]
 */
export function directionsLinks({ lang = 'en', origin } = {}) {
  const { lat, lng } = SHOP
  const dest = `${lat},${lng}`
  const google = `https://www.google.com/maps/dir/?api=1&${origin ? `origin=${origin.lat},${origin.lng}&` : ''}destination=${enc(dest)}&travelmode=walking`
  const start = origin ? `${origin.lng},${origin.lat},${enc(origin.name || '')},,` : '-'
  const naver = `https://map.naver.com/p/directions/${start}/${lng},${lat},${enc(SHOP.nameKo)},${NAVER_PLACE_ID},PLACE_POI/-/walk`
  const kakao = `https://map.kakao.com/link/to/${enc(SHOP.nameKo)},${lat},${lng}`
  const naverPlace = `https://m.place.naver.com/place/${NAVER_PLACE_ID}`
  const t = LABELS[lang === 'ko' ? 'ko' : 'en']
  const items = [
    { id: 'naver', label: t.naver, labelKo: LABELS.ko.naver, href: naver, kind: 'directions' },
    { id: 'google', label: t.google, labelKo: LABELS.ko.google, href: google, kind: 'directions' },
    { id: 'naverPlace', label: t.naverPlace, labelKo: LABELS.ko.naverPlace, href: naverPlace, kind: 'place' },
    { id: 'kakao', label: t.kakao, labelKo: LABELS.ko.kakao, href: kakao, kind: 'directions' },
  ]
  return { google, naver, kakao, naverPlace, items }
}
