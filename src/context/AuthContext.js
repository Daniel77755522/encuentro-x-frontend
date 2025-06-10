import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

// Define la URL base de tu API
// Usará la variable de entorno en producción (Render) o localhost en desarrollo
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// 1. Crea el contexto
const AuthContext = createContext(null);

// 2. Hook personalizado para consumir el contexto fácilmente
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === null) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};

// 3. Crea el proveedor del contexto (AuthProvider)
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadUserFromStorage = () => {
            try {
                const storedToken = localStorage.getItem('token');
                const storedUser = localStorage.getItem('user');

                if (storedToken && storedUser) {
                    setToken(storedToken);
                    setUser(JSON.parse(storedUser));
                }
            } catch (error) {
                console.error("Error al cargar la sesión desde localStorage:", error);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            } finally {
                setIsLoading(false);
            }
        };

        loadUserFromStorage();
    }, []);

    useEffect(() => {
        if (user && token) {
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('token', token);
        } else if (!user && !token && !isLoading) {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
        }
    }, [user, token, isLoading]);

    const login = async (email, password) => {
        try {
            // **CAMBIO AQUÍ**
            const response = await axios.post(`${API_URL}/api/users/login`, { email, password });
            const { user: userData, token: userToken } = response.data;

            setUser(userData);
            setToken(userToken);
            return response.data;
        } catch (error) {
            console.error('Error durante el inicio de sesión:', error.response?.data || error.message);
            throw error;
        }
    };

    const register = async (username, email, password) => {
        try {
            // **CAMBIO AQUÍ**
            const response = await axios.post(`${API_URL}/api/users/register`, { username, email, password });
            return response.data;
        } catch (error) {
            console.error('Error durante el registro:', error.response?.data || error.message);
            throw error;
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
    };

    const contextValue = {
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        isAuthenticated: !!user && !!token,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};