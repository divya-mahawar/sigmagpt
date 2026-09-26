const API_URL = "http://localhost:8080/api";

export const explainSelectedText = async (selectedText, question) => {
    const token = localStorage.getItem("token");

    console.log("Selected text:", selectedText);
    console.log("Question:", question);
    console.log("Token exists:", !!token);

    const response = await fetch(`${API_URL}/explain-selection`, {
        method: "POST",

        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },

        body: JSON.stringify({
            selectedText,
            question
        })
    });

    console.log("Explain API status:", response.status);

    const data = await response.json();

    console.log("Explain API response:", data);

    if (!response.ok) {
        throw new Error(data.error || "Failed to explain selected text");
    }

    return data.explanation;
};