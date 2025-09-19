import React, { useState } from "react";
import styles from  "./Signup.module.css"; // import css
import { Link, Navigate } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { ToastContainer, toast } from "react-toastify";


const Signup = () => {
  // const [name, setName] = useState("");
  // const [email, setEmail] = useState("");
  // const [phone, setPhone] = useState("");
  // const [location, setLocation] = useState("");
  // const [password, setPassword] = useState("");

  const navigate = useNavigate();


  // const handleSubmit = (e) => {
  //   e.preventDefault();

  //   fetch("http://localhost:5000/users", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({ name, email, phone, location, password }),
  //   })
  //     .then((res) => res.json())
  //     .then((data) => {
  //       if (data.id) {
  //         alert("Signup Successful ✅, please login.");
  //         navigate("/")
  //       } else {
  //         alert(data.message || "Signup Failed ❌");
  //       }
  //     })
  //     .catch((err) => console.error(err));
  // };

  
  const validationSchema = Yup.object({
    name: Yup.string()
      .min(3, "Full name must be at least 3 characters")
      .required("Full name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .matches(/[A-Z]/, "Must contain 1 uppercase")
      .matches(/[0-9]/, "Must contain 1 number")
      .required("Password is required"),
    phone: Yup.string()
      .matches(/^\d{10}$/, "Phone must be 10 digits")
      .required("Phone number is required"),
      location:Yup.string()
      .required("Location is required"),
  });

  return (
    <div className={styles.app} >
          <header className={styles.navbar}>
            <div className={styles.logo}><img className={styles.logo_img} src="./src/assets/Media.jpg"></img>Texto</div>
            <nav>
              <a href="#">About Us</a>
              <a href="#">Contact Us</a>
              
            </nav>
      
            <Link to="/" className={styles.signbtn}>Login</Link>    </header>
            <section className={styles.banner}>
      <h2>Sign Up to Create Account</h2>
    </section>

    
    <div className={styles.signup_container}>
      <div className={styles.signup_box}>
        <h2 className={styles.signup_title}>Sign Up</h2>
        <Formik
      initialValues={{ name: "", email: "", password: "", phone: "",location:"" }}
      validationSchema={validationSchema}
      onSubmit={async (values, { resetForm }) => {
        try {
          console.log(values)
          // ✅ Send form values with fetch
          const res = await fetch("http://localhost:5000/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(values), // Formik values
          });

          if (!res.ok) throw new Error("Signup failed");

          const data = await res.json();
          // alert("✅ Signup successful!");
          toast.success("✅ Signup successful!", { position: "top-center" });
          
          console.log("Server response:", data);
          navigate("/")
          resetForm(); // clear form after success
        } catch (err) {
          // alert("❌ " + err.message);
          toast.error(`❌ Error ${err.message}`, { position: "top-center" });

        }
      }}>{()=>(
        <Form  className={styles.signup_form}>
          
          <Field
          type="text"
          name="name"
          placeholder="Full Name"
          
          className={styles.signup_input}
          required
        />
        <ErrorMessage name="name" component="p" style={{ color: "red" }} />

          
        
        <Field
          type="email"
          name="email"
          placeholder="Email Address"
          
          className={styles.signup_input}
          required
        />   
         <ErrorMessage name="email" component="p" style={{ color: "red" }} />
        <Field
          type="tel"
          name="phone"
          placeholder="Phone Number"
          
          className={styles.signup_input}
          required
        />
        <ErrorMessage name="phone" component="p" style={{ color: "red" }} />
        <Field
          type="text"
          placeholder="Location"
          name="location"
          
          className={styles.signup_input}
        />
       <ErrorMessage name="location" component="p" style={{ color: "red" }} />
        <Field
          type="password"
          placeholder="Password"
          name="password"
          
          className={styles.signup_input}
          required
        />
         <ErrorMessage name="password" component="p" style={{ color: "red" }} />

        <button type="submit" className={styles.signup_btn}>
          Sign Up
        </button>
      </Form>

      )}
      </Formik>
        
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
            <td><a href="#"><img className={styles.social}  src="./src/assets/twitterlogo.png"></img></a></td>
            <td><a href="#"><img className={styles.social}  src="./src/assets/facebooklogo.png"></img></a></td>
            <td><a href="#"><img className={styles.social}  src="./src/assets/instagramlogo.jpg"></img></a></td>
            <td><a href="#"><img className={styles.social}  src="./src/assets/youtubelogo.png"></img></a></td>
            
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

export default Signup;
