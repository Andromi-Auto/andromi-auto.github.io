// Andromi Auto website: theme switch, app bar on scroll, latest release, guide contents.
(function () {
  "use strict";

  var REPO = "Andromi-Auto/andromi-auto";
  var root = document.documentElement;

  // ----- Theme: follows the system until the visitor picks one with the button. -----
  function storedTheme() {
    try { return localStorage.getItem("theme"); } catch (e) { return null; }
  }
  function systemDark() {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  function currentlyDark() {
    var forced = root.getAttribute("data-theme");
    return forced ? forced === "dark" : systemDark();
  }
  function renderThemeButton() {
    var button = document.getElementById("theme-toggle");
    if (!button) return;
    var dark = currentlyDark();
    button.querySelector(".icon").textContent = dark ? "light_mode" : "dark_mode";
    button.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
    button.title = button.getAttribute("aria-label");
  }
  var themeButton = document.getElementById("theme-toggle");
  if (themeButton) {
    themeButton.addEventListener("click", function () {
      var next = currentlyDark() ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("theme", next); } catch (e) { /* private mode: not remembered */ }
      renderThemeButton();
    });
  }
  if (window.matchMedia) {
    var query = window.matchMedia("(prefers-color-scheme: dark)");
    var onChange = function () { if (!storedTheme()) renderThemeButton(); };
    if (query.addEventListener) query.addEventListener("change", onChange);
  }
  renderThemeButton();

  // ----- Top app bar takes a container colour once the page scrolls under it. -----
  var bar = document.querySelector(".top-bar");
  function onScroll() { if (bar) bar.classList.toggle("scrolled", window.scrollY > 4); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // ----- Latest stable release: one API call per visit, cached for an hour. -----
  // Without it the buttons still work: they point at GitHub's "latest release" links.
  var noteEl = document.querySelector("[data-latest-release]");
  if (noteEl) {
    var show = function (name, date) {
      var when = date ? " · " + new Date(date).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "";
      noteEl.textContent = "Latest stable release: " + name + when;
    };
    var cached = null;
    try { cached = JSON.parse(sessionStorage.getItem("latest-release") || "null"); } catch (e) { cached = null; }
    if (cached && Date.now() - cached.at < 3600 * 1000) {
      show(cached.name, cached.date);
    } else if (window.fetch) {
      fetch("https://api.github.com/repos/" + REPO + "/releases/latest", { headers: { Accept: "application/vnd.github+json" } })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (json) {
          if (!json || !json.tag_name) return;
          var name = json.name || json.tag_name;
          show(name, json.published_at);
          try { sessionStorage.setItem("latest-release", JSON.stringify({ name: name, date: json.published_at, at: Date.now() })); } catch (e) { /* not cached */ }
        })
        .catch(function () { /* offline or rate limited: keep the plain note */ });
    }
  }

  // ----- Guide: highlight the section being read in the contents list. -----
  var tocLinks = document.querySelectorAll(".toc a[href^='#']");
  if (tocLinks.length && "IntersectionObserver" in window) {
    var byId = {};
    tocLinks.forEach(function (a) { byId[a.getAttribute("href").slice(1)] = a; });
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        tocLinks.forEach(function (a) { a.classList.remove("active"); });
        var link = byId[entry.target.id];
        if (link) link.classList.add("active");
      });
    }, { rootMargin: "-90px 0px -65% 0px" });
    Object.keys(byId).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) observer.observe(el);
    });
  }
})();
