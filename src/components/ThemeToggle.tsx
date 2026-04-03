import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

const themes = [
  { id: 'classic', label: 'Classic', colors: ['#7c3aed', '#ec4899'] },
  { id: 'neon', label: 'Neon', colors: ['#06b6d4', '#d946ef'] },
  { id: 'ocean', label: 'Ocean', colors: ['#3b82f6', '#14b8a6'] },
  { id: 'sunset', label: 'Sunset', colors: ['#f97316', '#ec4899'] },
];

interface ThemeToggleProps {
  isDark: boolean;
  onToggleDark: () => void;
  colorTheme: string;
  onChangeTheme: (t: string) => void;
}

export default function ThemeToggle({ isDark, onToggleDark, colorTheme, onChangeTheme }: ThemeToggleProps) {
  return (
    <div className="flex items-center gap-2">
      {themes.map(t => (
        <motion.button
          key={t.id}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onChangeTheme(t.id)}
          className={`w-6 h-6 rounded-full border-2 transition-all ${colorTheme === t.id ? 'border-foreground scale-110' : 'border-transparent'}`}
          style={{ background: `linear-gradient(135deg, ${t.colors[0]}, ${t.colors[1]})` }}
          title={t.label}
        />
      ))}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onToggleDark}
        className="ml-2 p-2 rounded-lg hover:bg-secondary transition-colors"
      >
        {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </motion.button>
    </div>
  );
}
