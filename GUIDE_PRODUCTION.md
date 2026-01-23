# Guide de Production - OneLastEvent

## Introduction

Ce document explique toutes les modifications apportées au projet pour le rendre **prêt pour la production**. Il est destiné aux étudiants qui souhaitent comprendre les bonnes pratiques de déploiement d'une application web moderne.

---

## Table des Matières

1. [Pourquoi ces changements ?](#1-pourquoi-ces-changements-)
2. [Les problèmes identifiés](#2-les-problèmes-identifiés)
3. [Les corrections apportées](#3-les-corrections-apportées)
4. [Architecture de production](#4-architecture-de-production)
5. [Sécurité en détail](#5-sécurité-en-détail)
6. [Guide de déploiement pas à pas](#6-guide-de-déploiement-pas-à-pas)
7. [Commandes utiles](#7-commandes-utiles)
8. [FAQ et Dépannage](#8-faq-et-dépannage)

---

## 1. Pourquoi ces changements ?

### Différence entre Développement et Production

| Aspect | Développement | Production |
|--------|---------------|------------|
| **Objectif** | Rapidité de développement | Sécurité et performance |
| **Erreurs** | Affichées en détail | Masquées (logs seulement) |
| **Base de données** | Peut être réinitialisée | Données critiques à protéger |
| **Secrets** | Valeurs de test acceptables | Secrets forts obligatoires |
| **HTTPS** | Optionnel (localhost) | Obligatoire |
| **Performance** | Non prioritaire | Optimisée |

### Les risques d'un déploiement non sécurisé

```
⚠️ RISQUES MAJEURS:
├── Vol de données utilisateurs (mots de passe, emails)
├── Injection SQL (destruction de la base de données)
├── Usurpation d'identité (vol de sessions)
├── Attaques DDoS (surcharge du serveur)
└── Perte financière et réputation
```

---

## 2. Les problèmes identifiés

### 2.1 Mot de passe exposé dans le code

**Fichier problématique:** `backend/.env`

```bash
# ❌ AVANT (DANGEREUX!)
DB_PASSWORD=nyainssaf    # Mot de passe réel visible!
```

**Pourquoi c'est grave ?**
- Si ce fichier est commité sur GitHub, tout le monde peut voir le mot de passe
- Des bots scannent GitHub pour trouver des secrets exposés
- Votre base de données peut être piratée en quelques minutes

---

### 2.2 Secrets JWT faibles

**Fichier problématique:** `docker-compose.yml`

```yaml
# ❌ AVANT (DANGEREUX!)
JWT_ACCESS_SECRET: ${JWT_ACCESS_SECRET:-your_access_secret_change_in_production}
```

**Pourquoi c'est grave ?**
- Un secret JWT faible peut être deviné ou "bruteforcé"
- Un attaquant peut alors créer de faux tokens d'authentification
- Il peut se connecter en tant que n'importe quel utilisateur, y compris admin

**Comment un JWT fonctionne:**

```
┌─────────────────────────────────────────────────────────────┐
│                        JWT Token                            │
├─────────────────┬─────────────────┬─────────────────────────┤
│     Header      │     Payload     │       Signature         │
│  (algorithme)   │  (données user) │  (preuve d'authenticité)│
└─────────────────┴─────────────────┴─────────────────────────┘
                                              │
                                              ▼
                              Créée avec le SECRET_KEY
                              Si le secret est faible,
                              la signature peut être forgée!
```

---

### 2.3 Tests ignorés dans le CI/CD

**Fichier problématique:** `.github/workflows/ci.yml`

```yaml
# ❌ AVANT (DANGEREUX!)
run: npm run lint || true    # Ignore les erreurs!
run: npm test || true        # Ignore les échecs de tests!
```

**Pourquoi c'est grave ?**
- Du code cassé peut être déployé en production
- Des bugs de sécurité ne sont pas détectés
- L'équipe perd confiance dans les tests

---

### 2.4 Port MySQL incorrect

**Fichier problématique:** `docker-compose.yml`

```yaml
# ❌ AVANT (ERREUR!)
ports:
  - "${DB_PORT:-3307}:3307"   # Le port interne MySQL est 3306, pas 3307!
```

---

### 2.5 Synchronisation automatique de la DB en production

**Fichier problématique:** `backend/src/server.js`

```javascript
// ❌ AVANT (DANGEREUX!)
await syncDatabase({ alter: true });  // Modifie automatiquement les tables!
```

**Pourquoi c'est grave ?**
- `alter: true` modifie la structure des tables automatiquement
- En production, cela peut supprimer des colonnes avec des données
- Vous pouvez perdre des données utilisateurs définitivement

---

### 2.6 Pas de HTTPS

**Problème:** Aucune configuration SSL/TLS

**Pourquoi c'est grave ?**
- Les données circulent en clair sur Internet
- Les mots de passe peuvent être interceptés (attaque "Man-in-the-Middle")
- Google pénalise les sites sans HTTPS dans le référencement
- Les navigateurs affichent "Non sécurisé"

```
Sans HTTPS:
┌────────┐         ┌─────────────┐         ┌────────┐
│  User  │ ──────▶ │  Attaquant  │ ──────▶ │ Server │
└────────┘  HTTP   │  (lit tout) │  HTTP   └────────┘
            clair  └─────────────┘  clair

Avec HTTPS:
┌────────┐                                  ┌────────┐
│  User  │ ════════════════════════════════▶│ Server │
└────────┘     HTTPS (chiffré, illisible)   └────────┘
```

---

### 2.7 Redis sans mot de passe

**Problème:** Redis accessible sans authentification

```yaml
# ❌ AVANT
redis:
  image: redis:alpine
  # Pas de mot de passe!
```

**Pourquoi c'est grave ?**
- Redis stocke les tokens de session
- Un attaquant peut voler ou supprimer toutes les sessions
- Il peut déconnecter tous les utilisateurs

---

## 3. Les corrections apportées

### 3.1 Nouveau fichier `.env.example`

**Chemin:** `backend/.env.example`

```bash
# ✅ APRÈS (SÉCURISÉ)
# Template avec instructions, sans vraies valeurs
JWT_ACCESS_SECRET=GENERER_SECRET_64_BYTES_MINIMUM
JWT_REFRESH_SECRET=GENERER_AUTRE_SECRET_64_BYTES_MINIMUM
```

**Ce qui a changé:**
- Fichier template avec des placeholders
- Instructions pour générer des secrets forts
- Commentaires explicatifs pour chaque variable

---

### 3.2 Docker Compose corrigé

**Chemin:** `docker-compose.yml`

```yaml
# ✅ APRÈS (SÉCURISÉ)
mysql:
  ports:
    - "${DB_PORT:-3306}:3306"  # Port corrigé

redis:
  command: redis-server --requirepass ${REDIS_PASSWORD:-redis_dev_password}

backend:
  environment:
    JWT_ACCESS_SECRET: ${JWT_ACCESS_SECRET:?JWT_ACCESS_SECRET is required}
    #                                     ↑
    #                    Le "?" rend la variable OBLIGATOIRE
    #                    Docker refuse de démarrer sans cette valeur
```

**Syntaxe des variables Docker:**
```yaml
${VAR:-default}   # Utilise "default" si VAR n'existe pas
${VAR:?message}   # ERREUR si VAR n'existe pas (obligatoire)
${VAR:+value}     # Utilise "value" seulement si VAR existe
```

---

### 3.3 CI/CD corrigé

**Chemin:** `.github/workflows/ci.yml`

```yaml
# ✅ APRÈS (SÉCURISÉ)
- name: Run linting
  run: npm run lint          # Sans "|| true" = bloquant!

- name: Run tests
  run: npm test              # Les tests DOIVENT passer

- name: Security Audit       # Nouveau job de sécurité
  run: npm audit --audit-level=high
```

**Nouveau flux CI/CD:**

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Lint      │───▶│   Tests     │───▶│   Build     │───▶│   Deploy    │
│  (qualité)  │    │  (logique)  │    │  (docker)   │    │ (prod)      │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
      │                  │                  │                  │
      ▼                  ▼                  ▼                  ▼
   Échec?             Échec?            Échec?            Succès!
   STOP ❌            STOP ❌           STOP ❌
```

---

### 3.4 Synchronisation DB sécurisée

**Chemin:** `backend/src/server.js`

```javascript
// ✅ APRÈS (SÉCURISÉ)
const syncOptions = process.env.NODE_ENV === 'development'
  ? { alter: true }      // OK en dev
  : { alter: false };    // JAMAIS en prod!

if (process.env.NODE_ENV === 'production') {
  logger.info('Production mode: Database sync disabled. Use migrations.');
}
```

**Bonne pratique - Utiliser les migrations:**

```
Développement:                    Production:
┌────────────────┐               ┌────────────────┐
│ alter: true    │               │ alter: false   │
│ (auto-sync)    │               │ (migrations)   │
└────────────────┘               └────────────────┘
        │                                │
        ▼                                ▼
   Rapide mais                    Contrôlé et
   dangereux                      réversible
```

---

### 3.5 Configuration Nginx avec HTTPS

**Chemin:** `nginx/conf.d/default.conf`

```nginx
# ✅ APRÈS (SÉCURISÉ)

# Redirection HTTP → HTTPS
server {
    listen 80;
    location / {
        return 301 https://$host$request_uri;
    }
}

# Serveur HTTPS
server {
    listen 443 ssl http2;

    # Certificats Let's Encrypt
    ssl_certificate /etc/letsencrypt/live/DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/DOMAIN/privkey.pem;

    # Headers de sécurité
    add_header X-Frame-Options "SAMEORIGIN";           # Empêche le clickjacking
    add_header X-Content-Type-Options "nosniff";       # Empêche le MIME sniffing
    add_header X-XSS-Protection "1; mode=block";       # Protection XSS

    # Rate limiting
    limit_req zone=api_limit burst=20 nodelay;         # Max 10 req/sec
}
```

**Architecture avec Nginx:**

```
                    Internet
                        │
                        ▼
              ┌─────────────────┐
              │     Nginx       │ ← SSL/HTTPS terminaison
              │  (port 80/443)  │ ← Rate limiting
              └────────┬────────┘ ← Load balancing possible
                       │
         ┌─────────────┼─────────────┐
         ▼             ▼             ▼
    ┌─────────┐  ┌─────────┐  ┌─────────┐
    │ Backend │  │Frontend │  │ Static  │
    │  :4000  │  │  :3000  │  │ /uploads│
    └─────────┘  └─────────┘  └─────────┘
```

---

### 3.6 Docker Compose Production

**Chemin:** `docker-compose.prod.yml`

**Différences avec la version développement:**

| Aspect | docker-compose.yml | docker-compose.prod.yml |
|--------|-------------------|------------------------|
| Restart | `unless-stopped` | `always` |
| Secrets | Valeurs par défaut | Obligatoires (`:?`) |
| Ressources | Non limitées | Limites mémoire |
| Healthchecks | Basiques | Complets avec retry |
| Redis | Sans persistance | `appendonly yes` |
| Nginx | Non inclus | Inclus + SSL |
| Certbot | Non inclus | Inclus (renouvellement auto) |

---

## 4. Architecture de production

### Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────────────┐
│                         SERVEUR DE PRODUCTION                        │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    Docker Network (isolé)                    │    │
│  │                                                              │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │    │
│  │  │  Nginx   │  │ Backend  │  │ Frontend │  │ Certbot  │    │    │
│  │  │ :80/:443 │  │  :4000   │  │   :80    │  │ (SSL)    │    │    │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────────┘    │    │
│  │       │              │              │                        │    │
│  │       │         ┌────┴────┐         │                        │    │
│  │       │         │         │         │                        │    │
│  │       │    ┌────┴───┐ ┌───┴────┐    │                        │    │
│  │       │    │ MySQL  │ │ Redis  │    │                        │    │
│  │       │    │ :3306  │ │ :6379  │    │                        │    │
│  │       │    └────────┘ └────────┘    │                        │    │
│  │       │         │           │       │                        │    │
│  │       │    ┌────┴───────────┴────┐  │                        │    │
│  │       │    │   Volumes Docker    │  │                        │    │
│  │       │    │  (données persist.) │  │                        │    │
│  │       │    └─────────────────────┘  │                        │    │
│  └───────┼─────────────────────────────┼────────────────────────┘    │
│          │                             │                             │
└──────────┼─────────────────────────────┼─────────────────────────────┘
           │                             │
           ▼                             ▼
      Port 80/443                   Réseau interne
      (Internet)                    (non accessible)
```

### Flux d'une requête

```
1. L'utilisateur tape https://votre-site.com/api/events

2. DNS résout vers l'IP du serveur

3. Nginx reçoit la requête sur le port 443
   ├── Vérifie le certificat SSL
   ├── Applique le rate limiting
   └── Route vers le bon service

4. Backend reçoit /api/events
   ├── Vérifie l'authentification (JWT)
   ├── Valide les paramètres (Joi)
   ├── Interroge MySQL via Sequelize
   └── Retourne la réponse JSON

5. Nginx renvoie la réponse au client
```

---

## 5. Sécurité en détail

### 5.1 Les couches de sécurité

```
┌─────────────────────────────────────────────────────────────┐
│                    COUCHES DE SÉCURITÉ                      │
├─────────────────────────────────────────────────────────────┤
│ 1. RÉSEAU                                                   │
│    └── Firewall (ports 80/443 uniquement)                  │
│    └── HTTPS obligatoire                                   │
│    └── Rate limiting Nginx                                 │
├─────────────────────────────────────────────────────────────┤
│ 2. APPLICATION                                              │
│    └── Helmet.js (headers sécurité)                        │
│    └── CORS configuré                                      │
│    └── Rate limiting Express                               │
│    └── Validation Joi                                      │
├─────────────────────────────────────────────────────────────┤
│ 3. AUTHENTIFICATION                                         │
│    └── JWT avec secrets forts                              │
│    └── Refresh token rotation                              │
│    └── Token blacklist (Redis)                             │
│    └── Mots de passe hashés (bcrypt, 12 rounds)           │
├─────────────────────────────────────────────────────────────┤
│ 4. DONNÉES                                                  │
│    └── Requêtes préparées (anti SQL injection)             │
│    └── Chiffrement au repos (optionnel)                    │
│    └── Backups réguliers                                   │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Génération de secrets forts

```bash
# Méthode 1: Node.js (recommandé)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Résultat exemple (128 caractères hexadécimaux):
# a3f2b8c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2...

# Méthode 2: OpenSSL
openssl rand -hex 64

# Méthode 3: /dev/urandom (Linux)
head -c 64 /dev/urandom | xxd -p | tr -d '\n'
```

**Longueur recommandée des secrets:**

| Type | Minimum | Recommandé |
|------|---------|------------|
| JWT Secret | 32 bytes | 64 bytes |
| Mot de passe DB | 16 caractères | 32 caractères |
| Mot de passe Redis | 16 caractères | 32 caractères |

### 5.3 Hashage des mots de passe

```javascript
// Comment bcrypt fonctionne:

const password = "MonMotDePasse123!";

// 1. Génère un "salt" aléatoire
const salt = "$2a$12$LQv3c1yqBWVHxkd0LHAkCO";
//                 ↑
//              12 rounds (2^12 = 4096 itérations)

// 2. Hash le mot de passe avec le salt
const hash = "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4LXqVRqHNGdY3S2e";
//           └──────────────────────────────────────────────────────────┘
//                              Stocké en base de données

// 3. Pour vérifier: bcrypt refait le calcul et compare
bcrypt.compare("MonMotDePasse123!", hash) // → true
bcrypt.compare("MauvaisPassword", hash)   // → false
```

---

## 6. Guide de déploiement pas à pas

### Étape 1: Préparer le serveur

```bash
# Mettre à jour le système
sudo apt update && sudo apt upgrade -y

# Installer Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Installer Docker Compose
sudo apt install docker-compose-plugin -y

# Ajouter l'utilisateur au groupe docker
sudo usermod -aG docker $USER
```

### Étape 2: Cloner le projet

```bash
# Cloner le repository
git clone <url-du-repo> onelastevent
cd onelastevent
```

### Étape 3: Configurer l'environnement

```bash
# Copier le template
cp .env.prod.example .env.prod

# Éditer le fichier
nano .env.prod
```

**Remplir les valeurs:**

```bash
# .env.prod

# 1. Domaine
FRONTEND_URL=https://monsite.com
VITE_API_URL=https://monsite.com/api

# 2. Base de données (générer des mots de passe forts!)
DB_ROOT_PASSWORD=MotDePasseRoot_TresLong_32Chars!
DB_PASS=MotDePasseUser_TresLong_32Chars!

# 3. Redis
REDIS_PASSWORD=MotDePasseRedis_TresLong_32Chars!

# 4. JWT (utiliser la commande node pour générer)
JWT_ACCESS_SECRET=<résultat de la commande node>
JWT_REFRESH_SECRET=<autre résultat de la commande node>

# 5. Stripe (optionnel, pour les paiements)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Étape 4: Configurer le domaine

```bash
# Remplacer YOUR_DOMAIN.com par votre domaine
sed -i 's/YOUR_DOMAIN.com/monsite.com/g' nginx/conf.d/default.conf
```

### Étape 5: Déployer

```bash
# Rendre les scripts exécutables
chmod +x scripts/*.sh

# Lancer le déploiement
./scripts/deploy.sh
```

### Étape 6: Configurer SSL

```bash
# Obtenir un certificat Let's Encrypt
./scripts/init-ssl.sh monsite.com admin@monsite.com
```

### Étape 7: Vérifier

```bash
# Vérifier que tout fonctionne
curl https://monsite.com/api/health

# Voir les logs
docker-compose -f docker-compose.prod.yml logs -f
```

---

## 7. Commandes utiles

### Gestion des conteneurs

```bash
# Voir l'état des conteneurs
docker-compose -f docker-compose.prod.yml ps

# Démarrer tous les services
docker-compose -f docker-compose.prod.yml up -d

# Arrêter tous les services
docker-compose -f docker-compose.prod.yml down

# Redémarrer un service
docker-compose -f docker-compose.prod.yml restart backend

# Voir les logs en temps réel
docker-compose -f docker-compose.prod.yml logs -f

# Voir les logs d'un service spécifique
docker-compose -f docker-compose.prod.yml logs -f backend
```

### Base de données

```bash
# Se connecter à MySQL
docker exec -it onelastevent-mysql-prod mysql -u root -p

# Faire un backup
docker exec onelastevent-mysql-prod mysqldump -u root -p onelastevent_prod > backup.sql

# Restaurer un backup
docker exec -i onelastevent-mysql-prod mysql -u root -p onelastevent_prod < backup.sql
```

### Redis

```bash
# Se connecter à Redis
docker exec -it onelastevent-redis-prod redis-cli -a $REDIS_PASSWORD

# Voir les clés
KEYS *

# Vider le cache (attention!)
FLUSHALL
```

### Mise à jour

```bash
# Récupérer les dernières modifications
git pull

# Reconstruire et redéployer
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
```

---

## 8. FAQ et Dépannage

### Q: Le backend ne démarre pas

**Vérifier les logs:**
```bash
docker-compose -f docker-compose.prod.yml logs backend
```

**Causes fréquentes:**
- MySQL pas encore prêt → Attendre ou redémarrer
- Variable d'environnement manquante → Vérifier `.env.prod`
- Port déjà utilisé → `lsof -i :4000`

### Q: Erreur "JWT_ACCESS_SECRET is required"

**Solution:**
```bash
# Vérifier que .env.prod existe et contient la variable
cat .env.prod | grep JWT_ACCESS_SECRET

# Si vide, générer un secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Q: Le SSL ne fonctionne pas

**Vérifier:**
```bash
# Les certificats existent ?
ls -la certbot/conf/live/

# Nginx peut lire les certificats ?
docker-compose -f docker-compose.prod.yml exec nginx nginx -t

# Renouveler manuellement
docker-compose -f docker-compose.prod.yml run --rm certbot renew
```

### Q: "Connection refused" vers MySQL

**Solution:**
```bash
# Vérifier que MySQL est démarré
docker-compose -f docker-compose.prod.yml ps mysql

# Vérifier les logs
docker-compose -f docker-compose.prod.yml logs mysql

# Vérifier le healthcheck
docker inspect onelastevent-mysql-prod | grep -A 10 Health
```

### Q: Comment voir les erreurs de l'application ?

```bash
# Logs du backend
docker-compose -f docker-compose.prod.yml logs -f backend

# Ou dans les fichiers de logs
docker exec onelastevent-backend-prod cat /app/logs/error.log
```

---

## Checklist finale de production

Avant de mettre en ligne, vérifiez :

- [ ] **Secrets**
  - [ ] JWT_ACCESS_SECRET généré (64+ bytes)
  - [ ] JWT_REFRESH_SECRET généré (64+ bytes)
  - [ ] Mot de passe MySQL fort (16+ chars)
  - [ ] Mot de passe Redis fort (16+ chars)

- [ ] **Configuration**
  - [ ] NODE_ENV=production
  - [ ] FRONTEND_URL configuré avec HTTPS
  - [ ] Domaine dans nginx configuré

- [ ] **Sécurité**
  - [ ] HTTPS activé (certificat SSL)
  - [ ] Firewall configuré (80, 443)
  - [ ] .env.prod NON commité dans git

- [ ] **Monitoring**
  - [ ] Logs accessibles
  - [ ] Healthchecks fonctionnels
  - [ ] Alertes configurées (optionnel)

- [ ] **Backup**
  - [ ] Backup DB automatique configuré
  - [ ] Procédure de restauration testée

---

## Ressources supplémentaires

- [Documentation Docker](https://docs.docker.com/)
- [Documentation Nginx](https://nginx.org/en/docs/)
- [Let's Encrypt](https://letsencrypt.org/docs/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

---

**Auteur:** Équipe OneLastEvent
**Dernière mise à jour:** Janvier 2026
**Version:** 1.0.0
