import React from "react";

const ConsultingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-md rounded-lg p-8 max-w-2xl text-center">
        <h2 className="text-3xl font-bold mb-4">Book Consulting</h2>
        <p className="text-gray-600 mb-6">
          Work with our expert team to develop tailored strategies in
          agriculture, renewable energy, climate change, and sustainability.
        </p>
        <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full">
          Book a Session
        </button>
      </div>
    </div>
  );
};

export default ConsultingPage;
