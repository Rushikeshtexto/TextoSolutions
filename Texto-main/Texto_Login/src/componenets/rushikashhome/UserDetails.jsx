

import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./UserDetails.module.css";

import Header from "../header/Header";
import Footer from "../footer/Footer";
import SideBar from "../sidebar/SideBar";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const popupRef = useRef(null);
  const suggestionListRef = useRef(null);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showPopup, setShowPopup] = useState(false);
  const [property, setProperty] = useState({ id: null, name: "", value: "", datatype: "" });
  const [properties, setProperties] = useState([]);

  const [allCustomNames, setAllCustomNames] = useState([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [selectedFromDropdown, setSelectedFromDropdown] = useState(false);

  const [popupError, setPopupError] = useState("");

  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState(null);
  const [selectedName, setSelectedName] = useState("");

  // Fetch user
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError("");

    fetch(`http://localhost:5000/excelusers/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch user");
        return res.json();
      })
      .then((data) => {
        setUser(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("User not found or invalid ID");
        setLoading(false);
      });
  }, [id]);

  // Fetch user properties
  const fetchProperties = async () => {
    try {
      const res = await fetch(`http://localhost:5000/property/users/${id}/properties`);
      const data = await res.json();
      setProperties(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (id) fetchProperties();
  }, [id]);

  // Fetch all custom property names
  const fetchCustomNames = async () => {
    try {
      const res = await fetch("http://localhost:5000/custom/");
      const data = await res.json();
      setAllCustomNames(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCustomNames();
  }, [id]);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickInsidePopup = (event) => {
      if (popupRef.current && !suggestionListRef.current?.contains(event.target) && showPopup) {
        setFilteredSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handleClickInsidePopup);
    return () => document.removeEventListener("mousedown", handleClickInsidePopup);
  }, [showPopup]);

  // Mask helpers
  const maskEmail = (email) => {
    if (!email) return "";
    const [, domain] = email.split("@");
    return "*****@" + domain;
  };
  const maskPhone = (phone) => {
    if (!phone) return "";
    if (phone.length <= 3) return phone;
    return "*".repeat(phone.length - 3) + phone.slice(-3);
  };

  // Input & suggestions
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (selectedFromDropdown && (name === "name" || name === "datatype")) return;

    setProperty((prev) => ({ ...prev, [name]: value }));

    if (name === "name") {
      const matches = allCustomNames.filter((n) =>
        n.name.toLowerCase().startsWith(value.toLowerCase())
      );
      setFilteredSuggestions(matches);
    }
  };

  const handleFocus = () => setFilteredSuggestions(allCustomNames);

  const handleSelectSuggestion = (item) => {
    setProperty({
      name: item.name,
      datatype: item.type,
      value: "",
      id: property.id || null,
    });
    setSelectedFromDropdown(true);
    setFilteredSuggestions([]);
  };

  // Save property
  const handleSave = async () => {
    setPopupError("");

    if (!property.name.trim() || property.value === "" || !property.datatype.trim()) {
      setPopupError("All fields are required");
      return;
    }

    try {
      if (property.id) {
        const res = await fetch(`http://localhost:5000/property`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: property.id,
            name: property.name,
            value: property.value,
            type: property.datatype,
          }),
        });
        if (!res.ok) throw new Error("Failed to update property");
      } else {
        const res = await fetch(`http://localhost:5000/property/users/${id}/property`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: property.name,
            value: property.value,
            type: property.datatype,
          }),
        });
        if (!res.ok) throw new Error("Failed to save property");

        const exists = allCustomNames.some((p) => p.name.toLowerCase() === property.name.toLowerCase());
        if (!exists) {
          await fetch(`http://localhost:5000/custom/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: property.name, type: property.datatype }),
          });
          fetchCustomNames();
        }
      }

      setShowPopup(false);
      setProperty({ id: null, name: "", value: "", datatype: "" });
      fetchProperties();
    } catch (err) {
      console.error(err);
      setPopupError(err.message);
    }
  };

  const handleDelete = async (propId) => {
    try {
      const res = await fetch("http://localhost:5000/property", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: propId }),
      });
      if (!res.ok) throw new Error("Failed to delete property");
      fetchProperties();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };


  const confirmDelete = async () => {
    if (!selectedPropertyId) return;
    await handleDelete(selectedPropertyId);
    setOpenConfirm(false);
    setSelectedPropertyId(null);
    setSelectedName("");
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setProperty({ id: null, name: "", value: "", datatype: "" });
    setFilteredSuggestions([]);
    setSelectedFromDropdown(false);
  };

  const handleAddProperty = () => {
    setProperty({ id: null, name: "", value: "", datatype: "" });
    setSelectedFromDropdown(false);
    setFilteredSuggestions([]);
    setShowPopup(true);
  };

  const handleEditProperty = (prop) => {
    setProperty({ id: prop.id, name: prop.name, value: prop.value, datatype: prop.type });
    const found = allCustomNames.find((n) => n.name === prop.name);
    setSelectedFromDropdown(!!found);
    setShowPopup(true);
  };

  const formatDate = (date) => {
    const d = new Date(date);
    return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
  };

  if (loading) return <p>Loading user details...</p>;
  if (error) return <p>{error}</p>;
  if (!user) return <p>User not found</p>;

  return (
    <>
      <Header />
      <div className={styles.app_layout}>
        <div className={styles.sidebar}><SideBar /></div>
        <div className={styles.content}>
          <button className={styles.backbtn} onClick={() => navigate(-1)}>← Back</button>

          <div className={styles.side}>
            <h2 className={styles.profiletitle}>
              {user.first_name ? user.first_name.charAt(0).toUpperCase() + user.first_name.slice(1) + " " + user.last_name.charAt(0).toUpperCase() + user.last_name.slice(1) : "Profile"}
            </h2>
            <div className={styles.profileinfo}>
              <p><span className={styles.label}><EmailIcon /></span><span className={styles.value}>{maskEmail(user.email)}</span></p>
              <p><span className={styles.label}><PhoneIcon /></span><span className={styles.value}>{maskPhone(user.phone)}</span></p>
              <p><span className={styles.label}><LocationOnIcon /></span><span className={styles.value}>{user.city + ", " + user.state + " ," + user.country || ""}</span></p>
            </div>
          </div>

          <div className={styles.listlogs}>
            <div className={styles.customproperty}>
              <p>Information</p>
              <button onClick={handleAddProperty}>+ Add Property</button>
            </div>

            {properties.length > 0 ? (
              <table className={styles.Tablecontainer}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Value</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {properties.map((prop) => (
                    <tr key={prop.id}>
                      <td>{prop.name}</td>
                      <td>{prop.value}</td>
                      <td>
                        <EditIcon style={{ cursor: "pointer", marginRight: "16px", color: "blue" }} onClick={() => handleEditProperty(prop)} />
                        <DeleteIcon
                          style={{ cursor: "pointer", color: "red" }}
                          onClick={() => {
                            setSelectedPropertyId(prop.id);
                            setSelectedName(prop.name);
                            setOpenConfirm(true);
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No properties added yet.</p>
            )}
          </div>
        </div>
      </div>

      {showPopup && (
        <div className={styles.popupOverlay}>
          <div className={styles.popupContainer} ref={popupRef}>
            <h3>{property.id ? "Edit Property" : "Add Custom Property"}</h3>

            <label className={styles.popupLabel}>
              Name:
              <input
                type="text"
                name="name"
                value={property.name}
                onChange={handleChange}
                onFocus={handleFocus}
                autoComplete="off"
                disabled={selectedFromDropdown}
              />
              {filteredSuggestions.length > 0 && !selectedFromDropdown && (
                <ul className={styles.suggestionList} ref={suggestionListRef}>
                  {filteredSuggestions.map((s, i) => (
                    <li key={i} onMouseDown={(e) => { e.preventDefault(); handleSelectSuggestion(s); }}>{s.name}</li>
                  ))}
                </ul>
              )}
            </label>

            <label className={styles.popupLabel}>
              Type:
              <select name="datatype" value={property.datatype} onChange={handleChange} disabled={selectedFromDropdown}>
                <option value="">Select type</option>
                <option value="string">String</option>
                <option value="number">Integer</option>
                <option value="boolean">Boolean</option>
                <option value="date">Date</option>
              </select>
            </label>

            <label className={styles.popupLabel}>
              Value:
              {property.datatype === "date" ? (
                <DatePicker
                  selected={property.value ? new Date(property.value) : null}
                  onChange={(date) =>
                    setProperty((prev) => ({
                      ...prev,
                      value: date ? formatDate(date) : ""
                    }))
                  }
                  dateFormat="dd-MM-yyyy"
                  placeholderText="Select a date"
                  className={styles.dateInput}
                  shouldCloseOnSelect={true}
                />
              ) : (
                <input type="text" name="value" value={property.value} onChange={handleChange} />
              )}
            </label>

            <div className={styles.popupButtons}>
              <button className={styles.cancelBtn} onClick={handleClosePopup}>Cancel</button>
              <button className={styles.saveBtn} onClick={handleSave}>{property.id ? "Update" : "Save"}</button>
            </div>

            {popupError && <p className={styles.popupError}>{popupError}</p>}
          </div>
        </div>
      )}

      <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete <strong>{selectedName || "this item"}</strong>?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirm(false)}>NO</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">YES</Button>
        </DialogActions>
      </Dialog>

      <Footer />
    </>
  );
};

export default UserDetails;





/*
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./UserDetails.module.css";

import Header from "../header/Header";
import Footer from "../footer/Footer";
import SideBar from "../sidebar/SideBar";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";



const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const popupRef = useRef(null);
  const suggestionListRef = useRef(null);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showPopup, setShowPopup] = useState(false);
  const [property, setProperty] = useState({ id: null, name: "", value: "", datatype: "" });
  const [properties, setProperties] = useState([]);

  const [allCustomNames, setAllCustomNames] = useState([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [selectedFromDropdown, setSelectedFromDropdown] = useState(false);

  const [popupError, setPopupError] = useState("");

//for Pop up open for delete
  const [openConfirm, setOpenConfirm] = useState(false);
const [selectedPropertyId, setSelectedPropertyId] = useState(null);
const [selectedName, setSelectedName] = useState(""); // to show property name in dialog


  // Fetch user
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError("");

    fetch(`http://localhost:5000/excelusers/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch user");
        return res.json();
      })
      .then((data) => {
        setUser(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("User not found or invalid ID");
        setLoading(false);
      });
  }, [id]);

  // Fetch properties
const fetchProperties = async () => {
  try {
    const res = await fetch(`http://localhost:5000/property/users/${id}/properties`);
    const data = await res.json();
    setProperties(data); // now only properties of current user
  } catch (err) {
    console.error(err);
  }
};

useEffect(() => {
  if (id) {
    fetchProperties();
  }
}, [id]);


  // Fetch custom names
  useEffect(() => {
    fetch("http://localhost:5000/custom/")
      .then((res) => res.json())
      .then((data) => setAllCustomNames(data))
      .catch((err) => console.error(err));
  }, [id]);

  // Close suggestions when clicking anywhere inside popup except the dropdown list itself
  useEffect(() => {
    const handleClickInsidePopup = (event) => {
      if (
        popupRef.current &&
        !suggestionListRef.current?.contains(event.target) &&
        showPopup
      ) {
        setFilteredSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handleClickInsidePopup);
    return () => document.removeEventListener("mousedown", handleClickInsidePopup);
  }, [showPopup]);

  // Mask helpers
  const maskEmail = (email) => {
    if (!email) return "";
    const [, domain] = email.split("@");
    return "*****@" + domain;
  };
  const maskPhone = (phone) => {
    if (!phone) return "";
    if (phone.length <= 3) return phone;
    return "*".repeat(phone.length - 3) + phone.slice(-3);
  };

  // Handle input & suggestions
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (selectedFromDropdown && (name === "name" || name === "datatype")) return;

    setProperty((prev) => ({ ...prev, [name]: value }));

    if (name === "name") {
      const matches = allCustomNames.filter((n) =>
        n.name.toLowerCase().startsWith(value.toLowerCase())
      );
      setFilteredSuggestions(matches);
    }
  };

  const handleFocus = () => setFilteredSuggestions(allCustomNames);

  const handleSelectSuggestion = (item) => {
    setProperty({
      name: item.name,
      datatype: item.type,
      value: "",
      id: property.id || null,
    });
    setSelectedFromDropdown(true);
    setFilteredSuggestions([]);
  };

  // Save property
  const handleSave = async () => {
     setPopupError("");
    if (!property.name || !property.value || !property.datatype) {
      setPopupError("All fields are required");
      return;
    }
    try {
      let res;
      if (property.id) {
        res = await fetch("http://localhost:5000/property", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: property.id,
            name: property.name,
            value: property.value,
            type: property.datatype,
          }),
        });
      } else {
        res = await fetch(`http://localhost:5000/property/users/${id}/property`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: property.name,
    value: property.value,
    type: property.datatype,
          }),
        });
      }

      if (!res.ok) throw new Error("Failed to save property");
      setShowPopup(false);
      setProperty({ id: null, name: "", value: "", datatype: "" });
      fetchProperties();
    } catch (err) {
      console.error(err);
    setPopupError(err.message); 
    }
  };

const confirmDelete = async () => {
  if (!selectedPropertyId) return;
  await handleDelete(selectedPropertyId); // call your existing delete logic
  setOpenConfirm(false); // close dialog
  setSelectedPropertyId(null);
  setSelectedName("");
};


  // Delete property
  const handleDelete = async (propId) => {
    try {
      const res = await fetch("http://localhost:5000/property", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: propId }),
      });
      if (!res.ok) throw new Error("Failed to delete property");
      fetchProperties();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  // Popup helpers
  const handleClosePopup = () => {
    setShowPopup(false);
    setProperty({ id: null, name: "", value: "", datatype: "" });
    setFilteredSuggestions([]);
    setSelectedFromDropdown(false);
  };

  const handleAddProperty = () => {
    setProperty({ id: null, name: "", value: "", datatype: "" });
    setSelectedFromDropdown(false);
    setFilteredSuggestions([]);
    setShowPopup(true);
  };

  const handleEditProperty = (prop) => {
    setProperty({ id: prop.id, name: prop.name, value: prop.value, datatype: prop.type });
    const found = allCustomNames.find((n) => n.name === prop.name);
    setSelectedFromDropdown(!!found);
    setShowPopup(true);
  };

const formatDate = (date) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};



  if (loading) return <p>Loading user details...</p>;
  if (error) return <p>{error}</p>;
  if (!user) return <p>User not found</p>;

  return (
    <>
      <Header />
      <div className={styles.app_layout}>
        <div className={styles.sidebar}><SideBar /></div>
        <div className={styles.content}>
          <button className={styles.backbtn} onClick={() => navigate(-1)}>← Back</button>

          <div className={styles.side}>
            <h2 className={styles.profiletitle}>
              {user.first_name ? user.first_name.charAt(0).toUpperCase() + user.first_name.slice(1)+" "+user.last_name.charAt(0).toUpperCase() + user.last_name.slice(1) : "Profile"}
            </h2>
            <div className={styles.profileinfo}>
              
              <p><span className={styles.label}><EmailIcon/></span><span className={styles.value}>{maskEmail(user.email)}</span></p>
              <p><span className={styles.label}><PhoneIcon/></span><span className={styles.value}>{maskPhone(user.phone)}</span></p>
      
              <p><span className={styles.label}><LocationOnIcon/></span><span className={styles.value}>{user.city +", "+user.state +" ,"+user.country || ""}</span></p>
                       </div>
          </div>

          <div className={styles.listlogs}>
            <div className={styles.customproperty}>
              <p>Information</p>
              <button onClick={handleAddProperty}>+ Add Property</button>
            </div>

            {properties.length > 0 ? (
              <table className={styles.Tablecontainer}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Value</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {properties.map((prop) => (
                    <tr key={prop.id}>
                      <td>{prop.name}</td>
                      <td>{prop.value}</td>
                      <td>
                        <EditIcon style={{ cursor: "pointer", marginRight: "16px", color: "blue" }} onClick={() => handleEditProperty(prop)} />
                        <DeleteIcon
                                style={{ cursor: "pointer", color: "red" }}
                                          onClick={() => {
                                           setSelectedPropertyId(prop.id);
                                               setSelectedName(prop.name);
                                             setOpenConfirm(true); // open dialog
                                                       }}
                                                   />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No properties added yet.</p>
            )}
          </div>
        </div>
      </div>

      {showPopup && (
        <div className={styles.popupOverlay}>
          <div className={styles.popupContainer} ref={popupRef}>
            <h3>{property.id ? "Edit Property" : "Add Custom Property"}</h3>

            <label className={styles.popupLabel}>
              Name:
              <input
                type="text"
                name="name"
                value={property.name}
                onChange={handleChange}
                onFocus={handleFocus}
                autoComplete="off"
                disabled={selectedFromDropdown}
              />
              {filteredSuggestions.length > 0 && !selectedFromDropdown && (
                <ul className={styles.suggestionList} ref={suggestionListRef}>
                  {filteredSuggestions.map((s, i) => (
                    <li key={i} onMouseDown={(e) => { e.preventDefault(); handleSelectSuggestion(s); }}>{s.name}</li>
                  ))}
                </ul>
              )}
            </label>

            <label className={styles.popupLabel}>
              Type:
              <select name="datatype" value={property.datatype} onChange={handleChange} disabled={selectedFromDropdown}>

                <option value="string">String</option>
                <option value="number">Integer</option>
                <option value="boolean">Boolean</option>
                <option value="date">Date</option>
              </select>
            </label>

            <label className={styles.popupLabel}>
  Value:
  {property.datatype === "date" ? (
  <DatePicker
  selected={property.value ? new Date(property.value) : null}
  onChange={(date) =>
    setProperty((prev) => ({
      ...prev,
      value: date ? formatDate(date) : ""
    }))
  }
  dateFormat="dd-MM-yyyy"        // format dd-MM-yyyy
  placeholderText="Select a date"
  className={styles.dateInput}   // same size as other inputs
  shouldCloseOnSelect={true}    // calendar closes when a date is selected
/>



  ) : (
    <input type="text" name="value" value={property.value} onChange={handleChange} />
  )}
</label>


            <div className={styles.popupButtons}>
              <button className={styles.cancelBtn} onClick={handleClosePopup}>Cancel</button>
              <button className={styles.saveBtn} onClick={handleSave}>{property.id ? "Update" : "Save"}</button>
            </div>
            {popupError && (
  <p className={styles.popupError}>{popupError}</p>
)}
  
          </div>
          
      </div>
        
      )}
      <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
  <DialogTitle>Confirm Delete</DialogTitle>
  <DialogContent>
    Are you sure you want to delete{" "}
    <strong>{selectedName || "this item"}</strong>?
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setOpenConfirm(false)}>NO</Button>
    <Button
      onClick={() => {
        confirmDelete();
      }}
      color="error"
      variant="contained"
    >
      YES
    </Button>
  </DialogActions>
</Dialog>


      <Footer />
    </>
  );
};

export default UserDetails;


*/