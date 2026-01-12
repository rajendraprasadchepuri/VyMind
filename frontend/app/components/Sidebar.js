"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./Sidebar.module.css";

// Grouping structure from legacy ui_components.py
const MENU_GROUPS = {
    "Operations": [
        { name: "Dashboard", path: "/", icon: "📊" },
        { name: "POS Terminal", path: "/pos", icon: "💳" },
        { name: "Inventory", path: "/inventory", icon: "📦" },
        { name: "FreshFlow (Zero-Waste)", path: "/batches", icon: "🍏" },
        { name: "VendorTrust", path: "/suppliers", icon: "🚚" },
        { name: "VoiceAudit", path: "/voice", icon: "🗣️" },
        { name: "TableLink", path: "/restaurant", icon: "🍽️" },
        { name: "Online Ordering", path: "/online", icon: "🛵" },
    ],
    "Intelligence": [
        { name: "IsoBar (Forecast)", path: "/isobar", icon: "🌡️" },
        { name: "ShiftSmart (Staff)", path: "/staff", icon: "👥" },
        { name: "GeoViz (Heatmap)", path: "/geo", icon: "🗺️" },
    ],
    "Innovation": [
        { name: "ChurnGuard", path: "/churn", icon: "🛡️" },
        { name: "StockSwap", path: "/b2b", icon: "🕸️" },
        { name: "ShelfSense", path: "/shelf", icon: "🧬" },
        { name: "CrowdStock", path: "/crowd", icon: "🔮" },
    ],
    "Admin": [
        { name: "Settings", path: "/settings", icon: "⚙️" },
    ]
};

export default function Sidebar() {
    const pathname = usePathname();
    const [role, setRole] = useState("Admin"); // Default fallback
    const [plan, setPlan] = useState("Enterprise"); // Default fallback
    const [storeName, setStoreName] = useState("VyaparMind");

    useEffect(() => {
        // Simulating fetching settings/auth info from localStorage or API
        // In a real app, this would come from a Context or Store
        const savedRole = localStorage.getItem("role");
        if (savedRole) setRole(savedRole);

        // For demo purposes, we keep static defaults if not found, 
        // effectively matching the 'Enterprise' view in the screenshot.
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        window.location.href = "/login";
    };

    if (pathname === "/login") return null;

    return (
        <div className={styles.sidebar}>
            {/* Brand & Logo Section */}
            <div style={{ textAlign: 'center', padding: '1.5rem 1rem 0.5rem 1rem', borderBottom: '1px solid #C6C8CA' }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>👲</div> {/* Placeholder for Logo Image */}
                <div style={{ fontWeight: '800', fontSize: '1.2rem', lineHeight: '1.2', marginBottom: '0.5rem' }}>
                    {storeName === "VyaparMind" ? (
                        <div>
                            <span style={{ color: '#009FDF' }}>Vyapar</span><span style={{ color: '#FFCD00' }}>Mind</span>
                        </div>
                    ) : storeName}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '500' }}>
                    Plan: <span style={{ color: '#009FDF' }}>{plan}</span> | Role: <br />
                    {role}
                </div>
            </div>

            <nav className={styles.menu}>
                {Object.entries(MENU_GROUPS).map(([groupName, items]) => (
                    <div key={groupName}>
                        <div className={styles.groupHeader}>{groupName}</div>
                        {items.map((item) => (
                            <Link
                                key={item.path}
                                href={item.path}
                                className={`${styles.menuItem} ${pathname === item.path ? styles.active : ""}`}
                            >
                                <span className={styles.icon}>{item.icon}</span>
                                <span>{item.name}</span>
                            </Link>
                        ))}
                    </div>
                ))}
            </nav>

            <div className={styles.footer}>
                <button onClick={handleLogout} className={styles.logoutBtn}>
                    Logout
                </button>
            </div>
        </div>
    );
}
