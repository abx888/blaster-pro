import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface StateData {
  name: string;
  numbers: string[];
}

// Supabase default limit is 1000 rows — paginate to get all
async function fetchAll<T>(query: any): Promise<T[]> {
  const PAGE = 1000;
  let offset = 0;
  const all: T[] = [];
  while (true) {
    const { data, error } = await query.range(offset, offset + PAGE - 1);
    if (error) { console.error('fetchAll error:', error); break; }
    if (!data || data.length === 0) break;
    all.push(...data);
    if (data.length < PAGE) break;
    offset += PAGE;
  }
  return all;
}

export function useBlasterData() {
  const { user } = useAuth();

  const loadStates = useCallback(async (channel: 'sms' | 'email'): Promise<StateData[]> => {
    if (!user) return [];
    const data = await fetchAll<{ state_name: string; numbers: string[] }>(
      supabase
        .from('blaster_states')
        .select('state_name, numbers')
        .eq('user_id', user.id)
        .eq('channel', channel)
        .order('state_name')
    );
    return data.map(d => ({ name: d.state_name, numbers: d.numbers || [] }));
  }, [user]);

  const loadSentMap = useCallback(async (channel: 'sms' | 'email'): Promise<Record<string, Set<number>>> => {
    if (!user) return {};
    const data = await fetchAll<{ state_name: string; batch_idx: number }>(
      supabase
        .from('blaster_sent_batches')
        .select('state_name, batch_idx')
        .eq('user_id', user.id)
        .eq('channel', channel)
        .order('state_name')
    );
    const map: Record<string, Set<number>> = {};
    for (const row of data) {
      if (!map[row.state_name]) map[row.state_name] = new Set();
      map[row.state_name].add(row.batch_idx);
    }
    return map;
  }, [user]);

  const saveStates = useCallback(async (channel: 'sms' | 'email', states: StateData[]) => {
    if (!user) return;
    const { error: delError } = await supabase
      .from('blaster_states')
      .delete()
      .eq('user_id', user.id)
      .eq('channel', channel);
    if (delError) { console.error('saveStates delete error:', delError); return; }

    if (states.length === 0) return;
    const rows = states.map(s => ({
      user_id: user.id,
      channel,
      state_name: s.name,
      numbers: s.numbers,
    }));
    const { error } = await supabase.from('blaster_states').insert(rows);
    if (error) console.error('saveStates insert error:', error);
  }, [user]);

  const markBatchSent = useCallback(async (channel: 'sms' | 'email', stateName: string, batchIdx: number) => {
    if (!user) return;
    const { error } = await supabase.from('blaster_sent_batches').upsert({
      user_id: user.id,
      channel,
      state_name: stateName,
      batch_idx: batchIdx,
    }, { onConflict: 'user_id,channel,state_name,batch_idx' });
    if (error) console.error('markBatchSent error:', error);
  }, [user]);

  const bulkMarkBatchesSent = useCallback(async (channel: 'sms' | 'email', batches: { stateName: string; batchIdx: number }[]) => {
    if (!user || batches.length === 0) return;
    // Chunk into batches of 500 to avoid payload limits
    const CHUNK = 500;
    for (let i = 0; i < batches.length; i += CHUNK) {
      const chunk = batches.slice(i, i + CHUNK);
      const rows = chunk.map(b => ({
        user_id: user.id,
        channel,
        state_name: b.stateName,
        batch_idx: b.batchIdx,
      }));
      const { error } = await supabase.from('blaster_sent_batches').upsert(rows, {
        onConflict: 'user_id,channel,state_name,batch_idx',
      });
      if (error) { console.error('bulkMarkBatchesSent error:', error); break; }
    }
  }, [user]);

  const clearAllData = useCallback(async () => {
    if (!user) return;
    const [r1, r2, r3] = await Promise.all([
      supabase.from('blaster_states').delete().eq('user_id', user.id),
      supabase.from('blaster_sent_batches').delete().eq('user_id', user.id),
      supabase.from('blaster_settings').delete().eq('user_id', user.id),
    ]);
    if (r1.error) console.error('clearAllData states:', r1.error);
    if (r2.error) console.error('clearAllData batches:', r2.error);
    if (r3.error) console.error('clearAllData settings:', r3.error);
  }, [user]);

  const loadSettings = useCallback(async () => {
    if (!user) return null;
    const { data, error } = await supabase
      .from('blaster_settings')
      .select('is_dark, last_channel')
      .eq('user_id', user.id)
      .maybeSingle();
    if (error) { console.error('loadSettings error:', error); return null; }
    return data;
  }, [user]);

  const saveSettings = useCallback(async (isDark: boolean, channel: 'sms' | 'email') => {
    if (!user) return;
    const { error } = await supabase.from('blaster_settings').upsert({
      user_id: user.id,
      is_dark: isDark,
      last_channel: channel,
    }, { onConflict: 'user_id' });
    if (error) console.error('saveSettings error:', error);
  }, [user]);

  // Load full send history with timestamps grouped by day
  const loadSendHistory = useCallback(async (channel: 'sms' | 'email') => {
    if (!user) return [];
    const data = await fetchAll<{ state_name: string; batch_idx: number; sent_at: string }>(
      supabase
        .from('blaster_sent_batches')
        .select('state_name, batch_idx, sent_at')
        .eq('user_id', user.id)
        .eq('channel', channel)
        .order('sent_at', { ascending: false })
    );
    return data;
  }, [user]);

  return { loadStates, loadSentMap, saveStates, markBatchSent, bulkMarkBatchesSent, clearAllData, loadSettings, saveSettings, loadSendHistory };
}
