(function () {
  "use strict";

  function scrollToId(id) {
    var el = document.getElementById(id);
    if (!el) return;
    var reduce =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var nav = document.querySelector(".duffel-nav");
    var offset = nav ? nav.offsetHeight : 52;
    var top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({
      top: Math.max(0, top),
      behavior: reduce ? "auto" : "smooth",
    });
  }

  document.addEventListener("click", function (e) {
    var link = e.target.closest(
      'a[href="#top"], a[href="#flow"], a[href="#screens"], a[href="#privacy"]'
    );
    if (!link) return;
    e.preventDefault();
    scrollToId(link.getAttribute("href").slice(1));
  });
})();
