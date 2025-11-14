// client/src/pages/PurchaseOrders.js
import React, { useState, useEffect } from "react";
import api from "../api/axios";
import "./PurchaseOrders.css";

// ✅ NEW: Initial state for the creation form
const newPoInitialState = {
  poId: "",
  vendor: "",
  amount: "",
  date: new Date().toISOString().split("T")[0], // Default to today
};

const PurchaseOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // ✅ NEW: State for the creation form
  const [showForm, setShowForm] = useState(false);
  const [newPo, setNewPo] = useState(newPoInitialState);
  const [formError, setFormError] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get("/po");
      setOrders(response.data);
    } catch (err) {
      console.error("Error fetching purchase orders:", err);
      setError("Failed to load purchase orders. Please try again later.");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateOrderStatus = async (id, newStatus) => {
    // ... (existing function, no changes)
    const originalOrders = [...orders];
    setOrders(
      orders.map((order) =>
        order._id === id ? { ...order, status: newStatus } : order
      )
    );
    setError('');
    try {
      await api.put(`/po/${id}/status`, { status: newStatus });
    } catch (err) {
      console.error(`Error updating order ${id} status to ${newStatus}:`, err);
      setError(`Failed to update order ${id}. Please try again.`);
      setOrders(originalOrders);
    }
  };

  // --- ✅ NEW: Handlers for the creation form ---
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setNewPo(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    setFormError('');
    
    // Simple validation
    if (!newPo.poId || !newPo.vendor || !newPo.amount || !newPo.date) {
      setFormError('All fields are required.');
      return;
    }
    
    try {
      const response = await api.post("/po", {
        ...newPo,
        poId: Number(newPo.poId),
        amount: Number(newPo.amount),
      });
      
      setOrders(prev => [response.data, ...prev]); // Add new PO to top of list
      setNewPo(newPoInitialState); // Reset form
      setShowForm(false); // Hide form
    } catch (err) {
      console.error("Error creating PO:", err);
      setFormError(err.response?.data?.message || 'Failed to create PO.');
    }
  };
  // --- End of new handlers ---


  const formatDate = (dateString) => {
    // ... (existing function, no changes)
     if (!dateString) return 'N/A';
     try {
       const parts = dateString.split('-');
       if (parts.length === 3) {
           const date = new Date(parts[0], parts[1] - 1, parts[2]);
           return date.toLocaleDateString("en-US", {
              year: 'numeric', month: 'short', day: 'numeric'
           });
       }
       return dateString;
     } catch (e) {
       return 'Invalid Date';
     }
  };


  return (
    <div className="po-container">
      <h2>Purchase Orders</h2>
      {error && !loading && <p className="error">{error}</p>}

      {/* --- ✅ NEW: Create PO Form Section --- */}
      <div className="po-form-toggle">
        <button 
          className="btn-create-po"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : '＋ Generate New PO'}
        </button>
      </div>

      {showForm && (
        <div className="po-card create-po-form">
          <h3>New Purchase Order</h3>
          <form onSubmit={handleCreateOrder}>
            <div className="form-grid">
              <div className="form-group">
                <label>PO ID *</label>
                <input type="number" name="poId" value={newPo.poId} onChange={handleFormChange} placeholder="e.g., 103" />
              </div>
              <div className="form-group">
                <label>Vendor *</label>
                <input type="text" name="vendor" value={newPo.vendor} onChange={handleFormChange} placeholder="Vendor Name" />
              </div>
              <div className="form-group">
                <label>Amount ($) *</label>
                <input type="number" name="amount" value={newPo.amount} onChange={handleFormChange} placeholder="e.g., 25000" />
              </div>
              <div className="form-group">
                <label>Date *</label>
                <input type="date" name="date" value={newPo.date} onChange={handleFormChange} />
              </div>
            </div>
            {formError && <p className="error">{formError}</p>}
            <button type="submit" className="approve-btn" style={{width: '100%', padding: '12px'}}>Save Purchase Order</button>
          </form>
        </div>
      )}
      {/* --- End of Create PO Form --- */}


      <div className="po-card">
        <h3>Existing Orders</h3>
        {loading ? (
           <p className="loading">Loading purchase orders...</p>
        ) : (
          <table className="po-table">
            <thead>
              <tr>
                <th>PO ID</th>
                <th>Vendor</th>
                <th>Amount ($)</th>
                <th>Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 && !loading && !error ? (
                  <tr><td colSpan="6" className="empty">No purchase orders found.</td></tr>
              ) : (
                  orders.map((order) => (
                  <tr key={order._id}>
                      <td>{order.poId}</td>
                      <td>{order.vendor || 'N/A'}</td>
                      <td>{order.amount != null ? order.amount.toLocaleString() : 'N/A'}</td>
                      <td>{formatDate(order.date)}</td>
                      <td>
                      <span className={`status ${order.status?.toLowerCase() || 'pending'}`}>
                          {order.status || 'Pending'}
                      </span>
                      </td>
                      <td>
                      {order.status === "Pending" ? (
                          <>
                          <button
                              className="approve-btn"
                              onClick={() => updateOrderStatus(order._id, "Approved")}
                          >
                              Approve
                          </button>
                          <button
                              className="reject-btn"
                              onClick={() => updateOrderStatus(order._id, "Rejected")}
                          >
                              Reject
                          </button>
                          </>
                      ) : (
                          <span className="no-action">—</span>
                      )}
                      </td>
                  </tr>
                  ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default PurchaseOrders;