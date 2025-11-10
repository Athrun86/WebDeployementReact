Pour reproduir ce projet, suivez les étapes ci-dessous :
1. **Cloner le dépôt**  
   Ouvrez votre terminal et exécutez la commande suivante pour cloner le dépôt :  
   ```bash
   git clone
   ensuite vous allez devoir créer deux fichiers .env à la racine du projet dans backend et frontend
   ```
2. **Configurer les variables d'environnement**
3.  Dans le fichier `.env` du dossier `backend`, ajoutez les variables suivantes :  
    DB_USER= gituser (remplacez par votre utilisateur de base de données , un utilisateur autre que root est recommandé)
    DB_PASS= votre_mot_de_passe (remplacez par votre mot de passe de base de données)
    DB_NAME= github (replace with your database name)
    DB_HOST= localhost 
    DB_PORT= votre_port (remplacez par le port de votre base de données, généralement 3306 pour MySQL)
    PORT= le port de votre serveur backend (par exemple, 5000)
    JWT_SECRET= votr token secret (remplacez par une chaîne secrète pour la signature des tokens JWT)
    TOKEN_KEY=la clé de votre token chiffré dans la database (remplacez par une chaîne secrète pour le chiffrement des tokens)
4. Dans le fichier `.env` du dossier `frontend`, ajoutez les variables suivantes :  
   VITE_API_URL= http://localhost:5000 (remplacez par l'URL de votre serveur backend)
5. **Installer les dépendances**  
   Accédez aux dossiers `backend` et `frontend` et installez les dépendances en exécutant la commande suivante dans chaque dossier :  
   ```bash
   npm install
   ```
6. **Démarrer les serveurs**
   7.  Démarrez le serveur backend en accédant au dossier `backend` et en exécutant la commande suivante :  
       ```bash
       npm start
       ```
       Ensuite, démarrez le serveur frontend en accédant au dossier `frontend` et en exécutant la commande suivante :  
       ```bash
       npm run dev
       ```
8. **Accéder à l'application**
9.  Ouvrez votre navigateur et accédez à l'URL affiché par vite (généralement `http://localhost:3171`) pour utiliser l'application.