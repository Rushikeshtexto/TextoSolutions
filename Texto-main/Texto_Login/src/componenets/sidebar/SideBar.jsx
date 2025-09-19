import React,{useState} from 'react';
import styles from  "./SideBar.module.css";

//import profile from "../../assets/profile.png"
//import HomeIcon from "@mui/icons-material/Home";
import { FaHome} from "react-icons/fa";
import { FaUser} from "react-icons/fa";
import { FaList } from "react-icons/fa"; 
const SideBar = ({ setLoading }) => {
  const [activeTab, setActiveTab] = useState();
    return (
      <div className={styles.tab_buttons}>
        <a
          href="/home"
          className={`${styles.tab_link} ${activeTab === "home" ? styles.active : ""}`}
      
          onClick={() => setActiveTab("home")}
        >
        <FaHome className={styles.tab_icon} />
          HOME
        </a>
        <a
          href="/profiles"
          className={`${styles.tab_link} ${activeTab === "profiles" ? styles.active : ""}`}
          onClick={() => setActiveTab("profiles")}
          
        >  <FaUser className={styles.tab_icon} />
           PROFILE
        </a>
        <a
          href="/list"
          className={`${styles.tab_link} ${activeTab === "segments" ? styles.active : ""}`}
          onClick={() => setActiveTab("segments")}
        >     <FaList className={styles.tab_icon} />
          LIST & SEGMENTS
        </a>
        {/* <a href="/list" className={styles.tab_link}>
          List & Segments Rahul
        </a> */}
      </div>
    );
  };
  
  export default SideBar;
  