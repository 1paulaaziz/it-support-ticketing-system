const TICKETS_STORAGE_KEY = "allstars_tickets";
const DEFAULT_STARTING_TICKET_ID = 3452;

export function getStoredTickets() {
    try {
        const savedTickets = localStorage.getItem(TICKETS_STORAGE_KEY);
        return savedTickets ? JSON.parse(savedTickets) : [];
    } catch (error) {
        console.error("Failed to parse stored tickets:", error);
        return [];
    }
}

export function saveStoredTickets(tickets) {
    try {
        localStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(tickets));
    } catch (error) {
        console.error("Failed to save tickets:", error);
        throw error;
    }
}

export function getTicketById(ticketId) {
    const tickets = getStoredTickets();
    return tickets.find((ticket) => String(ticket.id) === String(ticketId)) || null;
}

export function createTicket(ticketData) {
    const tickets = getStoredTickets();
    const updatedTickets = [ticketData, ...tickets];

    saveStoredTickets(updatedTickets);
    return ticketData;
}

export function updateTicket(ticketId, updatedTicketData) {
    const tickets = getStoredTickets();
    const existingTicket = tickets.find(
        (ticket) => String(ticket.id) === String(ticketId)
    );

    if (!existingTicket) return null;

    const updatedTickets = tickets.map((ticket) =>
        String(ticket.id) === String(ticketId) ? updatedTicketData : ticket
    );

    saveStoredTickets(updatedTickets);
    return updatedTicketData;
}

export function deleteTicket(ticketId) {
    const tickets = getStoredTickets();

    const ticketToDelete = tickets.find(
        (ticket) => String(ticket.id) === String(ticketId)
    );

    if (!ticketToDelete) return null;

    const updatedTickets = tickets.filter(
        (ticket) => String(ticket.id) !== String(ticketId)
    );

    saveStoredTickets(updatedTickets);
    return ticketToDelete;
}

export function getNextTicketId() {
    const tickets = getStoredTickets();

    const maxExistingId = tickets.reduce((max, ticket) => {
        const numericId = Number(ticket.id);

        if (!Number.isFinite(numericId)) return max;
        if (numericId > 9999) return max;

        return Math.max(max, numericId);
    }, DEFAULT_STARTING_TICKET_ID);

    return maxExistingId + 1;
}

export function patchTicket(ticketId, changes) {
    const existingTicket = getTicketById(ticketId);
    if (!existingTicket) return null;

    const updatedTicket = {
        ...existingTicket,
        ...changes,
    };

    return updateTicket(ticketId, updatedTicket);
}