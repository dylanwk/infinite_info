'use client';

import { initializeApp, getApps, getApp } from "firebase/app";
import { firebaseConfig } from "./firebaseConfig";
import { getAuth, browserLocalPersistence, setPersistence } from "firebase/auth";

const appName = "infiniteinfoweb";

let app
let auth

function initializeFirebase() {
  if (typeof window === "undefined") return null; // Skip on server
    app =  getApps().length === 0 ? initializeApp(firebaseConfig, appName) : getApps()[0];
  if (!auth) {
    auth = getAuth(app);
    // Set persistence once during initialization
    setPersistence(auth, browserLocalPersistence).catch((error) => {
      // TODO: Remove/improve logging
      console.error("Persistence error:", error);
    });
  }
  return auth;
}

export const getFirebaseAuth = () => initializeFirebase();