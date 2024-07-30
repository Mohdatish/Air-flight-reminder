import { Paper, styled } from "@mui/material";


export const BackPaper = styled(Paper)({
    height:'auto',
    padding:'20px',
    width:"auto",
    borderRadius:"5px",
    overflow:"auto",
    boxShadow: 'rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px'
})

export const Flights = styled(Paper)({
    height:'auto',
    padding:'20px',
    borderRadius:"5px",
    marginTop:"15px",
    boxShadow: 'rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px',
    transition: 'box-shadow 0.3s ease, transform 0.3s ease', 
})