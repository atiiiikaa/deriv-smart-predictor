import React, { useState } from "react";

export default function App() {
  const [token, setToken] = useState("");
  const [prediction, setPrediction] = useState("");

  const handlePredict = () => {
    const outcomes = ["even", "odd", "high", "under"];
    const next = outcomes[Math.floor(Math.random() * outcomes.length)];
    setPrediction(next);
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial" }}>
      <h1>🧠 Deriv Smart Predictor</h1>
      <input
        type="text"
        placeholder="Enter your Deriv API token"
        value={token}
        onChange={(e) => setToken(e.target.value)}
        style={{ width: "300px", padding: "8px", marginBottom: "1rem" }}
      />
      <br />
      <button onClick={handlePredict} style={{ padding: "10px 20px" }}>
        Predict Outcome
      </button>
      {prediction && (
        <p style={{ marginTop: "1rem", fontSize: "1.2rem" }}>
          Next prediction: <strong>{prediction}</strong>
        </p>
      )}
    </div>
  );
}
