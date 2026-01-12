"use client";

import { useState } from "react";
import styles from "./login.module.css";

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        companyName: "",
        username: "",
        password: "",
        email: ""
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const endpoint = isLogin ? "/api/auth/login" : "/api/auth/signup";

        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    company_name: formData.companyName,
                    username: formData.username,
                    password: formData.password,
                    email: formData.email
                }),
            });

            const data = await response.json();
            console.log("Login Response Data:", data); // DEBUG

            if (response.ok) {
                if (isLogin) {
                    console.log("Setting token:", data.access_token); // DEBUG
                    localStorage.setItem("token", data.access_token);
                    window.location.href = "/";
                } else {
                    alert("Account created! Pending approval.");
                    setIsLogin(true);
                }
            } else {
                alert(data.detail || "Authentication failed");
            }
        } catch (error) {
            console.error("Auth error:", error);
            alert("Local server connection failed");
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.brandPanel}>
                <div className={styles.brandContent}>
                    <div className={styles.logo}>🧠</div>
                    <h1 className={styles.title}>Vyapar<span>Mind</span></h1>
                    <p className={styles.tagline}>Growth • Purity • Success</p>
                    <p className={styles.description}>
                        The intelligent operating system for modern business.<br />
                        Seamless POS, real-time inventory, and predictive analytics.
                    </p>
                </div>
            </div>

            <div className={styles.authPanel}>
                <div className={styles.authCard}>
                    <h2 className={styles.authHeader}>{isLogin ? "Welcome Back" : "Create Account"}</h2>
                    <p className={styles.authSub}>
                        {isLogin
                            ? "Enter your credentials to access the workspace."
                            : "Register your business to get started."}
                    </p>

                    <div className={styles.tabs}>
                        <button
                            className={isLogin ? styles.activeTab : ""}
                            onClick={() => setIsLogin(true)}
                        >
                            Login
                        </button>
                        <button
                            className={!isLogin ? styles.activeTab : ""}
                            onClick={() => setIsLogin(false)}
                        >
                            Sign Up
                        </button>
                    </div>

                    <form className={styles.form} onSubmit={handleSubmit}>
                        <div className={styles.formGroup}>
                            <label>Company / Store Name</label>
                            <input
                                type="text"
                                placeholder="VyaparMind Store"
                                value={formData.companyName}
                                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Username / Email</label>
                            <input
                                type="text"
                                placeholder="admin"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                required
                            />
                        </div>

                        {!isLogin && (
                            <div className={styles.formGroup}>
                                <label>Email Address</label>
                                <input
                                    type="email"
                                    placeholder="admin@example.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>
                        )}

                        <div className={styles.formGroup}>
                            <label>Password</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                        </div>

                        <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                            {isLogin ? "Sign In" : "Create Account"}
                        </button>
                    </form>

                    {isLogin && (
                        <div className={styles.forgotPassword}>
                            <a href="#">Forgot Password?</a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
