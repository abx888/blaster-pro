import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wrench, ChevronDown, ChevronUp, Search, Download, Trash2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const BATCH_SIZE = 490;

interface StateInfo {
  name: string;
  numbers: string[];
  sentBatches: Set<number>;
}

interface ToolsPanelProps {
  states: StateInfo[];
  channel: 'sms' | 'email';
  blacklist: string[];
  onRemoveDuplicates: () => { removed: number };
  onApplyBlacklist: (list: string[]) => void;
  onSetBlacklist: (list: string[]) => void;
}

export default function ToolsPanel({ states, channel, blacklist, onRemoveDuplicates, onApplyBlacklist, onSetBlacklist }: ToolsPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<string | null>(null);
  const [blacklistInput, setBlacklistInput] = useState('');
  const [dupResult, setDupResult] = useState<string | null>(null);

  const label = channel === 'sms' ? 'numere' : 'emailuri';

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    for (const s of states) {
      const idx = s.numbers.findIndex(n => n.includes(searchQuery.trim()));
      if (idx >= 0) {
        const batchIdx = Math.floor(idx / BATCH_SIZE);
        const isSent = s.sentBatches.has(batchIdx);
        setSearchResult(`Găsit în ${s.name}, Lot ${batchIdx + 1} ${isSent ? '(trimis)' : '(netrimis)'}`);
        return;
      }
    }
    setSearchResult('Nu a fost găsit');
  };

  const handleCheckDuplicates = () => {
    const result = onRemoveDuplicates();
    setDupResult(`${result.removed} duplicate eliminate`);
    setTimeout(() => setDupResult(null), 3000);
  };

  const handleAddBlacklist = () => {
    if (!blacklistInput.trim()) return;
    const items = blacklistInput.split('\n').map(l => l.trim()).filter(Boolean);
    onSetBlacklist([...blacklist, ...items]);
    setBlacklistInput('');
  };

  const handleExportCSV = () => {
    const rows = [['Stat', `Total ${label}`, 'Loturi total', 'Loturi trimise', 'Loturi rămase', 'Procent']];
    for (const s of states) {
      const total = Math.ceil(s.numbers.length / BATCH_SIZE);
      const sent = s.sentBatches.size;
      rows.push([s.name, String(s.numbers.length), String(total), String(sent), String(total - sent), `${Math.round((sent / total) * 100)}%`]);
    }
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `blaster-report-${channel}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-xl overflow-hidden">
      <div className="p-4 cursor-pointer flex items-center justify-between" onClick={() => setExpanded(!expanded)}>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Wrench className="w-5 h-5 text-primary" /> Instrumente
        </h3>
        {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="p-4 pt-0 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Duplicate Checker */}
              <div className="bg-secondary/30 rounded-lg p-4">
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-1"><Trash2 className="w-4 h-4" /> Duplicate Checker</h4>
                <Button size="sm" onClick={handleCheckDuplicates} className="w-full">Scanează & Curăță Duplicate</Button>
                {dupResult && <p className="text-xs text-success mt-2 font-mono">{dupResult}</p>}
              </div>

              {/* Blacklist */}
              <div className="bg-secondary/30 rounded-lg p-4">
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-1"><Shield className="w-4 h-4" /> Blacklist ({blacklist.length})</h4>
                <textarea
                  value={blacklistInput}
                  onChange={e => setBlacklistInput(e.target.value)}
                  placeholder="Un număr/email pe linie..."
                  className="w-full bg-background/50 rounded p-2 text-xs resize-none h-16 border-0 focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                />
                <div className="flex gap-1 mt-2">
                  <Button size="sm" variant="outline" onClick={handleAddBlacklist} className="flex-1 text-xs">Adaugă</Button>
                  <Button size="sm" onClick={() => onApplyBlacklist(blacklist)} className="flex-1 text-xs">Aplică Blacklist</Button>
                </div>
              </div>

              {/* Global Search */}
              <div className="bg-secondary/30 rounded-lg p-4">
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-1"><Search className="w-4 h-4" /> Căutare Globală</h4>
                <div className="flex gap-1">
                  <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Caută..." className="h-8 text-xs" onKeyDown={e => e.key === 'Enter' && handleSearch()} />
                  <Button size="sm" onClick={handleSearch} className="h-8">Caută</Button>
                </div>
                {searchResult && <p className="text-xs mt-2 font-mono text-muted-foreground">{searchResult}</p>}
              </div>

              {/* Export */}
              <div className="bg-secondary/30 rounded-lg p-4">
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-1"><Download className="w-4 h-4" /> Export Raport</h4>
                <Button size="sm" onClick={handleExportCSV} className="w-full">Descarcă CSV</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
