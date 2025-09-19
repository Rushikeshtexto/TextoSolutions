import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from"./UserProfile.module.css";
import Header from "../header/Header";
import Footer from "../footer/Footer";
import SideBar from "../sidebar/SideBar";
import Home from "./Home";
import List from "./list";

const UserProfile = () => {
  const { id } = useParams(); // get id from URL
  const [user, setUser] = useState(null);
    const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("profiles");

  useEffect(() => {
    const fetchUser = async () => {
      try {[]
        const res = await fetch(`http://localhost:5000/data/${id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();
        console.log("Data ",data)
        const found = data.find(u => String(u.id) === String(id));
        console.log("User ",found)
        setUser(found);
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };
    fetchUser();
  }, [id]);

useEffect(() => {
    fetch(`http://localhost:5000/users/${encryptedId}`)
      .then(res => res.json())
      .then(data => setUser(data))
      .catch(err => console.error(err));
  }, [encryptedId]);

  if (!user) return <p>Loading user profile...</p>;

  

  return (
    <>
<div className={styles.app}>

  
      <Header />

      <div className={styles.container}>
     
        <div className={styles.sidebarcontainer} >
        <SideBar />
</div>
<div className={styles.content}>
        <div className={styles.tabcontent}>
          {activeTab === "home" && <Home />}
          {activeTab === "profiles" && (
            <div className="tablecontainer">
  <h2 className={styles.profiletitle}>
    {user.name.charAt(0).toUpperCase() + user.name.slice(1)} Profile
  </h2>

  <div className={styles.profileinfo}>
    <p>
      <i className="fa-solid fa-envelope"></i>
      <span className={styles.label}>Email:</span>
      <span className={styles.value}>{user.email}</span>
    </p>

    <p>
      <i className="fa-solid fa-phone"></i>
      <span className={styles.label}>Phone:</span>
      <span className={styles.value}>{user.phone}</span>
    </p>

    <p>
      <i className="fa-solid fa-location-dot"></i>
      <span className={styles.label}>Location:</span>
      <span className={styles.value}>{user.location}</span>
    </p>

    <p>
      <i className="fa-solid fa-calendar-check"></i>
      <span className={styles.label}>First Active:</span>
      <span className={styles.value}>{new Date(user.first_active).toString().split("T")[0]}</span>
    </p>

    <p>
      <i className="fa-solid fa-clock"></i>
      <span className={styles.label}>Last Updated:</span>
      <span className={styles.value}>{new Date(user.last_updated).toString().split("T")[0]}</span>
    </p>
  </div>

  
</div>


          )}
          <button className={styles.backbtn} onClick={() => navigate("/profiles")}>
    ⬅ Back 
  </button>
          {activeTab === "segments" && <List />}
        </div>
        </div>
      </div>
      

    
    
      <Footer />
      
    </div>
      
      </>
  );
};

export default UserProfile;
