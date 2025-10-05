
import React, { useEffect } from "react";
import "../style.css";
// ...existing code...


const stats = [
  { label: "recipes", target: 1000 },
  { label: "new features", target: 50 },
  { label: "users", target: 1000000 },
];

// ...existing code...

function animateCount(el, target, index) {
  const duration = 1200;
  const step = target / (duration / 16);
  let current = 0;
  const interval = setInterval(() => {
    current += step;
    if (current >= target) {
      if (index === 2) {
        el.textContent = "1M+";
      } else if (target >= 1000) {
        el.textContent = (target / 1000) + "K+";
      } else {
        el.textContent = target.toLocaleString();
      }
      clearInterval(interval);
    } else {
      if (index === 2) {
        el.textContent = Math.floor(current) >= 1000000 ? "1M+" : Math.floor(current).toLocaleString();
      } else if (target >= 1000) {
        el.textContent = Math.floor(current) >= 1000 ? (Math.floor(current) / 1000) + "K+" : Math.floor(current).toLocaleString();
      } else {
        el.textContent = Math.floor(current).toLocaleString();
      }
    }
  }, 16);
}

import blueberry from '../assets/icons/blueberry.svg';
import mango from '../assets/icons/mango.svg';
import passionfruit from '../assets/icons/passionfruit.svg';
import strawberry from '../assets/icons/strawberry.svg';

// Dynamically import all SVGs from the icons folder
const iconsContext = require.context('../assets/icons', false, /\.svg$/);
const iconImages = iconsContext.keys().map(iconsContext);

const GrowingLibrary = () => {
  useEffect(() => {
    // Animate stats on scroll
    const statLines = document.querySelectorAll('.mobbin-stat-line');
    const statNumbers = document.querySelectorAll('.mobbin-stat-number');
    const observer = new window.IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const i = Array.from(statLines).indexOf(entry.target);
            entry.target.classList.add('visible');
            animateCount(statNumbers[i], stats[i].target, i);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.7 }
    );
    statLines.forEach(line => observer.observe(line));

    // Floating icons (handled in JSX below)
  }, []);

  return (
    <section className="growing-library mobbin-main" style={{ position: "relative", marginBottom: 40, background: "linear-gradient(120deg, #98c1d9 0%, #8cba80 100%)" }}>
      <div className="floating-icons">
        {iconImages.map((src, index) => {
          // Arrange icons in a circle around the stats bubble
          const total = iconImages.length;
          const angle = (2 * Math.PI * index) / total;
          const radius = 120; // px distance from center
          // Center of stats bubble (approximate)
          const centerX = 50; // %
          const centerY = 38; // %
          const top = `calc(${centerY}% + ${Math.sin(angle) * radius}px)`;
          const left = `calc(${centerX}% + ${Math.cos(angle) * radius}px)`;
          const driftClasses = ["drift1", "drift2", "drift3"];
          const animation = `${driftClasses[index % driftClasses.length]} ${15 + index*5}s ease-in-out infinite`;
          return (
            <img
              key={index}
              src={src}
              className={`float-icon icon${index+1}`}
              alt={`icon${index+1}`}
              style={{ position: "absolute", top, left, animation, filter: "drop-shadow(0 2px 8px #98c1d9) brightness(1.2)", zIndex: 0 }}
            />
          );
        })}
      </div>
      <h2 style={{ fontWeight: 800, fontSize: "2.5rem", marginBottom: "2.5rem", color: "#3d5a80" }}>
        A growing library of
      </h2>
      <div className="mobbin-stats-list">
        {stats.map((stat, i) => (
          <div className="mobbin-stat-line" key={stat.label}>
            <span className="mobbin-stat-number" data-target={stat.target} style={{ color: "#3d5a80", fontWeight: 700, fontSize: "2.2rem" }}>0</span>
            <span className="mobbin-stat-label" style={{ color: "#345830", fontSize: "1.3rem", marginLeft: 12 }}>{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default GrowingLibrary;
