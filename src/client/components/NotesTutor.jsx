import React, { useState, useRef, useEffect } from 'react';
import { TbMessageChatbot, TbUser, TbSend } from 'react-icons/tb';
import { FiSend, FiHelpCircle } from 'react-icons/fi';

export default function NotesTutor({ notes }) {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Hello! I am your QvacStudy on-device tutor. Ask me any question about your loaded notes, and I will answer directly on your device with complete privacy.'
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const chatFeedRef = useRef(null);

  useEffect(() => {
    if (chatFeedRef.current) {
      chatFeedRef.current.scrollTop = chatFeedRef.current.scrollHeight;
    }
  }, [messages, isStreaming]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const query = inputQuery.trim();
    if (!query || isStreaming) return;

    // Add user message
    setMessages((prev) => [...prev, { sender: 'user', text: query }]);
    setInputQuery('');
    setIsStreaming(true);

    // Placeholder bot response
    setMessages((prev) => [...prev, { sender: 'bot', text: '' }]);

    try {
      const response = await fetch('/api/tutor/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes,
          question: query
        })
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.substring(6));
              if (data.token) {
                accumulated += data.token;
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { sender: 'bot', text: accumulated };
                  return updated;
                });
              }
            } catch (err) {
              // Ignore non-json chunks
            }
          }
        }
      }
    } catch (err) {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          sender: 'bot',
          text: 'Error streaming response: ' + err.message
        };
        return updated;
      });
    } finally {
      setIsStreaming(false);
    }
  };

  const handleChipClick = (suggestion) => {
    setInputQuery(suggestion);
  };

  return (
    <div className="tutor-container">
      <div className="chat-feed" ref={chatFeedRef}>
        {messages.map((msg, i) => (
          <div key={i} className={`chat-msg ${msg.sender}-msg`}>
            <div className="msg-avatar">
              {msg.sender === 'user' ? <TbUser size={18} /> : <TbMessageChatbot size={20} />}
            </div>
            <div className="msg-bubble">
              <p>{msg.text || (isStreaming && i === messages.length - 1 ? 'Thinking...' : '')}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="chat-suggestions">
        <span className="sugg-label">Quick Ask:</span>
        <button onClick={() => handleChipClick('Summarize the 3 key takeaways')} className="sugg-chip">
          Summarize 3 takeaways
        </button>
        <button onClick={() => handleChipClick('Explain the hardest concept with an analogy')} className="sugg-chip">
          Explain hardest concept
        </button>
        <button onClick={() => handleChipClick('Give a practical real-world example')} className="sugg-chip">
          Real-world example
        </button>
      </div>

      <form onSubmit={handleSubmit} className="chat-input-bar">
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder="Ask a question about your study notes..."
          disabled={isStreaming}
        />
        <button type="submit" disabled={isStreaming || !inputQuery.trim()} className="btn-primary">
          <FiSend size={15} style={{ marginRight: 4 }} />
          <span>Send</span>
        </button>
      </form>
    </div>
  );
}
