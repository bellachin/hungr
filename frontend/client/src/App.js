import "./style.css";
import Feed from "./components/Feed";
import GrowingLibrary from "./components/GrowingLibrary";
import Navbar from "./components/Navbar";
import Auth from "./components/Auth";
import { useState, useEffect } from "react";
import { getFeed } from "./api";

function App() {
  const [user, setUser] = useState(null);
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // If not logged in, show Auth component
  if (!user) {
    return <Auth onLogin={setUser} />;
  }

  // If logged in, show the app
  return (
    <div className="App">
      <Navbar active="home" />
      {/* Header removed as requested */}
      <header
        style={{
          padding: "1rem 2rem",
          background: "white",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <div>
          <h1 style={{ margin: 0, color: "#667eea" }}>Hungr</h1>
          <p style={{ margin: "0.25rem 0 0 0", color: "#666" }}>
            Welcome, {user.displayName || user.username}!
          </p>
        </div>
        <button
          onClick={logout}
          style={{
            padding: "0.5rem 1.5rem",
            background: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          Logout
        </button>
      </header>

      <GrowingLibrary />

      <main className="mobbin-main">
        <Feed userId={userId} meals={meals} />
        <AddMeal userId={user.id} onMealAdded={loadFeed} />
        <Feed userId={user.id} meals={meals} />
      </main>
    </div>
  );
}

export default App;
