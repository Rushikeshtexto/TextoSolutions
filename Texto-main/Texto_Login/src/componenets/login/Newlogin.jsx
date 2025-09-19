import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import LoadingOverlay from "../loading/LoadingOverlay";
import "bootstrap/dist/css/bootstrap.min.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [emailExists, setEmailExists] = useState(null); // null = not checked yet
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

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
        setLoading(false);
        if (data.token) {
          localStorage.setItem("token", data.token);
          navigate("/home");
        } else {
          setError(data.message || "Login failed ❌");
        }
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,4}$/.test(email);

  useEffect(() => {
    if (!email || !isValidEmail(email)) {
      setEmailExists(null);
      return;
    }

    fetch("http://localhost:5000/users/getuser", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })
      .then((res) => res.json())
      .then((json) => setEmailExists(json.exists))
      .catch((err) => {
        setEmailExists(false);
        setError("⚠️ " + err.message);
      });
  }, [email]);

  return (
    <div className="d-flex flex-column min-vh-100">
      {loading && <LoadingOverlay />}

      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
        <div className="container">
          <Link className="navbar-brand" to="/">
            <img
              src="./src/assets/Media.jpg"
              alt="Logo"
              style={{ maxWidth: "50px", borderRadius: "10px" }}
            />{" "}
            Texto
          </Link>
          <div className="ms-auto d-flex align-items-center">
            <Link to="/signup" className="btn btn-primary me-2">
              Signup
            </Link>
          </div>
        </div>
      </nav>

      {/* Banner */}
      <div className="bg-light text-center py-5 mt-4">
        <h2>Log in to your account</h2>
        {error && <p className="text-danger">{error}</p>}
      </div>

      {/* Login Form */}
      <div className="container my-5">
        <div className="row justify-content-center">
          <div className="col-md-5">
            <form
              className="border p-4 rounded shadow-sm"
              onSubmit={handleSubmit}
              noValidate
            >
              {/* Email Input */}
              <div className="mb-3">
                <label htmlFor="email-field" className="form-label">
                  Email address
                </label>
                <input
                  type="email"
                  className={`form-control ${
                    emailExists === true
                      ? "is-valid"
                      : emailExists === false
                      ? "is-invalid"
                      : ""
                  }`}
                  id="email-field"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                {emailExists === false && (
                  <div className="invalid-feedback">
                    Email not found in our database
                  </div>
                )}
                {emailExists === true && (
                  <div className="valid-feedback">Email exists ✅</div>
                )}
              </div>

              {/* Password Input (only show if email exists) */}
              {emailExists && (
                <div className="mb-3">
                  <label htmlFor="pass-field" className="form-label">
                    Password
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="pass-field"
                    value={pass}
                    onChange={(e) => setPass(e.target.value)}
                    required
                  />
                </div>
              )}

              {/* Remember / Forgot */}
              {emailExists && (
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="remember"
                    />
                    <label className="form-check-label" htmlFor="remember">
                      Remember me
                    </label>
                  </div>
                  <Link to="#" className="small">
                    Forgot password?
                  </Link>
                </div>
              )}

              {/* Submit */}
              {emailExists && (
                <button type="submit" className="btn btn-success w-100 mb-3">
                  Login
                </button>
              )}

              {/* Google Login */}
              <div className="text-center">
                <GoogleLogin
                  onSuccess={(credentialResponse) => {
                    console.log(credentialResponse);
                    navigate("/home");
                  }}
                  onError={() => console.log("Login failed")}
                />
              </div>

              <p className="text-center mt-3">
                Don’t have an account? <Link to="/signup">Signup</Link>
              </p>
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-light text-center py-3 mt-auto shadow-sm">
        <div className="container d-flex justify-content-center align-items-center gap-3">
          <img
            src="./src/assets/Media.jpg"
            alt="Logo"
            style={{ maxWidth: "30px", borderRadius: "5px" }}
          />
          <span>Texto</span>
        </div>
        <small className="text-muted d-block mt-2">
          Privacy | Security | Cookies | Terms | DLT
        </small>
      </footer>
    </div>
  );
};

export default Login;
