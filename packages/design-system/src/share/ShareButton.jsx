import { useRef, useState } from 'react'
import { Share2 } from 'lucide-react'
import { Button } from '../components/Button.jsx'
import { Bi } from '../components/Bi.jsx'
import { ShareSheet } from './ShareSheet.jsx'

// ShareButton({ url, title, text, image, variant, size, lang, children, className, ...sheetProps })
//  누르면 ShareSheet를 연다(모바일은 화면 중앙의 작은 대화상자, 데스크톱은 버튼 옆 팝오버). variant는 Button과 같다(primary, outline, ghost, dark).
export function ShareButton({ url, title, text, image, variant = 'outline', size = 'md', lang, children, className, placement, portal, instagram, fileName, ...rest }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  return (
    <>
      <Button ref={ref} variant={variant} size={size === 'kiosk' ? 'kiosk' : size} className={className} aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen((o) => !o)} {...rest}>
        <Share2 className="h-20 w-20" aria-hidden="true" />
        {children ?? <Bi en="Share" ko="공유" inline />}
      </Button>
      <ShareSheet open={open} onClose={() => setOpen(false)} url={url} title={title} text={text} image={image} lang={lang} size={size === 'kiosk' ? 'kiosk' : 'md'} placement={placement} anchorRef={ref} portal={portal} instagram={instagram} fileName={fileName} />
    </>
  )
}
