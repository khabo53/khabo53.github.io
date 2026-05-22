import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("🔑 Attempting login with:", formData.email);

      // Sign in with Firebase (client-side auth - no backend needed)
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      console.log("✅ Login successful:", userCredential.user.email);
      
      // Navigate to scholarships page after successful login
      navigate("/scholarships");
      
    } catch (error: any) {
      console.error("❌ Login error:", error.code, error.message);
      
      // User-friendly error messages
      switch (error.code) {
        case 'auth/user-not-found':
          alert("No account found with this email. Please register first.");
          break;
        case 'auth/wrong-password':
          alert("Incorrect password. Please try again.");
          break;
        case 'auth/invalid-email':
          alert("Invalid email format.");
          break;
        case 'auth/too-many-requests':
          alert("Too many failed attempts. Please try again later.");
          break;
        default:
          alert(`Login failed: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full">
        <h2 className="text-3xl font-bold mb-4 text-center">Member Login</h2>
        <p className="text-gray-600 mb-6 text-center">
          Access your Basotho Solutions account.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-md"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-md"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-semibold"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
          <div className="text-center text-sm text-gray-600 space-y-2">
            <p>
              <Link to="/forgot-password" className="text-green-600 hover:underline">
                Forgot password?
              </Link>
            </p>
            <p>
              New here?{" "}
              <Link to="/membership" className="text-green-600 hover:underline">
                Apply for Membership
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;