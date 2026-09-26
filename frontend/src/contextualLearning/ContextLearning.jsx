import "./ContextLearning.css";
import { useState } from "react";
import { explainSelectedText } from "./contextLearningApi.js";

function ContextLearning({ selectedText, onClose }) {

    const [question, setQuestion] = useState("");
    const [explanation, setExplanation] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const askQuestion = async (customQuestion = "") => {

        const userQuestion = customQuestion || question;

        if (!userQuestion.trim()) return;

        setLoading(true);
        setError("");

        try {
            const result = await explainSelectedText(
                selectedText,
                userQuestion
            );

            setExplanation(result);
            setQuestion("");

        } catch (err) {
            console.log("Context learning error:", err);
            setError("Failed to generate explanation.");
        } finally {
            setLoading(false);
        }
    };

    const handleSimpleExplain = () => {
        askQuestion(
            "Explain this selected text in very simple language with an easy example."
        );
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            askQuestion();
        }
    };

    return (
        <div className="contextLearningPanel">

            <div className="contextLearningHeader">
                <h3>Context Learning</h3>

                <button onClick={onClose}>
                    ✕
                </button>
            </div>

            <div className="selectedContext">

                <p className="contextLabel">
                    Selected text
                </p>

                <p className="selectedText">
                    {selectedText}
                </p>

            </div>

            <button
                className="simpleExplainButton"
                onClick={handleSimpleExplain}
            >
                🧒 Simple Explain
            </button>

            <div className="contextInputBox">

                <input
                    type="text"
                    placeholder="Ask anything about this..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={handleKeyDown}
                />

                <button onClick={() => askQuestion()}>
                    ➤
                </button>

            </div>

            {loading && (
                <div className="contextLoading">
                    Thinking...
                </div>
            )}

            {error && (
                <div className="contextError">
                    {error}
                </div>
            )}

            {explanation && (
                <div className="explanationBox">

                    <p className="contextLabel">
                        Explanation
                    </p>

                    <p className="explanationText">
                        {explanation}
                    </p>

                </div>
            )}

        </div>
    );
}

export default ContextLearning;