import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, ChevronUp, ChevronDown, Calendar, MessageSquare, Mail, Copy, Check, SkipForward } from 'lucide-react';
import { toast } from 'sonner';

const BATCH_SIZE = 490;

interface StateInfo {
  name: string;
  numbers: string[];
  sentBatches: Set<number>;
}

interface QueueItem {
  stateName: string;
  batchIdx: number;
  numbers: string[];
  totalBatches: number;
  stateSentCount: number;
}

interface DailyQueueProps {
  states: StateInfo[];
  channel: 'sms' | 'email';
  round: number;
  statesRemaining: number;
  totalSent: number;
  totalRemaining: number;
  onMarkSent: (stateName: string, batchIdx: number) => void;
}

export default function DailyQueue({ states, channel, round, statesRemaining, totalSent, totalRemaining, onMarkSent }: DailyQueueProps) {
  const [expanded, setExpanded] = useState(true);
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);

  const mixedQueue = useMemo(() => {
    const queue: QueueItem[] = [];
    if (states.length === 0) return queue;

    const maxBatches = Math.max(...states.map(s => Math.ceil(s.numbers.length / BATCH_SIZE)));

    for (let batchIdx = 0; batchIdx < maxBatches; batchIdx++) {
      for (const state of states) {
        const totalBatches = Math.ceil(state.numbers.length / BATCH_SIZE);
        if (batchIdx >= totalBatches) continue;
        if (state.sentBatches.has(batchIdx)) continue;

        const start = batchIdx * BATCH_SIZE;
        const batchNumbers = state.numbers.slice(start, start + BATCH_SIZE);

        queue.push({
          stateName: state.name,
          batchIdx,
          numbers: batchNumbers,
          totalBatches,
          stateSentCount: state.sentBatches.size,
        });
      }
    }
    return queue;
  }, [states]);

  const currentItem = mixedQueue[0] || null;
  const upcomingItems = mixedQueue.slice(1, 8);

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const label = channel === 'sms' ? 'numbers' : 'emails';
  const ChannelIcon = channel === 'sms' ? MessageSquare : Mail;

  const handleCopy = async () => {
    if (!currentItem || copied) return;
    try {
      await navigator.clipboard.writeText(currentItem.numbers.join(channel === 'email' ? ', ' : '\n'));
      setCopied(true);
      toast.success(`${currentItem.numbers.length} ${label} copied — ${currentItem.stateName}`);
    } catch {
      // Fallback for non-HTTPS contexts
      const textarea = document.createElement('textarea');
      textarea.value = currentItem.numbers.join(channel === 'email' ? ', ' : '\n');
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      toast.success(`${currentItem.numbers.length} ${label} copied — ${currentItem.stateName}`);
    }
  };

  const handleMarkDone = () => {
    if (!currentItem || sending) return;
    setSending(true);
    onMarkSent(currentItem.stateName, currentItem.batchIdx);
    setCopied(false);
    // Small delay to prevent accidental double-clicks
    setTimeout(() => setSending(false), 400);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl overflow-hidden border-accent/30 border">
      {/* Header */}
      <div className="p-5 cursor-pointer flex items-center justify-between" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center shadow-lg">
            <Zap className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold">Daily Queue</h3>
              <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-accent/20 text-accent border border-accent/30">
                Round {round}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {statesRemaining} states remaining · {states.reduce((a, s) => a + s.numbers.length, 0).toLocaleString()} total
            </p>
          </div>
        </div>
        {expanded ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="px-5 pb-5 space-y-4">
              {/* Date */}
              <div className="flex items-center gap-2 bg-secondary/30 rounded-xl px-4 py-2.5">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">{today}</span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-secondary/30 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-muted-foreground tracking-widest uppercase">Sent</p>
                  <p className="text-xl font-bold font-mono-stat text-primary">{totalSent.toLocaleString()}</p>
                </div>
                <div className="bg-secondary/30 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-muted-foreground tracking-widest uppercase">Remaining</p>
                  <p className="text-xl font-bold font-mono-stat text-accent">{totalRemaining.toLocaleString()}</p>
                </div>
              </div>

              {/* CURRENT BATCH */}
              {currentItem ? (
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                      <ChannelIcon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold">{currentItem.stateName}</p>
                      <p className="text-[11px] text-muted-foreground">
                        Batch {currentItem.batchIdx + 1}/{currentItem.totalBatches} · {currentItem.numbers.length} {label}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleCopy}
                      disabled={copied}
                      className={`flex-1 py-4 rounded-xl text-lg font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${
                        copied
                          ? 'bg-success/20 text-success border border-success/30'
                          : 'gradient-primary text-primary-foreground hover:shadow-xl active:scale-[0.98]'
                      }`}
                    >
                      {copied ? (
                        <><Check className="w-5 h-5" /> Copied</>
                      ) : (
                        <><Copy className="w-5 h-5" /> Copy</>
                      )}
                    </button>
                    <button
                      onClick={handleMarkDone}
                      className={`flex-1 py-4 rounded-xl text-lg font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                        copied
                          ? 'bg-accent text-accent-foreground shadow-lg hover:shadow-xl'
                          : 'bg-secondary/50 text-muted-foreground hover:bg-secondary/80'
                      }`}
                    >
                      <Check className="w-5 h-5" /> Sent ✓
                    </button>
                  </div>

                  <p className="text-[11px] text-muted-foreground text-center mt-2">
                    1. Copy the {label} → 2. Mark as sent
                  </p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-3xl mb-2">🎉</p>
                  <p className="font-bold text-lg">All done!</p>
                  <p className="text-sm text-muted-foreground">You've completed all rounds for every state.</p>
                </div>
              )}

              {/* Upcoming */}
              {upcomingItems.length > 0 && (
                <div>
                  <p className="text-[11px] text-muted-foreground tracking-widest uppercase mb-2 flex items-center gap-1">
                    <SkipForward className="w-3 h-3" /> Up Next
                  </p>
                  <div className="space-y-1">
                    {upcomingItems.map((item, idx) => (
                      <div key={`${item.stateName}-${item.batchIdx}`} className="flex items-center justify-between bg-secondary/15 rounded-lg px-3 py-2">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-secondary/40 flex items-center justify-center text-[10px] font-mono text-muted-foreground">
                            {idx + 2}
                          </span>
                          <span className="text-sm">{item.stateName}</span>
                        </div>
                        <span className="text-[11px] text-muted-foreground font-mono">
                          {item.batchIdx + 1}/{item.totalBatches} · {item.numbers.length}
                        </span>
                      </div>
                    ))}
                    {mixedQueue.length > 8 && (
                      <p className="text-[11px] text-muted-foreground text-center py-1">
                        + {mixedQueue.length - 8} more batches
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
