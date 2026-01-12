"use client";

import { useEffect, useState } from "react";
import styles from "./settings.module.css";

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("profile");
    const [settings, setSettings] = useState({});
    const [users, setUsers] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Profile Form
    const [profileForm, setProfileForm] = useState({ store_name: "", store_address: "", store_phone: "" });

    // User Form
    const [userForm, setUserForm] = useState({ username: "", password: "", role: "staff", email: "" });

    // Helper to get value
    const getSetting = (key) => {
        const s = settings.find(i => i.key === key);
        return s ? s.value : "";
    };

    const fetchData = async () => {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) { window.location.href = "/login"; return; }

        try {
            // Get Current User (to check if admin)
            const meRes = await fetch("/api/auth/me", { headers: { "Authorization": `Bearer ${token}` } });
            if (meRes.ok) {
                const me = await meRes.json();
                setCurrentUser(me);
            }

            // Get Settings
            const setRes = await fetch("/api/settings", { headers: { "Authorization": `Bearer ${token}` } });
            if (setRes.ok) {
                const data = await setRes.json();
                setSettings(data);

                // Initialize form
                const findVal = (k) => data.find(i => i.key === k)?.value || "";
                setProfileForm({
                    store_name: findVal("store_name"),
                    store_address: findVal("store_address"),
                    store_phone: findVal("store_phone")
                });
            }

            // Get Users (if admin)
            // We'll fetch this lazily when tab is clicked or if we already know user is admin
            // But simplifying: fetch if tab is users
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/settings/users", { headers: { "Authorization": `Bearer ${token}` } });
        if (res.ok) setUsers(await res.json());
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (activeTab === "users" && currentUser?.role === "admin") {
            fetchUsers();
        }
    }, [activeTab, currentUser]);

    // Handlers
    const saveProfile = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");

        // Save each key
        const updates = [
            { key: "store_name", value: profileForm.store_name },
            { key: "store_address", value: profileForm.store_address },
            { key: "store_phone", value: profileForm.store_phone }
        ];

        for (const u of updates) {
            await fetch("/api/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify(u)
            });
        }
        alert("Profile Updated!");
        fetchData();
    };

    const createUser = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        const res = await fetch("/api/settings/users", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify(userForm)
        });
        if (res.ok) {
            alert("User Created!");
            setUserForm({ username: "", password: "", role: "staff", email: "" });
            fetchUsers();
        } else {
            alert("Failed to create user");
        }
    };

    const deleteUser = async (username) => {
        if (!confirm(`Delete ${username}?`)) return;
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/settings/users/${username}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) fetchUsers();
        else alert("Failed to delete");
    };

    return (
        <main className={styles.container}>
            <header className={styles.header}>
                <h1>⚙️ Settings & Administration</h1>
            </header>

            <div className={styles.tabs}>
                <button className={`${styles.tab} ${activeTab === "profile" ? styles.active : ""}`} onClick={() => setActiveTab("profile")}>Store Profile</button>
                <button className={`${styles.tab} ${activeTab === "plan" ? styles.active : ""}`} onClick={() => setActiveTab("plan")}>Subscription Plan</button>
                <button className={`${styles.tab} ${activeTab === "users" ? styles.active : ""}`} onClick={() => setActiveTab("users")}>User Management</button>
            </div>

            {loading ? <p>Loading...</p> : (
                <>
                    {/* TAB 1: PROFILE */}
                    {activeTab === "profile" && (
                        <div className="flex justify-center">
                            <div className={styles.card}>
                                <h3 className="section-title mb-4">Store Details</h3>
                                <form onSubmit={saveProfile}>
                                    <div className="form-group mb-4">
                                        <label className="form-label">Store Name</label>
                                        <input
                                            className="input-field"
                                            value={profileForm.store_name}
                                            onChange={(e) => setProfileForm({ ...profileForm, store_name: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group mb-4">
                                        <label className="form-label">Address</label>
                                        <input
                                            className="input-field"
                                            value={profileForm.store_address}
                                            onChange={(e) => setProfileForm({ ...profileForm, store_address: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group mb-6">
                                        <label className="form-label">Phone</label>
                                        <input
                                            className="input-field"
                                            value={profileForm.store_phone}
                                            onChange={(e) => setProfileForm({ ...profileForm, store_phone: e.target.value })}
                                        />
                                    </div>
                                    <button type="submit" className="btn-primary w-full">Save Changes</button>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: PLANS */}
                    {activeTab === "plan" && (
                        <div>
                            <div className="alert alert-info mb-6 text-center">
                                Current Plan: <strong>{getSetting("subscription_plan") || "Starter"}</strong>
                            </div>

                            <div className={styles.planGrid}>
                                <div className={styles.planCard}>
                                    <h3 className={styles.planName}>Starter</h3>
                                    <div className={styles.planPrice}>Free</div>
                                    <div className={styles.planFeatures}>- POS & Inventory<br />- Dashboard</div>
                                    <button className="btn-secondary w-full" disabled>Current Plan</button>
                                </div>
                                <div className={styles.planCard}>
                                    <h3 className={styles.planName}>Business</h3>
                                    <div className={styles.planPrice}>₹999 / mo</div>
                                    <div className={styles.planFeatures}>- All in Starter<br />- VendorTrust<br />- FreshFlow</div>
                                    <button className="btn-primary w-full">Upgrade</button>
                                </div>
                                <div className={styles.planCard}>
                                    <h3 className={styles.planName}>Enterprise</h3>
                                    <div className={styles.planPrice}>₹2999 / mo</div>
                                    <div className={styles.planFeatures}>- All in Business<br />- ISOBar AI<br />- ShiftSmart AI</div>
                                    <button className="btn-primary w-full">Upgrade</button>
                                </div>
                                <div className={styles.planCard} style={{ background: '#f8f9fa' }}>
                                    <h3 className={styles.planName}>Custom</h3>
                                    <div className={styles.planPrice}>Contact Sales</div>
                                    <div className={styles.planFeatures}>- Tailored Modules<br />- Dedicated Support</div>
                                    <button className="btn-secondary w-full">Contact</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 3: USERS */}
                    {activeTab === "users" && (
                        <div>
                            {currentUser?.role !== 'admin' && currentUser?.role !== 'super_admin' ? (
                                <div className="alert alert-error">⛔ Only Admins can manage users.</div>
                            ) : (
                                <div className={styles.splitLayout} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                                    {/* Create User */}
                                    <div className={styles.card}>
                                        <h3 className="section-title mb-4">Create New User</h3>
                                        <form onSubmit={createUser}>
                                            <div className="form-group mb-2">
                                                <label className="form-label">Username</label>
                                                <input
                                                    className="input-field"
                                                    value={userForm.username}
                                                    onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="form-group mb-2">
                                                <label className="form-label">Role</label>
                                                <select
                                                    className="input-field"
                                                    value={userForm.role}
                                                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                                                >
                                                    <option value="staff">Staff</option>
                                                    <option value="manager">Manager</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                            </div>
                                            <div className="form-group mb-4">
                                                <label className="form-label">Password</label>
                                                <input
                                                    type="password"
                                                    className="input-field"
                                                    value={userForm.password}
                                                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <button type="submit" className="btn-primary w-full">Create User</button>
                                        </form>
                                    </div>

                                    {/* User List */}
                                    <div>
                                        <h3 className="section-title mb-4">Existing Users</h3>
                                        <table className={styles.userTable}>
                                            <thead>
                                                <tr>
                                                    <th>Username</th>
                                                    <th>Role</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {users.map(u => (
                                                    <tr key={u.id}>
                                                        <td>{u.username}</td>
                                                        <td>
                                                            <span className={`badge ${u.role === 'admin' ? 'badge-primary' : 'badge-secondary'}`}>
                                                                {u.role.toUpperCase()}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            {u.username !== currentUser.username && (
                                                                <button onClick={() => deleteUser(u.username)} className="text-red-500 hover:text-red-700 font-bold">
                                                                    Delete
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                                {users.length === 0 && <tr><td colSpan="3">No users found</td></tr>}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </main>
    );
}
