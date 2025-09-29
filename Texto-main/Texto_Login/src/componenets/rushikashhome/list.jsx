import React, { useState, useEffect } from "react";
import styles from "./list.module.css";
import NestedDialogExample from "../Dialog";
import axios from "axios";
import { useNavigate,Link } from "react-router-dom";
import FrontendPage from "./frontpage";
import SideBar from "../sidebar/SideBar";
import Header from "../header/Header";
import Footer from "../footer/Footer";
import { Button } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import Pagination from "../rushikashhome/pagination";
import Dropdown from "../rushikashhome/dropdown";
import DisplayRange from "./displayrange";

const List = () => {
  const [file, setFile] = useState(null);
  const [filesData, setFilesData] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); 
  const [currentPage, setCurrentPage] = useState(1); // ✅ page state
  const [entriesPerPage, setEntriesPerPage] = useState(10);
 
  
  const navigate = useNavigate();

  const fetchFiles = async () => {
    try {
      const res = await axios.get("http://localhost:5000/files");
      setFilesData(res.data);
    } catch (err) {
      console.error("Error fetching files:", err);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  // ✅ Filter logic
  const filteredFiles = filesData.filter(
    (f) =>
      f.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.profiles?.toString().toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ✅ Pagination logic
  const indexOfLast = currentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const currentFiles = filteredFiles.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredFiles.length / entriesPerPage);

  const handleFileChange = (e) => setFile(e.target.files[0]);

    // ✅ Dropdown change handler
  const handleItemsPerPageChange = (e) => {
    const newValue = parseInt(e.target.value,10);
    setEntriesPerPage(newValue);
    setCurrentPage(1);
  };

  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    await axios.post("http://localhost:5000/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    setFile(null);
    fetchFiles();
  };

  const handledelete = async (id) => {
    try {
      const res = await axios.post(`http://localhost:5000/files/${id}`, {
        headers: { "Content-Type": "application/json" },
      });
      console.log("Deleted successfully:", res.data);
      fetchFiles(); // ✅ refresh list after delete
    } catch (err) {
      console.error("Error deleting file:", err);
    }
  };

  return (
    <>
      <Header />
      <div className={styles.app_layout}>
        <div className={styles.sidebar}>
          <SideBar />
        </div>

        <div className={styles.content}>
          <div className={styles.segments_section}>
            <h2>LIST & SEGMENTS</h2>
  <hr />
         <div className={styles.segments_header}>
           
            <div className={styles.segments_buttons}>
              <button
                onClick={() => navigate("/addlist")}
                className={`${styles.btn} ${styles.add_segment}`}
              >
                Add List
              </button>

              <button 
              onClick={()=> navigate("/addsegment")}
              className={`${styles.btn} ${styles.add_segment}`}>
                Add Segment
              </button>
            </div>
            <input
              type="text"
              placeholder="🔍 Search segments..."
              className={styles.segments_search}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

           
            </div>

            {/* ✅ Table with paginated data */}
             <div className={styles.table_container}>
            <table className={styles.custom_table}>
              <thead>
                <tr>
                  <th >Name</th>
                  <th>Type</th>
                  <th>Profiles</th>
                  <th>Created</th>
                  <th>Updated</th>
                  <th>Delete</th>
                </tr>
              </thead>
              <tbody>
                {currentFiles.map((f) => (
                  <tr key={f.id}>
                    <td>
                 
                      
                    <Link to={`/viewlist/${f.id}`} style={{ textDecoration: "none", color: "blue" }} >
        {f.name}
      </Link>  </td>
                    <td>{f.type}</td>
                    <td>{f.profiles}</td>
                    <td className={styles.td_left}>
                      {new Date(f.created_at).toLocaleString()}
                    </td>
                    <td className={styles.td_left}>
                      {new Date(f.updated_at).toLocaleString()}
                    </td>
                    <td>
                      <Button
                        
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => handledelete(f.id)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
<div  className={styles.paginationcontainer}>
         <Dropdown
              entriesPerPage={entriesPerPage}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
                   <DisplayRange
                        currentPage={currentPage}
                        entriesPerPage={entriesPerPage}
                        totalItems={filteredFiles.length}
                      />



         
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default List;
