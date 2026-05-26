import type { ExchangeRates, RatesCache, RateSnapshot } from '../types';

const KEYS = {
  cache:   'cfachange:rates_cache',
  history: 'cfachange:rates_history',
} as const;

const MAX_HISTORY_DAYS = 30;

// ── Cache des taux (dernière requête API réussie) ─────────────────────────────

export function saveRatesCache(rates: ExchangeRates): void {
  try {
    const payload: RatesCache = { timestamp: Date.now(), rates };
    localStorage.setItem(KEYS.cache, JSON.stringify(payload));
  } catch {
    // localStorage peut être plein ou bloqué en mode privé — fail silently
  }
}

export function loadRatesCache(): RatesCache | null {
  try {
    const raw = localStorage.getItem(KEYS.cache);
    return raw ? (JSON.parse(raw) as RatesCache) : null;
  } catch {
    return null;
  }
}

// ── Historique des taux (snapshots journaliers) ───────────────────────────────

export function loadHistory(): RateSnapshot[] {
  try {
    const raw = localStorage.getItem(KEYS.history);
    return raw ? (JSON.parse(raw) as RateSnapshot[]) : [];
  } catch {
    return [];
  }
}

/**
 * Ajoute ou met à jour le snapshot du jour, puis sauvegarde.
 * Conserve les MAX_HISTORY_DAYS derniers jours.
 */
export function upsertTodaySnapshot(rates: ExchangeRates): RateSnapshot[] {
  const today = new Date().toISOString().split('T')[0]; // yyyy-mm-dd
  const label = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });

  let history = loadHistory();
  const snapshot: RateSnapshot = { date: label, EUR: rates.EUR, USD: rates.USD, CAD: rates.CAD };

  const lastEntry = history[history.length - 1];
  // On identifie le "jour" par la date ISO stockée dans la clé, pas dans l'affichage
  // On stocke temporairement la date ISO dans un champ caché pour la comparaison
  const lastRaw = (() => {
    try {
      const raw = localStorage.getItem(KEYS.history + ':lastDate');
      return raw ?? '';
    } catch { return ''; }
  })();

  if (lastRaw === today && lastEntry) {
    history[history.length - 1] = snapshot; // mise à jour du jour courant
  } else {
    history.push(snapshot);
    try { localStorage.setItem(KEYS.history + ':lastDate', today); } catch { /* noop */ }
  }

  if (history.length > MAX_HISTORY_DAYS) history = history.slice(-MAX_HISTORY_DAYS);

  try { localStorage.setItem(KEYS.history, JSON.stringify(history)); } catch { /* noop */ }
  return history;
}

/**
 * Génère 14 jours de données simulées à partir d'un taux réel.
 * Utilisé lors de la première ouverture (historique vide).
 */
export function generateSimulatedHistory(rates: ExchangeRates): RateSnapshot[] {
  const today = new Date();
  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (13 - i));
    const jitter = () => 1 + (Math.random() - 0.5) * 0.028;
    return {
      date: d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
      EUR: rates.EUR * (1 + (Math.random() - 0.5) * 0.0009), // EUR quasi fixe (parité BCEAO)
      USD: rates.USD * jitter(),
      CAD: rates.CAD * jitter(),
    };
  });
}
