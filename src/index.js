import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Si tienes un archivo CSS global
import App from './App';
import { AuthProvider } from './context/AuthContext'; // <--- Importa AuthProvider
import { BrowserRouter } from 'react-router-dom'; // <--- ¡Importa BrowserRouter!

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* Primero envuelve tu aplicación con BrowserRouter para que React Router funcione */}
    <BrowserRouter> 
      {/* Luego, envuelve tu componente App con AuthProvider para el contexto de autenticación */}
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);