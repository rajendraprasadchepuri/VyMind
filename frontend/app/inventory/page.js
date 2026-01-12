"use client";

import { useState, useEffect } from "react";
import styles from "./inventory.module.css";

export default function InventoryPage() {
    const [products, setProducts] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        category: "",
        price: "",
        cost_price: "",
        stock_quantity: ""
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            const res = await fetch("/api/products", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (Array.isArray(data)) setProducts(data);
        } catch (error) {
            console.error("Failed to fetch products", error);
        }
    };

    const handleOpenModal = (product = null) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                name: product.name,
                category: product.category,
                price: product.price,
                cost_price: product.cost_price,
                stock_quantity: product.stock_quantity
            });
        } else {
            setEditingProduct(null);
            setFormData({
                name: "",
                category: "",
                price: "",
                cost_price: "",
                stock_quantity: ""
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingProduct(null);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        const token = localStorage.getItem("token");

        // Validation / Sanitization
        const price = parseFloat(formData.price) || 0;
        const cost_price = parseFloat(formData.cost_price) || 0;
        const stock_quantity = parseInt(formData.stock_quantity) || 0;

        const payload = {
            ...formData,
            price,
            cost_price,
            stock_quantity
        };

        try {
            let res;
            if (editingProduct) {
                // Update
                res = await fetch(`/api/products/${editingProduct.id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify(payload)
                });
            } else {
                // Create
                res = await fetch("/api/products", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify(payload)
                });
            }

            if (res.ok) {
                fetchProducts();
                handleCloseModal();
            } else {
                const err = await res.json();
                alert(`Failed to save product: ${err.detail || "Unknown error"}`);
            }
        } catch (error) {
            console.error("Save error", error);
            alert("An unexpected error occurred while saving.");
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this product?")) return;

        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`/api/products/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (res.ok) {
                fetchProducts();
            } else {
                alert("Failed to delete product via API");
            }
        } catch (error) {
            console.error("Delete error", error);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Inventory Management</h1>
                <div>
                    <button
                        className="btn-secondary"
                        style={{ marginRight: '10px' }}
                        onClick={() => { localStorage.removeItem("token"); window.location.href = "/login"; }}
                    >
                        Logout
                    </button>
                    <button className="btn-primary" onClick={() => handleOpenModal()}>
                        + Add Product
                    </button>
                </div>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>Cost</th>
                            <th>Stock</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(product => (
                            <tr key={product.id}>
                                <td>{product.name}</td>
                                <td>{product.category}</td>
                                <td>${product.price}</td>
                                <td>${product.cost_price}</td>
                                <td style={{ color: product.stock_quantity < 10 ? 'red' : 'inherit', fontWeight: product.stock_quantity < 10 ? 'bold' : 'normal' }}>
                                    {product.stock_quantity}
                                </td>
                                <td className={styles.actions}>
                                    <button className={styles.editBtn} onClick={() => handleOpenModal(product)}>Edit</button>
                                    <button className={styles.deleteBtn} onClick={() => handleDelete(product.id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <div className={styles.modalHeader}>
                            {editingProduct ? "Edit Product" : "New Product"}
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Product Name</label>
                            <input name="name" className="input-field" value={formData.name} onChange={handleChange} />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Category</label>
                            <input name="category" className="input-field" value={formData.category} onChange={handleChange} />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Sale Price ($)</label>
                                <input name="price" type="number" className="input-field" value={formData.price} onChange={handleChange} />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Cost Price ($)</label>
                                <input name="cost_price" type="number" className="input-field" value={formData.cost_price} onChange={handleChange} />
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Stock Quantity</label>
                            <input name="stock_quantity" type="number" className="input-field" value={formData.stock_quantity} onChange={handleChange} />
                        </div>

                        <div className={styles.modalActions}>
                            <button className="btn-secondary" style={{ marginRight: '10px' }} onClick={handleCloseModal}>Cancel</button>
                            <button className="btn-primary" onClick={handleSave}>Save Product</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
