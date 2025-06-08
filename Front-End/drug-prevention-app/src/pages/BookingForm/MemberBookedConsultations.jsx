import React, { useEffect, useState } from "react";
const statusOptions = [
  "All",
  "Pending",
  "Confirmed",
  "Completed",
  "Cancelled"
];

const MemberBookedConsultations = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");

  // Get the currently logged-in user from localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user.id;

  useEffect(() => {
    if (!userId) {
      setError("You are not logged in.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get the list of bookings for the user
        const resBookings = await fetch(`http://localhost:5002/Bookings?memberId=${userId}`);
        if (!resBookings.ok) throw new Error("Unable to load booking list");
        const bookingsData = await resBookings.json();

        // Get unique consultantIds
        const consultantIds = [
          ...new Set(bookingsData.map((b) => String(b.consultantId)))
        ];
        if (consultantIds.length === 0) {
          setBookings([]);
          setLoading(false);
          return;
        }

        // Get consultant information
        const resConsultants = await fetch(
          `http://localhost:5002/User?${consultantIds.map(id => `id=${id}`).join("&")}`
        );
        if (!resConsultants.ok) throw new Error("Unable to load consultant information");
        const consultantsData = await resConsultants.json();

        // Merge consultant info into bookings
        const enrichedBookings = bookingsData.map((b) => ({
          ...b,
          consultant: consultantsData.find((c) => String(c.id) === String(b.consultantId))
        }));

        setBookings(enrichedBookings);
      } catch (err) {
        setError(err.message || "An error occurred while loading data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  // Cancel booking handler (only for Pending)
  const handleCancel = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      const res = await fetch(`http://localhost:5002/Bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Cancelled" }),
      });
      if (!res.ok) throw new Error("Failed to cancel booking");
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId ? { ...b, status: "Cancelled" } : b
        )
      );
    } catch (error) {
      console.error(error);
      alert("Cancel failed!");
    }
  };

  

  // Filter bookings by status
  const filteredBookings =
    statusFilter === "All"
      ? bookings
      : bookings.filter((b) => b.status === statusFilter);

  return (
    <>
      <div className="container py-4">
        <h2 className="mb-4" style={{ color: "#004b8d", fontWeight: 700 }}>
          List of Appointments with Consultants
        </h2>
        <div className="mb-3 d-flex align-items-center gap-2">
          <label htmlFor="statusFilter" style={{ fontWeight: 500 }}>Filter by status:</label>
          <select
            id="statusFilter"
            className="form-select"
            style={{ maxWidth: 200 }}
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            {statusOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
        {loading ? (
          <div>Loading data...</div>
        ) : error ? (
          <div className="text-danger">{error}</div>
        ) : filteredBookings.length === 0 ? (
          <div>You have not booked any appointments.</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-bordered table-hover">
              <thead className="table-primary text-center align-middle">
                <tr>
                  <th>#</th>
                  <th>Consultant Name</th>
                  <th>Email</th>
                  <th>Phone Number</th>
                  <th>Appointment Time</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody className="align-middle">
                {filteredBookings.map((booking, idx) => {
                  const consultant = booking.consultant || {};
                  const dateObj = new Date(booking.bookingTime);
                  const dateStr = dateObj.toLocaleDateString("en-GB");
                  const timeStr = dateObj.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
                  return (
                    <tr key={booking.id}>
                      <td>{idx + 1}</td>
                      <td>{consultant.fullName || "Consultant"}</td>
                      <td>{consultant.email || ""}</td>
                      <td>{consultant.phoneNumber || ""}</td>
                      <td>{`${dateStr} ${timeStr}`}</td>
                      <td>{booking.status}</td>
                      <td>
                       
                        {booking.status === "Pending" && (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleCancel(booking.id)}
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default MemberBookedConsultations;