"use client"

import { useEffect } from "react";

import { signInWithGoogleResult, signInWithGoogleRedirect, signOut }  from "../../lib/firebase/auth"
import { useAuth } from "../providers/AuthContext";

type LoginProps = object; // add json {} body when needed

const Login: React.FC<LoginProps> = () => { 
      
    const authContext = useAuth();
    if (!authContext) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    // wrap this component in the provider next
    const { user, signInWithGoogle } = authContext;

    useEffect(() => {

        if (typeof window === "undefined") return;

        const checkRedirect = async () => {
            try {
                console.log("Are checking")
                // const loggedInUser = await signInWithGoogleResult();
                // console.log(loggedInUser)
            } catch (err) {
                console.log("Are checking error caught")
                console.log(err)
            }
        };

        checkRedirect();

    })

    const callSignInGoogle = async (e: React.MouseEvent) => {
        e.preventDefault()
        console.log("SIgning in ")
        signInWithGoogle()
        // signInWithGoogleRedirect()
    }

    const callSignOut = async (e: React.MouseEvent) => {
        e.preventDefault()
        signOut()
    }

    return <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-700">Login to InfiniteInfo</h2>

        <div className="mt-4 text-center">
            <button 
                onClick={callSignInGoogle}
                className="flex items-center justify-center w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring"
            >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z" fill="currentColor" />
                </svg>
                Sign in with Google
            </button>
        </div>

        <button 
            onClick={callSignOut}
        >
            Sign out test ({user?.email ?? "No email"})
        </button>

        {/* <form className="space-y-4">
          <div>
            <label htmlFor="email" className="block mb-1 text-gray-600">Email</label>
            <input type="email" id="email" className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300" />
          </div>
          <div>
            <label htmlFor="password" className="block mb-1 text-gray-600">Password</label>
            <input type="password" id="password" className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300" />
          </div>
          <button type="submit" className="w-full px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:ring">Login</button>
        </form> */}
      </div>
    </div>
};

export default Login