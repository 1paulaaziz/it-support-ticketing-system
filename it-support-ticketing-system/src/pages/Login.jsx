import { useNavigate } from 'react-router-dom';
import allStarsLogo from "../assets/allstarslogo.png";
import React from "react";


import {
  Box,
  Typography,
  TextField,
  Button,
  Paper
} from '@mui/material';

const MOCK_USERS = {
  "employee@allstars.com": { role: "employee" },
  "bob.joe@allstars.com": { role: "tech" },
  "manager@allstars.com": { role: "manager" },
};

function saveAuth(email, role) {
  sessionStorage.setItem(
    "allstars_auth",
    JSON.stringify({ isLoggedIn: true, email, role })
  );
}


function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [emailError, setEmailError] = React.useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    setEmailError("");

    const emailValue = email.trim().toLowerCase();

    if (!emailValue) {
      setEmailError("Email is required");
      return;
    }

    const user = MOCK_USERS[emailValue] ?? { role: "employee" };

    saveAuth(emailValue, user.role);

    navigate("/tickets");
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff'

      }}
    >
      {/* NEW: column wrapper */}
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", gap: 0 }}>
        {/* BIG LOGO ABOVE CARD */}
        <Box
          component="img"
          src={allStarsLogo}
          alt="All-Stars IT Solutions"
          sx={{ width: 800, maxWidth: "90%", mb: -15, mt: -50 }}
        />

        {/* LOGIN CARD */}
        <Paper elevation={3} sx={{ p: 4, width: 400 }}>
          <Box component="form" onSubmit={handleSubmit}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Sign in to continue
            </Typography>

            <TextField
              fullWidth
              label="Email"
              margin="normal"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError("");
              }}
              error={!!emailError}
              helperText={emailError}
            />

            <TextField
              fullWidth
              label="Password"
              type="password"
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {/* keep the rest of your form/buttons below */}

            <Button
              fullWidth
              type="submit"
              variant="contained"
              sx={{ mt: 2 }}
            >
              Sign In
            </Button>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}

export default Login;
