const API_BASE = "http://localhost:5001/api";

// 📥 Fetch feed (user + friends)
export async function getFeed(userId) {
  const res = await fetch(`${API_BASE}/feed/${userId}`);
  return res.json();
}

// 📤 Upload meal (with image)
export async function addMeal(formData) {
  const res = await fetch(`${API_BASE}/meals`, {
    method: "POST",
    body: formData, // FormData includes image + fields
  });
  return res.json();
}

// ❤️ Like or unlike a meal
export async function likeMeal(mealId, userId) {
  const res = await fetch(`${API_BASE}/meals/${mealId}/like`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });
  return res.json();
}

// 💬 Add a comment
export async function commentMeal(mealId, userId, text) {
  const res = await fetch(`${API_BASE}/meals/${mealId}/comment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, text }),
  });
  return res.json();
}
