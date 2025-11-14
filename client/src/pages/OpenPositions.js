import React, { useEffect, useState } from "react";
import { Container, Table, Button, Badge, Form, Spinner, Card, Row, Col } from "react-bootstrap";
import toast, { Toaster } from "react-hot-toast";

export default function OpenPositions() {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ title: "", location: "", openings: 1, requiredSkills: "" });

  // ✅ FIX: Get token directly from localStorage
  const token = localStorage.getItem("token");

  // ✅ Fetch all positions
  const fetchPositions = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await fetch("/api/positions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load positions");
      const data = await res.json();
      setPositions(data);
    } catch (err) {
      console.error("Error fetching positions:", err);
      // toast.error("Failed to load positions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPositions();
    // eslint-disable-next-line
  }, [token]);

  // ✅ Handle Edit Click
  const handleEdit = (position) => {
    setEditingId(position._id);
    setEditData({
      title: position.title,
      location: position.location,
      openings: position.openings,
      requiredSkills: Array.isArray(position.requiredSkills) 
        ? position.requiredSkills.join(", ") 
        : (position.requiredSkills || ""),
    });
  };

  // ✅ Handle Save
  const handleSave = async (id) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/positions/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editData),
      });

      if (!res.ok) throw new Error("Failed to update position");

      toast.success("Position updated successfully!");
      setEditingId(null);
      fetchPositions();
    } catch (err) {
      console.error(err);
      toast.error("Error updating position");
    }
  };

  // ✅ Handle Close Position
  const handleClose = async (id) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/positions/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "Closed" }),
      });
      if (!res.ok) throw new Error("Failed to close position");
      toast.success("Position closed!");
      fetchPositions();
    } catch (err) {
      console.error(err);
      toast.error("Error closing position");
    }
  };

  // ✅ Handle Delete
  const handleDelete = async (id) => {
    if (!token) return;
    if (!window.confirm("Are you sure you want to delete this position?")) return;
    try {
      const res = await fetch(`/api/positions/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete position");
      toast.success("Position deleted");
      fetchPositions();
    } catch (err) {
      console.error(err);
      toast.error("Error deleting position");
    }
  };

  if (loading) return (
    <div className="text-center mt-5" style={{ paddingTop: "100px" }}>
      <Spinner animation="border" variant="primary" /> Loading positions...
    </div>
  );

  return (
    // ✅ Added marginTop to fix Navbar overlap
    <Container className="py-4" style={{ marginTop: "100px" }}>
      <Toaster position="top-right" />
      
      <Card className="shadow-sm border-0">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="fw-bold text-dark mb-0">📂 Open Positions</h2>
            <Badge bg="primary" className="fs-6">Total: {positions.length}</Badge>
          </div>

          {positions.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <h5>No positions found.</h5>
              <p>Create a new position from your Dashboard to see it here.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="align-middle">
                <thead className="bg-light table-light">
                  <tr>
                    <th className="p-3">Title</th>
                    <th className="p-3">Location</th>
                    <th className="p-3">Required Skills</th>
                    <th className="p-3">Openings</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {positions.map((pos) => (
                    <tr key={pos._id}>
                      {/* Title */}
                      <td className="p-3">
                        {editingId === pos._id ? (
                          <Form.Control
                            type="text"
                            value={editData.title}
                            onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                          />
                        ) : (
                          <span className="fw-semibold">{pos.title}</span>
                        )}
                      </td>

                      {/* Location */}
                      <td className="p-3">
                        {editingId === pos._id ? (
                          <Form.Control
                            type="text"
                            value={editData.location}
                            onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                          />
                        ) : (
                          <span className="text-muted">{pos.location}</span>
                        )}
                      </td>

                      {/* Skills */}
                      <td className="p-3">
                        {editingId === pos._id ? (
                          <Form.Control
                            type="text"
                            value={editData.requiredSkills}
                            onChange={(e) => setEditData({ ...editData, requiredSkills: e.target.value })}
                          />
                        ) : (
                          <small className="text-muted">
                            {Array.isArray(pos.requiredSkills) 
                              ? pos.requiredSkills.join(", ") 
                              : pos.requiredSkills}
                          </small>
                        )}
                      </td>

                      {/* Openings */}
                      <td className="p-3">
                        {editingId === pos._id ? (
                          <Form.Control
                            type="number"
                            style={{ width: "80px" }}
                            value={editData.openings}
                            onChange={(e) => setEditData({ ...editData, openings: e.target.value })}
                          />
                        ) : (
                          pos.openings
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-3">
                        <Badge bg={pos.status === 'Open' ? 'success' : 'secondary'}>
                          {pos.status}
                        </Badge>
                      </td>

                      {/* Actions */}
                      <td className="p-3 text-end">
                        <div className="d-flex gap-2 justify-content-end">
                          {editingId === pos._id ? (
                            <>
                              <Button variant="success" size="sm" onClick={() => handleSave(pos._id)}>
                                💾 Save
                              </Button>
                              <Button variant="secondary" size="sm" onClick={() => setEditingId(null)}>
                                ❌ Cancel
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button variant="outline-primary" size="sm" onClick={() => handleEdit(pos)}>
                                ✏️ Edit
                              </Button>
                              {pos.status === "Open" && (
                                <Button variant="outline-warning" size="sm" onClick={() => handleClose(pos._id)}>
                                  🔒 Close
                                </Button>
                              )}
                              <Button variant="outline-danger" size="sm" onClick={() => handleDelete(pos._id)}>
                                🗑️ Delete
                              </Button>
                            </>
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
  );
}