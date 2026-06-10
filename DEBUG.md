# Guide de Débogage - Dashboard Lotus Business

## 🔍 Problème : "Identifiants incorrects" alors que l'admin existe

### Étapes de diagnostic :

## 1. Vérifier que le backend est accessible

Ouvre le navigateur et va sur :
```
https://lotus-business-server.onrender.com
```

Tu devrais voir :
```json
{
  "message": "Bienvenue sur l'API Lotus Business",
  "version": "1.0.0",
  "status": "running"
}
```

⚠️ **Si tu vois une erreur ou rien** : Le serveur Render est en veille (cold start). Attends 30-60 secondes et réessaye.

## 2. Tester l'endpoint de login directement

### Avec curl (Terminal) :

```bash
curl -X POST https://lotus-business-server.onrender.com/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"TON_EMAIL","password":"TON_PASSWORD"}'
```

### Avec Postman ou Thunder Client (VS Code) :

**POST** `https://lotus-business-server.onrender.com/api/admin/login`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "email": "admin@lotus-business.com",
  "password": "ton_mot_de_passe"
}
```

**Réponses possibles :**

✅ **200 OK** - Connexion réussie :
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

❌ **401 Unauthorized** - Identifiants invalides :
```json
{
  "error": "Identifiants invalides"
}
```

❌ **400 Bad Request** - Champs manquants :
```json
{
  "error": "Email et mot de passe requis"
}
```

## 3. Vérifier la console du navigateur

1. Ouvre le dashboard : `http://localhost:5173`
2. Appuie sur **F12** pour ouvrir les outils de développement
3. Va dans l'onglet **Console**
4. Essaie de te connecter
5. Regarde les logs :

Tu devrais voir :
```
🔧 API URL configurée: https://lotus-business-server.onrender.com/api
🔐 Tentative de connexion avec: {email: "...", apiUrl: "..."}
```

Si tu vois :
- ✅ `✅ Réponse login: {...}` → Connexion réussie
- ❌ `❌ Erreur login: {...}` → Regarde le détail de l'erreur

## 4. Tester la connexion API depuis la console

Dans la console du navigateur (F12), tape :
```javascript
await testApiConnection()
```

Cela va tester :
1. Si l'API root répond
2. Si l'endpoint `/admin/login` existe

## 5. Vérifier l'admin dans Supabase

Va sur Supabase → Table Editor → `admins`

Vérifie que :
- ✅ L'admin existe avec le bon email
- ✅ Le champ `password` contient un hash bcrypt (commence par `$2b$10$`)
- ✅ Le phone est unique

## 6. Tester le mot de passe localement

Dans le dossier `server/`, crée un fichier `test-password.js` :

```javascript
const bcrypt = require('bcrypt');

const password = 'ton_mot_de_passe'; // Le mot de passe que tu tapes
const hash = '$2b$10$...'; // Le hash de la BDD

bcrypt.compare(password, hash).then(result => {
  console.log('Mot de passe correct ?', result);
});
```

Lance :
```bash
node test-password.js
```

Si ça affiche `false`, le mot de passe ne correspond pas au hash !

## 7. Réinitialiser le mot de passe admin

### Générer un nouveau hash :

```bash
cd server
node create-admin-hash.js
```

Entre ton nouveau mot de passe et copie le hash généré.

### Mettre à jour dans Supabase :

SQL Editor :
```sql
UPDATE admins
SET password = 'NOUVEAU_HASH_ICI'
WHERE email = 'admin@lotus-business.com';
```

## 8. Problèmes CORS

Si tu vois dans la console :
```
Access to XMLHttpRequest at '...' from origin '...' has been blocked by CORS policy
```

**Solution :** Le backend doit autoriser ton frontend.

Dans `server/src/app.js`, vérifie :
```javascript
app.use(cors()); // Autorise tous les origins (dev)
```

Pour la production, configure spécifiquement :
```javascript
app.use(cors({
  origin: ['http://localhost:5173', 'https://ton-dashboard.vercel.app'],
  credentials: true
}));
```

## 9. Cold Start Render

⏰ Render (plan gratuit) met les serveurs en veille après 15 min d'inactivité.

**Premier symptôme :** Timeout ou erreur "Failed to fetch"

**Solution :** 
1. Va sur `https://lotus-business-server.onrender.com`
2. Attends 30-60 secondes que le serveur se réveille
3. Réessaye de te connecter

## 10. Vérifier les variables d'environnement

### Backend (Render) :

Dans Render → Settings → Environment :
- `JWT_SECRET` est défini ?
- `DATABASE_URL` pointe vers Supabase ?

### Frontend (Local) :

Dans `dashboard/.env` :
```env
VITE_API_URL=https://lotus-business-server.onrender.com/api
```

⚠️ **Pas de `/` à la fin !**

## 📞 Checklist complète

- [ ] Le backend répond sur la root (`/`)
- [ ] L'admin existe dans Supabase avec un hash bcrypt valide
- [ ] Le mot de passe correspond au hash (testé avec `bcrypt.compare`)
- [ ] L'URL de l'API est correcte dans `.env`
- [ ] Le serveur Render n'est pas en veille
- [ ] CORS est configuré dans le backend
- [ ] Les logs de la console ne montrent pas d'erreurs réseau
- [ ] Le JWT_SECRET est défini sur Render

---

Si après tout ça, ça ne fonctionne toujours pas, envoie-moi :
1. La réponse exacte de l'API (depuis Postman/curl)
2. Les logs de la console navigateur
3. Le hash de ton mot de passe (les 20 premiers caractères suffisent)
