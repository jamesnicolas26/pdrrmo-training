import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Main from "./pages/Main";
import Trainings from "./pages/Trainings";
import Users from "./pages/Users";
import Login from "./components/Login";
import Register from "./components/Register";
import AddTraining from "./components/AddTraining";
import EditUser from "./components/EditUser";
import Logout from "./components/Logout";
import PrivateRoute from "./Auth/PrivateRoute";
import { useAuth } from "./Auth/AuthContext";
import RoleProtectedRoute from "./Auth/RoleProtectedRoute";
import PropTypes from "prop-types";

Trainings.propTypes = {
  trainings: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      startDate: PropTypes.string.isRequired,
      endDate: PropTypes.string.isRequired,
      hours: PropTypes.number,
      sponsor: PropTypes.string,
      author: PropTypes.string,
      certificate: PropTypes.string,
    })
  ).isRequired,
  deleteTraining: PropTypes.func.isRequired,
  userRole: PropTypes.string,
};

export default function App() {
  const { clearAndRegenerateToken, currentUser } = useAuth();

  const [users, setUsers] = useState(() => {
    try {
      const savedUsers = localStorage.getItem("users");
      return savedUsers ? JSON.parse(savedUsers) : [];
    } catch (error) {
      console.error("Error reading users from localStorage:", error);
      return [];
    }
  });

  const [trainings, setTrainings] = useState(() => {
    try {
      const savedTrainings = localStorage.getItem("trainings");
      return savedTrainings ? JSON.parse(savedTrainings) : [];
    } catch (error) {
      console.error("Error reading trainings from localStorage:", error);
      return [];
    }
  });

  useEffect(() => {
    const refreshToken = async () => {
      try {
        await clearAndRegenerateToken();
      } catch (error) {
        console.error("Error refreshing token:", error);
      }
    };
    refreshToken();
  }, [clearAndRegenerateToken]);

  useEffect(() => {
    try {
      localStorage.setItem("users", JSON.stringify(users));
    } catch (error) {
      console.error("Error saving users to localStorage:", error);
    }
  }, [users]);

  useEffect(() => {
    try {
      localStorage.setItem("trainings", JSON.stringify(trainings));
    } catch (error) {
      console.error("Error saving trainings to localStorage:", error);
    }
  }, [trainings]);

  const addUser = (user) => setUsers((prev) => [...prev, user]);
  const deleteUser = (index) => setUsers((prev) => prev.filter((_, i) => i !== index));
  const updateUser = (index, updatedUser) => {
    setUsers((prev) => {
      const updatedUsers = [...prev];
      updatedUsers[index] = updatedUser;
      return updatedUsers;
    });
  };

  const addTraining = (training) => setTrainings((prev) => [...prev, training]);
  const deleteTraining = (index) => setTrainings((prev) => prev.filter((_, i) => i !== index));

  return (
    <Routes>
      <Route path="/signin" element={<Login />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Main />
          </PrivateRoute>
        }
      />
      <Route
        path="/trainings"
        element={
          <PrivateRoute>
            <Trainings
              trainings={trainings}
              deleteTraining={deleteTraining}
              userRole={currentUser?.role}
            />
          </PrivateRoute>
        }
      />
      <Route
        path="/addtraining"
        element={
          <PrivateRoute>
            <AddTraining addTraining={addTraining} />
          </PrivateRoute>
        }
      />
      <Route
        path="/users"
        element={
          <RoleProtectedRoute requiredRole={["Admin", "superadmin"]}>
            <Users users={users} deleteUser={deleteUser} />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/edituser/:id"
        element={
          <PrivateRoute requiredRole={["Admin", "superadmin"]}>
            <EditUser users={users} updateUser={updateUser} />
          </PrivateRoute>
        }
      />
      <Route
        path="/signout"
        element={
          <PrivateRoute>
            <Logout />
          </PrivateRoute>
        }
      />
      <Route path="/signup" element={<Register addUser={addUser} />} />
      <Route path="*" element={<div>404 - Page Not Found</div>} />
    </Routes>
  );
}
