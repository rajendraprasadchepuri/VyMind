"use client";

import { useState, useEffect } from "react";
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer } from 'recharts';
import styles from "./geo.module.css";

export default function GeoVizPage() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                window.location.href = "/login";
                return;
            }

            try {
                const res = await fetch("http://localhost:8000/modules/geoviz", {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (res.ok) {
                    const json = await res.json();
                    // Transform for Recharts Scatter
                    const formatted = json.map(item => ({
                        city: item.city,
                        x: item.lng, // Longitude as X
                        y: item.lat, // Latitude as Y
                        z: item.value // Sales as Size
                    }));
                    setData(formatted);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const { city, z } = payload[0].payload;
            return (
                <div style={{ background: 'white', padding: '10px', border: '1px solid #ccc' }}>
                    <p style={{ fontWeight: 'bold', margin: 0 }}>{city}</p>
                    <p style={{ margin: 0 }}>Sales Volume: ₹{z.toLocaleString()}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>🗺️ GeoViz Heatmap</h1>
                <p className={styles.subtitle}>Geospatial Sales Intelligence</p>
            </header>

            <div className={styles.mapCard}>
                <div className={styles.mapBackground}></div>

                <div className={styles.chartContainer}>
                    {loading ? (
                        <div className={styles.loading}>Loading geospatial data...</div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                <XAxis type="number" dataKey="x" name="Longitude" hide domain={[-125, -65]} />
                                <YAxis type="number" dataKey="y" name="Latitude" hide domain={[24, 50]} />
                                <ZAxis type="number" dataKey="z" range={[100, 1000]} name="Volume" />
                                <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                                <Scatter name="Cities" data={data} fill="#009FDF" fillOpacity={0.6} />
                            </ScatterChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            <div style={{ marginTop: '1rem', color: '#64748b', fontSize: '0.9rem', textAlign: 'center' }}>
                * Visual representation of market penetration across US regions (Mock Coordinates).
            </div>
        </div>
    );
}
