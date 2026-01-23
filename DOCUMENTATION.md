# 📚 Documentation Technique - OneLastEvent

## Table des matières

1. [Présentation du projet](#1-présentation-du-projet)
2. [Architecture technique](#2-architecture-technique)
3. [Technologies utilisées](#3-technologies-utilisées)
4. [Installation et démarrage](#4-installation-et-démarrage)
5. [Structure du projet](#5-structure-du-projet)
6. [Base de données](#6-base-de-données)
7. [API REST - Endpoints](#7-api-rest---endpoints)
8. [Authentification et sécurité](#8-authentification-et-sécurité)
9. [Frontend - Composants](#9-frontend---composants)
10. [Docker et déploiement](#10-docker-et-déploiement)
11. [Tests](#11-tests)
12. [Glossaire technique](#12-glossaire-technique)

---

## 1. Présentation du projet

### 1.1 Objectif

**OneLastEvent** est une plateforme web de gestion d'événements permettant de :

- Mettre en relation des **organisateurs** d'événements et des **participants**
- Créer, publier et gérer des événements (gratuits ou payants)
- Permettre aux utilisateurs de s'inscrire et payer pour participer
- Offrir une expérience utilisateur moderne et responsive

### 1.2 Fonctionnalités principales

| Fonctionnalité             | Description                                                |
| -------------------------- | ---------------------------------------------------------- |
| Authentification           | Inscription, connexion, déconnexion sécurisée avec JWT     |
| Gestion des profils        | Modification du profil, avatar, mot de passe               |
| Création d'événements      | Formulaire complet avec image, description, prix, capacité |
| Recherche d'événements     | Filtres par date, lieu, prix, recherche textuelle          |
| Inscription aux événements | Inscription gratuite ou avec paiement                      |
| Dashboard utilisateur      | Suivi des inscriptions et historique                       |
| Dashboard organisateur     | Gestion des événements créés et des participants           |
| Paiements                  | Système de paiement mock (prêt pour Stripe)                |
| Notifications temps réel   | Via WebSockets (Socket.io)                                 |

### 1.3 Rôles utilisateurs

| Rôle          | Permissions                                           |
| ------------- | ----------------------------------------------------- |
| **USER**      | Consulter événements, s'inscrire, gérer son profil    |
| **ORGANIZER** | USER + créer/modifier/publier ses événements          |
| **ADMIN**     | ORGANIZER + gérer tous les utilisateurs et événements |

---

## 2. Architecture technique

### 2.1 Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Navigateur)                      │
│                     React + Vite + Tailwind CSS                  │
└───────────────────────────────┬─────────────────────────────────┘
                                │ HTTP / WebSocket
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                         SERVEUR (Backend)                        │
│                      Node.js + Express.js                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Routes    │──│ Controllers │──│       Services          │  │
│  └─────────────┘  └─────────────┘  └───────────┬─────────────┘  │
│                                                 │                │
│  ┌─────────────┐  ┌─────────────┐  ┌───────────▼─────────────┐  │
│  │ Middlewares │  │  Validators │  │     Repositories        │  │
│  └─────────────┘  └─────────────┘  └───────────┬─────────────┘  │
└────────────────────────────────────────────────┼────────────────┘
                                                 │
                    ┌────────────────────────────┼────────────────┐
                    │                            ▼                │
                    │  ┌─────────────┐    ┌─────────────┐         │
                    │  │    MySQL    │    │    Redis    │         │
                    │  │  (Données)  │    │   (Cache)   │         │
                    │  └─────────────┘    └─────────────┘         │
                    │              STOCKAGE                        │
                    └─────────────────────────────────────────────┘
```

### 2.2 Pattern architectural

Le projet utilise une architecture en couches basée sur le pattern **MVC** (Model-View-Controller) enrichi avec une couche **Repository** :

```
┌──────────────────────────────────────────────────────────────────┐
│  COUCHE          │  RESPONSABILITÉ                               │
├──────────────────┼───────────────────────────────────────────────┤
│  Routes          │  Définition des endpoints URL                 │
│  Controllers     │  Réception des requêtes, envoi des réponses   │
│  Services        │  Logique métier, règles de gestion            │
│  Repositories    │  Accès aux données, requêtes DB               │
│  Models          │  Définition des structures de données         │
└──────────────────────────────────────────────────────────────────┘
```

### 2.3 Flux de données

**Exemple : Création d'un événement**

```
1. Utilisateur remplit le formulaire React
           │
           ▼
2. Frontend envoie POST /api/events avec les données
           │
           ▼
3. Route → Middleware Auth (vérifie JWT)
           │
           ▼
4. Middleware Validation (vérifie les données avec Joi)
           │
           ▼
5. Controller reçoit la requête validée
           │
           ▼
6. Service applique la logique métier
           │
           ▼
7. Repository insère dans MySQL via Sequelize
           │
           ▼
8. Réponse remonte jusqu'au Frontend
           │
           ▼
9. React met à jour l'interface
```

---

## 3. Technologies utilisées

### 3.1 Frontend

| Technologie          | Version | Description                                                        |
| -------------------- | ------- | ------------------------------------------------------------------ |
| **React**            | 18.x    | Bibliothèque JavaScript pour construire des interfaces utilisateur |
| **Vite**             | 5.x     | Outil de build moderne, rapide avec Hot Module Replacement         |
| **Tailwind CSS**     | 3.x     | Framework CSS utilitaire pour le styling                           |
| **React Router**     | 6.x     | Routing côté client pour Single Page Application                   |
| **TanStack Query**   | 5.x     | Gestion du state serveur, cache et synchronisation                 |
| **Axios**            | 1.x     | Client HTTP pour les appels API                                    |
| **Headless UI**      | 1.x     | Composants UI accessibles non stylisés                             |
| **Heroicons**        | 2.x     | Icônes SVG                                                         |
| **date-fns**         | 3.x     | Manipulation des dates                                             |
| **react-hot-toast**  | 2.x     | Notifications toast                                                |
| **Socket.io-client** | 4.x     | Client WebSocket                                                   |

### 3.2 Backend

| Technologie            | Version | Description                     |
| ---------------------- | ------- | ------------------------------- |
| **Node.js**            | 18+     | Runtime JavaScript côté serveur |
| **Express**            | 4.x     | Framework web minimaliste       |
| **Sequelize**          | 6.x     | ORM pour MySQL                  |
| **mysql2**             | 3.x     | Driver MySQL pour Node.js       |
| **jsonwebtoken**       | 9.x     | Création et vérification de JWT |
| **bcryptjs**           | 2.x     | Hachage de mots de passe        |
| **Joi**                | 17.x    | Validation de schémas           |
| **ioredis**            | 5.x     | Client Redis                    |
| **Socket.io**          | 4.x     | WebSockets bidirectionnels      |
| **Multer**             | 1.x     | Upload de fichiers              |
| **Helmet**             | 7.x     | Sécurité des headers HTTP       |
| **cors**               | 2.x     | Gestion du Cross-Origin         |
| **express-rate-limit** | 7.x     | Limitation de requêtes          |
| **Winston**            | 3.x     | Logging                         |
| **Stripe**             | 14.x    | Paiements (optionnel)           |

### 3.3 Base de données

| Technologie | Version | Description                              |
| ----------- | ------- | ---------------------------------------- |
| **MySQL**   | 8.0     | Base de données relationnelle principale |
| **Redis**   | Alpine  | Cache en mémoire pour tokens et sessions |

### 3.4 DevOps

| Technologie        | Description                       |
| ------------------ | --------------------------------- |
| **Docker**         | Conteneurisation de l'application |
| **Docker Compose** | Orchestration multi-conteneurs    |
| **GitHub Actions** | CI/CD automatisé                  |
| **ESLint**         | Linting du code JavaScript        |
| **Prettier**       | Formatage du code                 |
| **Jest**           | Tests backend                     |
| **Vitest**         | Tests frontend                    |

---

## 4. Installation et démarrage

### 4.1 Prérequis

- Node.js 18 ou supérieur
- Docker et Docker Compose
- Git

### 4.2 Installation avec Docker (Recommandé)

```bash
# 1. Cloner le projet
git clone <url-du-repo>
cd onelastevent

# 2. Copier le fichier d'environnement
cp backend/.env.example backend/.env

# 3. Lancer les services
docker-compose up -d

# 4. Attendre que MySQL soit prêt (~30s), puis initialiser
docker-compose exec backend npm run migrate
docker-compose exec backend npm run seed

# 5. Accéder à l'application
# Frontend: http://localhost:5173
# Backend:  http://localhost:4000/api
```

### 4.3 Installation locale (Sans Docker)

```bash
# Backend
cd backend
npm install
cp .env.example .env
# Éditer .env avec vos credentials MySQL/Redis
npm run migrate
npm run seed
npm run dev

# Frontend (dans un autre terminal)
cd frontend
npm install
npm run dev
```

### 4.4 Variables d'environnement

```env
# Application
NODE_ENV=development
PORT=4000
FRONTEND_URL=http://localhost:5173

# Base de données MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USER=onevent_user
DB_PASS=changeme
DB_NAME=onelastevent_db

# JWT (CHANGER EN PRODUCTION !)
JWT_ACCESS_SECRET=votre_secret_access_token
JWT_REFRESH_SECRET=votre_secret_refresh_token
JWT_ACCESS_EXP=15m
JWT_REFRESH_EXP=30d

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Stripe (Optionnel)
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Uploads
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
```

### 4.5 Comptes de test

| Rôle         | Email                  | Mot de passe |
| ------------ | ---------------------- | ------------ |
| Admin        | admin@onelastevent.com | Admin123!    |
| Organisateur | organizer1@example.com | Organizer1!  |
| Utilisateur  | user1@example.com      | User1234!    |

---

## 5. Structure du projet

### 5.1 Arborescence Backend

```
backend/
├── src/
│   ├── config/
│   │   ├── db.js              # Configuration Sequelize/MySQL
│   │   ├── redis.js           # Configuration Redis
│   │   └── logger.js          # Configuration Winston
│   │
│   ├── controllers/
│   │   ├── AuthController.js      # Login, register, refresh
│   │   ├── UserController.js      # Profil, avatar
│   │   ├── EventController.js     # CRUD événements
│   │   ├── InscriptionController.js
│   │   └── PaymentController.js
│   │
│   ├── services/
│   │   ├── AuthService.js         # Logique authentification
│   │   ├── UserService.js         # Logique utilisateurs
│   │   ├── EventService.js        # Logique événements
│   │   ├── InscriptionService.js
│   │   └── PaymentService.js
│   │
│   ├── repositories/
│   │   ├── UserRepository.js      # Requêtes DB users
│   │   ├── EventRepository.js     # Requêtes DB events
│   │   ├── InscriptionRepository.js
│   │   └── PaymentRepository.js
│   │
│   ├── models/
│   │   ├── index.js           # Associations Sequelize
│   │   ├── User.js            # Modèle utilisateur
│   │   ├── Event.js           # Modèle événement
│   │   ├── Inscription.js     # Modèle inscription
│   │   ├── Payment.js         # Modèle paiement
│   │   └── RefreshToken.js    # Modèle token
│   │
│   ├── middlewares/
│   │   ├── auth.middleware.js     # Vérification JWT
│   │   ├── role.middleware.js     # Vérification rôles
│   │   ├── validate.middleware.js # Validation Joi
│   │   ├── error.middleware.js    # Gestion erreurs
│   │   ├── rateLimiter.middleware.js
│   │   └── upload.middleware.js   # Upload fichiers
│   │
│   ├── validators/
│   │   ├── auth.validator.js      # Schémas auth
│   │   ├── user.validator.js      # Schémas user
│   │   ├── event.validator.js     # Schémas event
│   │   ├── inscription.validator.js
│   │   └── payment.validator.js
│   │
│   ├── routes/
│   │   ├── index.js           # Route principale
│   │   ├── auth.routes.js     # /api/auth/*
│   │   ├── users.routes.js    # /api/users/*
│   │   ├── events.routes.js   # /api/events/*
│   │   ├── inscriptions.routes.js
│   │   └── payments.routes.js
│   │
│   ├── utils/
│   │   ├── jwt.util.js        # Génération/vérification JWT
│   │   ├── hash.util.js       # Hachage bcrypt
│   │   └── email.util.js      # Envoi emails (stub)
│   │
│   ├── scripts/
│   │   ├── migrate.js         # Script de migration
│   │   └── seed.js            # Script de seed
│   │
│   ├── migrations/
│   │   └── 001_create_tables.sql
│   │
│   └── server.js              # Point d'entrée
│
├── uploads/                   # Fichiers uploadés
├── logs/                      # Fichiers de logs
├── Dockerfile
├── package.json
└── .env.example
```

### 5.2 Arborescence Frontend

```
frontend/
├── src/
│   ├── components/
│   │   ├── Header.jsx         # Navigation
│   │   ├── Footer.jsx         # Pied de page
│   │   ├── Layout.jsx         # Layout principal
│   │   ├── EventCard.jsx      # Carte événement
│   │   ├── Pagination.jsx     # Pagination
│   │   ├── Modal.jsx          # Modale générique
│   │   ├── LoadingSpinner.jsx # Spinner chargement
│   │   └── ProtectedRoute.jsx # Route protégée
│   │
│   ├── pages/
│   │   ├── Home.jsx           # Page d'accueil
│   │   ├── Login.jsx          # Connexion
│   │   ├── Register.jsx       # Inscription
│   │   ├── EventList.jsx      # Liste événements
│   │   ├── EventDetails.jsx   # Détail événement
│   │   ├── CreateEvent.jsx    # Création événement
│   │   ├── EditEvent.jsx      # Édition événement
│   │   ├── DashboardUser.jsx  # Dashboard utilisateur
│   │   ├── DashboardOrganizer.jsx
│   │   ├── Profile.jsx        # Profil utilisateur
│   │   └── NotFound.jsx       # Page 404
│   │
│   ├── context/
│   │   └── AuthContext.jsx    # Contexte authentification
│   │
│   ├── services/
│   │   ├── api.js             # Instance Axios
│   │   ├── events.js          # API événements
│   │   ├── users.js           # API utilisateurs
│   │   └── payments.js        # API paiements
│   │
│   ├── App.jsx                # Composant racine
│   ├── main.jsx               # Point d'entrée
│   └── index.css              # Styles globaux
│
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── Dockerfile
└── package.json
```

---

## 6. Base de données

### 6.1 Schéma relationnel

```
┌─────────────────────────────────────────────────────────────────────┐
│                              USERS                                   │
├─────────────────────────────────────────────────────────────────────┤
│ PK │ id              │ VARCHAR(36)  │ UUID                          │
│    │ email           │ VARCHAR(255) │ UNIQUE, NOT NULL              │
│    │ password_hash   │ VARCHAR(255) │ NOT NULL                      │
│    │ full_name       │ VARCHAR(255) │ NOT NULL                      │
│    │ role            │ ENUM         │ USER, ORGANIZER, ADMIN        │
│    │ bio             │ TEXT         │ NULLABLE                      │
│    │ avatar_url      │ VARCHAR(500) │ NULLABLE                      │
│    │ is_verified     │ BOOLEAN      │ DEFAULT FALSE                 │
│    │ created_at      │ TIMESTAMP    │                               │
│    │ updated_at      │ TIMESTAMP    │                               │
└─────────────────────────────────────────────────────────────────────┘
           │
           │ 1:N (organizer_id)
           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                             EVENTS                                   │
├─────────────────────────────────────────────────────────────────────┤
│ PK │ id                  │ VARCHAR(36)   │ UUID                     │
│ FK │ organizer_id        │ VARCHAR(36)   │ → users.id               │
│    │ title               │ VARCHAR(255)  │ NOT NULL                 │
│    │ description         │ TEXT          │ NULLABLE                 │
│    │ location            │ VARCHAR(500)  │ NULLABLE                 │
│    │ start_datetime      │ DATETIME      │ NOT NULL                 │
│    │ end_datetime        │ DATETIME      │ NULLABLE                 │
│    │ capacity            │ INT           │ DEFAULT 100              │
│    │ current_participants│ INT           │ DEFAULT 0                │
│    │ price               │ DECIMAL(10,2) │ DEFAULT 0                │
│    │ currency            │ VARCHAR(3)    │ DEFAULT 'EUR'            │
│    │ status              │ ENUM          │ DRAFT, PUBLISHED, CANCELLED│
│    │ image_url           │ VARCHAR(500)  │ NULLABLE                 │
│    │ tags                │ JSON          │ NULLABLE                 │
│    │ created_at          │ TIMESTAMP     │                          │
│    │ updated_at          │ TIMESTAMP     │                          │
└─────────────────────────────────────────────────────────────────────┘
           │
           │ 1:N (event_id)
           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          INSCRIPTIONS                                │
├─────────────────────────────────────────────────────────────────────┤
│ PK │ id              │ VARCHAR(36)  │ UUID                          │
│ FK │ event_id        │ VARCHAR(36)  │ → events.id (CASCADE)         │
│ FK │ user_id         │ VARCHAR(36)  │ → users.id (CASCADE)          │
│    │ status          │ ENUM         │ PENDING, CONFIRMED, CANCELLED │
│    │ notes           │ TEXT         │ NULLABLE                      │
│    │ created_at      │ TIMESTAMP    │                               │
│    │ updated_at      │ TIMESTAMP    │                               │
│    │                 │              │ UNIQUE(event_id, user_id)     │
└─────────────────────────────────────────────────────────────────────┘
           │
           │ 1:1 (inscription_id)
           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                            PAYMENTS                                  │
├─────────────────────────────────────────────────────────────────────┤
│ PK │ id                  │ VARCHAR(36)   │ UUID                     │
│ FK │ user_id             │ VARCHAR(36)   │ → users.id               │
│ FK │ event_id            │ VARCHAR(36)   │ → events.id              │
│ FK │ inscription_id      │ VARCHAR(36)   │ → inscriptions.id        │
│    │ amount              │ DECIMAL(10,2) │ NOT NULL                 │
│    │ currency            │ VARCHAR(3)    │ DEFAULT 'EUR'            │
│    │ provider            │ VARCHAR(50)   │ DEFAULT 'stripe'         │
│    │ provider_payment_id │ VARCHAR(255)  │ NULLABLE                 │
│    │ status              │ ENUM          │ PENDING, PAID, FAILED, REFUNDED│
│    │ refunded_at         │ DATETIME      │ NULLABLE                 │
│    │ metadata            │ JSON          │ NULLABLE                 │
│    │ created_at          │ TIMESTAMP     │                          │
│    │ updated_at          │ TIMESTAMP     │                          │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                         REFRESH_TOKENS                               │
├─────────────────────────────────────────────────────────────────────┤
│ PK │ id              │ VARCHAR(36)  │ UUID                          │
│ FK │ user_id         │ VARCHAR(36)  │ → users.id (CASCADE)          │
│    │ token_hash      │ VARCHAR(255) │ NOT NULL                      │
│    │ revoked         │ BOOLEAN      │ DEFAULT FALSE                 │
│    │ expires_at      │ DATETIME     │ NOT NULL                      │
│    │ user_agent      │ VARCHAR(500) │ NULLABLE                      │
│    │ ip_address      │ VARCHAR(45)  │ NULLABLE                      │
│    │ created_at      │ TIMESTAMP    │                               │
│    │ updated_at      │ TIMESTAMP    │                               │
└─────────────────────────────────────────────────────────────────────┘
```

### 6.2 Relations

| Relation              | Type | Description                                      |
| --------------------- | ---- | ------------------------------------------------ |
| User → Events         | 1:N  | Un utilisateur peut créer plusieurs événements   |
| User → Inscriptions   | 1:N  | Un utilisateur peut avoir plusieurs inscriptions |
| Event → Inscriptions  | 1:N  | Un événement peut avoir plusieurs inscriptions   |
| User → Payments       | 1:N  | Un utilisateur peut avoir plusieurs paiements    |
| Event → Payments      | 1:N  | Un événement peut avoir plusieurs paiements      |
| Inscription → Payment | 1:1  | Une inscription peut avoir un paiement           |
| User → RefreshTokens  | 1:N  | Un utilisateur peut avoir plusieurs tokens       |

---

## 7. API REST - Endpoints

### 7.1 Authentification

| Méthode | Endpoint                    | Description          | Auth |
| ------- | --------------------------- | -------------------- | ---- |
| POST    | `/api/auth/register`        | Inscription          | Non  |
| POST    | `/api/auth/login`           | Connexion            | Non  |
| POST    | `/api/auth/refresh`         | Rafraîchir token     | Non  |
| POST    | `/api/auth/logout`          | Déconnexion          | Non  |
| POST    | `/api/auth/logout-all`      | Déco. tous appareils | Oui  |
| GET     | `/api/auth/me`              | Utilisateur actuel   | Oui  |
| GET     | `/api/auth/verify-email`    | Vérifier email       | Non  |
| POST    | `/api/auth/forgot-password` | Mot de passe oublié  | Non  |
| POST    | `/api/auth/reset-password`  | Réinitialiser mdp    | Non  |

#### Exemple : Inscription

**Requête :**

```http
POST /api/auth/register
Content-Type: application/json

{
  "fullName": "Jean Dupont",
  "email": "jean@example.com",
  "password": "MonMotDePasse123!",
  "role": "USER"
}
```

**Réponse :**

```json
{
  "message": "Registration successful",
  "user": {
    "id": "uuid-xxx",
    "email": "jean@example.com",
    "fullName": "Jean Dupont",
    "role": "USER",
    "isVerified": false
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### 7.2 Utilisateurs

| Méthode | Endpoint                        | Description       | Auth  |
| ------- | ------------------------------- | ----------------- | ----- |
| GET     | `/api/users/me`                 | Mon profil        | Oui   |
| PATCH   | `/api/users/me`                 | Modifier profil   | Oui   |
| POST    | `/api/users/me/change-password` | Changer mdp       | Oui   |
| POST    | `/api/users/me/avatar`          | Upload avatar     | Oui   |
| GET     | `/api/users/me/inscriptions`    | Mes inscriptions  | Oui   |
| GET     | `/api/users/me/payments`        | Mes paiements     | Oui   |
| GET     | `/api/users/:id`                | Voir utilisateur  | Oui   |
| GET     | `/api/users`                    | Lister (admin)    | Admin |
| PATCH   | `/api/users/:id`                | Modifier (admin)  | Admin |
| DELETE  | `/api/users/:id`                | Supprimer (admin) | Admin |

### 7.3 Événements

| Méthode | Endpoint                    | Description         | Auth      |
| ------- | --------------------------- | ------------------- | --------- |
| GET     | `/api/events`               | Lister événements   | Non       |
| GET     | `/api/events/:id`           | Détail événement    | Non       |
| POST    | `/api/events`               | Créer événement     | Organizer |
| PATCH   | `/api/events/:id`           | Modifier événement  | Owner     |
| DELETE  | `/api/events/:id`           | Supprimer événement | Owner     |
| POST    | `/api/events/:id/publish`   | Publier             | Owner     |
| POST    | `/api/events/:id/unpublish` | Dépublier           | Owner     |
| POST    | `/api/events/:id/cancel`    | Annuler             | Owner     |
| GET     | `/api/events/my-events`     | Mes événements      | Organizer |
| POST    | `/api/events/:id/image`     | Upload image        | Owner     |

#### Paramètres de filtrage (GET /api/events)

| Paramètre | Type   | Description                              |
| --------- | ------ | ---------------------------------------- |
| page      | number | Numéro de page (défaut: 1)               |
| limit     | number | Éléments par page (défaut: 20, max: 100) |
| search    | string | Recherche textuelle                      |
| location  | string | Filtrer par lieu                         |
| minPrice  | number | Prix minimum                             |
| maxPrice  | number | Prix maximum                             |
| startDate | date   | Date de début minimum                    |
| endDate   | date   | Date de fin maximum                      |
| sortBy    | string | start_datetime, price, created_at        |
| sortOrder | string | asc, desc                                |

### 7.4 Inscriptions

| Méthode | Endpoint                       | Description        | Auth  |
| ------- | ------------------------------ | ------------------ | ----- |
| POST    | `/api/events/:id/inscriptions` | S'inscrire         | Oui   |
| GET     | `/api/events/:id/inscriptions` | Liste inscrits     | Owner |
| GET     | `/api/inscriptions/:id`        | Détail inscription | Oui   |
| PATCH   | `/api/inscriptions/:id/cancel` | Annuler            | Owner |

### 7.5 Paiements

| Méthode | Endpoint                   | Description            | Auth  |
| ------- | -------------------------- | ---------------------- | ----- |
| POST    | `/api/events/:id/payments` | Initier paiement       | Oui   |
| GET     | `/api/payments/:id/status` | Statut paiement        | Oui   |
| POST    | `/api/payments/:id/mock`   | Paiement test          | Oui   |
| POST    | `/api/payments/:id/refund` | Demander remboursement | Owner |
| POST    | `/api/payments/webhook`    | Webhook Stripe         | Non   |

### 7.6 Codes d'erreur

| Code | Signification                    |
| ---- | -------------------------------- |
| 200  | Succès                           |
| 201  | Créé avec succès                 |
| 400  | Requête invalide (validation)    |
| 401  | Non authentifié                  |
| 403  | Non autorisé (permissions)       |
| 404  | Ressource non trouvée            |
| 409  | Conflit (ex: email déjà utilisé) |
| 429  | Trop de requêtes (rate limit)    |
| 500  | Erreur serveur                   |

---

## 8. Authentification et sécurité

### 8.1 Flux d'authentification JWT

```
┌─────────────────────────────────────────────────────────────────────┐
│                        AUTHENTIFICATION JWT                          │
└─────────────────────────────────────────────────────────────────────┘

1. INSCRIPTION/CONNEXION
   ┌────────┐                              ┌────────┐
   │ Client │ ───[email, password]───────► │ Server │
   │        │                              │        │
   │        │ ◄───[accessToken,────────── │        │
   │        │      refreshToken]           │        │
   └────────┘                              └────────┘

2. REQUÊTE AUTHENTIFIÉE
   ┌────────┐                              ┌────────┐
   │ Client │ ───[Authorization: Bearer]──► │ Server │
   │        │                              │        │
   │        │ ◄───[data]───────────────── │        │
   └────────┘                              └────────┘

3. TOKEN EXPIRÉ → REFRESH
   ┌────────┐                              ┌────────┐
   │ Client │ ───[401 Unauthorized]─────── │ Server │
   │        │                              │        │
   │        │ ───[refreshToken]──────────► │        │
   │        │                              │        │
   │        │ ◄───[newAccessToken,──────── │        │
   │        │      newRefreshToken]        │        │
   └────────┘                              └────────┘
```

### 8.2 Structure des tokens

**Access Token (15 minutes)**

```json
{
  "userId": "uuid-xxx",
  "email": "user@example.com",
  "role": "USER",
  "iat": 1699123456,
  "exp": 1699124356,
  "iss": "onelastevent",
  "aud": "onelastevent-users"
}
```

**Refresh Token (30 jours)**

```json
{
  "userId": "uuid-xxx",
  "iat": 1699123456,
  "exp": 1701715456,
  "iss": "onelastevent",
  "aud": "onelastevent-users"
}
```

### 8.3 Mesures de sécurité

| Mesure                     | Description                    | Implémentation              |
| -------------------------- | ------------------------------ | --------------------------- |
| **Hachage mots de passe**  | Bcrypt avec 12 rounds          | `hash.util.js`              |
| **Tokens signés**          | HMAC-SHA256                    | `jwt.util.js`               |
| **Refresh Token Rotation** | Nouveau token à chaque refresh | `AuthService.js`            |
| **Token Blacklist**        | Tokens révoqués dans Redis     | `redis.js`                  |
| **Rate Limiting**          | 100 req/15min, 10 auth/15min   | `rateLimiter.middleware.js` |
| **Headers sécurisés**      | Helmet                         | `server.js`                 |
| **CORS**                   | Origines autorisées            | `server.js`                 |
| **Validation entrées**     | Schémas Joi                    | `validators/*.js`           |
| **Injection SQL**          | Requêtes préparées (Sequelize) | ORM                         |
| **XSS**                    | Content Security Policy        | Helmet                      |

### 8.4 Middleware d'authentification

```javascript
// Vérifie le token JWT dans le header Authorization
export async function authenticate(req, res, next) {
  // 1. Extraire le token du header
  const token = req.headers.authorization?.split(" ")[1];

  // 2. Vérifier si présent
  if (!token) return res.status(401).json({ error: "No token" });

  // 3. Vérifier si blacklisté (Redis)
  if (await isTokenBlacklisted(token)) {
    return res.status(401).json({ error: "Token revoked" });
  }

  // 4. Vérifier et décoder le token
  const decoded = verifyAccessToken(token);

  // 5. Récupérer l'utilisateur
  const user = await User.findByPk(decoded.userId);

  // 6. Attacher à la requête
  req.user = user;
  req.userId = user.id;

  next();
}
```

---

## 9. Frontend - Composants

### 9.1 Pages principales

| Page               | Route              | Description                      |
| ------------------ | ------------------ | -------------------------------- |
| Home               | `/`                | Accueil avec événements vedettes |
| Login              | `/login`           | Formulaire de connexion          |
| Register           | `/register`        | Formulaire d'inscription         |
| EventList          | `/events`          | Liste avec filtres et pagination |
| EventDetails       | `/events/:id`      | Détail d'un événement            |
| CreateEvent        | `/events/create`   | Création d'événement             |
| EditEvent          | `/events/:id/edit` | Modification d'événement         |
| DashboardUser      | `/dashboard`       | Inscriptions de l'utilisateur    |
| DashboardOrganizer | `/organizer`       | Événements de l'organisateur     |
| Profile            | `/profile`         | Paramètres du compte             |

### 9.2 Gestion de l'état

**AuthContext** - État d'authentification global

```javascript
const AuthContext = createContext({
  user: null, // Utilisateur connecté
  isAuthenticated: false,
  isOrganizer: false,
  isAdmin: false,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  updateUser: () => {},
});
```

**TanStack Query** - État serveur

```javascript
// Récupération des événements avec cache
const { data, isLoading, error } = useQuery({
  queryKey: ["events", filters],
  queryFn: () => eventsService.getEvents(filters),
});

// Mutation avec invalidation du cache
const mutation = useMutation({
  mutationFn: eventsService.createEvent,
  onSuccess: () => {
    queryClient.invalidateQueries(["events"]);
  },
});
```

### 9.3 Routes protégées

```jsx
// Composant qui protège les routes
function ProtectedRoute({ roles = [] }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;

  // Redirection si non connecté
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Vérification des rôles
  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return <Outlet />;
}

// Utilisation
<Route element={<ProtectedRoute roles={["ORGANIZER", "ADMIN"]} />}>
  <Route path="events/create" element={<CreateEvent />} />
</Route>;
```

### 9.4 Intercepteur Axios

```javascript
// Ajoute automatiquement le token aux requêtes
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Gère le refresh automatique sur 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Tenter un refresh
      const newTokens = await refreshTokens();
      // Réessayer la requête originale
      return api(originalRequest);
    }
    return Promise.reject(error);
  }
);
```

---

## 10. Docker et déploiement

### 10.1 Architecture Docker

```
┌─────────────────────────────────────────────────────────────────┐
│                     Docker Compose                               │
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   MySQL     │  │   Redis     │  │       Backend           │  │
│  │  Port 3307  │  │  Port 6380  │  │      Port 4000          │  │
│  │  (interne   │  │  (interne   │  │                         │  │
│  │   3306)     │  │   6379)     │  │  Node.js + Express      │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
│         │                │                    │                  │
│         └────────────────┼────────────────────┘                  │
│                          │                                       │
│                 onelastevent-network                             │
│                          │                                       │
│  ┌───────────────────────┴───────────────────────────────────┐  │
│  │                      Frontend                              │  │
│  │                     Port 5173                              │  │
│  │                  React + Vite                              │  │
│  └────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 10.2 Fichiers Docker

**Backend Dockerfile**

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY . .
RUN mkdir -p uploads logs
EXPOSE 4000
CMD ["npm", "start"]
```

**Frontend Dockerfile**

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
```

### 10.3 Commandes Docker

```bash
# Construire les images
docker-compose build

# Démarrer les services
docker-compose up -d

# Voir les logs
docker-compose logs -f backend

# Arrêter les services
docker-compose down

# Supprimer les volumes (reset DB)
docker-compose down -v

# Exécuter une commande dans un conteneur
docker-compose exec backend npm run seed
```

### 10.4 Déploiement production

**Checklist :**

- [ ] Changer les secrets JWT
- [ ] Configurer HTTPS (reverse proxy nginx)
- [ ] Utiliser une base de données managée
- [ ] Configurer les backups
- [ ] Mettre en place le monitoring
- [ ] Configurer les logs centralisés
- [ ] Activer le rate limiting strict

---

## 11. Tests

### 11.1 Tests Backend (Jest + Supertest)

```bash
# Lancer les tests
npm run test

# Avec couverture
npm run test -- --coverage
```

**Exemple de test :**

```javascript
describe("Auth API", () => {
  it("should login with valid credentials", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "admin@onelastevent.com",
      password: "Admin123!",
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("accessToken");
  });
});
```

### 11.2 Tests Frontend (Vitest)

```bash
# Lancer les tests
npm run test
```

---

## 12. Glossaire technique

| Terme             | Définition                                                       |
| ----------------- | ---------------------------------------------------------------- |
| **API REST**      | Interface de programmation utilisant HTTP pour CRUD              |
| **JWT**           | JSON Web Token - standard pour authentification sans état        |
| **ORM**           | Object-Relational Mapping - abstraction de la base de données    |
| **Middleware**    | Fonction intermédiaire dans le traitement d'une requête          |
| **SPA**           | Single Page Application - application web monolithique           |
| **CORS**          | Cross-Origin Resource Sharing - politique de sécurité navigateur |
| **Hash**          | Transformation irréversible (pour mots de passe)                 |
| **Salt**          | Données aléatoires ajoutées avant hachage                        |
| **Token**         | Jeton d'authentification                                         |
| **Refresh Token** | Token longue durée pour obtenir un nouvel access token           |
| **Webhook**       | Callback HTTP automatique déclenché par un événement             |
| **WebSocket**     | Connexion bidirectionnelle en temps réel                         |
| **Rate Limiting** | Limitation du nombre de requêtes                                 |
| **Conteneur**     | Environnement isolé pour exécuter une application                |
| **Volume**        | Stockage persistant Docker                                       |
| **CI/CD**         | Continuous Integration / Continuous Deployment                   |

---

## 📞 Support

Pour toute question technique, consulter :

- Les logs : `docker-compose logs -f`
- La documentation Swagger : `backend/swagger.json`
- La collection Postman : `backend/postman_collection.json`

---

_Documentation générée pour le projet OneLastEvent_
_Version 1.0 - Décembre 2024_
