# Guide de démarrage (Étudiant) — OneLastEvent

Ce guide te permet de **cloner, lancer, comprendre et contribuer** au projet **OneLastEvent**.

## Documentation disponible

| Document | Description |
|----------|-------------|
| `DOCUMENTATION.md` | Référence technique complète |
| `AIDE_MEMOIRE_ORAL.md` | Présentation (oral) |
| `GUIDE_PRODUCTION.md` | **NOUVEAU** - Guide complet pour le déploiement en production |
| `DEPLOYMENT.md` | Instructions de déploiement rapide |

---

## 1) Objectif du projet
OneLastEvent est une plateforme de gestion d’événements.

- **Rôles** : `USER`, `ORGANIZER`, `ADMIN`
- **Fonctionnalités clés** : authentification JWT, création/inscription à des événements, paiements (mock/Stripe prêt), notifications temps réel (Socket.io)

---

## 2) Stack technique (à retenir)
- **Frontend** : React 18 + Vite + Tailwind
- **Backend** : Node.js (ESM) + Express
- **DB** : MySQL (Sequelize)
- **Cache / tokens** : Redis
- **Temps réel** : Socket.io

---

## 3) Prérequis
### 3.1 Outils
- Node.js **>= 18**
- Docker Desktop (recommandé) + Docker Compose
- Git

### 3.2 Ports utilisés
- **Frontend** : `http://localhost:3000`
- **Backend API** : `http://localhost:4000/api`
- **Health check** : `http://localhost:4000/api/health`

---

## 4) Démarrage rapide (Docker) — Recommandé
### 4.1 Lancer les services
Dans un terminal à la racine du projet :

```bash
docker-compose up -d
```

### 4.2 Initialiser la base (migrations + seed)
```bash
docker-compose exec backend npm run migrate
docker-compose exec backend npm run seed
```

### 4.3 Vérifier que tout est OK
- Frontend : `http://localhost:3000`
- Backend : `http://localhost:4000/api/health`

---

## 5) Démarrage en local (sans Docker)
> À utiliser seulement si tu as déjà MySQL + Redis en local.

### 5.1 Backend
1) Installer :
```bash
cd backend
npm install
```

2) Créer un fichier `backend/.env`
- Le projet **n’a pas** de `backend/.env.example` dans ce dépôt.
- Copie la section “Variables d’environnement” depuis `DOCUMENTATION.md` / `README.md` et adapte :
  - `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`
  - `REDIS_HOST`, `REDIS_PORT`
  - `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`

3) Initialiser DB + démarrer :
```bash
npm run migrate
npm run seed
npm run dev
```

### 5.2 Frontend
Dans un autre terminal :
```bash
cd frontend
npm install
npm run dev
```

---

## 6) Comptes de test (après `seed`)
- **Admin** : `admin@onelastevent.com` / `Admin123!`
- **Organizer** : `organizer1@example.com` / `Organizer1!`
- **User** : `user1@example.com` / `User1234!`

---

## 7) Structure du projet (où chercher quoi)
### 7.1 Backend (API)
Point d’entrée : `backend/src/server.js`

Chemin classique d’une requête :

```
Route -> Middleware(s) -> Controller -> Service -> Repository -> DB
```

Dossiers importants :
- `backend/src/routes/` : endpoints (ex: `/api/auth/*`, `/api/events/*`)
- `backend/src/controllers/` : gestion HTTP (req/res)
- `backend/src/services/` : logique métier
- `backend/src/repositories/` : accès données (Sequelize)
- `backend/src/middlewares/` : auth, validation, erreurs, rate limit
- `backend/src/validators/` : schémas Joi

### 7.2 Frontend (UI)
Point d’entrée : `frontend/src/main.jsx` puis `frontend/src/App.jsx`

Dossiers importants :
- `frontend/src/pages/` : pages (routes React)
- `frontend/src/components/` : composants réutilisables
- `frontend/src/services/` : appels API (Axios)
- `frontend/src/context/` : auth state

---

## 8) Endpoints indispensables (à tester en premier)
- `GET /api/health`
- `POST /api/auth/login`
- `GET /api/events`

Astuce : les endpoints principaux sont listés dans `DOCUMENTATION.md`.

---

## 9) Premier parcours “étudiant” (1 à 2 heures)
### Étape A — Comprendre le flux d’auth
1) Lis `backend/src/routes/auth.routes.js`
2) Suis vers `AuthController` puis `AuthService`
3) Repère :
- génération tokens : `backend/src/utils/jwt.util.js`
- stockage refresh token : `backend/src/config/redis.js` + `UserRepository`

### Étape B — Comprendre le flux “events”
1) Liste : `GET /api/events`
2) Détail : `GET /api/events/:id`
3) Création : `POST /api/events` (rôle organizer)

### Étape C — Faire une première petite contribution
Choisis une option :
- Ajouter une validation manquante (Joi) sur un endpoint.
- Améliorer un message d’erreur API (sans changer la logique).
- Ajouter un test (backend ou frontend).

---

## 10) Bonnes pratiques de contribution
- Ne pas modifier 20 fichiers d’un coup : une PR = un objectif.
- Toujours :
  - lancer `npm run lint`
  - lancer `npm test` (si possible)
- Quand tu ajoutes un endpoint :
  - route + validator + controller + service + repository (si besoin)
  - gérer les erreurs via `ApiError`

---

## 11) Dépannage (problèmes fréquents)
### 11.1 Frontend ne se connecte pas au backend
- Vérifie que l’API répond : `http://localhost:4000/api/health`
- En dev, le proxy Vite est défini dans `frontend/vite.config.js`.

### 11.2 Erreurs DB
- Vérifie que MySQL tourne (Docker ou local)
- Vérifie `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME`
- Relance migrations + seed.

### 11.3 Redis indisponible
- Vérifie que Redis tourne
- Vérifie `REDIS_HOST` / `REDIS_PORT`

---

## 12) Où lire “la vérité” du projet
- Fonctionnement complet : `DOCUMENTATION.md`
- Détails des scripts : `backend/package.json`, `frontend/package.json`
- Configuration Docker : `docker-compose.yml`, `backend/Dockerfile`, `frontend/Dockerfile.prod`, `frontend/nginx.conf`

---

## 13) Ce que j'attends de toi (checklist)
- [ ] Tu arrives à lancer le projet (Docker)
- [ ] Tu sais te connecter avec un compte de test
- [ ] Tu sais trouver le code derrière un endpoint (route -> controller -> service -> repository)
- [ ] Tu as fait une petite contribution (validation, test, bugfix)

---

## 14) Préparation à la Production (NOUVEAU)

### Pourquoi c'est important ?

En entreprise, tu ne feras pas que du développement local. Tu devras comprendre :
- Comment sécuriser une application
- Comment déployer sur un serveur
- Comment gérer les secrets et configurations

### Les changements effectués pour la production

Le projet a été mis à jour avec des configurations production-ready :

| Fichier | Ce qui a changé |
|---------|-----------------|
| `backend/.env.example` | Template sécurisé avec instructions |
| `docker-compose.yml` | Port MySQL corrigé, Redis sécurisé, JWT obligatoires |
| `docker-compose.prod.yml` | Configuration complète pour production |
| `.github/workflows/ci.yml` | Tests obligatoires (plus de `|| true`) |
| `backend/src/server.js` | Sync DB désactivé en production |
| `nginx/` | Configuration reverse proxy + HTTPS |
| `scripts/deploy.sh` | Script de déploiement automatisé |

### Les problèmes de sécurité corrigés

```
AVANT (dangereux)                    APRÈS (sécurisé)
─────────────────                    ─────────────────
Mot de passe en clair               → Fichier .env ignoré par git
Secrets JWT faibles                 → Secrets 64 bytes obligatoires
Tests ignorés en CI                 → Tests bloquants
Port MySQL incorrect                → Port 3306 corrigé
Pas de HTTPS                        → Nginx + Let's Encrypt
Redis sans password                 → --requirepass activé
alter:true en prod                  → alter:false + migrations
```

### Pour aller plus loin

Lis le fichier `GUIDE_PRODUCTION.md` qui explique en détail :
- Pourquoi chaque changement a été fait
- Comment fonctionne la sécurité (JWT, bcrypt, HTTPS)
- Comment déployer sur un vrai serveur
- Les commandes utiles en production

### Mini-exercice production

1. Génère un secret JWT avec :
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

2. Compare `docker-compose.yml` et `docker-compose.prod.yml` :
   - Quelles sont les différences ?
   - Pourquoi ces différences ?

3. Lis `nginx/conf.d/default.conf` :
   - Comment le rate limiting est-il configuré ?
   - Comment le HTTPS est-il activé ?

---

## 15) Résumé des fichiers du projet

```
event-main/
├── backend/
│   ├── src/
│   │   ├── config/          # DB, Redis, Logger
│   │   ├── controllers/     # Gestion HTTP
│   │   ├── middlewares/     # Auth, validation, erreurs
│   │   ├── models/          # Sequelize (User, Event, etc.)
│   │   ├── repositories/    # Accès données
│   │   ├── routes/          # Endpoints API
│   │   ├── services/        # Logique métier
│   │   ├── utils/           # JWT, hash, email
│   │   ├── validators/      # Schémas Joi
│   │   └── server.js        # Point d'entrée
│   ├── .env                 # Variables locales (NE PAS COMMITER)
│   ├── .env.example         # Template à copier
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Composants React
│   │   ├── pages/           # Pages (routes)
│   │   ├── services/        # Appels API
│   │   ├── context/         # Auth state
│   │   └── App.jsx          # Routeur principal
│   └── package.json
├── nginx/                   # NOUVEAU - Config reverse proxy
│   ├── nginx.conf
│   └── conf.d/default.conf
├── scripts/                 # NOUVEAU - Scripts déploiement
│   ├── deploy.sh
│   └── init-ssl.sh
├── .github/workflows/ci.yml # CI/CD corrigé
├── docker-compose.yml       # Développement
├── docker-compose.prod.yml  # NOUVEAU - Production
├── .env.prod.example        # NOUVEAU - Template prod
├── .gitignore               # NOUVEAU - Protection secrets
├── GUIDE_PRODUCTION.md      # NOUVEAU - Ce guide
├── DEPLOYMENT.md            # NOUVEAU - Instructions rapides
└── README.md
```
