import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Card, Form, Button, Row, Col, Spinner } from "react-bootstrap";
import toast, { Toaster } from "react-hot-toast";
import './HiringManagerDashboard.css'; // Import shared CSS

export default function CreatePurchaseOrder() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    candidateName: "",
    positionTitle: "",
    department: "",
    rate: "",
    startDate: "",
  });

  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ✅ Get token from localStorage
    const token = localStorage.getItem("token");
    if (!token) {
        toast.error("Please login first.");
        return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/purchase-orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ✅ Send token
        },
        body: JSON.stringify({
          candidateName: formData.candidateName,
          positionTitle: formData.positionTitle,
          department: formData.department,
          rate: parseFloat(formData.rate),
          startDate: formData.startDate,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create PO");
      }

      toast.success("Purchase Order created successfully!");
      navigate("/hiring-manager/purchase-orders"); 
      
    } catch (err) {
      console.error("Error creating PO:", err);
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    // ✅ Wrapper for layout and style
    <div className="dashboard-wrapper">
      <Container className="py-4">
        <Toaster position="top-right" />
        <Card className="shadow-sm border-0" style={{ maxWidth: "800px", margin: "0 auto" }}>
          <Card.Body className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="fw-bold text-dark mb-0">🧾 Create Purchase Order</h2>
              <Button variant="light" onClick={() => navigate(-1)} className="border">← Back</Button>
            </div>
            <Form onSubmit={handleSubmit}>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Candidate Name *</Form.Label>
                    <Form.Control type="text" name="candidateName" value={formData.candidateName} onChange={handleChange} required />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Position Title *</Form.Label>
                    <Form.Control type="text" name="positionTitle" value={formData.positionTitle} onChange={handleChange} required />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Department</Form.Label>
                    <Form.Control type="text" name="department" value={formData.department} onChange={handleChange} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Rate ($/hr)</Form.Label>
                    <Form.Control type="number" name="rate" value={formData.rate} onChange={handleChange} />
                  </Form.Group>
                </Col>
                <Col md={12}>
                  <Form.Group>
                    <Form.Label>Start Date *</Form.Label>
                    <Form.Control type="date" name="startDate" value={formData.startDate} onChange={handleChange} required />
                  </Form.Group>
                </Col>
                <Col md={12} className="mt-4">
                  <Button type="submit" variant="primary" size="lg" className="w-100" disabled={submitting}>
                    {submitting ? <Spinner animation="border" size="sm" /> : "Generate PO"}
                  </Button>
                </Col>
              </Row>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}