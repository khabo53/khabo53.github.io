import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const MembershipPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Password strength validation
    const password = formData.password;
    const isStrong =
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[^A-Za-z0-9]/.test(password);

    if (!isStrong) {
      alert("⚠️ Password must be at least 8 characters and include uppercase, lowercase, number, and special character.");
      setLoading(false);
      return;
    }

    try {
      console.log("📤 Sending registration request:", formData);

      const response = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log("📥 Server response:", data);

      if (response.ok) {
        alert("🎉 Membership created successfully!");
        setFormData({ name: "", email: "", password: "" });

        // ✅ Redirect after success
        navigate("/ScholarshipsPage"); // Change this to your desired page
      } else {
        alert(`❌ Failed to create membership: ${data.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("🔥 Network or server error:", error);
      alert("⚠️ Could not connect to the server. Please check if the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full">
        <h2 className="text-3xl font-bold mb-4 text-center">Join as a Member</h2>
        <p className="text-gray-600 mb-6 text-center">
          Become part of Basotho Solutions and unlock exclusive resources, networking, and mentorship.
        </p>

        {!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-semibold"
          >
            Apply for Membership
          </button>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-md"
            />
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
              placeholder="Create Password"
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
              {loading ? "Submitting..." : "Sign Up"}
            </button>
            <p className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="text-green-600 hover:underline">
                Login
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default MembershipPage;
