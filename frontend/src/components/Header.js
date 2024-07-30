import React, { useEffect } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { NavLink } from "react-router-dom";
import Login from "../pages/Login";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../redux/slice/infoSlice";

const Header = () => {
  let auth = localStorage.getItem("token");
  const dispatch = useDispatch()

  const user = useSelector(state => state.user.user);

  const logout = () =>{
    localStorage.clear()
    dispatch(setUser({}))
  }
  useEffect(() => {
    let savedUser = JSON.parse(localStorage.getItem('user'))
    dispatch(setUser(savedUser))
  },[])

  return (
    <div>
      <Box
        sx={{ flexGrow: 1, display: "flex", justifyContent: "space-between" }}
      >
        <AppBar
          position="static"
          style={{
            backgroundColor: "#fff",
            boxShadow:
              "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px",
          }}
        >
          <Toolbar>
            <img src="/images/logo.png" alt="logo" className="logoBar" />
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{
                flexGrow: 1,
                display: { xs: "none", sm: "block" },
                fontSize: "15px",
                color: "black",
              }}
            >
              Where Is My Flight
            </Typography>
            {auth ?
            <>
              <Typography
                variant="h6"
                noWrap
                component="div"
                sx={{
                  display: { xs: "none", sm: "block" },
                  fontSize: "15px",
                  color: "black",
                  cursor: "pointer",
                }}
              >

                Hi, {user && user.full_name}
              </Typography>&nbsp;&nbsp;
               <Typography
               onClick={logout}
               variant="h6"
               noWrap
               component="div"
               sx={{
                 display: { xs: "none", sm: "block" },
                 fontSize: "15px",
                 color: "black",
                 cursor: "pointer",
               }}
             >
              
               Logout
             </Typography>
             </>
              :
              <>
                <Typography
                  variant="h6"
                  noWrap
                  component="div"
                  sx={{
                    display: { sm: "block", md: "flex", lg: 'flex' },
                    fontSize: "15px",
                    color: "black",
                    marginRight: "10px",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                >
                  <NavLink to="/login">  SignIn</NavLink>
                </Typography>
                <NavLink to="/signup">
                  <button className="buttonSet" style={{ width: "none" }}>SignUp</button>
                </NavLink>
              </>
            }
          </Toolbar>
        </AppBar>
      </Box>
    </div>
  );
};

export default Header;
