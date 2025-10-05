import { useEffect, useState } from "react";
import { getFeed } from "../api";
import MealCard from "./MealCard";

export default function Feed({ userId }) {
  const [meals, setMeals] = useState([]);

  useEffect(() => {
    async function load() {
      const data = await getFeed(userId);
      setMeals(data);
    }
    load();
  }, [userId]);

  return (
    <div>
      <h1>🍽️ Your Feed</h1>
      {Array.isArray(meals) && meals.length > 0 ? (
  meals.map((meal) => (
    <MealCard key={meal._id} meal={meal} userId={userId} />
  ))
) : (
  <p>No meals yet — try adding one!</p>
)}

    </div>
  );
}
