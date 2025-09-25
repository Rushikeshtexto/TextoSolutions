import React  from "react";
import styles from "./Home.module.css";
import FrontendPage from "./frontpage";
import SideBar from "../sidebar/SideBar";
import Header from "../header/Header";
import Footer from "../footer/Footer";
const Home=()=>{



return(

<>
<Header/>
            <div className={styles.app_layout}>

     <div className={styles.sidebar}>
     < SideBar/>
     </div>
     
            <div className={styles.content}>
<div className={styles.Homepage}>
<h1>Welcome to texto </h1>
<p>Texto is a pioneering new-age platform designed to streamline and automate business communications primarily 
       through Whatsapp Business API. We provide robust solutions that empower brands to manage customer 
       conversations, provide support, drive sales, and enhance engagement efficiently.
      Our focus extends to a diverse clientele, Including SMEs, large enterprises,
      D2C brands, and all customer-first businesses looking to scale their outreach. Headquartered in India, 
      Texto is rapidly expanding its footprint, serving both local and global clients with a commitment to Innovation and customer success.    </p>
</div>
</div>
</div>
<Footer/>
</>




);
};
export default Home;