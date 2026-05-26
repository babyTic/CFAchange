export type CurrencyCode = 'XOF' | 'EUR' | 'USD' | 'CAD';

export interface CurrencyMeta {
  name: string;
  zone: string;
  symbol: string;
  flag: string;
}

export interface ExchangeRates {
  EUR: number;
  USD: number;
  CAD: number;
}

export interface RateSnapshot {
  date: string;
  EUR: number;
  USD: number;
  CAD: number;
}

// ← Cette ligne manquait dans ton fichier
export type ChartCurrency = keyof Omit<RateSnapshot, 'date'>;

export type AppStatus = 'loading' | 'live' | 'cached' | 'offline';

export interface RatesCache {
  timestamp: number;
  rates: ExchangeRates;
}