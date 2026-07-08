import {
  Paper,
  Typography,
  Box,
  Grid,
  TextField,
  FormControl,
  Select,
  MenuItem,
  Button,
  Divider,
  Alert
} from "@mui/material";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import React from "react";
import { useNavigate } from "react-router-dom";
import { addNotification } from "../utils/notifications";
import { getNextTicketId, createTicket } from "../services/ticketsService";

export default function CreateTicket() {
  const navigate = useNavigate();
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [priority, setPriority] = React.useState("");
  const [impact, setImpact] = React.useState("");
  const [successMessage, setSuccessMessage] = React.useState("");
  const [titleError, setTitleError] = React.useState("");
  const [descriptionError, setDescriptionError] = React.useState("");
  const [categoryError, setCategoryError] = React.useState("");
  const [priorityError, setPriorityError] = React.useState("");
  const [impactError, setImpactError] = React.useState("");
  const [attachments, setAttachments] = React.useState([]);


  const handleAttachmentChange = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const readFileAsDataUrl = (file) =>
      new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve({
            name: file.name,
            type: file.type,
            data: reader.result,
          });
        };
        reader.readAsDataURL(file);
      });

    const newAttachments = await Promise.all(files.map(readFileAsDataUrl));

    setAttachments((prev) => [...prev, ...newAttachments]);
  };

  const handleSubmit = () => {
    setTitleError("");
    setDescriptionError("");
    setSuccessMessage("");
    setCategoryError("");
    setPriorityError("");
    setImpactError("");

    let hasError = false;

    if (!title.trim()) {
      setTitleError("Title is required");
      hasError = true;
    }

    if (!description.trim()) {
      setDescriptionError("Description is required");
      hasError = true;
    }

    if (!category) {
      setCategoryError("Category is required");
      hasError = true;
    }

    if (!priority) {
      setPriorityError("Priority is required");
      hasError = true;
    }

    if (!impact) {
      setImpactError("Impact is required");
      hasError = true;
    }

    if (hasError) return;

    const nextTicketId = getNextTicketId();

    const newTicket = {
      id: nextTicketId,
      title,
      description,
      category,
      priority,
      impact,
      status: "Open",
      assignedTo: "",
      createdBy: JSON.parse(sessionStorage.getItem("allstars_auth"))?.email || "unknown",
      createdAt: new Date().toLocaleString(),
      attachments,
    };

    try {
      createTicket(newTicket);

      addNotification({
        recipientEmail: "manager@allstars.com",
        type: "new-ticket",
        title: "New ticket created",
        message: `Ticket #${newTicket.id} was created and is awaiting assignment.`,
        ticketId: newTicket.id,
      });

      setSuccessMessage("Ticket submitted successfully.");
      setTitle("");
      setDescription("");
      setCategory("");
      setPriority("");
      setImpact("");
      setAttachments([]);
    } catch (error) {
      setSuccessMessage("");
      alert("Attachments are too large to save locally. Try fewer or smaller images.");
      console.error("Failed to save ticket:", error);
    }


    console.log("Saved ticket:", newTicket);
  };

  const handleClear = () => {
    setTitle("");
    setDescription("");
    setCategory("");
    setPriority("");
    setImpact("");
    setSuccessMessage("");
    setTitleError("");
    setDescriptionError("");
    setCategoryError("");
    setPriorityError("");
    setImpactError("");
    setAttachments([]);;
  };


  return (
    <>
      <Box sx={{ mb: 2 }}>
        <Button
          variant="text"
          onClick={() => navigate("/tickets")}
          sx={{ textTransform: "none", px: 0 }}
        >
          ← Back to My Tickets
        </Button>
      </Box>

      <Paper

        elevation={0}
        sx={{
          maxWidth: 980,
          mx: "auto",
          p: 4,
          borderRadius: 3,
          border: "1px solid rgba(0,0,0,0.08)",
          bgcolor: "rgba(255,255,255,0.9)"
        }}
      >

        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Create Ticket
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Submit an IT support request
        </Typography>

        {successMessage && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {successMessage}
          </Alert>
        )}

        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Title <span style={{ color: "#d32f2f" }}>*</span>
          </Typography>
          <TextField
            fullWidth
            placeholder="Example: Cannot connect to office Wi-Fi network"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setSuccessMessage("");
              setTitleError("");
            }}
            error={!!titleError}
            helperText={titleError}
          />
        </Box>

        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Category <span style={{ color: "#d32f2f" }}>*</span>
            </Typography>
            <FormControl fullWidth error={!!categoryError}>
              {categoryError && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, display: "block" }}>
                  {categoryError}
                </Typography>
              )}
              <Select
                value={category}
                displayEmpty
                onChange={(e) => {
                  setCategory(e.target.value);
                  setSuccessMessage("");
                  setCategoryError("");
                }}
              >
                <MenuItem value="">Select a category</MenuItem>
                <MenuItem value="Network & Connectivity">Network & Connectivity</MenuItem>
                <MenuItem value="Hardware">Hardware</MenuItem>
                <MenuItem value="Software">Software</MenuItem>
                <MenuItem value="Accounts & Access">Accounts & Access</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Priority <span style={{ color: "#d32f2f" }}>*</span>
            </Typography>
            <FormControl fullWidth error={!!priorityError}>
              {priorityError && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, display: "block" }}>
                  {priorityError}
                </Typography>
              )}
              <Select
                value={priority}
                displayEmpty
                onChange={(e) => {
                  setPriority(e.target.value);
                  setSuccessMessage("");
                  setPriorityError("");
                }}
              >
                <MenuItem value="">Select a priority</MenuItem>
                <MenuItem value="Low - not time sensitive">Low - not time sensitive</MenuItem>
                <MenuItem value="Medium - needed soon">Medium - needed soon</MenuItem>
                <MenuItem value="High - work blocked">High - work blocked</MenuItem>
                <MenuItem value="Critical - outage">Critical - outage</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Impact <span style={{ color: "#d32f2f" }}>*</span>
            </Typography>
            <FormControl fullWidth error={!!impactError}>
              {impactError && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, display: "block" }}>
                  {impactError}
                </Typography>
              )}
              <Select
                value={impact}
                displayEmpty
                onChange={(e) => {
                  setImpact(e.target.value);
                  setSuccessMessage("");
                  setImpactError("");
                }}
              >
                <MenuItem value="">Select an impact</MenuItem>
                <MenuItem value="Single User">Single User</MenuItem>
                <MenuItem value="Multiple People">Multiple People</MenuItem>
                <MenuItem value="Department-wide">Department-wide</MenuItem>
                <MenuItem value="Company-wide">Company-wide</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Description <span style={{ color: "#d32f2f" }}>*</span>
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Describe the issue, what you tried, and how it impacts your work..."
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              setSuccessMessage("");
              setDescriptionError("");
            }}
            error={!!descriptionError}
            helperText={descriptionError}
          />
        </Box>

        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Attachments
          </Typography>

          <Paper
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              gap: 2,
              bgcolor: "#fafbfe",
              flexWrap: "wrap",
            }}
          >
            <Button
              variant="outlined"
              component="label"
              startIcon={<AttachFileIcon />}
            >
              Upload Files
              <input
                type="file"
                hidden
                multiple
                accept="image/*"
                onChange={handleAttachmentChange}
              />
            </Button>

            <Typography variant="body2" color="text.secondary">
              {attachments.length > 0
                ? attachments.map((file) => file.name).join(", ")
                : "PNG, JPG, etc."}
            </Typography>
          </Paper>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
          <Button variant="outlined" onClick={handleClear}>
            Clear
          </Button>
          <Button variant="contained" onClick={handleSubmit}>
            Submit Ticket
          </Button>
        </Box>
      </Paper >
    </>
  );
}
