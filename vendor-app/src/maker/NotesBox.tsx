import { Loader2, Mic, Sparkles, Square } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSpeech } from '@/lib/useSpeech'
import { cn } from '@/lib/utils'
import { field } from './styles'

// Sakshi talks or types her rough notes about the meeting; the AI turns them into the personal parts
export function NotesBox({ notes, setNotes, onDraft, drafting, drafted }: {
  notes: string
  setNotes: React.Dispatch<React.SetStateAction<string>>
  onDraft: () => void
  drafting: boolean
  drafted: boolean
}) {
  const speech = useSpeech(text => setNotes(n => (n.trim() ? `${n.trim()} ${text}` : text)))

  return (
    <div className="rounded-2xl border-[1.5px] border-ink/15 bg-card p-4">
      <p className="flex items-center gap-2 font-semibold">
        <Sparkles className="size-4" /> Notes from the meeting
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        Say or type anything: who you met, where and when, the business, why they’re selling, anything special like a franchise or liquor licence. The AI fills in the form and writes the personal lines. You can check and change everything.
      </p>

      <div className="relative mt-3">
        <textarea
          className={cn(field, 'mt-0 min-h-36 pb-14')}
          value={notes + (speech.interim ? (notes ? ' ' : '') + speech.interim : '')}
          onChange={e => setNotes(e.target.value)}
          readOnly={speech.listening}
          maxLength={3000}
          placeholder="e.g. Met Monica, her husband and his business partner yesterday at their shop, Alif by Sensational Chicken in Papatoetoe. It's a franchise, they want to sell and move on…"
        />
        {speech.supported && (
          <button
            type="button"
            onClick={speech.listening ? speech.stop : speech.start}
            className={cn(
              'absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full border-[1.5px] px-3.5 py-1.5 text-sm font-semibold transition-colors',
              speech.listening ? 'animate-pulse border-red-600 bg-red-600 text-white' : 'border-ink/20 bg-background hover:border-ink/50',
            )}
          >
            {speech.listening ? <><Square className="size-3.5 fill-current" /> Stop</> : <><Mic className="size-4" /> Speak</>}
          </button>
        )}
      </div>
      {speech.error && <p className="mt-2 text-sm text-destructive">{speech.error}</p>}

      <Button type="button" size="lg" className="mt-3 h-11 w-full" onClick={onDraft} disabled={drafting || speech.listening || notes.trim().length < 15}>
        {drafting ? <Loader2 className="animate-spin" /> : <Sparkles />} {drafted ? 'Draft again from notes' : 'Draft with AI'}
      </Button>
      <p className="mt-2 text-xs text-muted-foreground">Your notes are sent to the AI service to write the draft. Leave out anything you wouldn’t want shared outside the business.</p>
    </div>
  )
}
