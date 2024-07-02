# HackathonOcticodeGp4

Procédure détaillée incluant la création, la validation et l'expiration des jetons de session.

### 1. Création du Jeton de Session

#### a. Requête de Création
- **Client Web** : Envoie une requête à l'API pour générer un jeton de session lorsque l'utilisateur demande une connexion par NFC.

#### b. Génération du Jeton
- **API** :
  - Génère un jeton de session unique et sécurisé (e.g., un UUID ou un JWT).
  - Associe ce jeton à une entrée de session dans la base de données avec les informations suivantes :
    - Jeton de session
    - Statut de la session (par exemple, `en attente`, `authentifié`, `expiré`)
    - Horodatage de création
    - Expiration (par exemple, 5 minutes après la création)

#### c. Réponse
- **API** : Renvoie le jeton de session au client web.
- **Client Web** : Encode le jeton de session dans un QR code et l'affiche.

### 2. Validation du Jeton de Session et de l'Identifiant NFC

#### a. Lecture et Envoi
- **Application Mobile** :
  - Lit le QR code et extrait le jeton de session.
  - Lit le tag NFC.
  - Envoie le jeton de session et le token du tag NFC à l'API.

#### b. Validation du Jeton
- **API** :
  - Reçoit le jeton de session et l'identifiant NFC.
  - Recherche le jeton de session dans la base de données.
  - Vérifie que le jeton est valide et n'est pas expiré.
  - Valide l'identifiant NFC :
    - Vérifie que l'identifiant NFC correspond à un utilisateur enregistré dans la base de données.
    - Si l'identifiant NFC est valide, met à jour le statut de la session à `authentifié`.

#### c. Réponse de Validation
- **API** :
  - Si la validation est réussie, renvoie une réponse positive à l'application mobile.
  - Si la validation échoue, renvoie une réponse d'échec.

### 3. Mise à Jour de la Session Web

#### a. Notification
- **Application Mobile** : Notifie le client web de la réussite de l'authentification via un canal en temps réel (e.g., WebSocket).

#### b. Vérification et Connexion
- **Client Web** :
  - Reçoit la notification et envoie une requête à l'API pour vérifier le statut de la session.
  - L'API confirme que la session est authentifiée.
  - Le client web redirige l'utilisateur vers la page d'accueil ou le tableau de bord de l'utilisateur connecté.

### 4. Gestion de l'Expiration et de la Sécurité

#### a. Expiration Automatique
- **API** : Implémente une logique pour expirer automatiquement les jetons de session après une durée définie (e.g., 5 minutes).

#### b. Nettoyage des Sessions Expirées
- **Base de Données** : Met en place une tâche planifiée (cron job) pour nettoyer régulièrement les sessions expirées.

