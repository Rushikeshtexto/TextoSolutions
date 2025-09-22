import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import styles from "./UserDetails.module.css";

import Header from "../header/Header";
import Footer from "../footer/Footer";
import SideBar from "../sidebar/SideBar";

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [property, setProperty] = useState({ name: "", value: "", datatype: "" });

  // Fetch user by ID
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
        setUser(null);
        setLoading(false);
      });
  }, [id]);

  // Mask email (hide everything before @)
  const maskEmail = (email) => {
    if (!email) return "";
    const [, domain] = email.split("@");
    return "*****@" + domain;
  };

  // Mask phone (show only last 3 digits)
  const maskPhone = (phone) => {
    if (!phone) return "";
    if (phone.length <= 3) return phone;
    return "*".repeat(phone.length - 3) + phone.slice(-3);
  };

  if (loading) return <p>Loading user details...</p>;
  if (error) return <p>{error}</p>;
  if (!user) return <p>User not found</p>;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProperty((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    // Temporary: just close popup for now
    console.log("Property saved:", property);
    setShowPopup(false);
  };

  return (
    <>
      <Header />
      <div className={styles.app_layout}>
        <div className={styles.sidebar}>
          <SideBar />
        </div>

        <div className={styles.content}>
          <button className={styles.backbtn} onClick={() => navigate(-1)}>
            ← Back
          </button>

          <div className={styles.side}>
            <h2 className={styles.profiletitle}>
              {user.first_name
                ? user.first_name.charAt(0).toUpperCase() + user.first_name.slice(1)
                : "Profile"}'s Profile
            </h2>

            <div className={styles.profileinfo}>
              <p>
                <span className={styles.label}>First Name:</span>
                <span className={styles.value}>{user.first_name}</span>
              </p>
              <p>
                <span className={styles.label}>Last Name:</span>
                <span className={styles.value}>{user.last_name}</span>
              </p>
              <p>
                <span className={styles.label}>Email:</span>
                <span className={styles.value}>{maskEmail(user.email)}</span>
              </p>
              <p>
                <span className={styles.label}>Phone:</span>
                <span className={styles.value}>{maskPhone(user.phone)}</span>
              </p>
              <p>
                <span className={styles.label}>Address 1:</span>
                <span className={styles.value}>{user.address_1 || ""}</span>
              </p>
              <p>
                <span className={styles.label}>Address 2:</span>
                <span className={styles.value}>{user.address_2 || ""}</span>
              </p>
              <p>
                <span className={styles.label}>City:</span>
                <span className={styles.value}>{user.city || ""}</span>
              </p>
              <p>
                <span className={styles.label}>State:</span>
                <span className={styles.value}>{user.state || ""}</span>
              </p>
              <p>
                <span className={styles.label}>Country:</span>
                <span className={styles.value}>{user.country || ""}</span>
              </p>
            </div>
          </div>

          <div className={styles.listsegments}>
            <h3>Lists & Segments</h3>
          </div>

          <div className={styles.listlogs}>
            <h4>Information</h4>
            <div className={styles.customproperty}>
              <p>Custom Properties</p>
              <button onClick={() => setShowPopup(true)}>+ Add Property</button>
            </div>
          </div>
        </div>
      </div>

      {/* Popup container */}
      {showPopup && (
        <div className={styles.popupOverlay}>
          <div className={styles.popupContainer}>
            <h3>Add Custom Property</h3>

            <label className={styles.popupLabel}>
              Name:
              <input
                type="text"
                name="name"
                value={property.name}
                onChange={handleChange}
              />
            </label>

            <label className={styles.popupLabel}>
              Value:
              <input
                type="text"
                name="value"
                value={property.value}
                onChange={handleChange}
              />
            </label>

            <label className={styles.popupLabel}>
              Datatype:
              <select
                name="datatype"
                value={property.datatype}
                onChange={handleChange}
              >
                <option value="">Select</option>
                <option value="string">String</option>
                <option value="number">Number</option>
                <option value="boolean">Boolean</option>
              </select>
            </label>

            <div className={styles.popupButtons}>
              <button onClick={handleSave}>Save</button>
              <button onClick={() => setShowPopup(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default UserDetails;
