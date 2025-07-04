import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { ChevronUp, ChevronDown } from "lucide-react";
import PropTypes from "prop-types";
import { useAuth } from "../Auth/AuthContext";
import MediaLibrary from "../components/MediaLibrary";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://api.pdrrmo.bulacan.gov.ph";

const Trainings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  marginBottom: "20px",
};

const thTdStyle = {
  border: "1px solid #ddd",
  padding: "8px",
  textAlign: "left",
  cursor: "pointer",
};

const rowHoverStyle = {
  backgroundColor: "#f9f9f9",
  transition: "background-color 0.2s",
};

const handleSearchChange = (e) => {
  setSearchQuery(e.target.value);
};

const handleFilterChange = (e) => {
  setFilterType(e.target.value);
};

const handleYearChange = (e) => {
  setFilterYear(e.target.value);
};


  const [trainings, setTrainings] = useState([]);
  const [userRole, setUserRole] = useState(user?.role || "");
  const [filterType, setFilterType] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [filterOffice, setFilterOffice] = useState("");
  const [filterAuthor, setFilterAuthor] = useState("");
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);

  useEffect(() => {
    const fetchTrainings = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/trainings`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (!response.ok) throw new Error("Failed to fetch trainings");
        const data = await response.json();
        setTrainings(data);
      } catch (error) {
        console.error("Error fetching trainings:", error.message);
      }
    };

    fetchTrainings();
  }, []);

  const deleteTraining = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/trainings/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (!response.ok) throw new Error("Failed to delete training");

      setTrainings(trainings.filter((training) => training._id !== id));
      alert("Training deleted successfully!");
    } catch (error) {
      console.error("Error deleting training:", error.message);
      alert("Failed to delete training. Please try again.");
    }
  };

  const exportToExcel = () => {
    const data = filteredTrainings.map((training) => ({
      Name: training.author,
      Office: training.office || "",
      "Title of Training Attended": training.title,
      "Start Date": training.startDate,
      "End Date": training.endDate,
      "Number of Hours": training.hours,
      "Type of Training": training.type,
      "Sponsored/Conducted By": training.sponsor,
      Certificate: training.certificate ? "Yes" : "No",
    }));


    const worksheet = XLSX.utils.json_to_sheet(data);
    const columnWidths = Object.keys(data[0] || {}).map((key) => ({
      wch: Math.max(
        key.length,
        ...data.map((row) => (row[key] ? row[key].toString().length : 0))
      ) + 2,
    }));

    worksheet["!cols"] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Trainings");

    const timestamp = new Date().toISOString().replace(/[-:T]/g, "_").split(".")[0];
    XLSX.writeFile(workbook, `trainings_${timestamp}.xlsx`);
  };

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
    const isAuthor = training.author === `${user.lastname}, ${user.firstname}`;
    const canView = userRole === "Admin" || userRole === "superadmin" || isAuthor;
    const matchesFilter =
      (!filterType || training.type.toLowerCase() === filterType.toLowerCase()) &&
      (!filterYear || (training.startDate && training.startDate.includes(filterYear))) &&
      (userRole === "Admin" || userRole === "superadmin"
        ? (!filterOffice || (training.office || "").toLowerCase().includes(filterOffice.toLowerCase())) &&
          (!filterAuthor || (training.author || "").toLowerCase().includes(filterAuthor.toLowerCase()))
        : true);
    const matchesSearch = !searchQuery || training.title.toLowerCase().includes(searchQuery.toLowerCase());
    return canView && matchesFilter && matchesSearch;
  });

  const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />;
  };

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
        <h1>Trainings</h1>
    <div style={{ display: "flex", justifyContent: "flex-end", gap: "15px", marginBottom: "20px" }}>
    <button
      onClick={() => navigate("/addtraining")}
      style={{
        backgroundColor: "#4CAF50",
        color: "#fff",
        border: "none",
        borderRadius: "2px",
        cursor: "pointer",
        fontWeight: "bold",
        fontSize: "12px",
        padding: "2px 4px",
        display: "inline-block",
      }}
    >
      Add Training
    </button>

    <button
      onClick={exportToExcel}
      style={{
        backgroundColor: "#4CAF50",
        color: "#fff",
        border: "none",
        borderRadius: "2px",
        cursor: "pointer",
        fontWeight: "bold",
        fontSize: "12px",
        padding: "2px 4px",
        display: "inline-block",
      }}
    >
      Export
    </button>

    <button
      onClick={() => setShowMediaLibrary(true)}
      style={{
        backgroundColor: "#4CAF50",
        color: "#fff",
        border: "none",
        borderRadius: "2px",
        cursor: "pointer",
        fontWeight: "bold",
        fontSize: "12px",
        padding: "2px 4px",
        display: "inline-block",
      }}
    >
     Show Media Library
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
              <th style={thTdStyle} onClick={() => handleSort("author")}>
              Name {getSortIcon("author")}</th>
              <th style={thTdStyle} onClick={() => handleSort("office")}>
              Office {getSortIcon("office")}</th>
              <th style={thTdStyle} onClick={() => handleSort("title")}>
              Title of Training Attended {getSortIcon("title")}</th>
              <th style={thTdStyle} onClick={() => handleSort("startDate")}>
              Start Date {getSortIcon("startDate")}</th>
              <th style={thTdStyle} onClick={() => handleSort("endDate")}>
              End Date {getSortIcon("endDate")}</th>
              <th style={thTdStyle} onClick={() => handleSort("hours")}>
              Number of Hours {getSortIcon("hours")}</th>
              <th style={thTdStyle} onClick={() => handleSort("type")}>
              Type of Training {getSortIcon("type")}</th>
              <th style={thTdStyle} onClick={() => handleSort("sponsor")}>
              Sponsored/Conducted By {getSortIcon("sponsor")}</th>
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
                <td style={thTdStyle}>{training.author}</td>
                <td style={thTdStyle}>{training.office || ""}</td>
                <td style={thTdStyle}>{training.title}</td>
                <td style={thTdStyle}>{formatDate(training.startDate)}</td>
                <td style={thTdStyle}>{formatDate(training.endDate)}</td>
                <td style={thTdStyle}>{training.hours}</td>
                <td style={thTdStyle}>{training.type}</td>
                <td style={thTdStyle}>{training.sponsor}</td>
                <td style={thTdStyle}>
                  {training.certificate ? (
                    <img
                      src={training.certificate}
                      alt="Certificate"
                      style={{ width: "100px", height: "auto", borderRadius: "5px", cursor: "pointer" }}
                      onClick={() => {
                        setSelectedCertificate(training.certificate);
                      }}
                    />
                  ) : (
                    "No certificate"
                  )}
                </td>
                <td style={thTdStyle}>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => navigate(`/edittraining/${training._id}`)}
                    style={{
                      padding: "5px 10px",
                      backgroundColor: "#4CAF50",
                      color: "#fff",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer",
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() =>
                      window.confirm("Are you sure you want to delete this training?") &&
                      deleteTraining(training._id)
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
                </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No trainings found. Try adjusting the filters or search term.</p>
      )}

      {showMediaLibrary && (
        <MediaLibrary
          certificates={trainings.filter(t => t.certificate).map(t => t.certificate)}
          onSelect={(src) => {
            setSelectedCertificate(src);
            setShowMediaLibrary(false);
          }}
          onClose={() => setShowMediaLibrary(false)}
        />
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
  trainings: PropTypes.array,
};

export default Trainings;
