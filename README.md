# 🎨 Lotus Business - Dashboard Admin

Dashboard web React pour l'administration de la plateforme Lotus Business.

---

## 📋 Table des matières

- [À propos](#à-propos)
- [Stack Technique](#stack-technique)
- [Installation](#installation)
- [Configuration](#configuration)
- [Structure](#structure)
- [Fonctionnalités](#fonctionnalités)
- [Design System](#design-system)
- [Tests Mobile](#tests-mobile)
- [Déploiement](#déploiement)

---

## 📖 À propos

Dashboard d'administration pour Lotus Business permettant de :
- 📊 Visualiser les statistiques et revenus
- 👥 Gérer les utilisateurs et leurs licences
- 🎫 Consulter et gérer les licences
- 👨‍💼 Administrer les comptes admins
- 📢 Publier des annonces avec images
- 📧 Envoyer des emails de licence
- 🔍 Rechercher, filtrer et exporter les données

---

## 🛠️ Stack Technique

- **React 19** - Bibliothèque UI
- **Vite** - Build tool et dev server
- **React Router v6** - Routing
- **Axios** - Client HTTP
- **Recharts** - Graphiques
- **Lucide React** - Icônes
- **CSS Variables** - Design system
- **Context API** - Gestion d'état

---

## 📦 Installation

### 1. Cloner et installer

```bash
cd dashboard/dashboard
npm install
```

### 2. Configurer les variables d'environnement

Créer un fichier `.env` :

```env
# URL de l'API backend
VITE_API_URL=https://lotus-business-server.onrender.com/api

# Prix des licences (FCFA)
VITE_MONTHLY_PRICE_FCFA=5000
VITE_ANNUAL_PRICE_FCFA=50000
```

**En local :**
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Démarrer le serveur de développement

```bash
npm run dev
```

Dashboard sur : `http://localhost:5173`

---

## ⚙️ Configuration

### Variables d'environnement

| Variable | Description | Exemple |
|----------|-------------|---------|
| `VITE_API_URL` | URL de l'API backend | `https://api.example.com/api` |
| `VITE_MONTHLY_PRICE_FCFA` | Prix licence mensuelle | `5000` |
| `VITE_ANNUAL_PRICE_FCFA` | Prix licence annuelle | `50000` |

⚠️ **Important :** Les variables `VITE_*` sont publiques et exposées dans le build. Ne jamais y mettre de secrets !

---

## 🏗️ Structure

```
dashboard/dashboard/
├── src/
│   ├── components/          # Composants réutilisables
│   │   ├── Layout.jsx       # Layout principal avec sidebar
│   │   ├── Sidebar.jsx      # Navigation latérale
│   │   ├── Badge.jsx        # Badge de statut
│   │   ├── StatCard.jsx     # Carte de statistique
│   │   └── PrivateRoute.jsx # Route protégée
│   │
│   ├── context/             # Contextes React
│   │   ├── AuthContext.jsx  # Authentification admin
│   │   └── ThemeContext.jsx # Thème clair/sombre
│   │
│   ├── pages/               # Pages de l'application
│   │   ├── Login.jsx        # Page de connexion
│   │   ├── Dashboard.jsx    # Page d'accueil (stats)
│   │   ├── Users.jsx        # Gestion utilisateurs
│   │   ├── Licenses.jsx     # Gestion licences
│   │   ├── Admins.jsx       # Gestion admins
│   │   ├── Infos.jsx        # Publication d'annonces
│   │   ├── Profile.jsx      # Profil admin
│   │   └── NotFound.jsx     # Page 404
│   │
│   ├── services/
│   │   └── api.js           # Client API Axios
│   │
│   ├── App.jsx              # Composant racine
│   ├── main.jsx             # Point d'entrée
│   └── index.css            # Styles globaux + design system
│
├── public/                  # Assets statiques
├── .env                     # Variables d'environnement
├── vite.config.js          # Configuration Vite
└── package.json            # Dépendances
```

---

## ✨ Fonctionnalités

### 🔐 Authentification

- Connexion admin avec email/password
- Token JWT stocké dans localStorage
- Déconnexion automatique si token invalide
- Routes protégées avec redirection

### 📊 Dashboard

- **Statistiques** : Utilisateurs totaux, actifs, revenus
- **Graphiques** : Évolution des inscriptions
- **Revenus** : Calcul automatique basé sur les licences
- **Période** : 7 jours / 30 jours

### 👥 Gestion Utilisateurs

- **Liste complète** avec pagination
- **Filtres** : Type de licence, statut, recherche
- **Actions** :
  - Suspendre/Réactiver
  - Déconnecter (force logout)
  - Upgrade vers PREMIUM
  - Renvoyer email de licence
- **Export CSV** de la liste filtrée

### 🎫 Gestion Licences

- **Vue dédiée** aux licences
- **Recherche** : Par clé, email, nom
- **Copie rapide** de la clé de licence
- **Filtres** : Type, statut
- **Export CSV**

### 👨‍💼 Gestion Admins

- **Liste** des administrateurs
- **Création** de nouveaux admins
- **Ajout utilisateur** (inscription)
- **Renvoi email** de licence

### 📢 Publication d'Annonces (Infos)

- **Upload d'images** (max 5MB)
- **Aperçu** avant publication
- **ImageKit** pour le stockage
- **Publication** immédiate ou brouillon
- **Modification** et suppression

### 🎨 Personnalisation

- **Thème clair/sombre** avec switch
- **Préférences sauvegardées** dans localStorage
- **Responsive** : Desktop, tablette, mobile

---

## 🎨 Design System

### Variables CSS

```css
/* Couleurs */
--color-bg: #0a0a0a;
--color-surface: #111111;
--color-border: #2a2a2a;
--color-text: #e5e5e5;
--color-accent: #4F46E5;

/* Espacements */
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
--spacing-xl: 32px;

/* Typography */
--text-xs: 12px;
--text-sm: 14px;
--text-base: 16px;
--text-lg: 18px;
--text-xl: 20px;

/* Radius */
--radius-sm: 6px;
--radius-md: 8px;
--radius-lg: 12px;
```

### Thèmes

Le dashboard supporte deux thèmes :

**Thème Sombre (par défaut)**
- Fond : `#0a0a0a`
- Surface : `#111111`
- Texte : `#e5e5e5`

**Thème Clair**
- Fond : `#ffffff`
- Surface : `#f9fafb`
- Texte : `#1a1a1a`

### Responsive

- **Desktop** : Sidebar complète
- **Tablette** : Sidebar compacte (icônes)
- **Mobile** : Drawer avec hamburger menu
- **Tableaux** : Transformés en cartes sur mobile

---

## 📱 Tests Mobile

### Sur appareil réel

Pour tester sur un téléphone/tablette du même réseau :

#### 1. Démarrer le serveur avec --host

```bash
npm run dev -- --host
```

#### 2. Obtenir l'IP locale

Windows :
```bash
ipconfig
```

Mac/Linux :
```bash
ifconfig
```

Exemple : `192.168.1.42`

#### 3. Ouvrir sur le mobile

```
http://192.168.1.42:5173
```

### Configuration backend pour mobile

Modifier `.env` pour pointer vers l'IP locale du backend :

```env
VITE_API_URL=http://192.168.1.42:5000/api
```

### Contournement page 404

Si la page 404 ne s'affiche pas (redirection vers login) :

Ouvrir la console du navigateur mobile et exécuter :

```javascript
localStorage.setItem('adminToken', 'devtoken');
localStorage.setItem('adminData', JSON.stringify({ email: 'dev@local' }));
location.reload();
```

---

## 🚀 Déploiement

### Build de production

```bash
npm run build
```

Génère le dossier `dist/` prêt pour le déploiement.

### Preview du build

```bash
npm run preview
```

Lance un serveur pour prévisualiser le build de production.

### Déploiement Vercel

#### Via CLI

```bash
npm install -g vercel
vercel
```

#### Via Dashboard

1. Importer le repo GitHub
2. Framework Preset : **Vite**
3. Root Directory : `dashboard/dashboard`
4. Build Command : `npm run build`
5. Output Directory : `dist`
6. Variables d'environnement :
   - `VITE_API_URL=https://votre-api.onrender.com/api`
   - `VITE_MONTHLY_PRICE_FCFA=5000`
   - `VITE_ANNUAL_PRICE_FCFA=50000`

### Déploiement Netlify

#### Via CLI

```bash
npm install -g netlify-cli
netlify deploy --prod
```

#### Via Dashboard

1. Importer le repo GitHub
2. Base Directory : `dashboard/dashboard`
3. Build Command : `npm run build`
4. Publish Directory : `dist`
5. Variables d'environnement (même que Vercel)

### ⚠️ Après déploiement

1. ✅ Vérifier que `VITE_API_URL` pointe vers la bonne API
2. ✅ Tester la connexion admin
3. ✅ Vérifier les appels API (Network tab)
4. ✅ Tester sur mobile

---

## 🔌 Intégration API

### Service API

Le fichier `src/services/api.js` configure Axios :

```javascript
const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Intercepteur pour ajouter le token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### APIs disponibles

- `authAPI` : Connexion/Déconnexion
- `usersAPI` : Gestion utilisateurs
- `licensesAPI` : Gestion licences
- `adminsAPI` : Gestion admins + emails
- `infosAPI` : Gestion annonces
- `notificationsAPI` : Notifications
- `activityAPI` : Activités
- `profileAPI` : Profil admin

---

## 🐛 Dépannage

### Erreur : "Network Error"

**Cause :** Backend inaccessible

**Solutions :**
1. Vérifier que le backend est démarré
2. Vérifier `VITE_API_URL` dans `.env`
3. Vérifier CORS sur le backend

### Erreur : 401 Unauthorized

**Cause :** Token invalide ou expiré

**Solution :** Se déconnecter et se reconnecter

### Les images ne s'affichent pas

**Cause :** ImageKit mal configuré sur le backend

**Solution :** Vérifier les variables ImageKit côté serveur

### Le thème ne se sauvegarde pas

**Cause :** localStorage désactivé

**Solution :** Vérifier les paramètres du navigateur

---

## 📝 Scripts NPM

| Commande | Description |
|----------|-------------|
| `npm run dev` | Démarrer en dev |
| `npm run dev -- --host` | Dev avec accès réseau |
| `npm run build` | Build de production |
| `npm run preview` | Preview du build |
| `npm run lint` | Linter ESLint |

---

## 🔐 Sécurité

### Bonnes pratiques

✅ **Token JWT** stocké dans localStorage
✅ **Pas de secrets** dans les variables `VITE_*`
✅ **Validation côté backend** pour toutes les actions
✅ **Déconnexion auto** si token invalide
✅ **Routes protégées** avec `PrivateRoute`

### Ce qu'il NE FAUT PAS faire

❌ Stocker `DATABASE_URL` dans `.env`
❌ Stocker `JWT_SECRET` dans `.env`
❌ Stocker des mots de passe dans le code
❌ Appeler Supabase directement depuis le frontend

---

## 📞 Support

Pour toute question ou contribution, contacter le développeur.

**Développé avec ❤️ par L!txx pour Lotus Business**

---

## 📄 Licence

ISC
