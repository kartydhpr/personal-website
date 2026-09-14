(function () {
  const { PHONES, FEATURES, CATEGORIES, IOS_FEATURES, IMAGES, FEATURE_IMAGES, PRODUCT_PAIR, PRODUCT_PAD, PRODUCT_FAR } = window.LEAP_DATA;
  const PAIR_SHOTS = new Set(PRODUCT_PAIR || []);
  const PAD_SHOTS = new Set(PRODUCT_PAD || []);
  const FAR_SHOTS = new Set(PRODUCT_FAR || []);

  function productClass(phone) {
    if (FAR_SHOTS.has(phone.id)) return " is-far";
    if (PAD_SHOTS.has(phone.id)) return " is-pad";
    if (PAIR_SHOTS.has(phone.id)) return " is-pair";
    return "";
  }
  const CURRENT_IOS = 27;
  const DEFAULT_FROM = "iphone-13";
  const DEFAULT_TO = "iphone-18-pro";

  const byId = Object.fromEntries(PHONES.map((p) => [p.id, p]));

  const fromSelect = document.getElementById("leap-from");
  const toSelect = document.getElementById("leap-to");
  const swapBtn = document.getElementById("leap-swap");
  const results = document.getElementById("leap-results");
  const fromDevice = document.getElementById("leap-from-device");
  const toDevice = document.getElementById("leap-to-device");

  function phoneLabel(p) {
    return p.name;
  }

  function fillSelect(select, newestFirst) {
    const years = [...new Set(PHONES.map((p) => p.year))].sort((a, b) =>
      newestFirst ? b - a : a - b
    );
    select.innerHTML = "";
    years.forEach((year) => {
      const group = document.createElement("optgroup");
      group.label = String(year);
      PHONES.filter((p) => p.year === year)
        .slice()
        .sort(sortPhones)
        .forEach((p) => {
        const opt = document.createElement("option");
        opt.value = p.id;
        const isNew = ["iphone-18-pro", "iphone-18-pro-max", "iphone-duo"].includes(p.id);
        opt.textContent = isNew ? `${p.name} (New)` : p.name;
        group.appendChild(opt);
      });
      select.appendChild(group);
    });
  }

  function readHash() {
    const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    return {
      from: params.get("from"),
      to: params.get("to"),
    };
  }

  function writeHash(fromId, toId) {
    const next = `#from=${fromId}&to=${toId}`;
    if (window.location.hash !== next) {
      history.replaceState(null, "", next);
    }
  }

  function pickHighlights(gained) {
    const picked = [];
    const perCat = {};
    gained
      .slice()
      .sort((a, b) => b.weight - a.weight)
      .forEach((f) => {
        const n = perCat[f.category] || 0;
        if (n >= 2 || f.weight < 60 || picked.length >= 6) return;
        picked.push(f);
        perCat[f.category] = n + 1;
      });
    return picked;
  }

  function sortPhones(a, b) {
    if (a.year !== b.year) return b.year - a.year;
    return (b.chipGen + (b.displayIn || 0) / 100) - (a.chipGen + (a.displayIn || 0) / 100);
  }

  function yearsBetween(from, to) {
    return to.year - from.year;
  }

  function leapCopy(from, to) {
    const years = yearsBetween(from, to);
    if (from.id === to.id) {
      return { kicker: "Same phone", title: "That’s the one you already have." };
    }
    if (years < 0) {
      return {
        kicker: "Going backward",
        title: `${Math.abs(years)} year${Math.abs(years) === 1 ? "" : "s"} older.`,
      };
    }
    if (years === 0) {
      return { kicker: "Same year", title: "A sidegrade in the same generation." };
    }
    if (years === 1) {
      return { kicker: "One year", title: "A single generation. Still a few things you’d feel." };
    }
    return {
      kicker: `${years} years`,
      title: `Skipping ${years} years of iPhones.`,
    };
  }

  function wifiLabel(n) {
    if (n >= 7) return "Wi-Fi 7";
    if (n >= 6.5) return "Wi-Fi 6E";
    if (n >= 6) return "Wi-Fi 6";
    return "Wi-Fi 5";
  }

  function cameraSummary(p) {
    const parts = [`${p.mainMp}MP main`];
    if (p.ultraWide) parts.push("Ultra Wide");
    if (p.telephoto) parts.push("Telephoto");
    return `${parts.join(" + ")} · ${p.opticalZoom}`;
  }

  function displaySummary(p) {
    if (p.foldable) return "7.6″ inner / 5.4″ outer OLED · ProMotion";
    const panel = p.displayType === "oled" ? "OLED" : "LCD";
    const hz = p.proMotion ? "ProMotion 120Hz" : `${p.refresh}Hz`;
    return `${p.displayIn}″ ${panel} · ${hz}`;
  }

  function faceLabel(p) {
    if (p.face === "island") return "Dynamic Island";
    if (p.face === "home") return "Home button";
    if (p.face === "duo") return "Touch ID · dual displays";
    return "Notch";
  }

  function phoneImage(phone) {
    return (IMAGES && IMAGES[phone.id]) || "";
  }

  function renderDevice(el, phone) {
    if (!el) return;
    const src = phoneImage(phone);
    el.innerHTML = `
      <div class="leap-device-photo${productClass(phone)}">
        <img src="${escapeHtml(src)}" alt="${escapeHtml(phone.name)} product photograph, copyright Apple Inc." width="2000" height="2000">
      </div>
      <h2 class="leap-device-name">${escapeHtml(phone.name)}</h2>
      <p class="leap-device-meta">
        <span class="leap-swatch" style="background:${escapeHtml(phone.accent)}" aria-hidden="true"></span>
        ${phone.year} · ${escapeHtml(phone.chip)}
      </p>
    `;
  }

  function specRows(from, to) {
    return [
      { label: "Chip", a: from.chip, b: to.chip, up: to.chipGen > from.chipGen },
      { label: "Memory", a: `${from.ram}GB`, b: `${to.ram}GB`, up: to.ram > from.ram },
      { label: "Display", a: displaySummary(from), b: displaySummary(to), up: to.foldable || to.displayIn !== from.displayIn || to.proMotion !== from.proMotion || to.displayType !== from.displayType },
      { label: "Peak brightness", a: `${from.peakNits.toLocaleString()} nits`, b: `${to.peakNits.toLocaleString()} nits`, up: to.peakNits > from.peakNits },
      { label: "Rear cameras", a: cameraSummary(from), b: cameraSummary(to), up: to.mainMp > from.mainMp || Number(to.ultraWide) + Number(to.telephoto) > Number(from.ultraWide) + Number(from.telephoto) },
      { label: "Front camera", a: `${from.frontMp}MP`, b: `${to.frontMp}MP`, up: to.frontMp > from.frontMp },
      { label: "Face of the phone", a: faceLabel(from), b: faceLabel(to), up: (to.face === "island" && from.face !== "island") || (to.faceId && !from.faceId) },
      { label: "Connector", a: from.connector, b: to.connector, up: from.connector !== to.connector && to.connector === "USB-C" },
      { label: "Wireless", a: wifiLabel(from.wifi), b: wifiLabel(to.wifi), up: to.wifi > from.wifi },
      { label: "Latest iOS it can run", a: `iOS ${from.lastIos}`, b: `iOS ${to.lastIos}`, up: to.lastIos > from.lastIos },
    ];
  }

  function iosUnlocked(from, to) {
    if (to.lastIos <= from.lastIos) return [];
    return IOS_FEATURES.filter((f) => f.minIos > from.lastIos && f.minIos <= to.lastIos);
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  const CAT_ANNOUNCE = {
    intelligence: "Intelligence.",
    camera: "Camera.",
    display: "Display.",
    controls: "Controls.",
    safety: "Safety.",
    connectivity: "Wireless.",
    security: "Security.",
  };

  function announceName(name) {
    return /[.!?]$/.test(name) ? name : `${name}.`;
  }

  function catLabel(id) {
    return CAT_ANNOUNCE[id] || "New.";
  }

  function featureShot(feature) {
    return FEATURE_IMAGES && FEATURE_IMAGES[feature.id];
  }

  function shotSrcset(src) {
    if (src.includes("_large_2x.")) return "";
    if (src.includes("_large.")) return src.replace("_large.", "_large_2x.");
    if (src.endsWith("_large.png")) return src.replace("_large.png", "_large_2x.png");
    return "";
  }

  function shotMarkup(shot, kind) {
    if (!shot) return "";
    const fit = shot.fit === "contain" ? " is-contain" : "";
    const src2x = shotSrcset(shot.src);
    const srcset = src2x ? ` srcset="${escapeHtml(shot.src)} 1x, ${escapeHtml(src2x)} 2x"` : "";
    return `<span class="leap-shot leap-shot--${kind}${fit}">
      <img src="${escapeHtml(shot.src)}"${srcset} alt="${escapeHtml(shot.alt)}" width="1200" height="900" loading="lazy" decoding="async">
    </span>`;
  }

  function featureCard(feature, modifier) {
    return `
      <article class="leap-feature ${modifier || ""}">
        <h3>${escapeHtml(feature.name)}</h3>
        <p>${escapeHtml(feature.blurb)}</p>
        ${feature.why ? `<p class="leap-feature-why">${escapeHtml(feature.why)}</p>` : ""}
      </article>
    `;
  }

  function unlockRow(feature, index) {
    const shot = featureShot(feature);
    return `
      <li class="leap-unlock${shot ? " has-photo" : ""}" data-cat="${escapeHtml(feature.category)}">
        <span class="leap-unlock-n" aria-hidden="true">${String(index + 1).padStart(2, "0")}</span>
        <div>
          <h5>${escapeHtml(announceName(feature.name))}</h5>
          <p>${escapeHtml(feature.blurb)}</p>
          ${feature.why ? `<p class="leap-unlock-why">${escapeHtml(feature.why)}</p>` : ""}
        </div>
        ${shotMarkup(shot, "unlock")}
      </li>
    `;
  }

  let filmsObserver = null;

  function alignFilms(track) {
    if (!track) return;
    const cards = [...track.querySelectorAll(".leap-film")];
    const styles = getComputedStyle(track);
    const gap = parseFloat(styles.columnGap || styles.gap) || 0;
    const pad = parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight);
    const cardsWidth =
      cards.reduce((sum, el) => sum + el.getBoundingClientRect().width, 0) +
      gap * Math.max(0, cards.length - 1);
    const short = cardsWidth <= track.clientWidth - pad + 1;
    track.classList.toggle("is-short", short);
    const prev = document.querySelector("[data-films-prev]");
    const next = document.querySelector("[data-films-next]");
    if (prev) prev.hidden = short;
    if (next) next.hidden = short;
  }

  function bindTheater() {
    const track = document.querySelector(".leap-films-track");
    if (filmsObserver) {
      filmsObserver.disconnect();
      filmsObserver = null;
    }
    if (!track) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const step = () => Math.max(280, Math.round(track.clientWidth * 0.72));
    const go = (dir) =>
      track.scrollBy({ left: dir * step(), behavior: reduce ? "auto" : "smooth" });
    const prev = document.querySelector("[data-films-prev]");
    const next = document.querySelector("[data-films-next]");
    if (prev) prev.addEventListener("click", () => go(-1));
    if (next) next.addEventListener("click", () => go(1));
    track.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        go(1);
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(-1);
      }
    });
    const sync = () => alignFilms(track);
    requestAnimationFrame(sync);
    track.querySelectorAll("img").forEach((img) => {
      if (!img.complete) img.addEventListener("load", sync, { once: true });
    });
    filmsObserver = new ResizeObserver(sync);
    filmsObserver.observe(track);
  }

  function render() {
    const from = byId[fromSelect.value];
    const to = byId[toSelect.value];
    if (!from || !to) return;

    writeHash(from.id, to.id);
    renderDevice(fromDevice, from);
    renderDevice(toDevice, to);

    document.querySelectorAll("[data-leap-to]").forEach((btn) => {
      btn.classList.toggle("is-active", btn.getAttribute("data-leap-to") === to.id);
    });

    const gained = FEATURES.filter((f) => f.has(to) && !f.has(from))
      .sort((a, b) => b.weight - a.weight)
      .filter((f, _, list) => !(f.id === "ceramic-shield" && list.some((g) => g.id === "ceramic-shield-2")));
    const lost = FEATURES.filter((f) => f.has(from) && !f.has(to)).sort((a, b) => b.weight - a.weight);
    const highlights = pickHighlights(gained);
    const software = iosUnlocked(from, to);
    const copy = leapCopy(from, to);
    const same = from.id === to.id;
    const years = yearsBetween(from, to);

    const stillSupported = from.lastIos >= CURRENT_IOS;
    const supportNote = stillSupported
      ? `<p class="leap-note">Your ${escapeHtml(from.name)} still runs iOS ${CURRENT_IOS}. A lot of the look-and-feel of a new iPhone is already a software update away. Below is what <strong>only new hardware</strong> unlocks.</p>`
      : `<p class="leap-note">Your ${escapeHtml(from.name)} stopped at <strong>iOS ${from.lastIos}</strong>. A new iPhone is also how you get every iOS release since then, not just a faster chip.</p>`;

    let html = `
      <header class="leap-verdict">
        <p class="leap-kicker">${escapeHtml(copy.kicker)}</p>
        <h2>${escapeHtml(copy.title)}</h2>
        ${same || years < 0 ? "" : supportNote}
      </header>
    `;

    if (same) {
      results.innerHTML = html + `<p class="leap-empty">Pick a different upgrade target to see what you’d gain.</p>`;
      return;
    }

    if (software.length) {
      html += `
        <section class="leap-block" aria-labelledby="leap-ios-heading">
          <h3 id="leap-ios-heading" class="leap-block-title">iOS your current phone can no longer run</h3>
          <p class="leap-block-intro">These are software features, but they’re gated by support. ${escapeHtml(from.name)} maxes out at iOS ${from.lastIos}; ${escapeHtml(to.name)} can run iOS ${to.lastIos}.</p>
          <div class="leap-feature-grid">
            ${software
              .map(
                (f) => `
              <article class="leap-feature">
                <h3>${escapeHtml(f.name)}</h3>
                <p>${escapeHtml(f.blurb)}</p>
                <p class="leap-feature-why">Requires iOS ${f.minIos} or later.</p>
              </article>`
              )
              .join("")}
          </div>
        </section>
      `;
    }

    if (highlights.length || gained.length) {
      html += `<div class="leap-theater">`;
    }

    if (highlights.length) {
      html += `
        <section class="leap-films" aria-labelledby="leap-notice-heading">
          <div class="leap-films-head">
            <div>
              <p class="leap-eyebrow">The ones you’d feel</p>
              <h3 id="leap-notice-heading">What you’d actually notice.</h3>
            </div>
            <div class="leap-films-nav">
              <button type="button" data-films-prev aria-label="Previous features">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M11.2 3.6 5.8 9l5.4 5.4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </button>
              <button type="button" data-films-next aria-label="Next features">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M6.8 3.6 12.2 9l-5.4 5.4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </button>
            </div>
          </div>
          <div class="leap-films-track" tabindex="0" role="list" aria-label="Highlights">
            ${highlights
              .map((f) => {
                const shot = featureShot(f);
                return `
              <article class="leap-film${shot ? " has-photo" : ""}" data-cat="${escapeHtml(f.category)}" role="listitem">
                ${shotMarkup(shot, "film")}
                <div class="leap-film-copy">
                  <p class="leap-film-cat">${escapeHtml(catLabel(f.category))}</p>
                  <h4>${escapeHtml(announceName(f.name))}</h4>
                  <p>${escapeHtml(f.blurb)}</p>
                </div>
              </article>`;
              })
              .join("")}
          </div>
          <p class="leap-credit">Feature photographs © Apple Inc. Shown to illustrate a capability. Not licensed or endorsed by Apple.</p>
        </section>
      `;
    }

    if (gained.length) {
      html += `
        <section class="leap-unlocks" aria-labelledby="leap-gain-heading">
          <header class="leap-unlocks-intro">
            <p class="leap-eyebrow">Unlocked</p>
            <h3 id="leap-gain-heading">${gained.length} thing${gained.length === 1 ? "" : "s"} only new hardware can do.</h3>
            <p>${escapeHtml(to.name)} can. ${escapeHtml(from.name)} cannot.</p>
          </header>
      `;

      CATEGORIES.forEach((cat) => {
        const items = gained.filter((f) => f.category === cat.id);
        if (!items.length) return;
        html += `
          <section class="leap-chapter" data-cat="${escapeHtml(cat.id)}" aria-labelledby="leap-cat-${escapeHtml(cat.id)}">
            <h4 id="leap-cat-${escapeHtml(cat.id)}">${escapeHtml(catLabel(cat.id))}</h4>
            <ol class="leap-unlock-list">
              ${items.map((f, i) => unlockRow(f, i)).join("")}
            </ol>
          </section>
        `;
      });

      html += `</section>`;
    } else if (years >= 0) {
      html += `<p class="leap-empty">Same feature set on paper. Check the spec sheet below for the quieter upgrades: chip, brightness, zoom.</p>`;
    }

    if (highlights.length || gained.length) {
      html += `</div>`;
    }

    if (lost.length) {
      html += `
        <section class="leap-block leap-block--lose" aria-labelledby="leap-lose-heading">
          <h3 id="leap-lose-heading" class="leap-block-title">What you’d give up</h3>
          <p class="leap-block-intro">${escapeHtml(to.name)} is missing ${lost.length} thing${lost.length === 1 ? "" : "s"} you already have on ${escapeHtml(from.name)}.</p>
          <div class="leap-feature-grid">
            ${lost.map((f) => featureCard(f, "leap-feature--lost")).join("")}
          </div>
        </section>
      `;
    }

    const rows = specRows(from, to);
    html += `
      <section class="leap-block" aria-labelledby="leap-spec-heading">
        <h3 id="leap-spec-heading" class="leap-block-title">Spec sheet</h3>
        <div class="leap-table-wrap">
          <table class="leap-table">
            <thead>
              <tr>
                <th scope="col"></th>
                <th scope="col">${escapeHtml(from.name)}</th>
                <th scope="col">${escapeHtml(to.name)}</th>
              </tr>
            </thead>
            <tbody>
              ${rows
                .map(
                  (r) => `
                <tr class="${r.up ? "is-upgrade" : ""}">
                  <th scope="row">${escapeHtml(r.label)}</th>
                  <td>${escapeHtml(r.a)}</td>
                  <td>${escapeHtml(r.b)}${r.up ? ' <span class="leap-up" aria-label="upgrade">↑</span>' : ""}</td>
                </tr>`
                )
                .join("")}
            </tbody>
          </table>
        </div>
      </section>
    `;

    html += `
      <p class="leap-footnote">Unofficial comparison. Specs and feature gates compiled from public sources as of September 2026. Availability varies by region, language, and carrier. Leap is not affiliated with Apple. <a href="#legal">Legal notices</a></p>
    `;

    results.innerHTML = html;
    bindTheater();
  }

  function scrollToId(id) {
    const el = document.getElementById(id);
    if (!el) return;
    if (id === "method" && "open" in el) el.open = true;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const nav = document.querySelector(".leap-nav")?.offsetHeight || 52;
    const top = el.getBoundingClientRect().top + window.scrollY - nav;
    window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
  }

  fillSelect(fromSelect, true);
  fillSelect(toSelect, true);

  const hash = readHash();
  fromSelect.value = byId[hash.from] ? hash.from : DEFAULT_FROM;
  toSelect.value = byId[hash.to] ? hash.to : DEFAULT_TO;

  fromSelect.addEventListener("change", render);
  toSelect.addEventListener("change", render);
  document.querySelectorAll("[data-leap-to]").forEach((btn) => {
    btn.addEventListener("click", function () {
      toSelect.value = btn.getAttribute("data-leap-to");
      render();
      scrollToId("compare");
    });
  });
  document.addEventListener("click", function (e) {
    const link = e.target.closest('a[href="#compare"], a[href="#top"], a[href="#method"], a[href="#legal"]');
    if (!link) return;
    e.preventDefault();
    scrollToId(link.getAttribute("href").slice(1));
  });
  swapBtn.addEventListener("click", function () {
    const a = fromSelect.value;
    fromSelect.value = toSelect.value;
    toSelect.value = a;
    render();
  });

  window.addEventListener("hashchange", function () {
    const next = readHash();
    if (byId[next.from]) fromSelect.value = next.from;
    if (byId[next.to]) toSelect.value = next.to;
    render();
  });

  render();
})();
