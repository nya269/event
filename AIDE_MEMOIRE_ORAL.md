# 🎤 Aide-Mémoire pour l'Oral - OneLastEvent

## 🎯 PHRASE D'ACCROCHE

> "OneLastEvent est une plateforme web de gestion d'événements développée avec une architecture moderne séparant le frontend React du backend Node.js, avec une base de données MySQL et une authentification JWT sécurisée."

---

## 1️⃣ PRÉSENTATION RAPIDE (30 secondes)

**Le projet :**
- Plateforme de création et gestion d'événements
- 3 rôles : Utilisateur, Organisateur, Admin
- Fonctionnalités : inscription, paiement, temps réel

**L'architecture :**
- Frontend : React (interface utilisateur)
- Backend : Node.js/Express (API)
- Base de données : MySQL (données) + Redis (cache)
- Conteneurisation : Docker

---

## 2️⃣ LES TECHNOLOGIES À RETENIR

### Frontend (Ce que l'utilisateur voit)

| Techno | À dire |
|--------|--------|
| **React** | "Bibliothèque JavaScript pour créer des interfaces avec des composants réutilisables" |
| **Vite** | "Outil de build moderne, plus rapide que Create React App" |
| **Tailwind CSS** | "Framework CSS utilitaire qui permet de styliser rapidement avec des classes" |
| **React Router** | "Gestion des routes pour naviguer entre les pages sans recharger" |
| **Axios** | "Client HTTP pour faire des appels à l'API backend" |

### Backend (La logique serveur)

| Techno | À dire |
|--------|--------|
| **Node.js** | "Runtime qui permet d'exécuter du JavaScript côté serveur" |
| **Express** | "Framework web minimaliste pour créer des API REST" |
| **Sequelize** | "ORM qui permet d'interagir avec MySQL sans écrire de SQL brut" |
| **JWT** | "JSON Web Tokens pour l'authentification sans état côté serveur" |
| **bcrypt** | "Librairie pour hasher les mots de passe de manière sécurisée" |
| **Joi** | "Validation des données entrantes pour sécuriser l'API" |

### Base de données

| Techno | À dire |
|--------|--------|
| **MySQL** | "Base de données relationnelle pour stocker les données de manière structurée" |
| **Redis** | "Base de données en mémoire utilisée comme cache pour les tokens" |

### DevOps

| Techno | À dire |
|--------|--------|
| **Docker** | "Permet de conteneuriser l'application pour qu'elle fonctionne partout pareil" |
| **Docker Compose** | "Orchestrateur qui lance plusieurs conteneurs en même temps" |

---

## 3️⃣ ARCHITECTURE - SCHÉMA SIMPLE

```
UTILISATEUR (navigateur)
       │
       ▼
┌─────────────────┐
│    FRONTEND     │  ← React + Vite + Tailwind
│  (localhost:5173)│
└────────┬────────┘
         │ Appels API (HTTP)
         ▼
┌─────────────────┐
│    BACKEND      │  ← Node.js + Express
│  (localhost:4000)│
└────────┬────────┘
         │ Requêtes SQL
         ▼
┌─────────────────┐
│    MYSQL        │  ← Données persistantes
│    REDIS        │  ← Cache tokens
└─────────────────┘
```

---

## 4️⃣ PATTERN MVC + REPOSITORY

**À dire :** "On utilise une architecture en couches qui sépare les responsabilités"

```
REQUÊTE → ROUTE → CONTROLLER → SERVICE → REPOSITORY → BASE DE DONNÉES

- Routes      : Définit les URLs de l'API
- Controller  : Reçoit la requête et renvoie la réponse
- Service     : Contient la logique métier
- Repository  : Accède aux données
```

**Exemple concret :** "Quand un utilisateur crée un événement, la requête passe par la route POST /events, le controller extrait les données, le service vérifie les règles métier, et le repository insère dans MySQL"

---

## 5️⃣ AUTHENTIFICATION JWT

**À dire :** "On utilise JWT pour l'authentification, ce qui permet d'avoir un système stateless"

```
1. L'utilisateur se connecte avec email/password
2. Le serveur vérifie et génère 2 tokens :
   - Access Token (15 min) : pour les requêtes
   - Refresh Token (30 jours) : pour renouveler l'access token
3. Le frontend stocke les tokens
4. Chaque requête envoie l'access token dans le header
5. Si l'access token expire, on utilise le refresh token pour en obtenir un nouveau
```

**Pourquoi 2 tokens ?** "L'access token est court pour limiter les risques si volé. Le refresh token permet de ne pas se reconnecter tous les 15 minutes."

---

## 6️⃣ SÉCURITÉ

**Points clés à mentionner :**

| Mesure | Explication simple |
|--------|---------------------|
| **Hachage bcrypt** | "Les mots de passe ne sont jamais stockés en clair, on stocke un hash irréversible" |
| **JWT signé** | "Les tokens sont signés avec une clé secrète pour éviter la falsification" |
| **Rate Limiting** | "On limite le nombre de requêtes pour éviter les attaques par force brute" |
| **Validation Joi** | "Toutes les données entrantes sont validées avant traitement" |
| **CORS** | "On contrôle quelles origines peuvent appeler notre API" |
| **Helmet** | "On ajoute des headers HTTP de sécurité" |

---

## 7️⃣ BASE DE DONNÉES - LES TABLES

**5 tables principales :**

| Table | Contenu |
|-------|---------|
| **users** | Comptes utilisateurs (email, password hashé, rôle) |
| **events** | Événements (titre, description, date, prix, capacité) |
| **inscriptions** | Qui s'inscrit à quel événement |
| **payments** | Historique des paiements |
| **refresh_tokens** | Tokens de rafraîchissement |

**Relations :**
- Un utilisateur peut créer plusieurs événements (1-N)
- Un utilisateur peut s'inscrire à plusieurs événements (N-N via inscriptions)
- Une inscription peut avoir un paiement (1-1)

---

## 8️⃣ DOCKER - À RETENIR

**À dire :** "Docker permet d'isoler chaque service dans un conteneur, ce qui garantit que l'application fonctionne de la même façon sur tous les environnements"

**Nos conteneurs :**
1. **mysql** - Base de données
2. **redis** - Cache
3. **backend** - API Node.js
4. **frontend** - Application React

**Commande magique :** `docker-compose up -d` lance tout !

---

## 9️⃣ QUESTIONS POSSIBLES ET RÉPONSES

### "Pourquoi React ?"
> "React est une bibliothèque populaire qui permet de créer des interfaces utilisateur avec des composants réutilisables. Son système de virtual DOM optimise les performances en ne mettant à jour que ce qui change."

### "Pourquoi Node.js ?"
> "Node.js permet d'utiliser JavaScript côté serveur, ce qui unifie le langage frontend/backend. Il est performant pour les applications I/O intensives grâce à son modèle non-bloquant."

### "Pourquoi MySQL plutôt que MongoDB ?"
> "MySQL est une base relationnelle adaptée quand on a des relations bien définies entre les données, comme ici entre utilisateurs, événements et inscriptions. MongoDB serait plus adapté pour des données non structurées."

### "Comment fonctionne JWT ?"
> "JWT est un token signé contenant des informations utilisateur. Le serveur le signe avec une clé secrète. À chaque requête, le client l'envoie et le serveur vérifie la signature sans avoir besoin de stocker de session."

### "Pourquoi Docker ?"
> "Docker garantit que l'application fonctionne identiquement partout. On définit l'environnement dans des fichiers, et n'importe qui peut lancer le projet avec une seule commande."

### "Comment gérez-vous la sécurité ?"
> "On a plusieurs couches : hachage bcrypt pour les mots de passe, tokens JWT signés, validation des entrées avec Joi, rate limiting contre le bruteforce, headers sécurisés avec Helmet, et CORS pour contrôler les origines."

### "Qu'est-ce qu'un ORM ?"
> "Un ORM (Object-Relational Mapping) comme Sequelize permet de manipuler la base de données avec des objets JavaScript au lieu d'écrire du SQL. Ça simplifie le code et protège contre les injections SQL."

### "C'est quoi une API REST ?"
> "REST est un style d'architecture qui utilise les méthodes HTTP (GET, POST, PUT, DELETE) pour manipuler des ressources. Chaque URL représente une ressource, et les méthodes définissent l'action."

---

## 🔟 DÉMONSTRATION SUGGÉRÉE

1. **Montrer la page d'accueil** - "Voici l'interface React avec Tailwind"
2. **Créer un compte** - "L'inscription valide les données et crée un compte"
3. **Se connecter** - "On reçoit les tokens JWT"
4. **Créer un événement** - "En tant qu'organisateur, je peux créer un événement"
5. **S'inscrire** - "Les utilisateurs peuvent s'inscrire"
6. **Montrer Docker** - "Tout tourne dans des conteneurs isolés"

---

## ⚠️ PIÈGES À ÉVITER

❌ Ne pas dire "ça marche tout seul" - Expliquer pourquoi
❌ Ne pas inventer si on ne sait pas - Dire "je vais vérifier"
❌ Ne pas réciter par cœur - Comprendre pour reformuler
❌ Ne pas surcharger de détails techniques - Rester clair

---

## ✅ BONNES PRATIQUES

✅ Commencer par le contexte général avant les détails
✅ Utiliser des schémas pour expliquer l'architecture
✅ Donner des exemples concrets
✅ Montrer qu'on comprend les choix techniques
✅ Rester calme et parler lentement

---

## 📝 MÉMO FINAL - LES MOTS CLÉS

```
Frontend: React, Vite, Tailwind, SPA, Composants
Backend: Node.js, Express, API REST, Middleware
Auth: JWT, bcrypt, Access Token, Refresh Token
DB: MySQL, Sequelize, ORM, Relations
Cache: Redis, Tokens, Sessions
Sécu: Hachage, Validation, CORS, Rate Limiting
DevOps: Docker, Conteneurs, docker-compose
Archi: MVC, Repository, Couches, Séparation des responsabilités
```

---

**Bonne chance pour ton oral ! 🚀**

