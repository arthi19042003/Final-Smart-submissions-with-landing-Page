import React, { useEffect, useState } from "react";
import { Container, Card, Button, Table, Spinner } from "react-bootstrap";
import './HiringManagerDashboard.css'; 

export default function OnboardingDashboard() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOnboarding = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/onboarding", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      setCandidates(data);
    } catch (err) {
      console.error("Error fetching onboarding list:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOnboarding();
  }, []);

  const updateStatus = async (id, onboardingStatus) => {
    try {
      const res = await fetch(`/api/onboarding/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ onboardingStatus }),
      });
      if (res.ok) fetchOnboarding();
    } catch (err) {
      console.error("Error updating onboarding status:", err);
    }
  };


  if (loading)
    return (
      <div className="dashboard-wrapper text-center mt-5">
        <Spinner animation="border" variant="primary" /> Loading onboarding list...
      </div>
    );

  return (
    <div className="dashboard-wrapper">
      <Container className="py-4">
        <Card className="shadow-sm">
          <Card.Body>
            <Card.Title className="fw-bold text-purple"> Onboarding Dashboard</Card.Title>
            <Card.Text className="text-muted">
              Track the progress of candidates after they are hired.
            </Card.Text>

            {candidates.length === 0 ? (
              <p className="text-muted">No candidates in onboarding yet.</p>
            ) : (
              <Table striped bordered hover responsive>
                <thead className="table-light">
                  <tr>
                    <th>Candidate</th>
                    <th>Position</th>
                    <th>Department</th>
                    <th>Status</th>
                    <th>Onboarding Progress</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map((c) => (
                    <tr key={c._id}>
                      <td>
                        <strong>{c.candidateName}</strong>
                        <div className="text-muted small">{c.email}</div>
                      </td>
                      <td>{c.position}</td>
                      <td>{c.department || "-"}</td>
                      
                      {/* Badges removed here */}
                      <td>
                        {c.status}
                      </td>
                      <td>
                        {c.onboardingStatus}
                      </td>
                      
                      <td>
                        <div className="d-flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            className="purple-btn" 
                            onClick={() => updateStatus(c._id, "Pending")}
                          >
                            Pending
                          </Button>
                          <Button
                            size="sm"
                            className="purple-btn" 
                            onClick={() => updateStatus(c._id, "In Progress")}
                          >
                            In Progress
                          </Button>
                          <Button
                            size="sm"
                            className="purple-btn" 
                            onClick={() => updateStatus(c._id, "Completed")}
                          >
                            Completed
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}