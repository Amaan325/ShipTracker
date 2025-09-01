import React, { useState } from "react";
import axios from "axios";

const EngineerForm = () => {
  const [engineerName, setEngineerName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/engineers", { engineerName, email, phoneNumber });
      alert("Engineer added successfully!");
      setEngineerName("");
      setEmail("");
      setPhoneNumber("");
    } catch (err) {
      console.error(err);
      alert("Error adding engineer");
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-12 p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-6">Engineer Information</h2>
      <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Engineer Name"
          value={engineerName}
          onChange={(e) => setEngineerName(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
          required
        />
        <input
          type="tel"
          placeholder="Phone Number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
          required
        />
        <button
          type="submit"
          className="bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default EngineerForm;
