# Connexion Administrateur - Lotus Business Dashboard

## 🔐 Système d'authentification

Le dashboard admin utilise une **authentification email + mot de passe** (pas de clé de licence).

## 📋 Table Admin dans Supabase

```prisma
model Admin {
  id        String   @id @default(uuid())
  email     String   @unique
  phone     String   @unique
  password  String   // Hash bcrypt
  createdAt DateTime @default(now())

  @@map("admins")
}
```

## 🚀 Créer un compte administrateur

### Option 1 : Via script Node.js (Recommandé)

Dans le dossier `server/`, exécute :

```bash
node create-admin-hash.js
```

Ce script te permet de :
1. Générer un hash bcrypt pour ton mot de passe
2. Copier ce hash
3. L'insérer manuellement dans Supabase

### Option 2 : Via Supabase SQL Editor

```sql
-- Remplace les valeurs par tes informations
INSERT INTO admins (id, email, phone, password, "createdAt")
VALUES (
  gen_random_uuid(),
  'admin@lotus-business.com',
  '+221771234567',
  '$2b$10$HASH_BCRYPT_ICI', -- Hash généré avec bcrypt
  NOW()
);
```

## 🔑 Générer un hash bcrypt

### Avec Node.js :

```javascript
const bcrypt = require('bcrypt');

const password = 'ton_mot_de_passe_securise';
const hash = await bcrypt.hash(password, 10);
console.log(hash);
```

### Avec un outil en ligne (⚠️ pas recommandé pour production) :

- https://bcrypt-generator.com/
- Rounds: 10

## 📱 Connexion au Dashboard

1. Ouvre le dashboard : `http://localhost:5173`
2. Entre ton **email**
3. Entre ton **mot de passe** (pas de clé de licence !)
4. Clique sur "Se connecter"

## 🔒 Sécurité

- Les mots de passe sont **hachés avec bcrypt** (10 rounds)
- Les tokens JWT expirent après **7 jours**
- Le token est stocké dans **localStorage**
- Redirection automatique si token invalide
- Protection des routes avec middleware `isAdmin`

## 🛠️ Endpoint Backend

**POST** `/api/admin/login`

**Body:**
```json
{
  "email": "admin@lotus-business.com",
  "password": "ton_mot_de_passe"
}
```

**Réponse:**
```json
{
  "message": "Connexion admin réussie",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": "uuid",
    "email": "admin@lotus-business.com",
    "phone": "+221771234567"
  }
}
```

## 📝 Exemple de création d'admin complet

```bash
# 1. Générer le hash
cd server
node create-admin-hash.js
# Entre ton mot de passe quand demandé
# Copie le hash généré

# 2. Dans Supabase SQL Editor
INSERT INTO admins (id, email, phone, password, "createdAt")
VALUES (
  gen_random_uuid(),
  'admin@lotus-business.com',
  '+221771234567',
  'COLLE_LE_HASH_ICI',
  NOW()
);

# 3. Teste la connexion dans le dashboard
```

## ⚠️ Important

- **NE JAMAIS** stocker de mot de passe en clair
- **NE JAMAIS** commit les mots de passe dans Git
- Utilise des mots de passe forts (12+ caractères, mélange de caractères)
- Change les mots de passe par défaut immédiatement

## 🆘 Problèmes courants

### "Identifiants invalides"
- Vérifie que l'email existe dans la table `admins`
- Vérifie que le mot de passe correspond au hash
- Vérifie que le backend est bien démarré

### Token expiré
- Reconnecte-toi (le token expire après 7 jours)

### Erreur de connexion à l'API
- Vérifie que `VITE_API_URL` dans `.env` est correct
- Vérifie que le backend est accessible
- Vérifie que Render n'est pas en veille (cold start)

---

© 2026 Lotus Business
