import "./Sidebar.css";
import { useContext, useEffect} from "react";
import { MyContext } from "./MyContext.jsx";
import { v1 as uuidv1 } from "uuid";

function Sidebar() {
    const { allThreads, setAllThreads, currThreadId, setNewChat, setPrompt, setReply, setCurrThreadId, setPrevChats } = useContext(MyContext);

    // Helper function to get auth headers
    const getAuthHeaders = () => {
        const token = localStorage.getItem("token");
        return {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        };
    };

    const getAllThreads = async () => {
        try {
            const response = await fetch("https://sigmagpt-l8z8.onrender.com/api/thread", {
                headers: getAuthHeaders()
            });
            const res = await response.json();
            if (response.ok) {
                const filteredData = res.map(thread => ({ threadId: thread.threadId, title: thread.title }));
                setAllThreads(filteredData);
            }
        } catch (err) {
            console.log(err);
        }
    };

useEffect(() => {
        getAllThreads();
    }, []);

    const createNewChat = () => {
        setNewChat(true);
        setPrompt("");
        setReply(null);
        setCurrThreadId(uuidv1());
        setPrevChats([]);
    }

    const changeThread = async (newThreadId) => {
        setCurrThreadId(newThreadId);

        try {
            const response = await fetch(`https://sigmagpt-l8z8.onrender.com/api/thread/${newThreadId}`, {
                headers: getAuthHeaders()
            });
            const res = await response.json();
            if (response.ok) {
                setPrevChats(res);
                setNewChat(false);
                setReply(null);
            }
        } catch (err) {
            console.log(err);
        }
    }   

    const deleteThread = async (threadId) => {
        try {
            // FIX: newThreadId ki jagah threadId use kiya hai
            const response = await fetch(`https://sigmagpt-l8z8.onrender.com/api/thread/${threadId}`, { 
                method: "DELETE",
                headers: getAuthHeaders()
            });
            const res = await response.json();
            
            if (response.ok) {
                // updated threads re-render
                setAllThreads(prev => prev.filter(thread => thread.threadId !== threadId));

                if (threadId === currThreadId) {
                    createNewChat();
                }
            }
        } catch (err) {
            console.log(err);
        }
    }

    return (
        <section className="sidebar">
            <button onClick={createNewChat}>
                <img src="src/assets/blacklogo.png" alt="gpt logo" className="logo"></img>
                <span><i className="fa-solid fa-pen-to-square"></i></span>
            </button>

            <ul className="history">
                {
                    allThreads?.map((thread, idx) => (
                        <li key={idx} 
                            onClick={(e) => changeThread(thread.threadId)}
                            className={thread.threadId === currThreadId ? "highlighted": " "}
                        >
                            {thread.title}
                            <i className="fa-solid fa-trash"
                                onClick={(e) => {
                                    e.stopPropagation(); //stop event bubbling
                                    deleteThread(thread.threadId);
                                }}
                            ></i>
                        </li>
                    ))
                }
            </ul>
 
            <div className="sign">
                <p>By Divya &hearts;</p>
            </div>
        </section>
    )
}

export default Sidebar;