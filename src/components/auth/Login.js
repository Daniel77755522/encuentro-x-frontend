import React, { useState } from 'react';
// Ya NO necesitamos axios directamente aquí, el contexto lo maneja
// import axios from 'axios'; 
import { useAuth } from '../../context/AuthContext'; // <-- ¡IMPORTA useAuth hook!
import { useNavigate } from 'react-router-dom'; // Para redirigir después del login exitoso

const Login = () => {
  // Estados para guardar los valores de los campos del formulario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(''); // Para mostrar mensajes al usuario (éxito/error)

  // Accede a la función 'login' del contexto de autenticación
  const { login } = useAuth(); // <-- ¡USA EL HOOK useAuth!
  // Hook para la navegación programática (redirigir al usuario)
  const navigate = useNavigate(); 

  // Función que se ejecuta cuando se envía el formulario
  const handleSubmit = async (e) => {
    e.preventDefault(); // Previene el comportamiento por defecto del formulario
    setMessage(''); // Limpiar mensajes anteriores al intentar login de nuevo

    try {
      // Llama a la función 'login' proporcionada por el contexto
      // Esta función ya contiene la lógica de axios.post al backend,
      // actualiza el estado global y guarda en localStorage.
      const response = await login(email, password); // <-- ¡LLAMA A LA FUNCIÓN login DEL CONTEXTO!

      setMessage('¡Inicio de sesión exitoso! Redirigiendo...');
      console.log('Usuario autenticado:', response); // La respuesta ya viene del contexto
      
      // Limpiar el formulario después del login exitoso
      setEmail('');
      setPassword('');

      // Redirigir al usuario a la página principal o al dashboard después del login
      // Asegúrate de tener configurado tu router en App.js para que esta ruta exista
      navigate('/'); 

    } catch (error) {
      // El contexto ya relanza el error, así que aquí lo capturamos
      console.error('Error al iniciar sesión:', error);
      // Muestra el mensaje de error del backend, o un mensaje genérico
      setMessage(error.response?.data?.message || 'Error en el inicio de sesión. Credenciales inválidas.');
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Inicio de Sesión</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label htmlFor="email" style={styles.label}>Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />
        </div>
        <div style={styles.formGroup}>
          <label htmlFor="password" style={styles.label}>Contraseña:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
          />
        </div>
        <button type="submit" style={styles.button}>Iniciar Sesión</button>
      </form>
      {/* Muestra el mensaje de éxito o error. Cambia el color del mensaje */}
      {message && (
        <p style={{
          ...styles.message,
          backgroundColor: message.includes('exitoso') ? '#d4edda' : '#f8d7da',
          color: message.includes('exitoso') ? '#155724' : '#721c24',
          borderColor: message.includes('exitoso') ? '#c3e6cb' : '#f5c6cb',
        }}>
          {message}
        </p>
      )}
    </div>
  );
};

// Estilos básicos (mantén los estilos como los tenías)
const styles = {
  container: {
    maxWidth: '400px',
    margin: '50px auto',
    padding: '20px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    backgroundColor: '#fff',
    textAlign: 'center',
    fontFamily: 'Arial, sans-serif',
  },
  heading: {
    color: '#333',
    marginBottom: '20px',
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
    marginBottom: '5px',
    color: '#555',
    fontWeight: 'bold',
  },
  input: {
    width: 'calc(100% - 20px)',
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '16px',
  },
  button: {
    backgroundColor: '#28a745', 
    color: 'white',
    padding: '12px 20px',
    border: 'none',
    borderRadius: '5px',
    fontSize: '18px',
    cursor: 'pointer',
    marginTop: '10px',
    transition: 'background-color 0.3s ease',
  },
  message: {
    marginTop: '20px',
    padding: '10px',
    borderRadius: '5px',
    borderColor: '#c3e6cb', 
  },
};

export default Login;