import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getAuth, confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { auth } from "../firebase";

const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [validLink, setValidLink] = useState<boolean | null>(null);
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    // Verify the reset link is valid
    const verifyLink = async () => {
      if (!token) {
        setValidLink(false);
        return;
      }
      
      try {
        await verifyPasswordResetCode(auth, token);
        setValidLink(true);
      } catch (error) {
        console.error("Invalid or expired reset link");
        setValidLink(false);
      }
    };
    
    verifyLink();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    if (!token) {
      setError("Invalid reset link");
      setLoading(false);
      return;
    }

    try {
      await confirmPasswordReset(auth, token, password);
      alert("✅ Password reset successful! Please login with your new password.");
      navigate("/login");
    } catch (error: any) {
      console.error("Reset password error:", error.code, error.message);
      
      switch (error.code) {
        case 'auth/expired-action-code':
          setError("Reset link has expired. Please request a new one.");
          break;
        case 'auth/invalid-action-code':
          setError("Invalid reset link. Please request a new one.");
          break;
        case 'auth/weak-password':
          setError("Password is too weak. Please use a stronger password.");
          break;
        default:
          setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (validLink === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full text-center">
          <p className="text-gray-600">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  if (validLink === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold mb-4 text-red-600">Invalid or Expired Link</h2>
          <p className="text-gray-600 mb-6">
            This password reset link is invalid or has expired.
          </p>
          <Link
            to="/forgot-password"
            className="inline-block bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-semibold"
          >
            Request New Reset Link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-center">Create New Password</h2>
        <p className="text-gray-600 text-center mb-6">
          Please enter your new password below.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          
          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-semibold disabled:opacity-50"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
          
          <div className="text-center mt-4">
            <Link to="/login" className="text-green-600 hover:underline text-sm">
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;