"use client";

import { useEffect, useState } from "react";
import styles from "./isobar.module.css";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function IsoBarPage() {
    const [activeTab, setActiveTab] = useState("predict");
    const [dailyContext, setDailyContext] = useState(null);
    const [prediction, setPrediction] = useState(null);
    const [loading, setLoading] = useState(false);

    // Predict Form
    const [simForm, setSimForm] = useState({ weather: "Sunny", event: "None" });

    // Diary Form
    const today = new Date().toISOString().split('T')[0];
    const [diaryForm, setDiaryForm] = useState({ date: today, weather_tag: "Sunny", event_tag: "None", notes: "" });

    // Fetch Today's Context
    const fetchContext = async () => {
        const token = localStorage.getItem("token");
        if (!token) { window.location.href = "/login"; return; }

        try {
            const res = await fetch(`/api/modules/daily-context/${today}`, { headers: { "Authorization": `Bearer ${token}` } });
            if (res.ok) {
                const data = await res.json();
                setDailyContext(data);
                setDiaryForm({
                    date: data.date,
                    weather_tag: data.weather_tag,
                    event_tag: data.event_tag,
                    notes: data.notes || ""
                });
            }
        } catch (err) {
            // No context found is fine (404)
        }
    };

    useEffect(() => {
        if (activeTab === "diary") fetchContext();
    }, [activeTab]);

    const handlePredict = async (e) => {
        e.preventDefault();
        setLoading(true);
        const token = localStorage.getItem("token");

        try {
            const res = await fetch("/api/settings/predict", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify(simForm)
            });

            if (res.ok) {
                const data = await res.json();
                setPrediction(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveContext = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");

        const res = await fetch("/api/modules/daily-context", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify(diaryForm)
        });

        if (res.ok) {
            alert("Context Saved!");
            fetchContext();
        } else {
            alert("Failed to save context");
        }
    };

    return (
        <main className={styles.container}>
            <header className={styles.header}>
                <h1>🌡️ IsoBar: Demand Sensing</h1>
                <p>Context-Aware Forecasting. Predict sales based on Weather, Events, and History.</p>
            </header>

            <div className={styles.tabs}>
                <button className={`${styles.tab} ${activeTab === "predict" ? styles.active : ""}`} onClick={() => setActiveTab("predict")}>🔮 Predict & Simulate</button>
                <button className={`${styles.tab} ${activeTab === "diary" ? styles.active : ""}`} onClick={() => setActiveTab("diary")}>📅 Context Diary</button>
            </div>

            {/* TAB 1: PREDICT */}
            {activeTab === "predict" && (
                <div className={styles.splitLayout}>
                    {/* Left: Controls */}
                    <div className={styles.card}>
                        <h3 className="text-xl font-bold mb-4 text-navy-blue">Future Context</h3>
                        <form onSubmit={handlePredict}>
                            <div className="form-group mb-4">
                                <label className="form-label">Forecasted Weather</label>
                                <select
                                    className="input-field"
                                    value={simForm.weather}
                                    onChange={(e) => setSimForm({ ...simForm, weather: e.target.value })}
                                >
                                    <option>Sunny</option>
                                    <option>Rainy</option>
                                    <option>Cloudy</option>
                                    <option>Cold Wave</option>
                                    <option>Heatwave</option>
                                </select>
                            </div>
                            <div className="form-group mb-6">
                                <label className="form-label">Upcoming Event</label>
                                <select
                                    className="input-field"
                                    value={simForm.event}
                                    onChange={(e) => setSimForm({ ...simForm, event: e.target.value })}
                                >
                                    <option>None</option>
                                    <option>Weekend</option>
                                    <option>Holiday</option>
                                    <option>Festival</option>
                                    <option>Sports Match</option>
                                </select>
                            </div>
                            <button type="submit" className="btn-primary w-full" disabled={loading}>
                                {loading ? "Analyzing..." : "Run Prediction 🔮"}
                            </button>
                        </form>
                    </div>

                    {/* Right: Results */}
                    <div className={styles.card}>
                        {prediction ? (
                            <div>
                                <div className="alert alert-success mb-4">
                                    <strong>Prediction for: {prediction.context}</strong>
                                    <p className="text-sm">Based on historical data with similar conditions, specific items show abnormal demand spikes.</p>
                                </div>

                                {prediction.predictions.length > 0 ? (
                                    <div style={{ width: '100%', height: 300 }}>
                                        <ResponsiveContainer>
                                            <BarChart data={prediction.predictions} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis type="number" />
                                                <YAxis type="category" dataKey="product_name" width={100} />
                                                <Tooltip />
                                                <Legend />
                                                <Bar dataKey="total_qty" fill="#3b82f6" name="Expected Unit Sales" />
                                            </BarChart>
                                        </ResponsiveContainer>

                                        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded text-blue-800">
                                            💡 <strong>Recommendation:</strong> Ensure these items are fully stocked in the 'Front Display'.
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center p-8 text-gray-500">
                                        No sufficient historical data found for {prediction.context}.
                                        <br />Start logging daily context in the "Context Diary" tab!
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className={styles.chartPlaceholder}>
                                SELECT PARAMETERS TO SEE PREDICTION
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* TAB 2: DIARY */}
            {activeTab === "diary" && (
                <div className="flex justify-center">
                    <div className={styles.card} style={{ width: '100%', maxWidth: '600px' }}>
                        <h3 className="section-title mb-1">Daily Log</h3>
                        <p className="text-secondary text-sm mb-4">Teach the AI by logging what happened today.</p>

                        <form onSubmit={handleSaveContext}>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="form-group">
                                    <label className="form-label">Date</label>
                                    <input
                                        type="date"
                                        className="input-field"
                                        value={diaryForm.date}
                                        onChange={(e) => setDiaryForm({ ...diaryForm, date: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Weather</label>
                                    <select
                                        className="input-field"
                                        value={diaryForm.weather_tag}
                                        onChange={(e) => setDiaryForm({ ...diaryForm, weather_tag: e.target.value })}
                                    >
                                        <option>Sunny</option>
                                        <option>Rainy</option>
                                        <option>Cloudy</option>
                                        <option>Cold Wave</option>
                                        <option>Heatwave</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group mb-4">
                                <label className="form-label">Event / Type</label>
                                <select
                                    className="input-field"
                                    value={diaryForm.event_tag}
                                    onChange={(e) => setDiaryForm({ ...diaryForm, event_tag: e.target.value })}
                                >
                                    <option>None</option>
                                    <option>Weekend</option>
                                    <option>Holiday</option>
                                    <option>Festival</option>
                                    <option>Sports Match</option>
                                </select>
                            </div>
                            <div className="form-group mb-6">
                                <label className="form-label">Notes</label>
                                <input
                                    className="input-field"
                                    value={diaryForm.notes}
                                    onChange={(e) => setDiaryForm({ ...diaryForm, notes: e.target.value })}
                                    placeholder="e.g. Broken AC, Road construction outside..."
                                />
                            </div>
                            <button type="submit" className="btn-primary w-full">Save Context</button>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}
