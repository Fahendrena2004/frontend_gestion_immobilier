# TokoFianar — Frontend

Frontend React de la plateforme centralisée de recherche et de gestion de
location de logements à Fianarantsoa (projet de binôme — voir le document
de conception MERISE et le document d'architecture microservices
Laravel / React pour le contexte complet).

## Stack technique

- **React 18** + **Vite**
- **React Router v6** — routage, y compris les routes protégées par rôle
- **Tailwind CSS v4** — design system via `@theme` (voir `src/index.css`)
- **Axios** — client HTTP unique, configuré pour l'API Gateway (`src/lib/axios.js`)
- **lucide-react** — icônes

## Palette et identité visuelle

- **Bleu ardoise** (`brand`) : couleur de marque principale, autorité et confiance.
- **Or mat** (`gold`) : accent réservé aux éléments de valeur (CTA secondaires, mise en avant).
- **Emeraude / brique / ambre** : statuts positifs / négatifs / en attente, cohérents avec
  l'annexe « Statuts du système » du document de conception (`DISPONIBLE`, `EN_ATTENTE`, etc.).
- Typographies : **Sora** (titres) + **Inter** (interface), chargées depuis Google Fonts.

Tous les tokens sont centralisés dans `src/index.css` (`@theme`) — à ajuster
en un seul endroit si la charte évolue.

## Structure du projet

```
src/
  components/
    ui/        → primitives (Button, Input, Card, Dialog, Table, …)
    layout/     → Navbar, Sidebar, DashboardLayout, PublicLayout
    shared/     → PropertyCard, StatusBadge, NotificationBell, ProtectedRoute…
  context/
    AuthContext.jsx   → utilisateur courant, rôle, login/logout
  services/           → un client par micro-service (Auth, Property, Rental,
                         Contract, Finance, Notification, Admin, Reporting)
  pages/
    public/    → accueil + recherche, fiche logement (visiteur)
    auth/      → connexion, inscription
    locataire/ → tableau de bord, demandes, visites, ma location
    proprietaire/ → tableau de bord, logements, demandes reçues, visites
    admin/     → tableau de bord, modération, comptes, paiements, statistiques
  data/
    mockData.js → données de démonstration (voir plus bas)
  lib/
    axios.js   → instance Axios + intercepteurs JWT
    mock.js    → active/désactive les données de démonstration
    utils.js   → cn(), formatMoney(), formatDate()…
```

Chaque page correspond directement à une ou plusieurs *user stories* du
document de conception (les identifiants US-V-xx, US-L-xx, US-P-xx, US-A-xx
sont référencés en commentaire en tête de chaque fichier de page).

## Démarrage

```bash
npm install
cp .env.example .env
npm run dev
```

L'application démarre par défaut sur `http://localhost:5173`.

### Mode démonstration (sans backend)

Par défaut, `VITE_USE_MOCK_DATA=true` : tous les services (`src/services/*.js`)
retournent des données de démonstration réalistes (`src/data/mockData.js`)
au lieu d'appeler l'API. Cela permet de développer et présenter le frontend
indépendamment de l'avancement du backend Laravel.

Pour se connecter en mode démo, utilisez n'importe quel e-mail :
- contenant `admin` → connecté en tant qu'**administrateur**
- contenant `proprio` → connecté en tant que **propriétaire**
- tout autre e-mail → connecté en tant que **locataire**

### Brancher le vrai backend

1. Dans `.env`, passez `VITE_USE_MOCK_DATA=false`.
2. Renseignez `VITE_API_BASE_URL` avec l'URL de l'API Gateway Laravel
   (ex : `http://localhost:8000/api`).
3. Chaque fonction de `src/services/*.js` bascule automatiquement vers un
   vrai appel Axios — les routes attendues (`/auth/login`, `/properties`,
   `/demandes`, `/visites`, `/locations/:id/contrat`, `/paiements`,
   `/notifications`, `/admin/...`, `/reporting/dashboard`, …) sont
   documentées en commentaire dans chaque fichier de service et doivent
   être alignées avec le binôme backend.

## Rôles et routes protégées

`src/context/AuthContext.jsx` expose l'utilisateur courant et son rôle.
`src/components/shared/ProtectedRoute.jsx` restreint l'accès aux espaces
`/locataire`, `/proprietaire` et `/admin` selon le rôle, et redirige vers
`/connexion` si l'utilisateur n'est pas authentifié.

## Prochaines étapes suggérées

- Brancher les appels réels une fois les endpoints du backend disponibles.
- Ajouter la pagination sur les listes longues (recherche de logements,
  historique des paiements) — prévu dans les exigences non fonctionnelles
  du document de conception (§9.2 Performance).
- Ajouter les tests (Vitest + React Testing Library).
- Générer les composants shadcn/ui officiels via leur CLI si vous préférez
  remplacer les primitives internes de `src/components/ui/` par la
  bibliothèque complète (structure déjà compatible).
