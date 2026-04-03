import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarDays, Clock, MessageSquare, Mail, TrendingUp, CheckCircle2, BarChart3 } from 'lucide-react';

const BATCH_SIZE = 490;

interface HistoryEntry {
  state_name: string;
  batch_idx: number;
  sent_at: string;
}

interface StateData {
  name: string;
  numbers: string[];
}

interface SendHistoryProps {
  history: HistoryEntry[];
  channel: 'sms' | 'email';
  states: StateData[];
  totalNumbers: number;
  totalSentNumbers: number;
}

interface DayGroup {
  date: string;
  label: string;
  entries: HistoryEntry[];
  batchCount: number;
  itemCount: number;
}

export default function SendHistory({ history, channel, states, totalNumbers, totalSentNumbers }: SendHistoryProps) {
  const label = channel === 'sms' ? 'numere' : 'emailuri';
  const ChannelIcon = channel === 'sms' ? MessageSquare : Mail;

  // Build a lookup: state_name → numbers array length
  const stateSizes = useMemo(() => {
    const map: Record<string, number> = {};
    for (const s of states) map[s.name] = s.numbers.length;
    return map;
  }, [states]);

  // Group history by day
  const dayGroups = useMemo(() => {
    const groups: Record<string, HistoryEntry[]> = {};
    for (const entry of history) {
      const date = new Date(entry.sent_at).toLocaleDateString('ro-RO', { year: 'numeric', month: '2-digit', day: '2-digit' });
      if (!groups[date]) groups[date] = [];
      groups[date].push(entry);
    }

    const result: DayGroup[] = [];
    const today = new Date().toLocaleDateString('ro-RO', { year: 'numeric', month: '2-digit', day: '2-digit' });
    const yesterday = new Date(Date.now() - 86400000).toLocaleDateString('ro-RO', { year: 'numeric', month: '2-digit', day: '2-digit' });

    for (const [date, entries] of Object.entries(groups)) {
      let itemCount = 0;
      for (const e of entries) {
        const stateSize = stateSizes[e.state_name] || 0;
        const start = e.batch_idx * BATCH_SIZE;
        const end = Math.min(start + BATCH_SIZE, stateSize);
        itemCount += Math.max(end - start, 0);
      }

      result.push({
        date,
        label: date === today ? 'Azi' : date === yesterday ? 'Ieri' : date,
        entries,
        batchCount: entries.length,
        itemCount,
      });
    }

    return result;
  }, [history, stateSizes]);

  const totalRemaining = Math.max(totalNumbers - totalSentNumbers, 0);
  const pct = totalNumbers > 0 ? Math.round((totalSentNumbers / totalNumbers) * 100) : 0;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl overflow-hidden">
      {/* Header stats */}
      <div className="p-5 border-b border-border/30">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-accent" />
          </div>
          <h3 className="text-lg font-bold">Raport Trimiteri</h3>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="bg-success/10 border border-success/20 rounded-xl p-3 text-center">
            <p className="text-[10px] text-success/80 tracking-widest uppercase font-medium">Trimise</p>
            <p className="text-xl font-black font-mono-stat text-success">{totalSentNumbers.toLocaleString()}</p>
          </div>
          <div className="bg-accent/10 border border-accent/20 rounded-xl p-3 text-center">
            <p className="text-[10px] text-accent/80 tracking-widest uppercase font-medium">Rămase</p>
            <p className="text-xl font-black font-mono-stat text-accent">{totalRemaining.toLocaleString()}</p>
          </div>
          <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 text-center">
            <p className="text-[10px] text-primary/80 tracking-widest uppercase font-medium">Total</p>
            <p className="text-xl font-black font-mono-stat text-primary">{totalNumbers.toLocaleString()}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3">
          <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
            <span>Progres total</span>
            <span className="font-mono-stat font-bold">{pct}%</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-secondary/50 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-success"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>

      {/* Daily breakdown */}
      <div className="p-5">
        <p className="text-[11px] text-muted-foreground tracking-widest uppercase mb-3 flex items-center gap-1.5">
          <CalendarDays className="w-3.5 h-3.5" /> Istoric pe zile
        </p>

        {dayGroups.length === 0 ? (
          <div className="text-center py-6">
            <ChannelIcon className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">Nicio trimitere încă</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Apasă Copy → Sent pentru a începe</p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {dayGroups.map((day, idx) => (
                <motion.div
                  key={day.date}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-secondary/20 hover:bg-secondary/30 rounded-xl p-3 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-3.5 h-3.5 text-primary" />
                      <span className="text-sm font-bold">{day.label}</span>
                    </div>
                    <span className="text-xs font-mono-stat text-success font-bold">
                      +{day.itemCount.toLocaleString()} {label}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {day.batchCount} batch-uri
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(day.entries[0].sent_at).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}
                      {day.entries.length > 1 && ` — ${new Date(day.entries[day.entries.length - 1].sent_at).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}`}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
}
