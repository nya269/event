#!/bin/bash
# ===========================================
# Script d'initialisation SSL avec Let's Encrypt
# ===========================================
# Usage: ./scripts/init-ssl.sh votre-domaine.com email@exemple.com

set -e

if [ -z "$1" ] || [ -z "$2" ]; then
    echo "Usage: $0 <domain> <email>"
    echo "Example: $0 example.com admin@example.com"
    exit 1
fi

DOMAIN=$1
EMAIL=$2

echo "=== Initialisation SSL pour $DOMAIN ==="

# Créer les répertoires nécessaires
mkdir -p certbot/conf
mkdir -p certbot/www

# Mettre à jour la configuration Nginx avec le domaine
sed -i "s/YOUR_DOMAIN.com/$DOMAIN/g" nginx/conf.d/default.conf

echo "=== Configuration Nginx mise à jour ==="

# Créer une configuration temporaire pour le challenge ACME
cat > nginx/conf.d/temp.conf << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 200 'Waiting for SSL setup...';
        add_header Content-Type text/plain;
    }
}
EOF

echo "=== Démarrage de Nginx temporaire ==="
docker-compose -f docker-compose.prod.yml up -d nginx

echo "=== Attente du démarrage de Nginx ==="
sleep 5

echo "=== Obtention du certificat SSL ==="
docker-compose -f docker-compose.prod.yml run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    -d $DOMAIN \
    -d www.$DOMAIN

echo "=== Suppression de la configuration temporaire ==="
rm nginx/conf.d/temp.conf

echo "=== Redémarrage de Nginx avec SSL ==="
docker-compose -f docker-compose.prod.yml restart nginx

echo "=== SSL initialisé avec succès! ==="
echo "Votre site est maintenant accessible sur https://$DOMAIN"
