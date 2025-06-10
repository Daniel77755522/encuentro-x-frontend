import React, { useState } from 'react';
// Ya no necesitamos axios directamente aquí, el contexto lo maneja
// import axios from 'axios'; 
import { useAuth } from '../../context/AuthContext'; // <-- ¡Importa useAuth desde el contexto!
import { useNavigate } from 'react-router-dom'; // Para redirigir después del registro exitoso (opcional)

const Register = () => {
  // Estados para guardar los valores de los campos del formulario
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(''); // Para mostrar mensajes al usuario (éxito/error)

  // Obtén la función 'register' del contexto de autenticación
  const { register } = useAuth(); 
  // Hook para la navegación programática (redirigir al usuario)
  const navigate = useNavigate(); 

  // Función que se ejecuta cuando se envía el formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(''); // Limpiar mensajes anteriores al intentar registrarse de nuevo

    try {
      // Llama a la función 'register' proporcionada por el contexto
      // Esta función ya contiene la lógica de axios.post al backend
      const response = await register(username, email, password); 

      // Si el registro es exitoso, muestra el mensaje de éxito
      setMessage('¡Registro exitoso! Ya puedes iniciar sesión.');
      // Limpiar los campos del formulario
      setUsername('');
      setEmail('');
      setPassword('');

      console.log('Usuario registrado:', response); // La respuesta ya viene del contexto
      
      // Opcional: Redirigir al usuario a la página de login o al dashboard después del registro
      // navigate('/login'); // Por ejemplo, redirigir a la página de login
      // navigate('/'); // O redirigir a la página principal
      
    } catch (error) {
      // El contexto ya relanza el error, así que aquí lo capturamos
      console.error('Error al registrar usuario:', error);
      // Muestra el mensaje de error del backend, o un mensaje genérico
      setMessage(error.response?.data?.message || 'Error en el registro. Inténtalo de nuevo.');
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Registro de Usuario</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label htmlFor="username" style={styles.label}>Nombre de Usuario:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={styles.input}
          />
        </div>
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
        <button type="submit" style={styles.button}>Registrarse</button>
      </form>
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
    backgroundColor: '#007bff',
    color: 'white',
    padding: '12px 20px',
    border: 'none',
    borderRadius: '5px',
    fontSize: '18px',
    cursor: 'pointer',
    marginTop: '10px',
    transition: 'background-color 0.3s ease',
  },
  buttonHover: {
    backgroundColor: '#0056b3',
  },
  message: {
    marginTop: '20px',
    padding: '10px',
    borderRadius: '5px',
  },
};

export default Register;