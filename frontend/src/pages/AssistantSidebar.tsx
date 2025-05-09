import React, { useState } from 'react';

const AssistantSidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([
    { role: 'assistant', text: "Hey there! I'm Sunny ☀️ — your AI assistant buddy. How can I help you today?" }
  ]);  // initialize AI message
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();

    // Show user message
    setMessages((prev) => [...prev, { role: 'user', text: userMessage }]);
    setInput('');

    try {
      // Call backend

      setIsLoading(true);
      const res = await fetch(`http://localhost:4000/api/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });
      setIsLoading(false);

      const data = await res.json();

      if (data.reply) {
        setMessages((prev) => [...prev, { role: 'assistant', text: data.reply }]);
      } else {
        setMessages((prev) => [...prev, { role: 'assistant', text: 'Sorry, no response from the assistant.' }]);
      }
    } catch (error) {
      console.error('Error talking to assistant:', error);
      setMessages((prev) => [...prev, { role: 'assistant', text: 'Something went wrong talking to the assistant.' }]);
    }
  };

  return (
    <div
      className={`fixed right-0 top-0 h-full bg-white border-l border-gray-300 shadow-lg transition-transform duration-300 ease-in-out z-50 w-[340px] ${
        isOpen ? '' : 'translate-x-full'
      }`}
    >
      {/* Toggle Button */}
      <button
        className="absolute left-[-40px] top-4 bg-blue-500 text-white px-2 py-1 rounded-l"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? '<' : '>'}
      </button>

      {/* Content */}
      <div className="p-4 flex flex-col h-full">
        <h2 className="text-lg font-bold mb-4">AI Sunny</h2>
         <h3 className="text-sm font-italics mb-3">Want to know what the best time to plan an event is? Ask your AI assistant!</h3>

        <div className="flex-1 overflow-y-auto space-y-2 mb-4 bg-gray-50 p-2 rounded">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`text-sm p-2 rounded ${
                msg.role === 'user' ? 'bg-blue-100 text-right' : 'bg-green-100 text-left'
              }`}
            >
              {msg.text}
            </div>
          ))}
           {isLoading && (
            <div className="text-sm p-2 rounded bg-green-100 text-left italic">
              Typing...
              </div>
            )}
        </div>

        <form onSubmit={handleSubmit} className="flex pr-2">
          <input
            className="flex-1 p-2 border border-gray-300 rounded-l"
            placeholder="Ask me something..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button className="bg-blue-500 text-white px-3 rounded-r">Send</button>
        </form>
      </div>
    </div>
  );
};

export default AssistantSidebar;
