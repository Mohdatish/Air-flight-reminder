import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const Auth = () => {
  let auth = localStorage.getItem("token");
  return (
    <>
       {
      !auth
        ?
        <Outlet />
        :
        <Navigate to='/'></Navigate>
    }
    </>
  )
};

export default Auth;
