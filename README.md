# Capgemini System Monitoring Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7+-green.svg)](https://www.mongodb.com/)
[![Python](https://img.shields.io/badge/Python-3.8+-yellow.svg)](https://www.python.org/)

Une plateforme d'entreprise complète de monitoring système avec authentification faciale, dashboard temps réel, système de chat collaboratif, et prédiction de pannes basée sur l'intelligence artificielle.

## 📋 Table des Matières

- [✨ Fonctionnalités](#-fonctionnalités)
- [🏗️ Architecture](#️-architecture)
- [🛠️ Technologies Utilisées](#️-technologies-utilisées)
- [📦 Installation](#-installation)
- [🚀 Démarrage](#-démarrage)
- [📖 Utilisation](#-utilisation)
- [🔧 Configuration](#-configuration)
- [🗄️ Base de Données](#️-base-de-données)
- [🔐 Authentification](#-authentification)
- [📊 API Endpoints](#-api-endpoints)
- [🤖 Intelligence Artificielle](#-intelligence-artificielle)
- [📱 Interface Utilisateur](#-interface-utilisateur)
- [🔄 Flux de Données](#-flux-de-données)
- [🧪 Tests](#-tests)
- [🚀 Déploiement](#-déploiement)
- [🤝 Contribution](#-contribution)
- [📄 Licence](#-licence)

## ✨ Fonctionnalités

### 🔐 Authentification Multi-Modale
- **Connexion classique** : Email + mot de passe
- **Reconnaissance faciale** : Via webcam avec DeepFace
- **Reset de mot de passe** : Code OTP par email
- **Gestion des rôles** : Admin, User, Viewer

### 📊 Dashboard Temps Réel
- **Monitoring système** : CPU, RAM, Disque, GPU, Réseau, Batterie
- **Mise à jour temps réel** : Via MQTT et WebSocket
- **Graphiques interactifs** : Historique des métriques
- **Export PDF** : Rapports personnalisés

### 💬 Système de Chat Collaboratif
- **Messagerie temps réel** : Socket.IO
- **Conversations multiples** : Gestion des participants
- **Statuts de lecture** : Indicateurs visuels
- **Recherche avancée** : Par utilisateur ou contenu
- **Interface responsive** : Mobile et desktop

### 🤖 Prédiction de Pannes IA
- **Analyse prédictive** : Basée sur les métriques système
- **Seuils configurables** : Par composant (CPU, RAM, Disque)
- **Alertes intelligentes** : Niveaux de risque (0-100%)
- **Rapports détaillés** : Messages contextuels

### 🏭 Gestion des Machines
- **CRUD complet** : Création, lecture, mise à jour, suppression
- **Composants personnalisables** : Seuils et unités configurables
- **Monitoring individuel** : Santé globale par machine
- **Historique des données** : Métriques temporelles

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   IA Service    │
│   React         │◄──►│   Node.js       │◄──►│   Python        │
│   SPA           │    │   Express       │    │   Flask         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   MQTT Broker   │    │   MongoDB       │    │   DeepFace      │
│   HiveMQ        │    │   Database      │    │   OpenCV        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Architecture Microservices
- **Frontend Service** : Interface utilisateur React
- **API Gateway** : Backend Node.js/Express
- **AI Service** : Backend Python/Flask pour IA
- **Message Broker** : MQTT pour métriques temps réel
- **Database** : MongoDB pour persistance

## 🛠️ Technologies Utilisées

### Backend Principal (Node.js)
- **Runtime** : Node.js 18+
- **Framework** : Express.js
- **Authentification** : JWT, bcrypt
- **Temps réel** : Socket.IO
- **Email** : Nodemailer
- **Validation** : Middleware personnalisé

### Backend IA (Python)
- **Runtime** : Python 3.8+
- **Framework** : Flask
- **IA/ML** : DeepFace, OpenCV
- **Monitoring** : psutil, GPUtil
- **Communication** : MQTT (paho-mqtt)

### Frontend
- **Framework** : React 18+
- **Routing** : React Router
- **Styling** : Tailwind CSS
- **Charts** : Chart.js, Recharts
- **PDF Export** : jsPDF, html2canvas
- **Temps réel** : Socket.IO Client, MQTT.js

### Base de Données
- **SGBD** : MongoDB 7+
- **ODM** : Mongoose
- **Indexation** : Optimisée pour queries temps réel

### Communication
- **MQTT** : HiveMQ (broker public)
- **WebSocket** : Socket.IO
- **REST API** : HTTP/HTTPS avec JWT

### DevOps
- **Process Management** : PM2 (production)
- **Logging** : Winston (optionnel)
- **Testing** : Jest (frontend), pytest (backend)
- **Linting** : ESLint, Prettier

## 📦 Installation

### Prérequis
```bash
# Node.js 18+
node --version

# Python 3.8+
python --version

# MongoDB 7+
mongod --version

# Git
git --version
```

### Clonage du Repository
```bash
git clone https://github.com/votre-username/capgemini-monitoring.git
cd capgemini-monitoring
```

### Installation Backend Node.js
```bash
cd Backend
npm install
