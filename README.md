# AI Examination Platform

A next-generation examination platform powered by **Google Gemini AI** and **Firebase**.

## 🚀 Getting Started

Follow these steps to run the project locally.

### 1. Prerequisites
- Node.js installed.
- A Google Cloud API Key for **Gemini**.
- A **Firebase** project for Authentication & Database.

### 2. Environment Setup (CRITICAL)
You must create a `.env.local` file in the root directory.
I have already created the file, but you need to fill in the **Firebase** values.

```env
NEXT_PUBLIC_GEMINI_API_KEY=AIzaSy...                 <-- YOUR GEMINI KEY
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...                 <-- YOUR FIREBASE KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456:web:abcdef
```

**Where to find Firebase Keys?**
1. Go to [Firebase Console](https://console.firebase.google.com/).
2. Open your Project -> **Project Settings** (Gear icon).
3. Scroll down to **"Your apps"**.
4. Select "Web" (</>) and copy the `firebaseConfig` values.

### 3. Install Dependencies
If you haven't already:

```bash
npm install
```

### 4. Run Development Server
To start the app locally:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Deployment
To deploy to Vercel:
1. Push this code to GitHub.
2. Import the project in Vercel.
3. **IMPORTANT**: Add the same Environment Variables in Vercel Project Settings.
