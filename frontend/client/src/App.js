
import "./style.css";
import Feed from "./components/Feed";
import AddMeal from "./components/AddMeal";
import GrowingLibrary from "./components/GrowingLibrary";
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
      <header className="mobbin-header">
        <div className="mobbin-gradient-bg"></div>
        <h1>Hungr</h1>
        <p className="mobbin-subtitle">A modern food tracker for everyone</p>
      </header>
      <GrowingLibrary />
      <main className="mobbin-main">
        <AddMeal userId={userId} onMealAdded={loadFeed} />
        <Feed userId={userId} meals={meals} />
      </main>
    </div>
  );
}

export default App;
