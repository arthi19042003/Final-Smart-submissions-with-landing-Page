import React, { useEffect, useState, useMemo } from "react";
import {
  Button,
  Form,
  Spinner,
  Modal,
  Table,
  Container,
  Row,
  Col,
  Card
} from "react-bootstrap";
import { FaSearch, FaFilter, FaChevronLeft, FaChevronRight, FaChevronDown } from 'react-icons/fa';
import api from "../api/axios";
import toast, { Toaster } from "react-hot-toast";
import "./ApplicationsDashboard.css";

const ITEMS_PER_PAGE = 5;

export default function ApplicationsDashboard() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- Filter & Pagination State ---
  const [filterText, setFilterText] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  // Modals state
  const [showScheduleModal, setShowScheduleModal] = useState(false); 
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [interviewDate, setInterviewDate] = useState("");
  const [history, setHistory] = useState([]);

  // --- Confirmation Modal State ---
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingAction, setPendingAction] = useState({ id: null, type: '' });
  
  const token = localStorage.getItem("token"); 

  // Updated button style for horizontal layout
  const purpleBtnStyle = {
    backgroundColor: "#6d28d9", 
    borderColor: "#6d28d9",
    color: "#fff", 
    fontWeight: "500",
    whiteSpace: "nowrap" 
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

  const updateStatus = async (id, action, payload = {}) => {
    if (!token) return;
    try {
      const res = await api.put(`/applications/${id}/${action}`, payload);
      if (res.status === 200) {
        toast.success(`Application updated successfully`);
        fetchApplications(); 
      }
    } catch (err) {
      console.error(`Error performing ${action}:`, err);
      toast.error(`Failed to update application`);
    }
  };

  // --- New Handler for opening confirmation modal ---
  const initiateAction = (id, type) => {
    setPendingAction({ id, type });
    setShowConfirmModal(true);
  };

  // --- Handler for confirming the action in modal ---
  const confirmAction = () => {
    if (pendingAction.id && pendingAction.type) {
      updateStatus(pendingAction.id, pendingAction.type);
    }
    setShowConfirmModal(false);
    setPendingAction({ id: null, type: '' });
  };

  const handleViewHistory = async (email) => {
    if (!token) return;
    try {
      const res = await api.get(`/applications/history/${email}`);
      setHistory(res.data);
      setShowHistoryModal(true); 
    } catch (err) {
      console.error("Error fetching history:", err);
      toast.error("Failed to load history.");
    }
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

  // --- FILTER & PAGINATION LOGIC ---
  const filteredApplications = useMemo(() => {
    let items = [...applications];
    const filterLower = filterText.toLowerCase();

    items = items.filter(app => {
      if (statusFilter !== 'All' && app.status !== statusFilter) return false;
      if (filterLower) {
        const name = (app.candidateName || '').toLowerCase();
        const email = (app.email || '').toLowerCase();
        const position = (app.position || '').toLowerCase();
        return name.includes(filterLower) || email.includes(filterLower) || position.includes(filterLower);
      }
      return true;
    });

    if (currentPage > Math.ceil(items.length / ITEMS_PER_PAGE) && items.length > 0) {
      setCurrentPage(1);
    } else if (items.length === 0 && currentPage !== 1) {
       setCurrentPage(1);
    }
    return items;
  }, [applications, filterText, statusFilter, currentPage]);

  const totalItems = filteredApplications.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  
  const paginatedApplications = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredApplications.slice(startIndex, endIndex);
  }, [filteredApplications, currentPage]);
  
  const handlePrev = () => { if (currentPage > 1) setCurrentPage(prev => prev - 1); };
  const handleNext = () => { if (currentPage < totalPages) setCurrentPage(prev => prev + 1); };


  if (loading)
    return (
      <Container fluid className="applications-dashboard-container text-center">
        <div className="py-5">
          <Spinner animation="border" variant="primary" /> 
          <p className="mt-2 text-muted">Loading Applications...</p>
        </div>
      </Container>
    );

  return (
    <Container fluid className="applications-dashboard-container p-4">
      <Toaster position="top-center" reverseOrder={false} />
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold" style={{ color: "#5b21b6" }}>Candidate Applications</h2>
      </div>

      <Row className="mb-4 g-3">
        <Col md={9}>
          <div className="search-box position-relative bg-white rounded shadow-sm p-2">
             <FaSearch className="search-icon text-primary ms-2" />
             <Form.Control 
               type="text" 
               placeholder="Filter by Candidate Name, Email, or Position..." 
               className="ps-5 border-0 search-input" 
               value={filterText} 
               onChange={(e) => { setFilterText(e.target.value); setCurrentPage(1); }} 
             />
          </div>
        </Col>
        <Col md={3}>
           <div className="filter-wrapper bg-white rounded shadow-sm p-2">
             
             <FaFilter className="filter-icon-left" />
             
             <Form.Select 
               value={statusFilter} 
               onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }} 
               className="filter-select border-0 shadow-none"
             >
               <option value="All">All Statuses</option>
               <option value="Applied">Applied</option>
               <option value="Submitted">Submitted</option>
               <option value="Under Review">Under Review</option>
               <option value="Interview">Interview</option>
               <option value="Hired">Hired</option>
               <option value="Rejected">Rejected</option>
             </Form.Select>
             
             <FaChevronDown className="filter-icon-right" />
             
           </div>
        </Col>
      </Row>

      <Card className="shadow-sm border-0 mb-5">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="align-middle open-positions-table mb-0">
              <thead className="bg-light table-light">
                <tr>
                  <th className="p-3">Candidate</th>
                  <th className="p-3">Position</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Interview</th>
                  <th className="p-3 text-center" style={{ minWidth: "380px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedApplications.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-5 text-muted">
                      <h5>No applications found.</h5>
                    </td>
                  </tr>
                ) : (
                  paginatedApplications.map((app) => (
                    <tr key={app._id}>
                      <td className="p-3">
                        <strong className="text-dark">{app.candidateName || "Name Unavailable"}</strong>
                        <div className="text-muted small">{app.email}</div>
                      </td>
                      <td className="p-3 text-secondary">{app.position}</td>
                      <td className="p-3">
                        <span className="fw-bold" style={{ color: "black" }}>
                          {app.status}
                        </span>
                      </td>
                      <td className="p-3">
                        {app.interviewDate
                          ? new Date(app.interviewDate).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="p-3 text-center">
                        <div className="d-flex flex-row gap-2 justify-content-center align-items-center">
                          <Button
                            size="sm"
                            style={purpleBtnStyle}
                            onClick={() => handleViewResume(app.resumeUrl)}
                          >
                            Resume
                          </Button>
                          
                          {/* ✅ FIX: Expanded condition to catch "Applied", "Submitted" and "submitted" */}
                          {["Applied", "Submitted", "submitted"].includes(app.status) && (
                            <Button
                              size="sm"
                              style={purpleBtnStyle}
                              onClick={() => updateStatus(app._id, "review")}
                            >
                              Review
                            </Button>
                          )}
                          
                          {app.status !== "Rejected" && app.status !== "Hired" && (
                             <Button
                              size="sm"
                              style={{...purpleBtnStyle, backgroundColor: "#7c3aed", borderColor: "#7c3aed"}} 
                              onClick={() => initiateAction(app._id, "reject")}
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
                              style={{ whiteSpace: "nowrap" }}
                            >
                              Hired ({app.onboardingStatus})
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              style={purpleBtnStyle}
                              onClick={() => initiateAction(app._id, "hire")}
                            >
                              Hire
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>

          {/* --- PAGINATION SECTION --- */}
          {totalItems > 0 && ( 
            <div className="d-flex justify-content-center py-4 border-top bg-light rounded-bottom">
                <div 
                  className="d-flex align-items-center justify-content-between bg-white border rounded shadow-sm p-1" 
                  style={{ minWidth: '250px' }}
                >
                    <button 
                        className="btn btn-light d-flex align-items-center justify-content-center border-0"
                        onClick={handlePrev} 
                        disabled={currentPage === 1}
                        style={{ width: '32px', height: '32px', padding: 0, background: 'transparent' }}
                    >
                        <FaChevronLeft size={14} className={currentPage === 1 ? "text-muted" : "text-dark"} />
                    </button>

                    <span className="fw-semibold text-secondary small mx-3" style={{ whiteSpace: 'nowrap' }}>
                        Page {currentPage} of {totalPages}
                    </span>

                    <button 
                        className="btn btn-light d-flex align-items-center justify-content-center border-0"
                        onClick={handleNext} 
                        disabled={currentPage === totalPages}
                        style={{ width: '32px', height: '32px', padding: 0, background: 'transparent' }}
                    >
                        <FaChevronRight size={14} className={currentPage === totalPages ? "text-muted" : "text-dark"} />
                    </button>
                </div>
            </div>
          )}

        </Card.Body>
      </Card>

      {/* --- Action Confirmation Modal --- */}
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Action</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to {pendingAction.type === 'hire' ? <strong className="text-success">hire</strong> : <strong className="text-danger">reject</strong>} this candidate?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
            Cancel
          </Button>
          <Button 
            variant={pendingAction.type === 'hire' ? "success" : "danger"} 
            onClick={confirmAction}
          >
            {pendingAction.type === 'hire' ? "Yes, Hire" : "Yes, Reject"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* --- Existing Schedule & History Modals --- */}
      <Modal show={showScheduleModal} onHide={() => setShowScheduleModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Schedule Interview</Modal.Title>
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
          <Button variant="primary" onClick={() => {/* handleSchedule */}}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showHistoryModal}
        onHide={() => setShowHistoryModal(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Candidate Application History</Modal.Title>
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
    </Container>
  );
}