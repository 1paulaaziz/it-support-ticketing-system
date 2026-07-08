import React from "react";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Paper, Typography, Box, Button, TextField, Menu, MenuItem, IconButton, Dialog, DialogTitle, DialogContent, Autocomplete, Alert } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { addNotification, getNotifications, saveNotifications } from "../utils/notifications";
import { getTicketById, patchTicket, deleteTicket } from "../services/ticketsService";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import CloseIcon from "@mui/icons-material/Close";

export default function TicketDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [ticket, setTicket] = React.useState(null);
    const [newMessage, setNewMessage] = React.useState("");
    const [messageAttachments, setMessageAttachments] = React.useState([]);
    const auth = JSON.parse(sessionStorage.getItem("allstars_auth")) || {};
    const userRole = auth.role || "employee";
    const techUsers = [
        { email: "bob.joe@allstars.com", name: "Bob Joe" },
        { email: "tech2@allstars.com", name: "Tech 2" },
        { email: "tech3@allstars.com", name: "Tech 3" },
    ];
    const managerActionOptions = [
        { value: "reassign", label: "Reassign Ticket" },
        { value: "change-status", label: "Change Status" },
        { value: "change-impact", label: "Change Impact" },
        { value: "reopen-ticket", label: "Reopen Ticket" },
        { value: "other", label: "Other" },
    ];
    const [actionsAnchorEl, setActionsAnchorEl] = React.useState(null);
    const actionsMenuOpen = Boolean(actionsAnchorEl);
    const [reassignDialogOpen, setReassignDialogOpen] = React.useState(false);
    const [shouldOpenReassignDialog, setShouldOpenReassignDialog] = React.useState(false);
    const [priorityDialogOpen, setPriorityDialogOpen] = React.useState(false);
    const [impactDialogOpen, setImpactDialogOpen] = React.useState(false);
    const [statusDialogOpen, setStatusDialogOpen] = React.useState(false);
    const [managerRequestDialogOpen, setManagerRequestDialogOpen] = React.useState(false);
    const [managerRequestType, setManagerRequestType] = React.useState(null);
    const [managerRequestNote, setManagerRequestNote] = React.useState("");
    const [priorityRequestDialogOpen, setPriorityRequestDialogOpen] = React.useState(false);
    const [requestedPriority, setRequestedPriority] = React.useState("");
    const [priorityRequestNote, setPriorityRequestNote] = React.useState("");
    const [closureSuccessOpen, setClosureSuccessOpen] = React.useState(false);
    const [closureSuccessMessage, setClosureSuccessMessage] = React.useState("");
    const [requestMenuAnchorEl, setRequestMenuAnchorEl] = React.useState(null);
    const [selectedRequestId, setSelectedRequestId] = React.useState(null);
    const requestMenuOpen = Boolean(requestMenuAnchorEl);
    const [declineRequestDialogOpen, setDeclineRequestDialogOpen] = React.useState(false);
    const [declineRequestNote, setDeclineRequestNote] = React.useState("");

    const handleOpenActionsMenu = (event) => {
        setActionsAnchorEl(event.currentTarget);
    };

    const handleCloseActionsMenu = () => {
        setActionsAnchorEl(null);
    };

    const handleCloseTicket = () => {
        if (!ticket) return;

        const updatedTicket = patchTicket(ticket.id, {
            status: "Closed",
        });

        if (!updatedTicket) return;

        setTicket(updatedTicket);
        handleCloseActionsMenu();
    };

    const handleMarkResolved = () => {
        if (!ticket) return;

        const updatedTicket = patchTicket(ticket.id, {
            status: "Resolved",
        });

        if (!updatedTicket) return;

        setTicket(updatedTicket);
        handleCloseActionsMenu();
    };

    const handleOpenReassignMenu = () => {
        setShouldOpenReassignDialog(true);
        handleCloseActionsMenu();
    };

    const handleCloseReassignMenu = () => {
        setReassignDialogOpen(false);
    };

    const handleAssignTech = (techEmail) => {
        if (!ticket) return;

        const updatedTicket = patchTicket(ticket.id, {
            assignedTo: techEmail,
            status: techEmail ? "In Progress" : "Open",
        });

        if (!updatedTicket) return;

        setTicket(updatedTicket);
        handleCloseReassignMenu();
    };

    const handleOpenPriorityDialog = () => {
        handleCloseActionsMenu();
        setPriorityDialogOpen(true);
    };

    const handleClosePriorityDialog = () => {
        setPriorityDialogOpen(false);
    };

    const handleChangePriority = (newPriority) => {
        if (!ticket) return;

        const updatedTicket = patchTicket(ticket.id, {
            priority: newPriority,
        });

        if (!updatedTicket) return;

        setTicket(updatedTicket);
        handleClosePriorityDialog();
    };

    const handleOpenImpactDialog = () => {
        handleCloseActionsMenu();
        setImpactDialogOpen(true);
    };

    const handleCloseImpactDialog = () => {
        setImpactDialogOpen(false);
    };

    const handleChangeImpact = (newImpact) => {
        if (!ticket) return;

        const updatedTicket = patchTicket(ticket.id, {
            impact: newImpact,
        });

        if (!updatedTicket) return;

        setTicket(updatedTicket);
        handleCloseImpactDialog();
    };

    const handleReopenTicket = () => {
        if (!ticket) return;

        const updatedTicket = patchTicket(ticket.id, {
            status: "Open",
        });

        if (!updatedTicket) return;

        setTicket(updatedTicket);
        handleCloseActionsMenu();
    };

    const handleDeleteTicket = () => {
        if (!ticket) return;

        const confirmDelete = window.confirm(
            `Are you sure you want to delete Ticket #${ticket.id}?`
        );

        if (!confirmDelete) {
            handleCloseActionsMenu();
            return;
        }

        deleteTicket(ticket.id);
        handleCloseActionsMenu();
        navigate("/tickets");
    };

    const handleRequestClosure = () => {
        if (!ticket) return;

        const auth = JSON.parse(sessionStorage.getItem("allstars_auth")) || {};

        const requestMessage = {
            id: Date.now(),
            sender: auth.email || "unknown",
            role: auth.role || "tech",
            text: "Hi, I’m glad we were able to resolve your issue. I’ll request final review so this ticket can be closed.",
            createdAt: new Date().toLocaleString(),
        };

        const newManagerRequest = {
            id: Date.now() + 1,
            requestedBy: auth.email || "unknown",
            role: auth.role || "tech",
            type: "close-ticket",
            label: "Close Ticket",
            note: "",
            status: "Pending",
            createdAt: new Date().toLocaleString(),
        };

        const updatedTicket = patchTicket(ticket.id, {
            messages: [...(ticket.messages || []), requestMessage],
            managerRequests: [...(ticket.managerRequests || []), newManagerRequest],
        });

        if (!updatedTicket) return;

        setTicket(updatedTicket);

        addNotification({
            recipientEmail: "manager@allstars.com",
            type: "manager-request",
            title: "Closure review requested",
            message: `Ticket #${ticket.id} was submitted for closure review.`,
            ticketId: ticket.id,
        });

        handleCloseActionsMenu();
        setClosureSuccessMessage("Manager has been informed that closure was requested.");
    };

    const handleOpenStatusDialog = () => {
        handleCloseActionsMenu();
        setStatusDialogOpen(true);
    };

    const handleCloseStatusDialog = () => {
        setStatusDialogOpen(false);
    };

    const handleChangeStatus = (newStatus) => {
        if (!ticket) return;

        const updatedTicket = patchTicket(ticket.id, {
            status: newStatus,
        });

        if (!updatedTicket) return;

        setTicket(updatedTicket);
        handleCloseStatusDialog();
    };


    const handleOpenManagerRequestDialog = () => {
        handleCloseActionsMenu();
        setManagerRequestDialogOpen(true);
    };

    const handleCloseManagerRequestDialog = () => {
        setManagerRequestDialogOpen(false);
        setManagerRequestType(null);
        setManagerRequestNote("");
    };

    const handleSubmitManagerRequest = () => {
        if (!ticket || !managerRequestType) return;

        const auth = JSON.parse(sessionStorage.getItem("allstars_auth")) || {};

        const newRequest = {
            id: Date.now(),
            requestedBy: auth.email || "unknown",
            role: auth.role || "tech",
            type: managerRequestType.value,
            label: managerRequestType.label,
            note: managerRequestNote.trim(),
            status: "Pending",
            createdAt: new Date().toLocaleString(),
        };

        const updatedTicket = patchTicket(ticket.id, {
            managerRequests: [...(ticket.managerRequests || []), newRequest],
        });

        if (!updatedTicket) return;

        setTicket(updatedTicket);

        addNotification({
            recipientEmail: "manager@allstars.com",
            type: "manager-request",
            title: "Manager action requested",
            message: newRequest.note
                ? `${newRequest.label} was requested for Ticket #${ticket.id}. Note: ${newRequest.note}`
                : `${newRequest.label} was requested for Ticket #${ticket.id}.`,
            ticketId: ticket.id,
        });

        handleCloseManagerRequestDialog();
    };


    const handleOpenPriorityRequestDialog = () => {
        handleCloseActionsMenu();
        setPriorityRequestDialogOpen(true);
    };

    const handleClosePriorityRequestDialog = () => {
        setPriorityRequestDialogOpen(false);
        setRequestedPriority("");
        setPriorityRequestNote("");
    };

    const handleSubmitPriorityRequest = () => {
        if (!ticket || !requestedPriority) return;

        const auth = JSON.parse(sessionStorage.getItem("allstars_auth")) || {};

        const newRequest = {
            id: Date.now(),
            requestedBy: auth.email || "unknown",
            role: auth.role || "tech",
            type: "change-priority",
            label: "Change Priority",
            requestedValue: requestedPriority,
            note: priorityRequestNote.trim(),
            status: "Pending",
            createdAt: new Date().toLocaleString(),
        };

        const updatedTicket = patchTicket(ticket.id, {
            managerRequests: [...(ticket.managerRequests || []), newRequest],
        });

        if (!updatedTicket) return;

        setTicket(updatedTicket);

        addNotification({
            recipientEmail: "manager@allstars.com",
            type: "manager-request",
            title: "Priority change requested",
            message: newRequest.note
                ? `Priority change to "${requestedPriority}" was requested for Ticket #${ticket.id}. Note: ${newRequest.note}`
                : `Priority change to "${requestedPriority}" was requested for Ticket #${ticket.id}.`,
            ticketId: ticket.id,
        });

        handleClosePriorityRequestDialog();
    };

    const handleOpenInternalNotesPage = () => {
        if (!ticket) return;

        handleCloseActionsMenu();
        window.open(`/tickets/${ticket.id}/internal-notes`, "_blank");
    };

    const handleOpenAttachment = (file) => {
        if (!file?.data) return;

        const newWindow = window.open("", "_blank");
        if (!newWindow) return;

        const isImage = file.type?.startsWith("image/");
        const isPdf = file.type === "application/pdf";

        newWindow.document.open();
        newWindow.document.write(`
        <html>
            <head>
                <title>${file.name || "Attachment"}</title>
                <style>
                    body {
                        margin: 0;
                        padding: 24px;
                        font-family: Arial, sans-serif;
                        background: #f5f7fb;
                    }
                    .file-name {
                        margin-bottom: 16px;
                        font-size: 18px;
                        font-weight: 600;
                    }
                    .preview-image {
                        max-width: 100%;
                        height: auto;
                        border-radius: 8px;
                        border: 1px solid rgba(0,0,0,0.08);
                        background: white;
                    }
                    .download-link {
                        font-size: 16px;
                    }
                    iframe {
                        width: 100%;
                        height: 90vh;
                        border: 1px solid rgba(0,0,0,0.08);
                        border-radius: 8px;
                        background: white;
                    }
                </style>
            </head>
            <body>
                <div class="file-name">${file.name || "Attachment"}</div>
                <div id="preview-root"></div>
            </body>
        </html>
    `);
        newWindow.document.close();

        const previewRoot = newWindow.document.getElementById("preview-root");
        if (!previewRoot) return;

        if (isImage) {
            const img = newWindow.document.createElement("img");
            img.src = file.data;
            img.alt = file.name || "Attachment";
            img.className = "preview-image";
            previewRoot.appendChild(img);
            return;
        }

        if (isPdf) {
            const iframe = newWindow.document.createElement("iframe");
            iframe.src = file.data;
            iframe.title = file.name || "Attachment";
            previewRoot.appendChild(iframe);
            return;
        }

        const link = newWindow.document.createElement("a");
        link.href = file.data;
        link.download = file.name || "attachment";
        link.textContent = "Download attachment";
        link.className = "download-link";
        previewRoot.appendChild(link);
    };


    const handleApproveManagerRequest = (requestId) => {
        if (!ticket) return;

        const requestToApprove = (ticket.managerRequests || []).find(
            (request) => request.id === requestId
        );

        if (!requestToApprove) return;

        const updatedTicket = patchTicket(ticket.id, {
            managerRequests: (ticket.managerRequests || []).map((request) =>
                request.id === requestId
                    ? {
                        ...request,
                        status: "Approved",
                        respondedAt: new Date().toLocaleString(),
                    }
                    : request
            ),
        });

        if (!updatedTicket) return;

        setTicket(updatedTicket);

        addNotification({
            recipientEmail: requestToApprove.requestedBy,
            type: "request-approved",
            title: "Manager approved your request",
            message: `${requestToApprove.label} for Ticket #${ticket.id} was approved.`,
            ticketId: ticket.id,
        });
    };


    const handleOpenRequestMenu = (event, requestId) => {
        setRequestMenuAnchorEl(event.currentTarget);
        setSelectedRequestId(requestId);
    };

    const handleCloseRequestMenu = () => {
        setRequestMenuAnchorEl(null);
        setSelectedRequestId(null);
    };


    const handleOpenDeclineRequestDialog = () => {
        setDeclineRequestDialogOpen(true);
        setRequestMenuAnchorEl(null);
    };

    const handleCloseDeclineRequestDialog = () => {
        setDeclineRequestDialogOpen(false);
        setDeclineRequestNote("");
        setSelectedRequestId(null);
    };

    const handleDeclineManagerRequest = () => {
        if (!ticket || !selectedRequestId) return;

        const requestToDecline = (ticket.managerRequests || []).find(
            (request) => request.id === selectedRequestId
        );

        if (!requestToDecline) return;

        const note = declineRequestNote.trim();

        const updatedTicket = patchTicket(ticket.id, {
            managerRequests: (ticket.managerRequests || []).map((request) =>
                request.id === selectedRequestId
                    ? {
                        ...request,
                        status: "Declined",
                        managerResponseNote: note,
                        respondedAt: new Date().toLocaleString(),
                    }
                    : request
            ),
        });

        if (!updatedTicket) return;

        setTicket(updatedTicket);

        addNotification({
            recipientEmail: requestToDecline.requestedBy,
            type: "request-declined",
            title: "Manager declined your request",
            message: note
                ? `${requestToDecline.label} for Ticket #${ticket.id} was declined. Note: ${note}`
                : `${requestToDecline.label} for Ticket #${ticket.id} was declined.`,
            ticketId: ticket.id,
        });

        handleCloseDeclineRequestDialog();
        setSelectedRequestId(null);
    };




    React.useEffect(() => {
        const foundTicket = getTicketById(id);

        setTicket(
            foundTicket
                ? {
                    ...foundTicket,
                    messages: foundTicket.messages || [],
                    attachments: foundTicket.attachments || [],
                    managerRequests: foundTicket.managerRequests || [],
                }
                : null
        );
    }, [id]);

    React.useEffect(() => {
        const allNotifications = getNotifications();

        const updatedNotifications = allNotifications.map((notification) =>
            notification.type === "conversation-message" &&
                notification.recipientEmail === auth.email &&
                String(notification.ticketId) === String(id)
                ? { ...notification, isRead: true }
                : notification
        );

        saveNotifications(updatedNotifications);
    }, [auth.email, id]);

    React.useEffect(() => {
        if (!actionsMenuOpen && shouldOpenReassignDialog) {
            setReassignDialogOpen(true);
            setShouldOpenReassignDialog(false);
        }
    }, [actionsMenuOpen, shouldOpenReassignDialog]);

    const createConversationNotification = (recipientEmail) => {
        if (!ticket || !recipientEmail || recipientEmail === auth.email) return;

        const allNotifications = getNotifications();

        const existingUnreadNotification = allNotifications.find(
            (notification) =>
                notification.type === "conversation-message" &&
                notification.recipientEmail === recipientEmail &&
                String(notification.ticketId) === String(ticket.id) &&
                !notification.isRead
        );

        if (existingUnreadNotification) return;

        addNotification({
            recipientEmail,
            type: "conversation-message",
            title: `New message on Ticket #${ticket.id}`,
            message: `${auth.email} sent a new message on "${ticket.title}".`,
            ticketId: ticket.id,
        });
    };


    const readFileAsDataUrl = (file) =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                resolve({
                    name: file.name,
                    type: file.type,
                    data: reader.result,
                });
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });

    const compressImageFile = (file) =>
        new Promise((resolve, reject) => {
            const fileReader = new FileReader();

            fileReader.onload = () => {
                const img = new Image();

                img.onload = () => {
                    const maxWidth = 1200;
                    const maxHeight = 1200;

                    let { width, height } = img;

                    if (width > maxWidth || height > maxHeight) {
                        const scale = Math.min(maxWidth / width, maxHeight / height);
                        width = Math.round(width * scale);
                        height = Math.round(height * scale);
                    }

                    const canvas = document.createElement("canvas");
                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext("2d");
                    if (!ctx) {
                        reject(new Error("Canvas context not available"));
                        return;
                    }

                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob(
                        (blob) => {
                            if (!blob) {
                                reject(new Error("Image compression failed"));
                                return;
                            }

                            const compressedReader = new FileReader();
                            compressedReader.onloadend = () => {
                                resolve({
                                    name: file.name.replace(/\.\w+$/, ".jpg"),
                                    type: "image/jpeg",
                                    data: compressedReader.result,
                                });
                            };
                            compressedReader.onerror = reject;
                            compressedReader.readAsDataURL(blob);
                        },
                        "image/jpeg",
                        0.55
                    );
                };

                img.onerror = reject;
                img.src = fileReader.result;
            };

            fileReader.onerror = reject;
            fileReader.readAsDataURL(file);
        });

    const handleMessageAttachmentChange = async (event) => {
        const files = Array.from(event.target.files || []);
        if (!files.length) return;

        try {
            const newAttachments = await Promise.all(
                files.map((file) => {
                    if (file.type?.startsWith("image/")) {
                        return compressImageFile(file);
                    }

                    return readFileAsDataUrl(file);
                })
            );

            setMessageAttachments((prev) => [...prev, ...newAttachments]);
            event.target.value = "";
        } catch (error) {
            alert("Could not process that attachment. Try a smaller image or different file.");
            console.error("Failed to prepare message attachment:", error);
        }
    };

    const handleRemoveMessageAttachment = (indexToRemove) => {
        setMessageAttachments((prev) =>
            prev.filter((_, index) => index !== indexToRemove)
        );
    };

    const handleSendMessage = () => {
        if ((!newMessage.trim() && messageAttachments.length === 0) || !ticket) return;

        const auth = JSON.parse(sessionStorage.getItem("allstars_auth")) || {};

        const message = {
            id: Date.now(),
            sender: auth.email || "unknown",
            role: auth.role || "employee",
            text: newMessage.trim(),
            createdAt: new Date().toLocaleString(),
            attachments: messageAttachments,
        };

        let updatedTicket = null;

        try {
            updatedTicket = patchTicket(ticket.id, {
                messages: [...(ticket.messages || []), message],
            });
        } catch (error) {
            alert("That attachment is probably too large to save locally. Try a smaller screenshot or image.");
            console.error("Failed to save message attachment:", error);
            return;
        }

        if (!updatedTicket) return;

        setTicket(updatedTicket);
        setNewMessage("");
        setMessageAttachments([]);

        let recipientEmail = "";

        if (auth.role === "employee") {
            recipientEmail = updatedTicket.assignedTo || "";
        } else {
            recipientEmail = updatedTicket.createdBy || "";
        }

        createConversationNotification(recipientEmail);
    };

    if (!ticket) {
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
                <Typography variant="h5" sx={{ fontWeight: 650 }}>
                    Ticket not found
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    This ticket could not be found.
                </Typography>
            </Paper>
        );
    }

    return (
        <>
            {closureSuccessMessage && (
                <Alert
                    severity="success"
                    sx={{ mb: 2 }}
                    onClose={() => setClosureSuccessMessage("")}
                >
                    {closureSuccessMessage}
                </Alert>
            )}
            <Box sx={{ mb: 2 }}>
                <Button
                    variant="text"
                    onClick={() => navigate("/tickets")}
                    sx={{ textTransform: "none", px: 0 }}
                >
                    ← Back to My Tickets
                </Button>
            </Box>

            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", lg: "2.5fr .7fr" },
                    gap: 2,
                    alignItems: "start",
                }}
            >
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            borderRadius: 3,
                            border: "1px solid rgba(0,0,0,0.08)",
                            bgcolor: "rgba(255,255,255,0.92)",
                        }}
                    >
                        <Typography variant="overline" color="text.secondary">
                            Ticket #{ticket.id}
                        </Typography>

                        <Typography variant="h4" sx={{ fontWeight: 700, mt: 0.5 }}>
                            {ticket.title}
                        </Typography>

                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Created by {ticket.createdBy} on {ticket.createdAt}
                        </Typography>
                    </Paper>


                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            borderRadius: 3,
                            border: "1px solid rgba(0,0,0,0.08)",
                            bgcolor: "rgba(255,255,255,0.92)",
                        }}
                    >
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1.5 }}>
                            Description
                        </Typography>

                        <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                            {ticket.description}
                        </Typography>
                    </Paper>

                    {ticket.attachments && ticket.attachments.length > 0 && (
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                borderRadius: 3,
                                border: "1px solid rgba(0,0,0,0.08)",
                                bgcolor: "rgba(255,255,255,0.92)",
                            }}
                        >
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1.5 }}>
                                Attachments
                            </Typography>

                            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                                {ticket.attachments.map((file, index) => (
                                    <Button
                                        key={`${file.name}-${index}`}
                                        variant="text"
                                        onClick={() => handleOpenAttachment(file)}
                                        sx={{
                                            textTransform: "none",
                                            px: 0,
                                            justifyContent: "flex-start",
                                            fontWeight: 500,
                                        }}
                                    >
                                        {file.name}
                                    </Button>
                                ))}
                            </Box>

                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                Opens each file in a new tab.
                            </Typography>
                        </Paper>
                    )}

                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            borderRadius: 3,
                            border: "1px solid rgba(0,0,0,0.08)",
                            bgcolor: "rgba(255,255,255,0.92)",
                        }}
                    >
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                            Conversation
                        </Typography>

                        <Box
                            sx={{
                                border: "1px solid rgba(0,0,0,0.08)",
                                borderRadius: 2,
                                overflow: "hidden",
                                bgcolor: "#fafbfe",
                            }}
                        >
                            <Box
                                sx={{
                                    minHeight: 220,
                                    maxHeight: 600,
                                    overflowY: "auto",
                                    p: 2,
                                    borderBottom: "1px solid rgba(0,0,0,0.08)",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 1.5,
                                }}
                            >
                                {ticket.messages && ticket.messages.length > 0 ? (
                                    ticket.messages.map((message) => (
                                        <Box
                                            key={message.id}
                                            sx={{
                                                p: 1.5,
                                                borderRadius: 2,
                                                bgcolor: "white",
                                                border: "1px solid rgba(0,0,0,0.06)",
                                            }}
                                        >
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                {message.sender} ({message.role})
                                            </Typography>

                                            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.25 }}>
                                                {message.createdAt}
                                            </Typography>

                                            <Typography variant="body2" sx={{ mt: 1, whiteSpace: "pre-wrap" }}>
                                                {message.text}
                                            </Typography>
                                            {message.attachments && message.attachments.length > 0 && (
                                                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, mt: 1 }}>
                                                    {message.attachments.map((file, index) => (
                                                        <Button
                                                            key={`${file.name}-${index}`}
                                                            variant="text"
                                                            onClick={() => handleOpenAttachment(file)}
                                                            sx={{
                                                                textTransform: "none",
                                                                px: 0,
                                                                py: 0,
                                                                justifyContent: "flex-start",
                                                                fontWeight: 500,
                                                                minWidth: "auto",
                                                            }}
                                                        >
                                                            {file.name}
                                                        </Button>
                                                    ))}
                                                </Box>
                                            )}
                                        </Box>
                                    ))
                                ) : (
                                    <Box
                                        sx={{
                                            flex: 1,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            textAlign: "center",
                                        }}
                                    >
                                        <Box>
                                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                No messages yet
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                                Start the conversation.
                                            </Typography>
                                        </Box>
                                    </Box>
                                )}
                            </Box>

                            <Box
                                sx={{
                                    p: 2,
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 1,
                                    bgcolor: "white",
                                }}
                            >
                                {messageAttachments.length > 0 && (
                                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
                                        {messageAttachments.map((file, index) => (
                                            <Box
                                                key={`${file.name}-${index}`}
                                                sx={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "space-between",
                                                    gap: 1,
                                                    px: 1.25,
                                                    py: 0.75,
                                                    borderRadius: 2,
                                                    bgcolor: "#f5f7fb",
                                                    border: "1px solid rgba(0,0,0,0.08)",
                                                }}
                                            >
                                                <Typography variant="body2" sx={{ overflowWrap: "anywhere" }}>
                                                    {file.name}
                                                </Typography>

                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleRemoveMessageAttachment(index)}
                                                >
                                                    <CloseIcon fontSize="small" />
                                                </IconButton>
                                            </Box>
                                        ))}
                                    </Box>
                                )}

                                <Box
                                    sx={{
                                        display: "flex",
                                        gap: 1,
                                        alignItems: "flex-end",
                                    }}
                                >
                                    <TextField
                                        fullWidth
                                        multiline
                                        minRows={2}
                                        placeholder="Write a reply..."
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                    />

                                    <Button
                                        variant="outlined"
                                        component="label"
                                        sx={{ minWidth: "auto", px: 1.5 }}
                                    >
                                        <AttachFileIcon />
                                        <input
                                            type="file"
                                            hidden
                                            multiple
                                            onChange={handleMessageAttachmentChange}
                                        />
                                    </Button>

                                    <Button variant="contained" onClick={handleSendMessage}>
                                        Send
                                    </Button>
                                </Box>
                            </Box>
                        </Box>
                    </Paper>
                </Box>

                <Paper
                    elevation={0}
                    sx={{
                        p: 3,
                        borderRadius: 3,
                        border: "1px solid rgba(0,0,0,0.08)",
                        bgcolor: "rgba(255,255,255,0.92)",
                    }}
                >
                    <Box sx={{ pt: 1 }}>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                Actions
                            </Typography>

                            <IconButton onClick={handleOpenActionsMenu} size="small">
                                <MoreVertIcon />
                            </IconButton>
                        </Box>

                        <Menu
                            anchorEl={actionsAnchorEl}
                            open={actionsMenuOpen}
                            onClose={handleCloseActionsMenu}
                        >
                            {userRole === "employee" && [
                                <MenuItem key="mark-resolved" onClick={handleMarkResolved}>
                                    Mark Resolved
                                </MenuItem>,
                            ]}

                            {userRole === "tech" && [
                                <MenuItem key="request-priority-change" onClick={handleOpenPriorityRequestDialog}>
                                    Request Priority Change
                                </MenuItem>,
                                <MenuItem key="request-closure" onClick={handleRequestClosure}>
                                    Request Closure
                                </MenuItem>,
                                <MenuItem key="request-manager" onClick={handleOpenManagerRequestDialog}>
                                    Request Manager Action
                                </MenuItem>,
                                <MenuItem key="internal-notes-page" onClick={handleOpenInternalNotesPage}>
                                    Internal Notes
                                </MenuItem>,
                            ]}

                            {userRole === "manager" && [
                                <MenuItem key="reassign-ticket" onClick={handleOpenReassignMenu}>
                                    Reassign Ticket
                                </MenuItem>,
                                <MenuItem key="change-status" onClick={handleOpenStatusDialog}>
                                    Change Status
                                </MenuItem>,
                                <MenuItem key="change-priority" onClick={handleOpenPriorityDialog}>
                                    Change Priority
                                </MenuItem>,
                                <MenuItem key="change-impact" onClick={handleOpenImpactDialog}>
                                    Change Impact
                                </MenuItem>,
                                ticket.status === "Closed"
                                    ? <MenuItem key="reopen-ticket" onClick={handleReopenTicket}>
                                        Reopen Ticket
                                    </MenuItem>
                                    : <MenuItem key="close-ticket" onClick={handleCloseTicket}>
                                        Close Ticket
                                    </MenuItem>,
                                <MenuItem key="internal-notes-page-manager" onClick={handleOpenInternalNotesPage}>
                                    Internal Notes
                                </MenuItem>,
                                <MenuItem
                                    key="delete-ticket"
                                    onClick={handleDeleteTicket}
                                    sx={{ color: "error.main" }}
                                >
                                    Delete Ticket
                                </MenuItem>,
                            ]}
                        </Menu>
                        <Dialog open={reassignDialogOpen} onClose={handleCloseReassignMenu} maxWidth="xs" fullWidth>
                            <DialogTitle sx={{ fontWeight: 600 }}>
                                Reassign Ticket
                            </DialogTitle>

                            <DialogContent>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    Please select a technician to assign this ticket to.
                                </Typography>

                                <Autocomplete
                                    options={[
                                        { email: "", name: "Unassigned" },
                                        ...techUsers,
                                    ]}
                                    getOptionLabel={(option) => option.name}
                                    value={
                                        [{ email: "", name: "Unassigned" }, ...techUsers].find(
                                            (tech) => tech.email === (ticket.assignedTo || "")
                                        ) || null
                                    }
                                    onChange={(event, value, reason) => {
                                        if (reason === "selectOption") {
                                            handleAssignTech(value.email);
                                        }
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Select Technician"
                                            placeholder="Search technician..."
                                        />
                                    )}
                                />
                            </DialogContent>
                        </Dialog>

                        <Dialog open={priorityDialogOpen} onClose={handleClosePriorityDialog} maxWidth="xs" fullWidth>
                            <DialogTitle sx={{ fontWeight: 600 }}>
                                Change Priority
                            </DialogTitle>

                            <DialogContent>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    Please select a new priority for this ticket.
                                </Typography>

                                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                                    <Button
                                        variant="contained"
                                        onClick={() => handleChangePriority("Low - not time sensitive")}
                                        sx={{
                                            textTransform: "none",
                                            justifyContent: "center",
                                            borderRadius: 2,
                                            py: .95,
                                            backgroundColor: "#f5f7fb",
                                            color: "#1a1a1a",
                                            boxShadow: "none",
                                            border: "1px solid rgba(0,0,0,0.08)",
                                            "&:hover": {
                                                backgroundColor: "#eef2ff",
                                                boxShadow: "none",
                                            },
                                        }}
                                    >
                                        Low - not time sensitive
                                    </Button>

                                    <Button
                                        variant="contained"
                                        onClick={() => handleChangePriority("Medium - needed soon")}
                                        sx={{
                                            textTransform: "none",
                                            justifyContent: "center",
                                            borderRadius: 2,
                                            py: .95,
                                            backgroundColor: "#f5f7fb",
                                            color: "#1a1a1a",
                                            boxShadow: "none",
                                            border: "1px solid rgba(0,0,0,0.08)",
                                            "&:hover": {
                                                backgroundColor: "#eef2ff",
                                                boxShadow: "none",
                                            },
                                        }}
                                    >
                                        Medium - needed soon
                                    </Button>

                                    <Button
                                        variant="contained"
                                        onClick={() => handleChangePriority("High - work blocked")}
                                        sx={{
                                            textTransform: "none",
                                            justifyContent: "center",
                                            borderRadius: 2,
                                            py: .95,
                                            backgroundColor: "#f5f7fb",
                                            color: "#1a1a1a",
                                            boxShadow: "none",
                                            border: "1px solid rgba(0,0,0,0.08)",
                                            "&:hover": {
                                                backgroundColor: "#eef2ff",
                                                boxShadow: "none",
                                            },
                                        }}
                                    >
                                        High - work blocked
                                    </Button>

                                    <Button
                                        variant="contained"
                                        onClick={() => handleChangePriority("Critical - outage")}
                                        sx={{
                                            textTransform: "none",
                                            justifyContent: "center",
                                            borderRadius: 2,
                                            py: .95,
                                            backgroundColor: "#f5f7fb",
                                            color: "#1a1a1a",
                                            boxShadow: "none",
                                            border: "1px solid rgba(0,0,0,0.08)",
                                            "&:hover": {
                                                backgroundColor: "#eef2ff",
                                                boxShadow: "none",
                                            },
                                        }}
                                    >
                                        Critical - outage
                                    </Button>
                                </Box>
                            </DialogContent>
                        </Dialog>
                        <Dialog open={impactDialogOpen} onClose={handleCloseImpactDialog} maxWidth="xs" fullWidth>
                            <DialogTitle sx={{ fontWeight: 600 }}>
                                Change Impact
                            </DialogTitle>

                            <DialogContent>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    Please select a new impact level for this ticket.
                                </Typography>

                                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                                    <Button
                                        variant="contained"
                                        onClick={() => handleChangeImpact("Single User")}
                                        sx={{
                                            textTransform: "none",
                                            justifyContent: "center",
                                            borderRadius: 2,
                                            py: 1.2,
                                            backgroundColor: "#f5f7fb",
                                            color: "#1a1a1a",
                                            boxShadow: "none",
                                            border: "1px solid rgba(0,0,0,0.08)",
                                            "&:hover": {
                                                backgroundColor: "#eef2ff",
                                                boxShadow: "none",
                                            },
                                        }}
                                    >
                                        Single User
                                    </Button>

                                    <Button
                                        variant="contained"
                                        onClick={() => handleChangeImpact("Multiple People")}
                                        sx={{
                                            textTransform: "none",
                                            justifyContent: "center",
                                            borderRadius: 2,
                                            py: 1.2,
                                            backgroundColor: "#f5f7fb",
                                            color: "#1a1a1a",
                                            boxShadow: "none",
                                            border: "1px solid rgba(0,0,0,0.08)",
                                            "&:hover": {
                                                backgroundColor: "#eef2ff",
                                                boxShadow: "none",
                                            },
                                        }}
                                    >
                                        Multiple People
                                    </Button>

                                    <Button
                                        variant="contained"
                                        onClick={() => handleChangeImpact("Department-wide")}
                                        sx={{
                                            textTransform: "none",
                                            justifyContent: "center",
                                            borderRadius: 2,
                                            py: 1.2,
                                            backgroundColor: "#f5f7fb",
                                            color: "#1a1a1a",
                                            boxShadow: "none",
                                            border: "1px solid rgba(0,0,0,0.08)",
                                            "&:hover": {
                                                backgroundColor: "#eef2ff",
                                                boxShadow: "none",
                                            },
                                        }}
                                    >
                                        Department-wide
                                    </Button>

                                    <Button
                                        variant="contained"
                                        onClick={() => handleChangeImpact("Company-wide")}
                                        sx={{
                                            textTransform: "none",
                                            justifyContent: "center",
                                            borderRadius: 2,
                                            py: 1.2,
                                            backgroundColor: "#f5f7fb",
                                            color: "#1a1a1a",
                                            boxShadow: "none",
                                            border: "1px solid rgba(0,0,0,0.08)",
                                            "&:hover": {
                                                backgroundColor: "#eef2ff",
                                                boxShadow: "none",
                                            },
                                        }}
                                    >
                                        Company-wide
                                    </Button>
                                </Box>
                            </DialogContent>
                        </Dialog>
                        <Dialog open={statusDialogOpen} onClose={handleCloseStatusDialog} maxWidth="xs" fullWidth>
                            <DialogTitle sx={{ fontWeight: 600 }}>
                                Change Status
                            </DialogTitle>

                            <DialogContent>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    Please select a new status for this ticket.
                                </Typography>

                                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                                    <Button
                                        variant="contained"
                                        onClick={() => handleChangeStatus("Open")}
                                        sx={{
                                            textTransform: "none",
                                            justifyContent: "center",
                                            borderRadius: 2,
                                            py: 1.2,
                                            backgroundColor: "#f5f7fb",
                                            color: "#1a1a1a",
                                            boxShadow: "none",
                                            border: "1px solid rgba(0,0,0,0.08)",
                                            "&:hover": {
                                                backgroundColor: "#eef2ff",
                                                boxShadow: "none",
                                            },
                                        }}
                                    >
                                        Open
                                    </Button>

                                    <Button
                                        variant="contained"
                                        onClick={() => handleChangeStatus("In Progress")}
                                        sx={{
                                            textTransform: "none",
                                            justifyContent: "center",
                                            borderRadius: 2,
                                            py: 1.2,
                                            backgroundColor: "#f5f7fb",
                                            color: "#1a1a1a",
                                            boxShadow: "none",
                                            border: "1px solid rgba(0,0,0,0.08)",
                                            "&:hover": {
                                                backgroundColor: "#eef2ff",
                                                boxShadow: "none",
                                            },
                                        }}
                                    >
                                        In Progress
                                    </Button>

                                    <Button
                                        variant="contained"
                                        onClick={() => handleChangeStatus("Resolved")}
                                        sx={{
                                            textTransform: "none",
                                            justifyContent: "center",
                                            borderRadius: 2,
                                            py: 1.2,
                                            backgroundColor: "#f5f7fb",
                                            color: "#1a1a1a",
                                            boxShadow: "none",
                                            border: "1px solid rgba(0,0,0,0.08)",
                                            "&:hover": {
                                                backgroundColor: "#eef2ff",
                                                boxShadow: "none",
                                            },
                                        }}
                                    >
                                        Resolved
                                    </Button>

                                    <Button
                                        variant="contained"
                                        onClick={() => handleChangeStatus("Closed")}
                                        sx={{
                                            textTransform: "none",
                                            justifyContent: "center",
                                            borderRadius: 2,
                                            py: 1.2,
                                            backgroundColor: "#f5f7fb",
                                            color: "#1a1a1a",
                                            boxShadow: "none",
                                            border: "1px solid rgba(0,0,0,0.08)",
                                            "&:hover": {
                                                backgroundColor: "#eef2ff",
                                                boxShadow: "none",
                                            },
                                        }}
                                    >
                                        Closed
                                    </Button>
                                </Box>
                            </DialogContent>
                        </Dialog>
                        <Dialog open={managerRequestDialogOpen} onClose={handleCloseManagerRequestDialog} maxWidth="sm" fullWidth>
                            <DialogTitle sx={{ fontWeight: 600 }}>
                                Request Manager Action
                            </DialogTitle>

                            <DialogContent>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    Select the manager action you need, and add an optional note.
                                </Typography>

                                <TextField
                                    select
                                    fullWidth
                                    label="Manager Action"
                                    value={managerRequestType?.value || ""}
                                    onChange={(e) => {
                                        const selectedOption = managerActionOptions.find(
                                            (option) => option.value === e.target.value
                                        ) || null;
                                        setManagerRequestType(selectedOption);
                                    }}
                                    sx={{ mb: 2, mt: 1 }}
                                >
                                    {managerActionOptions.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </TextField>

                                <TextField
                                    fullWidth
                                    multiline
                                    minRows={managerRequestType?.value === "other" ? 4 : 3}
                                    label={managerRequestType?.value === "other" ? "Custom Request" : "Note for Manager"}
                                    placeholder={
                                        managerRequestType?.value === "other"
                                            ? "Describe what you need from the manager..."
                                            : "Add any helpful context for the manager..."
                                    }
                                    value={managerRequestNote}
                                    onChange={(e) => setManagerRequestNote(e.target.value)}
                                />

                                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 2 }}>
                                    <Button variant="outlined" onClick={handleCloseManagerRequestDialog}>
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="contained"
                                        onClick={handleSubmitManagerRequest}
                                        disabled={!managerRequestType}
                                    >
                                        Submit Request
                                    </Button>
                                </Box>
                            </DialogContent>
                        </Dialog>

                        <Dialog open={priorityRequestDialogOpen} onClose={handleClosePriorityRequestDialog} maxWidth="sm" fullWidth>
                            <DialogTitle sx={{ fontWeight: 600 }}>
                                Request Priority Change
                            </DialogTitle>

                            <DialogContent>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    Select the priority you want reviewed, and add an optional note for the manager.
                                </Typography>

                                <TextField
                                    select
                                    fullWidth
                                    label="Requested Priority"
                                    value={requestedPriority}
                                    onChange={(e) => setRequestedPriority(e.target.value)}
                                    sx={{ mb: 2, mt: 1 }}
                                >
                                    <MenuItem value="Low - not time sensitive">Low - not time sensitive</MenuItem>
                                    <MenuItem value="Medium - needed soon">Medium - needed soon</MenuItem>
                                    <MenuItem value="High - work blocked">High - work blocked</MenuItem>
                                    <MenuItem value="Critical - outage">Critical - outage</MenuItem>
                                </TextField>

                                <TextField
                                    fullWidth
                                    multiline
                                    minRows={3}
                                    label="Note for Manager"
                                    placeholder="Add any helpful context for the manager..."
                                    value={priorityRequestNote}
                                    onChange={(e) => setPriorityRequestNote(e.target.value)}
                                />

                                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 2 }}>
                                    <Button variant="outlined" onClick={handleClosePriorityRequestDialog}>
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="contained"
                                        onClick={handleSubmitPriorityRequest}
                                        disabled={!requestedPriority}
                                    >
                                        Submit Request
                                    </Button>
                                </Box>
                            </DialogContent>
                        </Dialog>
                        <Dialog
                            open={declineRequestDialogOpen}
                            onClose={handleCloseDeclineRequestDialog}
                            maxWidth="sm"
                            fullWidth
                        >
                            <DialogTitle sx={{ fontWeight: 600 }}>
                                Decline Request
                            </DialogTitle>

                            <DialogContent>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    Add an optional note for the technician.
                                </Typography>

                                <TextField
                                    fullWidth
                                    multiline
                                    minRows={4}
                                    label="Note"
                                    placeholder="Explain why this request was declined..."
                                    value={declineRequestNote}
                                    onChange={(e) => setDeclineRequestNote(e.target.value)}
                                />

                                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 2 }}>
                                    <Button variant="outlined" onClick={handleCloseDeclineRequestDialog}>
                                        Cancel
                                    </Button>
                                    <Button variant="contained" color="error" onClick={handleDeclineManagerRequest}>
                                        Decline Request
                                    </Button>
                                </Box>
                            </DialogContent>
                        </Dialog>
                    </Box>

                    {userRole === "manager" && (
                        <Box sx={{ mt: 2, mb: 3 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                Pending Requests
                                <Menu
                                    anchorEl={requestMenuAnchorEl}
                                    open={requestMenuOpen}
                                    onClose={handleCloseRequestMenu}
                                >
                                    <MenuItem
                                        onClick={() => {
                                            handleApproveManagerRequest(selectedRequestId);
                                            handleCloseRequestMenu();
                                        }}
                                    >
                                        Approve
                                    </MenuItem>

                                    <MenuItem onClick={handleOpenDeclineRequestDialog}>
                                        Decline
                                    </MenuItem>
                                </Menu>
                            </Typography>

                            {ticket.managerRequests && ticket.managerRequests.length > 0 ? (
                                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                                    {ticket.managerRequests
                                        .filter((request) => request.status === "Pending")
                                        .map((request) => (
                                            <Box
                                                key={request.id}
                                                sx={{
                                                    p: 1.5,
                                                    borderRadius: 2,
                                                    bgcolor: "#fafbfe",
                                                    border: "1px solid rgba(0,0,0,0.06)",
                                                }}
                                            >
                                                <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}>
                                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                        {request.label}
                                                    </Typography>

                                                    <IconButton
                                                        size="small"
                                                        onClick={(event) => handleOpenRequestMenu(event, request.id)}
                                                    >
                                                        <MoreVertIcon fontSize="small" />
                                                    </IconButton>
                                                </Box>

                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                    sx={{ display: "block", mt: 0.5 }}
                                                >
                                                    Requested by: {request.requestedBy}
                                                </Typography>

                                                {request.requestedValue && (
                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                        sx={{ display: "block", mt: 0.5 }}
                                                    >
                                                        Requested value: {request.requestedValue}
                                                    </Typography>
                                                )}

                                                {request.note && (
                                                    <Typography
                                                        variant="body2"
                                                        sx={{ mt: 1, whiteSpace: "pre-wrap" }}
                                                    >
                                                        Note: {request.note}
                                                    </Typography>
                                                )}

                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                    sx={{ display: "block", mt: 1 }}
                                                >
                                                    {request.createdAt}
                                                </Typography>
                                            </Box>
                                        ))}
                                </Box>
                            ) : (
                                <Typography variant="body2" color="text.secondary">
                                    No pending requests.
                                </Typography>
                            )}
                        </Box>
                    )}

                    {userRole === "tech" && (
                        <Box sx={{ mt: 2, mb: 3 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                Manager Responses
                            </Typography>

                            {(ticket.managerRequests || []).some(
                                (request) =>
                                    request.status === "Declined" || request.status === "Approved"
                            ) ? (
                                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                                    {ticket.managerRequests
                                        .filter(
                                            (request) =>
                                                request.status === "Declined" ||
                                                request.status === "Approved"
                                        )
                                        .map((request) => {
                                            const isApproved = request.status === "Approved";

                                            return (
                                                <Box
                                                    key={request.id}
                                                    sx={{
                                                        p: 1.5,
                                                        borderRadius: 2,
                                                        bgcolor: isApproved ? "#f4fbf6" : "#fff4f4",
                                                        border: isApproved
                                                            ? "1px solid rgba(46,125,50,0.18)"
                                                            : "1px solid rgba(211,47,47,0.18)",
                                                    }}
                                                >
                                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                        {request.label} was {isApproved ? "approved" : "declined"}
                                                    </Typography>

                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                        sx={{ display: "block", mt: 0.5 }}
                                                    >
                                                        {request.respondedAt || request.createdAt}
                                                    </Typography>

                                                    {request.managerResponseNote && (
                                                        <Typography
                                                            variant="body2"
                                                            sx={{ mt: 1, whiteSpace: "pre-wrap" }}
                                                        >
                                                            Manager note: {request.managerResponseNote}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            );
                                        })}
                                </Box>
                            ) : (
                                <Typography variant="body2" color="text.secondary">
                                    No manager responses yet.
                                </Typography>
                            )}
                        </Box>
                    )}

                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                        Ticket Info
                    </Typography>

                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                        <Box>
                            <Typography variant="caption" color="text.secondary">
                                Ticket ID
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                #{ticket.id}
                            </Typography>
                        </Box>

                        <Box>
                            <Typography variant="caption" color="text.secondary">
                                Status
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                {ticket.status}
                            </Typography>
                        </Box>

                        <Box>
                            <Typography variant="caption" color="text.secondary">
                                Priority
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                {ticket.priority}
                            </Typography>
                        </Box>

                        <Box>
                            <Typography variant="caption" color="text.secondary">
                                Category
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                {ticket.category}
                            </Typography>
                        </Box>

                        <Box>
                            <Typography variant="caption" color="text.secondary">
                                Impact
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                {ticket.impact}
                            </Typography>
                        </Box>

                        <Box>
                            <Typography variant="caption" color="text.secondary">
                                Requester
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                {ticket.createdBy}
                            </Typography>
                        </Box>

                        <Box>
                            <Typography variant="caption" color="text.secondary">
                                Assigned To
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                {ticket.assignedTo || "Unassigned"}
                            </Typography>
                        </Box>

                        <Box>
                            <Typography variant="caption" color="text.secondary">
                                Created At
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                {ticket.createdAt}
                            </Typography>
                        </Box>
                    </Box>
                </Paper>
            </Box>
        </>
    );

}