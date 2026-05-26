export type CurrencyCode = 'XOF' | 'EUR' | 'USD' | 'CAD';

export interface CurrencyMeta {
  name: string;
  zone: string;
  symbol: string;
  flag: string;
}

/** Taux de change relatifs à XOF comme base (1 XOF = X devise) */
export interface ExchangeRates {
  EUR: number;
  USD: number;
  CAD: number;
}

/** Snapshot journalier pour l'historique */
export interface RateSnapshot {
  date: string; // 'dd/mm' pour affichage, 'yyyy-mm-dd' en storage
  EUR: number;
  USD: number;
  CAD: number;
}

export type AppStatus = 'loading' | 'live' | 'cached' | 'offline';

export interface RatesCache {
  timestamp: number;
  rates: ExchangeRates;
}
