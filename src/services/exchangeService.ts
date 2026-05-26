import type { ExchangeRates } from '../types';

/**
 * open.er-api.com — gratuit, sans clé API, CORS activé.
 * En production avec clé : remplacer par exchangerate-api.com v6
 * et définir VITE_EXCHANGE_API_KEY dans .env
 */
const BASE_URL = 'https://open.er-api.com/v6/latest';

/** Taux BCEAO officiels (XOF/EUR est fixe par traité) */
export const FALLBACK_RATES: ExchangeRates = {
  EUR: 1 / 655.957,   // parité fixe BCEAO
  USD: 1 / 601.5,
  CAD: 1 / 445.0,
};

interface ApiResponse {
  result: string;
  rates: Record<string, number>;
}

/**
 * Récupère les taux en temps réel depuis l'API.
 * @throws Error si la réponse réseau est en échec
 */
export async function fetchLatestRates(): Promise<ExchangeRates> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);

  try {
    const res = await fetch(`${BASE_URL}/XOF`, { signal: controller.signal });
    if (!res.ok) throw new Error(`API error: ${res.status}`);

    const data: ApiResponse = await res.json();
    if (data.result !== 'success') throw new Error('API result not success');

    return {
      EUR: data.rates['EUR'],
      USD: data.rates['USD'],
      CAD: data.rates['CAD'],
    };
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Calcule le résultat d'une conversion.
 * Toutes les devises sont routées via XOF (base commune).
 */
export function convert(
  amount: number,
  from: string,
  to: string,
  rates: ExchangeRates,
): number | null {
  if (isNaN(amount) || amount < 0) return null;
  if (from === to) return amount;

  if (from === 'XOF') return amount * rates[to as keyof ExchangeRates];
  if (to === 'XOF')   return amount / rates[from as keyof ExchangeRates];

  // Taux croisé via XOF
  return amount * (rates[to as keyof ExchangeRates] / rates[from as keyof ExchangeRates]);
}

/** Formate un montant selon la devise (localisation fr-FR) */
export function formatAmount(value: number, currency: string): string {
  if (currency === 'XOF') {
    return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(Math.round(value));
  }
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(value);
}
