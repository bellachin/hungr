import React from "react";
import "../style.css";

const Navbar = ({ active }) => {
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
      </ul>
    </nav>
  );
};

export default Navbar;
