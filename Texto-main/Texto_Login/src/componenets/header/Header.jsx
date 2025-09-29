import React,{useState,useEffect,useRef} from 'react'
import { Link } from 'react-router-dom'
import styles from './Header.module.css'
import MediaImg from "../../assets/newtexto.jpg"; // <- fixed path


const Header = () => {

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    window.location.href = "./"; // redirect to signup/login
  };

  // ✅ Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className={styles.app}>
    {/* Navbar */}
    <header className={styles.navbar}>
      <div className={styles.logo}>  <img className={styles.logo_img} src={MediaImg}></img> Texto</div>
      <nav>
        <a href="#">About Us</a>
        <a href="#">Contact Us</a>
        <div className={styles.profileWrapper} ref={dropdownRef}>
            <div
              className={styles.profileCircle}
              onClick={() => setOpen(!open)}
            >
              U
            </div>

            {/* Dropdown */}
            {open && (
              <div className={styles.dropdown}>
                <button onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
      </nav>

        </header>
</div>
  )
}

export default Header