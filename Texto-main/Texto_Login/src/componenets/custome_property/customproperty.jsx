import React, { useState, useEffect } from "react";
import styles from "./customproperty.module.css";
import SideBar from '../sidebar/SideBar';
import Header from '../header/Header';
import Footer from '../footer/Footer';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '@mui/material/Button';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl
} from "@mui/material";

const Customproperty = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [items, setItems] = useState([]);
  const [value, setValue] = useState("");
  const [type, setType] = useState("");
  const [editValue, setEditValue] = useState("");
  const [open, setOpen] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedEditId, setSelectedEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch custom properties
  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/custom/");
      const data = await res.json();
      setItems(data || []);
      setLoading(false);
    } catch (err) {
      console.error("Fetch error:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Add new property
  const handleAddSubmit = async () => {
    // Frontend duplicate check
    if (items.find(item => item.name.toLowerCase() === value.toLowerCase())) {
      alert("Item with this name already exists!");
      return;
    }

    if (!value.trim() || !type.trim()) {
      alert("Please fill all fields");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/custom/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: value, type: type }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to add property");
        return;
      }

      fetchItems(); // Refresh list
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong");
    }

    setValue("");
    setType("");
    setOpen(false);
  };

  // Edit property
  const handleEditSubmit = async () => {
    if (!editValue.trim()) {
      alert("Name cannot be empty");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/custom/${selectedEditId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editValue }),
      });

      const data = await response.json();
      if (!response.ok) {
        alert(data.message || "Failed to update property");
        return;
      }

      fetchItems();
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong");
    }

    setEditValue("");
    setSelectedEditId(null);
    setOpenEdit(false);
  };

  // Delete property
  const handleDelete = async (id) => {
    try {
      await fetch(`http://localhost:5000/custom/softdelete/${id}`, { method: "POST" });
      fetchItems();
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Something went wrong");
    }
  };

  // Filtered items based on search
  const filteredItems = items.filter(
    u =>
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
  <Header />
  <div className={styles.app_layout}>
    <div className={styles.sidebar}><SideBar /></div>
    <div className={styles.content}>
      <h2>PROPERTY</h2>
      <hr />
      <div className={styles.custom_property_section}>
        <div className="profilescontent">
          <div className={styles.profiles_section}>

            {/* Search and Add Item */}
            <input
              type="text"
              placeholder="🔍 Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.search_box}
            />
            <div className={styles.segments_buttons}>
              <button
                onClick={() => setOpen(true)}
                className={`${styles.btn} ${styles.add_segment}`}
              >
                Add Item
              </button>
            </div>

            {/* Add Property Dialog */}
            <Dialog open={open} onClose={() => setOpen(false)}>
              <DialogTitle>Add Property</DialogTitle>
              <DialogContent>
                <TextField
                  autoFocus
                  margin="dense"
                  label="Enter Name"
                  fullWidth
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                />
                <FormControl fullWidth margin="dense">
                  <InputLabel id="type-label">Type</InputLabel>
                  <Select
                    labelId="type-label"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                  >
                    <MenuItem value="string">STRING</MenuItem>
                    <MenuItem value="integer">INTEGER</MenuItem>
                    <MenuItem value="boolean">BOOLEAN</MenuItem>
                  </Select>
                </FormControl>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={handleAddSubmit} variant="contained">Save</Button>
              </DialogActions>
            </Dialog>

            {/* Table */}
            {filteredItems.length === 0 ? (
              <p className={styles.no_entries}>⚠️ No entries found.</p>
            ) : (
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
                    {filteredItems.map((u, index) => (
                      <tr key={u.id} className={index % 2 === 0 ? styles.even_row : styles.odd_row}>
                        <td>{u.name}</td>
                        <td>{u.type}</td>
                        <td className={styles.td_left}>{new Date(u.created_at).toLocaleString()}</td>
                        <td className={styles.td_left}>{new Date(u.updated_at).toLocaleString()}</td>
                        <td className={styles.action}>
                          <EditIcon
                            color="action"
                            style={{ cursor: "pointer", marginRight: "10px" }}
                            onClick={() => { setSelectedEditId(u.id); setEditValue(u.name); setOpenEdit(true); }}
                          />
                          <DeleteIcon
                            color="error"
                            style={{ cursor: "pointer" }}
                            onClick={() => handleDelete(u.id)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Edit Property Dialog */}
            <Dialog open={openEdit} onClose={() => setOpenEdit(false)}>
              <DialogTitle>Edit Property Name</DialogTitle>
              <DialogContent>
                <TextField
                  autoFocus
                  margin="dense"
                  label="Enter Name"
                  fullWidth
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpenEdit(false)}>Cancel</Button>
                <Button onClick={handleEditSubmit} variant="contained">Update</Button>
              </DialogActions>
            </Dialog>

          </div>
        </div>
      </div>
    </div>
  </div>
  <Footer />
</>

  );
};

export default Customproperty;





/*


import React ,{useState,useEffect}from 'react'
import styles from "./customproperty.module.css"
import SideBar from '../sidebar/SideBar'
import Header from '../header/Header'
import Footer from '../footer/Footer'
import { useNavigate,useParams } from 'react-router-dom';
//import Dropdown from '../rushikashhome/dropdown';
//import Pagination from '../rushikashhome/pagination';
//import DisplayRange from '../rushikashhome/Display'
import Button from '@mui/material/Button';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from "@mui/icons-material/Delete";
import { Delete, Edit } from 'lucide-react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,

  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl
} from "@mui/material";
const Customproperty = () => {

    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [list, setList] = useState(null);
    const { id } = useParams();
    const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
const [type, setType] = useState("");

 


  const handleSave = () => {
    alert("You entered: " + value);
    setOpen(false);
  };
   
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
    const [openedit, setOpenedit] = useState(false);
    const [editvalue, setEditvalue] = useState("");
    const handleBack = () => {
      navigate(-1); // 👈 Goes back to the last visited page
    };

    const handlesubmit = async (e) => {
       if(items.find((item) => item.name === value)) {
    alert("Item with this name already exists!");
    return; 
  }
      // e.preventDefault();
      try { 
        const response = await fetch("http://localhost:5000/custom/", { 
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: value, type: type }),
        }); 
        if (response.ok) {
          const data = await response.json();
          console.log("Success:", data);
          fetchItems(); // Refresh the list after adding a new item
        } else {              

          console.error("Error:", response.statusText);
        }
      } catch (error) {
        console.error("Error:", error);
      }
      setValue("");
      setType("");
      setOpen(false);

    } 


    const handleupdate = async (id) => {
      // e.preventDefault();
      try {
        console.log("id  " ,id)
        const response = await fetch(`http://localhost:5000/custom/${id}`, {  
          method: "PUT",
          headers: { "Content-Type": "application/json" },  
          body: JSON.stringify({ name: editvalue }),
        });
        if (response.ok) {
          const data = await response.json();
          console.log("Success:", data);
          fetchItems(); // Refresh the list after adding a new item
        }

        else {
          console.error("Error:", response.statusText);
        }
      } catch (error) {
        console.error("Error:", error);
      }
      setEditvalue("");
      setOpenedit(false);
    }

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
     
    },[]);
    

  return (
    <>
    
    <Header/>
 <div className={styles.app_layout}>  
     <div className={styles.sidebar}>
     < SideBar/></div>
     <div className={styles.content}>
     <h2> PROPERTY</h2>
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
                                onClick={() => setOpen(true)}
                                 className={`${styles.btn} ${styles.add_segment}`}
                               >
                                 Add Item
                               </button>
                 
                               { <button className={`${styles.btn} ${styles.add_segment}`}>
                                 Add Segment
                               </button> }
                             </div>
                             <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Add Property</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Enter Name"
            fullWidth
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel id="type-label">Type</InputLabel>
            <Select
              labelId="type-label"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <MenuItem value="string">STRING</MenuItem>
              <MenuItem value="integer">INTEGER</MenuItem>
              <MenuItem value="boolean">BOOLEN</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={() => {handlesubmit()}} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>



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
        <EditIcon color="action" style={{ cursor: "pointer" }} onClick={() => {setOpenedit(true)}}/>
      </td> 
      <Dialog open={openedit} onClose={() => setOpenedit(false)}>
        <DialogTitle>Edit Property Name</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Enter Name"
            fullWidth
            value={editvalue}
            onChange={(e) => setEditvalue(e.target.value)}
          />
         
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenedit(false)}>Cancel</Button>
          <Button onClick={() => {handleupdate(u.id)}} variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>

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

</div> }
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

export default Customproperty;
*/