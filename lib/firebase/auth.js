// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { OAuthProvider, signInWithPopup, onAuthStateChanged as _onAuthStateChanged, signInWithEmailAndPassword, setPersistence, GoogleAuthProvider, signInWithRedirect, getRedirectResult, browserLocalPersistence, inMemoryPersistence, signInAnonymously } from "firebase/auth";

import { getFirebaseAuth } from "./clientApp";

export function onAuthStateChanged(callback) {
    return _onAuthStateChanged(auth, callback);
}

// using password autheentication for now, but will switch to apple once feel like setting that up.
// NOT WORKING YET
export async function signInWithApple() {
    const provider = new OAuthProvider('apple.com');

    const auth = getFirebaseAuth()

    provider.addScope('email');
    provider.addScope('name');

    signInWithPopup(auth, provider)
        .then((result) => {
            const credential = OAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            const user = result.user;
            console.log(token, user);
        })
        .catch((error) => {
            console.log(error);
        });

}

export const requestGuestSignIn = async () => {

    const auth = getFirebaseAuth()

    try {
        // await setPersistence(auth, inMemoryPersistence)
        await signInAnonymously(auth)
        console.log("anonymous sign in complete")
        console.log(auth.currentUser)
        if (auth.currentUser != null) {
            return auth.currentUser
        } else {
            throw Error("Could not sign in anonymously")
        }
    } catch (error) {
        throw error
    }
}

export const signOut = async () => {

    const auth = getFirebaseAuth()

    try {
        await auth.signOut()
        console.log("sign out complete")
    } catch (error) {
        console.error("Sign out error:", error);
        throw error
    }
}

export const signInWithGoogleRedirect = async () => {

    const auth = getFirebaseAuth()

    if (typeof window === "undefined") {
        console.log("Skipping redirect result on server-side");
        return null;
      }
    try {
        const googleProvider = new GoogleAuthProvider()
        await setPersistence(auth, browserLocalPersistence);
        // await signInWithRedirect(auth, googleProvider); // Trigger redirect
        let result = await signInWithPopup(auth, googleProvider); 
        console.log("Getting sign in result")
        console.log(result)
    } catch (error) {
        console.error("Sign-in redirect error:", error);
        throw error
    }
};

export const signInWithGoogleResult = async () => {

    try {
        console.log(auth, browserLocalPersistence)

        const googleAuthResult = await getRedirectResult(auth);

        console.log("GETTING AUTH RESULT")
        console.log(googleAuthResult)

    } catch (error) {
        // TODO: Add error handling in the UI
        console.error("Auth redirect error:", error);
       throw error
    }
}