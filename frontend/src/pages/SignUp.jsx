import React, { useState } from "react";
import logo from "../assets/logo.jpg";
import google from "../assets/google.png";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ClipLoader from "react-spinners/ClipLoader";

function SignUp() {
  const navigate = useNavigate();

  const [show, setShow] = useState(false);
  const [name, setName] = useState(""); // UI only
  const [email, setEmail] = useState(""); // UI only
  const [password, setPassword] = useState(""); // UI only
  const [role, setRole] = useState("Role-1"); // UI only
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    try {
      setLoading(true);
      toast.info("Signup not available. HR/Admin creates employees using Create Employee.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    toast.info("Google signup not enabled. Use Login with Google if configured.");
    // If you actually have google route, uncomment:
    // window.location.href = `${import.meta.env.VITE_SERVER_URL}/auth/google`;
  };

  return (
    <div className="bg-[#dddbdd] w-screen h-screen flex items-center justify-center">
      <form
        className="w-[90%] md:w-[800px] h-[500px] bg-white shadow-xl rounded-2xl flex"
        onSubmit={(e) => e.preventDefault()}
      >
        {/* LEFT */}
        <div className="md:w-1/2 w-full h-full flex flex-col items-center justify-center gap-3">
          <div>
            <h1 className="font-semibold text-black text-2xl">Let's Get Started</h1>
            <h2 className="text-[#999797] text-[18px]">Create Your Account</h2>
          </div>

          <div className="flex flex-col gap-1 w-[80%] items-start justify-center px-3">
            <label htmlFor="name" className="font-semibold">Name</label>
            <input
              id="name"
              type="text"
              className="border w-full h-[35px] border-[#e7e6e6] text-[15px] px-[20px]"
              placeholder="Enter Name"
              onChange={(e) => setName(e.target.value)}
              value={name}
            />
          </div>

          <div className="flex flex-col gap-1 w-[80%] items-start justify-center px-3">
            <label htmlFor="Email" className="font-semibold">Email</label>
            <input
              id="Email"
              type="email"
              className="border w-full h-[35px] border-[#e7e6e6] text-[15px] px-[20px]"
              placeholder="Enter Email"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
            />
          </div>

          <div className="flex flex-col gap-1 w-[80%] items-start justify-center px-3 relative">
            <label htmlFor="password" className="font-semibold">Password</label>
            <input
              id="password"
              type={show ? "text" : "password"}
              className="border w-full h-[35px] border-[#e7e6e6] text-[15px] px-[20px]"
              placeholder="Enter Password"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
            />
            {show ? (
              <IoEye
                className="absolute w-[20px] h-[20px] cursor-pointer right-[5%] bottom-[15%]"
                onClick={() => setShow(false)}
              />
            ) : (
              <IoEyeOff
                className="absolute w-[20px] h-[20px] cursor-pointer right-[5%] bottom-[15%]"
                onClick={() => setShow(true)}
              />
            )}
          </div>

          {/* Role chips (UI only for now) */}
          <div className="flex md:w-[50%] w-[70%] items-center justify-between">
            <span
              className={`px-[10px] py-[5px] border-[2px] rounded-xl cursor-pointer hover:border-black ${
                role === "Role-1" ? "border-black" : "border-[#646464]"
              }`}
              onClick={() => setRole("Role-1")}
            >
              Role-1
            </span>
            <span
              className={`px-[10px] py-[5px] border-[2px] rounded-xl cursor-pointer hover:border-black ${
                role === "Role-2" ? "border-black" : "border-[#646464]"
              }`}
              onClick={() => setRole("Role-2")}
            >
              Role-2
            </span>
          </div>

          <button
            type="button"
            className="w-[80%] h-[40px] bg-black text-white cursor-pointer flex items-center justify-center rounded-[5px]"
            onClick={handleSignUp}
            disabled={loading}
          >
            {loading ? <ClipLoader size={22} color="white" /> : "Sign Up"}
          </button>

          <div className="w-[80%] flex items-center gap-2">
            <div className="w-[25%] h-px bg-[#c4c4c4]" />
            <div className="w-[50%] text-[15px] text-[#6f6f6f] flex items-center justify-center">
              Or Continue with
            </div>
            <div className="w-[25%] h-px bg-[#c4c4c4]" />
          </div>

          <div
            className="w-[80%] h-[40px] border border-black rounded-[5px] flex items-center justify-center cursor-pointer hover:bg-gray-100"
            onClick={handleGoogleSignup}
          >
            <img src={google} alt="google" className="w-[30px] -mr-1" />
            <span className="text-[18px] text-gray-500">Google</span>
          </div>

          <button type="button" className="text-[#6f6f6f]">
            Already have an Account?{" "}
            <span
              className="underline underline-offset-1 text-black"
              onClick={() => navigate("/login")}
            >
              Login
            </span>
          </button>
        </div>

        {/* RIGHT */}
        <div className="hidden md:flex w-1/2 h-full rounded-r-2xl bg-black items-center justify-center flex-col">
          <img src={logo} alt="logo" className="w-40 shadow-2xl" />
          <span className="text-2xl text-white m-5 mb-4">PROJECT NAME</span>
        </div>
      </form>
    </div>
  );
}

export default SignUp;
