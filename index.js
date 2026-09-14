// Autor: Karteikay (Karty) Dhuper
// Date: May 5th 2022 @ 4:16am
// About: Javascript program that switches website to darkmode during nighttime amongst other things.

// Site theme colors (dark theme only — no toggle)
const COLOR_CONFIG = {
  background: "black",
  text: "white",
  header: "#1ce783",
  cardBackground: "#3C4042",
  navBackground: "rgba(0, 255, 255, 0)",
  scrollProgress: "#ff6630",
};

var today = new Date();
var bg = document.getElementById("dark-mode-bg");
var texts = document.getElementsByClassName("dark-mode-text");
var headers = document.getElementsByClassName("header");
var greeting = document.getElementsByClassName("title");
var nav = document.getElementById("dark-mode-nav");
var lp = document.getElementById("landingPage");
var cardElements = document.querySelectorAll(".card, .this-site-card");

console.log("How's it going hackers.");
console.log("Today's date is: " + today);

function applySiteTheme() {
  if (!bg) return;

  try {
    if (lp) lp.classList.add("bg-dark");
  } catch {
    console.log("Website landing page not on this page.");
  }

  bg.style.backgroundColor = COLOR_CONFIG.background;

  for (let text of texts) {
    if (text.closest && text.closest("#landingPage")) continue;
    if (text.closest && text.closest(".programming-zone")) continue;
    text.style.color = COLOR_CONFIG.text;
  }

  for (let header of headers) {
    if (header.closest && header.closest(".programming-zone")) continue;
    header.style.color = COLOR_CONFIG.header;
  }

  for (let i of greeting) {
    i.style.color = COLOR_CONFIG.header;
  }

  if (nav) {
    nav.classList.remove("navbar-light");
    nav.classList.remove("bg-light");
    nav.classList.add("navbar-dark");
    nav.style.backgroundColor = COLOR_CONFIG.navBackground;
  }

  for (let card of cardElements) {
    if (card.classList.contains("duffel-tile")) continue;
    if (card.closest && card.closest(".programming-zone")) continue;
    card.style.background = COLOR_CONFIG.cardBackground;
  }

  const musicPlayerContainer = document.getElementById("musicPlayerContainer");
  if (musicPlayerContainer) {
    musicPlayerContainer.style.background = COLOR_CONFIG.cardBackground;
  }
}

applySiteTheme();

// Code for scroll progress bar
const scrollProgressBar = document.getElementById("scroll-progress");

function scrollProgress() {
  if (!scrollProgressBar) return;
  const webpageHeight = document.body.scrollHeight;
  const distanceFromTop = document.documentElement.scrollTop;
  const windowheight = document.documentElement.clientHeight;
  const percentageScrolled =
    (distanceFromTop / (webpageHeight - windowheight)) * 100;
  scrollProgressBar.style.width = percentageScrolled + "%";
}
document.addEventListener("scroll", scrollProgress);

(function initHeroMountainsBackground() {
  const lp = document.getElementById("landingPage");
  const layer = document.querySelector(".home-hero-mountains");
  if (!lp || !layer) return;
  const mountainToggleBtn = document.getElementById("mountainToggleBtn");
  const mountainToggleText = document.getElementById("mountainToggleText");
  const mountainToggleIcon = document.getElementById("mountainToggleIcon");

  const rate = 0.58;
  const maxPx = 280;
  let ticking = false;

  function mountainsOn() {
    return lp.classList.contains("home-hero--mountains-on");
  }

  function applyParallax() {
    ticking = false;
    if (!mountainsOn() || prefersReducedMotion()) {
      layer.style.removeProperty("--hero-parallax-y");
      return;
    }
    const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
    const y = Math.min(maxPx, scrollY * rate);
    layer.style.setProperty("--hero-parallax-y", `${y}px`);
  }

  function onScrollOrResize() {
    if (!mountainsOn() || prefersReducedMotion()) return;
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(applyParallax);
    }
  }

  function setMountainsOn(on) {
    lp.classList.toggle("home-hero--mountains-on", Boolean(on));
    syncMountainToggleButton();
    applyParallax();
  }

  function syncMountainToggleButton() {
    const on = mountainsOn();
    if (mountainToggleText) {
      mountainToggleText.textContent = on ? "Mountains On" : "Mountains Off";
    }
    if (mountainToggleBtn) {
      mountainToggleBtn.setAttribute(
        "aria-label",
        on ? "Turn mountain background off" : "Turn mountain background on"
      );
    }
    if (mountainToggleIcon) {
      mountainToggleIcon.classList.toggle("fa-mountain", on);
      mountainToggleIcon.classList.toggle("fa-image", !on);
    }
  }

  window.addEventListener("load", function () {
    syncMountainToggleButton();
  });

  window.addEventListener("scroll", onScrollOrResize, { passive: true });
  window.addEventListener("resize", onScrollOrResize, { passive: true });

  if (mountainToggleBtn) {
    mountainToggleBtn.addEventListener("click", function (e) {
      e.preventDefault();
      setMountainsOn(!mountainsOn());
    });
  }

  window.heroMountainsController = {
    isOn: mountainsOn,
    set: setMountainsOn,
    toggle: function () {
      setMountainsOn(!mountainsOn());
    }
  };

  /* Mountains are on by default on first load. */
  lp.classList.add("home-hero--mountains-on");
  setMountainsOn(true);
})();

(function initHeroMouseParallax() {
  const lp = document.getElementById("landingPage");
  if (!lp || !lp.classList.contains("home-hero")) return;
  if (!window.matchMedia("(pointer: fine)").matches) return;
  if (prefersReducedMotion()) return;

  const VAR_NAMES = [
    "--hero-mouse-mx",
    "--hero-mouse-my",
    "--hero-mouse-content-x",
    "--hero-mouse-content-y",
    "--hero-mouse-orbit-lx",
    "--hero-mouse-orbit-ly",
    "--hero-mouse-orbit-rx",
    "--hero-mouse-orbit-ry",
  ];

  /* Opposite cursor: all layers drift against pointer; background moves most, hero least. */
  const BG_X = 8;
  const BG_Y = 5;
  const CX = 3;
  const CY = 2;
  const OLX = 5;
  const OLY = 3;
  const ORX = 5;
  const ORY = 3;

  let targetX = 0;
  let targetY = 0;
  let curX = 0;
  let curY = 0;
  let rafId = null;
  let active = true;

  function clearVars() {
    VAR_NAMES.forEach((name) => lp.style.removeProperty(name));
  }

  function applyVars() {
    lp.style.setProperty("--hero-mouse-mx", `${(curX * BG_X).toFixed(2)}px`);
    lp.style.setProperty("--hero-mouse-my", `${(curY * BG_Y).toFixed(2)}px`);
    lp.style.setProperty("--hero-mouse-content-x", `${(curX * CX).toFixed(2)}px`);
    lp.style.setProperty("--hero-mouse-content-y", `${(curY * CY).toFixed(2)}px`);
    lp.style.setProperty("--hero-mouse-orbit-lx", `${(curX * OLX).toFixed(2)}px`);
    lp.style.setProperty("--hero-mouse-orbit-ly", `${(curY * OLY).toFixed(2)}px`);
    lp.style.setProperty("--hero-mouse-orbit-rx", `${(curX * ORX).toFixed(2)}px`);
    lp.style.setProperty("--hero-mouse-orbit-ry", `${(curY * ORY).toFixed(2)}px`);
  }

  function tick() {
    rafId = null;
    if (!active) return;
    const k = 0.07;
    curX += (targetX - curX) * k;
    curY += (targetY - curY) * k;
    applyVars();
    if (
      Math.abs(targetX - curX) > 0.002 ||
      Math.abs(targetY - curY) > 0.002
    ) {
      rafId = requestAnimationFrame(tick);
    }
  }

  function requestTick() {
    if (!active) return;
    if (!rafId) rafId = requestAnimationFrame(tick);
  }

  function onMove(e) {
    const rect = lp.getBoundingClientRect();
    if (rect.width < 8 || rect.height < 8) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const nx = (e.clientX - cx) / (rect.width / 2);
    const ny = (e.clientY - cy) / (rect.height / 2);
    /* Invert so layers drift opposite the cursor (classic parallax). */
    targetX = Math.max(-1, Math.min(1, -nx));
    targetY = Math.max(-1, Math.min(1, -ny));
    requestTick();
  }

  function onLeave() {
    targetX = 0;
    targetY = 0;
    requestTick();
  }

  lp.addEventListener("mousemove", onMove, { passive: true });
  lp.addEventListener("mouseleave", onLeave);

  const obs = new IntersectionObserver(
    (entries) => {
      const vis = entries.some((en) => en.isIntersecting);
      active = vis;
      if (!vis) {
        targetX = 0;
        targetY = 0;
        curX = 0;
        curY = 0;
        clearVars();
      }
    },
    { threshold: 0 }
  );
  obs.observe(lp);
})();

(function initNavThemeMountainButtonSwap() {
  const hero = document.getElementById("landingPage");
  const mountainToggleBtn = document.getElementById("mountainToggleBtn");
  if (!hero || !mountainToggleBtn) return;
  let swapScrollY = 0;

  function recalcSwapThreshold() {
    const heroTop = hero.offsetTop || 0;
    const viewportDriven = window.innerHeight * 0.9;
    const heroDriven = hero.offsetHeight * 0.7;
    swapScrollY = heroTop + Math.min(viewportDriven, heroDriven);
  }

  function shouldShowMountainToggle() {
    return window.scrollY < swapScrollY;
  }

  function syncButtons() {
    const showMountain = shouldShowMountainToggle();
    mountainToggleBtn.classList.toggle("d-none", !showMountain);
    if (nav) nav.classList.toggle("hero-nav-active", showMountain);
  }

  recalcSwapThreshold();
  syncButtons();
  window.addEventListener("scroll", syncButtons, { passive: true });
  window.addEventListener("resize", function () {
    recalcSwapThreshold();
    syncButtons();
  }, { passive: true });
  window.addEventListener("load", function () {
    recalcSwapThreshold();
    syncButtons();
  }, { once: true });
})();

(function initHeroProfileHoverSwap() {
  const heroProfileImg = document.querySelector("#landingPage .profile-picture");
  if (!heroProfileImg) return;

  const defaultSrc = heroProfileImg.getAttribute("src");
  const hoverSrc = "public/images/KartyDhpr_Logo.png";
  if (!defaultSrc) return;

  const preloadedHover = new Image();
  preloadedHover.src = hoverSrc;

  function swapToLogo() {
    heroProfileImg.classList.add("is-logo-hover");
    heroProfileImg.setAttribute("src", hoverSrc);
  }

  function swapBackToProfile() {
    heroProfileImg.classList.remove("is-logo-hover");
    heroProfileImg.setAttribute("src", defaultSrc);
  }

  heroProfileImg.addEventListener("mouseenter", swapToLogo);
  heroProfileImg.addEventListener("mouseleave", swapBackToProfile);
  heroProfileImg.addEventListener("focus", swapToLogo);
  heroProfileImg.addEventListener("blur", swapBackToProfile);
})();

function revealFadeAndSlideIn() {
  document.querySelectorAll(".fade-in, .slide-in, .slide-up").forEach((el) => {
    el.classList.add("show");
  });
}

function revealAllStaticSections() {
  document.querySelectorAll(".details").forEach((el) => el.classList.add("show"));
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function wrapLazyMediaPlaceholders() {
  function wrapImg(img, contextClass) {
    if (!img || img.closest(".lazy-image-wrap")) return;
    if (img.id === "albumCover") return;
    if (img.closest(".navbar")) return;
    if (img.closest("#landingPage") || img.classList.contains("profile-picture"))
      return;
    const parent = img.parentNode;
    if (!parent) return;
    const wrap = document.createElement("div");
    wrap.className = `lazy-image-wrap lazy-image-wrap--gallery ${contextClass}`;
    const sk = document.createElement("div");
    sk.className = "skeleton skeleton--card-thumb";
    sk.setAttribute("aria-hidden", "true");
    parent.insertBefore(wrap, img);
    wrap.appendChild(sk);
    wrap.appendChild(img);
    if (!img.hasAttribute("loading")) img.setAttribute("loading", "lazy");
    if (!img.hasAttribute("decoding")) img.setAttribute("decoding", "async");
  }

  document.querySelectorAll(".image-container > img").forEach((img) => {
    /* Large JPEG gallery: skip lazy wrapper + second pass below — avoids shimmer
       reappearing and native lazy eviction that reads like “unload” while scrolling. */
    if (img.closest("#art-photographs-gallery")) return;
    wrapImg(img, "lazy-context-art");
  });
  document
    .querySelectorAll(".polaroid-frame > img")
    .forEach((img) => wrapImg(img, "lazy-context-polaroid"));
  document
    .querySelectorAll("ul.cards > li > img")
    .forEach((img) => wrapImg(img, "lazy-context-card"));
  document
    .querySelectorAll("main .row > .col-md-3 > img")
    .forEach((img) => wrapImg(img, "lazy-context-publication"));
  document.querySelectorAll("main img").forEach((img) => {
    if (img.closest(".lazy-image-wrap")) return;
    if (img.id === "albumCover") return;
    if (img.closest(".navbar")) return;
    if (img.closest("#art-photographs-gallery")) return;
    wrapImg(img, "lazy-context-inline");
  });
}

function initLottieSkeletonHosts() {
  const failOpenMs = 8000;

  document.querySelectorAll("lottie-player").forEach((player) => {
    if (player.closest(".lottie-skeleton-host")) return;
    const parent = player.parentNode;
    if (!parent) return;
    const host = document.createElement("div");
    host.className = "lottie-skeleton-host lottie-context-motion";
    const sk = document.createElement("div");
    sk.className = "skeleton skeleton--lottie";
    sk.setAttribute("aria-hidden", "true");
    parent.insertBefore(host, player);
    host.appendChild(sk);
    host.appendChild(player);
    let finished = false;
    const done = () => {
      if (finished) return;
      finished = true;
      host.classList.add("lottie-ready");
    };

    /* load / error: data ready — play: first frame actually running (reliable with autoplay) */
    ["load", "ready", "error", "play", "data_ready"].forEach((evt) => {
      player.addEventListener(evt, done, { once: true });
    });

    const tryInstanceReady = () => {
      try {
        if (typeof player.getLottie === "function" && player.getLottie()) {
          done();
          return true;
        }
      } catch (_) {
        /* web component not upgraded yet */
      }
      return false;
    };
    if (!tryInstanceReady()) {
      queueMicrotask(tryInstanceReady);
    }
    let pollLeft = 45;
    const poll = () => {
      if (finished) return;
      if (tryInstanceReady()) return;
      if (--pollLeft <= 0) return;
      requestAnimationFrame(poll);
    };
    requestAnimationFrame(poll);

    setTimeout(done, failOpenMs);
  });
}

function initLazyImagePlaceholders() {
  document.querySelectorAll(".lazy-image-wrap img").forEach((img) => {
    const wrap = img.closest(".lazy-image-wrap");
    if (!wrap) return;
    const src = (img.getAttribute("src") || "").trim();
    if (!src) {
      wrap.classList.add("loaded");
      return;
    }
    function markLoaded() {
      wrap.classList.add("loaded");
    }
    if (img.complete && img.naturalHeight > 0) markLoaded();
    else {
      img.addEventListener("load", markLoaded, { once: true });
      img.addEventListener("error", markLoaded, { once: true });
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  wrapLazyMediaPlaceholders();
  initLottieSkeletonHosts();
  initLazyImagePlaceholders();
  if (prefersReducedMotion()) {
    revealFadeAndSlideIn();
    revealAllStaticSections();
    document.querySelectorAll(".lottie-skeleton-host").forEach((h) =>
      h.classList.add("lottie-ready")
    );
    return;
  }
  revealFadeAndSlideIn();
});

const detailsFallbackMs = 4500;
let detailsFallbackTimer = setTimeout(() => {
  revealAllStaticSections();
}, detailsFallbackMs);

window.addEventListener(
  "load",
  () => {
    clearTimeout(detailsFallbackTimer);
    revealFadeAndSlideIn();
  },
  { once: true }
);

function handleIntersection(entries, observer) {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("show");
      observer.unobserve(entry.target);
    }
  });
}

const sectionObserver = new IntersectionObserver(handleIntersection, {
  threshold: 0.08,
  rootMargin: "0px 0px 80px 0px",
});

document.querySelectorAll(".details").forEach((section) => {
  sectionObserver.observe(section);
});

// Multi-language typing animation
const typewriterElement = document.getElementById('typewriter-text');
if (typewriterElement) {
  const languages = [
    { text: "Hey, I'm Karty", lang: "English" },
    { text: "你好，我是卡力亚", lang: "Mandarin Chinese" },
    { text: "नमस्ते , मैं कार्तिकेय हूँ", lang: "Hindi" },
    { text: "Salut, je suis Karty", lang: "French" }
  ];

  let currentLanguageIndex = 0;
  let currentCharIndex = 0;
  let isDeleting = false;
  let baseTypingSpeed = 80; // base milliseconds per character (balanced)
  let baseDeletingSpeed = 40; // base milliseconds per character when deleting (balanced)
  let pauseAfterComplete = 2000; // pause after completing a phrase
  let pauseAfterDelete = 400; // pause after deleting before starting next language (balanced)

  function getRandomDelay(baseSpeed) {
    // Add slight randomness (±20%) to make typing feel more natural
    const variation = baseSpeed * 0.2;
    return baseSpeed + (Math.random() * variation * 2 - variation);
  }

  function typeText() {
    const currentLanguage = languages[currentLanguageIndex];
    const currentText = currentLanguage.text;

    if (!isDeleting && currentCharIndex < currentText.length) {
      // Typing forward
      typewriterElement.textContent = currentText.substring(0, currentCharIndex + 1);
      typewriterElement.closest(".hero-typewriter-wrap")?.classList.add("has-typewriter-text");
      currentCharIndex++;
      // Use variable speed for more natural feel
      const delay = getRandomDelay(baseTypingSpeed);
      setTimeout(typeText, delay);
    } else if (!isDeleting && currentCharIndex === currentText.length) {
      // Finished typing, pause then start deleting
      isDeleting = true;
      setTimeout(typeText, pauseAfterComplete);
    } else if (isDeleting && currentCharIndex > 0) {
      // Deleting
      currentCharIndex--;
      typewriterElement.textContent = currentText.substring(0, currentCharIndex);
      // Use variable speed for smoother deletion
      const delay = getRandomDelay(baseDeletingSpeed);
      setTimeout(typeText, delay);
    } else if (isDeleting && currentCharIndex === 0) {
      // Finished deleting, move to next language
      isDeleting = false;
      currentLanguageIndex = (currentLanguageIndex + 1) % languages.length;
      setTimeout(typeText, pauseAfterDelete);
    }
  }

  // Start the typing animation
  typeText();
}

const gallery = document.getElementById("polaroidGallery");
if (gallery) {
  let isDown = false;
  let startX;
  let scrollLeft;

  gallery.addEventListener("mousedown", (e) => {
    isDown = true;
    gallery.classList.add("active");
    startX = e.pageX - gallery.offsetLeft;
    scrollLeft = gallery.scrollLeft;
  });

  gallery.addEventListener("mouseleave", () => {
    isDown = false;
    gallery.classList.remove("active");
  });

  gallery.addEventListener("mouseup", () => {
    isDown = false;
    gallery.classList.remove("active");
  });

  gallery.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - gallery.offsetLeft;
    const walk = (x - startX) * 1.5;
    gallery.scrollLeft = scrollLeft - walk;
  });

  function hideScrollHintOnce() {
    gallery.classList.add("polaroid-gallery--interacted");
    gallery.removeEventListener("scroll", onGalleryScroll);
  }

  function onGalleryScroll() {
    if (gallery.scrollLeft > 6) hideScrollHintOnce();
  }

  function syncScrollHintToOverflow() {
    if (gallery.scrollWidth <= gallery.clientWidth + 2) {
      hideScrollHintOnce();
    }
  }

  gallery.addEventListener("scroll", onGalleryScroll, { passive: true });
  window.addEventListener("resize", syncScrollHintToOverflow);
  window.addEventListener("load", syncScrollHintToOverflow, { once: true });

  function scrollGalleryToStart() {
    gallery.scrollLeft = 0;
  }
  scrollGalleryToStart();
  window.addEventListener("load", scrollGalleryToStart, { once: true });
}

(function initProjectLibrary() {
  const grid = document.getElementById("project-library-grid");
  if (!grid) return;

  const items = grid.querySelectorAll(".project-library-item");
  const filterButtons = document.querySelectorAll(
    ".project-library-filter-btn[data-project-filter]"
  );
  const langSelect = document.getElementById("project-library-lang-select");
  const categoryTrack = document.querySelector(".project-library-category-track");
  var categoryFilter = "all";
  var langFilter = "all";
  const prevBtn = document.getElementById("project-library-prev");
  const nextBtn = document.getElementById("project-library-next");
  const counterEl = document.getElementById("project-library-counter");

  function visibleItems() {
    return Array.prototype.filter.call(items, function (li) {
      return !li.classList.contains("is-filtered-out");
    });
  }

  function activeCardIndex() {
    var vis = visibleItems();
    if (!vis.length) return 0;
    var sl = grid.scrollLeft;
    var sr = sl + grid.clientWidth;
    var best = 0;
    var maxVis = -1;
    for (var i = 0; i < vis.length; i++) {
      var el = vis[i];
      var l = el.offsetLeft;
      var r = l + el.offsetWidth;
      var w = Math.max(0, Math.min(r, sr) - Math.max(l, sl));
      if (w > maxVis) {
        maxVis = w;
        best = i;
      }
    }
    if (maxVis <= 0) {
      var mid = sl + grid.clientWidth * 0.5;
      var bestD = Infinity;
      for (var j = 0; j < vis.length; j++) {
        var e = vis[j];
        var c = e.offsetLeft + e.offsetWidth / 2;
        var d = Math.abs(c - mid);
        if (d < bestD) {
          bestD = d;
          best = j;
        }
      }
    }
    return best;
  }

  function scrollToVisibleIndex(index, behavior) {
    var vis = visibleItems();
    if (!vis.length) return;
    var n = vis.length;
    var i = Math.max(0, Math.min(index, n - 1));
    var target = vis[i];
    var nextLeft = Math.max(0, target.offsetLeft - grid.offsetLeft);
    grid.scrollTo({
      left: nextLeft,
      behavior: behavior || "smooth",
    });
  }

  function syncNav() {
    var vis = visibleItems();
    var n = vis.length;
    var idx = activeCardIndex();
    if (counterEl) {
      if (n === 0) {
        counterEl.textContent = "0 / 0";
      } else {
        counterEl.textContent = idx + 1 + " / " + n;
      }
    }
    if (prevBtn) {
      prevBtn.disabled = n <= 1 || idx <= 0;
    }
    if (nextBtn) {
      nextBtn.disabled = n <= 1 || idx >= n - 1;
    }
  }

  var navRaf = null;
  function scheduleSyncNav() {
    if (navRaf !== null) return;
    navRaf = window.requestAnimationFrame(function () {
      navRaf = null;
      syncNav();
    });
  }

  var LANG_OPTIONS = [
    { value: "swift", label: "Swift" },
    { value: "java", label: "Java" },
    { value: "python", label: "Python" },
    { value: "javascript", label: "JavaScript" },
    { value: "html", label: "HTML" },
    { value: "css", label: "CSS" },
    { value: "csharp", label: "C#" },
    { value: "cpp", label: "C++" },
  ];

  function itemPassesCategoryOnly(li, cat) {
    if (cat === "all") return true;
    var raw = li.getAttribute("data-project-tags") || "";
    var tags = raw.split(/\s+/).filter(Boolean);
    return tags.indexOf(cat) !== -1;
  }

  function languageSlugsAvailableForCategory(cat) {
    var allowed = {};
    Array.prototype.forEach.call(items, function (li) {
      if (!itemPassesCategoryOnly(li, cat)) return;
      var langs = (li.getAttribute("data-project-languages") || "")
        .split(/\s+/)
        .filter(Boolean);
      langs.forEach(function (slug) {
        allowed[slug] = true;
      });
    });
    return allowed;
  }

  function syncLanguageOptionsForCategory(cat) {
    if (!langSelect) return;
    var allowed = languageSlugsAvailableForCategory(cat);
    var nextLang = langFilter;
    if (nextLang !== "all" && !allowed[nextLang]) {
      nextLang = "all";
      langFilter = "all";
    }
    langSelect.innerHTML = "";
    var optAll = document.createElement("option");
    optAll.value = "all";
    optAll.textContent = "All languages";
    langSelect.appendChild(optAll);
    LANG_OPTIONS.forEach(function (entry) {
      if (!allowed[entry.value]) return;
      var opt = document.createElement("option");
      opt.value = entry.value;
      opt.textContent = entry.label;
      langSelect.appendChild(opt);
    });
    langSelect.value = nextLang;
    langFilter = langSelect.value || "all";
  }

  function passesCategory(li) {
    if (categoryFilter === "all") return true;
    var raw = li.getAttribute("data-project-tags") || "";
    var tags = raw.split(/\s+/).filter(Boolean);
    return tags.indexOf(categoryFilter) !== -1;
  }

  function passesLanguage(li) {
    if (langFilter === "all") return true;
    var raw = li.getAttribute("data-project-languages") || "";
    var langs = raw.split(/\s+/).filter(Boolean);
    return langs.indexOf(langFilter) !== -1;
  }

  function applyFilters() {
    syncLanguageOptionsForCategory(categoryFilter);

    items.forEach(function (li) {
      if (passesCategory(li) && passesLanguage(li)) {
        li.classList.remove("is-filtered-out");
      } else {
        li.classList.add("is-filtered-out");
      }
    });

    filterButtons.forEach(function (btn) {
      var f = btn.getAttribute("data-project-filter") || "all";
      var isActive = f === categoryFilter;
      btn.classList.toggle("is-active", isActive);
      btn.setAttribute("aria-pressed", isActive ? "true" : "false");
    });

    if (categoryTrack) {
      var activeSeg = categoryTrack.querySelector(
        ".project-library-filter-btn.is-active"
      );
      if (activeSeg) {
        var segLeft = Math.max(0, activeSeg.offsetLeft - categoryTrack.offsetLeft);
        categoryTrack.scrollTo({
          left: segLeft,
          behavior: prefersReducedMotion() ? "auto" : "smooth",
        });
      }
    }

    grid.scrollLeft = 0;
    scrollToVisibleIndex(0, "auto");
    syncNav();
  }

  filterButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      categoryFilter = btn.getAttribute("data-project-filter") || "all";
      applyFilters();
    });
  });

  if (langSelect) {
    langSelect.addEventListener("change", function () {
      langFilter = langSelect.value || "all";
      applyFilters();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", function () {
      scrollToVisibleIndex(activeCardIndex() - 1);
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener("click", function () {
      scrollToVisibleIndex(activeCardIndex() + 1);
    });
  }

  grid.addEventListener("scroll", scheduleSyncNav, { passive: true });
  grid.addEventListener("scrollend", syncNav);
  window.addEventListener("resize", scheduleSyncNav);

  applyFilters();
})();

(function initProgrammingZoneSceneryParallax() {
  const zone = document.querySelector(".programming-zone");
  const scenery = zone?.querySelector(".programming-zone-scenery");
  if (!zone || !scenery) return;

  const layers = scenery.querySelectorAll("[data-parallax-rate]");
  let ticking = false;

  function applyParallax() {
    ticking = false;
    if (prefersReducedMotion()) {
      zone.style.removeProperty("--programming-zone-parallax-y");
      layers.forEach((layer) => layer.style.removeProperty("--programming-zone-parallax-y"));
      return;
    }

    const rect = zone.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const centerOffset = rect.top + rect.height * 0.5 - viewportHeight * 0.5;
    const baseY = centerOffset * 0.06;
    zone.style.setProperty("--programming-zone-parallax-y", `${baseY.toFixed(2)}px`);

    layers.forEach((layer) => {
      const rate = parseFloat(layer.getAttribute("data-parallax-rate") || "0.05");
      layer.style.setProperty(
        "--programming-zone-parallax-y",
        `${(baseY * (rate / 0.06)).toFixed(2)}px`
      );
    });
  }

  function scheduleParallax() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(applyParallax);
    }
  }

  window.addEventListener("scroll", scheduleParallax, { passive: true });
  window.addEventListener("resize", scheduleParallax, { passive: true });
  applyParallax();
})();

(function initIndexPolaroidParallax() {
  const polaroids = document.querySelectorAll(".polaroid-wrapper--scroll-parallax");
  if (!polaroids.length) return;

  let ticking = false;

  function applyParallax() {
    ticking = false;
    if (prefersReducedMotion()) {
      polaroids.forEach((el) => el.style.removeProperty("--polaroid-parallax-y"));
      return;
    }

    const viewportHeight = window.innerHeight;
    polaroids.forEach((el) => {
      const rate = el.classList.contains("polaroid-wrapper--tilt-cw") ? 0.12 : 0.12;
      const rect = el.getBoundingClientRect();
      const centerOffset = rect.top + rect.height * 0.5 - viewportHeight * 0.5;
      const y = centerOffset * rate;
      el.style.setProperty("--polaroid-parallax-y", `${y.toFixed(2)}px`);
    });
  }

  function scheduleParallax() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(applyParallax);
    }
  }

  window.addEventListener("scroll", scheduleParallax, { passive: true });
  window.addEventListener("resize", scheduleParallax, { passive: true });
  applyParallax();
})();
