import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaSearch, FaFilter, FaChevronLeft, FaChevronRight } from "react-icons/fa"; 
import { Container, Card, Table, Button, Spinner, Alert, Row, Col, Form } from "react-bootstrap";
import toast, { Toaster } from "react-hot-toast";
import './HiringManagerDashboard.css'; 
import './ViewPurchaseOrders.css'; 

const ITEMS_PER_PAGE = 5;

export default function ViewPurchaseOrders() {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // --- Filter & Pagination State ---
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const token = localStorage.getItem("token"); 

  const fetchPOs = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/purchase-orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch purchase orders");
      const result = await res.json();
      setPurchaseOrders(result);
    } catch (err) {
      console.error("Error fetching POs:", err);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPOs();
  }, [token]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

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
      fetchPOs();
    } catch (err) {
      console.error("Error updating PO status:", err);
      toast.error("Failed to update status");
    }
  };

  // --- Filter Logic Only (Sorting Removed) ---
  const processedData = useMemo(() => {
    let data = [...purchaseOrders];

    // 1. Status Filter
    if (statusFilter !== "All") {
      data = data.filter(po => po.status === statusFilter);
    }

    // 2. Search Filter
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      data = data.filter(po => 
        (po.poNumber && po.poNumber.toLowerCase().includes(lowerTerm)) ||
        (po.candidateName && po.candidateName.toLowerCase().includes(lowerTerm)) ||
        (po.positionTitle && po.positionTitle.toLowerCase().includes(lowerTerm))
      );
    }

    return data;
  }, [purchaseOrders, searchTerm, statusFilter]);

  // --- Pagination Logic ---
  const totalItems = processedData.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  const paginatedData = processedData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

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
        <Toaster position="top-center" reverseOrder={false} />
        
        <Card className="shadow-sm border-0">
          <Card.Body>
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4 header-row">
              <h2 className="fw-bold mb-0 text-purple">Purchase Orders</h2>
              <Button
                onClick={() => navigate("/hiring-manager/create-po")}
                className="purple-btn create-btn" 
              >
                <FaPlus /> Create New PO
              </Button>
            </div>

            {/* Filters Row */}
            <Row className="mb-3 g-2">
              <Col md={8}>
                <div className="search-wrapper">
                  <FaSearch className="search-icon" />
                  <Form.Control 
                    type="text"
                    placeholder="Search PO Number, Candidate, or Position..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                </div>
              </Col>
              <Col md={4}>
                <div className="filter-wrapper">
                  <FaFilter className="filter-icon" />
                  <Form.Select 
                    value={statusFilter} 
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="filter-select"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </Form.Select>
                </div>
              </Col>
            </Row>

            {/* Table */}
            {paginatedData.length === 0 ? (
              <Alert variant="info" className="text-center mt-3">
                No purchase orders found matching your criteria.
              </Alert>
            ) : (
              <>
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
                    {paginatedData.map((po) => (
                      <tr key={po._id}>
                        <td className="p-3 fw-semibold">{po.poNumber}</td>
                        <td className="p-3">{po.candidateName}</td>
                        <td className="p-3">{po.positionTitle || po.position}</td>
                        <td className="p-3">{po.department || '-'}</td>
                        <td className="p-3">${po.rate}</td>
                        <td className="p-3">
                          {po.startDate ? new Date(po.startDate).toLocaleDateString() : "-"}
                        </td>
                        {/* Plain black text for status */}
                        <td className="p-3">
                          <span style={{ color: "#000", fontWeight: "500" }}>
                            {po.status}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <div className="d-flex gap-2 justify-content-center">
                              {po.status === "Pending" ? (
                                <>
                                  <Button
                                      onClick={() => updateStatus(po._id, "Approved")}
                                      variant="success"
                                      size="sm"
                                  >
                                      Approve
                                  </Button>
                                  <Button
                                      onClick={() => updateStatus(po._id, "Rejected")}
                                      variant="danger"
                                      size="sm"
                                  >
                                      Reject
                                  </Button>
                                </>
                              ) : (
                                <span className="text-muted">—</span>
                              )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              {/* Pagination UI */}
              {totalItems > 0 && (
                <div className="pagination-container">
                  <div className="pagination-box">
                     <button 
                       className="pagination-arrow"
                       disabled={currentPage === 1} 
                       onClick={handlePrev}
                     >
                       <FaChevronLeft />
                     </button>
                     
                     <span className="pagination-text">
                       Page {currentPage} of {totalPages}
                     </span>
                     
                     <button 
                       className="pagination-arrow" 
                       disabled={currentPage === totalPages} 
                       onClick={handleNext}
                     >
                       <FaChevronRight />
                     </button>
                  </div>
                </div>
              )}
              </>
            )}
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}