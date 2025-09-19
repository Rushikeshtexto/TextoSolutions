import { useEffect, useState } from 'react'
import React from 'react'
import Header from '../header/Header'
import axios from 'axios'



const Profiles = () => {


    const [data, setData] = useState([]);
    // Fetch inserted data

    useEffect(() => {
        const fetchData = async () => {
          try {
            const res = await axios.get("http://localhost:5000/data");
            setData(res.data);
          } catch (err) {
            console.error("Error fetching data:", err);
          }
        };
    
        fetchData();
      }, );
    
  return (
    <><Header/>
    <div>
        
    <h3>Data from SQL</h3>
      <table  border="1">
        <thead>
          <tr>
            <th>ID</th><th>Name</th><th>Email</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              <td style={{ margin: "5px", padding: "10px", backgroundColor: "lightgray" }}>{row.id}</td>
              <td style= {{ margin: "5px", padding: "10px", backgroundColor: "lightgray" }}>{row.name}</td>
              <td style={{ margin: "5px", padding: "10px", backgroundColor: "lightgray" }}>{row.email}</td>
            </tr>
          ))}
        </tbody>
      </table>



    </div>
    
    </>
  )
}

export default Profiles