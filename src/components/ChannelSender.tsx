import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { integrations } from '@/lib/integrations-data';
import { toast } from 'sonner';

interface ChannelSenderProps {
  enabledIntegrations: Record<string, boolean>;
}

export default function ChannelSender({ enabledIntegrations }: ChannelSenderProps) {
  const [selectedChannel, setSelectedChannel] = useState('');
  const [recipient, setRecipient] = useState('');
  const [message, setMessage] = useState('');

  const connected = integrations.filter(i => enabledIntegrations[i.id]);

  const handleSend = () => {
    if (!selectedChannel || !recipient || !message) {
      toast.error('Completează toate câmpurile');
      return;
    }
    toast.success(`Mesaj trimis via ${connected.find(c => c.id === selectedChannel)?.name || selectedChannel}`);
    setRecipient('');
    setMessage('');
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-xl p-6">
      <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
        <Send className="w-5 h-5 text-primary" /> Quick Send
      </h3>

      {connected.length === 0 ? (
        <p className="text-sm text-muted-foreground">Activează o integrare pentru a trimite mesaje.</p>
      ) : (
        <div className="space-y-3">
          <select
            value={selectedChannel}
            onChange={e => setSelectedChannel(e.target.value)}
            className="w-full bg-secondary/50 rounded-lg p-2 text-sm border-0 focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">Selectează canal...</option>
            {connected.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </select>
          <Input value={recipient} onChange={e => setRecipient(e.target.value)} placeholder="Destinatar..." className="h-9 text-sm" />
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Mesaj..."
            className="w-full bg-secondary/50 rounded-lg p-3 text-sm resize-none h-20 border-0 focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <Button onClick={handleSend} className="w-full gradient-primary text-primary-foreground">
            <Send className="w-4 h-4 mr-2" /> Trimite
          </Button>
        </div>
      )}
    </motion.div>
  );
}
