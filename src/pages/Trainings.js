import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import * as XLSX from "xlsx";
import { ChevronUp, ChevronDown } from "lucide-react";
import PropTypes from "prop-types";
import { useAuth } from "../Auth/AuthContext";
import MediaLibrary from "../components/MediaLibrary";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

const Trainings = ({ trainings, deleteTraining }) => {
  const { user } = useAuth(); // Access the user from AuthContext
  const [userRole, setUserRole] = useState(user?.role || ""); // Default to user role from context
  const [filterType, setFilterType] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [selectedCertificate, setSelectedCertificate] = useState(null);

  // Admin-specific filters
  const [filterOffice, setFilterOffice] = useState("");
  const [filterAuthor, setFilterAuthor] = useState("");

  const [showMediaLibrary, setShowMediaLibrary] = useState(false);

  // Collect all certificate image URLs (filter out null/undefined)
  const certificateImages = Array.from(
    new Set(
      trainings
        .map(t => t.certificate)
        .filter(Boolean)
    )
  );

  const imgStyle = {
    width: "120px",
    height: "120px",
    objectFit: "fill",
    borderRadius: "5px",
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
    cursor: "pointer",
  };

  const containerStyle = {
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
  };

  const headerStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "20px",
    marginTop: "40px",
  };

  const buttonStyle = {
    padding: "10px 15px",
    textDecoration: "none",
    marginRight: "10px",
    backgroundColor: "#4CAF50",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    transition: "background-color 0.3s",
  };

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
    marginBottom: "20px",
    fontSize: "16px",
  };

  const thTdStyle = {
    border: "1px solid #ddd",
    padding: "15px",
    fontSize: "15px",
    textAlign: "center",
  };

  const rowHoverStyle = {
    transition: "background-color 0.3s",
    cursor: "pointer",
  };

  const handleImageError = (e) => {
    e.target.src = "path/to/default-image.jpg"; // Replace this with the actual path to the default image.
  };

  const exportToExcel = () => {
    const data = filteredTrainings.map((training) => ({
      Title: training.title,
      Type: training.type,
      "Start Date": training.startDate,
      "End Date": training.endDate,
      Hours: training.hours,
      Sponsor: training.sponsor,
      Author: `${training.author}${training.office ? ` (${training.office})` : ""}`,
      Certificate: training.certificate ? "Yes" : "No",
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);

    const columnWidths = Object.keys(data[0] || {}).map((key) => {
      const maxLength = Math.max(
        key.length,
        ...data.map((row) => (row[key] ? row[key].toString().length : 0))
      );
      return { wch: maxLength + 2 };
    });

    worksheet["!cols"] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Trainings");

    const timestamp = new Date().toISOString().replace(/[-:T]/g, "_").split(".")[0];
    XLSX.writeFile(workbook, `trainings_${timestamp}.xlsx`);
  };

  const handleFilterChange = (e) => setFilterType(e.target.value);
  const handleSearchChange = (e) => setSearchQuery(e.target.value);
  const handleYearChange = (e) => setFilterYear(e.target.value);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedTrainings = [...trainings].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const valueA = a[sortConfig.key];
    const valueB = b[sortConfig.key];
    if (valueA < valueB) return sortConfig.direction === "asc" ? -1 : 1;
    if (valueA > valueB) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const filteredTrainings = sortedTrainings.filter((training) => {
    // Check if the user is the author of the training
    const isAuthor = training.author === user.firstname + " " + user.lastname;
  
    // Admins see all trainings; non-admins see only their own
    const canView =
      userRole === "Admin" || userRole === "superadmin" ||isAuthor;
  
    // Apply filters for type, year, office, and author
    const matchesFilter =
      (filterType === "" || training.type.toLowerCase() === filterType.toLowerCase()) &&
      (filterYear === "" || (training.startDate && training.startDate.includes(filterYear))) &&
      (userRole === "Admin" || userRole === "superadmin"
        ? (filterOffice === "" || (training.office && training.office.toLowerCase().includes(filterOffice.toLowerCase()))) &&
          (filterAuthor === "" || training.author.toLowerCase().includes(filterAuthor.toLowerCase()))
        : true); // Non-admins cannot filter by office or author
  
    // Apply search query
    const matchesSearch =
      searchQuery === "" || training.title.toLowerCase().includes(searchQuery.toLowerCase());
  
    return canView && matchesFilter && matchesSearch;
  });
  
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />;
  };

  useEffect(() => {
    if (!userRole) {
      console.warn("User role is missing in context. Fetching from backend...");
      // Fetch the user role if it is not present in the context
      (async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
          const response = await fetch(`${API_BASE_URL}/user/profile`, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!response.ok) throw new Error("Failed to fetch user role.");

          const data = await response.json();
          setUserRole(data.role);
        } catch (error) {
          console.error("Error fetching user role:", error.message);
        }
      })();
    }
  }, [userRole]);

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1>Trainings</h1>
        <div>
          <Link to="/addtraining" style={buttonStyle}>
            Add Training
          </Link>

          <button style={buttonStyle} onClick={exportToExcel}>
            Export to Excel
          </button>
          <button
            style={buttonStyle}
            onClick={() => setShowMediaLibrary(true)}
          >
            Media Library
          </button>
        </div>
      </div>
      <div style={{ marginBottom: "20px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Search by title..."
          value={searchQuery}
          onChange={handleSearchChange}
          style={{ padding: "10px", flexGrow: 1, borderRadius: "5px", border: "1px solid #ddd" }}
        />
        <select
          value={filterType}
          onChange={handleFilterChange}
          style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ddd" }}
        >
          <option value="">All Types</option>
          <option value="Supervisory">Supervisory</option>
          <option value="Managerial">Managerial</option>
          <option value="Technical">Technical</option>
        </select>
        {userRole === "Admin" || userRole === "superadmin" && (
          <>
            <input
              type="text"
              placeholder="Filter by office..."
              value={filterOffice}
              onChange={(e) => setFilterOffice(e.target.value)}
              style={{ padding: "10px", flexGrow: 1, borderRadius: "5px", border: "1px solid #ddd" }}
            />
            <input
              type="text"
              placeholder="Filter by author..."
              value={filterAuthor}
              onChange={(e) => setFilterAuthor(e.target.value)}
              style={{ padding: "10px", flexGrow: 1, borderRadius: "5px", border: "1px solid #ddd" }}
            />
          </>
        )}
        <input
          type="text"
          placeholder="Filter by year..."
          value={filterYear}
          onChange={handleYearChange}
          style={{ padding: "10px", flexGrow: 1, borderRadius: "5px", border: "1px solid #ddd" }}
        />
      </div>
      {filteredTrainings.length > 0 ? (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thTdStyle} onClick={() => handleSort("title")}>
                Title {getSortIcon("title")}
              </th>
              <th style={thTdStyle} onClick={() => handleSort("type")}>
                Type {getSortIcon("type")}
              </th>
              <th style={thTdStyle} onClick={() => handleSort("startDate")}>
                Start Date {getSortIcon("startDate")}
              </th>
              <th style={thTdStyle} onClick={() => handleSort("endDate")}>
                End Date {getSortIcon("endDate")}
              </th>
              <th style={thTdStyle} onClick={() => handleSort("hours")}>
                Hours {getSortIcon("hours")}
              </th>
              <th style={thTdStyle} onClick={() => handleSort("sponsor")}>
                Sponsor {getSortIcon("sponsor")}
              </th>
              <th style={thTdStyle} onClick={() => handleSort("author")}>
                Author {getSortIcon("author")}
              </th>
              <th style={thTdStyle}>Certificate</th>
              <th style={thTdStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTrainings.map((training, index) => (
              <tr
                key={index}
                style={rowHoverStyle}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#f9f9f9")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <td style={thTdStyle}>{training.title}</td>
                <td style={thTdStyle}>{training.type}</td>
                <td style={thTdStyle}>{training.startDate}</td>
                <td style={thTdStyle}>{training.endDate}</td>
                <td style={thTdStyle}>{training.hours}</td>
                <td style={thTdStyle}>{training.sponsor}</td>
                <td style={thTdStyle}>
                  {training.author}
                  {training.office ? ` (${training.office})` : ""}
                </td>
                <td style={thTdStyle}>
                  {training.certificate ? (
                    <img
                      src={training.certificate}
                      alt="Certificate"
                      style={imgStyle}
                      onError={handleImageError}
                      onClick={() => setSelectedCertificate(training.certificate)}
                    />
                  ) : (
                    "No image"
                  )}
                  
                  {showMediaLibrary && (
                    <MediaLibrary
                      certificates={certificateImages}
                      onSelect={src => {
                        setSelectedCertificate(src);
                        setShowMediaLibrary(false);
                      }}
                      onClose={() => setShowMediaLibrary(false)}
                    />
                  )}
                </td>
                <td style={thTdStyle}>
                    <button
                      onClick={() =>
                        window.confirm("Are you sure you want to delete this training?") &&
                        deleteTraining(index)
                      }
                      style={{
                        padding: "5px 10px",
                        backgroundColor: "#FF4D4D",
                        color: "#fff",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No trainings found. Try adjusting the filters or search term.</p>
      )}
      {selectedCertificate && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setSelectedCertificate(null)}
        >
          <img
            src={selectedCertificate}
            alt="Certificate"
            style={{
              maxWidth: "90%",
              maxHeight: "90%",
              border: "3px solid white",
              borderRadius: "10px",
              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.5)",
            }}
          />
        </div>
      )}
    </div>
  );
};

Trainings.propTypes = {
  trainings: PropTypes.array.isRequired,
  deleteTraining: PropTypes.func.isRequired,
};

export default Trainings;
