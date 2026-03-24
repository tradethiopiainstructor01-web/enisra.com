import { Navigate, useLocation } from "react-router-dom";

const ScholarshipProtectedRoute = ({ children }) => {
  const location = useLocation();
  const token = localStorage.getItem("scholarshipToken");
  const redirectTo = `${location.pathname}${location.search}${location.hash}`;

  if (!token) {
    return (
      <Navigate
        to={`/scholarship-login?redirect=${encodeURIComponent(redirectTo)}`}
        replace
        state={{ redirectTo }}
      />
    );
  }

  return children;
};

export default ScholarshipProtectedRoute;
