import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
} from "react-bootstrap";
import { FaPlus } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";
import './HiringManagerDashboard.css';

export default function HiringManagerDashboard() {
  const [newPosition, setNewPosition] = useState({
    title: "",
    department: "",
    location: "",
    requiredSkills: "",
    openings: 1,
    status: "Open",
  });
  
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
  }, [token]);

  const addPosition = async (e) => {
    e.preventDefault();
    if (!token) return;
    try {
      const payload = {
        ...newPosition,
        requiredSkills: newPosition.requiredSkills
          ? newPosition.requiredSkills.split(",").map((s) => s.trim())
          : [],
      };

      const res = await fetch("/api/positions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to add position");

      setNewPosition({
        title: "",
        department: "",
        location: "",
        requiredSkills: "",
        openings: 1,
        status: "Open",
      });

      toast.success("Position added successfully!"); 
    } catch (err) {
      console.error("Error adding position:", err);
      toast.error("Failed to add position"); 
    }
  };

  return (
    <div className="hiring-dashboard">
      <Container fluid="lg">
        <Toaster position="top-center" reverseOrder={false} />

        {/* HEADER */}
        <div className="d-flex justify-content-center align-items-center mb-3 mt-2">
          <h3 className="fw-bold" style={{ color: "#4c1d95" }}>Hiring Manager Dashboard</h3>
        </div>

        {/* ROW 2: Manage Positions */}
        <Row className="mb-3">
          <Col>
            <Card className="shadow-sm border-0">
              <Card.Body className="p-3">
                {/* FIX: Added 'flex-wrap' and 'gap-2' to prevent overlapping on mobile */}
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                  <Card.Title className="text-purple fw-bold mb-0 text-nowrap">Manage Positions</Card.Title>
                  <Button 
                    className="purple-btn" 
                    size="sm" 
                    onClick={() => navigate("/hiring-manager/open-positions")}
                    style={{ whiteSpace: "nowrap" }}
                  >
                    View All Positions →
                  </Button>
                </div>

                <Form onSubmit={addPosition} className="p-2 bg-light rounded">
                  <Row className="g-2 align-items-end">
                    <Col md={3} xs={12}>
                      <Form.Label className="mb-1 small fw-bold">Title</Form.Label>
                      <Form.Control
                        size="sm" 
                        type="text"
                        placeholder="e.g. Senior Dev"
                        required
                        value={newPosition.title}
                        onChange={(e) => setNewPosition({ ...newPosition, title: e.target.value })}
                      />
                    </Col>
                    <Col md={2} xs={6}>
                      <Form.Label className="mb-1 small fw-bold">Dept</Form.Label>
                      <Form.Control
                        size="sm"
                        type="text"
                        placeholder="Engineering"
                        value={newPosition.department}
                        onChange={(e) => setNewPosition({ ...newPosition, department: e.target.value })}
                      />
                    </Col>
                    <Col md={2} xs={6}>
                      <Form.Label className="mb-1 small fw-bold">Location</Form.Label>
                      <Form.Control
                        size="sm"
                        type="text"
                        placeholder="Remote / NY"
                        value={newPosition.location}
                        onChange={(e) => setNewPosition({ ...newPosition, location: e.target.value })}
                      />
                    </Col>
                    <Col md={3} xs={12}>
                      <Form.Label className="mb-1 small fw-bold">Skills</Form.Label>
                      <Form.Control
                        size="sm"
                        type="text"
                        placeholder="React, Node..."
                        value={newPosition.requiredSkills}
                        onChange={(e) => setNewPosition({ ...newPosition, requiredSkills: e.target.value })}
                      />
                    </Col>
                    <Col md={1} xs={6}>
                      <Form.Label className="mb-1 small fw-bold">Openings</Form.Label>
                      <Form.Control
                        size="sm"
                        type="number"
                        min="1"
                        value={newPosition.openings}
                        onChange={(e) => setNewPosition({ ...newPosition, openings: parseInt(e.target.value) })}
                      />
                    </Col>
                    <Col md={1} xs={6}>
                      <Button type="submit" className="purple-btn w-100" size="sm">
                        <FaPlus />
                      </Button>
                    </Col>
                  </Row>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* ROW 3: Navigation Cards */}
        <Row className="g-3">
          {[
            { 
              title: " Applications", 
              text: "Review apps & schedule interviews.", 
              path: "/hiring-manager/applications", 
              btn: "View Apps" 
            },
            { 
              title: " Interviews", 
              text: "Manage timeslots & feedback.", 
              path: "/hiring-manager/schedule", 
              btn: "Manage" 
            },
            { 
              title: " POs", 
              text: "Track purchase orders.", 
              path: "/hiring-manager/purchase-orders", 
              btn: "View POs" 
            },
            { 
              title: " Inbox", 
              text: "Messages from candidates.", 
              path: "/hiring-manager/inbox", 
              btn: "Open Inbox" 
            },
            { 
              title: " Onboarding", 
              text: "Track hired candidate progress.", 
              path: "/hiring-manager/onboarding", 
              btn: "Track" 
            },
            { 
              title: " Agencies", 
              text: "Invite recruiters.", 
              path: "/hiring-manager/agencies", 
              btn: "Invite" 
            },
          ].map((item, idx) => (
            <Col md={4} sm={6} xs={12} key={idx}>
              <Card className="shadow-sm h-100 border-0 nav-card">
                <Card.Body className="text-center p-3">
                  <Card.Title className="text-purple fw-bold fs-6">{item.title}</Card.Title>
                  <Card.Text className="text-muted mb-3 small">{item.text}</Card.Text>
                  <Button
                    size="sm"
                    className="purple-btn w-100"
                    onClick={() => navigate(item.path)}
                  >
                    {item.btn} →
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );
}