import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext';
<<<<<<< HEAD
import { NotificationProvider } from './context/NotificationContext';
import { UIProvider } from './context/UIContext';
=======
>>>>>>> c81ec3273035eaedf93d36882c4b5ed75935f31a
import { BrowserRouter as Router } from 'react-router-dom';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
<<<<<<< HEAD
      <NotificationProvider>
        <UIProvider>
          <Router>
            <App />
          </Router>
        </UIProvider>
      </NotificationProvider>
=======
      <Router>
        <App />
      </Router>
>>>>>>> c81ec3273035eaedf93d36882c4b5ed75935f31a
    </AuthProvider>
  </StrictMode>
);
