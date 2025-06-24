import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
  
        if (!token) {
          alert("Authentication error. Please log in again.");
          window.location.href = "/signin";
          return;
        }
  
        const response = await fetch(`${API_BASE_URL}/users`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
  
        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            alert("Unauthorized access. Please log in again.");
            localStorage.removeItem("token");
            window.location.href = "/signin";
            return;
          }
          throw new Error(`Error ${response.status}: Unable to fetch users.`);
        }
  
        const data = await response.json();
  
        const formattedUsers = data.map((user) => ({
          _id: user._id,
          title: user.title || "",
          lastname: user.lastname || "",
          firstname: user.firstname || "",
          middlename: user.middlename || "",
          office: user.office || "",
          username: user.username || "",
          isApproved: user.isApproved || false,
          role: user.role || "User",
        }));
  
        setUsers(formattedUsers);
        setFilteredUsers((prevFiltered) => {
          if (!searchQuery) return formattedUsers;
          const query = searchQuery.toLowerCase();
          return formattedUsers.filter(
            (user) =>
              user.firstname.toLowerCase().includes(query) ||
              user.lastname.toLowerCase().includes(query)
          );
        });
      } catch (err) {
        console.error(err.message);
        setError("Failed to load users. Please try again later.");
      }
    };
  
    fetchUsers(); // Fetch immediately
  
    const interval = setInterval(fetchUsers, 500); // Fetch every 0.5 seconds
  
    return () => clearInterval(interval); // Clean up on component unmount
  }, [searchQuery]); // Re-fetch if search query changes  

  // Approve user
  const approveUser = async (id) => {
    try {
      console.log("Approving user with ID:", id); // Debugging log
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/users/approve/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: Unable to approve user.`);
      }

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === id ? { ...user, isApproved: true } : user
        )
      );
      alert("User approved successfully.");
    } catch (err) {
      console.error("Approve User Error:", err.message);
      alert("Failed to approve user. Please try again later.");
    }
  };

  // Delete user
  const deleteUser = async (id) => {
    try {
      console.log("Deleting user with ID:", id); // Debugging log
      const token = localStorage.getItem("token");
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this user?"
      );
      if (!confirmDelete) return;

      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: Unable to delete user.`);
      }

      setUsers((prevUsers) => prevUsers.filter((user) => user._id !== id));
      setFilteredUsers((prevFiltered) =>
        prevFiltered.filter((user) => user._id !== id)
      );
      alert("User deleted successfully.");
    } catch (err) {
      console.error("Delete User Error:", err.message);
      alert("Failed to delete user. Please try again later.");
    }
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    const query = e.target.value.toLowerCase();
    setFilteredUsers(
      users.filter(
        (user) =>
          user.firstname.toLowerCase().includes(query) ||
          user.lastname.toLowerCase().includes(query)
      )
    );
  };

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div style={{ padding: "20px" }}>
    <br />
    <br />
      <h1>Users</h1>
      {error && <p>{error}</p>}
      <input
        type="text"
        placeholder="Search by name"
        value={searchQuery}
        onChange={handleSearch}
        style={{
          marginBottom: "20px",
          padding: "10px",
          width: "100%",
          maxWidth: "400px",
        }}
      />
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#f2f2f2" }}>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Title</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>
              Lastname
            </th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>
              Firstname
            </th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>
              Office
            </th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Role</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Status</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {currentUsers.map((user) => (
            <tr key={user._id}>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                {user.title}
              </td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                {user.lastname}
              </td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                {user.firstname}
              </td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                {user.office}
              </td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                {user.role}
              </td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                {user.isApproved ? "Approved" : "Pending Approval"}
              </td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
              {user.role !== "superadmin" && (
                <>
                  {!user.isApproved && (
                    <button
                      onClick={() => approveUser(user._id)}
                      style={{ marginRight: "10px" }}
                    >
                      Approve
                    </button>
                  )}
                  <button
                    onClick={() => deleteUser(user._id)}
                    style={{ marginRight: "10px" }}
                  >
                    Delete
                  </button>
                  <Link to={`/edituser/${user._id}`}>
                    <button>Edit</button>
                  </Link>
                </>
              )}
            </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: "20px", textAlign: "center" }}>
        {Array.from(
          { length: Math.ceil(filteredUsers.length / usersPerPage) },
          (_, index) => (
            <button
              key={index + 1}
              onClick={() => paginate(index + 1)}
              style={{
                padding: "10px",
                margin: "0 5px",
                backgroundColor: currentPage === index + 1 ? "#007bff" : "#ddd",
                color: currentPage === index + 1 ? "#fff" : "#000",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              {index + 1}
            </button>
          )
        )}
      </div>
    </div>
  );
};

export default Users;
