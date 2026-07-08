import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import MyTickets from "./pages/MyTickets";
import AppLayout from "./components/AppLayout";
import CreateTicket from "./pages/CreateTicket";
import TicketDetails from "./pages/TicketDetails";
import InternalNotes from "./pages/InternalNotes";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route element={<AppLayout />}>
          <Route path="/tickets" element={<MyTickets />} />
          <Route path="/tickets/:id" element={<TicketDetails />} />
          <Route path="/tickets/:id/internal-notes" element={<InternalNotes />} />
          <Route path="/create" element={<CreateTicket />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
