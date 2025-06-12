import React from 'react';
// Asegúrate de que BrowserRouter esté importado si lo usas en otro lado o si no está implícito
import { Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import { APP_NAME } from './config';
import Register from './components/auth/Register';
import Login from './components/auth/Login';
import PostForm from './components/PostForm';
import PostList from './components/PostList';
import ChatScreen from './components/ChatScreen';
import { useAuth } from './context/AuthContext';
// --- NUEVA IMPORTACIÓN: Tu componente de eliminación de cuenta ---
import AccountDeletion from './components/auth/AccountDeletion'; // <--- AÑADE ESTA LÍNEA

// import './App.css'; // Descomenta si usas este archivo CSS

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
                            {/* --- NUEVO ENLACE: Eliminar Cuenta --- */}
                            {/* Lo ideal es que esté en un lugar discreto, como "Configuración" */}
                            {/* Por ahora lo pongo en la barra de navegación para visibilidad */}
                            <Link to="/settings/delete-account" style={styles.navLink}>Eliminar Cuenta</Link> {/* <--- AÑADE ESTA LÍNEA */}

                            <Link to="/chat" style={styles.navLink}>Chat</Link>
                            <span style={styles.welcomeText}>¡Hola, {user?.username || 'Usuario'}!</span>
                            <button onClick={handleLogout} style={styles.logoutButton}>Cerrar Sesión</button>
                        </>
                    )}
                </nav>
            </header>

            <main style={styles.mainContent}>
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
                    {/* --- NUEVA RUTA: Para el componente de eliminación de cuenta --- */}
                    <Route
                        path="/settings/delete-account" // Define la URL para esta funcionalidad
                        element={isAuthenticated ? <AccountDeletion /> : <Navigate to="/login" />} // Solo accesible si el usuario está autenticado
                    /> {/* <--- AÑADE ESTA RUTA */}
                </Routes>
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