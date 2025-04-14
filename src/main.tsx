import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'; // Import BrowserRouter
import App from './App.tsx'
import './index.css'
import { AuthProvider } from './contexts/AuthContext.tsx'; // Ensure AuthProvider is imported

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter> {/* Wrap App with BrowserRouter */}
      <AuthProvider> {/* AuthProvider should be inside BrowserRouter or vice-versa, here it's inside */}
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
