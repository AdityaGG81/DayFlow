import React from 'react'
import { Routes , Route } from 'react-router-dom'
import Home from './pages/Home'
import SignUp from './pages/SignUp'
import Login from './pages/Login'
import EmployeeDashboard from './pages/EmployeeDashboard'
import EmployeeList from "./pages/EmployeeList";

import HRDashboard from './pages/HRDashboard'
import HRGuard from './components/guards/HRGuard'
import EmployeeGuard from './components/guards/EmployeeGuard'
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <>
    <ToastContainer/>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/signup" element={<SignUp/>}/>
        <Route path="/login" element={<Login/>}/>

        <Route path="/employee" element={<EmployeeGuard><EmployeeDashboard/></EmployeeGuard>} />

        <Route path="/hr/employees" element={<HRGuard><EmployeeList/></HRGuard>} />

        <Route path="/hr" element={<HRGuard><HRDashboard/></HRGuard>} />
      </Routes>

    </>
  )
}

export default App