import "./ChatWindow.css";
import Chat from "./Chat.jsx";
import { MyContext } from "./MyContext.jsx";
import { useContext, useState, useEffect } from "react";
import { ScaleLoader } from "react-spinners";

function ChatWindow() {
   const {
    prompt,
    setPrompt,
    reply,
    setReply,
    currThreadId,
    setPrevChats,
    setNewChat,
    setIsAuthenticated
} = useContext(MyContext);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isListening, setIsListening] = useState(false); // Voice state

  const getReply = async () => {
    if (!prompt.trim()) return;

    console.log("1. getReply started");

    setLoading(true);
    setNewChat(false);

    const token = localStorage.getItem("token");

    console.log("2. Token exists:", !!token);
    console.log("3. Sending request to backend...");

    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
            message: prompt,
            threadId: currThreadId
        })
    };

    try {
        // Create an AbortController so that a stuck request can be stopped
        const controller = new AbortController();

        // Stop the request after 60 seconds
        const timeoutId = setTimeout(() => {
            controller.abort();
        }, 60000);

        const response = await fetch(
            "https://sigmagpt-l8z8.onrender.com/api/chat",
            {
                ...options,
                signal: controller.signal
            }
        );

        // Clear the timeout after receiving a response
        clearTimeout(timeoutId);

        console.log("4. Response received:", response.status);

        const res = await response.json();

        console.log("5. Backend response:", res);

       if (response.ok) {

    setReply(res.reply);

} else if (response.status === 401 || response.status === 403) {

    console.log("Token invalid or expired. Logging out...");

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setIsAuthenticated(false);

} else {

    console.log(
        "Backend error:",
        res.error || "Failed to get response"
    );
}
    } catch (err) {

        // Handle request timeout
        if (err.name === "AbortError") {
            console.log("Request timed out. Backend did not respond within 60 seconds.");
        } else {
            console.log("Fetch error:", err);
        }

    } finally {
        // Always stop the loader after the request finishes or fails
        setLoading(false);
        console.log("6. Loading stopped");
    }
};

    // Voice Recognition Handler (Web Speech API)
    const handleVoiceInput = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Speech recognition is not supported in this browser.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = "en-US";
        recognition.interimResults = false;

        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setPrompt(prev => prev + " " + transcript);
            setIsListening(false);
        };
        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);

        recognition.start();
    };

    // Append new chat to prevChats
    useEffect(() => {
        if(prompt && reply) {
            setPrevChats(prevChats => ([
                ...prevChats, {
                    role: "user",
                    content: prompt
                },{
                    role: "assistant",
                    content: reply
                }
            ]));
        }
        setPrompt("");
    }, [reply]);

    const handleProfileClick = () => {
        setIsOpen(!isOpen);
    }

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.reload(); 
    }

    return (
        <div className="chatWindow">
            <div className="navbar">
                <span>SigmaGPT <i className="fa-solid fa-chevron-down"></i></span>
                
                {/* Wrapper for Icon and Dropdown */}
                <div className="profileContainer" style={{ position: "relative" }}>
                    <div className="userIconDiv" onClick={handleProfileClick}>
                        <span className="userIcon"><i className="fa-solid fa-user"></i></span>
                    </div>

                    {isOpen && (
                        <div className="dropDown">
                            <div className="dropDownItem"><i className="fa-solid fa-gear"></i> Settings</div>
                            <div className="dropDownItem"><i className="fa-solid fa-cloud-arrow-up"></i> Upgrade plan</div>
                            <div className="dropDownItem" onClick={handleLogout}><i className="fa-solid fa-arrow-right-from-bracket"></i> Log out</div>
                        </div>
                    )}
                </div>
            </div>
            
            <Chat></Chat>

            <ScaleLoader color="#fff" loading={loading}>
            </ScaleLoader>
            
            <div className="chatInput">
                <div className="inputBox">
                    <input placeholder="Ask anything"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter'? getReply() : ''}
                    >
                    </input>

                    {/* Mic Button added */}
                    <div 
                        onClick={handleVoiceInput} 
                        style={{ cursor: "pointer", color: isListening ? "#ef4444" : "#b4b4b4", marginRight: "12px", display: "flex", alignItems: "center" }}
                        title="Speak"
                    >
                        <i className={`fa-solid ${isListening ? "fa-microphone-slash animate-pulse" : "fa-microphone"}`}></i>
                    </div>

                    <div id="submit" onClick={getReply}><i className="fa-solid fa-paper-plane"></i></div>
                </div>
                <p className="info">
                    SigmaGPT can make mistakes. Check important info. See Cookie Preferences.
                </p>
            </div>
        </div>
    )
}

export default ChatWindow;