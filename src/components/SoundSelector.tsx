import { motion } from 'framer-motion';
import { Volume2 } from 'lucide-react';
import { playSound } from '@/lib/confetti';

type SoundType = 'chime' | 'pop' | 'coin' | 'none';

const sounds: { id: SoundType; icon: string; label: string }[] = [
  { id: 'chime', icon: '🔔', label: 'Chime' },
  { id: 'pop', icon: '💫', label: 'Pop' },
  { id: 'coin', icon: '🪙', label: 'Coin' },
  { id: 'none', icon: '🔇', label: 'Fără sunet' },
];

interface SoundSelectorProps {
  selected: SoundType;
  onSelect: (s: SoundType) => void;
}

export default function SoundSelector({ selected, onSelect }: SoundSelectorProps) {
  const handleSelect = (s: SoundType) => {
    onSelect(s);
    playSound(s);
  };

  return (
    <div className="flex items-center gap-1">
      <Volume2 className="w-4 h-4 text-muted-foreground mr-1" />
      {sounds.map(s => (
        <motion.button
          key={s.id}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleSelect(s.id)}
          className={`px-2 py-1 rounded-md text-xs transition-colors ${
            selected === s.id ? 'bg-primary/20 text-primary' : 'hover:bg-secondary'
          }`}
          title={s.label}
        >
          {s.icon}
        </motion.button>
      ))}
    </div>
  );
}
