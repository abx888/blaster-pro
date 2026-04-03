import { useState } from 'react';
import { motion } from 'framer-motion';
import { Type, Phone, PhoneOff, Copy, Check } from 'lucide-react';

interface MessageComposerProps {
  channel: 'sms' | 'email';
  messages: { msg1: string; msg2: string };
  onMessagesChange: (msgs: { msg1: string; msg2: string }) => void;
}

export default function MessageComposer({ channel, messages, onMessagesChange }: MessageComposerProps) {
  const [copied1, setCopied1] = useState(false);
  const [copied2, setCopied2] = useState(false);

  const handleCopy = async (text: string, idx: number) => {
    await navigator.clipboard.writeText(text);
    if (idx === 1) { setCopied1(true); setTimeout(() => setCopied1(false), 2000); }
    else { setCopied2(true); setTimeout(() => setCopied2(false), 2000); }
  };

  const label1 = channel === 'sms' ? 'SMS 1 — Cu Număr' : 'Email 1 — Principal';
  const label2 = channel === 'sms' ? 'SMS 2 — Fără Număr' : 'Email 2 — Follow-up';
  const placeholder1 = channel === 'sms' ? 'Mesaj cu număr de telefon inclus... Ex: Sună-ne la 0722 123 456 pentru ofertă!' : 'Email principal...';
  const placeholder2 = channel === 'sms' ? 'Mesaj fără număr... Ex: Avem o ofertă specială pentru tine. Răspunde DA!' : 'Email follow-up...';

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
          <Type className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h3 className="text-lg font-bold">Mesaje {channel === 'sms' ? 'SMS' : 'Email'}</h3>
          <p className="text-xs text-muted-foreground">Două variante — cu și fără număr</p>
        </div>
      </div>

      {/* SMS 1 */}
      <div className="mb-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-accent" />
            <span className="text-sm font-semibold">{label1}</span>
          </div>
          <button
            onClick={() => handleCopy(messages.msg1, 1)}
            className="gradient-primary text-primary-foreground px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md"
          >
            {copied1 ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied1 ? 'Copiat!' : 'Copy'}
          </button>
        </div>
        <textarea
          value={messages.msg1}
          onChange={e => onMessagesChange({ ...messages, msg1: e.target.value })}
          placeholder={placeholder1}
          className="w-full bg-secondary/30 rounded-xl p-3.5 text-sm resize-none h-28 border-0 focus:outline-none focus:ring-1 focus:ring-primary/50 placeholder:text-muted-foreground/50"
        />
        <p className="text-[11px] text-muted-foreground mt-1">{messages.msg1.length} car</p>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 my-4">
        <div className="flex-1 h-px bg-border/50" />
        <span className="text-[10px] text-muted-foreground tracking-widest uppercase font-semibold">SAU</span>
        <div className="flex-1 h-px bg-border/50" />
      </div>

      {/* SMS 2 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <PhoneOff className="w-4 h-4 text-accent" />
            <span className="text-sm font-semibold">{label2}</span>
          </div>
          <button
            onClick={() => handleCopy(messages.msg2, 2)}
            className="gradient-primary text-primary-foreground px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md"
          >
            {copied2 ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied2 ? 'Copiat!' : 'Copy'}
          </button>
        </div>
        <textarea
          value={messages.msg2}
          onChange={e => onMessagesChange({ ...messages, msg2: e.target.value })}
          placeholder={placeholder2}
          className="w-full bg-secondary/30 rounded-xl p-3.5 text-sm resize-none h-28 border-0 focus:outline-none focus:ring-1 focus:ring-primary/50 placeholder:text-muted-foreground/50"
        />
        <p className="text-[11px] text-muted-foreground mt-1">{messages.msg2.length} car</p>
      </div>
    </motion.div>
  );
}
