// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { OAuthProvider, signInWithPopup, onAuthStateChanged as _onAuthStateChanged, signInWithEmailAndPassword, setPersistence } from "firebase/auth";

import { auth } from "./clientApp";

export function onAuthStateChanged(callback) {
    return _onAuthStateChanged(auth, callback);
}

// using password autheentication for now, but will switch to apple once feel like setting that up.
// NOT WORKING YET
export async function signInWithApple() {
    const provider = new OAuthProvider('apple.com');

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

export async function infiniteInfoSignIn() {

    //setPersistence(auth, 'local')

    return signInWithEmailAndPassword(auth, "test@infiniteinfo.app", "test1234").then((userCredential) => {
        const user = userCredential.user
        console.log(user.email)
        console.log("Authentication Success")
        return user
    }).catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode)
        console.log(errorMessage)
        return null
    })

}

export async function getUserToken() {

    const user = auth.currentUser;

    if (user !== null) {
        return await user.getIdToken();
    } else {
        let signIn = await infiniteInfoSignIn()

        if (signIn !== null) {
            return signIn.getIdToken()
        }

        return null;
    }

}