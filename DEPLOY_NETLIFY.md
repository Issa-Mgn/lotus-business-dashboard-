# 🚀 Guide de Déploiement sur Netlify

## 📋 Résumé

Ce guide explique comment déployer le dashboard Lotus Business sur Netlify et corriger l'erreur 404 lors du rafraîchissement des pages.

---

## 🔧 Fichiers de configuration

### 1. `public/_redirects`

Ce fichier indique à Netlify de rediriger toutes les routes vers `index.html` (pour React Router) :

```
/*    /index.html   200
```

✅ **Déjà créé** dans `public/_redirects`

### 2. `netlify.toml`

Configuration Netlify avec :
- Commande de build
- Dossier de publication
- Redirections SPA
- Headers de sécurité

✅ **Déjà créé** à la racine du projet

---

## 🚀 Étapes de déploiement

### Méthode 1 : Déploiement via Git (Recommandé)

#### 1. Connecter le repo à Netlify

1. Va sur https://app.netlify.com/
2. Clique sur **"Add new site"** → **"Import an existing project"**
3. Choisis **GitHub** (ou GitLab/Bitbucket)
4. Sélectionne le repo `lotus-business`
5. Configure les paramètres :

**Build settings** :
```
Base directory: dashboard/dashboard
Build command: npm run build
Publish directory: dashboard/dashboard/dist
```

#### 2. Variables d'environnement

Dans Netlify Dashboard → **Site settings** → **Environment variables**, ajoute :

```
VITE_API_URL=https://ton-backend.onrender.com/api
```

⚠️ Remplace par l'URL de ton backend déployé sur Render.

#### 3. Déployer

Clique sur **"Deploy site"**. Netlify va :
1. Cloner le repo
2. Installer les dépendances (`npm install`)
3. Builder l'app (`npm run build`)
4. Publier le dossier `dist`

#### 4. Vérifier

Une fois déployé, teste :
- ✅ Page d'accueil : `https://ton-site.netlify.app`
- ✅ Page utilisateurs : `https://ton-site.netlify.app/users`
- ✅ Rafraîchir la page → **Pas de 404** ✨

---

### Méthode 2 : Déploiement manuel (CLI)

#### 1. Installer Netlify CLI

```bash
npm install -g netlify-cli
```

#### 2. Se connecter

```bash
netlify login
```

#### 3. Builder l'app

```bash
cd dashboard/dashboard
npm run build
```

#### 4. Déployer

```bash
netlify deploy --prod --dir=dist
```

---

## 🐛 Résolution de l'erreur 404

### Problème

Sur Netlify, quand tu rafraîchis une page comme `/users`, tu obtiens une **404** au lieu de voir la page.

### Pourquoi ?

Netlify cherche un fichier `/users/index.html` qui n'existe pas. Les routes React Router sont gérées côté client, pas côté serveur.

### Solution

Le fichier `_redirects` indique à Netlify de **toujours servir index.html**, peu importe l'URL demandée. React Router prend ensuite le relais côté client.

```
/*    /index.html   200
```

✅ **Déjà configuré** dans ce projet !

---

## ✅ Checklist post-déploiement

- [ ] Le dashboard est accessible via l'URL Netlify
- [ ] La connexion admin fonctionne
- [ ] Les routes `/users`, `/licenses`, etc. fonctionnent
- [ ] Rafraîchir une page ne donne **pas de 404**
- [ ] L'API backend (Render) est accessible
- [ ] Les variables d'environnement sont correctes

---

## 🔗 Domaine personnalisé (optionnel)

### Ajouter un domaine custom

1. Va dans **Site settings** → **Domain management**
2. Clique sur **"Add custom domain"**
3. Entre ton domaine : `dashboard.lotusbusiness.com`
4. Suis les instructions pour configurer les DNS

**Exemple de configuration DNS** :
```
Type: CNAME
Name: dashboard
Value: ton-site.netlify.app
```

---

## 🔐 HTTPS

Netlify active automatiquement HTTPS avec Let's Encrypt. Rien à faire ! ✅

---

## 📊 Build logs

Si le déploiement échoue, vérifie les logs :

1. Va sur Netlify Dashboard
2. Clique sur ton site
3. Va dans **"Deploys"**
4. Clique sur le dernier déploiement
5. Lis les logs d'erreur

**Erreurs courantes** :

| Erreur | Solution |
|--------|----------|
| `Command failed: npm run build` | Vérifie que `vite.config.js` est correct |
| `VITE_API_URL is not defined` | Ajoute la variable dans Netlify |
| `Module not found` | Lance `npm install` puis redéploie |

---

## 🎯 Résumé des fichiers créés

```
dashboard/dashboard/
├── public/
│   └── _redirects          ✅ Redirections SPA
├── netlify.toml            ✅ Config Netlify
└── DEPLOY_NETLIFY.md       ✅ Ce guide
```

---

## 🚀 Commandes rapides

```bash
# Builder localement
npm run build

# Tester le build localement
npm run preview

# Déployer sur Netlify (CLI)
netlify deploy --prod --dir=dist

# Voir les logs de déploiement
netlify logs
```

---

## 📞 Support

Si le problème de 404 persiste :

1. ✅ Vérifie que `public/_redirects` existe
2. ✅ Vérifie que `netlify.toml` est à la racine
3. ✅ Redéploie sur Netlify
4. ✅ Vide le cache : **Site settings** → **Build & deploy** → **Clear cache**

---

## 🎉 Déploiement réussi !

Ton dashboard est maintenant accessible et les routes fonctionnent correctement. Plus de 404 ! ✨

**URL de production** : `https://ton-site.netlify.app`
