import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { UIProvider } from './context/UIContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <NotificationProvider>
        <UIProvider>
          <App />
        </UIProvider>
      </NotificationProvider>
    </AuthProvider>
  </StrictMode>
);
