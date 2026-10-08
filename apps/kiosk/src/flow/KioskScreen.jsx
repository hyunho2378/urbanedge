// KioskScreen.jsx: 1920x1080 캔버스 안에 들어가는 화면 전체. K2(flow)가 실제 구현으로 교체한다.
// 부모(Stage)가 이 컴포넌트를 1920x1080 크기 박스에 넣고 scale로 맞춘다. 이 컴포넌트는 w-full h-full로 채운다.
export default function KioskScreen({ ctrl }) {
  return (
    <div className="grid h-full w-full place-items-center bg-bg-base text-text-pri">
      <p className="text-k-h2 font-black">{ctrl.step}</p>
    </div>
  )
}
