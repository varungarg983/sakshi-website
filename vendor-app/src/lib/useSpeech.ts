import { useCallback, useEffect, useRef, useState } from 'react'

// Browser speech-to-text (Chrome, Edge, Safari on iPhone and Mac), set to New Zealand English.
// Where it isn't supported, `supported` is false and the mic button is hidden.

type Recognition = {
  lang: string
  continuous: boolean
  interimResults: boolean
  start(): void
  stop(): void
  onresult: ((e: { resultIndex: number; results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }) => void) | null
  onerror: ((e: { error: string }) => void) | null
  onend: (() => void) | null
}

const SpeechRecognition: (new () => Recognition) | undefined =
  typeof window !== 'undefined'
    ? ((window as unknown as Record<string, unknown>).SpeechRecognition ??
        (window as unknown as Record<string, unknown>).webkitSpeechRecognition) as (new () => Recognition) | undefined
    : undefined

export function useSpeech(onFinal: (text: string) => void) {
  const [listening, setListening] = useState(false)
  const [interim, setInterim] = useState('')
  const [error, setError] = useState('')
  const rec = useRef<Recognition | null>(null)
  const onFinalRef = useRef(onFinal)
  onFinalRef.current = onFinal

  const stop = useCallback(() => rec.current?.stop(), [])

  const start = useCallback(() => {
    if (!SpeechRecognition) return
    setError('')
    const r = new SpeechRecognition()
    r.lang = 'en-NZ'
    r.continuous = true
    r.interimResults = true
    r.onresult = e => {
      let live = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i]
        if (res.isFinal) onFinalRef.current(res[0].transcript.trim())
        else live += res[0].transcript
      }
      setInterim(live)
    }
    r.onerror = e => {
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') setError('The microphone is blocked. Allow it in your browser settings, or type instead.')
      else if (e.error === 'no-speech') setError('Didn’t catch anything. Tap Speak and try again.')
    }
    r.onend = () => {
      setListening(false)
      setInterim('')
      rec.current = null
    }
    rec.current = r
    r.start()
    setListening(true)
  }, [])

  useEffect(() => () => rec.current?.stop(), [])

  return { supported: !!SpeechRecognition, listening, interim, error, start, stop }
}
