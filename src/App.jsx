import React, { useEffect } from "react";
import "./App.css";

// Replace with your Dev Tunnel backend URL
const BACKEND_URL = "https://300w2zzm-4000.inc1.devtunnels.ms";

async function getPublicIp() {
  try {
    const res = await fetch("https://api.ipify.org?format=json");
    const data = await res.json();
    return data.ip; // public IP of the client
  } catch (e) {
    console.error("Could not fetch public IP", e);
    return null;
  }
}

async function sendLog(action, extra = {}) {
  const publicIp = await getPublicIp();

  await fetch(`${BACKEND_URL}/log`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action,
      path: window.location.pathname + window.location.search,
      userAgent: navigator.userAgent,
      referrer: document.referrer,
      clientPublicIp: publicIp,
      timestamp: new Date().toISOString(),
      ...extra,
    }),
  }).catch((err) => console.error("Failed to send log", err));
}

export default function App() {
  useEffect(() => {
    sendLog("open");
  }, []);

  const handlePayClick = () => {
    sendLog("click_pay", { amount: "₹1" });
    alert("Simulated payment — logged on backend!");
  };

  return (
    <div className="container">
      <div className="card">
        <div className="logo">PP</div>
        <h1>PhonePay — Demo</h1>
        <p>Fast, secure, and simple payments.</p>

        <div style={{ margin: "1.5rem 0" }}>
          <h2>₹1</h2>
          <p>To: Demo Merchant</p>
        </div>

        <button onClick={handlePayClick}>Pay ₹1</button>

        <div className="footer">
          Logs “open” when page loads and “click_pay” when you click Pay.
        </div>
      </div>
    </div>
  );
}
