import { createContext, useEffect, useState } from "react";
import { createUserWithEmailAndPassword, getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import app from "../firebase/firebase.config";
import axios from "axios";

export const AuthContext = createContext();
const auth = getAuth(app);

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const createUser = (email, password) => {
        setLoading(true);
        return createUserWithEmailAndPassword(auth, email, password);
    }

    const signIn = (email, password) => {
        setLoading(true);
        return signInWithEmailAndPassword(auth, email, password);
    }

    const logOut = () => {
        setLoading(true);
        return signOut(auth);
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, currentUser => {
            const userEmail = currentUser?.email || user?.email;
            const loggedUser = { email: userEmail }
            setUser(currentUser);
            // console.log('current user', currentUser);
            setLoading(false);
            // if user exist then issue atoken
            if (currentUser) {
                axios.post('https://car-doctor-server-psi-liard.vercel.app/jwt', loggedUser, { withCredentials: true })
                    .then(() => {
                        // console.log('Token response', res.data)
                    })
            }
            else {
                axios.post('https://car-doctor-server-psi-liard.vercel.app/logout', loggedUser, { withCredentials: true })
                    .then(() => {
                        // console.log(res.data)
                    })
            }
        });
        return () => {
            return unsubscribe();
        }
    }, [user?.email])

    const authInfo = {
        user,
        loading,
        createUser,
        signIn,
        logOut
    }

    return (
        <AuthContext.Provider value={authInfo}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;