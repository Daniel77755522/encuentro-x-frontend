import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext'; // Ajusta la ruta si es necesario
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'https://encuentro-x-backend.onrender.com'; // Asegúrate de que esta URL sea la correcta

const AccountDeletion = () => {
    const { token, logout } = useAuth(); // Necesitas el token para la petición y logout para limpiar la sesión
    const navigate = useNavigate();
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleDeleteAccount = async () => {
        if (!token) {
            setError('No estás autenticado. Por favor, inicia sesión.');
            return;
        }

        setIsLoading(true);
        setError(''); // Limpiar errores anteriores
        setSuccess(''); // Limpiar mensajes de éxito anteriores

        try {
            // Realizar la petición DELETE al backend
            await axios.delete(`${API_URL}/api/users/me`, {
                headers: {
                    Authorization: `Bearer ${token}` // Enviar el token JWT para autenticar al usuario
                }
            });

            setSuccess('Tu cuenta y todos tus datos asociados han sido eliminados exitosamente.');
            // Limpiar la sesión en el frontend
            logout();
            // Redirigir al usuario a la página de login o inicio después de un breve retraso
            setTimeout(() => {
                navigate('/login'); // O a tu página de inicio ('/')
            }, 2000);

        } catch (err) {
            console.error('Error al eliminar cuenta:', err.response?.data || err.message);
            setError(err.response?.data?.message || 'Hubo un error al eliminar tu cuenta. Inténtalo de nuevo.');
        } finally {
            setIsLoading(false);
            setConfirmDelete(false); // Cerrar la ventana de confirmación
        }
    };

    return (
        <div style={styles.container}>
            <h2>Eliminar mi Cuenta</h2>
            <p style={styles.warningText}>
                Al eliminar tu cuenta, todos tus datos personales asociados, incluyendo tus mensajes, publicaciones y perfil, se borrarán de forma **permanente** de nuestros sistemas.
                **Esta acción es irreversible y no se puede deshacer.**
            </p>

            {error && <p style={styles.errorMessage}>{error}</p>}
            {success && <p style={styles.successMessage}>{success}</p>}

            {!confirmDelete && (
                <button
                    onClick={() => setConfirmDelete(true)}
                    style={styles.deleteButton}
                    disabled={isLoading}
                >
                    {isLoading ? 'Procesando...' : 'Solicitar Eliminación de Cuenta'}
                </button>
            )}

            {confirmDelete && (
                <div style={styles.confirmationBox}>
                    <p style={styles.confirmationText}>
                        **¿Estás absolutamente seguro de que deseas eliminar tu cuenta?** Esta acción es definitiva.
                    </p>
                    <button
                        onClick={handleDeleteAccount}
                        style={styles.confirmDeleteButton}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Eliminando...' : 'Sí, eliminar mi cuenta permanentemente'}
                    </button>
                    <button
                        onClick={() => setConfirmDelete(false)}
                        style={styles.cancelButton}
                        disabled={isLoading}
                    >
                        Cancelar
                    </button>
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        maxWidth: '600px',
        margin: '50px auto',
        padding: '30px',
        border: '1px solid #e0e0e0',
        borderRadius: '10px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
        backgroundColor: '#ffffff',
        textAlign: 'center',
    },
    warningText: {
        color: '#d32f2f', // Rojo oscuro para advertencia
        fontWeight: 'bold',
        marginBottom: '20px',
    },
    errorMessage: {
        color: 'red',
        marginTop: '10px',
        marginBottom: '15px',
    },
    successMessage: {
        color: 'green',
        marginTop: '10px',
        marginBottom: '15px',
    },
    deleteButton: {
        backgroundColor: '#f44336', // Rojo vibrante
        color: 'white',
        padding: '12px 25px',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '1em',
        transition: 'background-color 0.3s ease',
    },
    deleteButtonHover: {
        backgroundColor: '#d32f2f',
    },
    confirmationBox: {
        marginTop: '30px',
        padding: '20px',
        border: '1px solid #ffccbc', // Borde rojo claro
        borderRadius: '8px',
        backgroundColor: '#ffebee', // Fondo rosa muy claro
    },
    confirmationText: {
        color: '#c62828', // Rojo más oscuro
        marginBottom: '20px',
        fontWeight: 'bold',
    },
    confirmDeleteButton: {
        backgroundColor: '#c62828', // Rojo aún más oscuro para la confirmación final
        color: 'white',
        padding: '10px 20px',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        marginRight: '10px',
        fontSize: '0.9em',
    },
    confirmDeleteButtonHover: {
        backgroundColor: '#b71c1c',
    },
    cancelButton: {
        backgroundColor: '#757575', // Gris
        color: 'white',
        padding: '10px 20px',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '0.9em',
    },
    cancelButtonHover: {
        backgroundColor: '#616161',
    },
};

export default AccountDeletion;