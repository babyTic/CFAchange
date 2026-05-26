import type { AppStatus } from '../types';

interface Props {
  status:      AppStatus;
  lastUpdated: Date | null;
}

export function OfflineBanner({ status, lastUpdated }: Props) {
  const time = lastUpdated?.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  if (status === 'offline') {
    return (
      <div className="banner ban-off">
        ⚡ Mode hors ligne — Taux indicatifs BCEAO (mise à jour à la reconnexion)
      </div>
    );
  }

  if (status === 'cached') {
    return (
      <div className="banner ban-cached">
        🕐 Taux en cache — dernière MAJ {time}
      </div>
    );
  }

  return null;
}
