# Documentation Technique — Épreuve E5 BTS SIO SLAM
## Projet : OneLastEvent — Plateforme de gestion d'événements

---

## Sommaire

1. [Présentation du projet](#1-présentation-du-projet)
2. [Contexte et objectifs](#2-contexte-et-objectifs)
3. [Architecture générale](#3-architecture-générale)
4. [Stack technique](#4-stack-technique)
5. [Modèle de données](#5-modèle-de-données)
6. [API REST — Endpoints](#6-api-rest--endpoints)
7. [Authentification et sécurité](#7-authentification-et-sécurité)
8. [Composants frontend](#8-composants-frontend)
9. [Tests](#9-tests)
10. [Déploiement et infrastructure](#10-déploiement-et-infrastructure)
11. [Annexes](#11-annexes)

---

## 1. Présentation du projet

**Nom du projet :** OneLastEvent  
**Type :** Application web full-stack de gestion d'événements  
**Rôle développé :** Développeur full-stack (backend Node.js + frontend React)

### Description fonctionnelle

OneLastEvent est une plateforme permettant à des organisateurs de créer et publier des événements (gratuits ou payants), et à des utilisateurs de s'y inscrire. Elle intègre un système d'authentification par rôles, des paiements en ligne via Stripe, et des notifications en temps réel.

### Fonctionnalités principales

| Fonctionnalité | Description |
|---|---|
| Inscription / Connexion | Création de compte, connexion sécurisée JWT |
| Gestion des rôles | 3 rôles : USER, ORGANIZER, ADMIN |
| Création d'événements | CRUD complet avec upload d'image |
| Inscription aux événements | Réservation de place, gestion des capacités |
| Paiements | Intégration Stripe + mode mock pour les tests |
| Notifications temps réel | WebSocket via Socket.io |
| Tableau de bord | Vues différenciées par rôle utilisateur |

---

## 2. Contexte et objectifs

### Contexte

Ce projet a été réalisé dans le cadre d'une mise en situation professionnelle simulant une demande client pour une startup événementielle. L'objectif était de concevoir et développer une application web complète, déployable en production via Docker.

### Objectifs techniques

- Mettre en œuvre une architecture REST n-tiers (client / serveur / base de données)
- Implémenter une authentification sécurisée avec rotation des tokens JWT
- Appliquer le contrôle d'accès basé sur les rôles (RBAC)
- Intégrer un système de paiement (Stripe)
- Conteneuriser l'application avec Docker et Docker Compose
- Écrire des tests automatisés (Jest / Vitest)

---

## 3. Architecture générale

### Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────────┐
│                        NAVIGATEUR CLIENT                        │
│                    React 18 + Vite + Tailwind                   │
│              http://localhost:3000  (dev)                        │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP REST / WebSocket
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                       SERVEUR BACKEND                           │
│                   Node.js 18 + Express 4                        │
│              http://localhost:4000/api  (dev)                    │
│                                                                  │
│  Routes → Middlewares → Controllers → Services → Repositories   │
└──────────────┬────────────────────────────────────┬────────────┘
               │ Sequelize ORM                       │ ioredis
               ▼                                     ▼
┌──────────────────────────┐           ┌─────────────────────────┐
│     MySQL 8.x            │           │      Redis              │
│   Base de données        │           │   Cache / Tokens        │
│   principale             │           │   blacklistés           │
└──────────────────────────┘           └─────────────────────────┘
```

### Architecture en couches (backend)

```
backend/src/
├── routes/          → Déclaration des endpoints HTTP
├── middlewares/     → JWT, rôles, validation, rate limiting
├── controllers/     → Couche HTTP (req/res, appel aux services)
├── services/        → Logique métier (règles applicatives)
├── repositories/    → Accès aux données (Sequelize)
├── models/          → Définition des entités BDD
└── validators/      → Schémas de validation Joi
```

Cette architecture en couches garantit une **séparation des responsabilités** et facilite la maintenance et les tests unitaires.

### Structure des dossiers

```
event-main/
├── backend/
│   ├── src/
│   │   ├── config/          → db.js, redis.js, logger.js
│   │   ├── controllers/     → Auth, Event, User, Inscription, Payment
│   │   ├── middlewares/     → auth, role, validate, error, rateLimiter, upload
│   │   ├── models/          → User, Event, Inscription, Payment, RefreshToken
│   │   ├── repositories/    → UserRepository, EventRepository, ...
│   │   ├── routes/          → auth, users, events, inscriptions, payments
│   │   ├── services/        → AuthService, EventService, ...
│   │   ├── validators/      → Schémas Joi par ressource
│   │   ├── utils/           → jwt.util.js, hash.util.js, email.util.js
│   │   ├── __tests__/       → auth.test.js, events.test.js
│   │   └── server.js        → Point d'entrée Express + Socket.io
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      → Layout, Header, EventCard, Modal, ...
│   │   ├── pages/           → Home, Login, Register, EventList, ...
│   │   ├── context/         → AuthContext.jsx
│   │   ├── services/        → api.js (Axios), events.js, users.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml
├── docker-compose.prod.yml
└── nginx/
```

---

## 4. Stack technique

### Backend

| Composant | Technologie | Version | Rôle |
|---|---|---|---|
| Runtime | Node.js | ≥ 18.0 | Exécution JavaScript serveur |
| Framework | Express | 4.18.2 | Routage HTTP, middlewares |
| ORM | Sequelize | 6.35.2 | Abstraction base de données |
| Base de données | MySQL | 8.x | Stockage relationnel |
| Cache | Redis (ioredis) | 5.3.2 | Tokens blacklistés, sessions |
| Authentification | jsonwebtoken | 9.0.2 | Génération / vérification JWT |
| Hachage | bcryptjs | 2.4.3 | Chiffrement des mots de passe |
| Validation | Joi | 17.11.0 | Validation des entrées |
| WebSocket | Socket.io | 4.7.2 | Notifications temps réel |
| Paiement | Stripe | 14.10.0 | Traitement des paiements |
| Logging | Winston | 3.11.0 | Journalisation applicative |
| Sécurité | Helmet | 7.1.0 | En-têtes HTTP sécurisés |
| Upload | Multer | 1.4.5 | Upload de fichiers |
| Rate limiting | express-rate-limit | 7.1.5 | Protection contre le brute-force |
| Tests | Jest + Supertest | — | Tests d'intégration API |

### Frontend

| Composant | Technologie | Version | Rôle |
|---|---|---|---|
| Librairie UI | React | 18.2.0 | Interfaces utilisateur |
| Build tool | Vite | 5.0.12 | Bundler, serveur dev |
| Routage | React Router | 6.21.3 | Navigation SPA |
| État global | Context API + TanStack Query | 5.17.19 | Gestion état / cache données |
| Client HTTP | Axios | 1.6.5 | Requêtes REST + interceptors |
| Styles | Tailwind CSS | 3.4.1 | Utility-first CSS |
| UI | Headless UI + Heroicons | 1.7.18 / 2.1.1 | Composants accessibles |
| WebSocket | Socket.io-client | 4.7.4 | Écoute des notifications |
| Notifications | react-hot-toast | 2.4.1 | Toasts utilisateur |
| Dates | date-fns | 3.3.1 | Formatage des dates |
| Tests | Vitest + Testing Library | 1.2.2 | Tests composants |

### Infrastructure / DevOps

| Composant | Technologie | Rôle |
|---|---|---|
| Conteneurs | Docker | Isolation des services |
| Orchestration | Docker Compose | Environnements dev/prod |
| Reverse proxy | Nginx | Routage HTTP en production |
| CI/CD | GitHub Actions | Automatisation des builds |

---

## 5. Modèle de données

### Diagramme de relations (ERD simplifié)

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│    users     │       │    events    │       │ inscriptions │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id (PK)      │1    N │ id (PK)      │1    N │ id (PK)      │
│ email        ├──────►│ organizer_id │◄──────┤ event_id(FK) │
│ password_hash│       │ title        │       │ user_id (FK) │
│ full_name    │       │ description  │       │ status       │
│ role         │       │ location     │       │ notes        │
│ bio          │       │ start_date   │       └──────┬───────┘
│ avatar_url   │       │ capacity     │              │
│ is_verified  │       │ price        │              │1
└──────┬───────┘       │ status       │       ┌──────▼───────┐
       │               │ image_url    │       │   payments   │
       │1              └──────────────┘       ├──────────────┤
       │                                      │ id (PK)      │
       │                                      │ user_id (FK) │
       ├──────────────────────────────────────► event_id(FK) │
       │                                      │ inscription  │
       │1                                     │ amount       │
┌──────▼───────┐                              │ status       │
│refresh_tokens│                              │ provider     │
├──────────────┤                              └──────────────┘
│ id (PK)      │
│ user_id (FK) │
│ token_hash   │
│ revoked      │
│ expires_at   │
└──────────────┘
```

### Détail des tables

#### Table `users`
| Colonne | Type | Contrainte | Description |
|---|---|---|---|
| id | UUID | PK | Identifiant unique |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Adresse email |
| password_hash | VARCHAR(255) | NOT NULL | Mot de passe bcrypt |
| full_name | VARCHAR(255) | NOT NULL | Nom complet |
| role | ENUM | DEFAULT 'USER' | USER / ORGANIZER / ADMIN |
| bio | TEXT | NULL | Biographie |
| avatar_url | VARCHAR(500) | NULL | URL de l'avatar |
| is_verified | BOOLEAN | DEFAULT false | Email vérifié |
| verification_token | VARCHAR(255) | NULL | Token de vérification |
| reset_password_token | VARCHAR(255) | NULL | Token de réinitialisation |
| reset_password_expires | DATE | NULL | Expiration du token reset |
| created_at | DATE | NOT NULL | Horodatage création |
| updated_at | DATE | NOT NULL | Horodatage modification |

#### Table `events`
| Colonne | Type | Contrainte | Description |
|---|---|---|---|
| id | UUID | PK | Identifiant unique |
| organizer_id | UUID | FK → users | Organisateur |
| title | VARCHAR(255) | NOT NULL | Titre de l'événement |
| description | TEXT | NULL | Description |
| location | VARCHAR(500) | NULL | Lieu |
| start_datetime | DATE | NOT NULL | Date/heure de début |
| end_datetime | DATE | NULL | Date/heure de fin |
| capacity | INTEGER | DEFAULT 100 | Capacité maximale |
| current_participants | INTEGER | DEFAULT 0 | Inscrits actuels |
| price | DECIMAL(10,2) | DEFAULT 0.00 | Prix (0 = gratuit) |
| currency | VARCHAR(3) | DEFAULT 'EUR' | Devise |
| status | ENUM | DEFAULT 'DRAFT' | DRAFT / PUBLISHED / CANCELLED |
| image_url | VARCHAR(500) | NULL | URL de l'image |
| tags | JSON | NULL | Tags (tableau) |

#### Table `inscriptions`
| Colonne | Type | Contrainte | Description |
|---|---|---|---|
| id | UUID | PK | Identifiant unique |
| event_id | UUID | FK → events | Événement concerné |
| user_id | UUID | FK → users | Utilisateur inscrit |
| status | ENUM | DEFAULT 'PENDING' | PENDING / CONFIRMED / CANCELLED |
| notes | TEXT | NULL | Notes |
| *UNIQUE* | | (event_id, user_id) | Un utilisateur ne peut s'inscrire qu'une fois par événement |

#### Table `payments`
| Colonne | Type | Contrainte | Description |
|---|---|---|---|
| id | UUID | PK | Identifiant unique |
| user_id | UUID | FK → users | Payeur |
| event_id | UUID | FK → events | Événement payé |
| inscription_id | UUID | FK → inscriptions | Inscription liée |
| amount | DECIMAL(10,2) | NOT NULL | Montant |
| currency | VARCHAR(3) | DEFAULT 'EUR' | Devise |
| provider | VARCHAR(50) | DEFAULT 'stripe' | Prestataire de paiement |
| provider_payment_id | VARCHAR(255) | NULL | ID transaction Stripe |
| status | ENUM | DEFAULT 'PENDING' | PENDING / PAID / FAILED / REFUNDED |
| refunded_at | DATE | NULL | Date du remboursement |
| metadata | JSON | NULL | Métadonnées additionnelles |

#### Table `refresh_tokens`
| Colonne | Type | Contrainte | Description |
|---|---|---|---|
| id | UUID | PK | Identifiant unique |
| user_id | UUID | FK → users (CASCADE) | Propriétaire du token |
| token_hash | VARCHAR(255) | NOT NULL | SHA-256 du refresh token |
| revoked | BOOLEAN | DEFAULT false | Token révoqué |
| expires_at | DATE | NOT NULL | Date d'expiration |
| user_agent | VARCHAR(500) | NULL | Agent utilisateur |
| ip_address | VARCHAR(45) | NULL | IP du client |

---

## 6. API REST — Endpoints

### URL de base
- **Développement :** `http://localhost:4000/api`
- **Production :** `https://[domaine]/api`

### Authentification (`/api/auth`)

| Méthode | Endpoint | Accès | Description |
|---|---|---|---|
| POST | `/register` | Public | Création de compte |
| POST | `/login` | Public | Connexion utilisateur |
| POST | `/refresh` | Public | Renouvellement du token |
| POST | `/logout` | Privé | Déconnexion |
| POST | `/logout-all` | Privé | Déconnexion tous appareils |
| GET | `/verify-email` | Public | Vérification email |
| POST | `/forgot-password` | Public | Demande réinitialisation |
| POST | `/reset-password` | Public | Réinitialisation mot de passe |
| GET | `/me` | Privé | Utilisateur connecté |

**Exemple — POST `/api/auth/login`**

Requête :
```json
{
  "email": "user@example.com",
  "password": "MotDePasse123!"
}
```

Réponse (200 OK) :
```json
{
  "user": {
    "id": "uuid-...",
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "USER"
  },
  "accessToken": "eyJhbGci...",
  "refreshToken": "eyJhbGci..."
}
```

### Événements (`/api/events`)

| Méthode | Endpoint | Accès | Rôle requis | Description |
|---|---|---|---|---|
| GET | `/` | Optionnel | — | Liste paginée + filtres |
| GET | `/:id` | Optionnel | — | Détail d'un événement |
| GET | `/my-events` | Privé | ORGANIZER | Mes événements |
| POST | `/` | Privé | ORGANIZER | Créer un événement |
| PATCH | `/:id` | Privé | Propriétaire | Modifier un événement |
| DELETE | `/:id` | Privé | Propriétaire | Supprimer |
| POST | `/:id/publish` | Privé | Propriétaire | Publier |
| POST | `/:id/cancel` | Privé | Propriétaire | Annuler |
| POST | `/:id/inscriptions` | Privé | USER | S'inscrire |
| GET | `/:id/inscriptions` | Privé | Propriétaire | Liste des inscrits |
| POST | `/:id/image` | Privé | Propriétaire | Upload image |

**Paramètres de filtre pour GET `/api/events`**

| Paramètre | Type | Description |
|---|---|---|
| page | Integer | Numéro de page (défaut : 1) |
| limit | Integer | Résultats par page (défaut : 20) |
| status | String | DRAFT / PUBLISHED / CANCELLED |
| search | String | Recherche dans titre/description |
| location | String | Filtre par lieu |
| minPrice | Float | Prix minimum |
| maxPrice | Float | Prix maximum |
| startDate | ISO Date | Date de début minimum |
| sortBy | String | title / startDatetime / price |
| sortOrder | String | ASC / DESC |

### Utilisateurs (`/api/users`)

| Méthode | Endpoint | Accès | Rôle | Description |
|---|---|---|---|---|
| GET | `/me` | Privé | Tous | Mon profil |
| PATCH | `/me` | Privé | Tous | Modifier mon profil |
| POST | `/me/change-password` | Privé | Tous | Changer mon mot de passe |
| POST | `/me/avatar` | Privé | Tous | Upload avatar |
| GET | `/me/inscriptions` | Privé | Tous | Mes inscriptions |
| GET | `/me/payments` | Privé | Tous | Mes paiements |
| GET | `/` | Privé | ADMIN | Liste tous les utilisateurs |
| DELETE | `/:id` | Privé | ADMIN | Supprimer un utilisateur |

### Inscriptions (`/api/inscriptions`)

| Méthode | Endpoint | Accès | Description |
|---|---|---|---|
| GET | `/:id` | Privé | Détail d'une inscription |
| PATCH | `/:id/cancel` | Privé | Annuler son inscription |

### Paiements (`/api/payments`)

| Méthode | Endpoint | Accès | Description |
|---|---|---|---|
| POST | `/webhook` | Public | Webhook Stripe |
| GET | `/:id/status` | Privé | Statut d'un paiement |
| POST | `/:id/mock` | Privé | Paiement simulé (tests) |
| POST | `/:id/refund` | Privé | Demande de remboursement |

---

## 7. Authentification et sécurité

### Stratégie JWT double token

L'application utilise un système à **deux tokens** avec rotation automatique :

```
┌─────────────┐   Login    ┌─────────────────────────────┐
│   Client    │──────────►│          Backend             │
│             │◄──────────│  accessToken  (15 min)       │
│             │            │  refreshToken (30 jours)     │
└─────────────┘            └─────────────────────────────┘
       │
       │  Requête + Authorization: Bearer <accessToken>
       ▼
  Accès autorisé jusqu'à expiration

       │  accessToken expiré → POST /api/auth/refresh
       │  refreshToken → nouveau accessToken + nouveau refreshToken
       ▼
  Ancien refreshToken révoqué (rotation)
```

| Token | Secret | Durée | Stockage côté client |
|---|---|---|---|
| Access Token | JWT_ACCESS_SECRET | 15 minutes | localStorage |
| Refresh Token | JWT_REFRESH_SECRET | 30 jours | localStorage |

**Payload Access Token :**
```json
{ "userId": "uuid", "email": "...", "role": "USER" }
```

### Flux d'authentification

#### Inscription
1. Validation Joi (email, mot de passe fort, nom)
2. Hachage du mot de passe avec bcrypt (10 rounds)
3. Création de l'utilisateur (`is_verified: false`)
4. Génération de la paire de tokens
5. Envoi de l'email de vérification

#### Connexion
1. Récupération de l'utilisateur par email
2. Comparaison bcrypt (`compare(password, hash)`)
3. Génération de la paire de tokens
4. Stockage du refresh token (haché) en Redis + BDD
5. Retour de l'utilisateur + tokens

#### Déconnexion
1. Révocation du refresh token (suppression Redis, marquage BDD)
2. Blacklist de l'access token dans Redis (TTL = durée restante)
3. Toute requête avec ce token → rejetée (401)

### Contrôle d'accès par rôles (RBAC)

```
ADMIN ──────────────────────────── Accès total
  │
ORGANIZER ──────────────────────── Créer/gérer des événements + droits USER
  │
USER ────────────────────────────── S'inscrire aux événements
```

**Middlewares de rôles :**

| Middleware | Condition d'accès |
|---|---|
| `requireAdmin` | Rôle = ADMIN uniquement |
| `requireOrganizer` | Rôle = ORGANIZER ou ADMIN |
| `requireOwnerOrAdmin` | Propriétaire de la ressource ou ADMIN |
| `requireVerified` | Email vérifié (`is_verified = true`) |

### Sécurité des mots de passe

**Règles de validation :**
- Minimum 8 caractères
- Maximum 128 caractères
- Au moins : 1 majuscule, 1 minuscule, 1 chiffre, 1 caractère spécial (`!@#$%^&*`)

**Stockage :** bcrypt avec 10 rounds de sel (hachage irréversible)

### Mesures de sécurité complémentaires

| Mesure | Implémentation | Objectif |
|---|---|---|
| En-têtes sécurisés | Helmet.js | XSS, Clickjacking, HSTS |
| CORS | Liste blanche d'origines | Limiter les domaines autorisés |
| Rate limiting | express-rate-limit | Protection brute-force |
| Validation des entrées | Joi | Injection, données malformées |
| Requêtes paramétrées | Sequelize ORM | Injection SQL |
| Blacklist de tokens | Redis TTL | Invalidation des tokens actifs |

**Niveaux de rate limiting :**

| Endpoint | Limite | Fenêtre |
|---|---|---|
| Par défaut | 100 requêtes | 15 minutes |
| `/auth/login`, `/auth/register` | 10 requêtes | 15 minutes |
| `/auth/forgot-password` | 3 requêtes | 1 heure |
| Création d'événement | 20 requêtes | 1 heure |

---

## 8. Composants frontend

### Architecture React

```
src/
├── App.jsx               → Routage principal (lazy loading)
├── context/
│   └── AuthContext.jsx   → État global d'authentification
├── services/
│   ├── api.js            → Instance Axios + interceptors
│   ├── events.js         → Appels API événements
│   ├── users.js          → Appels API utilisateurs
│   └── payments.js       → Appels API paiements
├── components/           → Composants réutilisables
└── pages/                → Vues par fonctionnalité
```

### AuthContext — Gestion de l'état global

Le contexte `AuthContext` centralise l'état d'authentification dans toute l'application :

**État exposé :**
| Variable | Type | Description |
|---|---|---|
| `user` | Object / null | Utilisateur connecté |
| `loading` | Boolean | Vérification initiale en cours |
| `isAuthenticated` | Boolean | Statut de connexion |
| `isOrganizer` | Boolean | Rôle organisateur |
| `isAdmin` | Boolean | Rôle administrateur |

**Méthodes exposées :**
| Méthode | Description |
|---|---|
| `login(email, password)` | Authentification |
| `register(userData)` | Création de compte |
| `logout()` | Déconnexion + nettoyage |
| `updateUser(updates)` | Mise à jour locale du profil |

### Service API — Interceptors Axios

```javascript
// Interceptor de requête : injecte le token
request → ajoute "Authorization: Bearer <accessToken>"

// Interceptor de réponse : gestion du renouvellement
réponse 401 → tente POST /api/auth/refresh
            → si succès : met à jour les tokens + rejoue la requête originale
            → si échec  : redirige vers /login
```

### Pages principales

| Page | Route | Rôle | Description |
|---|---|---|---|
| Home | `/` | Public | Page d'accueil avec événements mis en avant |
| Login | `/login` | Public | Formulaire de connexion |
| Register | `/register` | Public | Formulaire d'inscription |
| EventList | `/events` | Public | Liste paginée avec filtres |
| EventDetails | `/events/:id` | Public | Détail + bouton inscription |
| CreateEvent | `/events/create` | ORGANIZER | Formulaire de création |
| EditEvent | `/events/:id/edit` | ORGANIZER | Formulaire de modification |
| DashboardUser | `/dashboard` | USER | Mes inscriptions et paiements |
| DashboardOrganizer | `/organizer` | ORGANIZER | Gestion de mes événements |
| Profile | `/profile` | Privé | Profil + avatar + mot de passe |

### Composants réutilisables

| Composant | Description |
|---|---|
| `Layout` | Enveloppe Header + contenu + Footer |
| `Header` | Navigation avec état de connexion |
| `EventCard` | Carte de prévisualisation d'événement |
| `Modal` | Fenêtre modale générique |
| `Pagination` | Navigation entre les pages de résultats |
| `LoadingSpinner` | Indicateur de chargement |
| `ProtectedRoute` | Garde de route avec vérification rôle |

### Protection des routes

```jsx
// Redirige vers /login si non authentifié
<ProtectedRoute>
  <Profile />
</ProtectedRoute>

// Redirige si rôle insuffisant
<ProtectedRoute requiredRole="ORGANIZER">
  <CreateEvent />
</ProtectedRoute>
```

---

## 9. Tests

### Backend — Tests d'intégration (Jest + Supertest)

**Fichiers de tests :**
- `backend/src/__tests__/auth.test.js`
- `backend/src/__tests__/events.test.js`

**Cas de tests couverts :**

#### auth.test.js
| Test | Scénario | Résultat attendu |
|---|---|---|
| POST /register | Données valides | 201 + tokens retournés |
| POST /register | Email déjà existant | 409 Conflict |
| POST /register | Mot de passe faible | 422 Unprocessable |
| POST /login | Identifiants corrects | 200 + user + tokens |
| POST /login | Mauvais mot de passe | 401 Unauthorized |
| POST /login | Email inexistant | 401 Unauthorized |
| POST /refresh | Token valide | 200 + nouveaux tokens |
| GET /me | Token valide | 200 + profil utilisateur |
| GET /me | Sans token | 401 Unauthorized |

#### events.test.js
| Test | Scénario | Résultat attendu |
|---|---|---|
| GET /events | Requête sans filtre | 200 + liste paginée |
| GET /events | Filtre par recherche | 200 + résultats filtrés |
| GET /events/:id | ID valide | 200 + détail événement |
| GET /events/:id | ID inexistant | 404 Not Found |
| POST /events | En tant qu'organisateur | 201 + événement créé |
| POST /events | En tant qu'utilisateur | 403 Forbidden |
| PATCH /events/:id | Propriétaire de l'événement | 200 + modifié |
| PATCH /events/:id | Autre utilisateur | 403 Forbidden |
| POST /events/:id/inscriptions | Événement disponible | 201 Créé |

**Configuration Jest (`jest.config.js`) :**
```javascript
testEnvironment: 'node'
testMatch: ['**/__tests__/**/*.js']
collectCoverageFrom: ['src/**/*.js']
```

**Commande :**
```bash
cd backend && npm test
cd backend && npm run test:coverage
```

### Frontend — Tests unitaires (Vitest + Testing Library)

**Framework :** Vitest avec environnement jsdom  
**Bibliothèques :** @testing-library/react, @testing-library/jest-dom

**Commande :**
```bash
cd frontend && npm test
```

---

## 10. Déploiement et infrastructure

### Environnement de développement

**Prérequis :**
- Node.js ≥ 18
- Docker & Docker Compose
- MySQL 8.x (ou via Docker)
- Redis (ou via Docker)

**Démarrage rapide (Docker) :**
```bash
# Lancer tous les services
docker-compose up -d

# Initialiser la base de données
docker-compose exec backend npm run migrate

# Insérer les données de test
docker-compose exec backend npm run seed
```

**Démarrage manuel :**
```bash
# Backend
cd backend
cp .env.example .env    # Configurer les variables
npm install
npm run migrate
npm run seed
npm run dev             # Nodemon, port 4000

# Frontend (autre terminal)
cd frontend
npm install
npm run dev             # Vite, port 3000
```

### Comptes de test (après seed)

| Rôle | Email | Mot de passe |
|---|---|---|
| Admin | admin@test.com | MotDePasse123! |
| Organisateur | organizer1@example.com | Organizer1! |
| Utilisateur | user@test.com | MotDePasse123! |

### Configuration Docker Compose (développement)

```yaml
Services :
  mysql:8.0    → Port 3307:3306  (base de données)
  redis        → Port 6379:6379  (cache)
  backend      → Port 4000:4000  (API Express)
  frontend     → Port 3000:3000  (React/Vite)

Réseau : onelastevent-network (bridge)
Volumes : mysql_data, redis_data (persistance)
```

### Variables d'environnement principales

```env
NODE_ENV=development
PORT=4000
FRONTEND_URL=http://localhost:3000

# Base de données
DB_HOST=mysql
DB_PORT=3306
DB_USER=appuser
DB_PASS=...
DB_NAME=eventdb

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# JWT
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
JWT_ACCESS_EXP=15m
JWT_REFRESH_EXP=30d

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Déploiement en production

```bash
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
```

**Checklist production :**
- [ ] Secrets JWT générés aléatoirement (≥ 64 octets)
- [ ] `NODE_ENV=production`
- [ ] CORS configuré avec le domaine de production
- [ ] HTTPS activé (certificat SSL)
- [ ] Clés Stripe de production renseignées
- [ ] Sauvegardes automatiques de la BDD
- [ ] Monitoring applicatif configuré

---

## 11. Annexes

### Annexe A — Flux de paiement

```
Utilisateur         Frontend              Backend               Stripe
    │                   │                    │                     │
    │── Inscription ──►│                    │                     │
    │                   │── POST /payments ─►│                     │
    │                   │                    │── Créer PaymentIntent►│
    │                   │                    │◄── client_secret ───│
    │                   │◄── client_secret ──│                     │
    │◄── Formulaire ────│                    │                     │
    │── Données carte ─►│                    │                     │
    │                   │──────────────────────────── Confirmer ──►│
    │                   │                    │◄── Webhook paid ────│
    │                   │                    │── MAJ inscription ──│
    │◄── Confirmation ──│                    │                     │
```

### Annexe B — Flux WebSocket (notifications temps réel)

```javascript
// Connexion frontend
const socket = io('http://localhost:4000');
socket.emit('join:user', userId);       // Rejoint la salle utilisateur
socket.emit('join:event', eventId);     // Rejoint la salle événement

// Écoute des événements
socket.on('inscription:confirmed', (data) => { /* mise à jour UI */ });
socket.on('event:cancelled', (data) => { /* alerte utilisateur */ });
```

### Annexe C — Schéma de validation (exemple Joi)

```javascript
// Création d'événement
const createEventSchema = Joi.object({
  title:          Joi.string().min(3).max(255).required(),
  description:    Joi.string().max(5000).optional(),
  location:       Joi.string().max(500).optional(),
  startDatetime:  Joi.date().iso().greater('now').required(),
  endDatetime:    Joi.date().iso().greater(Joi.ref('startDatetime')).optional(),
  capacity:       Joi.number().integer().min(1).max(100000).required(),
  price:          Joi.number().min(0).precision(2).optional(),
  currency:       Joi.string().length(3).uppercase().optional(),
  tags:           Joi.array().items(Joi.string()).max(10).optional(),
});
```

### Annexe D — Documentation API (Swagger)

La documentation interactive de l'API est disponible à :  
`http://localhost:4000/api/docs` (développement)

Le fichier de spécification OpenAPI 3.0 est disponible dans :  
`backend/swagger.json`

### Annexe E — Commandes utiles

```bash
# Backend
npm run dev          # Démarrage développement (nodemon)
npm start            # Démarrage production
npm test             # Lancer les tests
npm run test:coverage # Tests + rapport de couverture
npm run migrate      # Créer/mettre à jour les tables BDD
npm run seed         # Insérer les données de test

# Frontend
npm run dev          # Serveur de développement Vite
npm run build        # Build de production
npm run preview      # Prévisualiser le build
npm test             # Tests Vitest

# Docker
docker-compose up -d              # Lancer les services
docker-compose down               # Arrêter les services
docker-compose logs -f backend    # Logs du backend
docker-compose exec backend sh    # Shell dans le conteneur
```

---

*Documentation rédigée pour l'épreuve E5 — BTS SIO SLAM*  
*Projet : OneLastEvent | Candidat : Nyainssaaf | Date : Avril 2026*
