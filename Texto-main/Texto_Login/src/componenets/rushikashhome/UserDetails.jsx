

import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./UserDetails.module.css";

import Header from "../header/Header";
import Footer from "../footer/Footer";
import SideBar from "../sidebar/SideBar";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showPopup, setShowPopup] = useState(false);
  const [property, setProperty] = useState({ id: null, name: "", value: "", datatype: "" });
  const [properties, setProperties] = useState([]);

  const [allCustomNames, setAllCustomNames] = useState([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);


  const [selectedFromDropdown, setSelectedFromDropdown] = useState(false); 
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

  // Fetch properties and custom names
  const fetchProperties = async () => {
    try {
      const res = await fetch(`http://localhost:5000/property/users/${id}/properties`);
      if (!res.ok) throw new Error("Failed to fetch properties");
      const data = await res.json();
      setProperties(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
  fetch("http://localhost:5000/custom/")
    .then((res) => res.json())
    .then((data) => setAllCustomNames(data)) // store as objects: {name, type}
    .catch((err) => console.error(err));
}, [id]);

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setFilteredSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Mask email & phone
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
  if (selectedFromDropdown) return; // prevent editing name if selected from dropdown

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
  // item is {name, type}
  setProperty({
    name: item.name,
    datatype: item.type,
    value: "",
    id: property.id || null,
  });
  setSelectedFromDropdown(true); // disable name & type
  setFilteredSuggestions([]);
};



  // Save or update property
  const handleSave = async () => {
    if (!property.name || !property.value || !property.datatype) {
      alert("All fields are required");
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
      alert(err.message);
    }
  };

  // Edit property
  const handleEdit = (prop) => {
    setProperty({ id: prop.id, name: prop.name, value: prop.value, datatype: prop.type });
    setShowPopup(true);
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

  const handleClosePopup = () => {
    setShowPopup(false);
    setProperty({ id: null, name: "", value: "", datatype: "" });
    setFilteredSuggestions([]);
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
              {user.first_name ? user.first_name.charAt(0).toUpperCase() + user.first_name.slice(1) : "Profile"}'s Profile
            </h2>
            <div className={styles.profileinfo}>
              <p><span className={styles.label}>First Name:</span><span className={styles.value}>{user.first_name}</span></p>
              <p><span className={styles.label}>Last Name:</span><span className={styles.value}>{user.last_name}</span></p>
              <p><span className={styles.label}>Email:</span><span className={styles.value}>{maskEmail(user.email)}</span></p>
              <p><span className={styles.label}>Phone:</span><span className={styles.value}>{maskPhone(user.phone)}</span></p>
              <p><span className={styles.label}>Address 1:</span><span className={styles.value}>{user.address_1 || ""}</span></p>
              <p><span className={styles.label}>Address 2:</span><span className={styles.value}>{user.address_2 || ""}</span></p>
              <p><span className={styles.label}>City:</span><span className={styles.value}>{user.city || ""}</span></p>
              <p><span className={styles.label}>State:</span><span className={styles.value}>{user.state || ""}</span></p>
              <p><span className={styles.label}>Country:</span><span className={styles.value}>{user.country || ""}</span></p>
            </div>
          </div>

          <div className={styles.listlogs}>
            <h4></h4>
            <div className={styles.customproperty}>
              <p>Custom Properties</p>
              <button onClick={() => setShowPopup(true)}>+ Add Property</button>
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
                        <EditIcon style={{ cursor: "pointer", marginRight: "16px", color: "blue" }} onClick={() => handleEdit(prop)} />
                        <DeleteIcon style={{ cursor: "pointer", color: "red" }} onClick={() => handleDelete(prop.id)} />
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
          <div className={styles.popupContainer}>
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
    disabled={selectedFromDropdown} // disable name if selected from dropdown
  />
  {filteredSuggestions.length > 0 && !selectedFromDropdown && (
    <ul className={styles.suggestionList}>
      {filteredSuggestions.map((s, i) => (
        <li
          key={i}
          className={styles.suggestionItem}
          onMouseDown={(e) => {
            e.preventDefault(); // prevent input blur
            handleSelectSuggestion(s);
          }}
        >
          {s.name}
        </li>
      ))}
    </ul>
  )}
</label>

<label className={styles.popupLabel}>
  Type:
  <select
    name="datatype"
    value={property.datatype}
    onChange={handleChange}
    disabled={selectedFromDropdown} // disable type if selected from dropdown
  >
    <option value="">Select</option>
    <option value="string">String</option>
    <option value="number">Integer</option>
    <option value="boolean">Boolean</option>
  </select>
</label>



            <label className={styles.popupLabel}>
              Value:
              <input type="text" name="value" value={property.value} onChange={handleChange} />
            </label>

            <div className={styles.popupButtons}>
              <button className={styles.cancelBtn} onClick={handleClosePopup}>Cancel</button>
              <button className={styles.saveBtn} onClick={handleSave}>{property.id ? "Update" : "Save"}</button>
            </div>
          </div>
        </div>
      )}

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

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showPopup, setShowPopup] = useState(false);
  const [property, setProperty] = useState({ id: null, name: "", value: "", datatype: "" });
  const [properties, setProperties] = useState([]);

  const [allCustomNames, setAllCustomNames] = useState([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);

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

  // Fetch properties and custom names
  const fetchProperties = async () => {
    try {
      const res = await fetch(`http://localhost:5000/property/users/${id}/properties`);
      if (!res.ok) throw new Error("Failed to fetch properties");
      const data = await res.json();
      setProperties(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProperties();
    fetch("http://localhost:5000/custom/")
      .then((res) => res.json())
      .then((data) => setAllCustomNames(data.map((item) => item.name)))
      .catch((err) => console.error(err));
  }, [id]);

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setFilteredSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Mask email & phone
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
    setProperty((prev) => ({ ...prev, [name]: value }));

    if (name === "name") {
      const matches = allCustomNames.filter((n) =>
        n.toLowerCase().startsWith(value.toLowerCase())
      );
      setFilteredSuggestions(matches);
    }
  };
  const handleFocus = () => setFilteredSuggestions(allCustomNames);
  const handleSelectSuggestion = (name) => {
    setProperty((prev) => ({ ...prev, name }));
    setFilteredSuggestions([]);
  };

  // Save or update property
  const handleSave = async () => {
    if (!property.name || !property.value || !property.datatype) {
      alert("All fields are required");
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
      alert(err.message);
    }
  };

  // Edit property
  const handleEdit = (prop) => {
    setProperty({ id: prop.id, name: prop.name, value: prop.value, datatype: prop.type });
    setShowPopup(true);
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

  const handleClosePopup = () => {
    setShowPopup(false);
    setProperty({ id: null, name: "", value: "", datatype: "" });
    setFilteredSuggestions([]);
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
              {user.first_name ? user.first_name.charAt(0).toUpperCase() + user.first_name.slice(1) : "Profile"}'s Profile
            </h2>
            <div className={styles.profileinfo}>
              <p><span className={styles.label}>First Name:</span><span className={styles.value}>{user.first_name}</span></p>
              <p><span className={styles.label}>Last Name:</span><span className={styles.value}>{user.last_name}</span></p>
              <p><span className={styles.label}>Email:</span><span className={styles.value}>{maskEmail(user.email)}</span></p>
              <p><span className={styles.label}>Phone:</span><span className={styles.value}>{maskPhone(user.phone)}</span></p>
              <p><span className={styles.label}>Address 1:</span><span className={styles.value}>{user.address_1 || ""}</span></p>
              <p><span className={styles.label}>Address 2:</span><span className={styles.value}>{user.address_2 || ""}</span></p>
              <p><span className={styles.label}>City:</span><span className={styles.value}>{user.city || ""}</span></p>
              <p><span className={styles.label}>State:</span><span className={styles.value}>{user.state || ""}</span></p>
              <p><span className={styles.label}>Country:</span><span className={styles.value}>{user.country || ""}</span></p>
            </div>
          </div>

          <div className={styles.listlogs}>
            <h4></h4>
            <div className={styles.customproperty}>
              <p>Custom Properties</p>
              <button onClick={() => setShowPopup(true)}>+ Add Property</button>
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
                        <EditIcon style={{ cursor: "pointer", marginRight: "16px", color: "blue" }} onClick={() => handleEdit(prop)} />
                        <DeleteIcon style={{ cursor: "pointer", color: "red" }} onClick={() => handleDelete(prop.id)} />
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
          <div className={styles.popupContainer}>
            <h3>{property.id ? "Edit Property" : "Add Custom Property"}</h3>

          
            <label className={styles.popupLabel}>
              Name:
              <div className={styles.dropdownWrapper} ref={dropdownRef}>
                <input
                  type="text"
                  name="name"
                  value={property.name}
                  onChange={handleChange}
                  onFocus={handleFocus}
                  autoComplete="off"
                />
                {filteredSuggestions.length > 0 && (
                  <ul className={styles.suggestionList}>
                    {filteredSuggestions.map((s, i) => (
                      <li
                        key={i}
                        className={styles.suggestionItem}
                        onMouseDown={(e) => {   // use onMouseDown instead of onClick
                          e.preventDefault();    // prevent input losing focus issue
                          handleSelectSuggestion(s);
                        }}
                      >
                        {s}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </label>

            <label className={styles.popupLabel}>
              Type:
              <select name="datatype" value={property.datatype} onChange={handleChange}>
                <option value="">Select</option>
                <option value="string">String</option>
                <option value="number">Integer</option>
                <option value="boolean">Boolean</option>
              </select>
            </label>

            <label className={styles.popupLabel}>
              Value:
              <input type="text" name="value" value={property.value} onChange={handleChange} />
            </label>

            <div className={styles.popupButtons}>
              <button className={styles.cancelBtn} onClick={handleClosePopup}>Cancel</button>
              <button className={styles.saveBtn} onClick={handleSave}>{property.id ? "Update" : "Save"}</button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default UserDetails;


*/