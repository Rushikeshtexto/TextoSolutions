import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./componenets/login/Login.jsx";
import Signup from "./componenets/signup/Signup.jsx";
import Segments from "./componenets/lists_segments/Segments.jsx";
import List from "./componenets/rushikashhome/list.jsx";
import FrontendPage from "./componenets/rushikashhome/frontpage.jsx";
import { AddList } from "./componenets/lists_segments/AddList.jsx";
import Profile from "./componenets/rushikashhome/allprofile.jsx";
import Home from "./componenets/rushikashhome/Home.jsx";
import UserDetails from "./componenets/rushikashhome/UserDetails.jsx";
import ViewList from "./componenets/lists_segments/ViewList.jsx";
import Customproperty from "./componenets/custome_property/customproperty.jsx";
import Segment from "./componenets/lists_segments/viewSegment.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/home" element={<Home />} />
        <Route path="/innerhome" element={<Home />} />
        <Route path="/list" element={<List />} />
        <Route path="/segments" element={<Segments />} />
        <Route path="/addlist" element={<AddList />} />

        {/* Profiles list page */}
        <Route path="/profiles" element={<Profile />} />

        {/* Individual user details */}
        <Route path="/profiles/:id" element={<UserDetails />} />
        <Route path="/viewlist/:id" element={<ViewList/>}/>
        <Route path="/addsegment" element={<Segments/>}/>
        <Route path="/customproperty" element={<Customproperty/>}></Route>
        <Route path="/viewsegment" element={<Segment/>}></Route>
      </Routes>
    </Router>
  );
}

export default App;
