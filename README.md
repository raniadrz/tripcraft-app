# TripCraft AI

Travel planning & CRM for travel agents. Plan trips, manage customers, attach documents, and generate AI-powered itineraries.

## Features

- **Trip Planner** — AI-generated itineraries via OpenRouter free models
- **CRM** — Customer management with trips, notes, and PDF attachments (tickets, receipts)
- **Profile pictures** — For customers and the logged-in user
- **Account settings** — Change name, email, password
- **Local file server** — Docker-based, stores PDFs and images without requiring Firebase Storage (paid plan)

---

## Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Docker](https://www.docker.com/) + Docker Compose (for the file server)
- A [Firebase](https://firebase.google.com/) project (free Spark plan is enough)
- An [OpenRouter](https://openrouter.ai/) API key (free tier available)

---

## 1. Firebase Setup

### 1.1 Create a Firebase project

1. Go to [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Click **Add project**, give it a name, click through the steps
3. On the project dashboard, click the **`</>`** (Web) icon to add a web app
4. Register the app (any nickname), then copy the `firebaseConfig` object shown

### 1.2 Enable Authentication

1. In the Firebase Console, go to **Build → Authentication**
2. Click **Get started**
3. Under **Sign-in method**, enable **Email/Password**

### 1.3 Enable Firestore

1. Go to **Build → Firestore Database**
2. Click **Create database**
3. Choose **Start in test mode** (or set proper rules for production)
4. Pick a region close to you

### 1.4 Firestore Security Rules (recommended)

In the Firestore console → **Rules** tab, replace the default with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## 2. Environment Variables

```bash
cp .env.example .env
```

Open `.env` and fill in your Firebase credentials (from step 1.1):

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

> **Note:** `.env` is in `.gitignore` and will never be committed. Only `.env.example` (without values) is tracked.

---

## 3. File Server (Docker)

The app uses a local Express server for storing PDFs and profile images. Firebase Storage is **not** required (it needs the paid Blaze plan).

### Start the server

```bash
docker compose up -d
```

This builds and starts the file server on **http://localhost:3001** with a persistent Docker volume for uploads.

### Stop the server

```bash
docker compose down
```

### Check logs

```bash
docker compose logs -f
```

> Uploaded files are stored in a Docker volume (`file_uploads`) and survive container restarts.

### Run without Docker (alternative)

```bash
cd server
npm install
node index.js
```

---

## 4. Install & Run the App

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

> Make sure the Docker file server is running before uploading any files.

---

## 5. OpenRouter API Key

To use the AI itinerary generator:

1. Sign up at [https://openrouter.ai/](https://openrouter.ai/)
2. Go to **Keys** and create a new API key (free tier available)
3. Paste the key in the app's **Settings** page

The key is saved only in your browser's `localStorage` — it is never stored on any server. The app automatically tries multiple free models in sequence and retries on rate limits.

---

## Project Structure

```
├── src/
│   ├── components/
│   │   ├── CRM/              # Customer management, trips, file attachments
│   │   ├── AccountSettings.jsx
│   │   ├── Layout.jsx
│   │   └── TripPlanner.jsx
│   ├── utils/
│   │   ├── db.js             # Firestore CRUD helpers
│   │   ├── openrouter.js     # AI model calls with retry logic
│   │   ├── tripStorage.js    # PDF upload/delete via local server
│   │   └── imageStorage.js   # Image upload/delete via local server
│   └── firebase.js           # Firebase init (reads from .env)
├── server/
│   ├── index.js              # Express file server (PDFs + images)
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
├── .env.example              # Template — copy to .env and fill in values
└── .gitignore
```

---

## Migrating to Firebase Storage (optional, future)

The app is ready for easy migration to Firebase Storage (requires Blaze pay-as-you-go plan):

- `src/utils/tripStorage.js` — Firebase Storage implementation is in the commented-out section at the bottom
- `src/utils/imageStorage.js` — same pattern

To switch: upgrade to Blaze, enable Storage in Firebase Console, then swap the active/commented implementations in those two files.
