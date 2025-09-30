import React, { useState ,useEffect } from "react";
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
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from "@mui/material";
import { useNavigate } from "react-router-dom";




export const AddList = () => {
  // const [file, setFile] = useState(null);
  const [files, setFiles] = useState(null);
  const [loading,setLoading] =useState(false);
  const [open, setOpen] = useState(true);   // show dialog on page load
  const [step, setStep] = useState(1);      // step 1: name, step 2: upload
  const [name, setName] = useState("");
  const [file, setFile] = useState(null);
    const [items, setItems] = useState([]);
  const [listnameExists, setListnameExists] = useState(false);
  const handleRemoveFile = () => {
    setFiles(null);
    document.getElementById("file-upload").value = ""; // clear input
  };





      
    const searchname = async () => {
      try {
        const res = await fetch(`http://localhost:5000/listname`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ name })
        });
        const data = await res.json();
        console.log("List name response:", data);
        setListnameExists(data)
  
      //   if(data && data.length > 0){  
      //     toast.error("Name of the List Already exists", { position: "top-center" });
      //   }
        
        
        
      } catch (err) {
        console.error("Error checking list name:", err);
        return [];
      }
    }
    useEffect(() => {
      searchname();
      setName(name);
    },[name]);
  
// useEffect(() => {
//   const stored = localStorage.getItem("listname");
//   if (stored) {
//     setName(JSON.parse(stored));
//   }
// }, []);

  const navigate = useNavigate();
  const handleClose = () => {
    setOpen(false);
    setStep(1);
    
  };
  // setName(localStorage.getItem("listname") ? JSON.parse(localStorage.getItem("listname")).name : "");
  console.log("Name ",name);
  const token = localStorage.getItem("token");  
  console.log("Token in add list:", token);
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
    "firstname",
    "lastname",
    "email",
    "phone",
    "address1",
    "address2",
    "city",
    "state",
    "country"
  ];

let headersexcel =[];

if (items && items.length > 0) {
  items.forEach(item => {
    headersexcel.push(item.name);
  });
}
console.log("Headers ",headersexcel.reverse())
 
async function modifyExcel() {
  // Load from public folder
  const response = await fetch("/sampledata.xlsx");
  const arrayBuffer = await response.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: "array" });

  // Get first sheet
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  // Convert to array of arrays
  const sheetData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  // Replace headers (first row)
  sheetData[0] = headersexcel; // <-- your custom headers

  // Convert back to worksheet
  const newSheet = XLSX.utils.aoa_to_sheet(sheetData);

  // Replace the old sheet with new one
  workbook.Sheets[sheetName] = newSheet;

  // Write workbook to binary
  const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });

  // Trigger download in browser
  const blob = new Blob([wbout], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "Sampledata.xlsx";
  a.click();
  URL.revokeObjectURL(url);
}




  const fetchItems = async () => {
        try {
          
          const res = await fetch(`http://localhost:5000/custom/`,
            {method: 'GET', headers: { 'Content-Type': 'application/json' ,
            Authorization:` Bearer ${localStorage.getItem("token")}`
            }}
          );
          const data = await res.json();
         
          setItems(data || []);          // ✅ update items
          console.log("Items ",data);
          
        } catch (err) {
          console.error("Fetch error:", err);
      
        }
      };
    
      useEffect(() => {
        fetchItems();
       
      },[]);
      
  
  const handleUploadToApi = async () => {
    if (!files || files.length === 0) {
        toast.error(`Please select the file`, { position: "top-center" });
      return;
    }
  
    setLoading(true);
  let sheetData;
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
          console.log("Sheet name :",workbook.SheetNames[0])
          const sheetname = workbook.SheetNames[0]
          const sheet = workbook.Sheets[sheetname];
          const sheetData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
          console.log("Sheet Data :",sheetname)
          
          headers = sheetData[0].map((h) => h.toString().trim().toLowerCase());
          
        }
        
        // ✅ Validate headers
        headers = headers.map(h => h.toString().trim().toLowerCase().replace(/\s+/g, ""));
console.log("Normalized headers:", headers);

const normalizedRequired = headersexcel.map(h => h.toLowerCase());
console.log("Normalized required:", normalizedRequired);

// Show what’s missing
const missing = normalizedRequired.filter(h => !headers.includes(h));
console.log("Missing headers:", missing);

// Show extras
const extra = headers.filter(h => !normalizedRequired.includes(h));
console.log("Extra headers:", extra);
        
        // if (extra.length > 0) {
        //   toast.error(
        //     `❌ ${file.name} missing columns: ${missing.join(", ")}`,
        //     { position: "top-center" }
        //   );
        //   continue; // skip upload
        // }




      } catch (err) {
        console.error("Header validation failed:", err);
        toast.error(`❌ Could not validate ${file.name}`, { position: "top-center" });
        continue;
        setLoading(false);
      }
      

// Convert back to objects using new headers
// const formattedData = XLSX.utils.sheet_to_json(
//   XLSX.utils.aoa_to_sheet(sheetData),
//   { header: REQUIRED_HEADERS }
// );
  const token = localStorage.getItem("token"); 
      // ✅ If headers are OK → proceed with upload
      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", name);
  
      try {
        const res = await fetch("http://localhost:5000/upload", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}` // include token in headers
          },
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
      {name ? <>{<h2>{name}</h2>}</> :<h2>Add List</h2>}  
         <button className={styles.backbtn} onClick={() => navigate("/list")}>
              ← Back
            </button>
     
      <ToastContainer />
      <hr style={{ border: "1px solid black", marginTop: "0" }} />

     
 
<div className={styles.uploadBox}>
<h3 className={styles.custom_heading}>This excel file uploaded here would be part of all profiles and would be associated with this list</h3>

<div className={styles.parent}>
<a
 
  onClick={()=> {modifyExcel()}}
  download
  className={styles.download}
>
  <Button
    variant="contained"
    color="success"
   
  >
    Download Sample
  </Button>
</a>
</div>

    

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
        
    {/*  Dialog section   */}


    <Dialog open={open} onClose={(event, reason) => {
        if (reason !== "backdropClick") {
          handleClose();
        }
      }} maxWidth="sm" fullWidth  BackdropProps={{
        style: {
           backgroundColor: "rgba(0, 0, 0, 0.5)", // semi-transparent black
      backdropFilter: "blur(10px)",           // blur effect
        },
      }}>
          <DialogTitle>
            { "List name" }
          </DialogTitle>
    
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
          
    {(listnameExists && listnameExists.length>0) && (
      <p style={{ color: 'red' }}>List name already exists. Please choose a different name.</p>
    )}
            
          </DialogContent>
    
          <DialogActions>
            
              <Button
                variant="contained"
                onClick={() =>handleClose() }
    disabled={!name || (listnameExists && listnameExists.length>0)}
              >
                Next
              </Button>
        
    
    
            <Button onClick={() => {navigate("/list") }} color="inherit">
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
   

    </div>
    </div>
  <Footer/>
    </>
  );
};

