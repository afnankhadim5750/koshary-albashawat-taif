/* Koshary Albashawat — language toggle, mobile menu, scroll-spy, tabs, accordion, lightbox, reveal */
(function () {
  "use strict";
  var currentLang = "en";

  /* ---------- Language toggle (EN <-> AR, full RTL) ---------- */
  var langToggle = document.getElementById("langToggle");
  function setLang(lang) {
    currentLang = lang;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.querySelectorAll("[data-en]").forEach(function (el) {
      var txt = el.getAttribute("data-" + lang);
      if (txt !== null) el.textContent = txt;
    });
    document.querySelectorAll("img[data-alt-en]").forEach(function (el) {
      var txt = el.getAttribute("data-alt-" + lang);
      if (txt !== null) el.alt = txt;
    });
    langToggle.textContent = lang === "ar" ? "EN" : "عربي";
    langToggle.setAttribute("aria-label", lang === "ar" ? "Switch to English" : "التبديل إلى العربية");
    try { localStorage.setItem("koshary-lang", lang); } catch (e) {}
  }
  langToggle.addEventListener("click", function () {
    setLang(currentLang === "en" ? "ar" : "en");
  });
  try {
    var saved = localStorage.getItem("koshary-lang");
    if (saved === "ar") setLang("ar");
  } catch (e) {}

  /* ---------- Mobile menu: instant toggle, no transition ---------- */
  var menuToggle = document.querySelector("[data-menu-toggle]");
  var mobileMenu = document.querySelector("[data-mobile-menu]");
  function setMenu(open) {
    mobileMenu.classList.toggle("open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    menuToggle.querySelector("i").className = open ? "bi bi-x" : "bi bi-list";
  }
  menuToggle.addEventListener("click", function () {
    setMenu(!mobileMenu.classList.contains("open"));
  });
  mobileMenu.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () { setMenu(false); });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      if (mobileMenu.classList.contains("open")) setMenu(false);
      closeLightbox();
    }
  });

  /* ---------- Scroll-spy ---------- */
  var spyLinks = document.querySelectorAll(".main-nav a");
  var spyMap = {};
  spyLinks.forEach(function (a) { spyMap[a.getAttribute("href").slice(1)] = a; });
  if ("IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          spyLinks.forEach(function (a) { a.classList.remove("active"); });
          var link = spyMap[en.target.id];
          if (link) link.classList.add("active");
        }
      });
    }, { rootMargin: "-30% 0px -60% 0px" });
    ["menu", "koshary", "gallery", "visit", "faq", "order"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) spy.observe(el);
    });
  }

  /* ---------- Menu tabs (keyboard: arrows move between tabs) ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".tab"));
  var panels = document.querySelectorAll(".tab-panel");
  function activateTab(tab, focus) {
    tabs.forEach(function (t) {
      var selected = t === tab;
      t.classList.toggle("active", selected);
      t.setAttribute("aria-selected", String(selected));
      t.tabIndex = selected ? 0 : -1;
    });
    panels.forEach(function (p) {
      var show = p.id === tab.getAttribute("aria-controls");
      p.classList.toggle("active", show);
      p.hidden = !show;
    });
    if (focus) tab.focus();
  }
  tabs.forEach(function (tab, i) {
    tab.addEventListener("click", function () { activateTab(tab, false); });
    tab.addEventListener("keydown", function (e) {
      var next = null;
      if (e.key === "ArrowRight") next = tabs[(i + 1) % tabs.length];
      if (e.key === "ArrowLeft") next = tabs[(i - 1 + tabs.length) % tabs.length];
      if (e.key === "Home") next = tabs[0];
      if (e.key === "End") next = tabs[tabs.length - 1];
      if (next) { e.preventDefault(); activateTab(next, true); }
    });
  });

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll(".acc-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var open = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!open));
      document.getElementById(btn.getAttribute("aria-controls")).hidden = open;
    });
  });

  /* ---------- Lightbox ---------- */
  var lightbox = document.getElementById("lightbox");
  var lightboxImg = document.getElementById("lightboxImg");
  var lightboxCap = document.getElementById("lightboxCap");
  var galleryBtns = Array.prototype.slice.call(document.querySelectorAll(".gallery-btn"));
  var lbIndex = 0;
  function showPhoto(i) {
    lbIndex = (i + galleryBtns.length) % galleryBtns.length;
    var btn = galleryBtns[lbIndex];
    var img = btn.querySelector("img");
    lightboxImg.src = btn.getAttribute("data-lightbox");
    lightboxImg.alt = img.alt;
    var cap = btn.getAttribute("data-caption-" + currentLang) || btn.getAttribute("data-caption-en");
    lightboxCap.textContent = cap;
  }
  function openLightbox(i) {
    showPhoto(i);
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
    lightbox.querySelector(".lightbox-close").focus();
  }
  function closeLightbox() {
    if (lightbox.hidden) return;
    lightbox.hidden = true;
    document.body.style.overflow = "";
  }
  galleryBtns.forEach(function (btn, i) {
    btn.addEventListener("click", function () { openLightbox(i); });
  });
  lightbox.querySelector(".lightbox-close").addEventListener("click", closeLightbox);
  lightbox.querySelector(".lightbox-prev").addEventListener("click", function () { showPhoto(lbIndex - 1); });
  lightbox.querySelector(".lightbox-next").addEventListener("click", function () { showPhoto(lbIndex + 1); });
  lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", function (e) {
    if (lightbox.hidden) return;
    if (e.key === "ArrowLeft") showPhoto(lbIndex - 1);
    if (e.key === "ArrowRight") showPhoto(lbIndex + 1);
  });

  /* ---------- Back to top ---------- */
  var toTop = document.getElementById("toTop");
  window.addEventListener("scroll", function () {
    toTop.classList.toggle("show", window.scrollY > 700);
  }, { passive: true });
  toTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll(".story-copy, .story-photos figure, .bowl-card, .menu, .signature-photo, .signature-copy, .how-steps li, .gallery-grid figure, .why-card, .visit-copy, .visit-map, .acc-item");
  revealEls.forEach(function (el) { el.classList.add("reveal"); });
  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); ro.unobserve(en.target); }
      });
    }, { threshold: 0.08 });
    revealEls.forEach(function (el) { ro.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }
})();
