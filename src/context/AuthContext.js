import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios'; // Importa axios para hacer las peticiones al backend

// 1. Crea el contexto
const AuthContext = createContext(null); // Valor inicial null

// 2. Hook personalizado para consumir el contexto fácilmente
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === null) { // Cambiado de 'undefined' a 'null' por el valor inicial del contexto
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};

// 3. Crea el proveedor del contexto (AuthProvider)
export const AuthProvider = ({ children }) => {
    // Estado para almacenar la información del usuario y el token
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true); // Para saber si estamos cargando la sesión inicial

    // Efecto para cargar la sesión desde localStorage al inicio de la aplicación
    useEffect(() => {
        const loadUserFromStorage = () => {
            try {
                const storedToken = localStorage.getItem('token');
                const storedUser = localStorage.getItem('user');

                if (storedToken && storedUser) {
                    setToken(storedToken);
                    setUser(JSON.parse(storedUser)); // Parsear la cadena JSON de vuelta a un objeto
                }
            } catch (error) {
                console.error("Error al cargar la sesión desde localStorage:", error);
                // Si hay un error (ej. JSON corrupto), limpiar localStorage para evitar problemas futuros
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            } finally {
                setIsLoading(false); // La carga inicial ha terminado, independientemente del resultado
            }
        };

        loadUserFromStorage();
    }, []); // El array vacío asegura que este efecto se ejecute solo una vez al montar

    // Efecto para guardar usuario y token en localStorage cada vez que cambian (si no están ya en el useEffect de carga inicial)
    // Este efecto es importante para persistir los cambios después de login/logout
    useEffect(() => {
        if (user && token) {
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('token', token);
        } else if (!user && !token && !isLoading) { // Solo si no hay usuario/token y ya terminó de cargar
            localStorage.removeItem('user');
            localStorage.removeItem('token');
        }
    }, [user, token, isLoading]);


    // Función para iniciar sesión (ahora con la lógica de petición HTTP a tu backend)
    const login = async (email, password) => {
        try {
            const response = await axios.post('http://localhost:5000/api/users/login', { email, password });
            const { user: userData, token: userToken } = response.data; // Desestructuramos user y token de la respuesta

            setUser(userData);
            setToken(userToken);
            // localStorage.setItem('user', JSON.stringify(userData)); // Ya se hace en el useEffect de persistencia
            // localStorage.setItem('token', userToken); // Ya se hace en el useEffect de persistencia
            return response.data; // Devolvemos la respuesta completa para el componente que llama
        } catch (error) {
            console.error('Error durante el inicio de sesión:', error.response?.data || error.message);
            throw error; // Relanzar el error para que el componente de login lo maneje
        }
    };

    // Función para registrar un nuevo usuario (ahora con la lógica de petición HTTP a tu backend)
    const register = async (username, email, password) => {
        try {
            const response = await axios.post('http://localhost:5000/api/users/register', { username, email, password });
            // Puedes decidir si quieres loguear al usuario automáticamente después del registro
            // Si quieres auto-login:
            // const { user: userData, token: userToken } = response.data;
            // setUser(userData);
            // setToken(userToken);
            return response.data; // Devolvemos la respuesta completa
        } catch (error) {
            console.error('Error durante el registro:', error.response?.data || error.message);
            throw error; // Relanzar el error para que el componente de registro lo maneje
        }
    };

    // Función para cerrar sesión
    const logout = () => {
        setUser(null);
        setToken(null);
        // localStorage.removeItem('token'); // Ya se hace en el useEffect de persistencia
        // localStorage.removeItem('user'); // Ya se hace en el useEffect de persistencia
    };

    // El valor que se proporcionará a los componentes hijos
    const contextValue = {
        user,
        token,
        isLoading,
        login,    // Ahora el login del contexto hace la petición HTTP
        register, // Ahora el register del contexto hace la petición HTTP
        logout,
        isAuthenticated: !!user && !!token, // Conveniencia: true si hay token Y usuario, false si no
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};