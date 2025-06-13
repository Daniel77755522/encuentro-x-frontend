import React, { useState, useEffect, useRef, useContext } from 'react'; // <-- ¡NUEVO: useContext!
import io from 'socket.io-client';
import { useAuth } from '../context/AuthContext'; // Para obtener el ID y token del usuario actual
import { BlockContext } from '../context/BlockContext'; // <-- ¡NUEVO: Importa tu BlockContext!
import axios from 'axios'; // <-- ¡NUEVO: Para las llamadas API REST (bloquear)!

const ENDPOINT = "https://encuentro-x-backend.onrender.com";
let socket; // Declara la variable globalmente para evitar reconexiones innecesarias

const ChatScreen = ({ chatId }) => {
    const { user, token } = useAuth(); // Obtén el usuario autenticado Y SU TOKEN del contexto
    const { blockedUsers, addBlockedUser } = useContext(BlockContext); // <-- Obtén la lista de bloqueados y la función para añadir
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (!user || !token) {
            // No intentar conectar el socket si el usuario no está autenticado
            console.log('Usuario o token no disponible, saltando conexión de socket.');
            return;
        }

        // 1. Conectar al servidor Socket.IO (¡AHORA CON AUTENTICACIÓN!)
        socket = io(ENDPOINT, {
            auth: {
                token: token // <-- ¡ENVÍA EL TOKEN JWT AQUÍ PARA AUTENTICAR EL SOCKET!
            }
        });

        // Manejar errores de conexión de Socket.IO
        socket.on('connect_error', (error) => {
            console.error('Error de conexión WebSocket:', error.message);
            // Puedes mostrar un mensaje al usuario o intentar reconectar
            if (error.message.includes('Authentication error')) {
                alert('Fallo de autenticación WebSocket. Por favor, vuelve a iniciar sesión.');
                // Opcional: Redirigir a login
                // navigate('/login');
            }
        });

        socket.on('connect', () => {
            console.log('Conectado al WebSocket del backend.');
            // 2. Unirse a la sala de chat específica (el ID del chat actual)
            if (chatId) {
                socket.emit('join_chat', chatId);
                console.log(`Usuario ${user?.username} (${user?._id}) se unió a la sala: ${chatId}`);
                // TODO: Aquí también cargar el historial de mensajes para este chatId
                // Esto se haría con una petición Axios a tu ruta REST: axios.get(`/api/chats/${chatId}/messages`)
                // Asegúrate de filtrar los mensajes históricos con la lista de bloqueados también.
            }
        });

        // 3. Escuchar el evento 'receiveMessage' desde el servidor
        socket.on('receiveMessage', (message) => {
            console.log('Mensaje recibido:', message);
            // ¡NUEVO: Filtro en el frontend para mensajes entrantes!
            // Aunque el backend ya filtra, esto es una capa de seguridad y consistencia.
            if (!blockedUsers.includes(message.sender._id)) {
                setMessages((prevMessages) => [...prevMessages, message]);
            } else {
                console.log(`Mensaje de ${message.sender.username} (${message.sender._id}) bloqueado localmente para ${user?.username}.`);
            }
        });

        // 4. Limpiar al desmontar el componente (desconectar socket)
        return () => {
            console.log('Desconectando socket...');
            if (socket) {
                socket.disconnect();
            }
        };
    }, [chatId, user, token, blockedUsers]); // Dependencias: Re-ejecutar si cambian el chat ID, user, token o la lista de bloqueados

    // Efecto para hacer scroll al último mensaje cada vez que se actualizan los mensajes
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim() && user && chatId) {
            const messageData = {
                // El backend ya obtiene senderId y senderUsername del socket autenticado,
                // pero puedes incluirlos aquí para que el frontend lo maneje antes de que el socket responda.
                // Sin embargo, para mayor seguridad, confía en el backend para senderId.
                // El formato de messageToEmit en el backend es:
                // { _id, sender: { _id: senderId, username: senderUsername }, content, chat, createdAt }
                sender: {
                    _id: user._id, // Usamos el ID del usuario actual
                    username: user.username // Usamos el nombre de usuario actual
                },
                chatId: chatId,
                content: newMessage.trim(),
                createdAt: new Date().toISOString(),
            };
            socket.emit('sendMessage', messageData); // Envía el mensaje al servidor
            setNewMessage(''); // Limpia el input
        }
    };

    // --- NUEVA FUNCIÓN: Para bloquear un usuario desde el chat ---
    const handleBlockUser = async (userIdToBlock) => {
        if (!token) {
            alert('Necesitas iniciar sesión para bloquear usuarios.');
            return;
        }
        if (user._id === userIdToBlock) {
            alert('No puedes bloquearte a ti mismo.');
            return;
        }
        if (blockedUsers.includes(userIdToBlock)) {
            alert('Este usuario ya está bloqueado.');
            return;
        }

        try {
            await axios.post(
                'https://encuentro-x-frontend.onrender.com/api/users/block', // Tu endpoint de bloqueo
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

    if (!user) {
        return <p>Por favor, inicia sesión para chatear.</p>;
    }
    if (!chatId) {
        return <p>Selecciona un chat para empezar a conversar.</p>;
    }

    return (
        <div style={styles.chatContainer}>
            <div style={styles.messagesDisplay}>
                {messages.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#666' }}>No hay mensajes aún. ¡Sé el primero en saludar!</p>
                ) : (
                    messages.map((msg, index) => (
                        // NO NECESITAMOS FILTRAR AQUÍ SI YA FILTRAMOS EN receiveMessage,
                        // pero si cargaras historial de mensajes, SÍ necesitarías este filtro.
                        // Para consistencia, lo dejamos aquí también.
                        // if (blockedUsers.includes(msg.sender._id)) {
                        //     return null; // O mostrar "Mensaje bloqueado"
                        // }

                        <div
                            key={index} // Idealmente, usar msg._id si viene de la DB
                            style={msg.sender._id === user._id ? styles.myMessage : styles.otherMessage}
                        >
                            <strong>{msg.sender.username || "Usuario Desconocido"}:</strong> {msg.content}
                            <span style={styles.timestamp}> {new Date(msg.createdAt).toLocaleTimeString()}</span>

                            {/* --- NUEVO: Botón de Bloquear (solo para mensajes de otros usuarios) --- */}
                            {msg.sender._id !== user._id && ( // Solo muestra el botón si no es tu propio mensaje
                                <button
                                    onClick={() => handleBlockUser(msg.sender._id)}
                                    style={styles.blockButton}
                                >
                                    {blockedUsers.includes(msg.sender._id) ? 'Bloqueado' : 'Bloquear'}
                                </button>
                            )}
                            {/* --- FIN NUEVO BOTÓN --- */}
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={sendMessage} style={styles.messageInputForm}>
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Escribe un mensaje..."
                    style={styles.messageInput}
                    disabled={!user || !chatId}
                />
                <button type="submit" style={styles.sendButton} disabled={!user || !chatId || !newMessage.trim()}>
                    Enviar
                </button>
            </form>
        </div>
    );
};

const styles = {
    chatContainer: {
        display: 'flex',
        flexDirection: 'column',
        height: '600px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        overflow: 'hidden',
        margin: '20px auto',
        width: '90%',
        maxWidth: '700px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    },
    messagesDisplay: {
        flexGrow: 1,
        overflowY: 'auto',
        padding: '15px',
        backgroundColor: '#f9f9f9',
        display: 'flex',
        flexDirection: 'column',
    },
    myMessage: {
        backgroundColor: '#DCF8C6',
        borderRadius: '10px',
        padding: '10px 12px',
        marginBottom: '8px',
        maxWidth: '80%',
        alignSelf: 'flex-end',
        wordWrap: 'break-word',
        boxShadow: '0 1px 1px rgba(0,0,0,0.05)',
        position: 'relative', // Para posicionar el botón de bloquear
    },
    otherMessage: {
        backgroundColor: '#FFFFFF',
        borderRadius: '10px',
        padding: '10px 12px',
        marginBottom: '8px',
        maxWidth: '80%',
        alignSelf: 'flex-start',
        wordWrap: 'break-word',
        boxShadow: '0 1px 1px rgba(0,0,0,0.05)',
        position: 'relative', // Para posicionar el botón de bloquear
    },
    timestamp: {
        fontSize: '0.75em',
        color: '#888',
        marginTop: '5px',
        display: 'block',
        textAlign: 'right',
    },
    messageInputForm: {
        display: 'flex',
        padding: '15px',
        borderTop: '1px solid #eee',
        backgroundColor: '#fff',
    },
    messageInput: {
        flexGrow: 1,
        padding: '10px',
        border: '1px solid #ccc',
        borderRadius: '20px',
        marginRight: '10px',
        fontSize: '1em',
    },
    sendButton: {
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '20px',
        padding: '10px 20px',
        cursor: 'pointer',
        fontSize: '1em',
        transition: 'background-color 0.3s ease',
    },
    sendButtonHover: {
        backgroundColor: '#0056b3',
    },
    blockButton: { // Estilos para el botón de bloquear
        backgroundColor: '#ffc107',
        color: '#333',
        border: 'none',
        borderRadius: '5px',
        padding: '5px 10px',
        cursor: 'pointer',
        fontSize: '0.8em',
        marginLeft: '10px',
        transition: 'background-color 0.3s ease',
        // Si quieres que el botón aparezca en la esquina, puedes usar absolute positioning
        // position: 'absolute',
        // top: '5px',
        // right: '5px',
    },
    blockButtonHover: {
        backgroundColor: '#e0a800',
    },
};

export default ChatScreen;