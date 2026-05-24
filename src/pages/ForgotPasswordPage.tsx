import React, { useState } from "react";
import { Link } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await sendPasswordResetEmail(auth, email);
      console.log("Password reset email sent to:", email);
      setSubmitted(true);
    } catch (error: any) {
      console.error("Forgot password error:", error.code, error.message);
      
      switch (error.code) {
        case 'auth/user-not-found':
          setError("No account found with this email address.");
          break;
        case 'auth/invalid-email':
          setError("Please enter a valid email address.");
          break;
        case 'auth/too-many-requests':
          setError("Too many requests. Please try again later.");
          break;
        default:
          setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-center">Reset Your Password</h2>
        <p className="text-gray-600 text-center mb-6">
          Enter your email address and we'll send you a link to reset your password.
        </p>
        
        {submitted ? (
          <div className="text-center">
            <p className="text-green-600 mb-4">
               Password reset link sent to <strong>{email}</strong>!
            </p>
            <p className="text-gray-600 text-sm mb-4">
              Please check your email (including spam folder) and click the link to reset your password.
            </p>
            <Link
              to="/login"
              className="inline-block bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-semibold"
            >
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-md text-sm">
                {error}
              </div>
            )}
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-semibold disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
            <div className="text-center mt-4">
              <Link to="/login" className="text-green-600 hover:underline text-sm">
                Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;