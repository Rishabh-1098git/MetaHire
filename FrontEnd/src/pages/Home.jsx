import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">
        Welcome to MockAI
      </h1>
      <div className="space-x-4">
        <Link to="/signingsignup">
          <button className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
            Sign In / Sign Up
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Home;
