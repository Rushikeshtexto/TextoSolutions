import React from "react";
import styles from "./displayrange.module.css"; // create separate CSS for styling

const DisplayRange = ({ currentPage, entriesPerPage, totalItems }) => {
  const getDisplayRange = () => {
    if (totalItems === 0) {
      return "0 - 0 of 0";
    }
    const start = (currentPage - 1) * entriesPerPage + 1;
    const end = Math.min(currentPage * entriesPerPage, totalItems);
    return `${start} - ${end} of ${totalItems}`;
  };

  return <div className={styles.displayRange}>{getDisplayRange()}</div>;
};

export default DisplayRange;