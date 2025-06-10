import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { useAuth } from '../context/AuthContext'; // Para obtener el ID del usuario actual

const ENDPOINT = "http://localhost:5000"; // Asegúrate de que coincida con el puerto de tu backend
let socket; // Declara la variable globalmente para evitar reconexiones innecesarias

const ChatScreen = ({ chatId }) => { // Recibe el ID del chat actual como prop
    const { user } = useAuth(); // Obtén el usuario autenticado del contexto
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null); // Para hacer scroll automático

    useEffect(() => {
        // 1. Conectar al servidor Socket.IO
        socket = io(ENDPOINT);

        // 2. Unirse a la sala de chat específica (el ID del chat actual)
        if (chatId) {
            socket.emit('join_chat', chatId);
            // TODO: Aquí también cargar el historial de mensajes para este chatId
            // Esto se haría con una petición Axios a tu ruta REST: axios.get(`/api/chats/${chatId}/messages`)
        }

        // 3. Escuchar el evento 'receiveMessage' desde el servidor
        socket.on('receiveMessage', (message) => {
            setMessages((prevMessages) => [...prevMessages, message]);
        });

        // 4. Limpiar al desmontar el componente (desconectar socket)
        return () => {
            socket.disconnect();
        };
    }, [chatId]); // Re-ejecutar si el ID del chat cambia

    // Efecto para hacer scroll al último mensaje cada vez que se actualizan los mensajes
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim() && user && chatId) {
            const messageData = {
                senderId: user._id, // ID del remitente
                chatId: chatId,      // ID de la conversación
                content: newMessage.trim(),
                senderUsername: user.username, // Opcional: para mostrar en el frontend sin más llamadas
                createdAt: new Date().toISOString(), // Para mostrar timestamp
            };
            socket.emit('sendMessage', messageData); // Envía el mensaje al servidor
            setNewMessage(''); // Limpia el input
        }
    };

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
                        <div
                            key={index}
                            style={msg.senderId === user._id ? styles.myMessage : styles.otherMessage}
                        >
                            <strong>{msg.senderUsername || "Usuario Desconocido"}:</strong> {msg.content}
                            <span style={styles.timestamp}> {new Date(msg.createdAt).toLocaleTimeString()}</span>
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
        height: '600px', // Ocupa todo el alto disponible, ajusta según tu layout
        border: '1px solid #ddd',
        borderRadius: '8px',
        overflow: 'hidden',
        margin: '20px auto',
        width: '90%',
        maxWidth: '700px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    },
    messagesDisplay: {
        flexGrow: 1, // Ocupa el espacio restante
        overflowY: 'auto', // Habilita el scroll
        padding: '15px',
        backgroundColor: '#f9f9f9',
        display: 'flex',
        flexDirection: 'column',
    },
    myMessage: {
        backgroundColor: '#DCF8C6', // Color tipo WhatsApp para mensajes propios
        borderRadius: '10px',
        padding: '10px 12px',
        marginBottom: '8px',
        maxWidth: '80%',
        alignSelf: 'flex-end', // Alinea a la derecha
        wordWrap: 'break-word',
        boxShadow: '0 1px 1px rgba(0,0,0,0.05)',
    },
    otherMessage: {
        backgroundColor: '#FFFFFF',
        borderRadius: '10px',
        padding: '10px 12px',
        marginBottom: '8px',
        maxWidth: '80%',
        alignSelf: 'flex-start', // Alinea a la izquierda
        wordWrap: 'break-word',
        boxShadow: '0 1px 1px rgba(0,0,0,0.05)',
    },
    timestamp: {
        fontSize: '0.75em',
        color: '#888',
        marginTop: '5px',
        display: 'block',
        textAlign: 'right', // Para mensajes propios
        // textAlign: 'left', // Para otros mensajes si quieres
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
        borderRadius: '20px', // Bordes más redondeados
        marginRight: '10px',
        fontSize: '1em',
    },
    sendButton: {
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '20px', // Bordes más redondeados
        padding: '10px 20px',
        cursor: 'pointer',
        fontSize: '1em',
        transition: 'background-color 0.3s ease',
    },
    sendButtonHover: {
        backgroundColor: '#0056b3',
    },
};

export default ChatScreen;