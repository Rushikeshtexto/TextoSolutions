import React, { useState } from "react";
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
      {/* Download Button in Top Right */}
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


    

      {/* Upload Button */}
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
          
      

      {/* Show uploaded file name */}
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