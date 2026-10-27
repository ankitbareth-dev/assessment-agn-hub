import { Routes, Route } from "react-router";
import { Navbar } from "./components/Navbar";
import Book from "./pages/Book";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import Booking from "./pages/Booking";

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/book" element={<Book />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/book/:serviceId" element={<Booking />} />
      </Routes>
    </>
  );
}
