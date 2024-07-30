import { Backdrop, Button, CircularProgress, Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, Slide } from "@mui/material";
import React, { useState } from "react";
import { BackPaper, Flights } from "../common/Styles";
import { useNavigate } from "react-router-dom";
import { Flight, Height, South, Try } from "@mui/icons-material";
import toast from "react-hot-toast";
import API from "../apis/API";
import { useSelector } from "react-redux";


const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});


const Dashboard = () => {
  let api_key = process.env.AIR_API_KEY
  let auth = localStorage.getItem('token')
  const nav = useNavigate()
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = React.useState(false);
  const [details, setDetails] = useState([])
  const [list, setList] = useState([])
  const [search, setSearch] = useState(
    { flightNumber: '', departureCode: '', arrivalCode: '', date: '', airline: '' }
  )

  const handleInput = (e) => {
    const { name, value } = e.target;
    setSearch((prevData) => ({
      ...prevData,
      [name]: value
    }));
  }

  const calculateDuration = (departure, arrival) => {
    const depDate = new Date(departure);
    const arrDate = new Date(arrival);
    const duration = new Date(arrDate - depDate);

    const hours = duration.getUTCHours();
    const minutes = duration.getUTCMinutes();

    return `${hours}h ${minutes}m`;
  };


  const handleFind = (value) => {
    if (value === 'flights') {
      handleFlightAirport()
    } else {
      handleFlightTrack()
    }
  }
  const handleFlightTrack = async () => {
    try {
      setLoading(true)
      const response = await fetch(`https://api.flightapi.io/airline/${api_key}?num=${search.flightNumber}&name=${search.airline}&date=${search.date.replace(/-/g, '')}`);
      if (!response.ok) {
        toast.error('There are no flights on this date');
      }
      const data = await response.json();
      setDetails(data)
      setList([])
      setLoading(false)
    } catch (error) {
      console.log(error.message)
      setLoading(false)
      toast.error(error.message)
    }
  }

  const handleFlightAirport = async () => {
    try {
      setLoading(true)
      const response = await fetch(`https://api.flightapi.io/trackbyroute/${api_key}?date=${search.date.replace(/-/g, '')}&airport1=${search.departureCode}&airport2=${search.arrivalCode}`);
      if (!response.ok) {
        toast.error('There are no flights on this date');
      }
      const data = await response.json();
      setList(data)
      setDetails([])
      setLoading(false)
    } catch (error) {
      console.log(error.message)
      setLoading(false)
      toast.error(error.message)
    }
  }


  const handleRemindMe = (value) => {
    setOpen(true)
    setSearch((prevData) => ({
      ...prevData,
      ['flightNumber']: value.FlightNumber
    }));
  }

  const postRequest = async (url, data) => {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'An unexpected error occurred');
    }

    return response.json();
  };
  const user = useSelector(state => state.user.user);

  const submitForm = async () => {
    try {
      let reminder = {
        flight_number: search.flightNumber,
        user_id: user && user.id ? user.id : "",
        from: search.departureCode,
        to: search.arrivalCode
      };
      setLoading(true);
      const result = await postRequest(`${API.SAVE_REMINDER}`, reminder);

      if (!result.status) {
        toast.error(result.message);
      } else {
        toast.success(result.message)
        setLoading(false)
        setOpen(false)
        nav('/')
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };


  const handleAgree = () => {
    if (!auth) {
      nav('/login')
    } else {
      submitForm()
    }
  }


  return (
    <>
      <Container maxWidth="xl">
        <Grid container spacing={2} style={{ marginTop: "10px" }}>
          <Grid item xs={12} sm={12} md={12} lg={12}>
            <BackPaper>
              <div className="searchSection">
                <div className="searchFlight">
                  <South className="south" />
                  <div className="felids">
                    <div class="input-container">
                      <input name="departureCode" type="text" class="expandable-input" placeholder="From Airport" onChange={handleInput} />
                    </div>
                    <div class="input-container">
                      <input name="arrivalCode" type="text" class="expandable-input" placeholder="To Airport" onChange={handleInput} />
                    </div>
                    <div class="input-container w-100">
                      <input name="date" type="date" class="w-100 expandable-input" onChange={handleInput} />
                    </div>
                    <div class="input-container w-100 text-center">
                      <button className="buttonSet" onClick={() => handleFind('flights')}>Find Flight</button>
                    </div>
                  </div>
                </div>
                <div className="searchFlight">
                  <Flight className="south" />
                  <div className="felids">
                    <div class="input-container">
                      <input type="text" name="flightNumber" class="expandable-input" placeholder="Search By Flight Number" onChange={handleInput} />
                    </div>
                    <div class="input-container">
                      <input type="text" name="airline" class="expandable-input" placeholder="Airline" onChange={handleInput} />
                    </div>
                    <div class="input-container w-100">
                      <input type="date" name="date" class="w-100 expandable-input" onChange={handleInput} />
                    </div>
                    <div class="input-container w-100 text-center">
                      <button className="buttonSet" onClick={() => handleFind('track')}>Find</button>
                    </div>
                  </div>
                </div>
              </div>
              {details.length > 0 ?
                <>
                  <div className="flight-details mt">
                    <div className="details">
                      <h6>Departure</h6>
                      <div class="chip-container">
                        <div class="status-chip">{details[0].departure[0]["status"]}</div>
                      </div>
                      <div className="detail-content">
                        <p><span>Airport:</span> {details[0].departure[0]["Airport:"]}</p>
                        <p><span>Scheduled Time:</span> {details[0].departure[0]["Scheduled Time:"]}</p>
                        <p><span>Takeoff Time:</span> {details[0].departure[0]["Takeoff Time:"]}</p>
                        <p><span>Terminal - Gate:</span> {details[0].departure[0]["Terminal - Gate:"]}</p>
                      </div>
                    </div>
                    <div>
                      <Height className="south" />
                    </div>
                    <div className="details">
                      <h6>Arrival</h6>
                      <div className="detail-content">
                        <p><span>Airport:</span> {details[1].arrival[0]["Airport:"]}</p>
                        <p><span>Scheduled Time:</span> {details[1].arrival[0]["Scheduled Time:"]}</p>
                        <p><span>At Gate Time:</span> {details[1].arrival[0]["At Gate Time:"]}</p>
                        <p><span>Terminal - Gate:</span> {details[1].arrival[0]["Terminal - Gate:"]}</p>
                      </div>
                    </div>
                  </div>
                </>
                :
                ""
              }
              {list.length > 0 ?
                <>
                  {list.map((element, index) => (
                    <Flights key={index + 1}>
                      <div className="statusPosition">
                        <div className="airline-name"><strong>Air line:</strong> {element.Airline}</div>
                        <div class="chip-container">
                          <div class="status-chip">{element.Status}</div>
                        </div>
                      </div>
                      <div className="flight-time">
                        <div className="stepper">
                          <div>
                            <strong>Departure:</strong>&nbsp;
                            {element.DepartureTime}
                          </div>
                          <hr ></hr>
                          <div>
                            <strong>Duration:</strong>&nbsp;
                            {calculateDuration(element.DepartureTime, element.ArrivalTime)}
                          </div>
                          <hr></hr>
                          <div>
                            <strong>Arrival:</strong>&nbsp;
                            {element.ArrivalTime}
                          </div>
                        </div>
                      </div>
                      {element["Operated By"] && (
                        <div className="operated">
                          <strong>Operated By:</strong> {element["Operated By"]}
                        </div>
                      )}
                      <div className="button-position">
                        <button className="buttonSet" onClick={()=>handleRemindMe(element)}>Remind me on Update</button>
                      </div>
                    </Flights>
                  ))}
                </>
                :
                ''
              }
            </BackPaper>
          </Grid>
        </Grid>
      </Container>
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle>{"Flight reminder!"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            Would you like to be reminded about updates for this flight status, such as schedule changes, terminal updates, and gate changes? We can send you notifications and email updates. Do you agree to this?"
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Disagree</Button>
          <Button onClick={handleAgree}>Agree</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Dashboard;



