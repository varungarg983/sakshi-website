import { useEffect, useState } from 'react'
import { LinkMaker } from './LinkMaker'
import { Hero } from './sections/Hero'
import { Reviews } from './sections/Reviews'
import { Confidential, Credentials, Honest, Journey, Stories } from './sections/Trust'
import { Contact, Documents, StickyBar } from './sections/Documents'
import { linkId, loadVendor, type Vendor } from './lib/vendor'

export default function App() {
  const [route, setRoute] = useState(location.hash)
  useEffect(() => {
    const on = () => setRoute(location.hash)
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])

  if (route === '#/make') return <LinkMaker />
  return <VendorPage />
}

function VendorPage() {
  const [id] = useState(linkId)
  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [ready, setReady] = useState(!id)

  useEffect(() => {
    if (!id) return
    loadVendor(id).then(v => {
      setVendor(v)
      setReady(true)
    })
  }, [id])

  // Brief blank screen while the personal details load, so the greeting doesn't jump
  if (!ready) return <div className="min-h-dvh bg-navy" />

  return (
    <>
      <Hero vendor={vendor} />
      <main>
        <Reviews vendor={vendor} />
        <Confidential />
        <Stories />
        <Honest />
        <Journey />
        <Credentials />
        <Documents vendor={vendor} id={id} />
      </main>
      <Contact />
      <StickyBar />
    </>
  )
}
