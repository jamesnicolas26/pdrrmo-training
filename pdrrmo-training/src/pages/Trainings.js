import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { ChevronUp, ChevronDown } from "lucide-react";
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

  const cleanButtonStyle = {
    backgroundColor: "#4CAF50",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "12px",
    padding: "5px 10px",
    whiteSpace: "nowrap",
    display: "inline-block",
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

  const [trainings, setTrainings] = useState([]);
  const [userRole, setUserRole] = useState(user?.role || "");
  const [filters, setFilters] = useState({
    search: "",
    type: "",
    year: "",
    office: "",
    author: "",
  });
  const [sortConfig, setSortConfig] = useState({ sortBy: null, order: "asc" });
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [totalPages, setTotalPages] = useState(1);

  const fetchTrainings = async (page = 1) => {
    try {
      const query = new URLSearchParams({
        page,
        limit: itemsPerPage,
        search: filters.search,
        type: filters.type,
        year: filters.year,
        office: filters.office,
        author: filters.author,
        sortBy: sortConfig.sortBy || "",
        order: sortConfig.order,
      });

      const response = await fetch(`${API_BASE_URL}/trainings?${query.toString()}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (!response.ok) throw new Error("Failed to fetch trainings");
      const data = await response.json();
      setTrainings(data.trainings);
      setTotalPages(data.totalPages);
      setCurrentPage(data.currentPage);
    } catch (error) {
      console.error("Error fetching trainings:", error.message);
    }
  };

  useEffect(() => {
    fetchTrainings(currentPage);
  }, [currentPage]);

  useEffect(() => {
  if (user?.role === "Member") {
    setFilters((prev) => ({
      ...prev,
      author: `${user.lastname}, ${user.firstname}`,
      }));
    }
  }, [user]);


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

  const handleSort = (key) => {
    const order = sortConfig.sortBy === key && sortConfig.order === "asc" ? "desc" : "asc";
    setSortConfig({ sortBy: key, order });
    fetchTrainings(currentPage);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = () => {
    setCurrentPage(1);
    fetchTrainings(1);
  };

  const exportToExcel = () => {
    const data = trainings.map((training) => ({
      Name: training.author,
      Office: training.office || "",
      "Title of Training Attended": training.title,
      "Start Date": formatDate(training.startDate),
      "End Date": formatDate(training.endDate),
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

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getSortIcon = (key) => {
    if (sortConfig.sortBy !== key) return null;
    return sortConfig.order === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />;
  };

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "20px" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
    <h1 style={{ margin: 0 }}>Trainings</h1>

    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <button onClick={() => navigate("/addtraining")} style={cleanButtonStyle}>
        Add Training
      </button>

      <button onClick={exportToExcel} style={cleanButtonStyle}>
        Export
      </button>

      <button onClick={() => setShowMediaLibrary(true)} style={cleanButtonStyle}>
        Show Media Library
      </button>

    </div>
      </div>
      <div style={{ marginBottom: "20px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <input
              type="text"
              name="search"
              placeholder="Search by title..."
              value={filters.search}
              onChange={handleInputChange}
            />

            <select name="type" value={filters.type} onChange={handleInputChange}>
              <option value="">All Types</option>
              <option value="Technical">Technical</option>
              <option value="Supervisory">Supervisory</option>
              <option value="Managerial">Managerial</option>
            </select>

            <input
              type="number"
              name="year"
              placeholder="Year"
              min="1900"
              max="2099"
              value={filters.year}
              onChange={handleInputChange}
            />

        {(userRole === "Admin" || userRole === "superadmin") && (
          <>
            <input
              type="text"
              name="office"
              placeholder="Filter by office..."
              value={filters.office}
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="author"
              placeholder="Filter by author..."
              value={filters.author}
              onChange={handleInputChange}
            />
          </>
        )}
            <button onClick={handleApplyFilters} style={cleanButtonStyle}>
              Apply Filters
            </button>
      </div>
      {trainings.length > 0 ? (
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
            {trainings.map((training, index) => (
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
                <td style={{ ...thTdStyle, textAlign: "center" }}>{training.hours}</td>
                <td style={thTdStyle}>{training.type}</td>
                <td style={thTdStyle}>{training.sponsor}</td>
                <td style={thTdStyle}>
                  {training.certificate ? (
                    <img
                      loading="lazy"
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

      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: "20px", gap: "8px" }}>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              style={{
                padding: "6px 12px",
                backgroundColor: currentPage === i + 1 ? "#4CAF50" : "#fff",
                color: currentPage === i + 1 ? "#fff" : "#000",
                border: "1px solid #ccc",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>
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

export default Trainings;
