import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { detectStateFromNumber } from '@/lib/area-codes';

interface FileUploaderProps {
  channel: 'sms' | 'email';
  onFilesLoaded: (states: { name: string; numbers: string[]; city: string }[]) => void;
}

function cleanNumber(line: string): string {
  // Strip whitespace, dashes, parens, dots — keep + and digits
  return line.replace(/[\s\-().]/g, '');
}

function isValidPhone(val: string): boolean {
  // Must start with + or digit, be 7-15 digits
  const digits = val.replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15;
}

function isValidEmail(val: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
}

export default function FileUploader({ channel, onFilesLoaded }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback(async (fileList: FileList) => {
    const newStates: { name: string; numbers: string[]; city: string }[] = [];
    let totalDupes = 0;
    let totalInvalid = 0;
    const globalSeen = new Set<string>();

    for (const file of Array.from(fileList)) {
      if (!file.name.endsWith('.txt') && !file.name.endsWith('.csv')) continue;
      const text = await file.text();
      const lines = text.split(/[\n\r]+/).map(l => l.trim()).filter(Boolean);

      // Group numbers by detected state/city
      const stateGroups: Record<string, { numbers: string[]; city: string }> = {};

      for (const line of lines) {
        const val = channel === 'sms' ? cleanNumber(line) : line.trim().toLowerCase();
        
        // Validate
        if (channel === 'sms' && !isValidPhone(val)) { totalInvalid++; continue; }
        if (channel === 'email' && !isValidEmail(val)) { totalInvalid++; continue; }
        
        // Deduplicate globally across all files
        if (globalSeen.has(val)) { totalDupes++; continue; }
        globalSeen.add(val);

        // Auto-detect state from area code
        if (channel === 'sms') {
          const info = detectStateFromNumber(val);
          const stateName = info ? info.state : 'Unknown';
          const cityName = info ? info.city : '';
          if (!stateGroups[stateName]) stateGroups[stateName] = { numbers: [], city: cityName };
          stateGroups[stateName].numbers.push(val);
        } else {
          // For email, group by domain
          const domain = val.split('@')[1] || 'Unknown';
          if (!stateGroups[domain]) stateGroups[domain] = { numbers: [], city: '' };
          stateGroups[domain].numbers.push(val);
        }
      }

      // Convert groups to states array
      for (const [name, group] of Object.entries(stateGroups).sort((a, b) => a[0].localeCompare(b[0]))) {
        // Merge with existing group if same state
        const existing = newStates.find(s => s.name === name);
        if (existing) {
          existing.numbers.push(...group.numbers);
        } else {
          newStates.push({ name, numbers: group.numbers, city: group.city });
        }
      }

      if (Object.keys(stateGroups).length > 0) {
        setFiles(prev => [...prev, file.name]);
      }
    }

    if (newStates.length > 0) onFilesLoaded(newStates);

    // Report stats
    const parts: string[] = [];
    if (totalDupes > 0) parts.push(`${totalDupes} duplicates removed`);
    if (totalInvalid > 0) parts.push(`${totalInvalid} invalid entries skipped`);
    if (parts.length > 0) toast.info(parts.join(' · '));
  }, [onFilesLoaded, channel]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length) processFiles(e.dataTransfer.files);
  }, [processFiles]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-bold flex items-center gap-2">
          <Upload className="w-4 h-4 text-primary" />
          Upload Files
        </h3>
        <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()} className="gap-1 text-xs">
          <Plus className="w-3.5 h-3.5" /> Add
        </Button>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
          isDragging ? 'border-primary bg-primary/5 glow-primary' : 'border-border hover:border-primary/50'
        }`}
      >
        <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Drag & drop <strong>.txt / .csv</strong> or click to browse
        </p>
        <p className="text-[11px] text-muted-foreground mt-1">
          One {channel === 'sms' ? 'number' : 'email'} per line · Duplicates auto-removed
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".txt,.csv"
        multiple
        className="hidden"
        onChange={(e) => { if (e.target.files) processFiles(e.target.files); e.target.value = ''; }}
      />

      <AnimatePresence>
        {files.length > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3 flex flex-wrap gap-1.5">
            {files.map((f, i) => (
              <motion.span key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-medium">
                <FileText className="w-3 h-3" /> {f}
              </motion.span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
