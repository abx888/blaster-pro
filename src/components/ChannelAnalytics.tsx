import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import { integrations } from '@/lib/integrations-data';

interface ChannelAnalyticsProps {
  enabledIntegrations: Record<string, boolean>;
}

export default function ChannelAnalytics({ enabledIntegrations }: ChannelAnalyticsProps) {
  const connected = integrations.filter(i => enabledIntegrations[i.id]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-xl p-6">
      <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-primary" /> Channel Analytics
      </h3>

      {connected.length === 0 ? (
        <p className="text-sm text-muted-foreground">Activează integrări pentru statistici.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {connected.map(c => (
            <div key={c.id} className="bg-secondary/30 rounded-lg p-3 text-center">
              <span className="text-2xl">{c.icon}</span>
              <p className="text-xs font-medium mt-1">{c.name}</p>
              <p className="text-lg font-mono font-bold text-primary mt-1">0</p>
              <p className="text-[10px] text-muted-foreground">mesaje trimise</p>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
