import React, { useState, useEffect } from "react";
import logo from "../assets/logo.jpg";
import google from "../assets/google.png";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { useNavigate, useLocation } from "react-router-dom";
import { serverUrl } from "../App";
import { toast } from "react-toastify";
import ClipLoader from "react-spinners/ClipLoader";
import axios from "axios";

function Login() {
  const [show, setShow] = useState(false);
  const [loginIdOrEmail, setLoginIdOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async () => {
    if (!loginIdOrEmail || !password) {
      toast.error("Please enter Login ID / Email and Password");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        `${serverUrl}/api/auth/login`,
        {
          loginIdOrEmail, // ✅ REQUIRED BY BACKEND
          password,
        },
        { withCredentials: true }
      );

      setLoading(false);
      toast.success("Login successful");

      // 🔐 force password change if required
      if (res.data?.requiresPasswordChange) {
        navigate("/change-password");
      } else {
        navigate("/");
      }
    } catch (error) {
      setLoading(false);
      toast.error(
        error?.response?.data?.message ||
          "Invalid Login ID / Email or Password"
      );
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${serverUrl}/api/auth/google`;
  };

  // Handle google login error redirect
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const error = params.get("error");

    if (error === "google_auth_failed") {
      toast.error("Google login failed. Please try again.");
      navigate("/login", { replace: true });
    }
  }, [location, navigate]);

  return (
    <div className="bg-[#dddbdd] w-screen h-screen flex items-center justify-center">
      <form
        className="w-[90%] md:w-[800px] h-[500px] bg-white shadow-xl rounded-2xl flex"
        onSubmit={(e) => {
          e.preventDefault();
          handleLogin();
        }}
      >
        {/* LEFT */}
        <div className="md:w-1/2 w-full flex flex-col items-center justify-center gap-4">
          <div>
            <h1 className="font-semibold text-2xl">Welcome back</h1>
            <p className="text-gray-500">Login to your account</p>
          </div>

          {/* Login ID / Email */}
          <div className="w-[80%]">
            <label className="font-semibold">Login ID / Email</label>
            <input
              type="text"
              className="w-full h-[35px] border px-3"
              placeholder="Enter Login ID or Email"
              value={loginIdOrEmail}
              onChange={(e) => setLoginIdOrEmail(e.target.value)}
            />
          </div>

          {/* Password */}
          <div className="w-[80%] relative">
            <label className="font-semibold">Password</label>
            <input
              type={show ? "text" : "password"}
              className="w-full h-[35px] border px-3"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {show ? (
              <IoEye
                className="absolute right-3 bottom-2 cursor-pointer"
                onClick={() => setShow(false)}
              />
            ) : (
              <IoEyeOff
                className="absolute right-3 bottom-2 cursor-pointer"
                onClick={() => setShow(true)}
              />
            )}
          </div>

          {/* Login button */}
          <button
            type="submit"
            className="w-[80%] h-[40px] bg-black text-white rounded"
            disabled={loading}
          >
            {loading ? <ClipLoader size={22} color="white" /> : "Login"}
          </button>

          {/* Divider */}
          <div className="w-[80%] flex items-center gap-2">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-gray-500 text-sm">OR</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          {/* Google login */}
          <div
            className="w-[80%] h-[40px] border flex items-center justify-center gap-2 cursor-pointer"
            onClick={handleGoogleLogin}
          >
            <img src={google} alt="google" className="w-[24px]" />
            <span className="text-gray-600">Continue with Google</span>
          </div>
        </div>

        {/* RIGHT */}
        <div className="hidden md:flex w-1/2 bg-black rounded-r-2xl flex-col items-center justify-center">
          <img src={logo} alt="logo" className="w-40 mb-4" />
          <span className="text-white text-xl">PROJECT NAME</span>
        </div>
      </form>
    </div>
  );
}

export default Login;
