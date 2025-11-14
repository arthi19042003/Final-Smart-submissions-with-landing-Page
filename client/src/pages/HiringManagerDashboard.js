import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Spinner,
  Badge,
  Alert,
} from "react-bootstrap";
import './HiringManagerDashboard.css';

export default function HiringManagerDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const [newPosition, setNewPosition] = useState({
    title: "",
    department: "",
    location: "",
    requiredSkills: "",
    openings: 1,
    status: "Open",
  });

  // Fetch dashboard summary
  const fetchDashboard = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      setRefreshing(true);
      const res = await fetch("/api/hiring-dashboard/summary", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch dashboard data");
      const result = await res.json();
      setData(Array.isArray(result) ? result[0] : result);
    } catch (err) {
      console.error("Error fetching dashboard:", err);
      setData(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Add a new position
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
      fetchDashboard();
    } catch (err) {
      console.error("Error adding position:", err);
      alert("❌ Failed to add position");
    }
  };

  useEffect(() => {
    fetchDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (loading)
    return (
      <div className="hiring-dashboard">
        <div className="text-center mt-5" style={{ color: "#6d28d9" }}>
          <Spinner animation="border" /> Loading dashboard...
        </div>
      </div>
    );

  if (!data) {
    return (
      <div className="hiring-dashboard">
        <Container className="py-4 text-center">
          <Alert variant="danger">
            Failed to load dashboard data. Please try refreshing.
          </Alert>
          <Button onClick={fetchDashboard} className="purple-btn">
            🔄 Retry
          </Button>
        </Container>
      </div>
    );
  }

  const chartData = [
    { name: "Submissions", value: data.totalSubmissions || 0 },
    { name: "Interviews", value: data.interviewsScheduled || 0 },
    { name: "Offers", value: data.offersMade || 0 },
    { name: "Hired", value: data.hired || 0 },
  ];

  return (
    <div className="hiring-dashboard">
      <Container fluid="lg">
        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold" style={{ color: "#4c1d95" }}>Hiring Manager Dashboard</h2>
          <Badge bg="light" text="dark" className="p-2 fs-6 shadow-sm border">
            Welcome Back 👋
          </Badge>
        </div>

        {/* ROW 1: Chart + Metrics (Aligned Height) */}
        <Row className="mb-4 g-4 align-items-stretch">
          {/* Chart Card */}
          <Col md={7} lg={8}>
            <Card className="shadow-sm h-100 border-0">
              <Card.Body className="d-flex flex-column">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <Card.Title className="text-purple fw-bold mb-0">📊 Hiring Progress</Card.Title>
                  <Button
                    onClick={fetchDashboard}
                    disabled={refreshing}
                    size="sm"
                    variant="outline-primary"
                    style={{ borderColor: "#6d28d9", color: "#6d28d9" }}
                  >
                    {refreshing ? "Refreshing..." : "🔄 Refresh"}
                  </Button>
                </div>
                <div style={{ width: '100%', height: 300, flexGrow: 1 }}>
                  <ResponsiveContainer>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} />
                      <Tooltip cursor={{ fill: '#f3e8ff' }} />
                      <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={50} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Key Metrics Card */}
          <Col md={5} lg={4}>
            <Card className="shadow-sm h-100 border-0">
              <Card.Body className="d-flex flex-column justify-content-center">
                <Card.Title className="text-center text-purple fw-bold mb-4">📈 Key Metrics</Card.Title>
                <div className="metrics-list">
                  <div className="metric-item">
                    <span>📄 Total Submissions:</span>
                    <strong className="text-dark">{data.totalSubmissions}</strong>
                  </div>
                  <div className="metric-item">
                    <span>📅 Interviews:</span>
                    <strong className="text-primary">{data.interviewsScheduled}</strong>
                  </div>
                  <div className="metric-item">
                    <span>💼 Offers Made:</span>
                    <strong className="text-info">{data.offersMade}</strong>
                  </div>
                  <div className="metric-item success">
                    <span>🎯 Hired:</span>
                    <strong className="text-success">{data.hired}</strong>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* ROW 2: Manage Positions */}
        <Row className="mb-4">
          <Col>
            <Card className="shadow-sm border-0">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <Card.Title className="text-purple fw-bold mb-0">💼 Manage Positions</Card.Title>
                  <Button className="purple-outline-btn" size="sm" onClick={() => navigate("/hiring-manager/open-positions")}>
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
                    </Col> {/* ✅ FIX: This </Col> tag was mistyped as </Player> */}
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
                        ➕
                      </Button>
                    </Col>
                  </Row>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* ROW 3: Navigation Cards */}
        <Row className="g-4">
          {[
            { title: "📬 Applications", text: "Review apps & schedule interviews.", path: "/hiring-manager/applications", btn: "View Apps" },
            { title: "🗓️ Interviews", text: "Manage timeslots & feedback.", path: "/hiring-manager/schedule", btn: "Manage" },
            { title: "🧾 POs", text: "Track purchase orders.", path: "/hiring-manager/purchase-orders", btn: "View POs" },
            { title: "💌 Inbox", text: "Messages from candidates.", path: "/hiring-manager/inbox", btn: "Open Inbox" },
            { title: "🚀 Onboarding", text: "Track hired candidate progress.", path: "/hiring-manager/onboarding", btn: "Track" },
            { title: "🤝 Agencies", text: "Invite recruiters.", path: "/hiring-manager/agencies", btn: "Invite" },
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