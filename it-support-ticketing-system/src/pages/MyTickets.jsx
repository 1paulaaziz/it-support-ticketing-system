import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Stack,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  Chip,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import React from "react";
import SearchIcon from "@mui/icons-material/Search";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useNavigate } from "react-router-dom";
import { addNotification } from "../utils/notifications";
import { getStoredTickets, patchTicket } from "../services/ticketsService";

const sampleTickets = [
  { id: 3458, title: "Cannot connect to office Wi-Fi network", priority: "High", requester: "David Brown", updated: "20 minutes ago" },
  { id: 3442, title: "Printers won't connect to network", priority: "Medium", requester: "Sarah Lee", updated: "1 hour ago" },
  { id: 3435, title: "New employee laptop setup", priority: "High", requester: "John Smith", updated: "Yesterday" },
  { id: 3431, title: "Outlook email sending failure", priority: "High", requester: "Michael Johnson", updated: "2 days ago" },
  { id: 3428, title: "Share drive showing 'Access Denied'", priority: "Medium", requester: "Emily White", updated: "3 days ago" },
  { id: 3421, title: "VPN connection problem", priority: "Critical", requester: "Jane Doe", updated: "4 days ago" },
  { id: 3410, title: "Laptop not booting", priority: "High", requester: "Kevin Hart", updated: "5 days ago" },
];

function PriorityChip({ value }) {
  const normalizedValue = value?.toLowerCase() || "";

  let color = "default";
  let label = value;

  if (normalizedValue.startsWith("critical")) {
    color = "secondary";
    label = "Critical";
  } else if (normalizedValue.startsWith("high")) {
    color = "error";
    label = "High";
  } else if (normalizedValue.startsWith("medium")) {
    color = "warning";
    label = "Medium";
  } else if (normalizedValue.startsWith("low")) {
    color = "default";
    label = "Low";
  }

  return <Chip size="small" label={label} color={color} variant="filled" />;
}

function StatusChip({ value }) {
  const map = {
    Open: { label: "Open", color: "primary" },
    "In Progress": { label: "In Progress", color: "warning" },
    Resolved: { label: "Resolved", color: "success" },
    Closed: { label: "Closed", color: "default" },
  };

  const cfg = map[value] ?? { label: value, color: "default" };

  return <Chip size="small" label={cfg.label} color={cfg.color} variant="filled" />;
}

function StatCard({ title, count, onClick, active }) {
  return (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        p: 2,
        borderRadius: 2,
        border: active
          ? "1px solid rgba(25, 118, 210, 0.35)"
          : "1px solid rgba(0,0,0,0.08)",
        bgcolor: active ? "rgba(25, 118, 210, 0.06)" : "white",
        cursor: onClick ? "pointer" : "default",
        transition: "0.2s ease",
        "&:hover": onClick
          ? { bgcolor: "rgba(25, 118, 210, 0.08)" }
          : {},
      }}
    >
      <Typography variant="body2" color="text.secondary">
        {title}
      </Typography>
      <Typography variant="h4" sx={{ mt: 0.5, fontWeight: 600 }}>
        {count}
      </Typography>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
        <ChevronRightIcon fontSize="small" color="action" />
      </Box>
    </Paper>
  );
}

export default function MyTickets() {
  const navigate = useNavigate();
  const [tickets, setTickets] = React.useState([]);
  const [statusFilter, setStatusFilter] = React.useState("Active");
  const [priorityFilter, setPriorityFilter] = React.useState("All");
  const [searchTerm, setSearchTerm] = React.useState("");

  const auth = JSON.parse(sessionStorage.getItem("allstars_auth") || "{}");
  const loggedInEmail = auth.email || "";
  const userRole = auth.role || "employee";

  const techUsers = [
    { email: "bob.joe@allstars.com", name: "Bob Joe" },
    { email: "tech2@allstars.com", name: "Tech 2" },
    { email: "tech3@allstars.com", name: "Tech 3" },
  ];

  const visibleTickets = tickets.filter((t) => {
    if (userRole === "manager") {
      return true;
    }

    if (userRole === "tech") {
      return t.assignedTo === loggedInEmail;
    }

    return t.createdBy === loggedInEmail;
  });

  const openCount = visibleTickets.filter((t) => t.status === "Open").length;
  const inProgressCount = visibleTickets.filter((t) => t.status === "In Progress").length;
  const resolvedCount = visibleTickets.filter((t) => t.status === "Resolved").length;
  const closedCount = visibleTickets.filter((t) => t.status === "Closed").length;
  const activeCount = visibleTickets.filter(
    (t) => t.status === "Open" || t.status === "In Progress"
  ).length;

  const filteredTickets = visibleTickets.filter((t) => {
    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Active" &&
        (t.status === "Open" || t.status === "In Progress")) ||
      t.status === statusFilter;

    const normalizedPriority = t.priority?.toLowerCase() || "";
    const selectedPriority = priorityFilter.toLowerCase();

    const matchesPriority =
      priorityFilter === "All" ||
      normalizedPriority.startsWith(selectedPriority);

    const matchesSearch = t.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    return matchesStatus && matchesPriority && matchesSearch;
  });
  React.useEffect(() => {
    setTickets(getStoredTickets());
  }, []);

  const emptyMessage =
    userRole === "tech"
      ? "No tickets are currently assigned to you."
      : userRole === "employee"
        ? "You have not submitted any tickets yet."
        : "No tickets found matching your filters.";

  const handleAssignTicket = (ticketId, techEmail) => {
    const existingTicket = tickets.find((ticket) => ticket.id === ticketId);
    if (!existingTicket) return;

    if (techEmail && existingTicket.assignedTo !== techEmail) {
      addNotification({
        recipientEmail: techEmail,
        type: "ticket-assigned",
        title: "Ticket assigned to you",
        message: `Ticket #${existingTicket.id} has been assigned to you.`,
        ticketId: existingTicket.id,
      });
    }

    const updatedTicket = patchTicket(ticketId, {
      assignedTo: techEmail,
      status: techEmail ? "In Progress" : "Open",
    });

    if (!updatedTicket) return;

    setTickets((prevTickets) =>
      prevTickets.map((ticket) =>
        ticket.id === ticketId ? updatedTicket : ticket
      )
    );
  };

  const firstCardTitle = "Active";
  const firstCardCount = activeCount;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        border: "1px solid rgba(0,0,0,0.08)",
        bgcolor: "rgba(255,255,255,0.85)",
      }}
    >
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 650 }}>
            My Tickets
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage and resolve assigned IT support tickets
          </Typography>
        </Box>
      </Box>

      {/* Stat cards */}
      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid item xs={12} md={3}>
          <StatCard
            title={firstCardTitle}
            count={firstCardCount}
            onClick={() => setStatusFilter("Active")}
            active={statusFilter === "Active"}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            title="In Progress"
            count={inProgressCount}
            onClick={() => setStatusFilter("In Progress")}
            active={statusFilter === "In Progress"}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            title="Resolved"
            count={resolvedCount}
            onClick={() => setStatusFilter("Resolved")}
            active={statusFilter === "Resolved"}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            title="Closed"
            count={closedCount}
            onClick={() => setStatusFilter("Closed")}
            active={statusFilter === "Closed"}
          />
        </Grid>
      </Grid>

      {/* Filters row */}
      <Paper
        elevation={0}
        sx={{
          mt: 2,
          p: 2,
          borderRadius: 2,
          border: "1px solid rgba(0,0,0,0.08)",
          bgcolor: "white",
        }}
      >
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }}>
          <TextField
            placeholder="Search tickets..."
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flex: 1, minWidth: 220 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />

          <FormControl size="small" sx={{ minWidth: 160 }}>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              displayEmpty
            >
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Open">Open</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="Resolved">Resolved</MenuItem>
              <MenuItem value="Closed">Closed</MenuItem>
              <MenuItem value="All">All Statuses</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 180 }}>
            <Select value="Assigned to me" displayEmpty>
              <MenuItem value="Assigned to me">Assigned to me</MenuItem>
              <MenuItem value="All">All</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              displayEmpty
            >
              <MenuItem value="All">All Priorities</MenuItem>
              <MenuItem value="Low">Low</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="High">High</MenuItem>
              <MenuItem value="Critical">Critical</MenuItem>
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Checkbox
                checked={statusFilter === "All"}
                onChange={(e) => setStatusFilter(e.target.checked ? "All" : "Active")}
              />
            }
            label="Show All Tickets"
          />

          <Button
            variant="outlined"
            sx={{ whiteSpace: "nowrap" }}
            onClick={() => navigate("/create")}
          >
            + New Ticket
          </Button>
        </Stack>

        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
          {statusFilter === "All"
            ? `Showing all ${visibleTickets.length} tickets`
            : `Showing ${filteredTickets.length} ${statusFilter.toLowerCase()} tickets`}
        </Typography>
      </Paper>

      {/* Table */}
      <Paper
        elevation={0}
        sx={{
          mt: 2,
          borderRadius: 2,
          border: "1px solid rgba(0,0,0,0.08)",
          overflow: "hidden",
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "#f4f6fb" }}>
              <TableCell sx={{ width: 80 }}>ID</TableCell>
              <TableCell>Title</TableCell>
              <TableCell sx={{ width: 140 }}>Priority</TableCell>
              <TableCell sx={{ width: 140 }}>Status</TableCell>
              {userRole !== "employee" && (
                <TableCell sx={{ width: 180 }}>Assigned To</TableCell>
              )}
              <TableCell sx={{ width: 180 }}>Requester</TableCell>
              <TableCell sx={{ width: 160 }}>Last Updated</TableCell>
              <TableCell sx={{ width: 120, textAlign: "right" }}>Action</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredTickets.length > 0 ? (
              filteredTickets.map((t) => (
                <TableRow key={t.id} hover>
                  <TableCell>
                    <Button
                      variant="text"
                      size="small"
                      onClick={() => navigate(`/tickets/${t.id}`)}
                      sx={{
                        textTransform: "none",
                        fontWeight: 600,
                        minWidth: "auto",
                        p: 0,
                      }}
                    >
                      #{t.id}
                    </Button>
                  </TableCell>
                  <TableCell>{t.title}</TableCell>
                  <TableCell><PriorityChip value={t.priority} /></TableCell>
                  <TableCell><StatusChip value={t.status} /></TableCell>
                  {userRole !== "employee" && (
                    <TableCell>
                      {userRole === "manager" ? (
                        <Select
                          size="small"
                          value={t.assignedTo || ""}
                          displayEmpty
                          onChange={(e) => handleAssignTicket(t.id, e.target.value)}
                          sx={{ minWidth: 160 }}
                        >
                          <MenuItem value="">Unassigned</MenuItem>
                          {techUsers.map((tech) => (
                            <MenuItem key={tech.email} value={tech.email}>
                              {tech.name}
                            </MenuItem>
                          ))}
                        </Select>
                      ) : (
                        t.assignedTo || "Unassigned"
                      )}
                    </TableCell>
                  )}
                  <TableCell>{t.createdBy}</TableCell>
                  <TableCell>{t.createdAt}</TableCell>
                  <TableCell sx={{ textAlign: "right" }}>
                    <Button
                      size="small"
                      variant="outlined"
                      endIcon={<ChevronRightIcon />}
                      onClick={() => navigate(`/tickets/${t.id}`)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={userRole !== "employee" ? 8 : 7} sx={{ textAlign: "center", py: 4, color: "text.secondary" }}>
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Paper>
  );
}
