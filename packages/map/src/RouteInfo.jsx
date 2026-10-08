// RouteInfo.jsx: 지도에만 있는 정보가 없도록 경로와 주변 장소를 글자 목록으로 보여 준다(접근성). 내용은 전부 baked OSM 자료에서 온다.
import { SHOP, STATION, LINE, NEARBY_IDS } from './shop.js'
import { pickText } from './i18n.js'

export function routeFacts(route) {
  const minutes = Math.max(1, Math.round(route.durationS / 60))
  const streets = route.streets.filter((s) => s.distanceM > 0)
  return { meters: route.distanceM, minutes, streets }
}

const placeName = (p, lang) => (lang === 'ko' ? p.name : p.nameEn || p.name)

export function RouteInfoList({ route, places, concept, showConcept, lang, id }) {
  const t = pickText(lang)
  const f = routeFacts(route)
  const nearby = NEARBY_IDS.map((osm) => places.places.find((p) => p.osm === osm)).filter(Boolean)
  const stop = route.from
  return (
    <div id={id} className="uemap-panel" role="region" aria-label={t.routeToggle}>
      <p className="uemap-panel__title">
        <span className="uemap-badge" aria-hidden="true">{LINE.code}</span>
        <span>{lang === 'ko' ? LINE.nameKo : LINE.name}</span>
      </p>
      <p className="uemap-panel__sum">{t.walk(f.meters, f.minutes)}</p>
      <ol className="uemap-steps">
        <li><span className="uemap-steps__k">{t.startAt}</span> <span lang="ko">{stop.name}</span> ({t.busStop})</li>
        {f.streets.map((s, i) => (
          <li key={`${s.name}-${i}`}><span lang="ko">{s.name}</span> <span className="uemap-steps__m">{s.distanceM} m</span></li>
        ))}
        <li><span className="uemap-steps__k">{t.arriveAt}</span> {STATION.code} {lang === 'ko' ? STATION.fullKo : STATION.full}, <span lang="ko">{SHOP.address}</span></li>
      </ol>
      <p className="uemap-panel__sub">{t.nearby}</p>
      <ul className="uemap-near">
        {nearby.map((p) => (
          <li key={p.osm}>{placeName(p, lang)} <span className="uemap-steps__m">{p.d} m</span></li>
        ))}
      </ul>
      {showConcept && concept?.stops?.length > 0 && (
        <>
          <p className="uemap-panel__sub">{t.conceptTitle}</p>
          <ul className="uemap-near">
            {concept.stops.map((s) => <li key={s.osm}>{placeName(s, lang)}</li>)}
          </ul>
          <p className="uemap-panel__note">{t.conceptNote}</p>
        </>
      )}
      <p className="uemap-panel__note">{t.heights} {t.notice}</p>
    </div>
  )
}
