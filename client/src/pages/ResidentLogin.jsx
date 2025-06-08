import React, { useState } from "react";

function ResidentLogin() {
  const [houseId, setHouseId] = useState("");
  const [societyId, setSocietyId] = useState("");
  const [phoneNo, setPhoneNo] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = (event) => {
    event.preventDefault();

    // Validate required fields
    if (!houseId.trim() || !societyId.trim() || !phoneNo.trim()) {
      setError("House ID, Society ID, and Phone Number are required.");
      return;
    }

    // Optional: Validate phone number format (basic example)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phoneNo.trim())) {
      setError("Phone Number must be a 10-digit number.");
      return;
    }

    setError(null);

    // Example login data object
    const loginData = {
      houseId: houseId.trim(),
      societyId: societyId.trim(),
      phoneNo: phoneNo.trim(),
      email: email.trim() || null,
    };

    console.log("Logging in with:", loginData);

    // Clear form or redirect after login success
    setHouseId("");
    setSocietyId("");
    setPhoneNo("");
    setEmail("");
  };

  return (
    <div style={styles.container}>
      <h2>Resident Login</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <label style={styles.label}>
          House ID*:
          <input
            type="text"
            value={houseId}
            onChange={(e) => setHouseId(e.target.value)}
            style={styles.input}
            placeholder="Enter your House ID"
          />
        </label>

        <label style={styles.label}>
          Society ID*:
          <input
            type="text"
            value={societyId}
            onChange={(e) => setSocietyId(e.target.value)}
            style={styles.input}
            placeholder="Enter your Society ID"
          />
        </label>

        <label style={styles.label}>
          Phone Number*:
          <input
            type="tel"
            value={phoneNo}
            onChange={(e) => setPhoneNo(e.target.value)}
            style={styles.input}
            placeholder="Enter your 10-digit phone number"
          />
        </label>

        <label style={styles.label}>
          Email (Optional):
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            placeholder="Enter your email (optional)"
          />
        </label>

        {error && <p style={styles.error}>{error}</p>}

        <button type="submit" style={styles.button}>
          Login
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "400px",
    margin: "50px auto",
    padding: "20px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
    fontFamily: "Arial, sans-serif",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    marginBottom: "15px",
    fontWeight: "bold",
  },
  input: {
    marginTop: "5px",
    padding: "8px",
    fontSize: "16px",
    borderRadius: "4px",
    border: "1px solid #ccc",
  },
  button: {
    padding: "10px",
    fontSize: "16px",
    borderRadius: "4px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    cursor: "pointer",
  },
  error: {
    color: "red",
    marginBottom: "15px",
  },
};

export default ResidentLogin;
