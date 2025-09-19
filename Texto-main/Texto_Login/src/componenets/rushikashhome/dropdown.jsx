// Dropdown.jsx
import React from "react";
import styles from "./dropdown.module.css";

const Dropdown = ({ entriesPerPage, onItemsPerPageChange }) => {
  return (
    <div className={styles.perpage}>
      <label>Items per page: </label>
      <select value={entriesPerPage} onChange={onItemsPerPageChange}>
        <option value={10}>10</option>
        <option value={25}>25</option>
        <option value={50}>50</option>
        <option value={100}>100</option>
      </select>
    </div>
  );
};

export default Dropdown;