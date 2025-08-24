import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import DatabaseDebug from "./components/DatabaseDebug";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Rewards from "./pages/Rewards";
import CheckIn from "./pages/CheckIn";
import DatabaseTest from "./pages/DatabaseTest";
import EnvironmentCheck from "./pages/EnvironmentCheck";
import { AuthProvider } from "./contexts/AuthContext";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-warm-50">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/rewards" element={<Rewards />} />
              <Route path="/checkin" element={<CheckIn />} />
              <Route path="/database-test" element={<DatabaseTest />} />
              <Route path="/environment-check" element={<EnvironmentCheck />} />
            </Routes>
          </main>
          <DatabaseDebug />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
