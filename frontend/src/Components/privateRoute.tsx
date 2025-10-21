import { Navigate } from "react-router-dom";
import React from "react";

interface PrivateRouteProps {
    isAuthenticated: boolean;
    children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ isAuthenticated, children }) => {
    return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

export default PrivateRoute;