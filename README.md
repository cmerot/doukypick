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

- **shadcn-svelte** - Composant accessibles (components/ui)
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
pnpm build:tina       # Build de production avec interface TinaCMS
pnpm preview          # Prévisualisation du build

# Qualité de code
pnpm check            # Vérification TypeScript
pnpm check:watch      # Vérification en mode watch
pnpm lint             # Linting ESLint + Prettier
pnpm format           # Formatage automatique

# Tests
pnpm test             # Tests unitaires
pnpm test:unit        # Tests unitaires en mode watch
pnpm test:e2e         # Tests navigateur
pnpm storybook        # Serveur Storybook
pnpm build-storybook  # Build de Storybook
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

Créer un fichier `.env` à la racine du projet (voir `.env.example` pour référence) :

```bash
# Google Places API
GOOGLE_PLACES_API_KEY=
GOOGLE_PLACE_ID=

# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN=

# Supabase
SUPABASE_URL=
SUPABASE_ANON_KEY=

# Telegram Notifications
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=

# Admin
ADMIN_SECRET=

# Session secret for signing auth tokens (generate with: openssl rand -base64 32)
SESSION_SECRET=

# TinaCMS
NEXT_PUBLIC_TINA_CLIENT_ID=
TINA_TOKEN=

# Public Environment Variables

# Vercel image optimiser (_vercel/image?path=)
PUBLIC_USE_VERCEL_IMAGE_OPTIMIZATION=

# Plausible analytics (set to "true" to enable)
PUBLIC_ENABLE_PLAUSIBLE=
```

## 📱 Responsive Design

Le site est entièrement responsive avec des breakpoints Tailwind CSS :

- **default** (xxs) : < 384px
- **xs** : ≥ 384px (24rem)
- **sm** : ≥ 640px
- **md** : ≥ 768px

Les autres breakpoints ne sont pas utilisés :

- **lg** : ≥ 1024px
- **xl** : ≥ 1280px
- **2xl** : ≥ 1536px

## 📄 Licence

Projet privé - Tous droits réservés à Marion "Doukypick"

---

**Contact tatouage** : [doukypick.fr/contact](https://doukypick.fr/contact)
**Salon** : Le P'tit Cap', Bègles (33)
