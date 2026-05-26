# CFAChange — Convertisseur Franc CFA

Convertisseur de devises temps réel : **XOF ↔ EUR, USD, CAD**.  
PWA installable sur mobile, fonctionnel hors ligne.

## Stack

- **React 18** + **TypeScript** + **Vite**
- **Recharts** — courbe historique des taux
- **vite-plugin-pwa** — Service Worker + manifest PWA
- **open.er-api.com** — API de taux, gratuite, sans clé

## Installation

```bash
git clone https://github.com/vous/cfachange.git
cd cfachange
npm install
cp .env.example .env
npm run dev
```

L'app tourne sur `http://localhost:5173`.

## Build production

```bash
npm run build
npm run preview   # vérification locale du build
```

## Déploiement (Vercel — recommandé)

```bash
npx vercel --prod
```

Ou connecter le repo GitHub à Vercel : build command `npm run build`, output `dist/`.

## Architecture

```
src/
├── components/
│   ├── CurrencyConverter.tsx   # Convertisseur + raccourcis devises
│   ├── RateChart.tsx           # Graphique historique (Recharts)
│   └── OfflineBanner.tsx       # Bandeau mode hors ligne / cache
├── hooks/
│   ├── useExchangeRate.ts      # Fetch API + fallback localStorage + offline
│   └── useOfflineStatus.ts     # Détection online/offline
├── services/
│   └── exchangeService.ts      # Appels API + logique de conversion + formatage
├── utils/
│   └── storage.ts              # localStorage : cache taux + historique journalier
├── types/
│   └── index.ts                # Types TypeScript partagés
├── App.tsx
├── main.tsx
└── index.css                   # Design system complet (variables CSS)
```

## Stratégie offline (Service Worker)

| Source | Stratégie | TTL |
|--------|-----------|-----|
| Assets statiques (JS, CSS, HTML) | Cache-first | Build hash |
| Taux de change (API) | Network-first → cache | 1h |
| Google Fonts | Cache-first | 1 an |

Si l'API est injoignable :
1. **Cache mémoire** (session active)
2. **localStorage** (sessions précédentes)
3. **Taux BCEAO statiques** (EUR fixe à 655,957 · USD/CAD indicatifs)

## Notes

- Le XOF est **lié à l'EUR par traité** à 655,957 (parité fixe BCEAO). La variation EUR sur le graphique est quasi nulle — c'est normal.
- L'historique se construit jour par jour via `localStorage`. Les 14 premiers jours sont simulés à partir du taux réel récupéré.
- La clé API n'est pas requise (open.er-api.com). Pour un usage intensif, `VITE_EXCHANGE_API_KEY` dans `.env`.
