import React, { useState, useEffect } from "react";
import styles from "./pagination.module.css"; // optional if you want to style separately

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const [pageInput, setPageInput] = useState(currentPage);

  useEffect(() => {
    setPageInput(currentPage); // keep input synced with currentPage
  }, [currentPage]);

  return (
    <div className={styles.pagination}>
      <button
        disabled={currentPage === 1}
        className={`${styles.pageBtn} ${currentPage === 1 ? styles.disabled : ""}`}
        onClick={() => onPageChange(1)}
      >
        {"<<"}
      </button>

      <button
        disabled={currentPage === 1}
         className={`${styles.pageBtn} ${currentPage === 1 ? styles.disabled : ""}`}
        onClick={() => onPageChange(currentPage - 1)}
      >
        {"<"}
      </button>

      <input
        className={styles.searchpagination}
        type="number"
        min="1"
        max={totalPages}
        value={pageInput}
        onChange={(e) => setPageInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            let page = Number(pageInput);
            if (page >= 1 && page <= totalPages) {
              onPageChange(page); // tell parent to update page
            } else {
              alert(`Page must be between 1 and ${totalPages}`);
              setPageInput(currentPage);
            }
          }
        }}
      />

      <button
        disabled={currentPage === totalPages}
        className={`${styles.pageBtn} ${currentPage === totalPages ? styles.disabled : ""}`}
        onClick={() => onPageChange(currentPage + 1)}
      >
        {">"}
      </button>

      <button
        disabled={currentPage === totalPages}
        className={`${styles.pageBtn} ${currentPage === totalPages ? styles.disabled : ""}`}
        onClick={() => onPageChange(totalPages)}
      >
        {">>"}
      </button>
    </div>
  );
};

export default Pagination;