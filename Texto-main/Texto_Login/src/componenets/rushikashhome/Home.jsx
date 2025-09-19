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
<p> HI Texto is the software developement company.</p>
</div>
</div>
</div>
<Footer/>
</>




);
};
export default Home;