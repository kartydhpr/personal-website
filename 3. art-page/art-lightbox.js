/**
 * Art gallery lightbox: Bootstrap modal, prev/next slides, optional parallax, zoom/pan on artwork.
 */
(function () {
  "use strict";

  var $modal = $("#artLightboxModal");
  if (!$modal.length) return;

  var $img = $("#artLightboxImage");
  var $title = $("#artLightboxTitle");
  var $subtitle = $("#artLightboxSubtitle");
  var $prev = $(".art-lightbox-nav--prev");
  var $next = $(".art-lightbox-nav--next");
  var $stage = $(".art-lightbox-stage");
  var $slideWrap = $(".art-lightbox-slide-wrap");
  var $parallax = $(".art-lightbox-parallax");
  var $body = $(".art-lightbox-modal__body");
  var $zoomLayer = $(".art-lightbox-zoom-layer");
  var $zoomPct = $("#artLightboxZoomPct");

  $img.attr("draggable", "false").on("dragstart.artLb", function (e) {
    e.preventDefault();
  });

  $slideWrap.on("selectstart.artLbSel", function (e) {
    if (!$modal.hasClass("show")) return;
    e.preventDefault();
  });

  var parallaxEnabled =
    typeof window.matchMedia === "function" &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
    !window.matchMedia("(pointer: coarse)").matches;

  var slideMotion =
    typeof window.matchMedia === "function" &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!parallaxEnabled) {
    $body.addClass("art-lightbox--no-motion");
  }

  if (!slideMotion) {
    $body.addClass("art-lightbox--no-slide");
  }

  var parallaxRaf = null;
  var parallaxClientX = 0;
  var parallaxClientY = 0;
  var slideBusy = false;
  var slideGen = 0;

  var ZOOM_MIN = 1;
  var ZOOM_MAX = 4;
  var ZOOM_STEP = 0.35;
  var zoom = 1;
  var panX = 0;
  var panY = 0;
  var panPointerId = null;
  var panLastClientX = 0;
  var panLastClientY = 0;

  function isZoomed() {
    return zoom > 1.01;
  }

  function resetParallaxTilt() {
    if (!$parallax.length) return;
    $parallax.css(
      "transform",
      "perspective(1100px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)"
    );
  }

  function applyParallaxTilt() {
    parallaxRaf = null;
    if (!parallaxEnabled || !$parallax.length || slideBusy || isZoomed()) return;
    var el = $parallax[0];
    var rect = el.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) return;
    var cx = rect.left + rect.width / 2;
    var cy = rect.top + rect.height / 2;
    var dx = (parallaxClientX - cx) / (rect.width / 2);
    var dy = (parallaxClientY - cy) / (rect.height / 2);
    dx = Math.max(-1, Math.min(1, dx));
    dy = Math.max(-1, Math.min(1, dy));
    var maxRotY = 7;
    var maxRotX = 5.5;
    var rotY = dx * maxRotY;
    var rotX = dy * -maxRotX;
    $parallax.css(
      "transform",
      "perspective(1100px) rotateX(" +
        rotX +
        "deg) rotateY(" +
        rotY +
        "deg) scale3d(1.012, 1.012, 1)"
    );
  }

  function onParallaxMove(e) {
    if (isZoomed()) return;
    parallaxClientX = e.clientX;
    parallaxClientY = e.clientY;
    if (parallaxRaf !== null) return;
    parallaxRaf = window.requestAnimationFrame(function () {
      parallaxRaf = null;
      applyParallaxTilt();
    });
  }

  function bindParallax() {
    if (!parallaxEnabled || !$stage.length || !$parallax.length) return;
    resetParallaxTilt();
    $stage
      .off("mousemove.artParallax")
      .on("mousemove.artParallax", onParallaxMove)
      .off("mouseleave.artParallax")
      .on("mouseleave.artParallax", resetParallaxTilt);
  }

  function unbindParallax() {
    $stage.off("mousemove.artParallax mouseleave.artParallax");
  }

  function updateZoomPct() {
    if (!$zoomPct.length) return;
    $zoomPct.text(Math.round(zoom * 100) + "%");
  }

  function clampPan() {
    if (!$zoomLayer.length || !$slideWrap.length) return;
    if (zoom <= ZOOM_MIN) {
      panX = 0;
      panY = 0;
      return;
    }
    var w = $zoomLayer.outerWidth();
    var h = $zoomLayer.outerHeight();
    var pw = $slideWrap.innerWidth();
    var ph = $slideWrap.innerHeight();
    if (w < 2 || h < 2) return;
    var mw = Math.max(0, (w * zoom - pw) / 2 + 8);
    var mh = Math.max(0, (h * zoom - ph) / 2 + 8);
    panX = Math.max(-mw, Math.min(mw, panX));
    panY = Math.max(-mh, Math.min(mh, panY));
  }

  function applyZoomTransform() {
    if (!$zoomLayer.length) return;
    $zoomLayer.css(
      "transform",
      "translate3d(" + panX + "px," + panY + "px,0) scale(" + zoom + ")"
    );
    $body.toggleClass("art-lightbox--zoomed", isZoomed());
    $slideWrap.toggleClass("art-lightbox-slide-wrap--can-pan", isZoomed());
    updateZoomPct();
    if (isZoomed()) {
      resetParallaxTilt();
    }
  }

  function resetZoom() {
    zoom = ZOOM_MIN;
    panX = 0;
    panY = 0;
    panPointerId = null;
    if ($zoomLayer.length) {
      $zoomLayer.css("transform", "");
    }
    $body.removeClass("art-lightbox--zoomed");
    $slideWrap.removeClass("art-lightbox-slide-wrap--can-pan art-lightbox-slide-wrap--panning");
    updateZoomPct();
  }

  function zoomBy(factor) {
    var nz = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, zoom * factor));
    if (Math.abs(nz - zoom) < 0.001) return;
    zoom = nz;
    if (zoom <= 1.001) {
      panX = 0;
      panY = 0;
    }
    clampPan();
    applyZoomTransform();
  }

  function zoomStep(delta) {
    var nz = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, zoom + delta * ZOOM_STEP));
    if (Math.abs(nz - zoom) < 0.001) return;
    zoom = nz;
    if (zoom <= 1.001) {
      panX = 0;
      panY = 0;
    }
    clampPan();
    applyZoomTransform();
  }

  var onWheelZoom = function (e) {
    if (!$modal.hasClass("show") || slideBusy) return;
    if (!$slideWrap.length || !$.contains($slideWrap[0], e.target)) return;
    e.preventDefault();
    var dy = e.deltaY;
    var factor = dy > 0 ? 0.9 : 1.11;
    zoomBy(factor);
  };

  function bindWheelZoom() {
    var el = $slideWrap.length ? $slideWrap[0] : null;
    if (!el || el._artLbWheel) return;
    el.addEventListener("wheel", onWheelZoom, { passive: false });
    el._artLbWheel = true;
  }

  function unbindWheelZoom() {
    var el = $slideWrap.length ? $slideWrap[0] : null;
    if (!el || !el._artLbWheel) return;
    el.removeEventListener("wheel", onWheelZoom);
    delete el._artLbWheel;
  }

  function endPan() {
    panPointerId = null;
    $slideWrap.removeClass("art-lightbox-slide-wrap--panning");
  }

  function bindPanZoom() {
    $slideWrap
      .off("pointerdown.artLbPan")
      .on("pointerdown.artLbPan", function (e) {
        if (!isZoomed() || slideBusy) return;
        if (e.pointerType === "mouse" && e.button !== 0) return;
        e.preventDefault();
        panPointerId = e.pointerId;
        panLastClientX = e.clientX;
        panLastClientY = e.clientY;
        $slideWrap.addClass("art-lightbox-slide-wrap--panning");
        try {
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch (err) {}
      })
      .off("pointermove.artLbPan")
      .on("pointermove.artLbPan", function (e) {
        if (panPointerId === null || e.pointerId !== panPointerId) return;
        panX += e.clientX - panLastClientX;
        panY += e.clientY - panLastClientY;
        panLastClientX = e.clientX;
        panLastClientY = e.clientY;
        clampPan();
        applyZoomTransform();
      })
      .off("pointerup.artLbPan pointercancel.artLbPan")
      .on("pointerup.artLbPan pointercancel.artLbPan", function (e) {
        if (panPointerId !== null && e.pointerId === panPointerId) {
          endPan();
        }
      });
  }

  function unbindPanZoom() {
    $slideWrap.off(
      "pointerdown.artLbPan pointermove.artLbPan pointerup.artLbPan pointercancel.artLbPan"
    );
    endPan();
  }

  function readItem(container) {
    var img = container.querySelector("img");
    if (!img || !img.getAttribute("src")) return null;
    var tip = container.querySelector(".tooltip");
    var h5 = tip ? tip.querySelector("h5") : null;
    var h6 = tip ? tip.querySelector("h6") : null;
    var title = h5 ? h5.textContent.trim() : "";
    var subtitle = h6 ? h6.textContent.trim() : "";
    return {
      src: img.getAttribute("src"),
      alt: title || "Artwork",
      title: title,
      subtitle: subtitle,
    };
  }

  var containers = [];
  var items = [];
  document.querySelectorAll(".gallery .image-container").forEach(function (container) {
    var item = readItem(container);
    if (item) {
      containers.push(container);
      items.push(item);
    }
  });

  if (!items.length) return;

  var currentIndex = 0;

  function resetSlideWrap() {
    if (!$slideWrap.length) return;
    $slideWrap.off("transitionend.artOut transitionend.artIn");
    $slideWrap.css({
      transition: "",
      transform: "translateX(0)",
    });
  }

  function syncLabels() {
    var item = items[currentIndex];
    var n = items.length;
    $title.text(item.title || "Artwork");
    $subtitle.text(item.subtitle || "");
    $modal.attr(
      "aria-label",
      (item.title || "Artwork") + " — image " + (currentIndex + 1) + " of " + n
    );
    var solo = n <= 1;
    $prev.prop("disabled", solo).attr("aria-disabled", solo ? "true" : "false");
    $next.prop("disabled", solo).attr("aria-disabled", solo ? "true" : "false");
  }

  function syncImage() {
    var item = items[currentIndex];
    $img.attr("src", item.src).attr("alt", item.alt);
    var isLogoAsset = item.src.indexOf("logo.png") !== -1;
    $img.toggleClass("art-lightbox-img--logo-back", isLogoAsset);
    resetZoom();
    $img.off("load.artLbZoom").one("load.artLbZoom", function () {
      clampPan();
      applyZoomTransform();
    });
  }

  function render() {
    syncImage();
    syncLabels();
    resetSlideWrap();
    resetParallaxTilt();
  }

  function isTransformTransitionEnd(e) {
    var pn = e.originalEvent && e.originalEvent.propertyName;
    return pn === "transform" || pn === "-webkit-transform";
  }

  function goStepAnimated(delta) {
    if (items.length <= 1 || slideBusy) return;
    var nextIndex = (currentIndex + delta + items.length) % items.length;

    if (!slideMotion || !$slideWrap.length) {
      currentIndex = nextIndex;
      render();
      return;
    }

    slideBusy = true;
    resetZoom();
    applyZoomTransform();
    unbindParallax();
    $stage.addClass("art-lightbox-stage--slide-busy");

    var outX = delta > 0 ? "-110%" : "110%";
    var inFrom = delta > 0 ? "110%" : "-110%";
    var ease = "cubic-bezier(0.4, 0, 0.2, 1)";
    var wrapEl = $slideWrap[0];

    function afterSlideIn() {
      slideBusy = false;
      $stage.removeClass("art-lightbox-stage--slide-busy");
      resetSlideWrap();
      resetParallaxTilt();
      bindParallax();
    }

    function armTransitionEnd($el, ns, onDone) {
      var myGen = slideGen;
      var done = false;
      function finish() {
        if (done) return;
        done = true;
        clearTimeout(tid);
        $el.off("transitionend." + ns);
        if (myGen !== slideGen) return;
        onDone();
      }
      var tid = setTimeout(finish, 480);
      $el.on("transitionend." + ns, function (e) {
        if (e.target !== wrapEl) return;
        if (!isTransformTransitionEnd(e)) return;
        finish();
      });
    }

    $slideWrap.css({
      transition: "transform 0.38s " + ease,
      transform: "translateX(" + outX + ")",
    });

    armTransitionEnd($slideWrap, "artOut", function () {
      currentIndex = nextIndex;
      syncImage();
      syncLabels();

      $slideWrap.css({
        transition: "none",
        transform: "translateX(" + inFrom + ")",
      });

      window.requestAnimationFrame(function () {
        window.requestAnimationFrame(function () {
          $slideWrap.css({
            transition: "transform 0.42s cubic-bezier(0.22, 1, 0.32, 1)",
            transform: "translateX(0)",
          });

          armTransitionEnd($slideWrap, "artIn", afterSlideIn);
        });
      });
    });
  }

  function step(delta) {
    if (items.length <= 1) return;
    goStepAnimated(delta);
  }

  function openIndex(index) {
    currentIndex = ((index % items.length) + items.length) % items.length;
    render();
    $modal.modal("show");
  }

  function onKeydown(e) {
    if (!$modal.hasClass("show")) return;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      step(-1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      step(1);
    } else if (e.key === "+" || e.key === "=") {
      e.preventDefault();
      zoomStep(1);
    } else if (e.key === "-" || e.key === "_") {
      e.preventDefault();
      zoomStep(-1);
    } else if (e.key === "0") {
      e.preventDefault();
      resetZoom();
      applyZoomTransform();
    }
  }

  containers.forEach(function (container, i) {
    container.setAttribute("role", "button");
    container.setAttribute("tabindex", "0");
    var label = items[i].title || "Artwork";
    container.setAttribute("aria-label", "Open larger view: " + label);

    container.addEventListener("click", function (e) {
      e.preventDefault();
      openIndex(i);
    });
    container.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openIndex(i);
      }
    });
  });

  $prev.on("click", function () {
    step(-1);
  });
  $next.on("click", function () {
    step(1);
  });

  $("#artLightboxZoomIn").on("click", function () {
    zoomStep(1);
  });
  $("#artLightboxZoomOut").on("click", function () {
    zoomStep(-1);
  });
  $("#artLightboxZoomReset").on("click", function () {
    resetZoom();
    applyZoomTransform();
    resetParallaxTilt();
  });

  function onResizeZoom() {
    if (!$modal.hasClass("show")) return;
    clampPan();
    applyZoomTransform();
  }

  $modal.on("shown.bs.modal", function () {
    $(document).on("keydown.artLightbox", onKeydown);
    $(window).on("resize.artLbZoom", onResizeZoom);
    bindWheelZoom();
    bindPanZoom();
    bindParallax();
  });
  $modal.on("hidden.bs.modal", function () {
    $(document).off("keydown.artLightbox");
    $(window).off("resize.artLbZoom", onResizeZoom);
    unbindWheelZoom();
    unbindPanZoom();
    slideGen += 1;
    if (parallaxRaf !== null) {
      window.cancelAnimationFrame(parallaxRaf);
      parallaxRaf = null;
    }
    unbindParallax();
    slideBusy = false;
    $stage.removeClass("art-lightbox-stage--slide-busy");
    resetSlideWrap();
    resetParallaxTilt();
    resetZoom();
  });
})();
