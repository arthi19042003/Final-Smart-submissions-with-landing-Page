import React, { useState, useEffect } from "react";
import { Container, Card, Table, Button, Form, Row, Col, Badge, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import './HiringManagerDashboard.css';

export default function AgencyInvites() {
  const [invites, setInvites] = useState([]);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("");
  const [sending, setSending] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  // ✅ Fetch Invites & Positions
  const fetchData = async () => {
    if (!token) {
        setLoading(false);
        return;
    }
    try {
      const [invitesRes, positionsRes] = await Promise.all([
        fetch("/api/agencies/invites", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/positions", { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (invitesRes.ok) {
        const invitesData = await invitesRes.json();
        setInvites(invitesData);
      }
      
      if (positionsRes.ok) {
        const positionsData = await positionsRes.json();
        setPositions(positionsData);
      }

    } catch (err) {
      console.error("Error fetching data:", err);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Send Invite
  const handleInvite = async (e) => {
    e.preventDefault();
    if (!email || !selectedPosition) return toast.error("Please provide email and select a position");

    try {
      setSending(true);
      const res = await fetch("/api/agencies/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
            agencyEmail: email, 
            positionId: selectedPosition 
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to send invite");

      toast.success(`Invite sent to ${email}`);
      setEmail(""); 
      setSelectedPosition("");
      
      // Update list with new invite (which is returned populated from backend)
      setInvites([data, ...invites]); 
    } catch (err) {
      console.error("Error sending invite:", err);
      toast.error(err.message);
    } finally {
      setSending(false);
    }
  };

  // ✅ Delete Invite
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this invite?")) return;
    try {
      const res = await fetch(`/api/agencies/invite/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete invite");
      
      toast.success("Invite deleted");
      setInvites(invites.filter(i => i._id !== id));
    } catch (err) {
      toast.error("Error deleting invite");
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [token]);

  if (loading)
    return (
      <div className="dashboard-wrapper">
        <div className="text-center mt-5" style={{ color: "white" }}>
          <Spinner animation="border" variant="light" /> Loading...
        </div>
      </div>
    );

  return (
    <div className="dashboard-wrapper">
      <Container className="py-4">
        <Toaster position="top-right" />
        
        <Card className="shadow-sm border-0 mb-4">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="fw-bold text-dark mb-0">🤝 Manage Agency Invites</h2>
              <Button variant="light" onClick={() => navigate(-1)} className="border">
                ← Back
              </Button>
            </div>

            {/* Invite Form */}
            <Form onSubmit={handleInvite} className="p-3 bg-light rounded mb-4 border">
              <h5 className="mb-3">Send New Invite</h5>
              <Row className="g-2 align-items-end">
                <Col md={5}>
                  <Form.Label>Agency Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="agency@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Col>
                <Col md={4}>
                  <Form.Label>Position</Form.Label>
                  <Form.Select 
                    value={selectedPosition} 
                    onChange={(e) => setSelectedPosition(e.target.value)}
                    required
                  >
                    <option value="">Select Position...</option>
                    {positions.map(pos => (
                        <option key={pos._id} value={pos._id}>
                            {pos.title}
                        </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col md={3}>
                  <Button type="submit" variant="primary" className="w-100" disabled={sending}>
                    {sending ? <Spinner size="sm" animation="border" /> : "📨 Send Invite"}
                  </Button>
                </Col>
              </Row>
            </Form>

            {/* Invites Table */}
            <h5 className="mb-3">Sent Invites</h5>
            {invites.length === 0 ? (
              <p className="text-muted text-center">No invites sent yet.</p>
            ) : (
              <div className="table-responsive">
                <Table hover className="align-middle">
                  <thead className="bg-light table-light">
                    <tr>
                      <th className="p-3">Agency Email</th>
                      <th className="p-3">Position</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Sent Date</th>
                      <th className="p-3 text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invites.map((invite) => (
                      <tr key={invite._id}>
                        <td className="p-3 fw-bold">{invite.agencyEmail}</td>
                        <td className="p-3">
                            {invite.position ? invite.position.title : <span className="text-muted">Deleted Position</span>}
                        </td>
                        <td className="p-3">
                          <Badge bg={invite.status === 'accepted' ? 'success' : 'warning'} text="dark">
                            {invite.status}
                          </Badge>
                        </td>
                        <td className="p-3">{new Date(invite.createdAt).toLocaleDateString()}</td>
                        <td className="p-3 text-end">
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(invite._id)}
                          >
                            🗑️ Delete
                          </Button>
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