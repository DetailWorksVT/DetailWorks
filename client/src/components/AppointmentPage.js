import {useEffect, useState} from 'react'
import React from 'react'
import UpdateAppointment from './UpdateAppointment'
import Cancel from './Cancel'
import moment from 'moment'

export default function AppointmentPage(props) {
    const [appointmentMade, setAppointmentMade] = useState({});
    const [updateClick, setUpdateClick] = useState(false);
    const [cancelClick, setCancelClick] = useState(false);
  
  function updateAppointmentHandler() {
    setUpdateClick(!updateClick);
  }

  function cancelClickHandler() {
    setCancelClick(!cancelClick);
  }
    useEffect(() => {
        if (appointmentMade.id !== props.match.params.id) {
          fetch(`/api/${props.match.params.id}`)
            .then((res) => res.json())
            .then((appointmentList) => {
              setAppointmentMade(appointmentList);
            });
        }
      });
    
    
    return (
        <div>
            <h2>Update or Cancel This Appointment</h2>
            <div id="appointment-container" >
            <h4>Day: {appointmentMade.appointmentDate}</h4>
            <p>Time: {appointmentMade.timeOfApp}</p>
            {/* <p>Customer: {appointmentMade.customerName}</p> */}
            <p>First Name: {appointmentMade.firstName}</p>
            <p>Last Name: {appointmentMade.lastName}</p>
            <p>Phone Number: {appointmentMade.phoneNumber}</p>
            <p>Email: {appointmentMade.email}</p>
            <p>Vehicle Make, Year, Model: {appointmentMade.vehicleMake}</p>
            <p>Vehicle Type: {appointmentMade.vehicleType}</p>
            <p>Services: {appointmentMade.service}</p>
            <p>Appointment Made On:{moment(appointmentMade.dateAppMade).format('l')}</p>
            <button onClick={updateAppointmentHandler}>Update Appointment</button>
            {updateClick && <UpdateAppointment appointmentMade={appointmentMade} />}
            <button onClick={cancelClickHandler}>Cancel Appointment</button>
            {cancelClick && <Cancel appointmentMade={appointmentMade} cancelClickHandler={cancelClickHandler} />} 
            </div>
        </div>
    )
}
