import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus } from "react-icons/fa"; 
import { Container, Card, Table, Button, Badge, Spinner, Alert } from "react-bootstrap";
import toast, { Toaster } from "react-hot-toast";
import './HiringManagerDashboard.css';

export default function ViewPurchaseOrders() {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  const token = localStorage.getItem("token"); 

  const fetchPOs = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/purchase-orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch purchase orders");
      const result = await res.json();
      setPurchaseOrders(result);
    } catch (err) {
      console.error("Error fetching POs:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/purchase-orders/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      toast.success("Status updated!");
      await fetchPOs();
    } catch (err) {
      console.error("Error updating PO status:", err);
      toast.error("Failed to update status");
    }
  };

  useEffect(() => {
    fetchPOs();
  }, [token]);


  if (loading)
    return (
      <div className="dashboard-wrapper">
        <div className="text-center mt-5" style={{ color: "white" }}>
          <Spinner animation="border" variant="light" /> Loading purchase orders...
        </div>
      </div>
    );

  return (
    <div className="dashboard-wrapper">
      <Container className="py-4">
        <Toaster position="top-right" />
        
        <Card className="shadow-sm border-0">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-4">
              {/* ✅ FIX: Added "text-purple" to the heading */}
              <h2 className="fw-bold mb-0 text-purple"> Purchase Orders</h2>
              <Button
                onClick={() => navigate("/hiring-manager/create-po")}
                className="purple-btn" 
              >
                <FaPlus /> Create New PO
              </Button>
            </div>

            {purchaseOrders.length === 0 ? (
              <Alert variant="info" className="text-center">
                No purchase orders found. Create one to get started!
              </Alert>
            ) : (
              <div className="table-responsive">
                <Table hover className="align-middle">
                  <thead className="bg-light table-light">
                    <tr>
                      <th className="p-3">PO Number</th>
                      <th className="p-3">Candidate</th>
                      <th className="p-3">Position</th>
                      <th className="p-3">Department</th>
                      <th className="p-3">Rate ($/hr)</th>
                      <th className="p-3">Start Date</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchaseOrders.map((po) => (
                      <tr key={po._id}>
                        <td className="p-3 fw-semibold">{po.poNumber}</td>
                        <td className="p-3">{po.candidateName}</td>
                        <td className="p-3">{po.positionTitle || po.position}</td>
                        <td className="p-3">{po.department}</td>
                        <td className="p-3">${po.rate}</td>
                        <td className="p-3">
                          {po.startDate ? new Date(po.startDate).toLocaleDateString() : "-"}
                        </td>
                        <td className="p-3">
                          <Badge bg={po.status === "Approved" ? "success" : "warning"} text={po.status === "Approved" ? "white" : "dark"}>
                              {po.status}
                          </Badge>
                        </td>
                        <td className="p-3 text-center">
                          <div className="d-flex gap-2 justify-content-center">
                              {po.status !== "Approved" && (
                              <Button
                                  onClick={() => updateStatus(po._id, "Approved")}
                                  variant="success"
                                  size="sm"
                              >
                                  ✅ Approve
                              </Button>
                              )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}