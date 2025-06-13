// frontend/src/components/BlockedUsersList.js
import React, { useContext } from 'react';
import { BlockContext } from '../context/BlockContext'; // Asegúrate de que la ruta sea correcta
import { useAuth } from '../context/AuthContext'; // Para obtener el token para las llamadas API
import axios from 'axios'; // O puedes usar fetch API directamente

const BlockedUsersList = () => {
    // Usamos BlockContext para acceder a la lista de usuarios bloqueados y las funciones para actualizarlos
    const { blockedUsers, blockedUserDetails, removeBlockedUser } = useContext(BlockContext);
    const { token } = useAuth(); // Obtenemos el token del contexto de autenticación

    const handleUnblockUser = async (userIdToUnblock) => {
        if (!token) {
            alert('Debes iniciar sesión para desbloquear usuarios.');
            return;
        }

        try {
            // Llama a tu endpoint de backend para desbloquear al usuario
            await axios.delete(`https://encuentro-x-frontend.onrender.com/api/users/unblock/${userIdToUnblock}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            // Si la llamada es exitosa, actualiza el estado local en el contexto
            removeBlockedUser(userIdToUnblock);
            alert('Usuario desbloqueado con éxito.');
        } catch (error) {
            console.error('Error al desbloquear usuario:', error.response?.data?.message || error.message);
            alert('Error al desbloquear usuario. Intenta de nuevo.');
        }
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.heading}>Usuarios Bloqueados</h2>
            {blockedUserDetails.length === 0 ? (
                <p style={styles.noBlockedUsers}>No tienes usuarios bloqueados.</p>
            ) : (
                <ul style={styles.userList}>
                    {blockedUserDetails.map((user) => (
                        <li key={user._id} style={styles.userItem}>
                            <span style={styles.username}>{user.username}</span>
                            <span style={styles.email}>({user.email})</span>
                            <button
                                onClick={() => handleUnblockUser(user._id)}
                                style={styles.unblockButton}
                            >
                                Desbloquear
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

const styles = {
    container: {
        backgroundColor: '#fff',
        padding: '30px',
        borderRadius: '10px',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
        maxWidth: '600px',
        margin: '40px auto',
        textAlign: 'center',
    },
    heading: {
        color: '#333',
        marginBottom: '25px',
        fontSize: '2em',
    },
    noBlockedUsers: {
        color: '#666',
        fontSize: '1.1em',
    },
    userList: {
        listStyle: 'none',
        padding: 0,
        margin: 0,
    },
    userItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '15px 0',
        borderBottom: '1px solid #eee',
        '&:last-child': {
            borderBottom: 'none',
        },
    },
    username: {
        fontWeight: 'bold',
        color: '#555',
        fontSize: '1.1em',
    },
    email: {
        color: '#777',
        marginLeft: '10px',
        flexGrow: 1, // Permite que el email ocupe espacio
        textAlign: 'left',
    },
    unblockButton: {
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        padding: '8px 15px',
        cursor: 'pointer',
        fontSize: '0.95em',
        transition: 'background-color 0.3s ease',
    },
    unblockButtonHover: {
        backgroundColor: '#0056b3',
    },
};

export default BlockedUsersList;