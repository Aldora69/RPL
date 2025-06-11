// Theme toggle logic for all pages

function applyTheme(theme) {
  if (theme === "dark") {
    document.body.classList.add("dark");
  } else {
    document.body.classList.remove("dark");
  }
}

function getSavedTheme() {
  return localStorage.getItem("theme") || "light";
}

function setTheme(theme) {
  localStorage.setItem("theme", theme);
  applyTheme(theme);
}

function toggleTheme() {
  const current = getSavedTheme();
  const next = current === "dark" ? "light" : "dark";
  setTheme(next);
}

window.addEventListener("DOMContentLoaded", () => {
  applyTheme(getSavedTheme());
  const themeToggle = document.getElementById("theme-toggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", toggleTheme);
  }
});