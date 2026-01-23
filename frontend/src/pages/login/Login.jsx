import { useContext, useState } from "react";
import "./login.css";
import { AuthContext } from "../../components/context/AuthContext";
import { useLocation, useNavigate } from "react-router";
import api from "../../api/apihandler.js";
import { toast } from "react-toastify";
import { GoogleLogin } from "@react-oauth/google";
import loginImg from "../../../src/assets/login.jpg"
function Login() {
  const location = useLocation();
  const backto = location?.state?.lastpage;
  console.log(backto)

  const [Credential, setCredential] = useState({
    username: undefined,
    password: undefined,
  });

  const navigate = useNavigate();
  const { loading, error, dispatch } = useContext(AuthContext);

  const handleChange = (e) => {
    setCredential((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }));
  };

  const handleClick = async (e) => {
    e.preventDefault();
    dispatch({ type: "START" });

    try {
      const res = await api.post(
        "/api/v1/users/login",
        Credential,
        { withCredentials: true }
      );

      toast.success("Logged in successfully");
      console.log(res.data.data, "normal login")
      dispatch({ type: "LOGIN_SUCCESS", payload: res.data.data });

      navigate(backto || "/");
    } catch (error) {
      dispatch({
        type: "LOGIN_FAIL",
        payload: error.response?.data?.message,
      });
    }
  };

  return (
    <div className="login-page">
      {/* LEFT CARD */}
      <div className="login-card">
        <h2 className="login-title">Login</h2>

        <input
          className="login-input"
          type="text"
          placeholder="Username"
          id="username"
          onChange={handleChange}
        />

        <input
          className="login-input"
          type="password"
          placeholder="Password"
          id="password"
          onChange={handleChange}
        />

        <div className="login-options">
          <span className="forgot">Forgot Password?</span>
        </div>

        <button
          className="lButton"
          disabled={loading}
          onClick={handleClick}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {error && <span className="login-error">{error}</span>}

        <div className="divider">
          <span>Or login with</span>
        </div>

        {/* GOOGLE LOGIN */}
        <div className="social-login">
          <GoogleLogin
            onSuccess={async (credentialResponse) => {
              try {
                dispatch({ type: "START" });

                const res = await api.post(
                  "/api/v1/users/googleAuth",
                  { token: credentialResponse.credential },
                  { withCredentials: true }
                );
                console.log(res.data.data)
                dispatch({
                  type: "LOGIN_SUCCESS",
                  payload: res.data.data,
                });

                navigate(backto || "/");
              } catch {
                dispatch({
                  type: "LOGIN_FAIL",
                  payload: "Google login failed",
                });
              }
            }}
            onError={() =>
              dispatch({
                type: "LOGIN_FAIL",
                payload: "Google login failed",
              })
            }
          />
        </div>

        <p className="register-link">
          No account yet?{" "}
          <span onClick={() => navigate("/register")}>Register</span>
        </p>
      </div>

      {/* RIGHT ILLUSTRATION */}
      <div className="login-illustration">
        <img
          src={loginImg}
          alt="login"
        />
      </div>
    </div>
  );
}

export default Login;
