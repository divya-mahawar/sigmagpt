import "./Chat.css";
import React, { useContext, useState, useEffect } from "react";
import { MyContext } from "./MyContext";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import useTextSelection from "./contextualLearning/useTextSelection";

import SelectionPopup from "./contextualLearning/SelectionPopup.jsx";
import ContextLearning from "./contextualLearning/ContextLearning.jsx";

function Chat() {
     const selection = useTextSelection();

    const {newChat, prevChats, reply} = useContext(MyContext);
    const [latestReply, setLatestReply] = useState(null);
  const [isContextOpen, setIsContextOpen] = useState(false);
const [contextText, setContextText] = useState("");


      const handleExplain = () => {
        console.log("Explain clicked for:", selection.text);
        setContextText(selection.text);
        setIsContextOpen(true);
    };

    useEffect(() => {
        if(reply === null) {
            setLatestReply(null); //prevchat load
            return;
        }

        if(!prevChats?.length) return;

        const content = reply.split(" "); //individual words

        let idx = 0;
        const interval = setInterval(() => {
            setLatestReply(content.slice(0, idx+1).join(" "));

            idx++;
            if(idx >= content.length) clearInterval(interval);
        }, 40);

        return () => clearInterval(interval);

    }, [prevChats, reply])

    return (
        <>
            {newChat && <h1>Start a New Chat!</h1>}
            <div className="chats">
            <SelectionPopup
    position={selection.position}
    onExplain={handleExplain}
/>

{isContextOpen && (
    <ContextLearning
        selectedText={contextText}
        onClose={() => setIsContextOpen(false)}
    />
)}
                {
                    prevChats?.slice(0, -1).map((chat, idx) => 
                        <div className={chat.role === "user"? "userDiv" : "gptDiv"} key={idx}>
                            {
                                chat.role === "user"? 
                                <p className="userMessage">{chat.content}</p> : 
                                <ReactMarkdown rehypePlugins={[rehypeHighlight]}>{chat.content}</ReactMarkdown>
                            }
                        </div>
                    )
                }

                {
                    prevChats.length > 0  && (
                        <>
                            {
                                latestReply === null ? (
                                    <div className="gptDiv" key={"non-typing"} >
                                    <ReactMarkdown rehypePlugins={[rehypeHighlight]}>{prevChats[prevChats.length-1].content}</ReactMarkdown>
                                </div>
                                ) : (
                                    <div className="gptDiv" key={"typing"} >
                                     <ReactMarkdown rehypePlugins={[rehypeHighlight]}>{latestReply}</ReactMarkdown>
                                </div>
                                )

                            }
                        </>
                    )
                }

            </div>
        </>
    )
}

export default Chat;