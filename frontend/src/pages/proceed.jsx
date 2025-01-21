import React, { useState } from "react";
import Footer from "../Components/Footer";
import { useNavigate } from "react-router-dom";
const PageLayout = () => {
  const [selectedProfile, setSelectedProfile] = useState("");
  const navigate = useNavigate();
  const handleSelection = (event) => {
    setSelectedProfile(event.target.value);
  };

  const onProceed = () => {
    if (selectedProfile === "Parents") {
      navigate('/parentprofile')
      
    } else if (selectedProfile === "Healthcare Providers") {
      navigate('/Profilehealth')
    } else {
      alert("Please select a profile type before proceeding.");
    }
  };

  const getImageSrc = () => {
    if (selectedProfile === "Parents") {
      return "/assets/13168-NOQTB4.jpg"; 
    } else if (selectedProfile === "Healthcare Providers") {
      return "/assets/doctor_consultation_03.jpg"; 
    }
    return "src/assets/pagelayout.jpg"; 
  };

  return (
   
    <div>
    <div style={styles.container}>
      <div style={styles.leftPart}>
        <div style={styles.logoContainer}>
          <img src="assets/InfantFuel logo-04.png" alt="Logo" style={styles.logo} />
        </div>
        <div style={styles.imageContainer}>
          <img src={getImageSrc()} alt="Center Image" style={styles.image} />
        </div>
        <div style={styles.paragraphContainer}>
        <p style={styles.paragraph}>
          {selectedProfile === "Parents"
            ? "Start your journey to track and support your baby’s growth with ease—because because every little step counts!"
            : selectedProfile === "Healthcare Providers"
            ? "Effortlessly track and monitor the growth of babiesin your care with a smart digital solution because  every milestone matters!"
            : "Please select a profile type to proceed."}
        </p>
        </div>
      </div>

      <div style={styles.rightPart}>
        <div style={styles.rightPartcontain}>
        <h1 style={styles.heading}>Welcome!</h1>
        <p style={styles.subHeading}>Please select your profile type</p>
        <div style={styles.selectionContainer}>
          <label style={styles.label}>
            <input
              type="radio"
              name="profileType"
              value="Parents"
              onChange={handleSelection}
              style={styles.radio}
            />
            Parents
          </label>
          <label style={styles.label}>
            <input
              type="radio"
              name="profileType"
              value="Healthcare Providers"
              onChange={handleSelection}
              style={styles.radio}
            />
            Healthcare Providers
          </label>
        </div>
        <button style={styles.proceedButton} onClick={onProceed}>
          Proceed
        </button>
        <p style={styles.loginText}>
        If you already have an account
        <p> You can 
        <a href="/login" style={styles.loginLink}> Login here</a>  </p> 
        </p>
        </div>
      </div>
      
    
      
    </div>
    
    {/* <Footer/> */}
    </div>
    
  );
};

const styles = {
  loginText: {
    marginTop: "20px",
    fontSize: "14px",
    color: "#666",
    // textAlign: "center",
  },
  
  loginLink: {
    color: "#A020F0", // Purple color to match the button
    textDecoration: "none",
    fontWeight: "bold",
    cursor: "pointer",
  },

  container: {
    display: "flex",
    width: "100vw",
    height: "100vh",
  },
  leftPart: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "20px",
    backgroundColor: "#ffffff",
  },
  logoContainer: {
    marginTop: "20px",
  },
  logo: {
    height: "200px",
    objectFit: "contain",
  },
  imageContainer: {
    // flex: 1,
    // display: "flex",
    // justifyContent: "center",
    // alignItems: "center",

    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
    maxWidth: "100%", 



  },
  image: {
    height: "300px",
    width: "300px",
    objectFit: "cover",
    // borderRadius: "50%",
    // borderRadius: "20px", // Optional: softer edges
    // boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)", // Adds a modern shadow effect
  
  },
  paragraphContainer: {
    marginBottom: "20px",
    textAlign: "center",
  },
  paragraph: {
    fontSize: "16px",
    color: "#333",
  },
  rightPart: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems:"left",
    backgroundColor: "#FFE7C7", // Cream color
    padding: "20px",
    
  },
  rightPartcontain: {
    padding: "20px 70px",
  },
  heading: {
    fontSize: "32px",
    marginBottom: "10px",
    color: "#A020F0",
  },
  subHeading: {
    fontSize: "18px",
    marginBottom: "20px",
    color: "#666",
  },
  selectionContainer: {
    marginBottom: "20px",
  },
  label: {
    display: "block",
    fontSize: "16px",
    marginBottom: "10px",
    color: "#333",
  },
  radio: {
    marginRight: "10px",
  },
  proceedButton: {
    padding: "10px 100px",
    fontSize: "16px",
    color: "#fff",
    backgroundColor: "#A020F0",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

export default PageLayout;