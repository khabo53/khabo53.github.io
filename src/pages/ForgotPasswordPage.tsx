import React, { useState } from "react";

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        alert("❌ Could not send reset link.");
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      alert("⚠️ Something went wrong.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-center">Reset Your Password</h2>
        {submitted ? (
          <p className="text-green-600 text-center">
            ✅ If your email is registered, a reset link has been sent.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-md"
            />
            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-semibold"
            >
              Send Reset Link
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
