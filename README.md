# 🎬 CineTech - Single Page Application (SPA)

> **Projet Front-End - Développement Web**  
> **École Marocaine des Sciences de l'Ingénieur (EMSI) - Les Orangers**  
> **Année Universitaire : 2025-2026**

---

## 🌐 Démo en Ligne – Accès Direct à l’Application

Vous pouvez consulter et tester l’application CineTech directement en ligne via le lien suivant :

👉 https://rococo-choux-30430d.netlify.app/# 

Ce lien permet d’accéder à la version déployée de l’application sans aucune installation.
Il est idéal pour la démonstration, la correction et l’évaluation du projet.

---

## 👥 Membres du Groupe 8
Ce projet a été réalisé par :
* **NIZAR TAOUSSI**
* **OTHMANE BAZ**
* **ANOUAR ELACHGAR**

**Filière :** 3IIR  
**Campus :** EMSI Les Orangers

---

## 📝 Présentation du Projet
**CineTech** est une application Web de type **Single Page Application (SPA)** destinée à la gestion d'une base de données cinématographique.

L'objectif est de fournir une interface moderne et intuitive pour gérer des films et des réalisateurs, tout en visualisant des statistiques dynamiques via un Dashboard interactif. Le projet est développé exclusivement en **HTML5, CSS3 (Tailwind CSS) et JavaScript Vanilla**, sans utilisation de frameworks JS (React, Angular, Vue).

### ✨ Architecture SPA
CineTech est une **vraie Single Page Application** :
- **Une seule page HTML** (`index.html`) qui contient toutes les sections
- **Navigation sans rechargement** : Toutes les transitions se font via JavaScript
- **Layout dynamique** : L'interface s'adapte automatiquement selon le rôle (utilisateur/admin)
- **Gestion d'état** : LocalStorage pour la persistance des données

---

## 🚀 Fonctionnalités Principales

### 1. 📊 Dashboard Admin (Module Analytique)
Vue synoptique offrant une vision globale des données :
* **KPIs Dynamiques :** Affichage du nombre total de films, de réalisateurs et note moyenne
* **Graphiques :** Visualisation des statistiques (Films par genre) via **Chart.js**
* **Intégration API Externe :** Connexion à l'API Studio Ghibli pour récupérer des films en temps réel
* **Cache intelligent :** Les données API sont mises en cache (localStorage) et ne sont récupérées qu'une seule fois

### 2. 🎬 Gestion des Films (CRUD Complet)
Module principal permettant la gestion complète du catalogue :
* **Création :** Formulaire validé pour ajouter un film (Titre, Année, Genre, Réalisateur, Poster)
* **Lecture :** Affichage sous forme de tableau avec images et informations détaillées
* **Mise à jour :** Modification des films locaux et conversion des films API en films locaux lors de l'édition
* **Suppression :** Retrait de films avec confirmation (suppression définitive pour films locaux, masquage pour films API)
* **Fonctions avancées :** Recherche dynamique en temps réel

### 3. 🎥 Gestion des Réalisateurs (CRUD Secondaire)
Module secondaire lié aux films :
* Affichage de tous les réalisateurs (locaux + API) avec comptage des films
* Modification de réalisateurs (renommage pour films locaux uniquement)
* Suppression de réalisateurs et de leurs films associés
* **Liaison intelligente :** Un film doit être associé à un réalisateur

### 4. ⭐ Système de Favoris et Notation
* **Favoris par utilisateur :** Chaque utilisateur peut marquer ses films préférés
* **Système de notation :** Notes sur 10 étoiles avec calcul de moyenne globale
* **Persistance :** Toutes les notes et favoris sont sauvegardés par utilisateur

### 5. 👥 Gestion des Utilisateurs
* **Authentification :** Système de login/inscription avec LocalStorage
* **Rôles :** Utilisateur standard et Administrateur
* **Import initial :** Chargement des utilisateurs depuis `users.json`
* **Administration :** Les admins peuvent gérer les utilisateurs (modifier rôles, supprimer)

### 6. 💾 Persistance des Données
Toutes les données sont sauvegardées localement dans le navigateur via **LocalStorage** :
- **Films locaux** : `cinetech_films`
- **Films API** : `cinetech_api_films` (cache persistant)
- **Utilisateurs** : `cinetech_users`
- **Favoris** : `cinetech_favs_{username}`
- **Notes** : `cinetech_global_ratings`
- **Utilisateur connecté** : `cinetech_currentUser`

Les données ne sont jamais perdues après rechargement de la page.

---

## 🛠️ Stack Technique

Le projet respecte une architecture SPA pure :

* **Architecture :** Single Page Application (SPA) - une seule page HTML
* **Structure :** HTML5 sémantique avec sections dynamiques
* **Logique :** JavaScript Vanilla (ES6+) - navigation sans rechargement
* **Styling :** Tailwind CSS (via CDN) pour une interface responsive et moderne
* **Icônes :** FontAwesome 6.4.0
* **Graphiques :** Chart.js pour les statistiques
* **API :** Studio Ghibli API (avec mise en cache LocalStorage)
* **Stockage :** LocalStorage pour la persistance complète

---

## 📂 Structure du Projet

```bash
CineTech-SPA/
│
├── index.html          # Point d'entrée unique (SPA)
│                       # Contient toutes les sections (catalog, favorites, dashboard, films, directors, users)
│                       # Navigation dynamique via JavaScript
│
├── app.js              # Logique métier complète
│                       # - CRUD films et réalisateurs
│                       # - Gestion d'authentification
│                       # - Navigation SPA
│                       # - Intégration API
│                       # - Système de favoris et notation
│
├── users.json          # Liste initiale des utilisateurs (lecture seule)
│                       # Importé au premier chargement dans LocalStorage
│
├── assets/             # Ressources visuelles
│   ├── logo.png
│   └── logo_white.png
│
└── README.md           # Documentation complète
```

---

## 🎯 Fonctionnement de la SPA

### Navigation Sans Rechargement
La fonction `navigateTo(section)` gère toute la navigation :
```javascript
navigateTo('catalog')    // Affiche le catalogue
navigateTo('dashboard')  // Affiche le dashboard admin
navigateTo('favorites')  // Affiche les favoris
```

### Layout Adaptatif
- **Utilisateurs standard** : Navigation horizontale + Hero + Contenu
- **Administrateurs** : Sidebar verticale + Dashboard + Outils de gestion

L'interface se transforme automatiquement selon le rôle de l'utilisateur connecté.

---

## 🚦 Guide de Démarrage

### Installation
1. Clonez ou téléchargez le projet
2. Ouvrez `index.html` dans un navigateur moderne
3. **C'est tout !** Aucune installation nécessaire

### Comptes de Démonstration
Le fichier `users.json` contient des comptes pré-configurés :

**Administrateurs :**
- Username: `admin` / Password: `admin`
- Username: `nizar` / Password: `nizar`
- Username: `anwar` / Password: `anwar`

**Utilisateurs :**
- Username: `user` / Password: `user`
- Username: `othmane` / Password: `othmane`

### Première Utilisation
1. Au premier chargement, les films de l'API Studio Ghibli sont récupérés et mis en cache
2. Connectez-vous avec un compte admin pour accéder au dashboard complet
3. Les données API sont persistantes - pas besoin de connexion internet après le premier chargement

---

## 🎨 Caractéristiques Techniques

### Responsive Design
- Interface adaptative desktop/tablet/mobile
- Sidebar pliable sur mobile
- Grilles flexibles avec Tailwind CSS

### Performance
- Chargement API unique avec cache LocalStorage
- Navigation instantanée sans rechargement
- Optimisation des rendus DOM

### Accessibilité
- Navigation au clavier
- Messages de confirmation pour actions critiques
- Feedback visuel pour toutes les actions

---

## 🔒 Sécurité & Limitations

### Limitations Client-Side
- **Pas de vrai serveur** : Toutes les données sont en LocalStorage
- **Sécurité limitée** : Les mots de passe sont en clair (OK pour un projet front-end)
- **Fichiers locaux** : `users.json` est en lecture seule (limitation navigateur)

### Pour Production
Pour un déploiement réel, il faudrait :
- Un backend (Node.js, PHP, Python)
- Une vraie base de données (MongoDB, MySQL)
- Authentification sécurisée (JWT, sessions)
- API propre avec validation côté serveur

---

## 📚 Technologies Utilisées

| Technologie | Version | Usage |
|------------|---------|-------|
| HTML5 | - | Structure sémantique |
| JavaScript | ES6+ | Logique applicative |
| Tailwind CSS | 3.x (CDN) | Styling responsive |
| Chart.js | Latest (CDN) | Graphiques statistiques |
| FontAwesome | 6.4.0 | Icônes |
| Studio Ghibli API | v1 | Source de films externe |

---

## 🎓 Objectifs Pédagogiques Atteints

✅ Maîtrise du DOM et manipulation dynamique  
✅ Gestion d'événements JavaScript avancée  
✅ Architecture SPA complète sans framework  
✅ Intégration API REST avec fetch()  
✅ LocalStorage pour persistance de données  
✅ Responsive design avec Tailwind CSS  
✅ Gestion d'état applicatif  
✅ CRUD complet sur plusieurs entités  
✅ Système d'authentification client-side  
✅ Visualisation de données avec Chart.js

---

## 📖 Documentation API

### Studio Ghibli API
- **Endpoint** : `https://ghibliapi.vercel.app/films`
- **Méthode** : GET
- **Format** : JSON
- **Données récupérées** : Titre, réalisateur, année, note, description, poster

### LocalStorage Structure
```javascript
{
  "cinetech_films": [],           // Films locaux
  "cinetech_api_films": [],       // Films API (cache)
  "cinetech_users": [],           // Utilisateurs
  "cinetech_currentUser": {},     // Session actuelle
  "cinetech_global_ratings": {},  // Notes globales
  "cinetech_favs_username": []    // Favoris par user
}
```

---

## 👨‍💻 Contributeurs

Ce projet a été développé dans le cadre du module **Développement Web Front-End** par :

- **NIZAR TAOUSSI** - Développement & Architecture
- **OTHMANE BAZ** - Développement & UI/UX
- **ANOUAR ELACHGAR** - Développement & Intégrations

**Encadrement** : EMSI Les Orangers  
**Année** : 2025-2026

---

## 📄 Licence

Projet éducatif - EMSI 2025-2026  
Tous droits réservés aux contributeurs

---

## 🌟 Points Forts du Projet

1. **Architecture SPA Pure** - Une seule page, navigation fluide
2. **Dual Layout** - Interface utilisateur et admin dans la même app
3. **Cache Intelligent** - API appelée une seule fois, données persistantes
4. **Gestion Hybride** - Films locaux + API dans le même catalogue
5. **UX Moderne** - Tailwind CSS, animations, feedback visuel
6. **Code Modulaire** - Fonctions réutilisables, organisation claire

---

**Merci d'avoir consulté notre projet ! 🎬**
