"use client";

import { useState, useEffect } from "react";
import styles from "./pos.module.css";

export default function POSPage() {
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchProducts();
    }, [search]);

    const fetchProducts = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        setLoading(true);
        try {
            const query = search ? `?search=${search}` : "";
            const res = await fetch(`/api/products${query}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (Array.isArray(data)) {
                setProducts(data);
            }
        } catch (error) {
            console.error("Failed to fetch products", error);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = (product) => {
        setCart(prev => {
            const existing = prev.find(item => item.product_id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.product_id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, {
                product_id: product.id,
                name: product.name,
                price: product.price,
                quantity: 1
            }];
        });
    };

    const updateQty = (id, delta) => {
        setCart(prev => prev.map(item => {
            if (item.product_id === id) {
                const newQty = Math.max(0, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }).filter(item => item.quantity > 0));
    };

    const calculateTotal = () => {
        return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    };

    const handleCheckout = async () => {
        if (cart.length === 0) return;

        const token = localStorage.getItem("token");
        const total = calculateTotal();

        try {
            const payload = {
                account_id: "", // extracted from token on backend
                total_amount: total,
                total_profit: 0, // backend calc
                payment_method: "CASH",
                items: cart.map(item => ({
                    product_id: item.product_id,
                    product_name: item.name,
                    quantity: item.quantity,
                    price_at_sale: item.price,
                    cost_at_sale: 0 // backend calc
                }))
            };

            const res = await fetch("/api/pos/checkout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert("Transaction Successful!");
                setCart([]);
                fetchProducts(); // refresh stock
            } else {
                const err = await res.json();
                alert(`Failed: ${err.detail}`);
            }
        } catch (error) {
            console.error("Checkout error", error);
            alert("Checkout failed");
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.leftPanel}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Point of Sale</h1>
                    <input
                        type="text"
                        placeholder="Search products..."
                        className="input-field"
                        style={{ width: '400px' }}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className={styles.grid}>
                    {products.map(product => (
                        <div
                            key={product.id}
                            className={styles.productCard}
                            onClick={() => addToCart(product)}
                        >
                            <div>
                                <div className={styles.productName}>{product.name}</div>
                                <div className={styles.productCategory}>{product.category}</div>
                            </div>
                            <div className={styles.productPrice}>${product.price}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div className={styles.rightPanel}>
                <div className={styles.cartHeader}>
                    <h2>Current Order</h2>
                    <span style={{ color: '#64748B' }}>{cart.length} items</span>
                </div>

                <div className={styles.cartItems}>
                    {cart.map(item => (
                        <div key={item.product_id} className={styles.cartItem}>
                            <div className={styles.itemInfo}>
                                <span className={styles.itemName}>{item.name}</span>
                                <span className={styles.itemPrice}>${item.price} x {item.quantity}</span>
                            </div>
                            <div className={styles.itemControls}>
                                <button className={styles.qtyBtn} onClick={() => updateQty(item.product_id, -1)}>-</button>
                                <span className={styles.itemQty}>{item.quantity}</span>
                                <button className={styles.qtyBtn} onClick={() => updateQty(item.product_id, 1)}>+</button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className={styles.cartSummary}>
                    <div className={styles.row}>
                        <span>Subtotal</span>
                        <span>${calculateTotal().toFixed(2)}</span>
                    </div>
                    <div className={styles.row}>
                        <span>Tax (0%)</span>
                        <span>$0.00</span>
                    </div>
                    <div className={styles.totalRow}>
                        <span>Total</span>
                        <span>${calculateTotal().toFixed(2)}</span>
                    </div>

                    <button
                        className="btn-primary"
                        style={{ width: '100%', marginTop: '20px', padding: '15px' }}
                        onClick={handleCheckout}
                        disabled={cart.length === 0}
                    >
                        Complete Payment
                    </button>
                </div>
            </div>
        </div>
    );
}
