import { useState } from 'react'
import { Ticket } from 'lucide-react'
import { usePick } from '../i18n/index.jsx'
import ScratchCoupon from '../components/home/ScratchCoupon.jsx'
import Modal from './Modal.jsx'

// 쿠폰 FAB: 모든 페이지 오른쪽 아래에 떠 있는 48px 둥근 버튼. 누르면 가운데 대화상자가 열리고 안에 스크래치 쿠폰이 있다.
// 포커스 가두기, Esc와 배경 누르기로 닫기, 닫으면 FAB로 포커스 복귀는 Modal이 처리한다.
export default function CouponFab() {
  const pick = usePick()
  const [open, setOpen] = useState(false)
  const title = pick({ en: 'Share, then scratch', ko: '공유하고 긁기' })
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={pick({ en: 'Coupon', ko: '쿠폰' })}
        aria-haspopup="dialog"
        className="ue-press fixed z-dropdown grid size-48 place-items-center rounded-pill bg-yellow text-text-onYellow shadow-lift transition-colors duration-fast ease-out hover:bg-text-pri hover:text-yellow"
        style={{ right: 'max(16px, env(safe-area-inset-right))', bottom: 'max(16px, env(safe-area-inset-bottom))' }}
      >
        <Ticket size={22} aria-hidden="true" />
      </button>
      <Modal open={open} onClose={() => setOpen(false)} label={title} className="max-w-[560px]">
        <div className="p-20 md:p-32">
          <h2 className="t-headline pr-48 text-text-pri">{title}</h2>
          <div className="mt-16">
            <ScratchCoupon />
          </div>
        </div>
      </Modal>
    </>
  )
}
