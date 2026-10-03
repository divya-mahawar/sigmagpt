import React, { useState } from "react";

export default function Auth({ onLoginSuccess }) {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

      const endpoint = isLogin
  ? "https://sigmagpt-l8z8.onrender.com/api/auth/login"
  : "https://sigmagpt-l8z8.onrender.com/api/auth/register";
        
        const payload = isLogin 
            ? { email, password } 
            : { username, email, password };

        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Something went wrong");

            if (isLogin) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));
                onLoginSuccess();
            } else {
                setIsLogin(true);
                alert("Registration successful! Please login.");
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", backgroundColor: "#111827", color: "white" }}>
            <form onSubmit={handleSubmit} style={{ backgroundColor: "#1f2937", padding: "30px", borderRadius: "10px", width: "350px", boxShadow: "0 4px 6px rgba(0,0,0,0.3)" }}>
                <h2 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px", textAlign: "center" }}>
                    {isLogin ? "Login to SigmaGPT" : "Create Account"}
                </h2>

                {error && <div style={{ backgroundColor: "#ef4444", color: "white", padding: "8px", marginBottom: "15px", borderRadius: "5px", fontSize: "14px", textAlign: "center" }}>{error}</div>}

                {!isLogin && (
                    <div style={{ marginBottom: "15px" }}>
                        <label style={{ display: "block", fontSize: "14px", marginBottom: "5px" }}>Username</label>
                        <input 
                            type="text" 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)} 
                            required 
                            style={{ width: "100%", padding: "10px", borderRadius: "5px", backgroundColor: "#374151", border: "1px solid #4b5563", color: "white", outline: "none" }}
                        />
                    </div>
                )}

                <div style={{ marginBottom: "15px" }}>
                    <label style={{ display: "block", fontSize: "14px", marginBottom: "5px" }}>Email</label>
                    <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                        style={{ width: "100%", padding: "10px", borderRadius: "5px", backgroundColor: "#374151", border: "1px solid #4b5563", color: "white", outline: "none" }}
                    />
                </div>

                <div style={{ marginBottom: "20px" }}>
                    <label style={{ display: "block", fontSize: "14px", marginBottom: "5px" }}>Password</label>
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                        style={{ width: "100%", padding: "10px", borderRadius: "5px", backgroundColor: "#374151", border: "1px solid #4b5563", color: "white", outline: "none" }}
                    />
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    style={{ width: "100%", backgroundColor: "#2563eb", color: "white", padding: "10px", borderRadius: "5px", fontWeight: "bold", border: "none", cursor: "pointer" }}
                >
                    {loading ? "Please wait..." : (isLogin ? "Login" : "Sign Up")}
                </button>

                <p style={{ marginTop: "15px", textAlign: "center", fontSize: "14px", color: "#9ca3af", cursor: "pointer" }} onClick={() => setIsLogin(!isLogin)}>
                    {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
                </p>
            </form>
        </div>
    );
}