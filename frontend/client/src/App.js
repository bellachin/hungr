import "./style.css";
import Feed from "./components/Feed";
import GrowingLibrary from "./components/GrowingLibrary";
import Navbar from "./components/Navbar";
import Auth from "./components/Auth";
import { useState, useEffect } from "react";
import { getFeed } from "./api";
import React, { useRef, useEffect, useState } from "react";

function AnimatedStat({ label, end }) {
  const [visible, setVisible] = useState(false);
  const [value, setValue] = useState(0);
  const ref = useRef();

  useEffect(() => {
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const duration = 1200;
    const startTime = performance.now();
    function animate(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      setValue(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(animate);
      else setValue(end);
    }
    requestAnimationFrame(animate);
  }, [visible, end]);

  return (
    <div className="mobbin-stat" ref={ref}>
      <div className="mobbin-stat-number">{value}</div>
      <div className="mobbin-stat-label">{label}</div>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // Load feed when user is set
  useEffect(() => {
    if (user) loadFeed();
  }, [user]);

  async function loadFeed() {
    if (!user) return;
    const data = await getFeed(user.id);
    setMeals(Array.isArray(data) ? data : []);
  }

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setMeals([]);
  };

  if (loading) {
    return <div className="App">Loading...</div>;
  }

  // Show Auth modal if requested
  if (showAuth) {
    return <Auth onLogin={(u) => { setUser(u); setShowAuth(false); }} />;
  }

  // If logged in, show the app
  return (
    <div className="App">
      <Navbar active="home" user={user} onLoginClick={() => setShowAuth(true)} onLogout={logout} />
      <GrowingLibrary />
      <main className="mobbin-main">
        <Feed userId={user?.id} meals={meals} />
        {user && <AddMeal userId={user.id} onMealAdded={loadFeed} />}
      </main>
      <section className="mobbin-stats-section">
        <h2 className="mobbin-stats-title">Our Impact</h2>
        <div className="mobbin-stats-row">
          <AnimatedStat label="Meals Shared" end={1240} />
          <AnimatedStat label="Users Joined" end={312} />
          <AnimatedStat label="Food Saved (kg)" end={876} />
        </div>
      </section>
    </div>
  );
}

export default App;
