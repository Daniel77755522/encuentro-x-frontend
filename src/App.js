import React from 'react';
import { Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import { APP_NAME } from './config';
import Register from './components/auth/Register';
import Login from './components/auth/Login';
import PostForm from './components/PostForm';
import PostList from './components/PostList';
import ChatScreen from './components/ChatScreen';
import { useAuth } from './context/AuthContext';
import AccountDeletion from './components/auth/AccountDeletion';

// --- NUEVAS IMPORTACIONES PARA EL BLOQUEO ---
import { BlockProvider } from './context/BlockContext'; // <-- Importa tu nuevo BlockProvider
import BlockedUsersList from './components/BlockedUsersList'; // <-- Importa el componente de la lista de bloqueados
// --- FIN NUEVAS IMPORTACIONES ---

// import './App.css';

function App() {
    const { user, logout, isAuthenticated, isLoading } = useAuth();
    const navigate = useNavigate();

    if (isLoading) {
        return <div style={styles.loadingContainer}>Cargando sesión...</div>;
    }

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="App" style={styles.appContainer}>
            <header style={styles.header}>
                <h1 style={styles.heading}>{APP_NAME}</h1>
                <nav style={styles.navbar}>
                    <Link to="/" style={styles.navLink}>Inicio</Link>
                    {!isAuthenticated ? (
                        <>
                            <Link to="/register" style={styles.navLink}>Registro</Link>
                            <Link to="/login" style={styles.navLink}>Iniciar Sesión</Link>
                        </>
                    ) : (
                        <>
                            <Link to="/settings/delete-account" style={styles.navLink}>Eliminar Cuenta</Link>
                            <Link to="/chat" style={styles.navLink}>Chat</Link>
                            {/* --- NUEVO ENLACE: Lista de Usuarios Bloqueados --- */}
                            <Link to="/settings/blocked-users" style={styles.navLink}>Usuarios Bloqueados</Link> {/* <-- ¡AÑADE ESTO! */}

                            <span style={styles.welcomeText}>¡Hola, {user?.username || 'Usuario'}!</span>
                            <button onClick={handleLogout} style={styles.logoutButton}>Cerrar Sesión</button>
                        </>
                    )}
                </nav>
            </header>

            <main style={styles.mainContent}>
                {/* --- ENVUELVE TUS RUTAS CON BlockProvider --- */}
                {/* Esto asegura que el contexto de bloqueo esté disponible para todos los componentes renderizados por estas rutas */}
                <BlockProvider> {/* <-- ¡ENVUELVE AQUÍ! */}
                    <Routes>
                        <Route path="/register" element={<Register />} />
                        <Route path="/login" element={<Login />} />
                        <Route
                            path="/"
                            element={
                                isAuthenticated ? (
                                    <>
                                        <PostForm />
                                        <PostList />
                                    </>
                                ) : (
                                    <p style={styles.introMessage}>
                                        Bienvenido a {APP_NAME}. Por favor, <Link to="/login" style={styles.inlineLink}>inicia sesión</Link> o <Link to="/register" style={styles.inlineLink}>regístrate</Link> para comenzar.
                                    </p>
                                )
                            }
                        />
                        <Route
                            path="/chat"
                            element={isAuthenticated ? <ChatScreen chatId="general-chat" /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/settings/delete-account"
                            element={isAuthenticated ? <AccountDeletion /> : <Navigate to="/login" />}
                        />
                        {/* --- NUEVA RUTA: Para la lista de usuarios bloqueados --- */}
                        <Route
                            path="/settings/blocked-users" // La URL para acceder a esta lista
                            element={isAuthenticated ? <BlockedUsersList /> : <Navigate to="/login" />} // Protege la ruta
                        /> {/* <-- ¡AÑADE ESTA RUTA! */}
                    </Routes>
                </BlockProvider> {/* <-- ¡CIERRA AQUÍ! */}
            </main>
        </div>
    );
}

const styles = {
    appContainer: {
        textAlign: 'center',
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#f4f7f6',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        color: '#333',
    },
    header: {
        width: '100%',
        backgroundColor: '#333',
        padding: '15px 0',
        color: 'white',
        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingLeft: '20px',
        paddingRight: '20px',
    },
    heading: {
        color: 'white',
        fontSize: '1.8em',
        margin: '0',
    },
    navbar: {
        display: 'flex',
        alignItems: 'center',
    },
    navLink: {
        color: 'white',
        textDecoration: 'none',
        marginLeft: '25px',
        fontSize: '1.1em',
        fontWeight: 'bold',
        transition: 'color 0.2s ease',
    },
    navLinkHover: {
        color: '#007bff',
    },
    welcomeText: {
        marginLeft: '20px',
        marginRight: '15px',
        fontSize: '1.1em',
        color: '#eee',
    },
    logoutButton: {
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        padding: '8px 15px',
        cursor: 'pointer',
        fontSize: '1em',
        marginLeft: '15px',
        transition: 'background-color 0.3s ease',
    },
    logoutButtonHover: {
        backgroundColor: '#c82333',
    },
    mainContent: {
        flexGrow: 1,
        padding: '20px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginTop: '20px',
    },
    introMessage: {
        fontSize: '1.2em',
        marginBottom: '30px',
        color: '#555',
        marginTop: '50px',
    },
    inlineLink: {
        color: '#007bff',
        textDecoration: 'none',
        fontWeight: 'bold',
    },
    loggedInContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '30px',
    },
    welcomeMessage: {
        fontSize: '1.5em',
        color: '#28a745',
        marginBottom: '20px',
        fontWeight: 'bold',
    },
    featureMessage: {
        marginTop: '30px',
        fontSize: '1.1em',
        color: '#6c757d',
    },
    separator: {
        margin: '40px auto',
        width: '80%',
        borderTop: '1px solid #eee',
    },
    loadingContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        fontSize: '1.5em',
        color: '#6c757d',
    }
};

export default App;