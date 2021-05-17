//React components 
import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useState, useEffect, useRef } from "react";
//Service Pricing Components
import CoupePrice from "./CoupePrice";
import HatchbackPrice from "./HatchbackPrice";
import SuvPrice from "./SuvPrice";

export default function AppointmentScheduler() {
  //Service Variables
  const [vehicleType, setVehicleType] = useState("");
  const [price, setPrice] = useState(0);
  //Scheduling Variables
  const [dateOfApp, setDateOfApp] = useState("");
  let properDate = dateOfApp.toLocaleString().split(",")[0]
  const [time, setTime] = useState("");
  const previousDate = usePrevious(dateOfApp);
  const [unavailableEight, setUnavailableEight] = useState(false);
  const [unavailableNoon, setUnavailableNoon] = useState(false);
  const [appointmentsMade, setAppointmentsMade] = useState([]);
  const [scheduledNoon, setScheduledNoon] = useState(0);
  const [scheduledEight, setScheduledEight] = useState(0);
  const [email, setEmail] = useState("");
  const [matchEmail, setMatchEmail] = useState("");
  const [availabilityCheck, setAvailabilityCheck] = useState("")

  //Email list variables
  const [subDTWL, setSubDTWL] = useState("No");
  const [subSL, setSubSL] = useState("No");

//Function to store perviously selected values
  function usePrevious(value) {
    const ref = useRef();
    useEffect(() => {
      ref.current = value;
    });
    return ref.current;
  }

  
//Function that filters out and disables weekends
  const isWeekday = date => {
    const day = date.getDay();
    return day !== 0 && day !== 6;
  }

//Handles the selection of different dates
  function dateChangeHandle(date) {
    setDateOfApp(date);
    setTime("");
    setUnavailableEight(false);
    setUnavailableNoon(false);
  }
//Handles the selection of different vehicle types
  function vehicleChangeHandle(evt) {
    setVehicleType(evt.target.value);
    setPrice(0);
  }

  //stores email inputs to check if they match
  function emailChangeHandle(evt) {
    setEmail(evt.target.value);
  }

  function emailMatchChangeHandle(evt) {
    setMatchEmail(evt.target.value);
  }
//subscribe to the Detail Works subscriber list
  function handleDWClick(){
    if (subDTWL !== "Yes") {
      setSubDTWL("Yes");
    } else {
      setSubDTWL("No");
    }
  }
//subscribe to the Spectrum subscriber list
  function handleSpecClick(){
    if (subSL !== "Yes") {
      setSubSL("Yes");
    } else {
      setSubSL("No");
    }
  }

  function alertOnSubmit() {
    alert("Your appointment has been successfully booked");
  }
//Queries the database 
useEffect(() => {
  if (dateOfApp !== previousDate) {
    fetch("/api/availability/")
    .then((res) => res.json())
    .then((availability) => {
      setAvailabilityCheck(availability)
    })
  }
})  

useEffect(() => {
    if (dateOfApp !== previousDate) {
      fetch(`/api/`)
        .then((res) => res.json())
        .then((appointmentList) => {
          setAppointmentsMade(appointmentList);
        });
    }
    blackOut();
  });
//puts results queried from DB into an array 
  let appointmentArr = [];
  appointmentsMade &&
    appointmentsMade.forEach((appointment) => {
      appointmentArr.push(appointment);
    });
//Prevents overbooking and limits 4 appointments to each time slot for any given day
  function blackOut() {
    let scheduleArrEight = [];
    let scheduleArrNoon = [];
    setScheduledEight(0);
    setScheduledNoon(0);
    //iterates through each appointment in database
    appointmentArr.forEach((appointment) => {
      //Finds appointments in DB for date user selects 
      if (
        appointment.appointmentDate === properDate && //compares appointments in DB to date selected at 8:00
        appointment.timeOfApp === "8:00am" 
      ) {
        scheduleArrEight.push(appointment); //pushes existing appointments for that date at 8:00am into an array
        setScheduledEight(scheduleArrEight.length);
        if (scheduleArrEight.length >= ((availabilityCheck[appointment.appointmentDate] && availabilityCheck[appointment.appointmentDate].eightAM) || 4) ) {
          setUnavailableEight(true); // if the amount of appointments is greater than 3 disables time slot for that particular date
        } else if (availabilityCheck[appointment.appointmentDate] && availabilityCheck[appointment.appointmentDate].eightAM === 0) {
          setUnavailableEight(true)
        }
      }
      if (
        appointment.appointmentDate === properDate && //compares appointments in DB to date selected at 12:00pm
        appointment.timeOfApp === "12:00pm"
      ) {
        scheduleArrNoon.push(appointment); //pushes existing appointments for that date at 12:00pm into an array
        setScheduledNoon(scheduleArrNoon.length);

        if (scheduleArrNoon.length >= ((availabilityCheck[appointment.appointmentDate] && availabilityCheck[appointment.appointmentDate].noon) || 4)) {
          console.log(availabilityCheck[appointment.appointmentDate].noon)
          setUnavailableNoon(true); // if the amount of appointments is greater than 3 disables time slot for that particular date
        } else if (availabilityCheck[appointment.appointmentDate] && availabilityCheck[appointment.appointmentDate].noon === 0){
          setUnavailableNoon(true)
        }
      }
    });
  }
  return (
    //JSX HTML 
    <div id="appointment-scheduler-container">
      <h2 id="schedule-header">Schedule an Appointment</h2>
      <form
        method="POST"
        action="/api"
        id="schedule-form"
        onSubmit={alertOnSubmit}
      >
        <div id="form-name">
          <span className="first-name">
            First Name <span className="asterisk">*</span>
            <br />
            <input type="text" name="firstName" required />
          </span>
          <span>
            Last Name <span className="asterisk">*</span>
            <br />
            <input type="text" name="lastName" required />
          </span>
        </div>

        <br />
        <div id="email-form">
          <span id="email">
            Email <span className="asterisk">*</span>
            <br />
            <input
              type="email"
              name="email"
              required
              onChange={emailChangeHandle}
            />
          </span>
          <br />
          <span>
            Confirm Email <span className="asterisk">*</span>
            <br />
            <input
              type="email"
              name="confirmEmail"
              required
              onChange={emailMatchChangeHandle}
            />
          </span>
        </div>
        {email !== matchEmail && <div id="email-match">Emails Must Match</div>}
        <br />
        <label>
          Phone Number (###-###-####) <span className="asterisk">*</span>
          <br />{" "}
          <input
            type="tel"
            name="phoneNumber"
            pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
            required
          />
        </label>
        <br />
        <label>
          <input type="checkbox" onClick={handleDWClick} />
          Yes, please add me to the Detail Works e-mail list!
        </label>
        <label>
          <input type="checkbox" onClick={handleSpecClick} />
          Yes, please add me to the Spectrum e-mail list!
        </label>
        <input type="hidden" name="spectrumList" value={subSL} />
        <input type="hidden" name="detailWorksList" value={subDTWL} />
        <br />
        <label>
          Make, Year, and Model of your vehicle{" "}
          <span className="asterisk">*</span>
          <br />
          <input type="text" name="vehicleMake" required />
        </label>
        <br />
        <label>
          Vehicle Type: <span className="asterisk">*</span>
          <br />
          <select name="vehicleType" onChange={vehicleChangeHandle}>
            <option value="select vehicle type">Select Vehicle Type</option>
            <option value="coupe/sedan">Coupe/Sedan</option>
            <option value="hatchback/crossover">Hatchback/Crossover</option>
            <option value="suv/truck/minivan">SUV/Truck/Minivan</option>
          </select>
        </label>
        {vehicleType === "coupe/sedan" && (
          <CoupePrice price={price} setPrice={setPrice} />
        )}
        {vehicleType === "hatchback/crossover" && (
          <HatchbackPrice price={price} setPrice={setPrice} />
        )}
        {vehicleType === "suv/truck/minivan" && (
          <SuvPrice price={price} setPrice={setPrice} />
        )}
        <br />
        <label>
          Additional Notes or Requests: <br />
          <input type="text" name="additionalNotes" />
        </label>
        <br />
        <div id="date-time">
          <div id="day">
            Select a Day: <span className="asterisk">*</span>
            {/* <input
              id="calender"
              type="date"
              name="appointmentDate"
              min={today}
              
              onChange={(evt) => dateChangeHandle(evt)}
              required
            /> */}
          <br/>
          <DatePicker
            value={dateOfApp}
            minDate={new Date()}
            selected={dateOfApp}
            filterDate={isWeekday}
            onChange={(date) => dateChangeHandle(date)}
            dateFormat="MM/dd/yyyy"
          />
          </div>
          <input type="hidden" name="appointmentDate" value={properDate} />
          <input type="hidden" name="initialAppointmentDate" value={dateOfApp} />
          <br />
          <span>
            Select a Time: <span className="asterisk">*</span>
            <br />
            <select
              name="timeOfApp"
              onChange={(evt) => setTime(evt.target.value)}
              value={time}
              required
            >
              <option value="">Select A Time</option>
              <option value="8:00am" disabled={unavailableEight}>
                8:00am
              </option>
              <option value="12:00pm" disabled={unavailableNoon}>
                12:00pm
              </option>
            </select>
          </span>
        </div>
        {dateOfApp && (
          <h6>
            There are {((availabilityCheck[properDate] && availabilityCheck[properDate].eightAM) || 4) - scheduledEight} appointments remaining at 8:00am
          </h6>
        )}
        {dateOfApp && (
          <h6>
            There are {((availabilityCheck[properDate] && availabilityCheck[properDate].noon) || 4) - scheduledNoon} appointments remaining at 12:00pm
          </h6>
        )}
        <br />
        {price > 0 && <h4>Your total is ${price}</h4>}
        <input type="hidden" name="price" value={price} />
        <input
          className="submit"
          type="submit"
          value="Schedule Appointment"
          style={{ width: "15vw" }}
          disabled={email !== matchEmail} //disables submit if emails dont match
        />
       
      </form>
      
     
  
    </div>
  );
}
