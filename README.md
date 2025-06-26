# Portfolio - Application Web

Application web de portfolio avec système d'authentification et d'administration.

## Fonctionnalités

- **Authentification** : Inscription, connexion et déconnexion des utilisateurs
- **Vérification par email** : Envoi d'email de confirmation pour valider les comptes
- **Tableau de bord administrateur** : Gestion des utilisateurs et du contenu
- **Interface utilisateur moderne** : Conçu avec Material-UI et React

## Prérequis

- Node.js (v14 ou supérieur)
- MongoDB (v4.4 ou supérieur)
- npm ou yarn

## Installation

1. **Cloner le dépôt**
   ```bash
   git clone https://github.com/votre-utilisateur/portfolio.git
   cd portfolio
   ```

2. **Installer les dépendances**
   ```bash
   # Installer les dépendances du serveur
   cd server
   npm install
   
   # Installer les dépendances du client
   cd ../client
   npm install
   ```

3. **Configuration**
   - Copier le fichier `.env.example` vers `.env` dans le dossier `server`
   - Configurer les variables d'environnement selon vos besoins

4. **Démarrer l'application**
   ```bash
   # Démarrer le serveur (depuis le dossier server)
   npm run dev
   
   # Démarrer le client (depuis le dossier client)
   npm run dev
   ```

## Documentation

- [Documentation d'authentification](./docs/AUTHENTICATION.md) - Guide complet sur le système d'authentification et d'inscription

## Structure du projet

```
portfolio/
├── client/                 # Application frontend React
├── server/                 # API backend Node.js/Express
│   ├── src/
│   │   ├── config/        # Configuration de l'application
│   │   ├── controllers/    # Contrôleurs pour les routes API
│   │   ├── middleware/     # Middleware Express
│   │   ├── models/         # Modèles Mongoose
│   │   ├── routes/         # Définition des routes API
│   │   └── utils/          # Utilitaires divers
│   └── .env.example        # Exemple de configuration
├── docs/                   # Documentation du projet
└── README.md               # Ce fichier
```

## Variables d'environnement

Créez un fichier `.env` dans le dossier `server` avec les variables suivantes :

```env
# Configuration du serveur
PORT=5000
NODE_ENV=development

# Base de données MongoDB
MONGODB_URI=mongodb://localhost:27017/portfolio

# JWT
JWT_SECRET=votre_secret_jwt_tres_long_et_securise
JWT_EXPIRES_IN=30d

# SMTP (pour les emails)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre_email@example.com
SMTP_PASSWORD=votre_mot_de_passe

# URL du frontend
CLIENT_URL=http://localhost:3000
```

## Développement

### Lancer en mode développement

```bash
# Démarrer le serveur de développement
cd server
npm run dev

# Dans un autre terminal, démarrer le frontend
cd ../client
npm run dev
```

### Lancer les tests

```bash
# Exécuter les tests du serveur
cd server
npm test

# Exécuter les tests du client
cd ../client
npm test
```

## Déploiement

### Préparer pour la production

```bash
# Construire le client pour la production
cd client
npm run build

# Copier les fichiers construits dans le dossier public du serveur
cp -r build/* ../server/public/
```

### Variables d'environnement en production

Assurez-vous de configurer correctement les variables d'environnement pour la production, notamment :
- `NODE_ENV=production`
- `MONGODB_URI` avec les bonnes informations de connexion
- `JWT_SECRET` avec une valeur sécurisée
- Configuration SMTP pour les emails de production

## Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## Auteur

- [Votre Nom](https://github.com/votre-utilisateur)
