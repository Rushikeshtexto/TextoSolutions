import React from "react";
import Header from "../header/Header";
import Footer from "../footer/Footer";
import SideBar from "../sidebar/SideBar";
import styles from "../lists_segments/viewSegment.module.css";

const Segment = () =>{

return(

<>
<Header/>

<div className={styles.app_layout}>
    <div className={styles.sidebar}> <SideBar/></div>
<div className={styles.content}> </div>
<div className={styles.mainbox}>
<div className={styles.box1} ></div>

<div className={styles.box2}></div>

<div className={styles.box3}></div>

</div>






    </div>









<Footer/>
</>


);



};

export default Segment;