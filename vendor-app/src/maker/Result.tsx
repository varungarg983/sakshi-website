import { Check, Copy, ExternalLink, Mail, MessageCircle, MessageSquare, RotateCcw, Share2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { buildMessage, displayName, mailtoDraft, whatsappShare, type MessageDetails, type MessageKind } from '@/lib/messages'
import { cn } from '@/lib/utils'

const KINDS: [MessageKind, string, typeof Mail][] = [
  ['text', 'Text', MessageSquare],
  ['whatsapp', 'WhatsApp', MessageCircle],
  ['email', 'Email', Mail],
]

// The finished link plus a message Sakshi can edit before copying
export function Result({ name, details, onEditLink, onNew }: {
  name: string
  details: Omit<MessageDetails, 'withCommission'>
  onEditLink?: () => void
  onNew: () => void
}) {
  const [kind, setKind] = useState<MessageKind>('text')
  const [withCommission, setWithCommission] = useState(true)
  const draft = buildMessage(kind, { ...details, withCommission })
  // Her edits are kept per message type until she resets them
  const [edits, setEdits] = useState<Partial<Record<MessageKind, string>>>({})
  const body = edits[kind] ?? draft.body
  const [copied, setCopied] = useState('')

  useEffect(() => setEdits({}), [details.link, withCommission])

  async function copy(what: string, value: string) {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(what)
      setTimeout(() => setCopied(''), 2000)
    } catch {
      /* clipboard blocked */
    }
  }

  return (
    <div className="mt-8 space-y-5 rounded-2xl border border-border bg-card p-5">
      <div>
        <p className="font-semibold">Link ready for {displayName(name) || 'your vendor'}</p>
        <p className="mt-2 rounded-lg bg-muted px-3 py-2.5 font-mono text-sm break-all">{details.link}</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <Button size="lg" variant="outline" className="h-11" onClick={() => copy('link', details.link)}>
            {copied === 'link' ? <Check /> : <Copy />} Copy link
          </Button>
          <Button size="lg" variant="outline" className="h-11" render={<a href={details.link} target="_blank" rel="noopener noreferrer" />} nativeButton={false}>
            <ExternalLink /> Preview
          </Button>
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold">Message to send with it</p>
        <div className="mb-3 grid grid-cols-3 gap-1 rounded-full bg-muted p-1 text-sm font-semibold" role="tablist">
          {KINDS.map(([k, l, Icon]) => (
            <button key={k} type="button" role="tab" aria-selected={kind === k} onClick={() => setKind(k)}
              className={cn('flex items-center justify-center gap-1.5 rounded-full py-2 transition-colors', kind === k ? 'bg-card shadow-sm' : 'text-muted-foreground')}>
              <Icon className="size-4" /> {l}
            </button>
          ))}
        </div>

        <label className="mb-3 flex cursor-pointer items-center gap-2.5 text-sm">
          <input type="checkbox" checked={withCommission} onChange={e => setWithCommission(e.target.checked)} className="size-4 accent-[var(--foreground)]" />
          Include the commission wording
        </label>

        {kind === 'email' && (
          <div className="mb-2 flex items-center justify-between gap-2 rounded-lg bg-muted px-3 py-2.5 text-sm">
            <span><span className="text-muted-foreground">Subject: </span>{draft.subject}</span>
            <button type="button" onClick={() => copy('subject', draft.subject)} className="shrink-0 font-semibold underline decoration-ink/30 underline-offset-4">
              {copied === 'subject' ? 'Copied' : 'Copy'}
            </button>
          </div>
        )}

        <textarea
          value={body}
          onChange={e => setEdits(x => ({ ...x, [kind]: e.target.value }))}
          aria-label="Message"
          className="h-96 w-full resize-y rounded-lg border border-transparent bg-muted px-3 py-2.5 text-sm leading-relaxed outline-none focus:border-ink/30 focus:bg-card"
        />
        <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
          <span>You can edit the message here before copying.</span>
          {edits[kind] !== undefined && (
            <button type="button" onClick={() => setEdits(x => ({ ...x, [kind]: undefined }))} className="flex items-center gap-1 font-semibold text-foreground">
              <RotateCcw className="size-3" /> Undo my edits
            </button>
          )}
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button size="lg" className="h-11" onClick={() => copy('message', body)}>
            {copied === 'message' ? <Check /> : <Copy />} Copy {kind === 'email' ? 'email' : 'message'}
          </Button>
          {kind === 'email' && (
            <Button size="lg" variant="outline" className="h-11" render={<a href={mailtoDraft(draft.subject, body)} />} nativeButton={false}>
              <Mail /> Open in email app
            </Button>
          )}
          {kind === 'whatsapp' && (
            <Button size="lg" variant="outline" className="h-11" render={<a href={whatsappShare(body)} target="_blank" rel="noopener noreferrer" />} nativeButton={false}>
              <MessageCircle /> Open WhatsApp
            </Button>
          )}
          {kind === 'text' && 'share' in navigator && (
            <Button size="lg" variant="outline" className="h-11" onClick={() => navigator.share({ text: body }).catch(() => {})}>
              <Share2 /> Share
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold">
        {onEditLink && <button onClick={onEditLink} className="underline decoration-ink/30 underline-offset-4">Change details</button>}
        <button onClick={onNew} className="underline decoration-ink/30 underline-offset-4">Make another link</button>
      </div>
    </div>
  )
}
