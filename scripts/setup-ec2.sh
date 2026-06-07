#!/bin/bash
# ===========================================
# Setup EC2 Free Tier - OneLastEvent
# Ubuntu 22.04 - t2.micro
# ===========================================
# Lancer UNE SEULE FOIS après connexion SSH :
#   chmod +x setup-ec2.sh && ./setup-ec2.sh
# ===========================================

set -e

echo "================================================"
echo "  OneLastEvent - Setup EC2 Free Tier"
echo "================================================"

# --- 1. Swap file (ESSENTIEL pour t2.micro 1GB) ---
echo "[1/6] Configuration du swap (2GB)..."
if [ ! -f /swapfile ]; then
    sudo fallocate -l 2G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    echo "vm.swappiness=10" | sudo tee -a /etc/sysctl.conf
    sudo sysctl -p
    echo "  Swap 2GB activé."
else
    echo "  Swap déjà configuré."
fi

# --- 2. Mise à jour système ---
echo "[2/6] Mise à jour du système..."
sudo apt-get update -qq
sudo apt-get upgrade -y -qq

# --- 3. Installation Docker ---
echo "[3/6] Installation de Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    echo "  Docker installé."
else
    echo "  Docker déjà installé."
fi

# --- 4. Installation Docker Compose ---
echo "[4/6] Installation de Docker Compose..."
if ! command -v docker compose &> /dev/null; then
    sudo apt-get install -y -qq docker-compose-plugin
    echo "  Docker Compose installé."
else
    echo "  Docker Compose déjà installé."
fi

# --- 5. Installation Git ---
echo "[5/6] Installation de Git..."
sudo apt-get install -y -qq git

# --- 6. Cloner le projet ---
echo "[6/6] Clonage du projet..."
if [ ! -d "event-main" ]; then
    git clone https://github.com/nya269/event.git event-main
    echo "  Projet cloné."
else
    cd event-main && git pull && cd ..
    echo "  Projet mis à jour."
fi

echo ""
echo "================================================"
echo "  Setup terminé !"
echo "================================================"
echo ""
echo "Prochaines étapes :"
echo "  cd event-main"
echo "  cp .env.prod.example .env.prod   (ou créer manuellement)"
echo "  nano .env.prod                   (remplir les valeurs)"
echo "  docker compose -f docker-compose.freetier.yml --env-file .env.prod up -d --build"
echo ""
echo "IMPORTANT: Se déconnecter et reconnecter SSH pour activer le groupe docker."
