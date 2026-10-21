
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import "../css/aichat.css";

function AIChat() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Check Firebase login status.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
        navigate("/login", { replace: true });
      }

      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  // Scroll to the latest chat message.
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Upload a PDF for the logged-in user.
  const handleChatFileUpload = async (event) => {
    const file = event.target.files?.[0];

    // Allow selecting the same file again later.
    event.target.value = "";

    if (!file) return;

    if (
      file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      setError("Please select a PDF file only.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("PDF size must not exceed 10 MB.");
      return;
    }

    const currentUser = auth.currentUser;

    if (!currentUser) {
      navigate("/login", { replace: true });
      return;
    }

    const formData = new FormData();
    formData.append("document", file);
    formData.append("userId", currentUser.uid);

    setError("");
    setUploading(true);

    try {
      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "PDF upload failed.");
      }

      // Support common response shapes from the upload endpoint.
      const uploadedFile =
        data.file || data.document || data;

      const filename =
        uploadedFile.filename ||
        uploadedFile.file?.filename;

      if (!filename) {
        throw new Error(
          "Upload response did not include a filename. Check the backend /upload response."
        );
      }

      setSelectedFile({
        filename,
        originalName:
          uploadedFile.originalName ||
          uploadedFile.originalname ||
          file.name,
      });

      setMessages((previous) => [
        ...previous,
        {
          type: "ai",
          text: `📄 ${file.name} uploaded successfully. You can now ask questions about this document.`,
        },
      ]);
    } catch (uploadError) {
      console.error("Chat PDF upload error:", uploadError);
      setError(uploadError.message || "Unable to upload the PDF.");
    } finally {
      setUploading(false);
    }
  };

  // Send a message to the backend AI chat endpoint.
  const sendMessage = async () => {
    const userMessage = message.trim();

    if (!userMessage || loading || uploading) return;

    const currentUser = auth.currentUser;

    if (!currentUser) {
      navigate("/login", { replace: true });
      return;
    }

    setError("");
    setMessages((previous) => [
      ...previous,
      { type: "user", text: userMessage },
    ]);

    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          filename: selectedFile?.filename || null,
          userId: currentUser.uid,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "AI response failed.");
      }

      if (!data.reply) {
        throw new Error("The AI service returned an empty response.");
      }

      setMessages((previous) => [
        ...previous,
        {
          type: "ai",
          text: data.reply,
        },
      ]);
    } catch (chatError) {
      console.error("AI chat error:", chatError);
      setError(
        chatError.message ||
          "Unable to connect to the AI service. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const startNewChat = () => {
    if (loading || uploading) return;

    setMessages([]);
    setMessage("");
    setSelectedFile(null);
    setError("");
  };

  if (authLoading) {
    return (
      <main className="ai-chat-page">
        <p>Checking your login...</p>
      </main>
    );
  }

  if (!user) return null;

  return (
    <div className="ai-chat-page">
      {/* Header */}
      <div className="ai-chat-header">
        <button
          className="back-btn"
          onClick={() => navigate("/dashboard")}
        >
          ← Dashboard
        </button>

        <div>
          <h1>🤖 AI Legal Assistant</h1>
          <p>Ask questions and understand legal concepts easily.</p>
        </div>

        <button
          type="button"
          onClick={startNewChat}
          disabled={loading || uploading}
        >
          + New Chat
        </button>
      </div>

      {/* Chat container */}
      <div className="chat-container">
        <div className="chat-messages">
          {messages.length === 0 ? (
            <div className="chat-empty">
              <div className="chat-icon">🤖</div>

              <h2>How can I help you?</h2>

              <p>
                Ask me about legal concepts or upload a PDF to discuss
                its contents.
              </p>

              <div className="suggestions">
                <button
                  onClick={() =>
                    setMessage("What is a legal contract?")
                  }
                >
                  📄 What is a legal contract?
                </button>

                <button
                  onClick={() =>
                    setMessage(
                      "What should I check before signing a contract?"
                    )
                  }
                >
                  📌 What should I check before signing?
                </button>

                <button
                  onClick={() =>
                    setMessage(
                      "Explain legal risks in simple words."
                    )
                  }
                >
                  ⚠️ Explain legal risks
                </button>
              </div>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={`${index}-${msg.type}`}
                className={`chat-message ${msg.type}`}
              >
                <div className="message-icon">
                  {msg.type === "user" ? "👤" : "🤖"}
                </div>

                <div className="message-content">
                  {msg.text}
                </div>
              </div>
            ))
          )}

          {loading && (
            <div className="chat-message ai">
              <div className="message-icon">🤖</div>
              <div className="message-content">
                Thinking...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Selected document indicator */}
        {selectedFile && (
          <div className="chat-selected-file">
            <span>
              📎 {selectedFile.originalName}
            </span>

            <button
              type="button"
              onClick={() => setSelectedFile(null)}
              disabled={loading || uploading}
              aria-label="Remove selected document"
            >
              Remove
            </button>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="chat-error" role="alert">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
        )}

        {/* Input area */}
        <div className="chat-input-area">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            hidden
            onChange={handleChatFileUpload}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || loading}
          >
            {uploading ? "Uploading..." : "📎 PDF"}
          </button>

          <input
            type="text"
            placeholder={
              selectedFile
                ? "Ask about your uploaded document..."
                : "Ask a legal question..."
            }
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                sendMessage();
              }
            }}
            disabled={loading || uploading}
          />

          <button
            type="button"
            onClick={sendMessage}
            disabled={loading || uploading || !message.trim()}
          >
            {loading ? "..." : "Send ➤"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AIChat;
