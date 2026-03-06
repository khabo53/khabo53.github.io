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

      // 1️⃣ Sign in with Firebase (client-side auth)
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // 2️⃣ Get Firebase ID token securely
      const idToken = await userCredential.user.getIdToken();

      // 3️⃣ Send token to backend for verification
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }), // ✅ only send token
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Login failed");
      }

      const data = await response.json();
      console.log("✅ Backend verified user:", data);

      // ✅ Optionally store user info or token locally
      localStorage.setItem("user", JSON.stringify(data));

      // 4️⃣ Navigate based on plan or role
      switch (data.user?.plan) {
        case "admin":
          navigate("/admin/dashboard");
          break;
        case "premium":
          navigate("/premium/home");
          break;
        default:
          navigate("/scholarships");
          break;
      }
    } catch (error: any) {
      console.error("❌ Login error:", error.message);
      alert(`Login failed: ${error.message}`);
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
