import { Button, Marquee, SectionLabel } from '@urbanedge/ds'

export default function App() {
  return (
    <main className="px-page section-y">
      <SectionLabel index={1}>Scaffold</SectionLabel>
      <h1 className="font-display text-display-l font-black tracking-tightest">Beyond the Lens, Into the Streets</h1>
      <Button variant="outline" className="mt-40">Check</Button>
      <Marquee className="mt-64" items={['SUBWAY', 'KARAOKE SHOT', 'PUBLIC PHONE', 'RETRO', 'TOILET']} />
    </main>
  )
}
