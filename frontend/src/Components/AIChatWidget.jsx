import { useState } from "react";

const AIChatWidget = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(true);

  const sendMessage = async () => {
    if (!input.trim()) return;
    setMessages([...messages, { from: "user", text: input }]);
    setLoading(true);

    
    const response = await fetch("/api/ai-chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: input }),
    });
    const data = await response.json();
    let reply = "Sorry, I couldn't understand that.";
    if (data && data.reply) {
      reply = data.reply;
    }
    setMessages((msgs) => [...msgs, { from: "ai", text: reply }]);
    setInput("");
    setLoading(false);
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {open ? (
        <div className="w-80 bg-white border rounded-xl shadow-lg">
          <div className="p-4 border-b font-bold bg-purple-100 flex items-center justify-between">
            <span>AI FAQ Chat</span>
            <button
              className="ml-2 text-xl text-purple-600 hover:text-purple-800 focus:outline-none"
              onClick={() => setOpen(false)}
              title="Hide Chat"
            >
              &#x25BC; {/* Down arrow */}
            </button>
          </div>
          <div className="p-4 h-64 overflow-y-auto flex flex-col gap-2">
            {messages.map((msg, i) => (
              <div key={i} className={msg.from === "user" ? "text-right" : "text-left"}>
                <span className={msg.from === "user" ? "bg-purple-200 px-2 py-1 rounded" : "bg-gray-200 px-2 py-1 rounded"}>
                  {msg.text}
                </span>
              </div>
            ))}
            {loading && <div className="text-gray-400">AI is typing...</div>}
          </div>
          <div className="flex border-t">
            <input
              className="flex-1 px-2 py-1 outline-none"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMessage()}
              placeholder="Ask a question..."
            />
            <button className="px-4 py-1 bg-purple-600 text-white" onClick={sendMessage} disabled={loading}>
              Send
            </button>
          </div>
        </div>
      ) : (
        <button
          className="w-80 bg-purple-600 text-white rounded-xl shadow-lg flex items-center justify-center py-3 text-lg font-bold hover:bg-purple-700 transition"
          onClick={() => setOpen(true)}
          title="Show Chat"
        >
          <span className="mr-2">AI FAQ Chat</span>
          <span className="text-2xl">&#x25B2;</span> {/* Up arrow */}
        </button>
      )}
    </div>
  );
};

export default AIChatWidget;