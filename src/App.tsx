import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import About from "./pages/About";
import Contact from "./pages/Contact";
import GameItems from "./pages/GameItems";
import Home from "./pages/Home";
import Inventory from "./pages/Inventory";
import SkinDetail from "./pages/SkinDetail";
import Tradeup from "./pages/Tradeup";

export default function App() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/skin/:id" element={<SkinDetail />} />
        <Route path="/tradeup" element={<Tradeup />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/items" element={<GameItems />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </div>
  );
}
