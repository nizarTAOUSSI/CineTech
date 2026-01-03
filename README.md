# 🎬 CineTech - Smart Backoffice Dashboard

> **Projet Front-End - Développement Web** > **École Marocaine des Sciences de l'Ingénieur (EMSI) - Les Orangers** > **Année Universitaire : 2025-2026**

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
[cite_start]**CineTech** est une application Web de type **Backoffice Dashboard** (Single Page Application - SPA) destinée à la gestion d'une base de données cinématographique[cite: 7, 9, 102].

L'objectif est de fournir une interface moderne et intuitive pour gérer des films et des réalisateurs, tout en visualisant des statistiques dynamiques via un Dashboard interactif. [cite_start]Le projet est développé exclusivement en **HTML5, CSS3 (Tailwind CSS) et JavaScript Vanilla**, sans utilisation de frameworks JS (React, Angular, Vue)[cite: 11].

---

## 🚀 Fonctionnalités Principales

### [cite_start]1. 📊 Dashboard & API (Module Analytique) [cite: 74]
Vue synoptique offrant une vision globale des données :
* [cite_start]**KPIs Dynamiques :** Affichage du nombre total de films, de réalisateurs et indicateurs de performance[cite: 76].
* [cite_start]**Graphiques :** Visualisation des statistiques (ex: Films par genre) via la librairie **Chart.js**[cite: 77].
* [cite_start]**Intégration API Externe :** Connexion à une API de cinéma (OMDB/TMDB) pour récupérer des données en temps réel (notes, tendances) via `fetch()`[cite: 93].

### [cite_start]2. 🎬 Gestion des Films (CRUD Complet) [cite: 51]
Module principal permettant la gestion complète du catalogue :
* **Création :** Formulaire validé pour ajouter un film (Titre, Année, Genre, Réalisateur).
* **Lecture :** Affichage sous forme de tableau avec images.
* **Mise à jour :** Modification des informations d'un film existant.
* [cite_start]**Suppression :** Retrait d'un film avec demande de confirmation[cite: 64].
* [cite_start]**Fonctions avancées :** Recherche dynamique par mot-clé et tri des données[cite: 55, 56].

### [cite_start]3. 🎥 Gestion des Réalisateurs (CRUD Secondaire) [cite: 67]
Module secondaire lié aux films :
* Ajout de nouveaux réalisateurs via formulaire.
* Affichage de la liste des réalisateurs.
* Suppression de réalisateurs.
* [cite_start]*Liaison :* Un film doit être obligatoirement associé à un réalisateur existant[cite: 73].

### 4. 💾 Persistance des Données & Authentification
Toutes les données (films, réalisateurs, favoris, notes, utilisateurs) sont sauvegardées localement dans le navigateur via le **LocalStorage**. [cite_start]Les données ne sont pas perdues après le rechargement de la page[cite: 29].

#### 🔑 Gestion des Utilisateurs (Login/Inscription)
- Lors du premier chargement, la liste des utilisateurs est importée depuis le fichier `users.json` (lecture seule).
- **L'ajout de nouveaux utilisateurs (inscription) et la connexion (login) sont gérés uniquement via le LocalStorage** :
	- Toute nouvelle inscription ajoute l'utilisateur dans le LocalStorage (et non dans le fichier users.json).
	- La connexion vérifie les identifiants dans le LocalStorage.
- **Limitation** : Le fichier `users.json` n'est jamais modifié côté client (navigateur), car les navigateurs ne permettent pas d'écrire dans les fichiers locaux pour des raisons de sécurité. Pour une gestion persistante côté serveur, un backend serait nécessaire.

#### 📦 Résumé de la persistance :
- **Films, réalisateurs, favoris, notes, utilisateurs** : LocalStorage (navigateur)
- **Import initial des utilisateurs** : `users.json` (lecture seule)

---

## 🛠️ Stack Technique

Le projet respecte les contraintes techniques du cahier des charges :

* [cite_start]**Structure :** Single Page Application (SPA)[cite: 38].
* **Frontend :** HTML5, JavaScript (ES6+).
* [cite_start]**Styling :** Tailwind CSS (via CDN) pour une interface responsive et moderne[cite: 49].
* **Icônes :** FontAwesome.
* **Graphiques :** Chart.js.
* **Données :** LocalStorage (films, réalisateurs, utilisateurs, favoris, notes) & API Externe (Asynchrone/Fetch).

---

## 📂 Structure du Projet

```bash
CineTech-Project/
│
├── index.html      # Point d'entrée unique (SPA Structure, login/register inclus)
├── app.js          # Logique métier (DOM, CRUD, Events, API, gestion locale)
├── users.json      # Liste initiale des utilisateurs (lecture seule)
└── README.md       # Documentation du projet
