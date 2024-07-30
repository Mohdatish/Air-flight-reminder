import React from "react";
import "./App.css";
import Header from "./components/Header";
import { Route, Routes, useLocation } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import { Toaster } from "react-hot-toast";
import Auth from "./gaurd/Auth";

function App() {
  const location = useLocation()
  return (
    <>
      <Toaster
        position="top-center"
        reverseOrder={false}
      />
      {location.pathname === '/login' || location.pathname === '/signup' ? <></> : <Header />}
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route element={<Auth />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
