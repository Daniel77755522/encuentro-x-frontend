import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext'; // Asegúrate de que AuthContext esté en la misma carpeta

export const BlockContext = createContext();

const BACKEND_URL = "https://encuentro-x-backend.onrender.com"; // Asegúrate de que esta URL sea la correcta de tu backend en Render.

export const BlockProvider = ({ children }) => {
    // blockedUsers: Array de IDs de usuarios bloqueados (para verificaciones rápidas)
    const [blockedUsers, setBlockedUsers] = useState([]);
    // blockedUserDetails: Array de objetos de usuario bloqueados (para mostrar en la lista)
    const [blockedUserDetails, setBlockedUserDetails] = useState([]);
    const [loadingBlockedUsers, setLoadingBlockedUsers] = useState(true);
    const [errorBlockedUsers, setErrorBlockedUsers] = useState(null);

    const { user, token } = useAuth(); // Obtenemos el usuario y el token del AuthContext

    // Función para cargar la lista de usuarios bloqueados del backend
    const fetchBlockedUsers = useCallback(async () => {
        if (!token || !user) {
            setBlockedUsers([]);
            setBlockedUserDetails([]);
            setLoadingBlockedUsers(false);
            return; // No hay token o usuario, no se puede cargar la lista de bloqueados
        }

        setLoadingBlockedUsers(true);
        setErrorBlockedUsers(null);
        try {
            const response = await axios.get(`${BACKEND_URL}/api/users/blocked`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            // La respuesta del backend debe ser un array de objetos de usuario
            const userIds = response.data.map(u => u._id);
            setBlockedUsers(userIds); // Guarda solo los IDs
            setBlockedUserDetails(response.data); // Guarda los detalles completos
        } catch (error) {
            console.error('Error al cargar usuarios bloqueados:', error.response?.data?.message || error.message);
            setErrorBlockedUsers('No se pudieron cargar los usuarios bloqueados.');
            setBlockedUsers([]);
            setBlockedUserDetails([]);
        } finally {
            setLoadingBlockedUsers(false);
        }
    }, [user, token]); // Dependencias: user y token

    // Cargar la lista de bloqueados cuando el componente se monta o cuando el usuario/token cambian
    useEffect(() => {
        fetchBlockedUsers();
    }, [fetchBlockedUsers]);

    // Función para añadir un usuario a la lista de bloqueados localmente
    const addBlockedUser = useCallback((userId) => {
        setBlockedUsers(prev => {
            if (!prev.includes(userId)) {
                return [...prev, userId];
            }
            return prev;
        });
        // Si tienes los detalles del usuario a mano, puedes añadirlo aquí también
        // Por simplicidad, BlockedUsersList.js recarga los detalles si es necesario
        // o espera a que fetchBlockedUsers actualice la lista de detalles.
        // Para añadir los detalles del nuevo usuario bloqueado en tiempo real sin recargar toda la lista:
        // Necesitarías hacer una petición para obtener los detalles de ese userId y luego añadirlo a blockedUserDetails.
        // Por ahora, la próxima vez que se recargue fetchBlockedUsers, se obtendrán los detalles.
        // O podrías forzar un fetchBlockedUsers() inmediatamente después de un bloqueo exitoso.
        fetchBlockedUsers(); // Recarga los detalles para mantener la coherencia
    }, [fetchBlockedUsers]);


    // Función para eliminar un usuario de la lista de bloqueados localmente
    const removeBlockedUser = useCallback((userId) => {
        setBlockedUsers(prev => prev.filter(id => id !== userId));
        setBlockedUserDetails(prev => prev.filter(user => user._id !== userId));
    }, []);

    const contextValue = {
        blockedUsers,
        blockedUserDetails,
        loadingBlockedUsers,
        errorBlockedUsers,
        fetchBlockedUsers, // Para recargar la lista si es necesario
        addBlockedUser,
        removeBlockedUser,
    };

    return (
        <BlockContext.Provider value={contextValue}>
            {children}
        </BlockContext.Provider>
    );
};