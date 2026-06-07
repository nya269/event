# Guide de démarrage — EventSAid / OneLastEvent

Ce guide couvre le lancement local des trois parties du projet : **Backend**, **Frontend Web** et **Application Mobile (MyEvenciaApp)**.

---

## Prérequis

| Outil | Version minimale |
|---|---|
| Node.js | 18+ |
| npm | 9+ |
| MySQL | 8+ |
| Redis | 6+ |
| Expo CLI | `npm install -g expo-cli` |
| Expo Go (mobile) | Installé sur iOS ou Android |

---

## 1. Backend

### Installation

```bash
cd backend
npm install
```

### Configuration de l'environnement

Copier le fichier exemple et remplir les valeurs :

```bash
cp src/env.example .env
```

Variables importantes dans `.env` :

```env
PORT=4000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=onelastevent_db
DB_USER=root
DB_PASS=ton_mot_de_passe

REDIS_HOST=localhost
REDIS_PORT=6379

JWT_SECRET=une_cle_secrete
JWT_REFRESH_SECRET=une_autre_cle_secrete
```

### Initialisation de la base de données

```bash
# Créer la base dans MySQL
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS onelastevent_db;"

# Lancer les migrations
npm run migrate

# (Optionnel) Peupler avec des données de test
npm run seed
```

### Démarrage

```bash
# Mode développement (rechargement automatique)
npm run dev

# Mode production
npm start
```

L'API est accessible sur : `http://localhost:4000/api`

---

## 2. Frontend Web

### Installation

```bash
cd frontend
npm install
```

### Configuration de l'environnement

Créer un fichier `.env` à la racine du dossier `frontend/` :

```env
VITE_API_URL=http://localhost:4000/api
```

> Le proxy Vite redirige automatiquement `/api` vers `http://localhost:4000`, donc cette variable est optionnelle en développement.

### Démarrage

```bash
# Mode développement
npm run dev
```

L'application est accessible sur : `http://localhost:3000`

### Build de production

```bash
npm run build
npm run preview
```

---

## 3. Application Mobile (MyEvenciaApp)

### Installation

```bash
cd MyEvenciaApp
npm install
```

### Configuration de l'URL de l'API

Ouvrir [MyEvenciaApp/src/api/client.js](MyEvenciaApp/src/api/client.js) et remplacer l'adresse IP par celle de ta machine sur le réseau local :

```js
const apiClient = axios.create({
  baseURL: 'http://<TON_IP_LOCAL>:4000/api',  // ex: 192.168.1.100:4000/api
  ...
});
```

Pour trouver ton IP locale :
- **macOS/Linux** : `ifconfig | grep "inet " | grep -v 127.0.0.1`
- **Windows** : `ipconfig`

> Le téléphone et l'ordinateur doivent être sur le **même réseau Wi-Fi**.

### Démarrage

```bash
# Lancer Expo (affiche un QR code)
npm start

# Ou directement sur simulateur
npm run ios       # Simulateur iOS (macOS uniquement)
npm run android   # Émulateur Android
```

Scanner le QR code avec l'application **Expo Go** sur votre téléphone.

---

## Démarrage complet (ordre recommandé)

```
1. Démarrer MySQL et Redis
2. cd backend && npm run dev
3. cd frontend && npm run dev
4. cd MyEvenciaApp && npm start
```

---

## Commandes utiles

### Backend

```bash
npm run dev          # Serveur en mode watch
npm run test         # Tests Jest avec couverture
npm run lint         # Vérification ESLint
npm run seed         # Injecter des données de test
```

### Frontend

```bash
npm run dev          # Serveur Vite dev
npm run test         # Tests Vitest
npm run build        # Build production
```

### Mobile

```bash
npm start            # Expo avec QR code
npm run android      # Émulateur Android
npm run ios          # Simulateur iOS
npm run lint         # ESLint
```

---

## Ports par défaut

| Service | Port |
|---|---|
| Backend API | `4000` |
| Frontend Web | `3000` |
| MySQL | `3306` |
| Redis | `6379` |

---

## Dépannage rapide

**Backend ne démarre pas**
- Vérifier que MySQL et Redis sont lancés
- Vérifier les valeurs dans `.env`
- Exécuter `npm run migrate` si la base est vide

**Frontend affiche des erreurs 404 sur `/api`**
- S'assurer que le backend tourne sur le port `4000`
- Le proxy Vite est configuré dans `vite.config.js`

**L'app mobile ne se connecte pas à l'API**
- Vérifier que l'IP dans `src/api/client.js` est correcte
- Vérifier que le téléphone et l'ordi sont sur le même Wi-Fi
- Désactiver temporairement le pare-feu si nécessaire
