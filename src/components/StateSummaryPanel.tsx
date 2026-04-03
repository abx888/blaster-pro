import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Copy, Check, Download, ChevronDown, ChevronUp, Building2, Search, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import { detectStateFromNumber } from '@/lib/area-codes';

interface StateData {
  name: string;
  numbers: string[];
}

interface StateSummaryPanelProps {
  states: StateData[];
  sentMap: Record<string, Set<number>>;
  channel: 'sms' | 'email';
}

interface CityGroup {
  city: string;
  numbers: string[];
}

interface StateGroup {
  state: string;
  totalNumbers: number;
  cities: CityGroup[];
}

const BATCH_SIZE = 490;

export default function StateSummaryPanel({ states, sentMap, channel }: StateSummaryPanelProps) {
  const [expandedState, setExpandedState] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const stateGroups = useMemo(() => {
    // Each state in states[] is already auto-detected by state name
    // Sub-group each state's numbers by city using area codes
    const result: StateGroup[] = states.map(s => {
      const cityMap: Record<string, string[]> = {};
      for (const num of s.numbers) {
        if (channel === 'sms') {
          const info = detectStateFromNumber(num);
          const city = info?.city || 'Other';
          if (!cityMap[city]) cityMap[city] = [];
          cityMap[city].push(num);
        } else {
          const key = 'All';
          if (!cityMap[key]) cityMap[key] = [];
          cityMap[key].push(num);
        }
      }
      return {
        state: s.name,
        totalNumbers: s.numbers.length,
        cities: Object.entries(cityMap)
          .map(([city, numbers]) => ({ city, numbers }))
          .sort((a, b) => b.numbers.length - a.numbers.length),
      };
    }).sort((a, b) => b.totalNumbers - a.totalNumbers);

    return result;
  }, [states, channel]);

  const filtered = useMemo(() => {
    if (!search) return stateGroups;
    const q = search.toLowerCase();
    return stateGroups.filter(g =>
      g.state.toLowerCase().includes(q) ||
      g.cities.some(c => c.city.toLowerCase().includes(q))
    );
  }, [stateGroups, search]);

  const totalAll = stateGroups.reduce((a, g) => a + g.totalNumbers, 0);

  const handleCopy = (key: string, numbers: string[]) => {
    navigator.clipboard.writeText(numbers.join('\n'));
    setCopiedKey(key);
    toast.success(`${numbers.length.toLocaleString()} numbers copied`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleExportCSV = () => {
    const rows = ['State,City,Phone Number'];
    for (const g of stateGroups) {
      for (const c of g.cities) {
        for (const n of c.numbers) {
          rows.push(`"${g.state}","${c.city}","${n}"`);
        }
      }
    }
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `blaster-numbers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported');
  };

  if (stateGroups.length === 0) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5 lg:p-6 lg:sticky lg:top-24">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-muted-foreground tracking-widest uppercase flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary" />
          Auto-Detected Locations
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono-stat text-muted-foreground">
            {stateGroups.length} states · {totalAll.toLocaleString()} numbers
          </span>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> CSV
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search state or city..."
          className="w-full bg-secondary/30 rounded-xl pl-9 pr-3 py-2 text-sm border-0 focus:outline-none focus:ring-1 focus:ring-primary/50 placeholder:text-muted-foreground/50"
        />
      </div>

      <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
        {filtered.map(g => {
          const isExpanded = expandedState === g.state;
          const pct = totalAll > 0 ? ((g.totalNumbers / totalAll) * 100).toFixed(1) : '0';

          return (
            <div key={g.state} className="rounded-xl bg-secondary/20 overflow-hidden">
              {/* State header */}
              <div
                className="flex items-center justify-between p-3 cursor-pointer hover:bg-secondary/30 transition-colors"
                onClick={() => setExpandedState(isExpanded ? null : g.state)}
              >
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <MapPin className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-sm font-semibold truncate">{g.state}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-mono">
                    {g.cities.length} {g.cities.length === 1 ? 'city' : 'cities'}
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-mono-stat text-muted-foreground">{g.totalNumbers.toLocaleString()}</span>
                  {/* Progress bar */}
                  {(() => {
                    const total = Math.ceil(g.totalNumbers / BATCH_SIZE);
                    const sent = sentMap[g.state]?.size || 0;
                    const sPct = total > 0 ? Math.round((sent / total) * 100) : 0;
                    const isDone = sPct === 100;
                    return (
                      <>
                        <div className="w-16 h-1.5 rounded-full bg-secondary/50 overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${isDone ? 'bg-success' : 'bg-primary'}`} style={{ width: `${sPct}%` }} />
                        </div>
                        <span className="text-[10px] font-mono-stat w-8 text-right">{sPct}%</span>
                      </>
                    );
                  })()}
                  <button
                    onClick={e => { e.stopPropagation(); handleCopy(`state-${g.state}`, g.cities.flatMap(c => c.numbers)); }}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                      copiedKey === `state-${g.state}` ? 'text-success' : 'text-accent hover:bg-accent/10'
                    }`}
                    title="Copy all numbers from this state"
                  >
                    {copiedKey === `state-${g.state}` ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </div>
              </div>

              {/* Cities */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-3 pb-3 space-y-1">
                      {g.cities.map(c => (
                        <div
                          key={c.city}
                          className="flex items-center justify-between py-2 px-3 rounded-lg bg-background/30 hover:bg-background/50 transition-colors"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Building2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            <span className="text-xs font-medium truncate">{c.city}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-mono text-muted-foreground">{c.numbers.length.toLocaleString()}</span>
                            <button
                              onClick={() => handleCopy(`city-${g.state}-${c.city}`, c.numbers)}
                              className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${
                                copiedKey === `city-${g.state}-${c.city}` ? 'text-success' : 'text-accent hover:bg-accent/10'
                              }`}
                              title={`Copy ${c.city} numbers`}
                            >
                              {copiedKey === `city-${g.state}-${c.city}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}