import { useExchangeRate }    from './hooks/useExchangeRate';
import { OfflineBanner }       from './components/OfflineBanner';
import { CurrencyConverter }   from './components/CurrencyConverter';
import { RateChart }           from './components/RateChart';

export default function App() {
  const { rates, history, status, lastUpdated, refresh } = useExchangeRate();

  const loading    = status === 'loading';
  const timeStr    = lastUpdated?.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const dotClass   = status === 'live' ? 'live' : status === 'cached' ? 'cached' : 'off';
  const statusText =
    status === 'live'    ? `Taux en temps réel · ${timeStr}` :
    status === 'cached'  ? 'Taux en cache local'             :
    status === 'offline' ? 'Hors ligne — taux indicatifs'    : 'Chargement…';

  return (
    <div className="app">
      <OfflineBanner status={status} lastUpdated={lastUpdated} />

      {/* Header */}
      <div className="hdr">
        <div className="brand">
          <div className="brand-icon">₣</div>
          <div className="brand-name">
            CFA<em>Change</em>
          </div>
        </div>
        <button className="btn-r" onClick={refresh} disabled={loading}>
          <span className={`spin-icon${loading ? ' go' : ''}`}>↻</span>
          {loading ? 'Chargement…' : 'Actualiser'}
        </button>
      </div>

      {/* Convertisseur + raccourcis */}
      <CurrencyConverter rates={rates} loading={loading} />

      {/* Graphique historique */}
      <RateChart history={history} />

      {/* Barre de statut */}
      <div className="statusbar">
        <div className={`dot ${dotClass}`} />
        <span>{statusText}</span>
      </div>
    </div>
  );
}
