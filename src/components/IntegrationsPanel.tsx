import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plug, ChevronDown, ChevronUp, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { integrations, integrationCategories, type Integration } from '@/lib/integrations-data';

interface IntegrationsPanelProps {
  configs: Record<string, Record<string, string>>;
  enabled: Record<string, boolean>;
  onSaveConfig: (id: string, config: Record<string, string>) => void;
  onToggle: (id: string) => void;
}

export default function IntegrationsPanel({ configs, enabled, onSaveConfig, onToggle }: IntegrationsPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const [configuring, setConfiguring] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});

  const openConfig = (int: Integration) => {
    setConfiguring(int.id);
    setFormData(configs[int.id] || {});
  };

  const saveConfig = () => {
    if (configuring) {
      onSaveConfig(configuring, formData);
      setConfiguring(null);
    }
  };

  const activeInt = configuring ? integrations.find(i => i.id === configuring) : null;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-xl overflow-hidden">
      <div className="p-4 cursor-pointer flex items-center justify-between" onClick={() => setExpanded(!expanded)}>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Plug className="w-5 h-5 text-primary" /> Integrări ({integrations.length})
        </h3>
        {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="p-4 pt-0 space-y-4">
              {integrationCategories.map(cat => (
                <div key={cat}>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{cat}</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {integrations.filter(i => i.category === cat).map(int => (
                      <div key={int.id} className="bg-secondary/30 rounded-lg p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-lg">{int.icon}</span>
                          <span className="text-xs font-medium truncate">{int.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${enabled[int.id] ? 'bg-success' : 'bg-muted-foreground/30'}`} />
                          <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2" onClick={() => openConfig(int)}>
                            Config
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Config Modal */}
      <AnimatePresence>
        {configuring && activeInt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
            onClick={() => setConfiguring(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-strong rounded-xl p-6 w-full max-w-md"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <span className="text-xl">{activeInt.icon}</span> {activeInt.name}
                </h3>
                <Button variant="ghost" size="sm" onClick={() => setConfiguring(null)}><X className="w-4 h-4" /></Button>
              </div>
              <div className="space-y-3">
                {activeInt.fields.map(f => (
                  <div key={f.key}>
                    <label className="text-xs font-medium text-muted-foreground">{f.label}</label>
                    <Input
                      type={f.type}
                      value={formData[f.key] || ''}
                      onChange={e => setFormData(p => ({ ...p, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      className="mt-1 h-9 text-sm"
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={saveConfig} className="flex-1">Salvează</Button>
                <Button
                  variant={enabled[activeInt.id] ? 'destructive' : 'outline'}
                  onClick={() => onToggle(activeInt.id)}
                  className="flex-1"
                >
                  {enabled[activeInt.id] ? 'Dezactivează' : 'Activează'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
