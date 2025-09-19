import React from 'react'
import { useState,useEffect } from 'react';
import { useLocation  } from "react-router-dom";
import {jwtDecode} from "jwt-decode";
import Header from '../header/Header';

const Home = () => {
    
    const [user, setUser] = useState(null);
    const location = useLocation();

  useEffect(() => {
    // Get token from query string
    const params = new URLSearchParams(location.search);
    const tokenFromUrl  = params.get("token");
    const storedToken = localStorage.getItem("authToken");

   
    const token = tokenFromUrl || storedToken;
    if (token) {
      // Save token to localStorage for later use
      if (tokenFromUrl) {
        localStorage.setItem("authToken", token);
        window.history.replaceState({}, document.title, "/home");
      }
      const decoded = jwtDecode(token);
      setUser(decoded);
      console.log(jwtDecode(token));
    }
  }, [location]);

  
  

  return (
    <div>
      <Header/>
     
        <div className="d-flex">
      {/* Sidebar */}
      <div
        className="offcanvas offcanvas-start show"
        tabIndex="-1"
        id="sidebar"
        style={{ width: "250px", visibility: "visible", position: "relative" }}
      >
        <div className="offcanvas-header">
          <h5 className="offcanvas-title">Menu</h5>
        </div>
        <div className="offcanvas-body">
          <ul className="list-unstyled">
            <li><a href="#" className="nav-link">Dashboard</a></li>
            <li><a href="/list" className="nav-link">Lists</a></li>
            <li><a href="/profiles" className="nav-link">Profiles</a></li>
            <li><a href="/segments" className="nav-link">Segements</a></li>
         
          </ul>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow-1 p-3">
        <button
          className="btn btn-primary mb-3"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#sidebar"
        >
          Toggle Sidebar
        </button>
        <h1>Welcome to Dashboard</h1>
        <p>This is the main content area.</p>
      </div>
    </div>


    </div>


  )
}

export default Home