import React, { useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, AuthContext } from "./Auth/AuthContext";
import Layout from "./Layout";
import Login from "./Auth/Login";
import Register from "./Auth/Register";

// Profesor komponente
import Dashboard from "./pages/Dashboard";
import Students from "./pages/StudentPage";
import Subjects from "./pages/SubjectsPage";
import Exams from "./pages/ExamsPage";
import ExamRegistrationsPage from "./pages/ExamRegistrationsPage";

// Student komponenta
import StudentExamRegistrationPage from "./pages/StudentExamRegistrationPage";

// Protected Route Component
const ProtectedRoute = ({ children, allowedRole }) => {
  const { token, userRole, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Učitavanje...</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && userRole !== allowedRole) {
    return (
      <Navigate
        to={userRole === "professor" ? "/dashboard" : "/student/dashboard"}
        replace
      />
    );
  }

  return <Layout>{children}</Layout>;
};

const AppRoutes = () => {
  const { token, userRole } = useContext(AuthContext);

  return (
    <Routes>
      {/* Javne rute */}
      <Route
        path="/login"
        element={
          token ? (
            <Navigate
              to={
                userRole === "professor" ? "/dashboard" : "/student/dashboard"
              }
              replace
            />
          ) : (
            <Login />
          )
        }
      />
      <Route
        path="/register"
        element={
          token ? (
            <Navigate
              to={
                userRole === "professor" ? "/dashboard" : "/student/dashboard"
              }
              replace
            />
          ) : (
            <Register />
          )
        }
      />

      {/* Profesor rute */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRole="professor">
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/students"
        element={
          <ProtectedRoute allowedRole="professor">
            <Students />
          </ProtectedRoute>
        }
      />
      <Route
        path="/subjects"
        element={
          <ProtectedRoute allowedRole="professor">
            <Subjects />
          </ProtectedRoute>
        }
      />
      <Route
        path="/exams"
        element={
          <ProtectedRoute allowedRole="professor">
            <Exams />
          </ProtectedRoute>
        }
      />
      <Route
        path="/registrations"
        element={
          <ProtectedRoute allowedRole="professor">
            <ExamRegistrationsPage />
          </ProtectedRoute>
        }
      />

      {/* Student ruta - samo jedna! */}
      <Route
        path="/student/dashboard"
        element={
          <ProtectedRoute allowedRole="student">
            <StudentExamRegistrationPage />
          </ProtectedRoute>
        }
      />

      {/* Default redirect */}
      <Route
        path="/"
        element={
          token ? (
            <Navigate
              to={
                userRole === "professor" ? "/dashboard" : "/student/dashboard"
              }
              replace
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* 404 */}
      <Route
        path="*"
        element={
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <div className="text-center bg-white p-12 rounded-2xl shadow-2xl max-w-md">
              <div className="mb-6">
                <svg
                  className="w-24 h-24 mx-auto text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
              <p className="text-xl text-gray-600 mb-2">
                Stranica nije pronađena
              </p>
              <p className="text-sm text-gray-500 mb-8">
                Izgleda da ste zalutali u nepoznati deo sajta
              </p>
              <a
                href={
                  token
                    ? userRole === "professor"
                      ? "/dashboard"
                      : "/student/dashboard"
                    : "/login"
                }
                className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-lg hover:shadow-xl"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                {token ? "Vrati se na početnu" : "Idi na login"}
              </a>
            </div>
          </div>
        }
      />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
