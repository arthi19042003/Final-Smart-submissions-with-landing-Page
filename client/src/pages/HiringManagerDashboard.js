import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Spinner,
} from "react-bootstrap";
import { FaPlus } from "react-icons/fa";
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

      alert("✅ Position added successfully!");
    } catch (err) {
      console.error("Error adding position:", err);
      alert("❌ Failed to add position");
    }
  };

  return (
    <div className="hiring-dashboard">
      <Container fluid="lg">
        {/* HEADER */}
        <div className="d-flex justify-content-center align-items-center mb-4">
          <h2 className="fw-bold" style={{ color: "#4c1d95" }}>Hiring Manager Dashboard</h2>
        </div>

        {/* ❌ ROW 1 (Chart + Metrics) - REMOVED AS REQUESTED */}
        
        {/* ROW 2: Manage Positions */}
        <Row className="mb-4">
          <Col>
            <Card className="shadow-sm border-0">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <Card.Title className="text-purple fw-bold mb-0"> Manage Positions</Card.Title>
                  <Button className="purple-btn" size="sm" onClick={() => navigate("/hiring-manager/open-positions")}>
                    View All Positions →
                  </Button>
                </div>
                <Form onSubmit={addPosition} className="p-3 bg-light rounded">
                  <Row className="g-3 align-items-end">
                    <Col md={3}>
                      <Form.Label>Title</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="e.g. Senior Dev"
                        required
                        value={newPosition.title}
                        onChange={(e) => setNewPosition({ ...newPosition, title: e.target.value })}
                      />
                    </Col>
                    <Col md={2}>
                      <Form.Label>Dept</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Engineering"
                        value={newPosition.department}
                        onChange={(e) => setNewPosition({ ...newPosition, department: e.target.value })}
                      />
                    </Col>
                    <Col md={2}>
                      <Form.Label>Location</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Remote / NY"
                        value={newPosition.location}
                        onChange={(e) => setNewPosition({ ...newPosition, location: e.target.value })}
                      />
                    </Col>
                    <Col md={3}>
                      <Form.Label>Skills</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="React, Node..."
                        value={newPosition.requiredSkills}
                        onChange={(e) => setNewPosition({ ...newPosition, requiredSkills: e.target.value })}
                      />
                    </Col>
                    <Col md={1}>
                      <Form.Label>Openings</Form.Label>
                      <Form.Control
                        type="number"
                        min="1"
                        value={newPosition.openings}
                        onChange={(e) => setNewPosition({ ...newPosition, openings: parseInt(e.target.value) })}
                      />
                    </Col>
                    <Col md={1}>
                      <Button type="submit" className="purple-btn w-100">
                        <FaPlus />
                      </Button>
                    </Col>
                  </Row>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* ROW 3: Navigation Cards (The grid layout still works fine as a default) */}
        <Row className="g-4">
          {[
            { title: " Applications", text: "Review apps & schedule interviews.", path: "/hiring-manager/applications", btn: "View Apps" },
            { title: " Interviews", text: "Manage timeslots & feedback.", path: "/hiring-manager/schedule", btn: "Manage" },
            { title: " POs", text: "Track purchase orders.", path: "/hiring-manager/purchase-orders", btn: "View POs" },
            { title: " Inbox", text: "Messages from candidates.", path: "/hiring-manager/inbox", btn: "Open Inbox" },
            { title: " Onboarding", text: "Track hired candidate progress.", path: "/hiring-manager/onboarding", btn: "Track" },
            { title: " Agencies", text: "Invite recruiters.", path: "/hiring-manager/agencies", btn: "Invite" },
          ].map((item, idx) => (
            <Col md={4} key={idx}>
              <Card className="shadow-sm h-100 border-0 nav-card">
                <Card.Body className="text-center">
                  <Card.Title className="text-purple fw-bold">{item.title}</Card.Title>
                  <Card.Text className="text-muted mb-4">{item.text}</Card.Text>
                  <Button
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