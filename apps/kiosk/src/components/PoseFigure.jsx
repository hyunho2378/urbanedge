// 포즈 제안 실루엣: inline SVG. 색은 currentColor를 따른다.
const ARM = { strokeWidth: 15, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' }

function Person({ armL, armR, bent }) {
  return (
    <g>
      <circle cx="100" cy="46" r="23" className="fill-current" />
      <rect x="76" y="80" width="48" height="90" rx="22" className="fill-current" />
      <line x1="90" y1="162" x2="88" y2="228" className="stroke-current" strokeWidth="17" strokeLinecap="round" />
      <line x1="110" y1="162" x2="112" y2="228" className="stroke-current" strokeWidth="17" strokeLinecap="round" />
      <line {...ARM} className="stroke-current" x1="80" y1="98" x2={armL[0]} y2={armL[1]} />
      {bent ? (
        <polyline {...ARM} className="stroke-current" points="120,98 148,128 122,60" />
      ) : (
        <line {...ARM} className="stroke-current" x1="120" y1="98" x2={armR[0]} y2={armR[1]} />
      )}
    </g>
  )
}

export function PoseFigure({ fig, className, label }) {
  let body
  if (fig === 'reach') body = <Person armL={[64, 158]} armR={[152, 30]} />
  else if (fig === 'cheer') body = <Person armL={[46, 30]} armR={[154, 30]} />
  else if (fig === 'hold') body = <Person armL={[68, 160]} bent />
  else if (fig === 'lean') {
    body = (
      <g transform="rotate(13 100 228)">
        <Person armL={[72, 160]} armR={[128, 160]} />
      </g>
    )
  } else if (fig === 'sit') {
    body = (
      <g>
        <circle cx="96" cy="50" r="23" className="fill-current" />
        <rect x="72" y="84" width="48" height="78" rx="22" className="fill-current" />
        <line x1="92" y1="158" x2="160" y2="158" className="stroke-current" strokeWidth="17" strokeLinecap="round" />
        <line x1="160" y1="158" x2="162" y2="222" className="stroke-current" strokeWidth="17" strokeLinecap="round" />
        <line {...ARM} className="stroke-current" x1="76" y1="100" x2="72" y2="150" />
        <rect x="54" y="170" width="118" height="12" rx="6" className="fill-current opacity-50" />
        <line x1="68" y1="182" x2="68" y2="228" className="stroke-current opacity-50" strokeWidth="9" strokeLinecap="round" />
        <line x1="158" y1="182" x2="158" y2="228" className="stroke-current opacity-50" strokeWidth="9" strokeLinecap="round" />
      </g>
    )
  } else {
    body = (
      <g>
        <g transform="translate(-6 34) scale(0.8)">
          <Person armL={[66, 152]} armR={[134, 150]} />
        </g>
        <g transform="translate(66 34) scale(0.8)">
          <Person armL={[66, 150]} armR={[134, 152]} />
        </g>
      </g>
    )
  }
  return (
    <svg viewBox="0 0 200 240" role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true} className={className}>
      {body}
    </svg>
  )
}
