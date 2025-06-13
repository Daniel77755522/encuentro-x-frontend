import React, { useState, useEffect, useCallback, useContext } from 'react'; // <-- ¡NUEVO: useContext!
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; // <-- ¡NUEVO: Para obtener el token y el ID del usuario!
import { BlockContext } from '../context/BlockContext'; // <-- ¡NUEVO: Para la lista de usuarios bloqueados y función de bloqueo!

const BACKEND_URL = "https://encuentro-x-backend.onrender.com"; // <-- ¡IMPORTANTE! Asegúrate de que esta URL sea la correcta de tu backend en Render.

const PostList = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // --- NUEVO: Obtener user y token del AuthContext ---
    const { user, token } = useAuth();
    // --- NUEVO: Obtener la lista de bloqueados y la función para añadir del BlockContext ---
    const { blockedUsers, addBlockedUser } = useContext(BlockContext);

    // La función para obtener las publicaciones del backend
    const fetchPosts = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            // Realiza una petición GET al endpoint de tu backend para obtener todas las publicaciones
            // ¡NUEVO: Si tu ruta /api/posts requiere autenticación, debes enviar el token!
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const response = await axios.get(`${BACKEND_URL}/api/posts`, { headers });
            setPosts(response.data);
        } catch (err) {
            console.error('Error al obtener publicaciones:', err.response?.data || err.message);
            setError('No se pudieron cargar las publicaciones. Inténtalo de nuevo más tarde.');
        } finally {
            setLoading(false);
        }
    }, [token]); // <-- DEPENDENCIA: Re-ejecutar si el token cambia (ej. al loguearse/desloguearse)

    // useEffect para llamar a fetchPosts cuando el componente se monta o las dependencias cambian
    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    // --- NUEVA FUNCIÓN: Para bloquear un usuario desde un post ---
    const handleBlockUser = async (userIdToBlock) => {
        if (!token) {
            alert('Necesitas iniciar sesión para bloquear usuarios.');
            return;
        }
        if (user && user._id === userIdToBlock) { // Verifica si el usuario actual existe y no es el mismo que se va a bloquear
            alert('No puedes bloquearte a ti mismo.');
            return;
        }
        if (blockedUsers.includes(userIdToBlock)) {
            alert('Este usuario ya está bloqueado.');
            return;
        }

        try {
            await axios.post(
                `${BACKEND_URL}/api/users/block`, // Tu endpoint de bloqueo
                { blockedId: userIdToBlock },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            addBlockedUser(userIdToBlock); // Actualiza el contexto local
            alert('Usuario bloqueado con éxito.');
        } catch (error) {
            console.error('Error al bloquear usuario:', error.response?.data?.message || error.message);
            alert('Error al bloquear usuario. Intenta de nuevo.');
        }
    };
    // --- FIN NUEVA FUNCIÓN ---

    // Renderizado condicional
    if (loading) {
        return <div style={styles.message}>Cargando publicaciones...</div>;
    }

    if (error) {
        return <div style={styles.errorMessage}>{error}</div>;
    }

    // --- NUEVO: Filtrar publicaciones antes de renderizar ---
    const filteredPosts = posts.filter(post => !blockedUsers.includes(post.user._id));

    if (filteredPosts.length === 0) {
        return <div style={styles.message}>No hay publicaciones disponibles (puede que algunos estén bloqueados).</div>;
    }

    return (
        <div style={styles.container}>
            <h2 style={styles.heading}>Publicaciones Recientes</h2>
            {filteredPosts.map((post) => ( // <-- ¡USAMOS filteredPosts AQUÍ!
                <div key={post._id} style={styles.postCard}>
                    <p style={styles.postContent}>{post.content}</p>
                    <p style={styles.postAuthor}>
                        Por <strong>{post.user.username}</strong>
                    </p>
                    <p style={styles.postDate}>
                        Publicado el {new Date(post.createdAt).toLocaleDateString()} a las {new Date(post.createdAt).toLocaleTimeString()}
                    </p>
                    {/* --- NUEVO: Botón de Bloquear (solo para posts de otros usuarios) --- */}
                    {user && post.user._id !== user._id && ( // Muestra el botón si estás logueado y no es tu post
                        <button
                            onClick={() => handleBlockUser(post.user._id)}
                            style={styles.blockButton}
                        >
                            {blockedUsers.includes(post.user._id) ? 'Bloqueado' : 'Bloquear'}
                        </button>
                    )}
                    {/* --- FIN NUEVO BOTÓN --- */}
                </div>
            ))}
        </div>
    );
};

// Estilos básicos para las publicaciones
const styles = {
    container: {
        maxWidth: '700px',
        margin: '30px auto',
        padding: '20px',
        backgroundColor: '#fff',
        borderRadius: '10px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
        fontFamily: 'Arial, sans-serif',
    },
    heading: {
        color: '#333',
        marginBottom: '25px',
        textAlign: 'center',
        fontSize: '28px',
        borderBottom: '1px solid #eee',
        paddingBottom: '15px',
    },
    postCard: {
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '20px',
        backgroundColor: '#fdfdfd',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        position: 'relative', // Para posicionar el botón de bloquear
    },
    postContent: {
        fontSize: '1.1em',
        color: '#444',
        marginBottom: '10px',
        lineHeight: '1.5',
    },
    postAuthor: {
        fontSize: '0.9em',
        color: '#666',
        fontWeight: 'normal',
        marginBottom: '5px',
    },
    postDate: {
        fontSize: '0.8em',
        color: '#888',
        textAlign: 'right',
    },
    message: {
        textAlign: 'center',
        marginTop: '50px',
        fontSize: '1.2em',
        color: '#888',
    },
    errorMessage: {
        textAlign: 'center',
        marginTop: '50px',
        fontSize: '1.2em',
        color: '#dc3545',
        backgroundColor: '#f8d7da',
        padding: '15px',
        borderRadius: '8px',
        border: '1px solid #f5c6cb',
    },
    blockButton: { // Estilos para el botón de bloquear
        backgroundColor: '#ffc107',
        color: '#333',
        border: 'none',
        borderRadius: '5px',
        padding: '5px 10px',
        cursor: 'pointer',
        fontSize: '0.8em',
        marginTop: '10px', // Opcional: ajustar posición si no se usa absolute
        transition: 'background-color 0.3s ease',
        // Si quieres que el botón aparezca en la esquina superior derecha del post, usa esto:
        // position: 'absolute',
        // top: '10px',
        // right: '10px',
    },
    blockButtonHover: {
        backgroundColor: '#e0a800',
    },
};

export default PostList;