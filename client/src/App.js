// client/src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import Navbar from "./components/Navbar";
import "./App.css";

// ==================== Core Pages ====================
import LandingPage from "./pages/LandingPage"; 

// ==================== Auth Pages ====================
import Login from "./pages/Login";
import EmployerLogin from "./pages/EmployerLogin";
import HiringManagerLogin from "./pages/HiringManagerLogin";
import RecruiterLogin from "./pages/RecruiterLogin";

import Register from "./pages/Register";
import EmployerRegister from "./pages/EmployerRegister";
import HiringManagerRegister from "./pages/HiringManagerRegister";
import RecruiterRegister from "./pages/RecruiterRegister"; 

// ==================== Candidate Pages ====================
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import ResumeUpload from "./pages/ResumeUpload";
import CandidateInterviewList from "./pages/Interviews"; 
import CandidateJobs from "./pages/CandidateJobs"; // ✅ IMPORT NEW PAGE

// ==================== Employer Pages ====================
import EmployerDashboard from "./pages/Dashboard"; 
import EmployerProfile from "./pages/EmployerProfile";
import CreatePosition from "./pages/CreatePosition"; 

// ==================== Recruiter Pages ====================
import RecruiterDashboard from "./pages/RecruiterDashboard";
import RecruiterProfile from "./pages/RecruiterProfile"; 
import RecruiterProfileEdit from "./pages/RecruiterProfileEdit";
import RecruiterProfileView from "./pages/RecruiterProfileView";
import ResumeUploadRecruiter from "./pages/ResumeUploadRecruiter"; 
import SubmissionStatus from "./pages/SubmissionStatus";

// ==================== Hiring Manager Pages (NEW & UPDATED) ====================
import HiringManagerDashboard from "./pages/HiringManagerDashboard"; 
import Inbox from "./pages/Inbox";
import OpenPositions from "./pages/OpenPositions"; 
import CandidateListPage from "./pages/CandidateList";
import InterviewManagementPage from "./pages/InterviewDetails"; 
// New imports from Final HR integration
import ApplicationsDashboard from "./pages/ApplicationsDashboard";
import OnboardingDashboard from "./pages/OnboardingDashboard";
import ViewPurchaseOrders from "./pages/ViewPurchaseOrders";
import CreatePurchaseOrder from "./pages/CreatePurchaseOrder";
import AgencyInvites from "./pages/AgencyInvites";
import ResumeDetailPage from "./pages/ResumeDetailPage";
import PositionDetails from "./pages/PositionDetails";
import CandidateHistory from "./pages/CandidateHistory";


// ==================== Role-Based Dashboard Redirect ====================
function RoleBasedDashboard() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;

  const role = (user.role || user.userType || "").toLowerCase();

  if (role === "employer") return <Navigate to="/employer/dashboard" />;
  if (role === "recruiter") return <Navigate to="/recruiter/dashboard" />;
  if (role === "hiringmanager") return <Navigate to="/hiring-manager/dashboard" />;
  
  return <Dashboard />; // candidate default
}

// ==================== Main App ====================
function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />

          <Routes>
            {/* ==================== Public Routes ==================== */}
            <Route path="/" element={<LandingPage />} />
            
            <Route path="/login" element={<Login />} />
            <Route path="/login/employer" element={<EmployerLogin />} />
            <Route path="/login/hiring-manager" element={<HiringManagerLogin />} />
            <Route path="/login/recruiter" element={<RecruiterLogin />} />

            <Route path="/register" element={<Register />} />
            <Route path="/register/employer" element={<EmployerRegister />} />
            <Route path="/register/hiring-manager" element={<HiringManagerRegister />} />
            <Route path="/register/recruiter" element={<RecruiterRegister />} /> 

            {/* ==================== Role-Based Dashboard ==================== */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <RoleBasedDashboard />
                </PrivateRoute>
              }
            />
            
            {/* ==================== Candidate Routes ==================== */}
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
            <Route
              path="/resume"
              element={
                <PrivateRoute>
                  <ResumeUpload />
                </PrivateRoute>
              }
            />
            {/* ✅ ADD NEW ROUTE */}
            <Route
              path="/candidate/jobs"
              element={
                <PrivateRoute>
                  <CandidateJobs />
                </PrivateRoute>
              }
            />
            <Route
              path="/interviews"
              element={
                <PrivateRoute>
                  <CandidateInterviewList />
                </PrivateRoute>
              }
            />

            {/* ==================== Employer Routes ==================== */}
            <Route
              path="/employer/dashboard"
              element={
                <PrivateRoute>
                  <EmployerDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/employer/profile"
              element={
                <PrivateRoute>
                  <EmployerProfile />
                </PrivateRoute>
              }
            />
             <Route
              path="/positions/new"
              element={
                <PrivateRoute>
                  <CreatePosition />
                </PrivateRoute>
              }
            />
            
            {/* ==================== Recruiter Routes ==================== */}
            <Route
              path="/recruiter/dashboard"
              element={
                <PrivateRoute>
                  <RecruiterDashboard />
                </PrivateRoute>
              }
            />
             <Route
              path="/recruiter/profile"
              element={
                <PrivateRoute>
                  <RecruiterProfile />
                </PrivateRoute>
              }
            />
            <Route
              path="/recruiter/profile/view"
              element={
                <PrivateRoute>
                  <RecruiterProfileView />
                </PrivateRoute>
              }
            />
            <Route
              path="/recruiter/profile/edit"
              element={
                <PrivateRoute>
                  <RecruiterProfileEdit />
                </PrivateRoute>
              }
            />
            <Route
              path="/recruiter/submit-resume"
              element={
                <PrivateRoute>
                  <ResumeUploadRecruiter />
                </PrivateRoute>
              }
            />
            <Route
              path="/recruiter/submission-status"
              element={
                <PrivateRoute>
                  <SubmissionStatus />
                </PrivateRoute>
              }
            />

            {/* ==================== Hiring Manager Routes (Updated) ==================== */}
            <Route
              path="/hiring-manager/dashboard"
              element={
                <PrivateRoute>
                  <HiringManagerDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/hiring-manager/inbox"
              element={
                <PrivateRoute>
                  <Inbox />
                </PrivateRoute>
              }
            />
            <Route
              path="/hiring-manager/open-positions"
              element={
                <PrivateRoute>
                  <OpenPositions />
                </PrivateRoute>
              }
            />
            <Route
              path="/hiring-manager/candidates"
              element={
                <PrivateRoute>
                  <CandidateListPage />
                </PrivateRoute>
              }
            />
            {/* New Features */}
            <Route
              path="/hiring-manager/applications"
              element={
                <PrivateRoute>
                  <ApplicationsDashboard />
                </PrivateRoute>
              }
            />
             <Route
              path="/hiring-manager/onboarding"
              element={
                <PrivateRoute>
                  <OnboardingDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/hiring-manager/purchase-orders"
              element={
                <PrivateRoute>
                  <ViewPurchaseOrders />
                </PrivateRoute>
              }
            />
            <Route
              path="/hiring-manager/create-po"
              element={
                <PrivateRoute>
                  <CreatePurchaseOrder />
                </PrivateRoute>
              }
            />
            <Route
              path="/hiring-manager/agencies"
              element={
                <PrivateRoute>
                  <AgencyInvites />
                </PrivateRoute>
              }
            />
            <Route
              path="/hiring-manager/resume/:id"
              element={
                <PrivateRoute>
                  <ResumeDetailPage />
                </PrivateRoute>
              }
            />

            {/* Details Pages */}
            <Route
              path="/hiring-manager/candidate/:id"
              element={
                <PrivateRoute>
                  <CandidateHistory />
                </PrivateRoute>
              }
            />
            <Route
              path="/hiring-manager/position/:id"
              element={
                <PrivateRoute>
                  <PositionDetails />
                </PrivateRoute>
              }
            />
            <Route
              path="/hiring-manager/schedule"
              element={
                <PrivateRoute>
                  <InterviewManagementPage />
                </PrivateRoute>
              }
            />

            {/* ==================== Default Redirect ==================== */}
            <Route
              path="*"
              element={
                <div style={{ textAlign: "center", marginTop: "120px" }}>
                  <h2 style={{ fontSize: "2rem", color: "#333" }}>⚠️ 404 - Page Not Found</h2>
                  <p style={{ marginBottom: "20px", color: "#666" }}>
                    The page you are looking for doesn’t exist.
                  </p>
                  <Link
                    to="/"
                    style={{ color: "#007bff", textDecoration: "none", fontWeight: "600" }}
                  >
                    ⬅ Go back to Home
                  </Link>
                </div>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;