import { useState } from "react";
import API from "../api"; // axios instance

export default function AddParticipant() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    college: "",
    department: "",
    year: "",
    social_link: "",
  });

  const [loading, setLoading] = useState(false);

  // 🔄 Input handler
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 💰 Payment + Registration
  const handlePay = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1) Create order on backend
      const orderRes = await API.post("/payment/create-order", {});
      const order = orderRes.data;

      const options = {
        key: process.env.REACT_APP_RZP_KEY,
        amount: order.amount,
        currency: "INR",
        name: "GenVision",
        description: "Participant Registration ₹500",
        order_id: order.id,

        handler: async function (response) {
          try {
            // 2) Verify payment on server
            const verify = await API.post("/payment/verify", {
              ...response,
              formData: form,
            });

            if (verify.data.success) {
              // 3) Save participant to DB
              await API.post("/participants", form);

              alert("🎉 Registration Successful! Check your email.");

              // Clear form
              setForm({
                name: "",
                email: "",
                phone: "",
                college: "",
                department: "",
                year: "",
                social_link: "",
              });
            } else {
              alert("❌ Payment verification failed");
               document.body.style.overflow = "auto";
            }
          } catch (err) {
            console.error(err);
            alert("❌ Server verification error");
          }
        },

        prefill: {
          name: form.name,
          email: form.email,
          contact: form.phone,
        },

        theme: { color: "#3399cc" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("❌ Order creation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="card shadow-sm">
        <div className="card-body">
          <h3 className="text-center mb-4">Be a Part of the GenVision</h3>

          <form
            onSubmit={handlePay}
            className="d-flex flex-column align-items-center gap-3"
          >
            <input
              type="text"
              className="form-control w-75"
              placeholder="Full Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />

            <input
              type="email"
              className="form-control w-75"
              placeholder="Email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              className="form-control w-75"
              placeholder="Phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
            />

            <input
              type="text"
              className="form-control w-75"
              placeholder="College"
              name="college"
              value={form.college}
              onChange={handleChange}
            />

            <input
              type="text"
              className="form-control w-75"
              placeholder="Department"
              name="department"
              value={form.department}
              onChange={handleChange}
            />

            <input
              type="text"
              className="form-control w-75"
              placeholder="Year"
              name="year"
              value={form.year}
              onChange={handleChange}
            />

            <input
              type="text"
              className="form-control w-75"
              placeholder="LinkedIn / Instagram link"
              name="social_link"
              value={form.social_link}
              onChange={handleChange}
            />

            <button
              type="submit"
              disabled={loading}
              className="btn btn-success px-5 fw-semibold mt-3"
            >
              {loading ? "Processing..." : "Count Me In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
