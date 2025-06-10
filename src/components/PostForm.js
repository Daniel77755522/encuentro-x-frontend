import React, { useState } from 'react';
import axios from 'axios'; // Necesitamos axios para esta petición
import { useAuth } from '../context/AuthContext'; // Para obtener el token del usuario

const PostForm = () => {
  const [content, setContent] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Obtenemos el token y el usuario del contexto de autenticación
  const { token, user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    // 1. Validar que el usuario esté logueado
    if (!user || !token) {
      setError('Debes iniciar sesión para crear una publicación.');
      return;
    }

    // 2. Validar que el contenido no esté vacío
    if (!content.trim()) {
      setError('La publicación no puede estar vacía.');
      return;
    }

    try {
      // 3. Configurar los headers de la petición con el token de autorización
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Envía el token JWT en el header de autorización
        },
      };

      // 4. Realizar la petición POST para crear la publicación
      const response = await axios.post(
        'http://localhost:5000/api/posts', // Endpoint de tu backend para crear posts
        { content }, // Datos a enviar (el contenido del post)
        config // Incluye los headers de autorización
      );

      setMessage('¡Publicación creada con éxito!');
      setContent(''); // Limpiar el campo de texto después de publicar
      console.log('Publicación creada:', response.data);

      // Opcional: Si tienes una función para refrescar la lista de posts, llámala aquí
      // Por ejemplo, si este componente recibe una prop 'onPostCreated'
      // if (onPostCreated) {
      //   onPostCreated(response.data);
      // }

    } catch (err) {
      console.error('Error al crear la publicación:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Error al crear la publicación. Inténtalo de nuevo.');
    }
  };

  // Si el usuario no está autenticado, no mostramos el formulario
  if (!user) {
    return <p style={styles.notLoggedInMessage}>Inicia sesión para crear una publicación.</p>;
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Crear Nueva Publicación</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label htmlFor="postContent" style={styles.label}>¿Qué estás pensando, {user.username}?</label>
          <textarea
            id="postContent"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Escribe aquí tu publicación..."
            required
            rows="5"
            style={styles.textarea}
          ></textarea>
        </div>
        <button type="submit" style={styles.button}>Publicar</button>
      </form>

      {message && <p style={styles.successMessage}>{message}</p>}
      {error && <p style={styles.errorMessage}>{error}</p>}
    </div>
  );
};

// Estilos básicos (puedes ajustarlos a tu gusto)
const styles = {
  container: {
    maxWidth: '600px',
    margin: '30px auto',
    padding: '25px',
    border: '1px solid #e0e0e0',
    borderRadius: '10px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
    backgroundColor: '#f9f9f9',
    fontFamily: 'Arial, sans-serif',
  },
  heading: {
    color: '#333',
    marginBottom: '20px',
    textAlign: 'center',
    fontSize: '24px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  formGroup: {
    textAlign: 'left',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    color: '#555',
    fontWeight: 'bold',
    fontSize: '16px',
  },
  textarea: {
    width: 'calc(100% - 20px)',
    padding: '12px',
    border: '1px solid #ccc',
    borderRadius: '6px',
    fontSize: '16px',
    resize: 'vertical', // Permite redimensionar verticalmente
  },
  button: {
    backgroundColor: '#007bff',
    color: 'white',
    padding: '12px 25px',
    border: 'none',
    borderRadius: '6px',
    fontSize: '18px',
    cursor: 'pointer',
    marginTop: '10px',
    transition: 'background-color 0.3s ease',
    alignSelf: 'flex-end', // Alinea el botón a la derecha
  },
  buttonHover: {
    backgroundColor: '#0056b3',
  },
  successMessage: {
    marginTop: '20px',
    padding: '10px',
    borderRadius: '5px',
    backgroundColor: '#d4edda',
    color: '#155724',
    borderColor: '#c3e6cb',
    border: '1px solid',
    textAlign: 'center',
  },
  errorMessage: {
    marginTop: '20px',
    padding: '10px',
    borderRadius: '5px',
    backgroundColor: '#f8d7da',
    color: '#721c24',
    borderColor: '#f5c6cb',
    border: '1px solid',
    textAlign: 'center',
  },
  notLoggedInMessage: {
    textAlign: 'center',
    marginTop: '50px',
    fontSize: '1.2em',
    color: '#888',
  }
};

export default PostForm;