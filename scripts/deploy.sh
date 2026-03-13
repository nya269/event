#!/bin/bash
# ===========================================
# Script de Déploiement Production
# OneLastEvent
# ===========================================

set -e

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}===========================================
 OneLastEvent - Déploiement Production
===========================================${NC}"

# Vérifier que .env.prod existe
if [ ! -f ".env.prod" ]; then
    echo -e "${RED}ERREUR: Le fichier .env.prod n'existe pas!${NC}"
    echo "1. Copiez .env.prod.example vers .env.prod"
    echo "2. Remplissez toutes les valeurs"
    echo "3. Relancez ce script"
    exit 1
fi

# Vérifier les variables requises
echo -e "${YELLOW}Vérification des variables d'environnement...${NC}"
source .env.prod

REQUIRED_VARS=(
    "DB_ROOT_PASSWORD"
    "DB_PASS"
    "REDIS_PASSWORD"
    "JWT_ACCESS_SECRET"
    "JWT_REFRESH_SECRET"
    "FRONTEND_URL"
)

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        echo -e "${RED}ERREUR: La variable $var n'est pas définie dans .env.prod${NC}"
        exit 1
    fi
done

# Vérifier que les secrets JWT sont assez longs
if [ ${#JWT_ACCESS_SECRET} -lt 32 ]; then
    echo -e "${RED}ERREUR: JWT_ACCESS_SECRET doit avoir au moins 32 caractères${NC}"
    exit 1
fi

if [ ${#JWT_REFRESH_SECRET} -lt 32 ]; then
    echo -e "${RED}ERREUR: JWT_REFRESH_SECRET doit avoir au moins 32 caractères${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Variables d'environnement OK${NC}"

# Créer les répertoires nécessaires
echo -e "${YELLOW}Création des répertoires...${NC}"
mkdir -p backend/uploads
mkdir -p backend/logs
mkdir -p certbot/conf
mkdir -p certbot/www
mkdir -p mysql-backup

echo -e "${GREEN}✓ Répertoires créés${NC}"

# Arrêter les conteneurs existants
echo -e "${YELLOW}Arrêt des conteneurs existants...${NC}"
docker-compose -f docker-compose.prod.yml --env-file .env.prod down || true

# Construire les images
echo -e "${YELLOW}Construction des images Docker...${NC}"
docker-compose -f docker-compose.prod.yml --env-file .env.prod build --no-cache

# Démarrer les services
echo -e "${YELLOW}Démarrage des services...${NC}"
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d

# Attendre que les services soient prêts
echo -e "${YELLOW}Attente du démarrage des services...${NC}"
sleep 30

# Vérifier la santé des services
echo -e "${YELLOW}Vérification de la santé des services...${NC}"

check_health() {
    local service=$1
    local status=$(docker inspect --format='{{.State.Health.Status}}' onelastevent-$service-prod 2>/dev/null || echo "unknown")
    if [ "$status" = "healthy" ]; then
        echo -e "${GREEN}✓ $service: healthy${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠ $service: $status${NC}"
        return 1
    fi
}

check_health "mysql" || true
check_health "redis" || true
check_health "backend" || true

# Afficher les logs récents
echo -e "${YELLOW}Logs récents du backend:${NC}"
docker-compose -f docker-compose.prod.yml --env-file .env.prod logs --tail=20 backend

echo -e "${GREEN}===========================================
 Déploiement terminé!
===========================================${NC}"
echo ""
echo "Prochaines étapes:"
echo "1. Configurez votre domaine DNS vers ce serveur"
echo "2. Exécutez: ./scripts/init-ssl.sh votre-domaine.com email@exemple.com"
echo "3. Vérifiez: https://votre-domaine.com"
echo ""
echo "Commandes utiles:"
echo "  - Logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "  - Status: docker-compose -f docker-compose.prod.yml ps"
echo "  - Arrêt: docker-compose -f docker-compose.prod.yml down"
