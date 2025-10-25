// src/firebase/config.ts
import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_MESSAGING_SENDERID,
  appId: process.env.NEXT_PUBLIC_APP_ID,
};

// Inicializar apenas se não foi inicializado antes
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Garantir que auth e firestore só sejam acessados no cliente
export const auth = typeof window !== "undefined" ? firebase.auth() : null;
export const firestore =
  typeof window !== "undefined" ? firebase.firestore() : null;
export default firebase;
