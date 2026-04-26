import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import About from "./pages/About";
import Contact from "./pages/Contact";
import GameItems from "./pages/GameItems";
import Home from "./pages/Home";
import Inventory from "./pages/Inventory";
import SkinDetail from "./pages/SkinDetail";
import Tradeup from "./pages/Tradeup";
import GameItemSkins from "./pages/GameItemSkins";

export default function App() {
  return (
    <div className="relative min-h-screen bg-[#05070f] text-white overflow-x-hidden">
      {/* 🔥 GLOBAL BACKGROUND */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f1f] via-[#05070f] to-black" />

        {/* Top glow */}
        <div className="absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[120px]" />

        {/* Bottom glow */}
        <div className="absolute bottom-[-200px] right-[-200px] h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[120px]" />

        {/* Vignette */}
        <div className="absolute inset-0 bg-black/40 [mask-image:radial-gradient(circle,transparent_60%,black)]" />
      </div>

      {/* NAV */}
      <Navbar />

      {/* ROUTES */}
      <main className="relative z-10">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/skin/:id" element={<SkinDetail />} />
          <Route path="/tradeup" element={<Tradeup />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/items" element={<GameItems />} />
          <Route path="/items/:category/:value" element={<GameItemSkins />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </main>
    </div>
  );
}
