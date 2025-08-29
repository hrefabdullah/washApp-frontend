import { useState } from "react";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");

      onLogin(data); // Pass user/token to parent
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b141a] text-[#e9edef] font-sans">
      <div className="w-full max-w-md p-8 bg-[#111b21] rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6 text-center">Login</h2>

        {error && (
          <div className="mb-4 p-2 bg-red-600 text-white rounded">{error}</div>
        )}

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="p-3 rounded-md bg-[#2a3942] border border-[#2a3942] outline-none text-[#e9edef] focus:border-[#00a884]"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="p-3 rounded-md bg-[#2a3942] border border-[#2a3942] outline-none text-[#e9edef] focus:border-[#00a884]"
          />
          <button
            type="submit"
            className="bg-[#00a884] text-[#062e2b] font-bold py-3 rounded-md hover:brightness-105"
          >
            Login
          </button>
        </form>

        <div className="mt-4 text-sm text-[#8696a0] text-center">
          Don’t have an account?{" "}
          <button className="text-[#00a884] font-semibold hover:underline">
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}
