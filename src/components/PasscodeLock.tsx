import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock } from 'lucide-react';

const CORRECT_CODE = '2497';

interface PasscodeLockProps {
  onUnlock: () => void;
}

export default function PasscodeLock({ onUnlock }: PasscodeLockProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    setCode(digits);
    setError(false);

    if (digits.length === 4) {
      if (digits === CORRECT_CODE) {
        setSuccess(true);
        sessionStorage.setItem('blaster-unlocked', 'true');
        setTimeout(onUnlock, 600);
      } else {
        setError(true);
        setTimeout(() => { setCode(''); setError(false); inputRef.current?.focus(); }, 600);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background"
      onClick={() => inputRef.current?.focus()}
    >
      <div className="mesh-bg" />
      <motion.div
        className="flex flex-col items-center gap-8 p-8"
        animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
        transition={{ duration: 0.4 }}
      >
        <motion.div
          animate={success ? { scale: [1, 1.2, 1], rotate: [0, 360] } : { y: [0, -5, 0] }}
          transition={success ? { duration: 0.5 } : { duration: 3, repeat: Infinity }}
        >
          {success ? (
            <Shield className="w-16 h-16 text-success" />
          ) : (
            <Lock className="w-16 h-16 text-primary" />
          )}
        </motion.div>

        <div>
          <h1 className="text-2xl font-bold text-center font-outfit gradient-text">Blaster Pro</h1>
          <p className="text-sm text-muted-foreground text-center mt-1">Enter access code</p>
        </div>

        <div className="flex gap-3">
          {[0, 1, 2, 3].map(i => (
            <motion.div
              key={i}
              className={`w-5 h-5 rounded-full border-2 transition-colors ${
                i < code.length
                  ? error ? 'bg-destructive border-destructive' : success ? 'bg-success border-success' : 'bg-primary border-primary'
                  : 'border-muted-foreground/30'
              }`}
              animate={i < code.length ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.15 }}
            />
          ))}
        </div>

        <input
          ref={inputRef}
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          value={code}
          onChange={(e) => handleChange(e.target.value)}
          className="sr-only"
          autoFocus
          autoComplete="one-time-code"
        />

        <p className="text-xs text-muted-foreground animate-pulse">
          Tap the screen to open keyboard
        </p>
      </motion.div>
    </motion.div>
  );
}
