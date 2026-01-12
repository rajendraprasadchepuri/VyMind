"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./kds.module.css";

export default function KDSPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const ws = useRef(null);

    useEffect(() => {
        initKDS();
        return () => {
            if (ws.current) ws.current.close();
        };
    }, []);

    const initKDS = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            window.location.href = "/login";
            return;
        }

        try {
            // 1. Get Account ID
            const userRes = await fetch("/api/auth/me", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (!userRes.ok) throw new Error("Failed to get user info");
            const user = await userRes.json();
            const accountId = user.account_id;

            // 2. Fetch Active Orders
            const ordersRes = await fetch("/api/restaurant/orders/active", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const activeOrders = await ordersRes.json();
            // Parse items_json
            const parsedOrders = activeOrders.map(o => ({
                ...o,
                items: JSON.parse(o.items_json)
            }));
            setOrders(parsedOrders);
            setLoading(false);

            // 3. Connect WebSocket
            const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
            // Assuming backend is at localhost:8000 for WS 
            // In production invoke env var or relative path if proxied
            // For this setup, we connect directly to backend port or via proxy? 
            // Next.js rewriting WS is tricky. Let's try direct 8000 first.
            const wsUrl = `ws://localhost:8000/restaurant/ws/kds/${accountId}`;

            ws.current = new WebSocket(wsUrl);

            ws.current.onopen = () => {
                console.log("Connected to KDS WebSocket");
            };

            ws.current.onmessage = (event) => {
                const message = JSON.parse(event.data);
                if (message.type === "NEW_ORDER") {
                    const newOrder = message.data;
                    newOrder.items = JSON.parse(newOrder.items);
                    setOrders(prev => [newOrder, ...prev]);
                }
            };

            ws.current.onerror = (error) => {
                console.error("WebSocket error:", error);
            };

        } catch (error) {
            console.error("KDS Init Error:", error);
        }
    };

    const markAsServed = async (orderId) => {
        // Optimistic update
        setOrders(prev => prev.filter(o => o.id !== orderId));

        // Call API to update status (Not implemented in backend router yet, but visual feel)
        // TODO: Add PUT /orders/{id}/status endpoint
    };

    if (loading) return <div className={styles.container}>Loading KDS...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.title}>KITCHEN DISPLAY SYSTEM</div>
                <div>{new Date().toLocaleTimeString()}</div>
            </div>

            <div className={styles.grid}>
                {orders.length === 0 && <div style={{ padding: 20 }}>No active orders</div>}

                {orders.map(order => (
                    <div key={order.id} className={styles.card}>
                        <div className={styles.cardHeader}>
                            <span className={styles.tableNumber}>Table {order.table_id}</span> {/* Using ID as num/name for now */}
                            <span className={styles.time}>{new Date(order.created_at || order.timestamp).toLocaleTimeString()}</span>
                        </div>

                        <div className={styles.items}>
                            {order.items.map((item, idx) => (
                                <div key={idx} className={styles.item}>
                                    <span className={styles.itemName}>{item.product_name}</span>
                                    <span className={styles.itemQty}>x{item.quantity}</span>
                                </div>
                            ))}
                        </div>

                        <div className={styles.actions}>
                            <button
                                className={styles.btnDone}
                                onClick={() => markAsServed(order.id)}
                            >
                                MARK SERVED
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
