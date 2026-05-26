import { useState } from 'react';
import type { CurrencyCode, CurrencyMeta, ExchangeRates } from '../types';
import { convert, formatAmount } from '../services/exchangeService';

export const CURRENCY_META: Record<CurrencyCode, CurrencyMeta> = {
  XOF: { name: 'Franc CFA', zone: 'BCEAO · XOF',    symbol: 'F',   flag: '🌍' },
  EUR: { name: 'Euro',      zone: 'Zone Euro · EUR',  symbol: '€',   flag: '🇪🇺' },
  USD: { name: 'Dollar US', zone: 'États-Unis · USD', symbol: '$',   flag: '🇺🇸' },
  CAD: { name: 'Dollar CA', zone: 'Canada · CAD',     symbol: 'CA$', flag: '🇨🇦' },
};

const CURRENCIES: CurrencyCode[] = ['XOF', 'EUR', 'USD', 'CAD'];

interface Props {
  rates:   ExchangeRates | null;
  loading: boolean;
}

export function CurrencyConverter({ rates, loading }: Props) {
  const [amount,   setAmount]   = useState<string>('100000');
  const [from,     setFrom]     = useState<CurrencyCode>('XOF');
  const [to,       setTo]       = useState<CurrencyCode>('EUR');
  const [swapSpin, setSwapSpin] = useState<boolean>(false);

  const doSwap = () => {
    setSwapSpin(true);
    setTimeout(() => {
      setFrom(to);
      setTo(from);
      setSwapSpin(false);
    }, 240);
  };

  const pickFrom = (cur: CurrencyCode) => cur === to  ? doSwap() : setFrom(cur);
  const pickTo   = (cur: CurrencyCode) => cur === from ? doSwap() : setTo(cur);

  const parsed = parseFloat(amount.replace(/\s/g, '').replace(',', '.'));
  const result = rates ? convert(parsed, from, to, rates) : null;

  const rateStr = rates
    ? from === 'XOF'
      ? `1 F CFA = ${CURRENCY_META[to].symbol} ${rates[to as keyof ExchangeRates]?.toFixed(6)}`
      : `1 ${from} = ${formatAmount(1 / rates[from as keyof ExchangeRates], 'XOF')} F CFA`
    : null;

  return (
    <>
      {/* ─── Carte principale ─────────────────────────────────────── */}
      <div className="card">
        {/* FROM */}
        <div className="blk">
          <div className="blk-lbl">Vous convertissez</div>
          <div className="pills">
            {CURRENCIES.map(c => (
              <button
                key={c}
                className={`pill${from === c ? ' on' : ''}`}
                onClick={() => pickFrom(c)}
              >
                {CURRENCY_META[c].flag} {c}
              </button>
            ))}
          </div>
          <input
            className="inp"
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="0"
          />
          <div className="cur-sub">
            <span className="cur-flag">{CURRENCY_META[from].flag}</span>
            <span className="cur-sub-txt">
              {CURRENCY_META[from].name} · {CURRENCY_META[from].zone}
            </span>
          </div>
        </div>

        <div className="divline" />

        {/* Bouton swap */}
        <div className="swap-row">
          <button
            className={`swap-btn${swapSpin ? ' spin' : ''}`}
            onClick={doSwap}
            aria-label="Inverser la conversion"
          >
            ⇅
          </button>
        </div>

        <div className="divline" />

        {/* TO */}
        <div className="blk">
          <div className="blk-lbl">Vous obtenez</div>
          <div className="pills">
            {CURRENCIES.map(c => (
              <button
                key={c}
                className={`pill${to === c ? ' on' : ''}`}
                onClick={() => pickTo(c)}
              >
                {CURRENCY_META[c].flag} {c}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="res-loading">
              <div className="skel" style={{ width: 130 }} />
            </div>
          ) : (
            <div className="res">
              {result !== null
                ? `${CURRENCY_META[to].symbol} ${formatAmount(result, to)}`
                : '—'}
            </div>
          )}

          <div className="cur-sub">
            <span className="cur-flag">{CURRENCY_META[to].flag}</span>
            <span className="cur-sub-txt">
              {CURRENCY_META[to].name} · {CURRENCY_META[to].zone}
            </span>
          </div>
        </div>
      </div>

      {/* ─── Taux indicatif ───────────────────────────────────────── */}
      {rateStr && !loading && (
        <div className="ratebar">
          <span>Taux indicatif</span>
          <span className="ratev">{rateStr}</span>
        </div>
      )}

      {/* ─── Raccourcis devises ───────────────────────────────────── */}
      {rates && (
        <div className="quick">
          {(['EUR', 'USD', 'CAD'] as CurrencyCode[]).map(c => (
            <div
              key={c}
              className="qcard"
              onClick={() => { setFrom('XOF'); setTo(c); }}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && (setFrom('XOF'), setTo(c))}
            >
              <div className="qflag">{CURRENCY_META[c].flag}</div>
              <div className="qcode">{c}</div>
              <div className="qval">
                {formatAmount(1 / rates[c as keyof ExchangeRates], 'XOF')}
              </div>
              <div className="qsub">F CFA</div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
