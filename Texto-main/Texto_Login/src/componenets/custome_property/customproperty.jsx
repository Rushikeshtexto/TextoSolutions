import React ,{useState,useEffect}from 'react'
import styles from "./customproperty.module.css"
import SideBar from '../sidebar/SideBar'
import Header from '../header/Header'
import Footer from '../footer/Footer'
import { useNavigate,useParams } from 'react-router-dom';
//import Dropdown from '../rushikashhome/dropdown';
//import Pagination from "../rushikashhome/displayrange";
//import DisplayRange from '../rushikashhome/Display'

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from "@mui/icons-material/Delete";
//import { Delete, Edit } from 'lucide-react';
//import Button from '@mui/material/Button';

const Customproperty = () => {

    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [list, setList] = useState(null);
    const { id } = useParams();
   
    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [items, setItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const indexOfLast = currentPage * entriesPerPage;
    const indexOfFirst = indexOfLast - entriesPerPage;
    const [selectedUser, setSelectedUser] = useState(null);
    const [totalPages, setTotalPages] = useState(0); // ✅ make it state
    const [totalItems, setTotalItems] = useState(0); // ✅ make it state


    const handleBack = () => {
      navigate(-1); // 👈 Goes back to the last visited page
    };

      const deleteItem = async (id) => {
        try {
          const response = await fetch(`http://localhost:5000/custom/softdelete/${id}`, {  
            method: "POST",
          }); 
        } catch (error) {
          console.error("Error deleting item:", error);
        }
        fetchItems(); // Refresh the list after deletion
      }  
    const filtereditems = items.filter(
      (u) =>
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.type?.toLowerCase().includes(searchTerm.toLowerCase()) 
          );
    console.log("User ",items)
    const currentEntries = filtereditems
  
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
  
    const fetchItems = async () => {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:5000/custom/`,
          {method: 'GET', headers: { 'Content-Type': 'application/json' }}
        );
        const data = await res.json();
       
        setItems(data || []);          // ✅ update items
      
        console.log("Totalpages /",totalPages);
        setLoading(false);
      } catch (err) {
        console.error("Fetch error:", err);
        setLoading(false);
      }
    };
  
    useEffect(() => {
      fetchItems();
     
    });
    

  return (
    <>
    
    <Header/>
 <div className={styles.app_layout}>  
     <div className={styles.sidebar}>
     < SideBar/></div>
     <div className={styles.content}>
     <h2>Custom Property</h2>
     <hr></hr>
        <div className={styles.custom_property_section}>


        <div className="profilescontent">

            <div className={styles.profiles_section}>

              
            {selectedUser ? (
       <></>
      ):(<>
    
                
              <input
                type="text"
                placeholder="🔍 Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.search_box}
              />
               <div className={styles.segments_buttons}>
                               <button
                                //  onClick={() => {
                                //    navigate("/addlist");
                                //  }}
                                 className={`${styles.btn} ${styles.add_segment}`}
                               >
                                 Add Item
                               </button>
                 
                               {/* <button className={`${styles.btn} ${styles.add_segment}`}>
                                 Add Segment
                               </button> */}
                             </div>

              {currentEntries.length === 0 ? (
                <p className="no-entries">⚠️ No entries found.</p>
              ) : (
                <>
                  <div className={styles.table_container}>
                    <table className={styles.profiles_table}>
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Type</th>
                          <th>Created</th>
                          <th>Updated</th>
                          <th>Action</th>
                          
                        </tr>
                      </thead>
                      <tbody>
                        {currentEntries.map((u, index) => (
                          <tr
                            key={u.id}
                            className={index % 2 === 0 ? styles.even_row : styles.odd_row}
                          >
                            <td>  
                            {u.name}
                          </td>
                          <td>{u.type}</td>
                           
                            <td className={styles.td_left}>{new Date(u.created_at).toLocaleString()}</td>
                            <td className={styles.td_left}>{new Date(u.updated_at).toLocaleString()}</td>
                            <td className={styles.action}  ><td style={{ border: "none", padding: "8px" }}>
        <EditIcon color="action" style={{ cursor: "pointer" }} />
      </td>
      <td style={{ border: "none", padding: "8px" ,marginLeft:"10px"}}>
        <DeleteIcon
          color="error"
          style={{ cursor: "pointer" }}
          onClick={() => deleteItem(u.id)}
        />
      </td></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                 
                 {/* <div className={styles.paginationcontainer}>
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

</div> */}
</>
              )}
                </>
              )}
            </div>
          

            
        </div>

        </div>
     
     
     </div>
     </div>
    <Footer/>
    </>
    
  )
}

export default Customproperty