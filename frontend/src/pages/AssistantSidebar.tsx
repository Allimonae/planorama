import React, { useState } from 'react';

function extractSuggestedEventFromReply(reply: string): { title: string; start: string; end: string } | null {
  const match = reply.match(/<!--\s*SUGGESTED_EVENT:\s*(\{.*?\})\s*-->/);
  if (match) {
    try {
      return JSON.parse(match[1]);
    } catch (err) {
      console.error("Error parsing suggested event:", err);
    }
  }
  return null;
}

const confirmationPhrases = ['yes', 'yeah', 'yep', 'sure', 'go ahead', 'do it', 'book it', 'sounds good', 'yes please', 'ye', 'ok', 'okay'];

const AssistantSidebar = ({ onEventScheduled }: { onEventScheduled?: () => void }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([
    { role: 'assistant', text: "Hey there! I'm Sunny, your AI assistant buddy! ☀️ How can I help you today?" }
  ]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedEvent, setSuggestedEvent] = useState<{ title: string; start: string; end: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput('');

    // Check for confirmation if we have a suggestion waiting
    if (suggestedEvent && confirmationPhrases.some(phrase => userMessage.toLowerCase().includes(phrase))) {
      try {
        const res = await fetch('http://localhost:5000/api/bookings/auto', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(suggestedEvent)
        });

        if (res.ok) {
          setMessages(prev => [...prev, { role: 'assistant', text: `✅ Got it! I’ve scheduled "${suggestedEvent.title}" for you.` }]);
          setSuggestedEvent(null); // clear suggestion
          onEventScheduled?.(); 
        } else {
          const error = await res.json();
          setMessages(prev => [...prev, { role: 'assistant', text: 'Hmm, I tried to schedule it but ran into an issue.' }]);
        }
      } catch (err) {
        console.error('Auto-scheduling error:', err);
        setMessages(prev => [...prev, { role: 'assistant', text: 'Something went wrong trying to schedule the event.' }]);
      }
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch('http://localhost:5000/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, history: messages }),
      });
      const data = await res.json();
      setIsLoading(false);

      if (data.reply) {
        setMessages(prev => [...prev, { role: 'assistant', text: data.reply }]);
        const parsed = extractSuggestedEventFromReply(data.reply);
        if (parsed) {
          setSuggestedEvent(parsed);
        }
      } else {
        setMessages(prev => [...prev, { role: 'assistant', text: 'Sorry, no response from the assistant.' }]);
      }
    } catch (error) {
      console.error('Error talking to assistant:', error);
      setMessages(prev => [...prev, { role: 'assistant', text: 'Something went wrong talking to the assistant.' }]);
    }
  };

  return (
    <div
      className={`fixed right-0 top-0 h-full bg-white border-l border-gray-300 shadow-lg transition-transform duration-300 ease-in-out z-50 w-[340px] ${isOpen ? '' : 'translate-x-full'}`}
    >
      <button
        className="absolute left-[-40px] top-4 bg-blue-500 text-white px-2 py-1 rounded-l"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? '<' : '>'}
      </button>

      <div className="p-4 flex flex-col h-full">
        <h2 className="text-lg font-bold mb-4">Sunny AI</h2>
        <h3 className="text-sm italic mb-3">Want to know the best time to plan an event? Ask your AI assistant!</h3>

        <div className="flex-1 overflow-y-auto space-y-2 mb-4 bg-gray-50 p-2 rounded">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`text-sm p-2 rounded ${msg.role === 'user' ? 'bg-blue-100 text-right' : 'bg-green-100 text-left'}`}
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
