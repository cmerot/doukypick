# Doukypick.fr - Site officiel de Marion "Doukypick"

## 🛠 Technologies utilisées

### Frontend

- **SvelteKit 2** - Framework web moderne
- **Svelte 5** - Composants réactifs
- **TypeScript** - Typage statique
- **Tailwind CSS 4** - Framework CSS utilitaire
- **Vite** - Build tool et dev server

### CMS & Contenu

- **TinaCMS** - Headless CMS pour la gestion de contenu
- **MDSvex** - Support Markdown avec composants Svelte

### UI/UX

- **bits-ui** - Composants accessibles
- **Lucide Svelte** - Icônes
- **Embla Carousel** - Carrousels fluides

### Qualité & Tests

- **ESLint** - Linting
- **Prettier** - Formatage de code
- **Vitest** - Framework de tests
- **Playwright** - Tests navigateur

## 🚀 Installation

### Prérequis

- Node.js 18+
- pnpm (recommandé)

### Installation des dépendances

```bash
pnpm install
```

## 💻 Développement

### Démarrage du serveur de développement

```bash
# Mode développement standard
pnpm dev

# Mode développement avec TinaCMS
pnpm dev:tina
```

Le site sera accessible sur `http://localhost:5173`

### Scripts disponibles

```bash
# Développement
pnpm dev              # Serveur de développement
pnpm dev:tina         # Dev avec interface TinaCMS

# Build & déploiement
pnpm build            # Build de production
pnpm preview          # Prévisualisation du build

# Qualité de code
pnpm check            # Vérification TypeScript
pnpm check:watch      # Vérification en mode watch
pnpm lint             # Linting ESLint + Prettier
pnpm format           # Formatage automatique

# Tests
pnpm test             # Tests unitaires
pnpm test:unit        # Tests unitaires en mode watch
```

## 📁 Structure du projet

```
src/
├── lib/
│   ├── components/           # Composants réutilisables
│   │   ├── ui/              # Composants UI de base
│   │   ├── gallery/         # Composants galerie
│   │   ├── contact-form/    # Formulaire de contact
│   │   └── header/          # Navigation
│   ├── services/            # Services (API Google Places)
│   └── utils.ts             # Utilitaires
├── routes/
│   ├── (app)/              # Routes publiques
│   │   ├── +page.svelte    # Page d'accueil (portfolio tatouages)
│   │   ├── a-propos/       # Page à propos
│   │   ├── salon-le-ptit-cap/ # Présentation du salon
│   │   ├── soins/          # Page soins
│   │   ├── contact/        # Formulaire de contact
│   │   └── images/         # Visualisation galeries
│   ├── admin/              # Interface d'administration
│   └── api/                # API endpoints
├── content/
│   └── galleries/          # Données des galeries
└── static/                 # Assets statiques
```

## 🎨 Fonctionnalités

### Gestion de contenu

- **TinaCMS** pour l'édition de contenu
- Pages en Markdown avec composants Svelte (MDSvex)
- Administration sécurisée avec authentification

## 🌐 Hébergement & Déploiement

- **Vercel** - Hébergement et déploiement automatique
- **Supabase** - Backend pour les fonctionnalités contact
- **Vercel Blob** - Stockage d'assets

## 🔧 Configuration

### Variables d'environnement

```bash
# TinaCMS
TINA_CLIENT_ID=
TINA_TOKEN=

# Supabase
PUBLIC_SUPABASE_URL=
PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Google Places API
VITE_GOOGLE_PLACES_API_KEY=

# Admin
ADMIN_PASSWORD=
```

## 📱 Responsive Design

Le site est entièrement responsive avec des breakpoints optimisés :

- Mobile : < 640px
- Tablet : 640px - 1024px
- Desktop : > 1024px

## 📄 Licence

Projet privé - Tous droits réservés à Marion "Doukypick"

---

**Contact tatouage** : [doukypick.fr/contact](https://doukypick.fr/contact)
**Salon** : Le P'tit Cap', Bègles (33)
