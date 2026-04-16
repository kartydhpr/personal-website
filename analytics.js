/**
 * Google Analytics 4 (free). Replace with your Measurement ID from:
 * https://analytics.google.com → Admin → Data streams → Web → Measurement ID (G-…)
 *
 * Until you set a real ID, this file does nothing (no network calls).
 */
(function () {
  var GA_MEASUREMENT_ID = "G-7PT4D81E0L";
  GA_MEASUREMENT_ID = GA_MEASUREMENT_ID.trim();

  if (!GA_MEASUREMENT_ID || !/^G-[A-Za-z0-9]+$/.test(GA_MEASUREMENT_ID)) {
    return;
  }

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;
  gtag("js", new Date());
  gtag("config", GA_MEASUREMENT_ID);

  var s = document.createElement("script");
  s.async = true;
  s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(GA_MEASUREMENT_ID);
  document.head.appendChild(s);
})();
