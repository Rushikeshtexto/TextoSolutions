import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Pagination from "./pagination"; 
import Dropdown from "./dropdown";
import DisplayRange from "./displayrange";
import styles from "./allprofile.module.css";
import SideBar from "../sidebar/SideBar";
import Header from "../header/Header";
import Footer from "../footer/Footer";
import UserDetails from "./UserDetails";
import ExpandableCell from "./ExpandableCell"

const Profile = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch users from backend
  const fetchUsers = async (page, limit) => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/data?page=${page}&limit=${limit}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUsers(data.data || []);
      setTotalPages(data.lastPage || 1);
      setTotalItems(data.totalRows || 0);
      setLoading(false);
    } catch (err) {
      console.error("Fetch error:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(currentPage, entriesPerPage);
  }, [currentPage, entriesPerPage]);

  // Filter users
  const filteredUsers = users.filter(
    (u) =>
      u.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

  // Utilities
  const safeValue = (val) => (val ? (typeof val === "object" ? JSON.stringify(val) : String(val)) : "");
  const maskEmail = (email) => (email ? "*****@" + email.split("@")[1] : "");
  const maskPhone = (phone) => (phone ? "*".repeat(phone.length - 3) + phone.slice(-3) : "");

 

  const handleUserClick = (id) => navigate(`/profiles/${id}`);
  const handleItemsPerPageChange = (e) => {
    setEntriesPerPage(parseInt(e.target.value));
    setCurrentPage(1);
  };

  return (
    <>
      <Header />
      <div className={styles.app_layout}>
        <div className={styles.sidebar}><SideBar /></div>
        <main className={styles.content}>
          <h2>PROFILES</h2>
          <hr className={styles.hr} />
          <div className={styles.profiles_section}>
            {selectedUser ? (
              <UserDetails user={selectedUser} onBack={() => setSelectedUser(null)} formatDate={formatDate} />
            ) : (
              <>
                <input
                  type="text"
                  placeholder="🔍 Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={styles.search_box}
                />

                {loading ? (
                  <p>Loading...</p>
                ) : filteredUsers.length === 0 ? (
                  <p className="no-entries">⚠️ No entries found.</p>
                ) : (
                  <>
                    <div className={styles.table_container}>
                      <table className={styles.profiles_table}>
                        <thead>
                          <tr>
                            <th>First Name</th>
                            <th>Last Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Address 1</th>
                            <th>Address 2</th>
                            <th>City</th>
                            <th>State</th>
                            <th>Country</th>
                            <th>Created Date </th>
                            <th>updated Date </th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredUsers.map((u, idx) => (
                            <tr key={u.id} className={idx % 2 === 0 ? styles.even_row : styles.odd_row}>
                              <td>
                                <span
                                  className={styles.color}
                                  style={{ cursor: "pointer" }}
                                  onClick={() => handleUserClick(u.id)}
                                >
                                  {u.first_name}
                                </span>
                              </td>

                              {[
        u.last_name,
        maskEmail(safeValue(u.email)),
        maskPhone(u.phone),
        u.address_1,
        u.address_2,
        u.city,
        u.state,
        u.country,
       formatDate(u.created_at) ,
        formatDate(u.updated_at),
      ].map((val, idx) => (
        <ExpandableCell key={idx} value={val} />
      ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className={styles.paginationcontainer}>
                      <Dropdown entriesPerPage={entriesPerPage} onItemsPerPageChange={handleItemsPerPageChange} />
                      <DisplayRange currentPage={currentPage} entriesPerPage={entriesPerPage} totalItems={totalItems} />
                      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
};

export default Profile;


/*import React ,{useState,useEffect} from "react";
import {Link, useNavigate} from "react-router-dom";
import Pagination from "./pagination"; 
import styles from  "./allprofile.module.css"
import FrontendPage from "./frontpage";
import SideBar from "../sidebar/SideBar";
import Header from "../header/Header";
import Footer from "../footer/Footer";////////
import Dropdown from "./dropdown";
import DisplayRange from "./displayrange";

import UserDetails from "./UserDetails"; 
import CryptoJS from "crypto-js";
const Profile=()=>{
   const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const indexOfLast = currentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const [selectedUser, setSelectedUser] = useState(null);
  const [TotalItems,setTotalItems]=useState(0);

  const filteredUsers = users.filter(
    (u) =>
      u.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  console.log("User ",users)
  const totalPages = Math.ceil(filteredUsers.length / entriesPerPage);
  const currentEntries = filteredUsers.slice(indexOfFirst, indexOfLast);

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};


  const safeValue = (val) => {
    if (!val) return "";
    if (typeof val === "object")
      return val.text || val.result || JSON.stringify(val);
    return String(val);
  };

  // Mask email (hide everything before @)
const maskEmail = (email) => {
  if (!email) return "";
  const [, domain] = email.split("@");
  return "*****@" + domain;
};

const maskPhone = (phone) => {
  if (!phone) return "";
  if (phone.length <= 3) return phone; // if number is too short, just return it
  return "*".repeat(phone.length - 3) + phone.slice(-3);
};



  // ✅ Dropdown change handler
  const handleItemsPerPageChange = (e) => {
    const newValue = parseInt(e.target.value);
    setEntriesPerPage(newValue);
    setCurrentPage(1);
  };
  const limit = 100; // must match backend

  const fetchUsers = async (page) => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/data?page=${page}&limit=${limit}`);
      const data = await res.json();
      setUsers(data);
      setLoading(false);
      setTotalItems(data.total)
    } catch (err) {
      console.error("Fetch error:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(page);
  }, [page]);
  
const handleUserClick = (id) => {
  // Just use the UUID directly
  navigate(`/profiles/${id}`);
};

return(
  <>
  <Header/>
  <div className={styles.app_layout}>
    
   <div className={styles.sidebar}>
   
    <SideBar/>
   </div>  
   
   <div className={styles.content}>
            <div className={styles.profiles_section}>
            {selectedUser ? (
        <UserDetails
          user={selectedUser}
          onBack={() => setSelectedUser(null)}
          formatDate={formatDate}
        />
      ):(<>

      
              <h2>Profiles</h2>
              <input
                type="text"
                placeholder="🔍 Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.search_box}
              />

              {currentEntries.length === 0 ? (
                <p className="no-entries">⚠️ No entries found.</p>
              ) : (
                <>
                  <div className={styles.table_container}>
                    <table className={styles.profiles_table}>
                      <thead>
                        <tr>
                          <th>First Name </th>
                          <th>Last Name </th>
                          <th>Email</th>
                          <th>Phone</th>
                          <th>Address 1</th>
                          <th>Address 2</th>
                          <th>City</th>
                          <th>State</th>
                          <th>Country</th>
                          <th>Created at </th>
                           <th>Updated at </th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentEntries.map((u, index) => (
                          <tr
                            key={u.id}
                            className={index % 2 === 0 ? styles.even_row : styles.odd_row}
                          >
                           
                          <td>
                                <span
                                  className={styles.color}
                                  style={{ cursor: "pointer" }}
                                  onClick={() => handleUserClick(u.id)}
                                >
                                  {u.first_name}
                                </span>
                              </td>
                              <td>{u.last_name}</td>
                            <td>{maskEmail(safeValue(u.email))}</td>
                            <td>{maskPhone(u.phone)}</td>
                            
                           <td>{u.address_1}</td>
                           <td>{u.address_2}</td>
                           <td>{u.city}</td>
                           <td>{u.state}</td>
                           <td>{u.country}</td>
                           <td>{formatDate(u.created_at)}</td>
                           <td>{formatDate(u.updated_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                 
                 <div className={styles.paginationcontainer}>
                 <Dropdown
              entriesPerPage={entriesPerPage}
              onItemsPerPageChange={handleItemsPerPageChange}
            />


                  <DisplayRange
                        currentPage={currentPage}
                        entriesPerPage={entriesPerPage}
                        totalItems={filteredUsers.length}
                      />

                 {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}

</div>
</>
              )}
                </>
              )}
            </div>
            </div>
            </div>
            <Footer/>
            </>
          


);




};
export default Profile;

*/