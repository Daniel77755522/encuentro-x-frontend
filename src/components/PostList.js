import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
// No necesitamos useAuth para esta ruta si tu backend /api/posts es pública
// Pero si quieres que solo usuarios logueados vean posts, lo usarías
// import { useAuth } from '../context/AuthContext'; 

const PostList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // La función para obtener las publicaciones del backend
  // Usamos useCallback para memoizarla y evitar re-creaciones innecesarias
  const fetchPosts = useCallback(async () => {
    setLoading(true); // Indicar que la carga está en progreso
    setError(''); // Limpiar errores anteriores
    try {
      // Realiza una petición GET al endpoint de tu backend para obtener todas las publicaciones
      // Asumimos que esta ruta es pública y no necesita token de autenticación
      const response = await axios.get('http://localhost:5000/api/posts');
      setPosts(response.data); // Actualiza el estado con las publicaciones recibidas
    } catch (err) {
      console.error('Error al obtener publicaciones:', err.response?.data || err.message);
      setError('No se pudieron cargar las publicaciones. Inténtalo de nuevo más tarde.');
    } finally {
      setLoading(false); // La carga ha terminado
    }
  }, []); // Dependencias vacías: esta función solo se crea una vez

  // useEffect para llamar a fetchPosts cuando el componente se monta
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]); // fetchPosts es una dependencia porque está dentro del useEffect

  // Renderizado condicional basado en el estado de carga y error
  if (loading) {
    return <div style={styles.message}>Cargando publicaciones...</div>;
  }

  if (error) {
    return <div style={styles.errorMessage}>{error}</div>;
  }

  if (posts.length === 0) {
    return <div style={styles.message}>No hay publicaciones aún. ¡Sé el primero en crear una!</div>;
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Publicaciones Recientes</h2>
      {posts.map((post) => (
        <div key={post._id} style={styles.postCard}>
          <p style={styles.postContent}>{post.content}</p>
          <p style={styles.postAuthor}>
            Por **{post.user.username}**
          </p>
          <p style={styles.postDate}>
            Publicado el {new Date(post.createdAt).toLocaleDateString()} a las {new Date(post.createdAt).toLocaleTimeString()}
          </p>
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
};

export default PostList;