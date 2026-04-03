import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, ChevronDown, ChevronUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const BATCH_SIZE = 490;
const COLORS = ['hsl(250,90%,65%)', 'hsl(330,85%,60%)', 'hsl(190,95%,55%)', 'hsl(142,76%,36%)', 'hsl(25,95%,55%)', 'hsl(210,90%,55%)'];

interface StateInfo {
  name: string;
  numbers: string[];
  sentBatches: Set<number>;
}

interface DashboardProps {
  states: StateInfo[];
  sendHistory: Record<string, number>;
}

export default function Dashboard({ states, sendHistory }: DashboardProps) {
  const [expanded, setExpanded] = useState(false);

  const barData = useMemo(() =>
    states.map(s => ({
      name: s.name.length > 10 ? s.name.slice(0, 10) + '…' : s.name,
      progress: Math.round((s.sentBatches.size / Math.max(Math.ceil(s.numbers.length / BATCH_SIZE), 1)) * 100),
    })), [states]);

  const totalSent = states.reduce((a, s) => a + s.sentBatches.size * BATCH_SIZE, 0);
  const totalNumbers = states.reduce((a, s) => a + s.numbers.length, 0);
  const pieData = [
    { name: 'Trimise', value: totalSent },
    { name: 'Rămase', value: Math.max(totalNumbers - totalSent, 0) },
  ];

  const last7Days = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      days.push({ day: d.toLocaleDateString('ro-RO', { weekday: 'short' }), count: sendHistory[key] || 0 });
    }
    return days;
  }, [sendHistory]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-xl overflow-hidden">
      <div className="p-4 cursor-pointer flex items-center justify-between" onClick={() => setExpanded(!expanded)}>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" /> Dashboard
        </h3>
        {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="p-4 pt-0 grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Progress per state */}
              <div className="bg-secondary/30 rounded-lg p-3">
                <p className="text-xs font-medium mb-2 text-muted-foreground">Progres per stat</p>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={barData}>
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="progress" fill="hsl(250,90%,65%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Pie chart */}
              <div className="bg-secondary/30 rounded-lg p-3">
                <p className="text-xs font-medium mb-2 text-muted-foreground">Trimise vs Rămase</p>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" outerRadius={60} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Last 7 days */}
              <div className="bg-secondary/30 rounded-lg p-3">
                <p className="text-xs font-medium mb-2 text-muted-foreground">Ultimele 7 zile</p>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={last7Days}>
                    <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(190,95%,55%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
