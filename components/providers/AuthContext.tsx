"use client"

import { GoogleAuthProvider, signInWithPopup, User } from "firebase/auth";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { getFirebaseAuth } from "@/lib/firebase/clientApp";
import { requestGuestSignIn } from "@/lib/firebase/auth";

interface AuthContextType {
    user: User | null;
    token: string | null
    signInWithGoogle: () => Promise<void>;
    getToken: () => Promise<void>;
    signOut: () => Promise<void>
}

interface AuthProviderProps {
    children: ReactNode;
  }

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: AuthProviderProps) {    
    const [user, setUser] = useState<User | null>(null)
    const [token, setToken] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const auth = getFirebaseAuth();
        if (!auth) return;

        const unsubscribe = auth.onAuthStateChanged(async (user: User) => {
            if (user) {
                const newToken = await user.getIdToken(false)
                console.log(user)
                setUser(user);
                setToken(newToken)
            } else {
                console.log("No user lol")
                try {
                    const user: User | undefined = await requestGuestSignIn()
                    console.log('Created a guest user')
                    if (user) {
                        const newToken = await user.getIdToken(false);
                        setUser(user);
                        setToken(newToken)
                    } else {
                        throw new Error("No user returned from guest sign in");
                    }
                } catch (error) {
                    console.log("Creating guest user failed")
                    // TODO: Need to error handle this with some sort of state.
                    setUser(null);
                    setToken(null)
                }
            }
        });

        return () => unsubscribe();
    })

    const signInWithGoogle = async () => {
        const auth = getFirebaseAuth()
        if (!auth) return;
    
        const provider = new GoogleAuthProvider();
        try {
          const result = await signInWithPopup(auth, provider);
          setUser(result.user)
          const newToken = await result.user.getIdToken(false);
          setToken(newToken)
        } catch (error) {
          console.error("Sign-in error:", error);
        }
      };
    
    const signOut = async () => {
        const auth = getFirebaseAuth();
        if (!auth) return;

        try {
            await auth.signOut();
            setUser(null);
            setToken(null)
        } catch (error) {
            console.error("Sign-out error:", error);
        }
    };

    const getToken = async () => {
        const auth = getFirebaseAuth();
        if (!auth) return;

        try {
            const newToken = await auth.currentUser?.getIdToken(false);
            setToken(newToken ?? null);
        } catch (error) {
            console.error("Get token error:", error);
        }
    }

    return (
        <AuthContext.Provider value={{ user, token, signInWithGoogle, getToken, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext)
}