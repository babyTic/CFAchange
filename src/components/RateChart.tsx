import { useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import type { RateSnapshot, ChartCurrency } from '../types';
import { CURRENCY_META } from './CurrencyConverter';

interface Props {
  history: RateSnapshot[];
}

interface TooltipProps {
  active?:  boolean;
  payload?: { value: number }[];
  label?:   string;
  cur:      ChartCurrency;
}

function ChartTooltip({ active, payload, label, cur }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const v = payload[0]?.value;
  return (
    <div className="chart-tooltip">
      <div className="ct-label">{label}</div>
      <div className="ct-value">
        1 {CURRENCY_META[cur].flag} {cur} = {v ? Math.round(v).toLocaleString('fr-FR') : '—'} F
      </div>
    </div>
  );
}

export function RateChart({ history }: Props) {
  const [cur, setCur] = useState<ChartCurrency>('EUR');

  const chartData = history
    .map(h => ({
      date:  h.date,
      value: h[cur] ? 1 / h[cur] : null,
    }))
    .filter(d => d.value !== null);

  return (
    <div className="chart-card">
      <div className="chart-hdr">
        <div>
          <div className="chart-ttl">Historique — 14 derniers jours</div>
          <div className="chart-sub">
            1 {CURRENCY_META[cur].flag} {cur} en F CFA
          </div>
        </div>
        <div className="ctabs">
          {(['EUR', 'USD', 'CAD'] as ChartCurrency[]).map(c => (
            <button
              key={c}
              className={`ctab${cur === c ? ' on' : ''}`}
              onClick={() => setCur(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={155}>
          <AreaChart data={chartData} margin={{ top: 5, right: 4, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#F0A500" stopOpacity={0.22} />
                <stop offset="95%" stopColor="#F0A500" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,.04)" strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fill: '#254035', fontSize: 10, fontFamily: 'Outfit' }}
              axisLine={false} tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: '#254035', fontSize: 10 }}
              axisLine={false} tickLine={false} width={52}
              tickFormatter={v => Math.round(v).toLocaleString('fr-FR')}
              domain={['auto', 'auto']}
            />
            <Tooltip content={<ChartTooltip cur={cur} />} />
            <Area
              type="monotone" dataKey="value"
              stroke="#F0A500" strokeWidth={2.5} fill="url(#gold)"
              dot={false} activeDot={{ r: 5, fill: '#F0A500', strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div className="chart-empty">
          <div className="skel" style={{ width: 200 }} />
        </div>
      )}
    </div>
  );
}