import { Routes, Route } from "react-router";
import { Navbar } from "./components/Navbar";
import Book from "./pages/Book";
import Dashboard from "./pages/Dashboard";

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={
            <main className="mx-auto max-w-(--container-width) px-(--space-6) py-(--space-12)">
              <h1 className="text-2xl font-bold">Home</h1>
            </main>
          }
        />
        <Route path="/book" element={<Book />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </>
  );
}
