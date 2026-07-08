import React from "react";
import { Paper, Typography, Box, TextField, Button, IconButton } from "@mui/material";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import CloseIcon from "@mui/icons-material/Close";
import { useParams } from "react-router-dom";
import { getTicketById, patchTicket } from "../services/ticketsService";

export default function InternalNotes() {
    const { id } = useParams();
    const [ticket, setTicket] = React.useState(null);
    const [noteText, setNoteText] = React.useState("");
    const [noteAttachments, setNoteAttachments] = React.useState([]);

    React.useEffect(() => {
        const foundTicket = getTicketById(id);
        setTicket(
            foundTicket
                ? {
                    ...foundTicket,
                    internalNotes: foundTicket.internalNotes || [],
                }
                : null
        );
    }, [id]);

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

    const handleNoteAttachmentChange = async (event) => {
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

            setNoteAttachments((prev) => [...prev, ...newAttachments]);
            event.target.value = "";
        } catch (error) {
            alert("Could not process that attachment. Try a smaller image or different file.");
            console.error("Failed to prepare note attachment:", error);
        }
    };

    const handleRemoveNoteAttachment = (indexToRemove) => {
        setNoteAttachments((prev) =>
            prev.filter((_, index) => index !== indexToRemove)
        );
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

    const handleSaveNote = () => {
        if ((!noteText.trim() && noteAttachments.length === 0) || !ticket) return;

        const auth = JSON.parse(sessionStorage.getItem("allstars_auth")) || {};

        const newNote = {
            id: Date.now(),
            sender: auth.email || "unknown",
            role: auth.role || "tech",
            text: noteText.trim(),
            createdAt: new Date().toLocaleString(),
            attachments: noteAttachments,
        };

        let updatedTicket = null;

        try {
            updatedTicket = patchTicket(ticket.id, {
                internalNotes: [...(ticket.internalNotes || []), newNote],
            });
        } catch (error) {
            alert("That attachment is probably too large to save locally. Try a smaller screenshot or image.");
            console.error("Failed to save note attachment:", error);
            return;
        }

        if (!updatedTicket) return;

        setTicket(updatedTicket);
        setNoteText("");
        setNoteAttachments([]);
    };

    if (!ticket) {
        return (
            <Paper
                elevation={0}
                sx={{
                    p: 3,
                    borderRadius: 3,
                    border: "1px solid rgba(0,0,0,0.08)",
                    bgcolor: "rgba(255,255,255,0.92)",
                }}
            >
                <Typography variant="h5" sx={{ fontWeight: 650 }}>
                    Ticket not found
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    This internal notes page could not find the ticket.
                </Typography>
            </Paper>
        );
    }

    return (
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
                    Internal Notes
                </Typography>

                <Typography variant="h4" sx={{ fontWeight: 700, mt: 0.5 }}>
                    Ticket #{ticket.id}
                </Typography>

                <Typography variant="body1" sx={{ mt: 1, fontWeight: 500 }}>
                    {ticket.title}
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
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Add Internal Note
                </Typography>

                <TextField
                    fullWidth
                    multiline
                    minRows={4}
                    placeholder="Write an internal note for managers and technicians only..."
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                />
                {noteAttachments.length > 0 && (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75, mt: 2 }}>
                        {noteAttachments.map((file, index) => (
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
                                    onClick={() => handleRemoveNoteAttachment(index)}
                                >
                                    <CloseIcon fontSize="small" />
                                </IconButton>
                            </Box>
                        ))}
                    </Box>
                )}
                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 2 }}>
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
                            onChange={handleNoteAttachmentChange}
                        />
                    </Button>

                    <Button variant="contained" onClick={handleSaveNote}>
                        Save Note
                    </Button>
                </Box>
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
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Note History
                </Typography>

                {ticket.internalNotes && ticket.internalNotes.length > 0 ? (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                        {ticket.internalNotes.map((note) => (
                            <Box
                                key={note.id}
                                sx={{
                                    p: 1.5,
                                    borderRadius: 2,
                                    bgcolor: "#fafbfe",
                                    border: "1px solid rgba(0,0,0,0.06)",
                                }}
                            >
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {note.sender} ({note.role})
                                </Typography>

                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ display: "block", mt: 0.25 }}
                                >
                                    {note.createdAt}
                                </Typography>

                                <Typography
                                    variant="body2"
                                    sx={{ mt: 1, whiteSpace: "pre-wrap" }}
                                >
                                    {note.text}
                                </Typography>
                                {note.attachments && note.attachments.length > 0 && (
                                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, mt: 1 }}>
                                        {note.attachments.map((file, index) => (
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
                        ))}
                    </Box>
                ) : (
                    <Typography variant="body2" color="text.secondary">
                        No internal notes yet.
                    </Typography>
                )}
            </Paper>
        </Box>
    );
}