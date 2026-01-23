import { useState, useRef } from "react";
import "./register.css";
import api from "../../api/apihandler";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
import { GoogleLogin } from "@react-oauth/google";

import registerImg from "../../assets/registerImg.jpg";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";


const DEFAULT_AVATAR =
  "https://cdn-icons-png.flaticon.com/512/847/847969.png";

function Register() {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [status, setStatus] = useState();
  const calling = useRef(null);

  const [loading, setLoading] = useState(false);
  const [img, setImg] = useState(null);

  const [formData, setFormData] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const LIMITS = {
    name: 30,
    username: 30,
    email: 50,
    password: 18,
    confirmPassword: 18,
  };

  const USERNAME_REGEX = /^[a-z0-9._]*$/;

  const handleChange = (e) => {
    const { id, value } = e.target;

    if (LIMITS[id] && value.length > LIMITS[id]) return;

    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));

    if (id === "username" && !USERNAME_REGEX.test(value)) {
      setStatus("❌ Only a-z, 0-9, . and _ are allowed");
      clearTimeout(calling.current);
      return;
    }

    if (id === "username" && value.length >= 1) {
      if (calling.current) clearTimeout(calling.current);

      calling.current = setTimeout(() => {
        checkUsername(value);
      }, 1000);
    }
  };

  const checkUsername = async (username) => {
    try {
      await api.get(`/api/v1/users/checkUsername?username=${username}`);
      setStatus("✅ Username available");
    } catch {
      setStatus("❌ Username already exists");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setImg(file);
  };

  const removeImage = () => {
    setImg(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      return toast.error("Passwords do not match");
    }

    try {
      setLoading(true);
      const data = new FormData();

      data.append("username", formData.username);
      data.append("name", formData.name);
      data.append("email", formData.email);
      data.append("password", formData.password);
      if (img) data.append("img", img);

      await api.post("/api/v1/users/register", data, {
        withCredentials: true,
      });

      toast.success("Account created successfully");
      navigate("/login");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      {/* LEFT FORM */}
      <div className="register-container">
        <form className="register-card" onSubmit={handleSubmit}>
          {formData.username && (
            <h2 className="profile-username">@{formData.username}</h2>
          )}

          {/* Avatar */}
          <div className="avatar-wrapper">
            <img
              src={img ? URL.createObjectURL(img) : DEFAULT_AVATAR}
              alt="avatar"
              className="avatar-img"
            />

            {img && (
              <button
                type="button"
                className="avatar-remove"
                onClick={removeImage}
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            )}
          </div>

          <button
            type="button"
            className="change-photo-btn"
            onClick={() => fileRef.current.click()}
          >
            Change Photo
          </button>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleImageChange}
          />

          {/* Inputs */}
          <div className="input-group">
            <input
              id="name"
              maxLength={30}
              placeholder="Full Name"
              onChange={handleChange}
              required
            />

            <input
              id="username"
              maxLength={30}
              placeholder="Username"
              onChange={handleChange}
              required
            />

            <span className="username-status">
              {formData.username.length > 0 ? status : null}
            </span>

            <input
              id="email"
              maxLength={50}
              placeholder="Email"
              onChange={handleChange}
              required
            />

            <input
              type="password"
              id="password"
              maxLength={18}
              placeholder="Password"
              onChange={handleChange}
              required
            />

            <input
              type="password"
              id="confirmPassword"
              maxLength={18}
              placeholder="Confirm Password"
              onChange={handleChange}
              required
            />
          </div>

          <button
            className="register-btn"
            disabled={loading}
          >
            {loading ? "Creating..." : "Register"}
          </button>

          <div className="divider">
            <span>Or register with</span>
          </div>

          {/* GOOGLE REGISTER / LOGIN */}
          <div className="social-login">
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                try {
                  await api.post(
                    "/api/v1/users/googleAuth",
                    { token: credentialResponse.credential },
                    { withCredentials: true }
                  );
                  toast.success("Logged in with Google");
                  navigate("/");
                } catch {
                  toast.error("Google authentication failed");
                }
              }}
              onError={() => toast.error("Google authentication failed")}
            />
          </div>

          <p className="login-link">
            Already have an account?{" "}
            <span onClick={() => navigate("/login")}>Log in</span>
          </p>
        </form>
      </div>

      {/* RIGHT IMAGE */}
      <div className="register-illustration">
        <img src={registerImg} alt="Register illustration" />
      </div>
    </div>
  );
}

export default Register;
