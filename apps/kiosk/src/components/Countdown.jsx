// 카운트다운 숫자: 숫자가 바뀔 때마다 key로 다시 마운트되어 pop 애니메이션이 새로 시작한다.
export function Countdown({ n }) {
  return (
    <div className="grid place-items-center">
      <span key={n} className="k-count font-display font-black tracking-tightest text-yellow" aria-hidden="true">
        {n}
      </span>
      <span className="sr-only" role="status">{n}</span>
    </div>
  )
}
