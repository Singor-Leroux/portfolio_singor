# Authentification et Inscription

Ce document explique comment configurer et utiliser le système d'authentification et d'inscription avec vérification d'email.

## Configuration requise

### Variables d'environnement

Assurez-vous de configurer les variables d'environnement suivantes dans votre fichier `.env` à la racine du dossier `server` :

```env
# Configuration SMTP pour l'envoi d'emails
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false # true pour le port 465, false pour les autres ports
SMTP_USER=votre_email@example.com
SMTP_PASSWORD=votre_mot_de_passe
EMAIL_FROM="Votre Nom <votre_email@example.com>"
EMAIL_FROM_NAME="Votre Nom"

# URL du frontend pour les liens de confirmation
CLIENT_URL=http://localhost:3000

# Durées d'expiration (en millisecondes)
EMAIL_VERIFICATION_EXPIRES_IN=86400000 # 24 heures
PASSWORD_RESET_EXPIRES_IN=600000 # 10 minutes
```

### Configuration SMTP

Pour l'envoi d'emails, vous pouvez utiliser n'importe quel service SMTP. Voici quelques exemples de configuration pour des fournisseurs courants :

#### Gmail (non recommandé pour la production)
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre_email@gmail.com
SMTP_PASSWORD=votre_mot_de_passe_app
```

> **Note** : Pour Gmail, vous devrez peut-être activer l'option "Applications moins sécurisées" ou créer un mot de passe d'application.

#### Mailtrap (pour les tests)
```env
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_SECURE=false
SMTP_USER=votre_identifiant_mailtrap
SMTP_PASSWORD=votre_mot_de_passe_mailtrap
```

## Flux d'inscription

1. **Inscription** : L'utilisateur s'inscrit avec son nom, email et mot de passe.
2. **Vérification par email** : Un email avec un lien de confirmation est envoyé à l'utilisateur.
3. **Confirmation** : L'utilisateur clique sur le lien pour confirmer son adresse email.
4. **Connexion** : Une fois l'email confirmé, l'utilisateur peut se connecter.

## Endpoints d'API

### Inscription

**POST** `/api/auth/register`

Corps de la requête :
```json
{
  "name": "Nom de l'utilisateur",
  "email": "utilisateur@example.com",
  "password": "MotDePasseSécurisé123!",
  "confirmPassword": "MotDePasseSécurisé123!"
}
```

Réponse en cas de succès (201) :
```json
{
  "success": true,
  "message": "Inscription réussie. Veuillez vérifier votre email pour activer votre compte.",
  "data": {
    "id": "5f8d0d55b54764421b7156c3",
    "name": "Nom de l'utilisateur",
    "email": "utilisateur@example.com",
    "status": "pending",
    "isEmailVerified": false
  }
}
```

### Confirmation d'email

**GET** `/api/auth/confirm-email?token=TOKEN_DE_VERIFICATION`

Redirige vers la page de connexion avec un paramètre `verified=true` en cas de succès.

### Renvoyer l'email de vérification

**POST** `/api/auth/resend-verification-email`

Corps de la requête :
```json
{
  "email": "utilisateur@example.com"
}
```

Réponse en cas de succès (200) :
```json
{
  "success": true,
  "message": "Email de vérification renvoyé avec succès"
}
```

## Personnalisation des emails

Vous pouvez personnaliser les modèles d'emails en modifiant les fichiers dans le dossier `server/src/utils/email.utils.ts`.

## Dépannage

### L'email de confirmation n'arrive pas

1. Vérifiez les logs du serveur pour les erreurs d'envoi d'email.
2. Vérifiez le dossier de courrier indésirable de l'utilisateur.
3. Assurez-vous que la configuration SMTP est correcte.
4. Vérifiez que le serveur a accès à Internet pour envoyer des emails.

### Le lien de confirmation a expiré

L'utilisateur peut demander un nouvel email de vérification en utilisant l'endpoint `/api/auth/resend-verification-email`.

## Sécurité

- Les mots de passe sont hachés avec bcrypt avant d'être stockés en base de données.
- Les liens de confirmation et de réinitialisation de mot de passe ont une durée de validité limitée.
- Les tentatives de connexion échouées sont limitées pour prévenir les attaques par force brute.
- Les tokens JWT sont signés avec une clé secrète et ont une durée de validité limitée.

## Tests

Pour tester le système d'authentification, vous pouvez utiliser les données de test fournies dans le fichier `server/src/config/seed.ts` ou utiliser un client HTTP comme Postman ou cURL.

## Déploiement

Assurez-vous que :

1. Toutes les variables d'environnement sont correctement configurées sur votre serveur de production.
2. Le service SMTP que vous utilisez est correctement configuré pour envoyer des emails en production.
3. Les URL de redirection (CLIENT_URL) sont mises à jour avec les domaines de production.
4. Les certificats SSL/TLS sont correctement configurés pour les connexions sécurisées.
