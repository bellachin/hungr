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
    </div>
  );
}

export default App;
