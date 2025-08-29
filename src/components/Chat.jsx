import React, { useRef, useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const Chat = () => {
  const refSocket = useRef(null);
  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  // Connect to socket
  useEffect(() => {
    refSocket.current = io('http://localhost:8000', { transports: ['websocket'] });

    refSocket.current.on('connect', () => {
      console.log('Websocket connected:', refSocket.current.id);
    });

    // Receive messages
    refSocket.current.on('chat-message', (msg) => {
      // Determine if the message is from self
      msg.self = msg.senderId === refSocket.current.id;

      setMessages((prev) => {
        // Avoid duplicates by checking id
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

    let hour = new Date().toLocaleString().split(",")[1].split(":")[0].trim();
    console.log(hour)
    if (hour > 12) {
      hour = hour - 12
    }
    let period = hour >= 12 ? "AM" : "PM";

    const fullTime = `${hour}:${new Date().toLocaleString().split(":")[1].trim()} ${period}`;
    console.log(fullTime)

    const msg = {
      id: generateId(),               // unique ID
      msg: input,
      timestamp: fullTime,
      senderId: refSocket.current.id, // identify sender
    };

    // Send to server
    refSocket.current.emit('chat-message', msg);

    setInput('');
  };

  return (
    <div className="max-w-md mx-auto h-screen flex flex-col p-4 bg-gray-50">
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-100 rounded-lg shadow">
        <ul className="flex flex-col space-y-2">
          {messages.map((msg) => (
            <li
              key={msg.id}
              className={`flex ${msg.self ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-4 py-1 pt-1.5 rounded-xl shadow break-words ${msg.self
                    ? 'bg-green-200 text-right rounded-br-none'
                    : 'bg-white text-left rounded-bl-none'
                  }`}
              >
                <div className='flex gap-2 items-end h-5'>
                  <div className='text-md lg:text-md'>{msg.msg}</div>
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
