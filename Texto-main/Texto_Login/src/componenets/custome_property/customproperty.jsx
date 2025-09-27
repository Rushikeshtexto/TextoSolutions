// Customproperty.jsx
import React, { useState, useEffect } from "react";
import styles from "./customproperty.module.css";
import SideBar from "../sidebar/SideBar";
import Header from "../header/Header";
import Footer from "../footer/Footer";
import { useNavigate, useParams } from "react-router-dom";
import Dropdown from "../rushikashhome/dropdown";
import Pagination from "../rushikashhome/pagination";
import DisplayRange from "../rushikashhome/displayrange";
import Button from "@mui/material/Button";
import EditIcon from "@mui/icons-material/Edit";
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
  FormControl,
} from "@mui/material";

const Customproperty = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const token = localStorage.getItem("token");

  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);

  // Add Property Dialog
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [type, setType] = useState("");

  // Edit Property Dialog
  const [openedit, setOpenedit] = useState(false);
  const [editvalue, setEditvalue] = useState("");
  const [editId, setEditId] = useState(null);

  // Delete Confirmation
  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedName, setSelectedName] = useState("");

  const protectedFields = [
    "First Name",
    "Last Name",
    "Email",
    "Phone",
    "City",
    "State",
    "Country",
  ];

  // Fetch items from backend
  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/custom/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setItems(data || []);
      setTotalItems(data.length);
      setTotalPages(Math.ceil(data.length / entriesPerPage));
      setLoading(false);
    } catch (err) {
      console.error("Fetch error:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const indexOfLast = currentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;

  const filtereditems = items.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentEntries = filtereditems.slice(indexOfFirst, indexOfLast);

  // Add Property
  const handlesubmit = async () => {
    if (items.find((item) => item.name === value)) {
      alert("Item with this name already exists!");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/custom/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: value, type: type }),
      });
      if (response.ok) {
        fetchItems();
      } else {
        console.error("Error:", response.statusText);
      }
    } catch (error) {
      console.error("Error:", error);
    }
    setValue("");
    setType("");
    setOpen(false);
  };

  // Edit Property
  const handleEditOpen = (item) => {
    setEditId(item.id);
    setEditvalue(item.name);
    setOpenedit(true);
  };

  const handleupdate = async () => {
    if (!editId) return;

    try {
      const response = await fetch(`http://localhost:5000/custom/${editId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: editvalue }),
      });
      if (response.ok) {
        fetchItems();
      } else {
        console.error("Error:", response.statusText);
      }
    } catch (error) {
      console.error("Error:", error);
    }
    setEditvalue("");
    setEditId(null);
    setOpenedit(false);
  };

  // Delete Property
  const handleDeleteClick = (id, name) => {
    setSelectedId(id);
    setSelectedName(name);
    setOpenConfirm(true);
  };

  const confirmDelete = async () => {
    if (selectedId) {
      try {
        await fetch(`http://localhost:5000/custom/softdelete/${selectedId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        fetchItems();
      } catch (error) {
        console.error("Error deleting item:", error);
      }
    }
    setOpenConfirm(false);
    setSelectedId(null);
    setSelectedName("");
  };

  const handleItemsPerPageChange = (e) => {
    const newValue = parseInt(e.target.value);
    setEntriesPerPage(newValue);
    setCurrentPage(1);
  };

  return (
    <>
      <Header />
      <div className={styles.app_layout}>
        <div className={styles.sidebar}>
          <SideBar />
        </div>
        <div className={styles.content}>
          <h2>PROPERTY</h2>
          <hr />
          <div className={styles.custom_property_section}>
            <div className="profilescontent">
              <div className={styles.profiles_section}>
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
                    Add Property
                  </button>
                </div>

                {/* Add Dialog */}
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
                        <MenuItem value="date">DATE</MenuItem>
                      </Select>
                    </FormControl>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handlesubmit} variant="contained">
                      Save
                    </Button>
                  </DialogActions>
                </Dialog>

                {/* Table */}
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
                            <th>Property type</th>
                            <th>Created</th>
                            <th>Updated</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentEntries
                            .slice()
                            .sort((a, b) => {
                              const aIndex = protectedFields.indexOf(a.name);
                              const bIndex = protectedFields.indexOf(b.name);
                              if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
                              if (aIndex !== -1) return -1;
                              if (bIndex !== -1) return 1;
                              return 0;
                            })
                            .map((u, index) => {
                              const isProtected = protectedFields.includes(u.name);
                              return (
                                <tr
                                  key={u.id}
                                  className={index % 2 === 0 ? styles.even_row : styles.odd_row}
                                >
                                  <td>{u.name}</td>
                                  <td>{u.type}</td>
                                  <td>{u.property_type}</td>
                                  <td className={styles.td_left}>
                                    {u.created_at ? new Date(u.created_at).toLocaleString() : ""}
                                  </td>
                                  <td className={styles.td_left}>
                                    {u.updated_at ? new Date(u.updated_at).toLocaleString() : ""}
                                  </td>
                                  <td className={styles.action}>
                                    {!isProtected && (
                                      <>
                                        <EditIcon
                                          color="action"
                                          style={{ cursor: "pointer", marginRight: 8 }}
                                          onClick={() => handleEditOpen(u)}
                                        />
                                        <DeleteIcon
                                          color="error"
                                          style={{ cursor: "pointer" }}
                                          onClick={() => handleDeleteClick(u.id, u.name)}
                                        />
                                      </>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>

                    {/* Edit Dialog */}
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
                        <Button onClick={handleupdate} variant="contained">
                          Update
                        </Button>
                      </DialogActions>
                    </Dialog>

                    {/* Delete Confirmation */}
                    <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
                      <DialogTitle>Confirm Delete</DialogTitle>
                      <DialogContent>
                        Are you sure you want to delete{" "}
                        <strong>{selectedName || "this item"}</strong>?
                      </DialogContent>
                      <DialogActions>
                        <Button onClick={() => setOpenConfirm(false)}>NO</Button>
                        <Button onClick={confirmDelete} color="error" variant="contained">
                          YES
                        </Button>
                      </DialogActions>
                    </Dialog>

                    {/* Pagination */}
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

import React, { useState, useEffect } from 'react';
import styles from "./customproperty.module.css";
import SideBar from '../sidebar/SideBar';
import Header from '../header/Header';
import Footer from '../footer/Footer';
import { useNavigate, useParams } from 'react-router-dom';
import Dropdown from '../rushikashhome/dropdown';      
import Pagination from '../rushikashhome/pagination';   
import DisplayRange from '../rushikashhome/displayrange';     
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


export default function Customproperty() {
  const navigate = useNavigate();
  const { id } = useParams();

  // ✅ States
  const [selectedUser, setSelectedUser] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
 const [openedit, setOpenedit] = useState(false);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [newName, setNewName] = useState("");
  const [newDatatype, setNewDatatype] = useState("");
  const [newValue, setNewValue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
   const [editvalue, setEditvalue] = useState("");
const [value, setValue] = useState("");
  const token = localStorage.getItem("token");
  const [type, setType] = useState("");
const [selectedName, setSelectedName] = useState("");
 const [totalItems, setTotalItems] = useState(0); 

  // ✅ Fetch items from backend
  const handleItemsPerPageChange = (e) => {
      const newValue = parseInt(e.target.value);
      setEntriesPerPage(newValue);
      setCurrentPage(1);
    };
    const limit = 100;
  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/custom/`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
      });
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

  // ✅ Filtered items for search
  const filteredItems = items.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.type?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const confirmDelete = () => {
  if (selectedId) {
    deleteItem(selectedId); // call your delete function
  }
  setOpenConfirm(false);
  setSelectedId(null);
  setSelectedName("");
};
  // ✅ Add new item
  const handleAddSubmit = async () => {
    if (items.find((item) => item.name.toLowerCase() === newName.toLowerCase())) {
      alert("Duplicate property name not allowed");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/custom/", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newName, type: newDatatype, value: newValue }),
      });
      if (response.ok) {
        await fetchItems();
      } else {
        console.error("Error:", response.statusText);
      }
    } catch (error) {
      console.error("Error:", error);
    }

    setNewName("");
    setNewDatatype("");
    setNewValue("");
    setOpen(false);
  };

  // ✅ Edit existing item
  const handleEditSubmit = async () => {
    if (items.find((item) => item.name.toLowerCase() === newName.toLowerCase() && item.id !== editId)) {
      alert("Duplicate property name not allowed");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/custom/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newName, type: newDatatype, value: newValue }),
      });
      if (response.ok) {
        await fetchItems();
      } else {
        console.error("Error:", response.statusText);
      }
    } catch (error) {
      console.error("Error:", error);
    }

    setEditId(null);
    setNewName("");
    setNewDatatype("");
    setNewValue("");
    setOpen(false);
  };

  // ✅ Delete item
  const handleDelete = async () => {
    try {
      await fetch(`http://localhost:5000/custom/softdelete/${selectedId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
      });
      await fetchItems();
    } catch (error) {
      console.error("Error deleting item:", error);
    }
    setSelectedId(null);
    setOpenConfirm(false);
  };

  // ✅ Pagination
  const indexOfLast = currentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const currentEntries = filteredItems.slice(indexOfFirst, indexOfLast);

  return (
     <>
    
    <Header/>
 <div className={styles.app_layout}>  
     <div className={styles.sidebar}>
     < SideBar/></div>
     <div className={styles.content}>
     <h2>PROPERTY</h2>
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
                                 Add Property
                               </button>
                 
                               {/* <button className={`${styles.btn} ${styles.add_segment}`}>
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
            <MenuItem value="boolean">BOOLEAN</MenuItem>
            <MenuItem value="date">DATE</MenuItem>
            {/* <MenuItem value="date">DATE</MenuItem> ✅ Added }
          </Select>
        </FormControl>

        {/* {type === "date" && (
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Pick a date"
              value={dateValue}
              onChange={(newValue) => setDateValue(newValue)}
              slotProps={{ textField: { margin: "dense", fullWidth: true } }}
            />
          </LocalizationProvider>
        )} }
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpen(false)}>Cancel</Button>
        <Button
          onClick={() => {
            handlesubmit();
          }}
          variant="contained"
        >
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
                          <th>Property type</th>
                          <th>Created</th>
                          <th>Updated</th>
                          <th>Action</th>
                          
                        </tr>
                      </thead>
                     <tbody>
  {currentEntries
    .slice()
    .sort((a, b) => {
      const protectedFields = [
        "First Name",
        "Last Name",
        "Email",
        "Phone",
        "City",
        "State",
        "Country"
      ];

      const aIndex = protectedFields.indexOf(a.name);
      const bIndex = protectedFields.indexOf(b.name);

      const aProtected = aIndex !== -1;
      const bProtected = bIndex !== -1;

      // If both are protected → compare by index in protectedFields
      if (aProtected && bProtected) {
        return aIndex - bIndex;
      }

      // If only one is protected → put protected first
      if (aProtected) return -1;
      if (bProtected) return 1;

      // If neither is protected → keep original order (or alphabetize if you want)
      return 0;
    })
    .map((u, index) => {
      const protectedFields = [
        "First Name",
        "Last Name",
        "Email",
        "Phone",
        "City",
        "State",
        "Country"
      ];
      const isProtected = protectedFields.includes(u.name);

      return (
        <tr
          key={u.id}
          className={index % 2 === 0 ? styles.even_row : styles.odd_row}
        >
          <td>{u.name}</td>
          <td>{u.type}</td>
          <td>{u.property_type}</td>
          <td className={styles.td_left}>
            {new Date(u.created_at).toLocaleString()}
          </td>
          <td className={styles.td_left}>
            {new Date(u.updated_at).toLocaleString()}
          </td>

          <td className={styles.action}>
            {!isProtected ? (
              <>
                <td style={{ border: "none", padding: "8px" }}>
                  <EditIcon
                    color="action"
                    style={{ cursor: "pointer" }}
                    onClick={() => setOpenedit(true)}
                  />
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
                    <Button
                      onClick={() => {
                        handleupdate(u.id);
                      }}
                      variant="contained"
                    >
                      Update
                    </Button>
                  </DialogActions>
                </Dialog>

                <td
                  style={{
                    border: "none",
                    padding: "8px",
                    marginLeft: "10px"
                  }}
                >
                  <DeleteIcon
                    color="error"
                    style={{ cursor: "pointer" }}
                    onClick={() => handleClick(u.id, u.name)}
                  />
                </td>
              </>
            ):<><td style={{border:"none"}}></td></>}
          </td>
        </tr>
      );
    })}
</tbody>

                    </table>
                  </div>
                  <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
  <DialogTitle>Confirm Delete</DialogTitle>
  <DialogContent>
    Are you sure you want to delete{" "}
    <strong>{selectedName || "this item"}</strong>?
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setOpenConfirm(false)}>NO</Button>
    <Button onClick={confirmDelete} color="error" variant="contained">
      YES
    </Button>
  </DialogActions>
</Dialog>
                 
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
     
     
     </div>
     </div>
    <Footer/>
    </>
    
  );
}

*/
