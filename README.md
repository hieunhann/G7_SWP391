import React, { useState, useEffect } from "react";
import "./BookingForm.css";
import Header from "../Header/Header";
const allTimeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30"
];

const toMinutes = (timeStr) => {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
};

const BookingForm = () => {
  const [selectedDate, setSelectedDate] = useState("");
  const [availableConsultants, setAvailableConsultants] = useState([]);
  const [selectedConsultant, setSelectedConsultant] = useState("");
  const [bookedSlots, setBookedSlots] = useState([]);
  const [workingSlots, setWorkingSlots] = useState([]);
  const [selectedTime, setSelectedTime] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchAvailableConsultants = async () => {
      if (!selectedDate) return setAvailableConsultants([]);

      const dayOfWeek = new Date(selectedDate).toLocaleString("en-US", {
        weekday: "long"
      });

      try {
        const res = await fetch(`http://localhost:5002/Schedule?day_of_week=${dayOfWeek}`);
        const schedules = await res.json();
        const consultantIds = [...new Set(schedules.map(s => s.consultant_id))];

        const usersRes = await fetch(`http://localhost:5002/User`);
        const users = await usersRes.json();
        const consultants = users.filter(u => consultantIds.includes(u.id));

        setAvailableConsultants(consultants);
      } catch (err) {
        console.error("Failed to fetch consultants:", err);
        setAvailableConsultants([]);
      }

      setSelectedConsultant("");
      setSelectedTime("");
      setBookedSlots([]);
      setWorkingSlots([]);
    };

    fetchAvailableConsultants();
  }, [selectedDate]);

  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedConsultant || !selectedDate) return;

      const dayOfWeek = new Date(selectedDate).toLocaleString("en-US", {
        weekday: "long"
      });

      try {
        const bookingsRes = await fetch(`http://localhost:5002/Bookings?consultant_id=${selectedConsultant}`);
        const bookings = await bookingsRes.json();
        const booked = bookings
          .filter(b => b.booking_time.startsWith(selectedDate))
          .map(b => b.booking_time.substring(11, 16));
        setBookedSlots(booked);

        const scheduleRes = await fetch(`http://localhost:5002/Schedule?consultant_id=${selectedConsultant}&day_of_week=${dayOfWeek}`);
        const schedule = await scheduleRes.json();

        if (schedule.length > 0) {
          const { start_time, end_time } = schedule[0];
          const start = start_time.substring(0, 5);
          const end = end_time.substring(0, 5);

          const validSlots = allTimeSlots.filter(slot => {
            const mins = toMinutes(slot);
            return mins >= toMinutes(start) && mins < toMinutes(end);
          });

          setWorkingSlots(validSlots);
        } else {
          setWorkingSlots([]);
        }
      } catch (err) {
        console.error("Error fetching schedule or bookings:", err);
        setBookedSlots([]);
        setWorkingSlots([]);
      }

      setSelectedTime("");
    };

    fetchSlots();
  }, [selectedConsultant, selectedDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime || !selectedConsultant) return;

    const bookingTime = `${selectedDate}T${selectedTime}:00`;

    try {
      const res = await fetch("http://localhost:5002/Bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          member_id: 1,
          consultant_id: selectedConsultant,
          booking_time: bookingTime,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      });

      if (res.ok) {
        alert(`Booking successful at ${selectedTime}`);
        setMessage("Booking successful!");
        setBookedSlots(prev => [...prev, selectedTime]);
        setSelectedTime("");
      } else {
        alert("Booking failed. Try again.");
      }
    } catch (err) {
      console.error("Booking error:", err);
      alert("Error during booking.");
    }
  };

  return (
    <>
      <Header />
      <div className="booking-wrapper">
        <form onSubmit={handleSubmit}>
          <h1>Book Consultation</h1>

          <div className="input-box">
            <label>Choose a date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              required
            />
          </div>

          {selectedDate && (
            <div className="consultant-list">
              <label>Select Consultant (Available):</label>
              <div className="consultant-info">
                {availableConsultants.map(c => (
                  <div
                    key={c.id}
                    className={`consultant-item ${selectedConsultant === c.id ? "selected" : ""}`}
                    onClick={() => setSelectedConsultant(c.id)}
                  >
                    <img
                      src={c.avatar || "/avatars/default.jpg"}
                      alt={c.fullname}
                      className="avatar"
                    />
                    <span>{c.fullname}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedConsultant && (
            <div className="timeslots">
              <label>Choose a time:</label>
              <div className="time-grid">
                {allTimeSlots.map(slot => {
                  const notWorking = !workingSlots.includes(slot);
                  const alreadyBooked = bookedSlots.includes(slot);
                  const disabled = notWorking || alreadyBooked;

                  return (
                    <button
                      key={slot}
                      type="button"
                      className={`time-slot 
                        ${notWorking ? "not-working" : ""} 
                        ${alreadyBooked ? "booked" : ""} 
                        ${selectedTime === slot ? "selected" : ""}`}
                      disabled={disabled}
                      onClick={() => setSelectedTime(slot)}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="input-box">
            <label>Additional Notes:</label>
            <textarea rows="4" placeholder="Any additional notes..." />
          </div>

          <button type="submit" disabled={!selectedDate || !selectedConsultant || !selectedTime}>
            Book Now
          </button>

          {message && <p className="message">{message}</p>}
        </form>
      </div>
    </>
  );
};

export default BookingForm;
