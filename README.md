# TokoFianar — Frontend

Frontend React de la plateforme centralisée de recherche et de gestion de
location de logements à Fianarantsoa.

Il consomme directement l'API Laravel du dépôt `backend_gestion_immobilier` :
il n'y a plus de données de démonstration, chaque écran affiche ce que
renvoie le serveur.

## Stack technique

- **React 18** + **Vite**
- **React Router v6** — routage, y compris les routes protégées par rôle
- **Tailwind CSS v4** — design system via `@theme` (voir `src/index.css`)
- **Axios** — client HTTP unique avec intercepteurs (`src/lib/axios.js`)
- **lucide-react** — icônes

## Palette et identité visuelle

- **Bleu ardoise** (`brand`) : couleur de marque principale, autorité et confiance.
- **Or mat** (`gold`) : accent réservé aux éléments de valeur (CTA secondaires, mise en avant).
- **Emeraude / brique / ambre** : statuts positifs / négatifs / en attente.
- Typographies : **Sora** (titres) + **Inter** (interface).

Tous les tokens sont centralisés dans `src/index.css` (`@theme`). Les
primitives de `src/components/ui/` s'appuient exclusivement sur ces tokens :
n'y introduisez pas de composants d'une autre bibliothèque sans importer
aussi ses variables de thème, sous peine d'obtenir des classes sans effet.

## Structure du projet

```
src/
  components/
    ui/      → primitives (Button, Input, Card, Dialog, Table, Badge, Avatar…)
    layout/  → Navbar, Sidebar, DashboardLayout, PublicLayout, MobileTabBar
    shared/  → PropertyCard, StatusBadge, NotificationBell, ProtectedRoute,
               Alert, LoadingState, EmptyState
  context/
    AuthContext.jsx  → utilisateur courant, rôle, login/register/logout
  hooks/
    useApiResource.js    → chargement d'une ressource (data/loading/error/reload)
    useDebouncedValue.js → différé des champs de recherche
  services/            → un client par module de l'API (auth, property, rental,
                         contract, finance, admin, notification, reporting)
  pages/
    public/       → accueil + recherche, fiche logement (visiteur)
    auth/         → connexion, inscription
    locataire/    → tableau de bord, demandes, visites, ma location
    proprietaire/ → tableau de bord, logements, demandes reçues, visites
    admin/        → tableau de bord, modération, comptes, paiements, statistiques
  lib/
    axios.js  → instance Axios, jeton Sanctum, normalisation des réponses/erreurs
    enums.js  → traduction des énumérations backend <-> vocabulaire du frontend
    utils.js  → cn(), formatMoney(), formatDate()…
```

## Démarrage

```bash
npm install
cp .env.example .env   # renseigner VITE_API_BASE_URL
npm run dev
```

L'application démarre sur `http://localhost:5173`. Le backend doit tourner
en parallèle :

```bash
cd ../backend_gestion_immobilier
php artisan serve        # http://localhost:8000
```

`VITE_API_BASE_URL` doit inclure le préfixe `/api`
(par défaut `http://localhost:8000/api`). L'origine du frontend doit figurer
dans `CORS_ALLOWED_ORIGINS` côté backend.

Aucun compte n'est créé automatiquement : inscrivez-vous depuis
`/inscription` (locataire ou propriétaire). Un compte administrateur se crée
en base, l'inscription publique ne le permet pas.

## Conventions de la couche `services`

L'intercepteur de `src/lib/axios.js` normalise les trois formes de réponse de
l'API (enveloppe `ApiResponseTrait`, paginateur brut, collection de
ressources) : les services reçoivent toujours

- `response.data` — la donnée utile, un tableau pour les listes ;
- `response.meta` — la pagination quand elle existe ;
- `response.extra` — les champs annexes (`unread_count`…).

Les erreurs sont normalisées en `{ status, message, errors }`, `errors`
reprenant les erreurs de validation Laravel champ par champ — les formulaires
les affichent sous le champ concerné.

Chaque service traduit les champs de l'API vers le vocabulaire du frontend
(`name` → `nom`, `loyer` → `prix`, statuts en majuscules). Les pages ne
manipulent jamais la forme brute de l'API.

## Rôles et routes protégées

`src/context/AuthContext.jsx` revalide le jeton auprès de `/auth/me` au
démarrage : un compte désactivé ou un jeton révoqué vide la session.
`src/components/shared/ProtectedRoute.jsx` restreint `/locataire`,
`/proprietaire` et `/admin` selon le rôle.

Les actions proposées par l'interface suivent les autorisations du serveur.
Pour les visites, par exemple, le propriétaire propose un créneau
(`demandee → proposee`) et le locataire le confirme (`proposee → confirmee`) :
chaque écran n'affiche que les transitions que son rôle peut réellement
effectuer.

## Qualité

```bash
npm run lint    # ESLint 9 (config plate dans eslint.config.js)
npm run build   # build de production
```

## Prochaines étapes suggérées

- Tests (Vitest + React Testing Library).
- Pagination sur l'historique des paiements et la liste des comptes
  (l'API renvoie déjà `meta`, seules les commandes d'interface manquent).
- Téléversement de l'avatar (l'API n'accepte aujourd'hui qu'une URL).
