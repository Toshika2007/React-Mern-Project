
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCiJJa-xvOdpblqbppdZ0jySVB9wR8y3dc",
  authDomain: "ai-legal-document-simplifier.firebaseapp.com",
  projectId: "ai-legal-document-simplifier",
  storageBucket: "ai-legal-document-simplifier.firebasestorage.app",
  messagingSenderId: "536103379498",
  appId: "1:536103379498:web:c6e452b49eb3a53c8f1953"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);