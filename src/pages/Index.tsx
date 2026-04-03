import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MessageSquare, Mail, Download, Upload, RotateCcw, Moon, Sun, Sparkles, LogOut, Loader2, Lock, Shield, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import AuthPage from '@/pages/AuthPage';
import FileUploader from '@/components/FileUploader';
import DailyQueue from '@/components/DailyQueue';
import SendHistoryPanel from '@/components/SendHistoryPanel';
import QuickSearch from '@/components/QuickSearch';
import { fireConfetti, playSound } from '@/lib/confetti';
import { useAuth } from '@/hooks/useAuth';
import { useBlasterData } from '@/hooks/useBlasterData';
import StateSummaryPanel from '@/components/StateSummaryPanel';

const CORRECT_CODE = '2497';

function GatePage({ onPasscodeUnlock }: { onPasscodeUnlock: () => void }) {
  const [mode, setMode] = useState<'passcode' | 'auth'>('passcode');
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (mode === 'passcode') inputRef.current?.focus(); }, [mode]);

  const handleChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    setCode(digits);
    setError(false);
    if (digits.length === 4) {
      if (digits === CORRECT_CODE) {
        setSuccess(true);
        sessionStorage.setItem('blaster-unlocked', 'true');
        setTimeout(onPasscodeUnlock, 600);
      } else {
        setError(true);
        setTimeout(() => { setCode(''); setError(false); inputRef.current?.focus(); }, 600);
      }
    }
  };

  if (mode === 'auth') {
    return (
      <div className="relative">
        <AuthPage />
        <div className="fixed bottom-6 left-0 right-0 flex justify-center z-20">
          <button onClick={() => setMode('passcode')} className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5" />
            Use access code instead
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background"
      onClick={() => inputRef.current?.focus()}
    >
      <div className="mesh-bg" />
      <motion.div
        className="flex flex-col items-center gap-8 p-8 relative z-10"
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

        <button onClick={(e) => { e.stopPropagation(); setMode('auth'); }} className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 mt-4">
          <Mail className="w-3.5 h-3.5" />
          Sign in with email instead
        </button>
      </motion.div>
    </motion.div>
  );
}

const BATCH_SIZE = 490;

type Channel = 'sms' | 'email';

interface StateData {
  name: string;
  numbers: string[];
}

export default function Index() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { loadStates, loadSentMap, saveStates, markBatchSent, bulkMarkBatchesSent, clearAllData, loadSettings, saveSettings, loadSendHistory } = useBlasterData();

  const [isDark, setIsDark] = useState(true);
  const [passcodeUnlocked, setPasscodeUnlocked] = useState(() => sessionStorage.getItem('blaster-unlocked') === 'true');
  const [channel, setChannel] = useState<Channel>('sms');
  const [dataLoading, setDataLoading] = useState(true);
  const initialLoadDone = useRef(false);

  const [smsStates, setSmsStates] = useState<StateData[]>([]);
  const [emailStates, setEmailStates] = useState<StateData[]>([]);
  const [smsSentMap, setSmsSentMap] = useState<Record<string, Set<number>>>({});
  const [emailSentMap, setEmailSentMap] = useState<Record<string, Set<number>>>({});
  const [sendHistory, setSendHistory] = useState<{ state_name: string; batch_idx: number; sent_at: string }[]>([]);

  const states = channel === 'sms' ? smsStates : emailStates;
  const sentMap = channel === 'sms' ? smsSentMap : emailSentMap;

  // Load data from cloud on login
  useEffect(() => {
    if (!user) { setDataLoading(false); return; }
    setDataLoading(true);
    initialLoadDone.current = false;
    Promise.all([
      loadStates('sms'),
      loadStates('email'),
      loadSentMap('sms'),
      loadSentMap('email'),
      loadSettings(),
      loadSendHistory('sms'),
      loadSendHistory('email'),
    ]).then(([sms, email, smsSent, emailSent, settings, smsHist, emailHist]) => {
      setSmsStates(sms);
      setEmailStates(email);
      setSmsSentMap(smsSent);
      setEmailSentMap(emailSent);
      if (settings) {
        setIsDark(settings.is_dark);
        const ch = settings.last_channel as Channel;
        setChannel(ch);
        setSendHistory(ch === 'sms' ? smsHist : emailHist);
      } else {
        setSendHistory(smsHist);
      }
      setDataLoading(false);
      setTimeout(() => { initialLoadDone.current = true; }, 100);
    }).catch(err => {
      console.error('Failed to load data:', err);
      setDataLoading(false);
      initialLoadDone.current = true;
    });
  }, [user]);

  // Sync dark mode to DOM
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  // Save settings & reload history when channel changes (skip during initial load)
  useEffect(() => {
    if (!user || !initialLoadDone.current) return;
    saveSettings(isDark, channel);
    loadSendHistory(channel).then(setSendHistory);
  }, [isDark, channel, user, saveSettings]);

  // Stats - calculate actual sent numbers (last batch may be smaller)
  const totalNumbers = states.reduce((a, s) => a + s.numbers.length, 0);
  const totalBatches = states.reduce((a, s) => a + Math.ceil(s.numbers.length / BATCH_SIZE), 0);
  const totalSentBatches = Object.values(sentMap).reduce((a, s) => a + s.size, 0);
  
  const totalSentNumbers = useMemo(() => {
    let count = 0;
    for (const s of states) {
      const sent = sentMap[s.name];
      if (!sent) continue;
      for (const batchIdx of sent) {
        const start = batchIdx * BATCH_SIZE;
        const end = Math.min(start + BATCH_SIZE, s.numbers.length);
        count += end - start;
      }
    }
    return count;
  }, [states, sentMap]);
  
  const totalRemaining = Math.max(totalNumbers - totalSentNumbers, 0);
  const totalProgress = totalBatches > 0 ? Math.round((totalSentBatches / totalBatches) * 100) : 0;

  const currentRound = useMemo(() => {
    if (states.length === 0) return 1;
    const minBatchSent = Math.min(...states.map(s => {
      const total = Math.ceil(s.numbers.length / BATCH_SIZE);
      return total > 0 ? sentMap[s.name]?.size || 0 : 0;
    }));
    return minBatchSent + 1;
  }, [states, sentMap]);

  const statesRemaining = useMemo(() => {
    return states.filter(s => {
      const total = Math.ceil(s.numbers.length / BATCH_SIZE);
      return (sentMap[s.name]?.size || 0) < total;
    }).length;
  }, [states, sentMap]);

  // Handlers - use explicit channel param to avoid stale closures
  const handleFilesLoaded = useCallback((newStates: { name: string; numbers: string[]; city: string }[]) => {
    const currentChannel = channel;
    const setter = currentChannel === 'sms' ? setSmsStates : setEmailStates;
    
    setter(prev => {
      const existing = new Map(prev.map(s => [s.name, s]));
      const allExisting = new Set<string>();
      for (const s of prev) s.numbers.forEach(n => allExisting.add(n));

      let dupes = 0;
      for (const ns of newStates) {
        const uniqueNew: string[] = [];
        for (const n of ns.numbers) {
          if (allExisting.has(n)) { dupes++; continue; }
          allExisting.add(n);
          uniqueNew.push(n);
        }
        if (existing.has(ns.name)) {
          const ex = existing.get(ns.name)!;
          existing.set(ns.name, { ...ex, numbers: [...ex.numbers, ...uniqueNew] });
        } else {
          existing.set(ns.name, { name: ns.name, numbers: uniqueNew });
        }
      }
      if (dupes > 0) toast.info(`${dupes} cross-file duplicates removed`);
      const result = [...existing.values()];
      saveStates(currentChannel, result);
      return result;
    });
    const totalNums = newStates.reduce((a, s) => a + s.numbers.length, 0);
    toast.success(`${totalNums.toLocaleString()} numbers → ${newStates.length} states detected`);
  }, [channel, saveStates]);

  const handleMarkSent = useCallback((stateName: string, batchIdx: number) => {
    const currentChannel = channel;
    markBatchSent(currentChannel, stateName, batchIdx);

    const setter = currentChannel === 'sms' ? setSmsSentMap : setEmailSentMap;
    setter(prev => {
      const next = { ...prev };
      if (!next[stateName]) next[stateName] = new Set();
      else next[stateName] = new Set(next[stateName]);
      next[stateName].add(batchIdx);

      const currentStates = currentChannel === 'sms' ? smsStates : emailStates;
      const allDone = currentStates.every(s => {
        const total = Math.ceil(s.numbers.length / BATCH_SIZE);
        const sentSet = s.name === stateName ? next[s.name] : (next[s.name] || new Set());
        return sentSet.size >= total;
      });

      if (allDone && currentStates.length > 0) {
        setTimeout(() => {
          fireConfetti();
          toast.success('🎉 All done! Congratulations!');
        }, 300);
      }

      return next;
    });
    playSound('chime');
    // Add to local history immediately
    setSendHistory(prev => [{ state_name: stateName, batch_idx: batchIdx, sent_at: new Date().toISOString() }, ...prev]);
  }, [channel, markBatchSent, smsStates, emailStates]);

  const handleExportJSON = useCallback(() => {
    const data = {
      smsStates, emailStates,
      smsSentMap: Object.fromEntries(Object.entries(smsSentMap).map(([k, v]) => [k, [...v]])),
      emailSentMap: Object.fromEntries(Object.entries(emailSentMap).map(([k, v]) => [k, [...v]])),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'blaster-backup.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Backup exported');
  }, [smsStates, emailStates, smsSentMap, emailSentMap]);

  const handleImportJSON = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        const data = JSON.parse(await file.text());
        if (data.smsStates) { setSmsStates(data.smsStates); saveStates('sms', data.smsStates); }
        if (data.emailStates) { setEmailStates(data.emailStates); saveStates('email', data.emailStates); }
        if (data.smsSentMap) {
          const m: Record<string, Set<number>> = {};
          const batches: { stateName: string; batchIdx: number }[] = [];
          for (const [k, v] of Object.entries(data.smsSentMap)) {
            m[k] = new Set(v as number[]);
            for (const idx of v as number[]) batches.push({ stateName: k, batchIdx: idx });
          }
          setSmsSentMap(m);
          bulkMarkBatchesSent('sms', batches);
        }
        if (data.emailSentMap) {
          const m: Record<string, Set<number>> = {};
          const batches: { stateName: string; batchIdx: number }[] = [];
          for (const [k, v] of Object.entries(data.emailSentMap)) {
            m[k] = new Set(v as number[]);
            for (const idx of v as number[]) batches.push({ stateName: k, batchIdx: idx });
          }
          setEmailSentMap(m);
          bulkMarkBatchesSent('email', batches);
        }
        toast.success('Backup imported');
      } catch { toast.error('Invalid file'); }
    };
    input.click();
  }, [saveStates, bulkMarkBatchesSent]);

  const handleReset = useCallback(() => {
    if (!confirm('Are you sure? All data will be erased.')) return;
    setSmsStates([]); setEmailStates([]);
    setSmsSentMap({}); setEmailSentMap({});
    setSendHistory([]);
    clearAllData();
    toast.success('Data cleared');
  }, [clearAllData]);

  const handleLogout = useCallback(async () => {
    await signOut();
    sessionStorage.removeItem('blaster-unlocked');
    setPasscodeUnlocked(false);
    setSmsStates([]); setEmailStates([]);
    setSmsSentMap({}); setEmailSentMap({});
    setSendHistory([]);
    toast.success('Logged out');
  }, [signOut]);

  // Auth loading
  if (authLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="mesh-bg" />
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not logged in — show passcode or auth page
  if (!user && !passcodeUnlocked) {
    return <GatePage onPasscodeUnlock={() => setPasscodeUnlocked(true)} />;
  }

  // Data loading
  if (dataLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="mesh-bg" />
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading your data...</p>
        </div>
      </div>
    );
  }

  const ChannelIcon = channel === 'sms' ? MessageSquare : Mail;

  return (
    <div className="min-h-screen relative">
      <div className="mesh-bg" />

      {/* Header */}
      <header className="sticky top-0 z-40 glass-strong border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl glass flex items-center justify-center glow-primary">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>

            <div className="flex items-center bg-secondary/50 rounded-xl p-1">
              <button
                onClick={() => setChannel('sms')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                  channel === 'sms' ? 'gradient-primary text-primary-foreground shadow-lg' : 'text-muted-foreground'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
              </button>
              <button
                onClick={() => setChannel('email')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                  channel === 'email' ? 'gradient-primary text-primary-foreground shadow-lg' : 'text-muted-foreground'
                }`}
              >
                <Mail className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-0.5">
              <button onClick={() => setIsDark(!isDark)} className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors" title="Toggle theme">
                {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </button>
              <button onClick={handleExportJSON} className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors" title="Export backup">
                <Download className="w-4 h-4" />
              </button>
              <button onClick={handleImportJSON} className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors" title="Import backup">
                <Upload className="w-4 h-4" />
              </button>
              <button onClick={handleReset} className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors" title="Reset all data">
                <RotateCcw className="w-4 h-4" />
              </button>
              <button onClick={handleLogout} className="w-9 h-9 rounded-lg flex items-center justify-center text-destructive hover:bg-destructive/10 transition-colors" title="Log out">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
        {/* Upload */}
        <FileUploader channel={channel} onFilesLoaded={handleFilesLoaded} />

        {/* Quick Search */}
        {(smsStates.length > 0 || emailStates.length > 0) && (
          <QuickSearch
            smsStates={smsStates}
            emailStates={emailStates}
            smsSentMap={smsSentMap}
            emailSentMap={emailSentMap}
          />
        )}

        {/* Progress */}
        {states.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5 lg:p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                    <ChannelIcon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-lg lg:text-xl font-bold">{channel === 'sms' ? 'SMS' : 'Email'} Progress</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {totalSentBatches} sent · {totalBatches - totalSentBatches} remaining
                </p>
                <div className="w-full h-2.5 lg:h-3 rounded-full bg-secondary/50 overflow-hidden mb-2">
                  <motion.div
                    className="h-full rounded-full gradient-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${totalProgress}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">{totalNumbers.toLocaleString()} total {channel === 'sms' ? 'numbers' : 'emails'}</p>
              </div>
              <span className="text-4xl lg:text-5xl font-black font-mono-stat ml-4">{totalProgress}%</span>
            </div>
          </motion.div>
        )}

        {/* 2-col layout */}
        {states.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
            <div className="lg:col-span-3">
              <DailyQueue
                states={states.map(s => ({ name: s.name, numbers: s.numbers, sentBatches: sentMap[s.name] || new Set() }))}
                channel={channel}
                round={currentRound}
                statesRemaining={statesRemaining}
                totalSent={totalSentNumbers}
                totalRemaining={totalRemaining}
                onMarkSent={handleMarkSent}
              />
            </div>

            <div className="lg:col-span-2 space-y-5">
              {/* Send History / Report */}
              <SendHistoryPanel
                history={sendHistory}
                channel={channel}
                states={states}
                totalNumbers={totalNumbers}
                totalSentNumbers={totalSentNumbers}
              />

              {/* Auto-Detected Locations + Loaded States */}
              <StateSummaryPanel states={states} sentMap={sentMap} channel={channel} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
