"use client";

import React, { useEffect } from "react";
import { Provider, useDispatch } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "../store";

// Imports for the Auth Listener
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase"; // <-- Adjust this path if needed
import { setUser, clearUser } from "@/store/userSlice"; // <-- Adjust this path if needed

// 1. The silent background listener
function AuthListener({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Sync Firebase's truth into Redux
        dispatch(
          setUser({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
          })
        );
      } else {
        // Clear Redux if Firebase says the user is logged out
        dispatch(clearUser());
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  return <>{children}</>;
}

// 2. Your main provider, now with the AuthListener nested inside
export default function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AuthListener>
          {children}
        </AuthListener>
      </PersistGate>
    </Provider>
  );
}