import React,{useState,useEffect} from 'react'
import { useNavigate,useParams } from 'react-router-dom';
import styles from './ViewList.module.css'
import Header from '../header/Header';
import SideBar from '../sidebar/SideBar';
import Dropdown from '../rushikashhome/dropdown';
import Pagination from '../rushikashhome/pagination';
import Footer from '../footer/Footer';
import axios from "axios";
import LoadingOverlay from '../loading/LoadingOverlay';
import FileSaver from "file-saver";
import DisplayRange from '../rushikashhome/displayrange';
import { Button } from '@mui/material';
import { Download } from 'lucide-react';
const ViewList = () => {
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [list, setList] = useState(null);
    const { id } = useParams();
   
    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const indexOfLast = currentPage * entriesPerPage;
    const indexOfFirst = indexOfLast - entriesPerPage;
    const [selectedUser, setSelectedUser] = useState(null);
    const [totalPages, setTotalPages] = useState(0); // ✅ make it state
    const [totalItems, setTotalItems] = useState(0); // ✅ make it state

   const downloadExcel = async () => {
  try {
    setLoading(true);
    const response = await axios.get(
      `http://localhost:5000/export/users/${id}`,
      { responseType: "blob" }
    );

    const blob = new Blob([response.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    FileSaver.saveAs(blob, "users.xlsx");
  } catch (err) {
    console.error("Export failed:", err);
  } finally {
    setLoading(false);
  }
};


    const handleBack = () => {
      navigate(-1); // 👈 Goes back to the last visited page
    };


    const filteredUsers = users.filter(
      (u) =>
        u.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.phone?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    console.log("User ",users)
    const currentEntries = filteredUsers
  
    const formatDate = (dateString) => {
      if (!dateString) return "";
      return new Date(dateString).toISOString().split("T")[0];
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
  
   const fetchUsers = async () => {
  try {
    setLoading(true);
    const res = await fetch(
      `http://localhost:5000/profiles/${id}?page=${currentPage}&limit=${entriesPerPage}`
    );
    const data = await res.json();

    // ✅ Works with both plain array and paginated response
    setUsers(data.data || data || []);
    setTotalPages(data.lastPage || 0);
    setTotalItems(data.totalRows || (Array.isArray(data) ? data.length : 0));

    setLoading(false);
  } catch (err) {
    console.error("Fetch error:", err);
    setLoading(false);
  }
};

  
    useEffect(() => {
      fetchUsers();
     
    },[currentPage,entriesPerPage]);
    


// 
  useEffect(() => {
    if (!id) return;

   
    setError("");

    fetch(`http://localhost:5000/lists/${id}`,
       { method:"POST"}
    )
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch file");
        return res.json();
      })
      .then((data) => {
        
        setList(data);
      })
      .catch((err) => {
        console.error(err);
        setError("User not found or invalid ID");
        setList(null);
      });
  });
//   console.log("Data  ",list[0]);

  return (<>
  <Header/>
    <div className={styles.app_layout}>
    <div className={styles.sidebar}>
     < SideBar/>
     </div>
   
     {loading && <LoadingOverlay/>}
    
    <div className={`${styles.content} `}>
        <div className="top" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <h3>{list? list[0].name:""}</h3>  <h6 className={styles.badge}>list</h6>
        
       


        <button onClick={() => {handleBack()} }  className={styles.back}>
       Back
    </button>
        </div>
        
        <hr/>
            
        <div>
        {list ? (
    // If list is an array
    Array.isArray(list) ? (
      list.map((item) => (
        <div >
          <p><strong>Created At:</strong> {new Date(item.created_at).toLocaleString()}</p>
          <p ><strong>Updated At:</strong> {new Date(item.updated_at).toLocaleString()}</p>

        </div>
      ))
    ) : (
      // If list is a single object
      <div style={{ border: "1px solid #ccc", padding: "10px", margin: "10px 0" }}>
        <p><strong>Created At:</strong> {new Date(list.created_at).toLocaleString()}</p>
        {/* <p><strong>Updated At:</strong> {new Date(list.updated_at).toLocaleString()}</p> */}
      </div>
    )
  ) : (
    "No data"
  )}
        </div>


       

             <div className={styles.profiles_section}>
            {selectedUser ? (
       <></>
      ):(<>

            <hr></hr>
              <h4>PROFILES</h4>
              <button className={styles.export} onClick={() => {downloadExcel()}}>Export</button>
             
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
                          <th>First Name</th>
                          <th>Last Name</th>
                          <th>Email</th>
                          <th>Phone</th>
                          <th>Address 1</th>
                          <th>Address 2</th>
                          <th>City</th>
                          <th>State</th>
                          <th>Country</th>
                          
                        </tr>
                      </thead>
                      <tbody>
                        {currentEntries.map((u, index) => (
                          <tr
                            key={u.id}
                            className={index % 2 === 0 ? styles.even_row : styles.odd_row}
                          >
                            <td>  
                            {u.first_name}
                          </td>
                          <td>{u.last_name}</td>
                            <td>{maskEmail(safeValue(u.email))}</td>
                            <td>{maskPhone(u.phone)}</td>
                            <td>{u.address_1}</td>
                            <td>{u.address_2}</td>
                            <td>{u.city}</td>
                            <td>{u.state}</td>
                            <td>{u.country}</td>
                           
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
                        totalItems={totalItems}
                      />
                 <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />

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

    
  )
}

export default ViewList