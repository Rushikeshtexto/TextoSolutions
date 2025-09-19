import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
// import "./Login.css";
import styles from "./Login.module.css"
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import LoadingOverlay from "../loading/LoadingOverlay";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


const Login = () => {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [emailExists, setEmailExists] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

   const navigate = useNavigate();




  //  const handleGoogleLogin = () => {
  //   // Hit backend /auth/google → redirects to Google → comes back
  //   window.location.href = "http://localhost:5000/auth/google";
  // };
const notify = () => {
    toast.success("✅ Login Successesful", { position: "top" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    fetch("http://localhost:5000/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: pass }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.token) {
          // alert("Login Successful ✅");
          toast.success("✅ Login Successful", { position: "top-center" });
          console.log(data.token);
          localStorage.setItem("token", data.token);
          setLoading(true);
          navigate('/home');
        } else {
          // alert(data.message || "Login Failed ❌");
          toast.error(data.message || "❌ Login Failed", { position: "top-center" });
        }
      })
      .catch((err) => console.error(err));
      
  };
  
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,4}$/.test(email);

useEffect(() => {
  if (!email || !isValidEmail(email)){
    return 
  } ;
    if (!email) {
      setEmailExists(false);

      setError("");
      return;
    }

    // Call API when email changes
    fetch("http://localhost:5000/users/getuser", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Server error: " + res.status);
        console.log("fetch is working")
        return res.json();
      })
      .then((json) => {
        if (json && json.exists) {  // assume API returns { exists: true/false }
          setEmailExists(true);
          setError("");
          // alert("Your Email is There")
        } else {
          setEmailExists(false);
          setError("❌ Email not found in database");
          // alert("❌Email not found");
          toast.error( "❌ Email not found", { position: "top-center" });

        }
      })
      .catch((err) => {
        setEmailExists(false);
        setError("⚠️ " + err.message);
      });
      console.log(emailExists)
      console.log("useeffect is working")
      
  }, [email]);

  var emailField = document.getElementById(styles.email_field);
  var emailLabel = document.getElementById(styles.email_label);
  var emailError = document.getElementById(styles.email_error);

    function emailValidate(){

      
      if (emailField.value.trim() !== "") {
        emailLabel.classList.add(styles.active);   // move label up
        emailField.classList.add(styles.active);
        
      } else {
        emailLabel.classList.remove(styles.active); // move label back
        emailField.classList.remove(styles.active);
      }
      if(emailField.value ==""){
        emailError.innerHTML = "Please enter your email"
        emailField.classList.add(styles.active);
        emailLabel.style.color = "red";
    }else{
      emailField.classList.remove(styles.active);
        emailLabel.style.color = "black";
        emailError.innerHTML = ""
    }
    if(emailExists){
      emailError.innerHTML = "";
      emailField.classList.remove(styles.active);
      emailField.classList.add(styles.verify);
    
    }
    }

    
    var passField = document.getElementById(styles.pass_field);
    var passLabel = document.getElementById(styles.pass_label);
    var passError = document.getElementById(styles.pass_error);
  
    function passvalidation(){
      
      if (passField.value.trim() !== "") {
        passLabel.classList.add(styles.active);   // move label up
        passField.classList.add(styles.active);
        
      } else {
        passLabel.classList.remove(styles.active); // move label back
        passField.classList.remove(styles.active);
      }
      
      if(passField.value.trim() ==""){
        passError.innerHTML = "Please enter your password"
        passField.classList.add(styles.active);
        passLabel.style.color = "red";
    }else{
      passField.classList.remove(styles.active);
        passLabel.style.color = "black";
        passError.innerHTML = ""

    }
  }


  return (
   

    <div className={styles.app}>
      {loading && <LoadingOverlay />}
    {/* Navbar */}
    <ToastContainer />
    <header className={styles.navbar}>
          <div className={styles.logo}>  <img className={styles.logo_img} src="./src/assets/Media.jpg"></img>  </div>
      <nav>
        <a href="#">About Us</a>
        <a href="#">Contact Us</a>
        
      </nav>

      <Link to="/signup" className={styles.signbtn}>Signup</Link>    </header>

   

  

    {/* Login Form */}
    <div className={styles.main_content}>
       {/* Login Banner */}
    <section className={styles.banner}>
      <h2>Log in to your account</h2>
    </section>
    
    <div className={styles.login_container}>
    <form onSubmit={handleSubmit} className={styles.login_form}>
      
      <label id={styles.email_label}>Enter Your Email</label>
      <input type="text" value={email} placeholder="" onChange={(e)=>setEmail(e.target.value)}   required id={styles.email_field} onKeyUp={emailValidate} />
  <span id={styles.email_error}></span>
  
  {email ? emailExists ? <label id={styles.pass_label}>Enter Your Password</label>: <p></p>:<p></p>}
      {email ? emailExists ? <input type="password" value={pass} onChange={(e) => {setPass(e.target.value)}} placeholder="" id={styles.pass_field}  onKeyUp={passvalidation} /> : <p></p>:<p></p>}
      {email ? emailExists ?<span id={styles.pass_error}></span>: <p></p>:<p></p>}
     
      {/* <div className="captcha">
        <input type="checkbox" />
        <span>I’m not a robot (captcha here)</span>
      </div> */}

      {emailExists?<div  className={styles.remember}>
        <input type="checkbox" />
        <label>Remember me</label>
      </div>:<p></p>}

     {emailExists? <button  type="submit" className={styles.login_btn}>Login</button>:<p></p>}
     {emailExists?<div className={styles.form_linnks}>
        <a href="#">Forgot Password?</a> |{" "}
        <span>
          Don’t have an account? <a href="/signup">Signup</a>
        </span>
      </div>:<p></p>}
      {/* <button
        onClick={handleGoogleLogin}
        


        className="login-form google"
      >
        G
      </button> */}
      <GoogleLogin className='google' onSuccess={(credentialResponse)=>{
        console.log(credentialResponse)
        console.log(jwtDecode(credentialResponse.credential))
        navigate('/home')
      }}  onError={()=>{
        console.log("Login failed")
      }}/>
      
    </form>
   
      </div>
      </div>
    {/* Footer */}
    <footer className={styles.footer}>
      
      <div className={styles.footer_logo}>
         <img className={styles.logo_img} src="./src/assets/Media.jpg"></img>  Texto</div>
      <div className={styles.footer_grid}>
        <table>
          {/* <tr>
            <td ><h4>Company</h4></td>
            <td><a href="#">About</a></td>
            <td><a href="#">Press & Media</a></td>
            <td><a href="#">Customers</a></td>
            <td><a href="#">Contact</a></td>
          </tr>
        
          <tr>
            <td ><h4>Docs</h4></td>
            <td><a href="#">API</a></td>
            <td><a href="#">Help Document</a></td>
            <td><a href="#">Forum</a></td>
            
          </tr> */}
          <thead>
            <tr>
            <th></th>
            </tr>
            
          </thead>
          <tbody>
          <tr>
            <td ><h4>Follow us</h4></td>
            <td><a  href="#"><img className={styles.social} src="./src/assets/linkedinlogo.jpg"></img></a></td>
            <td><a href="#"><img className={styles.social} src="./src/assets/twitterlogo.png"></img></a></td>
            <td><a href="#"><img className={styles.social} src="./src/assets/facebooklogo.png"></img></a></td>
            <td><a href="#"><img className={styles.social} src="./src/assets/instagramlogo.jpg"></img></a></td>
            <td><a href="#"><img className={styles.social} src="./src/assets/youtubelogo.png"></img></a></td>
            
          </tr>
          </tbody>
        
        </table>
      </div>

      <div className={styles.footer_bottom}>
        <p className={styles.legal}>
          Privacy | Security | Cookies | Terms | DLT
        </p>
        {/* <p>© 2022 Gupshup. All rights reserved.</p> */}
      </div>
    </footer>
  </div>


  );
};

export default Login;
