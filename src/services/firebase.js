import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

// WHY environment variables: Pushing API keys to GitHub is a critical security risk.
// These variables must be populated in the local .env file.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

let app, auth, provider;

// Initialize Firebase only if the API key is actually provided
// This prevents the application from crashing completely if the user hasn't set up Firebase yet.
export const isFirebaseConfigured = !!firebaseConfig.apiKey;

if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  provider = new GoogleAuthProvider();
  // Request profile logic
  provider.addScope('profile');
  provider.addScope('email');
} else {
  console.warn("Firebase is not configured! Please provide VITE_FIREBASE_API_KEY in .env");
}

export { auth, provider, signInWithPopup, signOut };
