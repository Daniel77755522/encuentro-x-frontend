import React, { useState, useEffect, useRef, useContext } from 'react';
import io from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { BlockContext } from '../context/BlockContext';
import axios from 'axios';

const ENDPOINT = "https://encuentro-x-backend.onrender.com";
let socket;

const ChatScreen = ({ chatId }) => {
    const { user, token } = useAuth();
    const { blockedUsers, addBlockedUser } = useContext(BlockContext);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (!user || !token) {
            console.log('Usuario o token no disponible, saltando conexión de socket.');
            return;
        }

        socket = io(ENDPOINT, {
            auth: {
                token: token
            }
        });

        socket.on('connect_error', (error) => {
            console.error('Error de conexión WebSocket:', error.message);
        });

        socket.on('connect', () => {
            console.log('Conectado al WebSocket del backend.');
            if (chatId) {
                socket.emit('join_chat', chatId);
                console.log(`Usuario ${user?.username} (${user?._id}) se unió a la sala: ${chatId}`);
                // TODO: Aquí también cargar el historial de mensajes para este chatId
            }
        });

        // --- ¡CAMBIO CLAVE AQUÍ PARA EVITAR DUPLICADOS! ---
        socket.on('receiveMessage', (message) => {
            console.log('Mensaje recibido:', message);

            // 1. Si el mensaje es del usuario actual (tú mismo), lo ignoramos.
            //    Ya lo mostramos instantáneamente en la función sendMessage.
            if (message.sender._id === user._id) {
                console.log('Mensaje propio recibido (eco del servidor), ignorando para evitar duplicado.');
                return; 
            }

            // 2. Si el mensaje es de otro usuario, aplicamos el filtro de bloqueo.
            if (blockedUsers.includes(message.sender._id)) {
                console.log(`Mensaje de ${message.sender.username} (${message.sender._id}) bloqueado localmente para ${user?.username}.`);
                return; // No añadir mensajes de usuarios bloqueados
            }
            
            // 3. Si no es tu mensaje y no está bloqueado, entonces lo añadimos.
            setMessages((prevMessages) => [...prevMessages, message]);
        });
        // --- FIN CAMBIO CLAVE ---


        return () => {
            console.log('Desconectando socket...');
            if (socket) {
                socket.disconnect();
            }
        };
    }, [chatId, user, token, blockedUsers]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim() && user && chatId) {
            const messageData = {
                sender: {
                    _id: user._id,
                    username: user.username
                },
                chatId: chatId,
                content: newMessage.trim(),
                createdAt: new Date().toISOString(),
                // Puedes añadir un ID temporal único aquí si el backend no te da uno inmediatamente
                // y necesitas una clave para el mensaje en el frontend antes de que llegue del server
                // _id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
            };
            
            // --- ¡IMPORTANTE! Añadir el mensaje al estado local ANTES de emitirlo ---
            setMessages((prevMessages) => [...prevMessages, messageData]);

            socket.emit('sendMessage', messageData); // Envía el mensaje al servidor
            setNewMessage(''); // Limpia el input
        }
    };

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
                'https://encuentro-x-backend.onrender.com/api/users/block', // Cambiado a backend.onrender.com
                { blockedId: userIdToBlock },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            addBlockedUser(userIdToBlock);
            alert('Usuario bloqueado con éxito.');
        } catch (error) {
            console.error('Error al bloquear usuario:', error.response?.data?.message || error.message);
            alert('Error al bloquear usuario. Intenta de nuevo.');
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
                            key={index} // Idealmente usar msg._id si viene del servidor
                            style={msg.sender._id === user._id ? styles.myMessage : styles.otherMessage}
                        >
                            <strong>{msg.sender.username || "Usuario Desconocido"}:</strong> {msg.content}
                            <span style={styles.timestamp}> {new Date(msg.createdAt).toLocaleTimeString()}</span>

                            {msg.sender._id !== user._id && (
                                <button
                                    onClick={() => handleBlockUser(msg.sender._id)}
                                    style={styles.blockButton}
                                >
                                    {blockedUsers.includes(msg.sender._id) ? 'Bloqueado' : 'Bloquear'}
                                </button>
                            )}
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
        position: 'relative',
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
        position: 'relative',
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
    blockButton: {
        backgroundColor: '#ffc107',
        color: '#333',
        border: 'none',
        borderRadius: '5px',
        padding: '5px 10px',
        cursor: 'pointer',
        fontSize: '0.8em',
        marginLeft: '10px',
        transition: 'background-color 0.3s ease',
    },
    blockButtonHover: {
        backgroundColor: '#e0a800',
    },
};

export default ChatScreen;