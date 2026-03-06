import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const ResetPasswordPage: React.FC = () => {
  const { token } = useParams(); // token from URL
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const isStrong =
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[^A-Za-z0-9]/.test(password);

    if (!isStrong) {
      setMessage("⚠️ Password must be at least 8 characters and include uppercase, lowercase, number, and special character.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        setMessage("✅ Password reset successful. You can now log in.");
        setTimeout(() => navigate("/login"), 5000);
      } else {
        setMessage("❌ Invalid or expired reset link.");
      }
    } catch (error) {
      console.error("Reset error:", error);
      setMessage("⚠️ Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-center">Reset Your Password</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-md"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-semibold"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
          {message && <p className="text-center text-sm text-gray-700 mt-2">{message}</p>}
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
