# WebDeployementReact

Projet React + TypeScript avec backend Node.js/Express déployé sur Railway et frontend sur GitHub Pages.

## 🏗️ Architecture

- **Frontend** : React + TypeScript + Vite (déployé sur GitHub Pages)
- **Backend** : Node.js + Express + TypeScript (déployé sur Railway)
- **Base de données** : MySQL (Railway)

## 🚀 Déploiement complet

### 1. Prérequis

- Node.js 20+
- Git
- Compte GitHub
- Compte Railway

### 2. Configuration du Backend sur Railway

#### 2.1 Créer le projet sur Railway
1. Connectez-vous sur [Railway](https://railway.app)
2. Créez un nouveau projet
3. Connectez votre repository GitHub
4. Sélectionnez le dossier `backend`

#### 2.2 Ajouter une base de données MySQL
1. Dans votre projet Railway, cliquez sur "New Service"
2. Sélectionnez "Database" > "MySQL"
3. Notez les variables de connexion générées
4. Attention car les  variables d'envirronement peuvent différer selon si vous êtes en production ou en développement.
exemple:
   DB_USER=your_local_user
   DB_PASS=your_local_password
   DB_NAME=your_database
   DB_HOST=localhost
   DB_PORT=3308
   PORT=8080
   JWT_SECRET=your_jwt_secret
   TOKEN_KEY=your_token_key
   FRONTEND_URL=http://localhost:5173 ceci est toute la partie qui va vous servir en local
5. en déploiement sur railway celà ressemblera plutot à ca  :  
   NODE_ENV=production DB_HOST=[URL_MYSQL_RAILWAY] 
DB_USER=[USER_MYSQL_RAILWAY] 
DB_PASS=[PASSWORD_MYSQL_RAILWAY] 
DB_NAME=[DATABASE_NAME_RAILWAY] 
DB_PORT=3306 JWT_SECRET=[VOTRE_JWT_SECRET] 
TOKEN_KEY=[VOTRE_TOKEN_KEY]
FRONTEND_URL=votre nom de domaine pour le frontend (OBLIGATOIRE POUR LES CORS)
6.  ADMIN_USERNAME
ADMIN_PASSWORD
ADMIN_TOKEN ces trois variables vont créer l'utilisateur par défaut sur railway et votre token doit être le token github. 
#### 2.3 Railway
Créez un service de MySQL dans Railway et connectez-le à votre projet backend. Mettez à jour les variables d'environnement dans Railway avec les informations de connexion à la base de données.
La base de données devrait être automatiquement créée lors du premier démarrage de l'application.
pour le frontend: 
Github pages:
1. Allez dans les paramètres de votre repository GitHub.
2. Dans la section "Pages", sélectionnez déployer à partir de la branche  "gh-pages" folder "/ (root)".
3. le fichier deploy.yml est présent et s'occupera normalement de déployer

## ⚙️ Configuration locale
### 1. Cloner le repository
```bash
git clone
2. Allez individuellement dans les dossiers backend et frontend et installez les dépendances :
```bash
cd backend
npm install
cd ../frontend
npm install
```
### 2. Configurer les variables d'environnement
Créez un fichier `.env` dans les dossiers `backend` et `frontend` avec
les variables d'environnement nécessaires (voir exemples ci-dessus).
pour Frontend:
VITE_API_URL = votre URL backend Railway ou localhost si en local
MODE = development ou production selon le cas 
Très importnt d'ajouter cette variable pour github pages pour savoir si il est en prod
###3. Lancer la base de données MySQL locale
Assurez-vous d'avoir MariaDb installé et en cours d'exécution sur votre machine locale.
lancez le script database.ts pour créer les tables nécessaires:
Il vous sera demandé : 
root et votre password mysql locale
l'utilisateur et son password que vous avez mis dans les variables d'environement
la base de données que vous avez mis dans les variables d'environement
le port mariadb (3306 par défaut)
puis on vous demandera l'utilisateur git que vous allez utiliser pour vous connecter et créer les projets et repo
Il vous faut un token github avec les droits repo pour que l'application puisse créer les repo.

```bash
### 4. Démarrer les applications localement
#### Backend
```bash
cd backend
npm run dev
```
#### Frontend
```bash
cd frontend
npm run dev

### Remarques
- Ne jamais mettre les fichiers `.env` dans le repository Git.
- Assurez-vous que les ports utilisés par le backend et le frontend ne sont pas en conflit avec d'autres services sur votre machine.
- Les variables d'envirronement en production ne pourrait pas marcher sur d'autres services d'hébergement que Railway car elles sont spécifiques à Railway.
```

Hébergement du site web
https://athrun86.github.io/WebDeployementReact
```
lien vidéo de présentation

https://youtu.be/p86_50Rkafk