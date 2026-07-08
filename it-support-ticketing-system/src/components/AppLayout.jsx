import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Avatar,
  Paper,
  Breadcrumbs,
  Link,
  Stack,
  Button,
  Badge,
  Menu,
  MenuItem,
} from "@mui/material";
import React from "react";
import { Outlet, useLocation, useNavigate, Navigate } from "react-router-dom";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import AddBoxOutlinedIcon from "@mui/icons-material/AddBoxOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import Tooltip from "@mui/material/Tooltip";
import allStarsLogoStar from "../assets/allstarslogostar.png";
import { getNotifications, saveNotifications } from "../utils/notifications";
import CloseIcon from "@mui/icons-material/Close";

function NavItem({ active, icon, label, onClick }) {
  return (
    <Tooltip title={label} placement="right">
      <Box
        onClick={onClick}
        sx={{
          width: 56,
          height: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 2,
          cursor: "pointer",
          bgcolor: active ? "rgba(25, 118, 210, 0.14)" : "transparent",
          color: active ? "primary.main" : "text.secondary",
          "&:hover": { bgcolor: "rgba(0,0,0,0.06)" },
        }}
      >
        {icon}
      </Box>
    </Tooltip>
  );
}


export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const onTickets = location.pathname.startsWith("/tickets");
  const onCreate = location.pathname.startsWith("/create");
  const onInternalNotes = location.pathname.includes("/internal-notes");
  const onTicketDetails = location.pathname.startsWith("/tickets/") && !onInternalNotes;
  const [notifications, setNotifications] = React.useState([]);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = React.useState(null);
  const notificationsMenuOpen = Boolean(notificationsAnchorEl);

  const currentPage = onCreate
    ? "Create Ticket"
    : onInternalNotes
      ? "Internal Notes"
      : onTicketDetails
        ? "Ticket Details"
        : onTickets
          ? ""
          : "";
  const savedAuth = sessionStorage.getItem("allstars_auth");
  const auth = savedAuth ? JSON.parse(savedAuth) : null;
  const userRole = auth?.role || "employee";
  const showSidebar = userRole === "employee";

  if (!auth?.isLoggedIn) {
    return <Navigate to="/" replace />;
  }
  const displayName =
    auth.email === "bob.joe@allstars.com"
      ? "Bob Joe"
      : auth.email === "manager@allstars.com"
        ? "Manager"
        : "Employee";

  const displayRole =
    auth.role === "tech"
      ? "IT Technician"
      : auth.role === "manager"
        ? "Manager"
        : "Employee";

  const displayInitial = displayName.charAt(0).toUpperCase();


  const handleLogout = () => {
    sessionStorage.removeItem("allstars_auth");
    navigate("/");
  };

  const handleOpenNotificationsMenu = (event) => {
    setNotificationsAnchorEl(event.currentTarget);
  };

  const handleCloseNotificationsMenu = () => {
    setNotificationsAnchorEl(null);
  };

  const handleNotificationClick = (notification) => {
    const allNotifications = getNotifications();

    const updatedAllNotifications = allNotifications.map((item) =>
      item.id === notification.id ? { ...item, isRead: true } : item
    );

    saveNotifications(updatedAllNotifications);

    const updatedUserNotifications = updatedAllNotifications.filter(
      (item) => item.recipientEmail === auth?.email
    );

    setNotifications(updatedUserNotifications);
    handleCloseNotificationsMenu();

    if (notification.ticketId) {
      navigate(`/tickets/${notification.ticketId}`);
    }
  };

  const handleClearNotifications = () => {
    const allNotifications = getNotifications();

    const remainingNotifications = allNotifications.filter(
      (notification) => notification.recipientEmail !== auth?.email
    );

    saveNotifications(remainingNotifications);
    setNotifications([]);
    handleCloseNotificationsMenu();
  };

  const handleDeleteNotification = (notificationId) => {
    const allNotifications = getNotifications();

    const updatedAllNotifications = allNotifications.filter(
      (item) => item.id !== notificationId
    );

    saveNotifications(updatedAllNotifications);

    const updatedUserNotifications = updatedAllNotifications.filter(
      (item) => item.recipientEmail === auth?.email
    );

    setNotifications(updatedUserNotifications);
  };




  React.useEffect(() => {
    const loadNotifications = () => {
      const allNotifications = getNotifications();
      const userNotifications = allNotifications.filter(
        (notification) => notification.recipientEmail === auth?.email
      );
      setNotifications(userNotifications);
    };

    loadNotifications();
    window.addEventListener("focus", loadNotifications);

    return () => {
      window.removeEventListener("focus", loadNotifications);
    };
  }, [auth?.email, location.pathname]);

  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f3f5f9" }}>
      {/* Top bar */}
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: "#1f2430" }}>
        <Toolbar
          disableGutters
          sx={{ height: 40, minHeight: 40, px: 2, overflow: "visible", gap: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0 }}>
            <Box
              component="img"
              src={allStarsLogoStar}
              alt="All-Stars IT Solutions"
              sx={{ height: 80, width: "auto" }}
            />
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              All-Stars IT Solutions
            </Typography>
          </Box>

          <Box sx={{ flex: 1 }} />
          <IconButton color="inherit" onClick={handleOpenNotificationsMenu}>
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsNoneIcon />
            </Badge>
          </IconButton>

          <Menu
            anchorEl={notificationsAnchorEl}
            open={notificationsMenuOpen}
            onClose={handleCloseNotificationsMenu}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            {notifications.length > 0 ? (
              <>
                {notifications.map((notification) => (
                  <MenuItem
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    sx={{
                      maxWidth: 340,
                      whiteSpace: "normal",
                      alignItems: "flex-start",
                    }}
                  >
                    <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start", width: "100%" }}>
                      {!notification.isRead && (
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            bgcolor: "error.main",
                            mt: 0.75,
                            flexShrink: 0,
                          }}
                        />
                      )}

                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {notification.title}
                        </Typography>

                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            whiteSpace: "normal",
                          }}
                        >
                          {notification.message || "Open notification"}
                        </Typography>
                      </Box>

                      <IconButton
                        size="small"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleDeleteNotification(notification.id);
                        }}
                        sx={{ mt: -0.5 }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </MenuItem>
                ))}

                <MenuItem
                  onClick={handleClearNotifications}
                  sx={{ color: "error.main", fontWeight: 600 }}
                >
                  Clear All Notifications
                </MenuItem>
              </>
            ) : (
              <MenuItem onClick={handleCloseNotificationsMenu}>
                No Notifications
              </MenuItem>
            )}

          </Menu>

          <Button
            color="inherit"
            onClick={handleLogout}
            sx={{ textTransform: "none" }}
          >
            Logout
          </Button>

          <Stack direction="row" spacing={1} alignItems="center">
            <Avatar sx={{ width: 36, height: 36 }}>{displayInitial}</Avatar>
            <Box sx={{ lineHeight: 1 }}>
              <Typography variant="body2" sx={{ color: "white" }}>
                {displayName}
              </Typography>
              <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)" }}>
                {displayRole}
              </Typography>
            </Box>
          </Stack>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: "flex" }}>
        {/* Sidebar */}
        {showSidebar && (
          <Paper
            elevation={0}
            sx={{
              width: 88,
              bgcolor: "#eef1f6",
              borderRight: "1px solid rgba(0,0,0,0.08)",
              py: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 1,
            }}
          >
            <NavItem
              active={onTickets}
              icon={<InboxOutlinedIcon />}
              label="My Tickets"
              onClick={() => navigate("/tickets")}
            />

            <NavItem
              active={onCreate}
              icon={<AddBoxOutlinedIcon />}
              label="Create Ticket"
              onClick={() => navigate("/create")}
            />
          </Paper>
        )}

        {/* Main content */}
        <Box sx={{ flex: 1, p: 3 }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {currentPage}
            </Typography>
          </Box>

          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
