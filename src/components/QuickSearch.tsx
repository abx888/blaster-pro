import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, CheckCircle2, Clock, MessageSquare, Mail, AlertCircle } from 'lucide-react';

const BATCH_SIZE = 490;

interface StateData {
  name: string;
  numbers: string[];
}

interface QuickSearchProps {
  smsStates: StateData[];
  emailStates: StateData[];
  smsSentMap: Record<string, Set<number>>;
  emailSentMap: Record<string, Set<number>>;
}

interface SearchResult {
  value: string;
  channel: 'sms' | 'email';
  stateName: string;
  batchIdx: number;
  isSent: boolean;
}

export default function QuickSearch({ smsStates, emailStates, smsSentMap, emailSentMap }: QuickSearchProps) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Debounce search for performance with large datasets
  const handleQueryChange = useCallback((val: string) => {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQuery(val), 200);
  }, []);

  const results = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (q.length < 3) return [];

    const found: SearchResult[] = [];
    const MAX = 20;

    // Search SMS
    for (const state of smsStates) {
      for (let i = 0; i < state.numbers.length && found.length < MAX; i++) {
        if (state.numbers[i].toLowerCase().includes(q)) {
          const batchIdx = Math.floor(i / BATCH_SIZE);
          const isSent = smsSentMap[state.name]?.has(batchIdx) || false;
          found.push({ value: state.numbers[i], channel: 'sms', stateName: state.name, batchIdx, isSent });
        }
      }
    }

    // Search Email
    for (const state of emailStates) {
      for (let i = 0; i < state.numbers.length && found.length < MAX; i++) {
        if (state.numbers[i].toLowerCase().includes(q)) {
          const batchIdx = Math.floor(i / BATCH_SIZE);
          const isSent = emailSentMap[state.name]?.has(batchIdx) || false;
          found.push({ value: state.numbers[i], channel: 'email', stateName: state.name, batchIdx, isSent });
        }
      }
    }

    return found;
  }, [debouncedQuery, smsStates, emailStates, smsSentMap, emailSentMap]);

  const showResults = focused && debouncedQuery.trim().length >= 3;
  const sentCount = results.filter(r => r.isSent).length;
  const pendingCount = results.filter(r => !r.isSent).length;

  return (
    <div className="relative">
      <div className={`flex items-center gap-2 glass rounded-xl px-3 py-2.5 transition-all ${focused ? 'ring-1 ring-primary/40 border-primary/30' : 'border-border/50'} border`}>
        <Search className="w-4 h-4 text-muted-foreground shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          placeholder="Caută număr sau email..."
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
        />
        {query && (
          <button onClick={() => { setQuery(''); setDebouncedQuery(''); inputRef.current?.focus(); }} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: -5, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.98 }}
            className="absolute top-full left-0 right-0 mt-2 z-50 glass-strong rounded-xl border border-border/50 shadow-2xl overflow-hidden max-h-80 overflow-y-auto"
          >
            {results.length === 0 ? (
              <div className="p-4 text-center">
                <AlertCircle className="w-6 h-6 mx-auto mb-2 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">Nu s-a găsit nimic</p>
                <p className="text-[11px] text-muted-foreground/60 mt-0.5">Încearcă cu alt număr sau email</p>
              </div>
            ) : (
              <>
                {/* Summary bar */}
                <div className="flex items-center gap-3 px-3 py-2 bg-secondary/30 border-b border-border/30 text-[11px]">
                  <span className="text-muted-foreground font-medium">{results.length} rezultate</span>
                  {sentCount > 0 && (
                    <span className="flex items-center gap-1 text-success">
                      <CheckCircle2 className="w-3 h-3" /> {sentCount} trimise
                    </span>
                  )}
                  {pendingCount > 0 && (
                    <span className="flex items-center gap-1 text-accent">
                      <Clock className="w-3 h-3" /> {pendingCount} în așteptare
                    </span>
                  )}
                </div>

                {/* Results */}
                <div className="divide-y divide-border/20">
                  {results.map((r, idx) => {
                    const Icon = r.channel === 'sms' ? MessageSquare : Mail;
                    return (
                      <div key={`${r.channel}-${r.stateName}-${r.value}-${idx}`} className="flex items-center gap-2.5 px-3 py-2.5 hover:bg-secondary/20 transition-colors">
                        <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-mono truncate">{r.value}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {r.stateName} · Batch {r.batchIdx + 1}
                          </p>
                        </div>
                        {r.isSent ? (
                          <span className="shrink-0 flex items-center gap-1 text-[10px] font-bold text-success bg-success/10 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" /> Trimis
                          </span>
                        ) : (
                          <span className="shrink-0 flex items-center gap-1 text-[10px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full">
                            <Clock className="w-3 h-3" /> Așteaptă
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
