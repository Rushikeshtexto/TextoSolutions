import React, { useState, useEffect } from "react";
import styles from "./frontpage.module.css";
import LoadingOverlay from "../loading/LoadingOverlay";
import Home from "./Home";
import Profile from "./allprofile";
import List from "./list";
import "bootstrap/dist/css/bootstrap.min.css";
import Header from "../header/Header";
import SideBar from "../sidebar/SideBar"
const FrontendPage = () => {
  const [activeTab, setActiveTab] = useState();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab) {
      setLoading(true);
      const timer = setTimeout(() => setLoading(false), 800);
      return () => clearTimeout(timer);
    }
  }, [activeTab]);

  return (
    <div className={styles.app}>
      {/* ===== Bootstrap Navbar ===== */}
      <nav className={`${styles.navbar} navbar-expand-lg navbar-light bg-light shadow-sm`}>        
        <div className={styles.container_fluid}>
          {/* Logo */}
          <a className="navbar-brand d-flex align-items-center" href="#">
            <img
              src="./src/assets/Media.jpg"
              alt="Logo"
              className={styles.logo}
            />
            Texto
          </a>

          {/* Toggler for small screens */}
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Right side links (optional) */}
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <a className="nav-link" href="#">Docs</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">Support</a>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* ===== Page Layout with Sidebar ===== */}
      <div className={styles.sidebar_container}>
        {/* Sidebar */}
        <div className={styles.tab_buttons}>
          <a
            className={`${styles.tab_link} ${activeTab === "home" ? styles.active : ""}`}
            onClick={() => setActiveTab("home")}
            href="/innerhome"
          >
            Home
          </a>
          <a
            className={`${styles.tab_link} ${activeTab === "profiles" ? styles.active : ""}`}
            onClick={() => setActiveTab("profiles")}
            href='/profiles'
          >
            Profiles
          </a>
          <a
            className={`${styles.tab_link} ${activeTab === "segments" ? styles.active : ""}`}
            onClick={() => setActiveTab("segments")}
            href="/list"
          >
            List & Segments
          </a>
        </div>

        {/* Main Content */}
        <section className={styles.tab_content} style={{ position: "relative" }}>
          {loading && <LoadingOverlay />}
          {!loading && (
            <>
              {activeTab === "home" && <Home />}
              {activeTab === "profiles" && <Profile />}
              {activeTab === "segments" && <List />}
            </>
          )}
        </section>
      </div>

      {/* ===== Footer ===== */}
      <footer className={styles.footer}>
        <div className={styles.footer_logo}>
          <img className={styles.logo} src="./src/assets/Media.jpg" alt="Logo" /> Texto
        </div>

        <div className={styles.footer_grid}>
          <table>
            <tbody>
              <tr>
                <td>
                  <h4>Follow us</h4>
                </td>
                <td>
                  <a href="#">
                    <img
                      className={styles.social}
                      src="./src/assets/linkedinlogo.jpg"
                      alt="LinkedIn"
                    />
                  </a>
                </td>
                <td>
                  <a href="#">
                    <img
                      className={styles.social}
                      src="./src/assets/twitterlogo.png"
                      alt="Twitter"
                    />
                  </a>
                </td>
                <td>
                  <a href="#">
                    <img
                      className={styles.social}
                      src="./src/assets/facebooklogo.png"
                      alt="Facebook"
                    />
                  </a>
                </td>
                <td>
                  <a href="#">
                    <img
                      className={styles.social}
                      src="./src/assets/instagramlogo.jpg"
                      alt="Instagram"
                    />
                  </a>
                </td>
                <td>
                  <a href="#">
                    <img
                      className={styles.social}
                      src="./src/assets/youtubelogo.png"
                      alt="YouTube"
                    />
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className={styles.footer_bottom}>
          <p className={styles.legal}>
            Privacy | Security | Cookies | Terms | DLT
          </p>
        </div>
      </footer>
    </div>
  );
};

export default FrontendPage;
