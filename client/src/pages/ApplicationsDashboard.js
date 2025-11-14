import React, { useEffect, useState } from "react";
import {
  Button,
  Form,
  Spinner,
  Modal,
  Table,
  Badge,
} from "react-bootstrap";
import api from "../api/axios";
import toast, { Toaster } from "react-hot-toast";

export default function ApplicationsDashboard() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  
  // Modals state
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  
  const [interviewDate, setInterviewDate] = useState("");
  const [history, setHistory] = useState([]);
  
  const token = localStorage.getItem("token"); 

  // ✅ Reusable style for Purple Buttons
  const purpleBtnStyle = {
    backgroundColor: "#6d28d9", // Purple
    borderColor: "#6d28d9",
    color: "#fff", // White text
    width: "100%",
    marginBottom: "5px",
    fontWeight: "500"
  };

  const fetchApplications = async () => {
    if (!token) {
      setLoading(false);
      return; 
    }
    try {
      setLoading(true);
      const res = await api.get("/applications");
      setApplications(res.data);
    } catch (err) {
      console.error("Error fetching applications:", err);
      toast.error("Failed to load applications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
    // eslint-disable-next-line
  }, [token]);

  // ✅ Generic Status Update Function (Used for Review, Hire, Reject)
  const updateStatus = async (id, action, payload = {}) => {
    if (!token) return;
    try {
      const res = await api.put(`/applications/${id}/${action}`, payload);
      if (res.status === 200) {
        toast.success(`Application ${action} successful`);
        fetchApplications(); // Refresh list to show new status
      }
    } catch (err) {
      console.error(`Error performing ${action}:`, err);
      toast.error(`Failed to ${action} application`);
    }
  };

  // ✅ Fetch History & Show Modal
  const handleViewHistory = async (email) => {
    if (!token) return;
    try {
      const res = await api.get(`/applications/history/${email}`);
      setHistory(res.data);
      setShowHistoryModal(true); // Open modal after data is loaded
    } catch (err) {
      console.error("Error fetching history:", err);
      toast.error("Failed to load history.");
    }
  };

  const handleSchedule = async () => {
    if (!interviewDate) return toast.error("Select a date first!");
    if (!selectedApp) return;

    await updateStatus(selectedApp._id, "schedule", { interviewDate });
    setInterviewDate("");
    setShowScheduleModal(false);
  };

  const handleViewResume = (resumePath) => {
    if (!resumePath) {
        toast.error("No resume file available.");
        return;
    }
    const normalizedPath = resumePath.replace(/\\/g, "/");
    const fileUrl = `http://localhost:5000/${normalizedPath}`;
    window.open(fileUrl, "_blank");
  };

  if (loading)
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="primary" /> Loading Applications...
      </div>
    );

  return (
    // ✅ Added more paddingTop and minHeight
    <div className="container mt-4" style={{ paddingTop: "120px", minHeight: "100vh" }}>
      <Toaster position="top-right" />
      <h2 className="mb-4" style={{ color: "#5b21b6", fontWeight: "700" }}>📬 Candidate Applications</h2>

      {applications.length === 0 ? (
        <p className="text-muted">No applications found.</p>
      ) : (
        <Table striped bordered hover responsive className="shadow-sm bg-white rounded align-middle">
          <thead className="table-light">
            <tr>
              <th>Candidate</th>
              <th>Position</th>
              <th>Status</th>
              <th>Interview</th>
              <th style={{ width: "250px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app._id}>
                <td>
                  {/* ✅ Added fallback for missing name */}
                  <strong>{app.candidateName || "Name Unavailable"}</strong>
                  <div className="text-muted small">{app.email}</div>
                </td>
                <td>{app.position}</td>
                <td>
                  <Badge
                    bg={
                      app.status === "Hired"
                        ? "success"
                        : app.status === "Rejected"
                        ? "danger"
                        : app.status === "Interview"
                        ? "info"
                        : app.status === "Under Review" 
                        ? "warning"
                        : "secondary"
                    }
                  >
                    {app.status}
                  </Badge>
                </td>
                <td>
                  {app.interviewDate
                    ? new Date(app.interviewDate).toLocaleDateString()
                    : "-"}
                </td>
                <td>
                  {/* ✅ Changed to flex-column for stacked buttons */}
                  <div className="d-flex flex-column">
                    <Button
                      size="sm"
                      style={purpleBtnStyle}
                      onClick={() => handleViewResume(app.resumeUrl)}
                    >
                      📄 Resume
                    </Button>
                    
                    {app.status === "Applied" && (
                      <Button
                        size="sm"
                        style={purpleBtnStyle}
                        onClick={() => updateStatus(app._id, "review")}
                      >
                        Review
                      </Button>
                    )}

                    <Button
                      size="sm"
                      style={purpleBtnStyle}
                      onClick={() => {
                        setSelectedApp(app);
                        setShowScheduleModal(true);
                      }}
                    >
                      Schedule
                    </Button>
                    
                    {app.status !== "Rejected" && app.status !== "Hired" && (
                       <Button
                        size="sm"
                        style={{...purpleBtnStyle, backgroundColor: "#7c3aed"}} // Lighter purple for variety
                        onClick={() => {
                          if (window.confirm("Are you sure you want to reject this candidate?")) {
                            updateStatus(app._id, "reject");
                          }
                        }}
                      >
                        Reject
                      </Button>
                    )}
                   
                    <Button
                      size="sm"
                      style={purpleBtnStyle}
                      onClick={() => handleViewHistory(app.email)}
                    >
                      History
                    </Button>
                    
                    {app.status === "Hired" ? (
                      <Button
                        size="sm"
                        variant="success"
                        disabled
                        style={{ width: "100%" }}
                      >
                        Hired ({app.onboardingStatus})
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        style={purpleBtnStyle}
                        onClick={() => {
                           if (window.confirm("Are you sure you want to hire this candidate?")) {
                            updateStatus(app._id, "hire");
                           }
                        }}
                      >
                        Hire
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Interview Scheduler Modal */}
      <Modal show={showScheduleModal} onHide={() => setShowScheduleModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>🗓️ Schedule Interview</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Select Date</Form.Label>
            <Form.Control
              type="date"
              value={interviewDate}
              onChange={(e) => setInterviewDate(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowScheduleModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSchedule}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ✅ Candidate History Modal (Fixed) */}
      <Modal
        show={showHistoryModal}
        onHide={() => setShowHistoryModal(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>🗂️ Candidate Application History</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {history.length === 0 ? (
            <p className="text-center text-muted">No history found.</p>
          ) : (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Position</th>
                  <th>Status</th>
                  <th>Applied Date</th>
                  <th>Interview Date</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h, i) => (
                  <tr key={i}>
                    <td>{h.position}</td>
                    <td>{h.status}</td>
                    <td>{new Date(h.appliedAt).toLocaleDateString()}</td>
                    <td>
                      {h.interviewDate
                        ? new Date(h.interviewDate).toLocaleDateString()
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Modal.Body>
        <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowHistoryModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}