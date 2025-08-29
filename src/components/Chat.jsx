import React, { useRef, useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const Chat = () => {
  const refSocket = useRef(null);
  const inputFieldRef = useRef(null);
  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  // Connect to socket
  useEffect(() => {
    refSocket.current = io('https://washapp-production-589d.up.railway.app', { transports: ['websocket'] });

    refSocket.current.on('connect', () => {
      console.log('Websocket connected:', refSocket.current.id);
    });

    refSocket.current.on('chat-message', (msg) => {
      msg.self = msg.senderId === refSocket.current.id;
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });

    return () => refSocket.current.disconnect();
  }, []);

  // Auto-scroll to newest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 5);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const date = new Date();
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const period = hours >= 12 ? 'PM' : 'AM';
    if (hours > 12) hours -= 12;

    const fullTime = `${hours}:${minutes.toString().padStart(2, '0')} ${period}`;

    const msg = {
      id: generateId(),
      msg: input,
      timestamp: fullTime,
      senderId: refSocket.current.id,
    };

    refSocket.current.emit('chat-message', msg);
    setInput('');
    // inputFieldRef.current.focus();
  };

  return (
    <div className="max-w-md mx-auto flex flex-col p-4 bg-gray-50 h-[85vh] lg:h-[90vh]">
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-100 rounded-lg shadow">
        <ul className="flex flex-col space-y-2">
          {messages.map((msg) => (
            <li key={msg.id} className={`flex ${msg.self ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-full px-4 py-2 rounded-xl shadow break-words whitespace-pre-wrap ${
                  msg.self
                    ? 'bg-green-200 text-right rounded-br-none'
                    : 'bg-white text-left rounded-bl-none'
                }`}
              >
                <div className="flex gap-2 items-end">
                  <div className="text-md">{msg.msg}</div>
                  <div className="text-[10px] text-gray-500">{msg.timestamp}</div>
                </div>
              </div>
            </li>
          ))}
          <div ref={messagesEndRef} />
        </ul>
      </div>

      {/* Input */}
      <form className="flex mt-2 bg-gray-200 rounded-lg p-2" onSubmit={handleSubmit}>
        <input
          ref={inputFieldRef}
          type="text"
          placeholder="Type a message..."
          className="flex-1 px-3 py-2 rounded-l-lg focus:outline-none"
          value={input}

          onChange={(e) => setInput(e.target.value)}
        />
        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded-r-lg hover:bg-green-600"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;
