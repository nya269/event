## Démarrer le projet avec Docker

Le projet est configuré pour fonctionner avec Docker, ce qui simplifie le déploiement et l'exécution des services nécessaires (backend, base de données, etc.). Voici les étapes pour démarrer le projet avec Docker.

---

### Étape 1 : Prérequis

Assurez-vous d'avoir installé les outils suivants sur votre machine :
- **Docker** : [Installer Docker](https://www.docker.com/get-started)
- **Docker Compose** : Inclus avec Docker Desktop.

---

### Étape 2 : Configuration des fichiers

1. **Créer le fichier `.env` pour le backend :**
   - Copiez le fichier `backend/.env.example` vers `backend/.env`.
   - Remplissez les variables nécessaires, comme le secret JWT, les informations de la base de données, etc.

2. **Vérifiez les fichiers Docker Compose :**
   - `docker-compose.yml` : Utilisé pour le développement.
   - `docker-compose.prod.yml` : Utilisé pour la production.

---

### Étape 3 : Démarrer les services en développement

Pour démarrer le projet en mode développement, utilisez la commande suivante :

```bash
docker-compose up --build