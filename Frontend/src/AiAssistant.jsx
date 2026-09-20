import React, { useState, useRef, useEffect } from "react";

export default function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Namaste! I am AgriGuard Assistant. Ask me about crop diseases, medicines, or ask me to translate advice to Hindi. (फसल रोग या दवाइयों के बारे में पूछें)",
    },
  ]);

  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    const updatedMessages = [...messages, { sender: "user", text: userText }];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      // ✅ Sahi backend endpoint path (/api/ai/assistant/chat)
      const res = await fetch("http://localhost:5557/api/ai/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.slice(-6),
          userQuery: userText,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMessages((prev) => [...prev, { sender: "bot", text: data.reply }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: data.message || "Failed to fetch answer. Please try again." },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Connection error. Please check your server." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "fixed", bottom: "24px", right: "24px", zIndex: 1000, fontFamily: "sans-serif" }}>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            backgroundColor: "#2E7D32",
            color: "#fff",
            border: "none",
            borderRadius: "50px",
            padding: "12px 20px",
            fontSize: "15px",
            fontWeight: "bold",
            cursor: "pointer",
            boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span>🌱</span> AgriGuard Assistant
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          style={{
            width: "360px",
            height: "480px",
            backgroundColor: "#ffffff",
            borderRadius: "14px",
            boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            border: "1px solid #c8e6c9",
          }}
        >
          {/* Header */}
          <div
            style={{
              backgroundColor: "#2E7D32",
              color: "#fff",
              padding: "12px 16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontWeight: "bold", fontSize: "15px" }}>🌱 AgriGuard Assistant</div>
              <div style={{ fontSize: "11px", opacity: 0.85 }}>Diseases, Medicines & Translation</div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: "transparent",
                border: "none",
                color: "#fff",
                fontSize: "18px",
                cursor: "pointer",
              }}
            >
              ✕
            </button>
          </div>

          {/* Messages Area */}
          <div style={{ flex: 1, padding: "14px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px", backgroundColor: "#f9fbf9" }}>
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  alignSelf: m.sender === "user" ? "flex-end" : "flex-start",
                  backgroundColor: m.sender === "user" ? "#2E7D32" : "#ffffff",
                  color: m.sender === "user" ? "#ffffff" : "#222222",
                  padding: "8px 12px",
                  borderRadius: "10px",
                  maxWidth: "80%",
                  fontSize: "13px",
                  lineHeight: "1.4",
                  border: m.sender === "bot" ? "1px solid #e0e0e0" : "none",
                  whiteSpace: "pre-wrap",
                }}
              >
                {m.text}
              </div>
            ))}
            {loading && (
              <div style={{ alignSelf: "flex-start", fontSize: "12px", color: "#666", fontStyle: "italic" }}>
                Thinking...
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Form */}
          <form
            onSubmit={handleSend}
            style={{
              display: "flex",
              padding: "10px",
              borderTop: "1px solid #e0e0e0",
              backgroundColor: "#fff",
              gap: "8px",
            }}
          >
            <input
              type="text"
              placeholder="Ask disease, medicine or translation..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              style={{
                flex: 1,
                padding: "8px 12px",
                border: "1px solid #ccc",
                borderRadius: "6px",
                fontSize: "13px",
                outline: "none",
              }}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              style={{
                backgroundColor: "#2E7D32",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                padding: "8px 14px",
                fontSize: "13px",
                cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                fontWeight: "600",
              }}
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}