import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { SearchContextProvider } from "./components/context/SearchContext.jsx";
import {
  AuthContext,
  AuthContextProvider,
} from "./components/context/AuthContext.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";

console.log("GOOGLE CLIENT ID:", import.meta.env.VITE_GOOGLE_CLIENT_ID);


createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
    <AuthContextProvider>
      <SearchContextProvider>
        <App />
      </SearchContextProvider>
    </AuthContextProvider>
  </GoogleOAuthProvider>
);
