import React, { useState, useEffect } from "react";
import { Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from "@mui/material";
import { Upload, SaveAllIcon } from "lucide-react";
import CloseIcon from "@mui/icons-material/Close";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import styles from "../lists_segments/AddList.module.css";
import SideBar from "../sidebar/SideBar";
import Header from "../header/Header";
import Footer from "../footer/Footer";
import LoadingOverlay from "../loading/LoadingOverlay";
import { useNavigate } from "react-router-dom";

export const AddList = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(true);
  const [name, setName] = useState("");
  const [items, setItems] = useState([]);
  const [listnameExists, setListnameExists] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Remove selected file
  const handleRemoveFile = () => {
    setFiles([]);
    document.getElementById("file-upload").value = "";
  };

  // Check if list name exists
  const searchName = async (listName) => {
    if (!listName || !token) return;

    try {
      const res = await fetch("http://localhost:5000/listname", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name: listName })
      });

      if (res.status === 401) {
        toast.error("Unauthorized! Please login again.", { position: "top-center" });
        return;
      }

      const data = await res.json();
      setListnameExists(data && data.length > 0);
    } catch (err) {
      console.error("Error checking list name:", err);
    }
  };

  useEffect(() => {
    searchName(name);
  }, [name]);

  // Fetch headers/items
  const fetchItems = async () => {
    if (!token) return;
    try {
      const res = await fetch("http://localhost:5000/custom/", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      setItems(data || []);
    } catch (err) {
      console.error("Fetch items error:", err);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Prepare headers for Excel modification
  const headersexcel = items.map((item) => item.name).reverse();

  // Modify sample Excel headers
  const modifyExcel = async () => {
    const response = await fetch("/sampledata.xlsx");
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const sheetData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    sheetData[0] = headersexcel;
    const newSheet = XLSX.utils.aoa_to_sheet(sheetData);
    workbook.Sheets[sheetName] = newSheet;
    const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Sampledata.xlsx";
    a.click();
    URL.revokeObjectURL(url);
  };

  // File selection handler
  const handleFileChange = (e) => {
    if (e.target.files.length > 0) setFiles(Array.from(e.target.files));
  };

  // Upload to API
  const handleUploadToApi = async () => {
    if (!files.length) return toast.error("Please select at least one file!");

    setLoading(true);
    for (const file of files) {
      const ext = file.name.split(".").pop().toLowerCase();
      if (!["csv", "xls", "xlsx"].includes(ext)) {
        toast.error(`${file.name} is not a valid format`);
        continue;
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", name);

      try {
        const res = await fetch("http://localhost:5000/upload/", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        });

        if (res.ok) toast.success(`${file.name} uploaded successfully!`);
        else toast.error(`Failed to upload ${file.name}`);
      } catch (err) {
        console.error("Upload error:", err);
        toast.error(`Error uploading ${file.name}: ${err.message}`);
      }
    }
    setLoading(false);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Header />
      <div className={styles.app_layout}>
        <div className={styles.sidebar}>
          <SideBar />
        </div>
        <div className={`${styles.content} relative p-6 border rounded-lg shadow-lg bg-white`}>
          {loading && <LoadingOverlay />}
          <h2>{name || "Add List"}</h2>
          <button className={styles.backbtn} onClick={() => navigate("/list")}>
            ← Back
          </button>
          <ToastContainer />
          <hr style={{ border: "1px solid black", marginTop: 0 }} />

          <div className={styles.uploadBox}>
            <h3 className={styles.custom_heading}>
              This excel file uploaded here would be part of all profiles and associated with this list
            </h3>
            <div className={styles.parent}>
              <a onClick={modifyExcel} download className={styles.download}>
                <Button variant="contained" color="success">
                  Download Sample
                </Button>
              </a>
            </div>

            <label htmlFor="file-upload">
              <input
                id="file-upload"
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                style={{ display: "none" }}
                disabled={files.length > 0}
              />
              <Button
                variant="contained"
                color="primary"
                component="span"
                startIcon={<Upload />}
                sx={{
                  backgroundColor: "#c27edf",
                  "&:hover": { backgroundColor: "#a85cc2" },
                  padding: "10px 20px",
                  borderRadius: "8px",
                  margin: "0 40px"
                }}
                disabled={files.length > 0}
              >
                Select File
              </Button>
            </label>

            {files.length > 0 && (
              <div className={styles.my_text}>
                <p>Selected files:</p>
                <ul>
                  {files.map((file, i) => (
                    <li key={i}>
                      <strong>{file.name}</strong> ({(file.size / 1024).toFixed(2)} KB)
                    </li>
                  ))}
                </ul>
                <span style={{ display: "inline-flex", alignItems: "center", marginLeft: 20 }}>
                  <span>Remove the selected file</span>
                  <IconButton size="small" color="error" onClick={handleRemoveFile} sx={{ ml: 1 }}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </span>
              </div>
            )}
          </div>

          <Button
            variant="contained"
            color="secondary"
            startIcon={<SaveAllIcon />}
            onClick={handleUploadToApi}
            sx={{
              backgroundColor: "#c27edf",
              "&:hover": { backgroundColor: "#a85cc2" },
              padding: "10px 20px",
              borderRadius: "8px",
              marginTop: 10,
              marginLeft: "87%",
              display: "flex",
              justifyContent: "flex-end"
            }}
            disabled={!files.length}
          >
            Save
          </Button>

          <Dialog
            open={open}
            onClose={(e, reason) => reason !== "backdropClick" && handleClose()}
            maxWidth="sm"
            fullWidth
            BackdropProps={{
              style: { backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(10px)" }
            }}
          >
            <DialogTitle>List name</DialogTitle>
            <DialogContent dividers>
              <TextField
                autoFocus
                fullWidth
                margin="dense"
                label="Enter Your List Name"
                variant="outlined"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              {listnameExists && <p style={{ color: "red" }}>List name already exists. Please choose another.</p>}
            </DialogContent>
            <DialogActions>
              <Button variant="contained" onClick={handleClose} disabled={!name || listnameExists}>
                Next
              </Button>
              <Button onClick={() => navigate("/list")} color="inherit">
                Cancel
              </Button>
            </DialogActions>
          </Dialog>
        </div>
      </div>
      <Footer />
    </>
  );
};


/*import React, { useState } from "react";
import { Button } from "@mui/material";
import { Upload, Download ,Send,Save, SaveAllIcon } from "lucide-react";
import axios from "axios";
import IconButton from "@mui/material/IconButton";
import styles from  "../lists_segments/AddList.module.css";
import FrontendPage from "../rushikashhome/frontpage";
import "bootstrap/dist/css/bootstrap.min.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SideBar from "../sidebar/SideBar";
import Header from "../header/Header";
import Footer from "../footer/Footer";
import LoadingOverlay from "../loading/LoadingOverlay";
import CloseIcon from "@mui/icons-material/Close";
import Papa from "papaparse";
import * as XLSX from "xlsx";

export const AddList = () => {
  const [files, setFiles] = useState(null);
  const [loading,setLoading] =useState(false);

  const handleRemoveFile = () => {
    setFiles(null);
    document.getElementById("file-upload").value = ""; // clear input
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files)); // store as array
    }
  };
  console.log("Files ",files)

  const notify = () => {
    toast.success("✅ Notification shown!", { position: "top-right" });
  };

  // Handle file upload
  // const handleFileChange = (e) => {
  //   if (e.target.files && e.target.files.length > 0) {
  //     const uploadedFile = e.target.files[0];
  //     setFile(uploadedFile);

  //     // Create a blob URL so we can download later
  //     setFileUrl(URL.createObjectURL(uploadedFile));
  //   }
  // };
  const REQUIRED_HEADERS = [
    "first_name",
    "last_name",
    "email",
    "phone",
    "address_1",
    "address_2",
    "city",
    "state",
    "country"
  ];
  
  const handleUploadToApi = async () => {
    if (!files || files.length === 0) {
      alert("Please select at least one file!");
      return;
    }
  
    setLoading(true);
  
    for (const file of files) {
      const ext = file.name.split(".").pop().toLowerCase();
  
      if (!["csv", "xls", "xlsx"].includes(ext)) {
        toast.error(`❌ ${file.name} is not a valid format`, { position: "top-center" });
        continue;
      }
  
      let headers = [];
  
      try {
        if (ext === "csv") {
          // ✅ Parse only first row of CSV
          const text = await file.text();
          const parsed = Papa.parse(text, { header: true, preview: 1 });
          headers = parsed.meta.fields.map((h) => h.trim().toLowerCase());
        } else {
          // ✅ For XLSX/XLS use xlsx library
          const data = await file.arrayBuffer();
          const workbook = XLSX.read(data, { type: "array" });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const sheetData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
          headers = sheetData[0].map((h) => h.toString().trim().toLowerCase());
        }
        
        // ✅ Validate headers
        headers = headers.map(h => h.toString().trim().toLowerCase());
console.log("Normalized headers:", headers);

const normalizedRequired = REQUIRED_HEADERS.map(h => h.toLowerCase());
console.log("Normalized required:", normalizedRequired);

// Show what’s missing
const missing = normalizedRequired.filter(h => !headers.includes(h));
console.log("Missing headers:", missing);

// Show extras
const extra = headers.filter(h => !normalizedRequired.includes(h));
console.log("Extra headers:", extra);
        
        if (extra.length > 0) {
          toast.error(
            `❌ ${file.name} missing columns: ${missing.join(", ")}`,
            { position: "top-center" }
          );
          continue; // skip upload
        }
      } catch (err) {
        console.error("Header validation failed:", err);
        toast.error(`❌ Could not validate ${file.name}`, { position: "top-center" });
        continue;
      }
  
      // ✅ If headers are OK → proceed with upload
      const formData = new FormData();
      formData.append("file", file);
  
      try {
        const res = await fetch("http://localhost:5000/upload", {
          method: "POST",
          body: formData,
        });
  
        if (res.ok) {
          toast.success(`✅ ${file.name} uploaded successfully`, { position: "top-center" });
        } else {
          toast.error(`❌ Failed to upload ${file.name}`, { position: "top-center" });
        }
      } catch (error) {
        console.error("Upload error:", error);
        toast.error(`❌ Error uploading ${file.name}: ${error.message}`, { position: "top-center" });
      }
    }
  
    setLoading(false);
  };

  return (
    <>
  <Header/>
    <div className={styles.app_layout}>
    <div className={styles.sidebar}>
     < SideBar/>
     </div>
   
     
    
    <div className={`${styles.content}  relative p-6 border rounded-lg shadow-lg bg-white`}>
   
      {loading && <LoadingOverlay/>}
      {files ? <>{files.map((file, index) => (
        <h2 key={index}>
          {(file.name)} 
        </h2>
      ))}</> :<h2>Add List</h2>}
     
      <ToastContainer />
      <hr style={{ border: "1px solid black", marginTop: "0" }} />

     
 
<div className={styles.uploadBox}>
<h3 className={styles.custom_heading}>This excel file uploaded here would be part of all profiles and would be associated with this list</h3>


<a
  href="/sampledata.xlsx"
  download
  className={styles.download}
>
  <Button
    variant="contained"
    color="success"
    startIcon={<Download />}
  >
    Download Sample
  </Button>
</a>


    

   
      <label htmlFor="file-upload" >
        <input
          id="file-upload"
          type="file"
          accept=".xlsx, .xls,.csv"
          onChange={handleFileChange}
          style={{ display: "none" }}
          disabled={files}
         
        />
        <Button
          variant="contained"
          color="primary"
          component="span"
          sx={{
            backgroundColor: "#c27edf",
            "&:hover": {
              backgroundColor: "#a85cc2"
            },
            padding: "10px 20px",
            borderRadius: "8px",
            marginRight:"40px",
            marginLeft:"40px"
          }}
          disabled={files}
          startIcon={<Upload />}
        >
          Select File
        </Button>
      </label>
          
      

      
      {files ?files.length > 0 && (
  <div className={styles.my_text}>
    <p>Selected files:</p>
    <ul style={{}}>
      {files.map((file, index) => (
        <li key={index}>
          <strong>{file.name}</strong> ({(file.size / 1024).toFixed(2)} KB)
        </li>
      ))}
    </ul>
  
  </div>
  
):<></>}

{files && (
        <span style={{ display: "inline-flex", alignItems: "center",marginLeft:"20px" }}>
          <span>Remove the seleted file</span>
          <IconButton
            size="small"
            color="error"
            onClick={handleRemoveFile}
            sx={{ ml: 1 ,}}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
         
        </span>
      )}

            
            </div>


            
          <Button
            variant="contained"
            color="secondary"
            startIcon={<SaveAllIcon />}
            onClick={handleUploadToApi}
            sx={{
                backgroundColor: "#c27edf",
                "&:hover": {
                  backgroundColor: "#a85cc2"
                },
                padding: "10px 20px",
                borderRadius: "8px",
                marginTop:"10px",
                marginLeft:"87%",
                marginRight:"0px",
                display:"flex",
                justifyContent:"flex-end",

                
                
              }}
              disabled={!files}
            
            className={styles.selectbtn}
          >
            Save
          </Button>
        

   

    </div>
    </div>
  <Footer/>
    </>
  );
};
*/