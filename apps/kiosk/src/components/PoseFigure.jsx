// 포즈 제안 선 그림: stroke 도식. 색은 currentColor를 따르고 선 굵기는 일정하다.
const L = { strokeWidth: 9, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' }

function Person({ armL, armR, bent }) {
  return (
    <g className="stroke-current" {...L}>
      <circle cx="100" cy="44" r="22" />
      <path d="M100 68 V150" />
      <path d="M100 150 L88 226 M100 150 L112 226" />
      <path d={`M100 86 L${armL[0]} ${armL[1]}`} />
      {bent ? <path d="M100 86 L136 118 L112 60" /> : <path d={`M100 86 L${armR[0]} ${armR[1]}`} />}
    </g>
  )
}

export function PoseFigure({ fig, className, label }) {
  let body
  if (fig === 'reach') body = <Person armL={[66, 148]} armR={[146, 26]} />
  else if (fig === 'cheer') body = <Person armL={[50, 24]} armR={[150, 24]} />
  else if (fig === 'hold') body = <Person armL={[72, 150]} bent />
  else if (fig === 'lean') {
    body = (
      <g transform="rotate(14 100 226)">
        <Person armL={[74, 150]} armR={[126, 150]} />
      </g>
    )
  } else if (fig === 'sit') {
    body = (
      <g className="stroke-current" {...L}>
        <circle cx="94" cy="50" r="22" />
        <path d="M94 74 V152" />
        <path d="M94 152 L162 152 L164 222" />
        <path d="M94 92 L74 146" />
        <path d="M94 92 L130 130" />
        <path d="M52 174 H178 M66 174 V226 M164 174 V226" opacity="0.5" />
      </g>
    )
  } else {
    body = (
      <g>
        <g transform="translate(-14 36) scale(0.8)">
          <Person armL={[66, 148]} armR={[132, 100]} />
        </g>
        <g transform="translate(62 36) scale(0.8)">
          <Person armL={[68, 100]} armR={[134, 148]} />
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
