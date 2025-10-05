
import "./style.css";
import Feed from "./components/Feed";
import GrowingLibrary from "./components/GrowingLibrary";
import Navbar from "./components/Navbar";
import { useState, useEffect } from "react";
import { getFeed } from "./api";


function App() {
  const [userId] = useState("652fc28afc37c4b68dbdd765"); // replace with your actual user ID
  const [meals, setMeals] = useState([]);

  // Load feed initially
  async function loadFeed() {
    const data = await getFeed(userId);
    setMeals(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    loadFeed();
  }, [userId]);

  return (
    <div className="App">
      <Navbar active="home" />
      {/* Header removed as requested */}
      <GrowingLibrary />
      <main className="mobbin-main">
        <Feed userId={userId} meals={meals} />
      </main>
    </div>
  );
}

export default App;
