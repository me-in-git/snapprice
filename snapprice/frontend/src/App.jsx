import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function SnapPrice() {
  const [address, setAddress] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sensitivity, setSensitivity] = useState(null);

  const [manualMode, setManualMode] = useState(false);
  const [manualBeds, setManualBeds] = useState("");
  const [manualBaths, setManualBaths] = useState("");
  const [manualSqft, setManualSqft] = useState("");

  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [leadLoading, setLeadLoading] = useState(false);

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(price);

  const handlePredict = async () => {
    if (!address.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setSensitivity(null);
    setShowLeadForm(false);
    setLeadSubmitted(false);

    const requestBody = { address };
    if (manualMode) {
      if (manualBeds) requestBody.beds = parseFloat(manualBeds);
      if (manualBaths) requestBody.baths = parseFloat(manualBaths);
      if (manualSqft) requestBody.sqft = parseFloat(manualSqft);
    }

    try {
      const res = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Prediction failed");
      }
      const data = await res.json();
      setResult(data);

      // fetch sensitivity separately, non-blocking
      fetch(`${API_URL}/sensitivity`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      })
        .then((r) => r.json())
        .then(setSensitivity)
        .catch(() => {});
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  const handleListWithUs = async () => {
    if (!leadName || !leadEmail) { alert("Please enter your name and email"); return; }
    setLeadLoading(true);
    try {
      const res = await fetch(`${API_URL}/list-with-us`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: result.address,
          estimated_price: result.estimated_price,
          name: leadName,
          email: leadEmail,
          phone: leadPhone || null,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setLeadSubmitted(true);
      alert(data.message);
    } catch { alert("Something went wrong. Please try again."); }
    finally { setLeadLoading(false); }
  };

  const handleKey = (e) => { if (e.key === "Enter") handlePredict(); };

  const card = {
    background: "#1e1e1e",
    borderRadius: 20,
    padding: "1.5rem",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.3)",
    marginBottom: "1.5rem",
    border: "1px solid #333",
  };

  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", maxWidth: 950, margin: "0 auto", padding: "2rem 1.5rem", background: "#0a0a0a", minHeight: "100vh", color: "#e2e8f0" }}>

      {/* Header */}
      <div style={{ marginBottom: "2rem", textAlign: "center" }}>
        <h1 style={{ fontSize: 48, fontWeight: 800, background: "linear-gradient(135deg, #60a5fa, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", margin: 0, lineHeight: 1.2 }}>
          SnapPrice
        </h1>
        <p style={{ color: "#94a3b8", marginTop: 12, fontSize: 16 }}>AI-powered home valuation with explainable insights</p>
      </div>

      {/* Search Card */}
      <div style={card}>
        <input
          type="text"
          placeholder="Enter property address..."
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          onKeyDown={handleKey}
          style={{ width: "100%", padding: "14px 18px", fontSize: 16, border: "1px solid #333", borderRadius: 12, outline: "none", boxSizing: "border-box", background: "#2a2a2a", color: "#e2e8f0" }}
          onFocus={(e) => (e.target.style.borderColor = "#60a5fa")}
          onBlur={(e) => (e.target.style.borderColor = "#333")}
        />

        <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8 }}>
          <input type="checkbox" id="manualMode" checked={manualMode} onChange={(e) => setManualMode(e.target.checked)} style={{ width: 18, height: 18 }} />
          <label htmlFor="manualMode" style={{ fontSize: 13, color: "#94a3b8" }}>Manually enter property details (skip API lookup)</label>
        </div>

        {manualMode && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 12, paddingTop: 12, borderTop: "1px solid #333" }}>
            {[["Bedrooms", manualBeds, setManualBeds, "1", "e.g., 3"], ["Bathrooms", manualBaths, setManualBaths, "0.5", "e.g., 2"], ["Square Feet", manualSqft, setManualSqft, "1", "e.g., 1800"]].map(([label, val, setter, step, ph]) => (
              <div key={label}>
                <label style={{ fontSize: 12, color: "#94a3b8", display: "block", marginBottom: 4 }}>{label}</label>
                <input type="number" step={step} placeholder={ph} value={val} onChange={(e) => setter(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #333", background: "#2a2a2a", color: "#e2e8f0", boxSizing: "border-box" }} />
              </div>
            ))}
          </div>
        )}

        <button onClick={handlePredict} disabled={loading || !address.trim()}
          style={{ width: "100%", marginTop: 16, background: loading ? "#4a4a4a" : "linear-gradient(135deg, #3b82f6, #8b5cf6)", color: "white", border: "none", borderRadius: 12, padding: "14px", fontSize: 16, fontWeight: 600, cursor: loading || !address.trim() ? "not-allowed" : "pointer" }}>
          {loading ? "Analyzing comps..." : "Get Valuation →"}
        </button>
      </div>

      {error && (
        <div style={{ background: "#2a1a1a", border: "1px solid #dc2626", borderRadius: 12, padding: "14px 18px", color: "#f87171", fontSize: 14, marginBottom: 20 }}>
          ⚠️ {error}
        </div>
      )}

      {result && (
        <div>
          {/* Property Header */}
          <div style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
              <div>
                <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 4 }}>📍 Property Address</div>
                <div style={{ fontSize: 18, fontWeight: 600, color: "#e2e8f0" }}>{result.address}</div>
              </div>
              {result.data_source === "fallback_california_housing" && (
                <span style={{ background: "#4a3a1a", color: "#fbbf24", fontSize: 12, padding: "4px 12px", borderRadius: 99, fontWeight: 600 }}>⚠️ FALLBACK ESTIMATE</span>
              )}
              {result.data_source === "realestateapi" && (
                <span style={{ background: "#1a3a2a", color: "#34d399", fontSize: 12, padding: "4px 12px", borderRadius: 99, fontWeight: 600 }}>✅ LIVE MARKET DATA</span>
              )}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginTop: 20, paddingTop: 20, borderTop: "1px solid #333" }}>
              {[["Bedrooms", result.beds], ["Bathrooms", result.baths], ["Square Feet", result.sqft?.toLocaleString()], ["Year Built", result.year_built]].map(([label, val]) => (
                <div key={label} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: "#e2e8f0" }}>{val ?? "—"}</div>
                  <div style={{ fontSize: 12, color: "#94a3b8" }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Price Card */}
          <div style={{ background: "linear-gradient(135deg, #1e3a5f, #4c1d95)", borderRadius: 20, padding: "2rem", marginBottom: "1.5rem", textAlign: "center", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.3)" }}>
            <p style={{ fontSize: 14, opacity: 0.8, marginBottom: 8, color: "#cbd5e1" }}>Estimated Market Value</p>
            <h2 style={{ fontSize: 56, fontWeight: 800, margin: "8px 0 4px", letterSpacing: "-0.02em", color: "white" }}>
              {formatPrice(result.estimated_price)}
            </h2>
            <p style={{ fontSize: 14, opacity: 0.8, margin: 0, color: "#cbd5e1" }}>
              Range: {formatPrice(result.price_range_low)} — {formatPrice(result.price_range_high)}
            </p>
            {result.avm_reference && (
              <p style={{ fontSize: 12, opacity: 0.6, marginTop: 12, color: "#cbd5e1" }}>
                Lender AVM reference: {formatPrice(result.avm_reference)}
              </p>
            )}
          </div>

          {/* SHAP Breakdown */}
          <div style={card}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#e2e8f0", marginBottom: 4 }}>What's driving this value</h3>
            <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 20 }}>Each feature's contribution to the final price estimate</p>
            {result.explanation.map((e, i) => {
              const maxImpact = Math.max(...result.explanation.map((x) => Math.abs(x.impact)));
              const barWidth = maxImpact > 0 ? (Math.abs(e.impact) / maxImpact) * 100 : 0;
              const isPositive = e.direction === "adds";
              return (
                <div key={i} style={{ marginBottom: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, flexWrap: "wrap", gap: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 500, color: "#cbd5e1" }}>{e.feature}</span>
                    <span style={{ fontSize: 15, fontWeight: 700, color: isPositive ? "#34d399" : "#f87171", background: isPositive ? "#1a3a2a" : "#3a1a1a", padding: "2px 10px", borderRadius: 20 }}>
                      {isPositive ? "+" : "−"}{formatPrice(Math.abs(e.impact))}
                    </span>
                  </div>
                  <div style={{ height: 8, background: "#2a2a2a", borderRadius: 99, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${barWidth}%`, background: isPositive ? "linear-gradient(90deg, #10b981, #34d399)" : "linear-gradient(90deg, #ef4444, #f87171)", borderRadius: 99, transition: "width 0.5s ease" }} />
                  </div>
                  {/* <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>
                    Current value: {typeof e.value === "number" ? e.value.toLocaleString() : e.value}
                  </div> */}
                </div>
              );
            })}
          </div>

          {/* What-if Simulator */}
          <div style={card}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#e2e8f0", marginBottom: 4 }}>What-if simulator</h3>
            <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 20 }}>See how changes to the property affect estimated value</p>
            {sensitivity ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
                {[
                  { label: "Each additional bedroom adds", value: sensitivity.bed_impact, sub: "per extra bedroom" },
                  { label: "Each additional bathroom adds", value: sensitivity.bath_impact, sub: "per extra bathroom" },
                  { label: "Each 100 sq ft adds", value: sensitivity.sqft_100_impact, sub: "per 100 additional sq ft" },
                ].map((item, i) => (
                  <div key={i} style={{ background: "#2a2a2a", borderRadius: 12, padding: 12, textAlign: "center" }}>
                    <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 6 }}>{item.label}</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: item.value > 0 ? "#34d399" : "#f87171" }}>
                      {formatPrice(Math.abs(item.value))}
                    </div>
                    <div style={{ fontSize: 10, color: "#64748b", marginTop: 4 }}>{item.sub}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: "#64748b", fontSize: 13 }}>Loading sensitivity analysis...</div>
            )}
          </div>

          {/* Summary */}
          <div style={{ background: "#2a1a1a", borderRadius: 16, padding: "1rem 1.25rem", marginBottom: "1.5rem", borderLeft: "4px solid #f59e0b" }}>
            <p style={{ fontSize: 14, color: "#fbbf24", lineHeight: 1.5, margin: 0 }}>💡 {result.summary}</p>
            {result.comp_count > 0 && (
              <p style={{ fontSize: 12, color: "#d97706", marginTop: 8, marginBottom: 0 }}>📊 Based on {result.comp_count} nearby comparable sales</p>
            )}
          </div>

          {/* Lead Gen */}
          {!leadSubmitted ? (
            <div style={{ ...card, textAlign: "center" }}>
              {!showLeadForm ? (
                <>
                  <h3 style={{ fontSize: 20, fontWeight: 700, color: "#e2e8f0", marginBottom: 8 }}>Ready to sell?</h3>
                  <p style={{ fontSize: 14, color: "#94a3b8", marginBottom: 20 }}>Get connected with a top local agent who can sell your home for the best price</p>
                  <button onClick={() => setShowLeadForm(true)}
                    style={{ background: "#10b981", color: "white", border: "none", borderRadius: 12, padding: "14px 28px", fontSize: 16, fontWeight: 600, cursor: "pointer", width: "100%", maxWidth: 300 }}>
                    List This Property →
                  </button>
                </>
              ) : (
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 600, color: "#e2e8f0", marginBottom: 16 }}>Get matched with an agent</h3>
                  <div style={{ maxWidth: 400, margin: "0 auto" }}>
                    {[["text", "Your full name *", leadName, setLeadName], ["email", "Your email *", leadEmail, setLeadEmail], ["tel", "Phone (optional)", leadPhone, setLeadPhone]].map(([type, ph, val, setter]) => (
                      <input key={ph} type={type} placeholder={ph} value={val} onChange={(e) => setter(e.target.value)}
                        style={{ width: "100%", padding: "12px 14px", marginBottom: 12, borderRadius: 10, border: "1px solid #333", background: "#2a2a2a", color: "#e2e8f0", fontSize: 14, boxSizing: "border-box" }} />
                    ))}
                    <button onClick={handleListWithUs} disabled={leadLoading}
                      style={{ background: "#3b82f6", color: "white", border: "none", borderRadius: 10, padding: "12px 20px", fontSize: 15, fontWeight: 600, cursor: leadLoading ? "not-allowed" : "pointer", width: "100%" }}>
                      {leadLoading ? "Submitting..." : "Get Matched With an Agent →"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ background: "#1a3a2a", borderRadius: 20, padding: "1.5rem", textAlign: "center", border: "1px solid #34d399" }}>
              <div style={{ fontSize: 48, marginBottom: 8 }}>🎉</div>
              <p style={{ color: "#34d399", fontWeight: 600, fontSize: 16, marginBottom: 8 }}>Lead submitted successfully!</p>
              <p style={{ fontSize: 13, color: "#6ee7b7" }}>A top local agent will contact you within 1 hour.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}