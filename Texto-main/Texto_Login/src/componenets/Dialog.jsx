import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";

export default function NestedDialogExample() {
  const [open, setOpen] = useState(false);
  const [innerOpen, setInnerOpen] = useState(false);
  const [name, setName] = useState("");
  const [file, setFile] = useState(null);

  // Open/Close main dialog
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // Open/Close inner dialog
  const handleInnerOpen = () => setInnerOpen(true);
  const handleInnerClose = () => setInnerOpen(false);

  // Handle file upload
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  // Handle submit to backend
  const handleSubmit = async () => {
    if (!file) return alert("Upload a file first!");

    const formData = new FormData();
    // formData.append("name", name);
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });
      if (res.ok) alert("Uploaded successfully!");
      else alert("Upload failed");
    } catch (err) {
      console.error(err);
      alert("Error uploading");
    }
  };

  // Handle download (client-side)
  const handleDownload = () => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <Button variant="contained" style={{height:"44px",marginTop:"10px"}} onClick={handleOpen}>
        add List
      </Button>

      {/* Main Dialog */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Main Dialog</DialogTitle>
        <DialogContent>
          {/* <TextField
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            margin="normal"
          /> */}

          <input
            type="file"
            accept=".xlsx, .xls,.csv"
            onChange={handleFileChange}
            style={{ marginTop: "16px" }}
          />

          {file && (
            <div style={{ marginTop: "8px" }}>
              <Button variant="outlined" onClick={handleDownload}>
                Download Uploaded File
              </Button>
            </div>
          )}

          {/* <div style={{ marginTop: "16px" }}>
            <Button variant="contained" onClick={handleInnerOpen}>
              Open Inner Dialog
            </Button>
          </div> */}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Inner Dialog */}
      <Dialog open={innerOpen} onClose={handleInnerClose}>
        <DialogTitle>Inner Dialog</DialogTitle>
        <DialogContent>
          <p>This is a nested dialog inside the main dialog.</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleInnerClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
