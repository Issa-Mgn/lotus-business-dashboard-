# Lotus Business - Documentation projet

Lotus Business est une plateforme de gestion commerciale avec :

- un backend Node.js/Express pour l'API, les licences, les utilisateurs, les admins et les emails ;
- un dashboard web React/Vite pour l'administration ;
- une application mobile Lotus Business qui doit consommer la meme API sans acceder directement a Supabase.

Ce README sert de reference rapide pour les developpeurs frontend, backend et mobile.

## Structure du projet

```txt
Lotus Business/
├─ server/                  Backend Express + Prisma + Supabase
│  ├─ src/
│  │  ├─ app.js             Point d'entree API
│  │  ├─ routes/            Routes auth/admin
│  │  ├─ controllers/       Logique metier
│  │  ├─ middlewares/       JWT, role admin, licence
│  │  ├─ lib/               Prisma, mailer, licences
│  │  └─ templates/         Templates email
│  └─ prisma/schema.prisma  Schema DB
│
└─ dashboard/dashboard/     Frontend admin React + Vite
   ├─ src/
   │  ├─ components/        Layout, Sidebar, Table, Badge, StatCard
   │  ├─ context/           AuthContext, ThemeContext
   │  ├─ pages/             Dashboard, Users, Licenses, Admins, Login
   │  ├─ services/api.js    Client Axios vers le backend
   │  └─ index.css          Design system + responsive
   └─ .env                  Variables Vite
```

## Stack technique

Backend :

- Node.js + Express
- Prisma ORM
- Supabase PostgreSQL
- JWT
- bcrypt
- Nodemailer + Gmail App Password

Frontend admin :

- React 19
- Vite
- React Router
- Axios
- Recharts
- Lucide React
- CSS variables, theme clair/sombre

## Installation locale

Backend :

```bash
cd server
npm install
npm run prisma:generate
npm run dev
```

API locale :

```txt
http://localhost:5000
```

Dashboard :

```bash
cd dashboard/dashboard
npm install
npm run dev
```

Dashboard local :

```txt
http://localhost:5173
```

## Variables d'environnement backend

Fichier : `server/.env`

```env
DATABASE_URL="postgresql://postgres.xxx:password@host:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.xxx:password@host:5432/postgres"

JWT_SECRET="une_valeur_longue_et_secrete"

MAIL_USER="votre_email@gmail.com"
MAIL_APP_PASSWORD="xxxx xxxx xxxx xxxx"

PORT=5000
NODE_ENV="development"
```

Notes importantes :

- `DATABASE_URL` est l'URL pooler Supabase pour Prisma en runtime.
- `DIRECT_URL` sert aux migrations Prisma si besoin.
- `JWT_SECRET` doit etre identique pour tous les clients API d'un meme environnement.
- `MAIL_APP_PASSWORD` doit etre un mot de passe d'application Gmail, pas le mot de passe normal du compte.
- Sur Render free tier, les ports SMTP peuvent etre bloques. Dans ce cas, Gmail SMTP peut marcher en local mais echouer en production. Utiliser une instance payante Render ou un service email via API HTTP comme Brevo, Resend ou SendGrid.

Generation recommandee du secret JWT :

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

## Variables d'environnement dashboard

Fichier : `dashboard/dashboard/.env`

```env
VITE_API_URL=https://lotus-business-server.onrender.com/api
VITE_MONTHLY_PRICE_FCFA=5000
VITE_ANNUAL_PRICE_FCFA=50000
```

En local, si le backend tourne sur votre machine :

```env
VITE_API_URL=http://localhost:5000/api
```

Point critique : ne laissez pas le dashboard local pointer vers Render si vous testez des routes backend ajoutees localement. Exemple : si `GET /api/admin/admins` marche en local mais pas sur Render, il faut soit changer `VITE_API_URL`, soit redeployer le backend Render.

## Base de donnees

Tables principales :

- `users` : utilisateurs de l'app mobile + licence integree ;
- `admins` : administrateurs du dashboard ;
- `licenses` : index rapide email vers cle de licence.

Enums :

- `LicenseType`: `FREE`, `PREMIUM`
- `LicenseStatus`: `ACTIVE`, `EXPIRED`, `SUSPENDED`

Champs importants cote mobile :

- `licenseKey` : cle utilisee pour connecter un utilisateur mobile ;
- `licenseStatus` : seul `ACTIVE` permet l'acces ;
- `expirationDate` : date limite de validite ;
- `activeSessionId` : session unique, une nouvelle connexion invalide l'ancienne.

## Regles de licence

Inscription :

- cree un utilisateur ;
- genere une cle de licence ;
- cree une ligne dans `licenses` ;
- attribue une licence `FREE` active ;
- expiration par defaut : 1 mois ;
- envoie le mail de licence.

Connexion mobile :

- l'utilisateur se connecte avec sa `licenseKey` ;
- le backend verifie expiration + statut ;
- si la licence est expiree, elle passe en `EXPIRED` ;
- une seule session utilisateur active est autorisee.

Revenus dashboard :

- `FREE` = 0 FCFA ;
- licence payante d'environ 1 mois = `VITE_MONTHLY_PRICE_FCFA`, par defaut 5000 FCFA ;
- licence payante d'environ 1 an = `VITE_ANNUAL_PRICE_FCFA`, par defaut 50000 FCFA.

Le dashboard deduit mensuel/annuel avec `activationDate` et `expirationDate`.

## Endpoints publics pour l'app mobile

Base URL production :

```txt
https://lotus-business-server.onrender.com/api
```

Base URL locale :

```txt
http://localhost:5000/api
```

### Inscription utilisateur

```http
POST /auth/register
Content-Type: application/json
```

Body :

```json
{
  "email": "client@example.com",
  "phone": "+221771234567",
  "firstName": "Awa",
  "lastName": "Diop"
}
```

Effets : creation du user, generation de la licence et envoi du mail avec la cle.

### Connexion utilisateur mobile

```http
POST /auth/login
Content-Type: application/json
```

Body :

```json
{
  "licenseKey": "LOT-XXXX-XXXX-XXXX"
}
```

Reponse :

```json
{
  "message": "Connexion reussie",
  "token": "jwt",
  "user": {
    "id": "...",
    "email": "client@example.com",
    "firstName": "Awa",
    "lastName": "Diop",
    "licenseKey": "LOT-XXXX-XXXX-XXXX",
    "licenseType": "FREE",
    "licenseStatus": "ACTIVE",
    "expirationDate": "..."
  }
}
```

Le mobile doit stocker le `token` et l'envoyer ensuite :

```http
Authorization: Bearer <token>
```

### Cle oubliee

```http
POST /auth/forgot-key
Content-Type: application/json
```

Body :

```json
{
  "email": "client@example.com"
}
```

### Deconnexion utilisateur

```http
POST /auth/logout
Authorization: Bearer <user_token>
```

## Endpoints admin pour le dashboard

### Connexion admin

```http
POST /admin/login
```

Body :

```json
{
  "email": "admin@example.com",
  "password": "motdepasse"
}
```

Le dashboard stocke :

- `adminToken`
- `adminData`

### Routes protegees admin

Toutes ces routes demandent :

```http
Authorization: Bearer <admin_token>
```

Routes principales :

```txt
GET  /admin/users
GET  /admin/admins
POST /admin/create
POST /admin/upgrade-premium
PATCH /admin/suspend/:userId
POST /admin/reactivate-license
POST /admin/force-logout/:userId
POST /admin/send-license-email
POST /admin/test-email
```

### Renvoyer le mail de licence depuis le dashboard

```http
POST /admin/send-license-email
Authorization: Bearer <admin_token>
Content-Type: application/json
```

Body :

```json
{
  "userId": "id_du_user"
}
```

Cette route renvoie le meme email que l'inscription, avec la cle de licence, le statut et l'expiration.

### Ajouter un utilisateur depuis le dashboard

La page Administrateurs utilise `POST /auth/register`. C'est volontaire pour garder exactement la meme logique que l'inscription mobile.

## Guide pour les developpeurs mobile Lotus Business

Les devs mobile doivent respecter ces points :

1. Ne jamais appeler Supabase directement depuis l'app mobile.
2. Toujours passer par l'API Express.
3. La connexion utilisateur se fait avec `licenseKey`, pas email/password.
4. Stocker le JWT utilisateur apres `/auth/login`.
5. Envoyer `Authorization: Bearer <token>` sur les routes protegees.
6. Gerer les erreurs importantes :
   - `401`: cle invalide, token invalide, session remplacee ;
   - `403`: licence expiree, suspendue ou inactive ;
   - `404`: ressource introuvable.
7. Si l'API repond que la session est invalide, deconnecter localement l'utilisateur.
8. Ne pas afficher une licence comme active si `licenseStatus !== "ACTIVE"`.
9. Ne pas calculer la validite cote mobile comme source de verite. Le backend decide.

Flux mobile recommande :

```txt
1. L'utilisateur saisit sa cle de licence
2. POST /auth/login
3. Si OK, stocker token + user
4. L'app utilise user.licenseStatus et user.expirationDate pour l'affichage
5. Sur 401/403, forcer retour a l'ecran de connexion/licence
```

## Emails

Le backend utilise :

- `src/lib/mailer.js`
- `src/lib/sendMail.js`
- `src/templates/welcome.js`

Emails existants :

- inscription utilisateur ;
- renvoi de cle ;
- renvoi du mail de licence depuis le dashboard ;
- test email admin.

Test local :

```bash
cd server
npm run test:email
```

Si le test fonctionne localement mais pas sur Render, verifier :

- variables `MAIL_USER` et `MAIL_APP_PASSWORD` sur Render ;
- redeploiement du backend ;
- limitation SMTP de Render ;
- logs de `POST /api/admin/test-email`.

## Dashboard admin

Pages :

- `/login` : connexion admin ;
- `/` : statistiques, revenus, graphique ;
- `/users` : liste users, filtres, export CSV, suspension ;
- `/licenses` : liste licences, recherche, export CSV, copie cle ;
- `/admins` : liste admins, creation admin, ajout user, renvoi mail licence.

Design :

- theme sombre par defaut ;
- theme clair disponible ;
- sidebar desktop ;
- sidebar compacte tablette ;
- drawer mobile ;
- tableaux transformes en cartes sur mobile.

## Commandes utiles

Backend :

```bash
npm run dev
npm run start
npm run test:email
npm run test:db
npm run prisma:generate
```

Dashboard :

```bash
npm run dev
npm run lint
npm run build
npm run preview
```

## Deploiement

Backend Render :

- configurer toutes les variables backend ;
- verifier que `npm install` installe bien `nodemailer` ;
- redeployer apres chaque ajout de route backend ;
- tester `POST /api/admin/test-email`.

Frontend Vercel/Netlify/Render :

- configurer `VITE_API_URL` vers l'API production ;
- relancer un build apres changement d'env ;
- ne pas mettre de secrets backend dans les variables `VITE_*`.

## Pieges frequents

- `Aucun administrateur trouve` alors que Supabase contient des admins : le frontend pointe peut-etre vers Render alors que la route existe seulement en local.
- Email OK en local mais KO en production : SMTP peut etre bloque par l'hebergeur.
- Le mobile recoit `401`: token expire, invalide, ou nouvelle connexion sur un autre appareil.
- Le mobile recoit `403`: licence inactive, expiree ou suspendue.
- Ne pas confondre token admin et token utilisateur.
- Ne pas exposer `DATABASE_URL`, `JWT_SECRET`, `MAIL_APP_PASSWORD` dans le frontend ou l'app mobile.

## Convention importante

Le backend est la source de verite pour :

- la validite des licences ;
- les statuts ;
- la session active ;
- l'envoi des emails ;
- la creation des users/admins.

Le dashboard et l'application mobile doivent rester des clients de l'API, pas des clients directs de la base de donnees.
