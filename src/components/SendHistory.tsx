import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SendHistoryProps {
  history: Record<string, number>;
}

export default function SendHistory({ history }: SendHistoryProps) {
  const [expanded, setExpanded] = useState(false);
  const [monthOffset, setMonthOffset] = useState(0);

  const { monthLabel, days } = useMemo(() => {
    const now = new Date();
    now.setMonth(now.getMonth() + monthOffset);
    const year = now.getFullYear();
    const month = now.getMonth();
    const label = now.toLocaleDateString('ro-RO', { month: 'long', year: 'numeric' });
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const offset = firstDay === 0 ? 6 : firstDay - 1;
    
    const cells: { day: number; key: string; count: number }[] = [];
    for (let i = 0; i < offset; i++) cells.push({ day: 0, key: `empty-${i}`, count: 0 });
    for (let d = 1; d <= daysInMonth; d++) {
      const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({ day: d, key, count: history[key] || 0 });
    }
    
    return { monthLabel: label, days: cells };
  }, [monthOffset, history]);

  const weekDays = ['Lu', 'Ma', 'Mi', 'Jo', 'Vi', 'Sâ', 'Du'];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-xl overflow-hidden">
      <div className="p-4 cursor-pointer flex items-center justify-between" onClick={() => setExpanded(!expanded)}>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" /> Istoric Trimiteri
        </h3>
        {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="p-4 pt-0">
              <div className="flex items-center justify-between mb-3">
                <Button variant="ghost" size="sm" onClick={() => setMonthOffset(p => p - 1)}><ChevronLeft className="w-4 h-4" /></Button>
                <span className="text-sm font-medium capitalize">{monthLabel}</span>
                <Button variant="ghost" size="sm" onClick={() => setMonthOffset(p => p + 1)}><ChevronRight className="w-4 h-4" /></Button>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center">
                {weekDays.map(d => <div key={d} className="text-xs text-muted-foreground py-1">{d}</div>)}
                {days.map(d => (
                  <div
                    key={d.key}
                    className={`aspect-square flex flex-col items-center justify-center rounded text-xs ${
                      d.day === 0 ? '' : d.count > 0 ? 'bg-primary/20 text-primary font-medium' : 'text-muted-foreground'
                    }`}
                  >
                    {d.day > 0 && (
                      <>
                        <span>{d.day}</span>
                        {d.count > 0 && <span className="text-[9px] font-mono">{d.count}</span>}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
