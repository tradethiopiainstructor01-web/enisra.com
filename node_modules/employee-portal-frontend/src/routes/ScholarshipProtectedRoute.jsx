import { Navigate } from "react-router-dom";

const ScholarshipProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("scholarshipToken");

  if (!token) {
    return <Navigate to="/scholarship-login" replace />;
  }

  return children;
};

export default ScholarshipProtectedRoute;
