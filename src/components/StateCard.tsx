import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Sparkles, Copy, Check, Eye, ClipboardList, Search, Filter, Shuffle, Trash2, Edit3, StickyNote } from 'lucide-react';
import { Input } from '@/components/ui/input';

const BATCH_SIZE = 490;

interface StateCardProps {
  name: string;
  numbers: string[];
  city: string;
  note: string;
  sentBatches: Set<number>;
  channel: 'sms' | 'email';
  onMarkSent: (batchIdx: number) => void;
  onUnmarkSent: (batchIdx: number) => void;
  onCopyBatch: (batchIdx: number) => void;
  onDelete: () => void;
  onRename: (newName: string) => void;
  onShuffle: () => void;
  onNoteChange: (note: string) => void;
}

function CircularProgress({ value, size = 52, strokeWidth = 4 }: { value: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(var(--secondary))" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={value === 100 ? 'hsl(var(--success))' : 'hsl(var(--accent))'}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[11px] font-bold font-mono-stat">{Math.round(value)}%</span>
      </div>
    </div>
  );
}

export default function StateCard({
  name, numbers, city, note, sentBatches, channel,
  onMarkSent, onUnmarkSent, onCopyBatch, onDelete, onRename, onShuffle, onNoteChange,
}: StateCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(name);
  const [showNote, setShowNote] = useState(false);
  const [copiedBatch, setCopiedBatch] = useState<number | null>(null);
  const [searchPrefix, setSearchPrefix] = useState('');
  const [filterUnsent, setFilterUnsent] = useState(false);

  const totalBatches = Math.ceil(numbers.length / BATCH_SIZE);
  const sentCount = sentBatches.size;
  const remainingBatches = totalBatches - sentCount;
  const progress = totalBatches > 0 ? (sentCount / totalBatches) * 100 : 0;
  const isComplete = progress === 100;

  const handleCopy = (idx: number) => {
    onCopyBatch(idx);
    setCopiedBatch(idx);
    setTimeout(() => setCopiedBatch(null), 2000);
  };

  const handleRename = () => {
    if (newName.trim()) onRename(newName.trim());
    setIsRenaming(false);
  };

  const filteredBatches = useMemo(() => {
    const batches = Array.from({ length: totalBatches }, (_, i) => i);
    let result = batches;
    if (filterUnsent) result = result.filter(i => !sentBatches.has(i));
    if (searchPrefix) {
      result = result.filter(i => {
        const start = i * BATCH_SIZE;
        const batch = numbers.slice(start, start + BATCH_SIZE);
        return batch.some(n => n.includes(searchPrefix));
      });
    }
    return result;
  }, [totalBatches, filterUnsent, sentBatches, searchPrefix, numbers]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass rounded-2xl overflow-hidden transition-all ${isComplete ? 'border-success/40 border' : ''}`}
    >
      {/* Header */}
      <div className="p-4 cursor-pointer flex items-center justify-between" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${isComplete ? 'bg-success/20' : 'bg-primary/15'}`}>
            <Sparkles className={`w-5 h-5 ${isComplete ? 'text-success' : 'text-primary'}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {isRenaming ? (
                <Input
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  onBlur={handleRename}
                  onKeyDown={e => e.key === 'Enter' && handleRename()}
                  onClick={e => e.stopPropagation()}
                  className="h-7 text-sm w-40"
                  autoFocus
                />
              ) : (
                <h3 className="font-bold text-base truncate">{name}</h3>
              )}
              {isComplete && (
                <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-success/20 text-success border border-success/30 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Complet
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 font-mono">
              {numbers.length.toLocaleString()} · <span className="text-primary">{sentCount}</span>/{totalBatches}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <CircularProgress value={progress} />
          {expanded ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
        </div>
      </div>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  value={searchPrefix}
                  onChange={e => setSearchPrefix(e.target.value)}
                  onClick={e => e.stopPropagation()}
                  placeholder="Caută prefix (ex: +1201)"
                  className="w-full bg-secondary/30 rounded-xl pl-9 pr-3 py-2.5 text-sm border-0 focus:outline-none focus:ring-1 focus:ring-primary/50 placeholder:text-muted-foreground/50"
                />
              </div>

              {/* Filter */}
              <button
                onClick={(e) => { e.stopPropagation(); setFilterUnsent(!filterUnsent); }}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  filterUnsent ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-secondary/30 text-muted-foreground'
                }`}
              >
                <Filter className="w-4 h-4" /> Doar netrimise
              </button>

              {/* Stats boxes */}
              <div className="grid grid-cols-3 gap-2">
                <div className={`rounded-xl p-3 text-center ${sentCount > 0 ? 'bg-primary/10 border border-primary/20' : 'bg-secondary/30'}`}>
                  <p className="text-xl font-bold font-mono-stat text-primary">{sentCount}</p>
                  <p className="text-[9px] text-muted-foreground tracking-widest uppercase">Trimise</p>
                </div>
                <div className={`rounded-xl p-3 text-center ${remainingBatches > 0 ? 'bg-accent/10 border border-accent/20' : 'bg-secondary/30'}`}>
                  <p className="text-xl font-bold font-mono-stat text-accent">{remainingBatches}</p>
                  <p className="text-[9px] text-muted-foreground tracking-widest uppercase">Rămase</p>
                </div>
                <div className="rounded-xl p-3 text-center bg-secondary/30">
                  <p className="text-xl font-bold font-mono-stat">{totalBatches}</p>
                  <p className="text-[9px] text-muted-foreground tracking-widest uppercase">Total</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-1">
                <button onClick={(e) => { e.stopPropagation(); setIsRenaming(true); }} className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-secondary/30">
                  <Edit3 className="w-3 h-3" /> Redenumește
                </button>
                <button onClick={(e) => { e.stopPropagation(); onShuffle(); }} className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-secondary/30">
                  <Shuffle className="w-3 h-3" /> Shuffle
                </button>
                <button onClick={(e) => { e.stopPropagation(); setShowNote(!showNote); }} className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-secondary/30">
                  <StickyNote className="w-3 h-3" /> Notă
                </button>
                <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="text-xs text-destructive hover:text-destructive/80 transition-colors flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-destructive/10">
                  <Trash2 className="w-3 h-3" /> Șterge
                </button>
              </div>

              {/* Note */}
              <AnimatePresence>
                {showNote && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                    <textarea
                      value={note}
                      onChange={e => onNoteChange(e.target.value)}
                      onClick={e => e.stopPropagation()}
                      placeholder="Adaugă o notă..."
                      className="w-full bg-secondary/30 rounded-xl p-3 text-sm resize-none h-16 border-0 focus:outline-none focus:ring-1 focus:ring-primary/50"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Batches */}
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {filteredBatches.map(i => {
                  const isSent = sentBatches.has(i);
                  const batchSize = Math.min(BATCH_SIZE, numbers.length - i * BATCH_SIZE);

                  return (
                    <div
                      key={i}
                      className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                        isSent ? 'bg-success/5 border border-success/15' : 'bg-secondary/20'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isSent ? 'bg-primary/20' : 'bg-secondary/40'
                        }`}>
                          {isSent ? <Check className="w-4 h-4 text-primary" /> : <span className="text-xs text-muted-foreground font-mono">{i + 1}</span>}
                        </div>
                        <div>
                          <p className={`text-sm font-medium ${isSent ? 'line-through text-muted-foreground' : ''}`}>
                            Lot {i + 1}
                          </p>
                          <p className="text-[11px] text-muted-foreground">{batchSize}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); /* view batch - could open modal */ }}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/30 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleCopy(i); }}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                            copiedBatch === i ? 'text-success' : 'text-accent hover:text-accent/80 hover:bg-accent/10'
                          }`}
                        >
                          <ClipboardList className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); isSent ? onUnmarkSent(i) : onMarkSent(i); }}
                          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            isSent ? 'text-muted-foreground hover:bg-secondary/30' : 'text-primary hover:bg-primary/10'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          {isSent ? 'Undo' : 'Trimis'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
