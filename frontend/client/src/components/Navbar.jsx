import React from "react";
import "../style.css";

const Navbar = ({ active, user, onLoginClick, onLogout }) => {
  const navItems = [
    { label: "Home", key: "home" },
    { label: "Inventory", key: "inventory" },
    { label: "Recipes", key: "recipes" },
    { label: "Storage Tips", key: "tips" },
  ];
  return (
    <nav className="mobbin-navbar">
      <div className="navbar-logo">HUNGR</div>
      <ul className="navbar-list">
        {navItems.map(item => (
          <li
            key={item.key}
            className={
              "navbar-item" + (active === item.key ? " navbar-active" : "")
            }
          >
            {item.label}
          </li>
        ))}
        {!user && (
          <li className="navbar-item" style={{ marginLeft: "2rem" }}>
            <button onClick={onLoginClick} style={{
              background: "#667eea",
              color: "white",
              border: "none",
              borderRadius: "18px",
              padding: "6px 18px",
              fontWeight: "600",
              cursor: "pointer"
            }}>Login</button>
          </li>
        )}
        {user && (
          <li className="navbar-item" style={{ marginLeft: "2rem" }}>
            <button onClick={onLogout} style={{
              background: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "18px",
              padding: "6px 18px",
              fontWeight: "600",
              cursor: "pointer"
            }}>Logout</button>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
