# Guide de Déploiement Production - OneLastEvent

## Prérequis

- Serveur Linux (Ubuntu 20.04+ recommandé)
- Docker et Docker Compose installés
- Domaine configuré avec DNS pointant vers le serveur
- Ports 80 et 443 ouverts

## Étapes de Déploiement

### 1. Cloner le projet

```bash
git clone <repository-url>
cd event-main
```

### 2. Configurer l'environnement

```bash
# Copier le fichier d'exemple
cp .env.prod.example .env.prod

# Éditer avec vos valeurs
nano .env.prod
```

### 3. Générer les secrets JWT

```bash
# Générer JWT_ACCESS_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Générer JWT_REFRESH_SECRET (exécuter à nouveau)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copiez ces valeurs dans `.env.prod`.

### 4. Configurer le domaine

Dans `nginx/conf.d/default.conf`, remplacez `YOUR_DOMAIN.com` par votre domaine :

```bash
sed -i 's/YOUR_DOMAIN.com/votre-domaine.com/g' nginx/conf.d/default.conf
```

### 5. Déployer

```bash
# Rendre les scripts exécutables
chmod +x scripts/*.sh

# Lancer le déploiement
./scripts/deploy.sh
```

### 6. Configurer SSL (Let's Encrypt)

```bash
./scripts/init-ssl.sh votre-domaine.com admin@votre-domaine.com
```

## Vérification

```bash
# Vérifier les conteneurs
docker-compose -f docker-compose.prod.yml ps

# Voir les logs
docker-compose -f docker-compose.prod.yml logs -f

# Tester l'API
curl https://votre-domaine.com/api/health
```

## Maintenance

### Backup de la base de données

```bash
docker exec onelastevent-mysql-prod mysqldump -u root -p$DB_ROOT_PASSWORD onelastevent_prod > backup/backup_$(date +%Y%m%d).sql
```

### Mise à jour

```bash
git pull
./scripts/deploy.sh
```

### Redémarrage

```bash
docker-compose -f docker-compose.prod.yml --env-file .env.prod restart
```

### Voir les logs

```bash
# Tous les services
docker-compose -f docker-compose.prod.yml logs -f

# Service spécifique
docker-compose -f docker-compose.prod.yml logs -f backend
```

## Checklist de Sécurité

- [ ] Secrets JWT générés avec au moins 64 bytes aléatoires
- [ ] Mots de passe DB forts (16+ caractères)
- [ ] Redis protégé par mot de passe
- [ ] SSL/HTTPS activé
- [ ] Firewall configuré (ports 80, 443 uniquement)
- [ ] Backups automatisés configurés
- [ ] Monitoring en place

## Dépannage

### Le backend ne démarre pas

```bash
docker-compose -f docker-compose.prod.yml logs backend
```

Vérifiez:
- Connexion MySQL (health check)
- Connexion Redis
- Variables d'environnement

### Erreurs SSL

```bash
# Renouveler manuellement
docker-compose -f docker-compose.prod.yml run --rm certbot renew

# Vérifier les certificats
docker-compose -f docker-compose.prod.yml exec nginx nginx -t
```

### Base de données

```bash
# Se connecter à MySQL
docker exec -it onelastevent-mysql-prod mysql -u root -p

# Vérifier les tables
SHOW DATABASES;
USE onelastevent_prod;
SHOW TABLES;
```
