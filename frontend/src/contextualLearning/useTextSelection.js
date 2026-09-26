import { useEffect, useState } from "react";

const useTextSelection = () => {
    const [selection, setSelection] = useState({
        text: "",
        position: null
    });

    useEffect(() => {

        // Detect when the user finishes selecting text
        const handleSelection = () => {
            const windowSelection = window.getSelection();

            // Get the selected text
            const text = windowSelection?.toString().trim();

            if (!text) {
                setSelection({
                    text: "",
                    position: null
                });
                return;
            }

            // Find the element containing the selected text
            const selectedNode = windowSelection.anchorNode;

            if (!selectedNode) return;

            const gptDiv = selectedNode.parentElement?.closest(".gptDiv");

            // Only allow selection from AI responses
            if (!gptDiv) {
                setSelection({
                    text: "",
                    position: null
                });
                return;
            }

            // Get the position of the selected text
            const range = windowSelection.getRangeAt(0);
            const rect = range.getBoundingClientRect();

            setSelection({
                text,
                position: {
                    top: rect.bottom + 8,
                    left: rect.left
                }
            });

            console.log("Selected text:", text);
        };

        document.addEventListener("mouseup", handleSelection);

        return () => {
            document.removeEventListener("mouseup", handleSelection);
        };

    }, []);

    return selection;
};

export default useTextSelection;