import React, { useState } from "react";
import styles from "./ExpandableCell.module.css"; // adjust path
 
const ExpandableCell = ({ value }) => {
  const [expanded, setExpanded] = useState(false);
 
  return (
    <td
      className={expanded ? styles.expandedCell : styles.tableCell}
      onClick={() => setExpanded(!expanded)}
      title={!expanded ? value : ""} // tooltip for hover
    >
      {value}
    </td>
  );
};
 
export default ExpandableCell;