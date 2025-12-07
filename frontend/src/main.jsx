import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { SearchContextProvider } from './components/context/SearchContext.jsx'
import { AuthContext, AuthContextProvider } from './components/context/AuthContext.jsx'

createRoot(document.getElementById('root')).render(

    <AuthContextProvider>
      <SearchContextProvider>
        <App />
      </SearchContextProvider>
    </AuthContextProvider>

)
