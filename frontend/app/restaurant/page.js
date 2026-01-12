"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./restaurant.module.css";

export default function RestaurantPage() {
    const [tables, setTables] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [newTable, setNewTable] = useState({ number: "", capacity: 4 });
    const floorRef = useRef(null);

    // Drag state
    const [draggingId, setDraggingId] = useState(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    useEffect(() => {
        fetchTables();
    }, []);

    const fetchTables = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            const res = await fetch("http://localhost:8000/restaurant/tables", {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (!res.ok) {
                console.error(`HTTP error! status: ${res.status}`);
                return;
            }

            const data = await res.json();
            if (Array.isArray(data)) setTables(data);
        } catch (error) {
            console.error("Failed to fetch tables", error);
        }
    };

    const handleAddTable = async () => {
        const token = localStorage.getItem("token");
        try {
            const res = await fetch("http://localhost:8000/restaurant/tables", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    table_number: newTable.number,
                    capacity: parseInt(newTable.capacity),
                    x_position: 50,
                    y_position: 50
                })
            });

            if (res.ok) {
                fetchTables();
                setIsAdding(false);
                setNewTable({ number: "", capacity: 4 });
            } else {
                console.error(`HTTP error! status: ${res.status}`);
            }
        } catch (error) {
            console.error("Add table error", error);
        }
    };

    // Drag Logic
    const handleMouseDown = (e, table) => {
        setDraggingId(table.id);
        const rect = e.target.closest(`.${styles.table}`).getBoundingClientRect();
        setDragOffset({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        });
    };

    const handleMouseMove = (e) => {
        if (!draggingId || !floorRef.current) return;

        const floorRect = floorRef.current.getBoundingClientRect();
        const x = e.clientX - floorRect.left - dragOffset.x;
        const y = e.clientY - floorRect.top - dragOffset.y;

        setTables(prev => prev.map(t =>
            t.id === draggingId ? { ...t, x_position: x, y_position: y } : t
        ));
    };

    const handleMouseUp = async (e) => {
        if (draggingId) {
            const table = tables.find(t => t.id === draggingId);
            if (table) {
                // Save new position
                const token = localStorage.getItem("token");
                try {
                    const res = await fetch(`http://localhost:8000/restaurant/tables/${table.id}/position?x=${Math.round(table.x_position)}&y=${Math.round(table.y_position)}`, {
                        method: "PUT",
                        headers: { "Authorization": `Bearer ${token}` }
                    });

                    if (!res.ok) {
                        console.error(`Failed to save position: ${res.status}`);
                    }
                } catch (err) {
                    console.error("Failed to save position", err);
                }
            }
            setDraggingId(null);
        }
    };

    return (
        <div className={styles.container} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
            <div className={styles.sidebar}>
                <div className={styles.title}>Floor Plan</div>

                <div className={styles.controlGroup}>
                    <button className="btn-primary" onClick={() => setIsAdding(!isAdding)}>
                        {isAdding ? "Cancel" : "+ Add Table"}
                    </button>

                    {isAdding && (
                        <div style={{ marginTop: '15px', padding: '15px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                            <div style={{ marginBottom: '10px' }}>
                                <label className={styles.label}>Table Number</label>
                                <input
                                    className="input-field"
                                    value={newTable.number}
                                    onChange={(e) => setNewTable({ ...newTable, number: e.target.value })}
                                />
                            </div>
                            <div style={{ marginBottom: '10px' }}>
                                <label className={styles.label}>Capacity</label>
                                <input
                                    type="number"
                                    className="input-field"
                                    value={newTable.capacity}
                                    onChange={(e) => setNewTable({ ...newTable, capacity: e.target.value })}
                                />
                            </div>
                            <button className="btn-secondary" style={{ width: '100%' }} onClick={handleAddTable}>
                                Save Table
                            </button>
                        </div>
                    )}
                </div>

                <div className={styles.controlGroup}>
                    <h3 className={styles.label}>Stats</h3>
                    <div>Total Tables: {tables.length}</div>
                    <div>Occupied: {tables.filter(t => t.status === "OCCUPIED").length}</div>
                </div>
            </div>

            <div className={styles.floorPlan} ref={floorRef}>
                {tables.map(table => (
                    <div
                        key={table.id}
                        className={styles.table}
                        style={{
                            left: `${table.x_position}px`,
                            top: `${table.y_position}px`,
                            borderColor: table.status === "OCCUPIED" ? "#ef4444" : "#cbd5e1"
                        }}
                        onMouseDown={(e) => handleMouseDown(e, table)}
                    >
                        <span className={styles.tableNumber}>{table.table_number}</span>
                        <span className={styles.tableCapacity}>{table.capacity} Seats</span>
                        <span className={`${styles.tableStatus} ${table.status === "OCCUPIED" ? styles.statusOccupied : styles.statusAvailable}`}>
                            {table.status}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
