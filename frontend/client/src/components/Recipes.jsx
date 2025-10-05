import React from "react";
import AddMeal from "./AddMeal";
import "../style.css";

const Recipes = ({ userId, onMealAdded }) => {
  return (
    <section className="mobbin-main">
      <h2 style={{ fontWeight: 700, fontSize: "2rem", marginBottom: "1.5rem", color: "#bfdcee" }}>
        Add a Recipe
      </h2>
      <AddMeal userId={userId} onMealAdded={onMealAdded} />
      {/* You can add more recipe-related content here */}
    </section>
  );
};

export default Recipes;
