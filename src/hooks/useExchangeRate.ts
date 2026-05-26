import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchLatestRates, FALLBACK_RATES } from '../services/exchangeService';
import {
  saveRatesCache,
  loadRatesCache,
  loadHistory,
  upsertTodaySnapshot,
  generateSimulatedHistory,
} from '../utils/storage';
import type { ExchangeRates, RateSnapshot, AppStatus } from '../types';

interface UseExchangeRateReturn {
  rates:       ExchangeRates | null;
  history:     RateSnapshot[];
  status:      AppStatus;
  lastUpdated: Date | null;
  refresh:     () => Promise<void>;
}

export function useExchangeRate(): UseExchangeRateReturn {
  const [rates,       setRates]       = useState<ExchangeRates | null>(null);
  const [history,     setHistory]     = useState<RateSnapshot[]>([]);
  const [status,      setStatus]      = useState<AppStatus>('loading');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Ref pour éviter les re-renders inutiles sur le cache en mémoire
  const memoryCache = useRef<ExchangeRates | null>(null);

  const refresh = useCallback(async () => {
    setStatus('loading');
    try {
      const newRates = await fetchLatestRates();

      // Persistance
      saveRatesCache(newRates);
      const updatedHistory = (() => {
        const existing = loadHistory();
        if (existing.length === 0) return generateSimulatedHistory(newRates);
        return upsertTodaySnapshot(newRates);
      })();

      memoryCache.current = newRates;
      setRates(newRates);
      setHistory(updatedHistory);
      setLastUpdated(new Date());
      setStatus('live');

    } catch {
      // Fallback 1 : cache mémoire (session active)
      if (memoryCache.current) {
        setRates(memoryCache.current);
        setStatus('cached');
        return;
      }

      // Fallback 2 : localStorage
      const cached = loadRatesCache();
      if (cached) {
        const hist = loadHistory();
        memoryCache.current = cached.rates;
        setRates(cached.rates);
        setHistory(hist.length > 0 ? hist : generateSimulatedHistory(cached.rates));
        setLastUpdated(new Date(cached.timestamp));
        setStatus('cached');
        return;
      }

      // Fallback 3 : taux BCEAO statiques
      setRates(FALLBACK_RATES);
      setHistory(generateSimulatedHistory(FALLBACK_RATES));
      setStatus('offline');
    }
  }, []);

  // Premier chargement
  useEffect(() => { refresh(); }, [refresh]);

  // Reconnexion réseau → actualisation automatique
  useEffect(() => {
    const handleOnline = () => { if (status !== 'live') refresh(); };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [status, refresh]);

  return { rates, history, status, lastUpdated, refresh };
}
