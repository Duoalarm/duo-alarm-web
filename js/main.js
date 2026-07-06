/* Duo alarm — interactions & elegant, performant animations (vanilla JS) */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Sticky header + back-to-top (shows after 20 % scroll) ---- */
  var header = document.querySelector(".header");
  var toTop = document.querySelector("[data-to-top]");
  var goldBands = document.querySelectorAll(".band-gold");
  function onScroll() {
    // read layout geometry first, then apply all class changes, to avoid forced reflow
    var scrolled = window.scrollY > 12;
    var show = false, onGold = false;
    if (toTop) {
      var scrollable = document.documentElement.scrollHeight - window.innerHeight;
      var pct = scrollable > 0 ? window.scrollY / scrollable : 0;
      show = pct > 0.2;
      if (show) {
        // switch to dark style when the button overlaps a gold band (gold-on-gold is invisible)
        var br = toTop.getBoundingClientRect();
        var cx = br.left + br.width / 2, cy = br.top + br.height / 2;
        for (var i = 0; i < goldBands.length; i++) {
          var r = goldBands[i].getBoundingClientRect();
          if (cx >= r.left && cx <= r.right && cy >= r.top && cy <= r.bottom) { onGold = true; break; }
        }
      }
    }
    if (header) header.classList.toggle("scrolled", scrolled);
    if (toTop) {
      toTop.classList.toggle("show", show);
      toTop.classList.toggle("on-gold", onGold);
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  onScroll();
  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    });
  }

  /* ---- Mobile menu ---- */
  var toggle = document.querySelector(".nav-toggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var open = document.body.classList.toggle("menu-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.style.overflow = open ? "hidden" : "";
    });
    document.querySelectorAll(".mobile-menu a").forEach(function (a) {
      a.addEventListener("click", function () {
        document.body.classList.remove("menu-open");
        document.body.style.overflow = "";
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---- Scroll reveal ---- */
  var revealEls = document.querySelectorAll("[data-reveal]");
  if (reduce || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var delay = parseInt(el.getAttribute("data-reveal"), 10) || 0;
          el.style.transitionDelay = delay + "ms";
          el.classList.add("in");
          io.unobserve(el);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -7% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---- Count-up ---- */
  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count")), dur = 1500, start = null;
    function tick(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1), eased = 1 - Math.pow(1 - p, 3);
      el.firstChild.nodeValue = target % 1 === 0 ? Math.round(target * eased) : (target * eased).toFixed(1);
      if (p < 1) requestAnimationFrame(tick); else el.firstChild.nodeValue = target;
    }
    requestAnimationFrame(tick);
  }
  var counters = document.querySelectorAll("[data-count]");
  if (counters.length) {
    if (reduce || !("IntersectionObserver" in window)) {
      counters.forEach(function (el) { el.firstChild.nodeValue = el.getAttribute("data-count"); });
    } else {
      var co = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { animateCount(e.target); co.unobserve(e.target); } });
      }, { threshold: 0.6 });
      counters.forEach(function (el) { co.observe(el); });
    }
  }

  /* ---- Active nav link ---- */
  var path = location.pathname.split("/").pop() || "";
  document.querySelectorAll("[data-nav]").forEach(function (a) {
    if (a.getAttribute("data-nav") === path) a.classList.add("active");
  });

  /* ---- Tabs (role=tablist) ---- */
  document.querySelectorAll("[data-tabs]").forEach(function (group) {
    var btns = group.querySelectorAll(".tab-btn");
    var panels = group.querySelectorAll(".tab-panel");
    btns.forEach(function (btn, i) {
      btn.addEventListener("click", function () {
        btns.forEach(function (b) { b.setAttribute("aria-selected", "false"); });
        panels.forEach(function (p) { p.classList.remove("active"); });
        btn.setAttribute("aria-selected", "true");
        if (panels[i]) panels[i].classList.add("active");
      });
    });
  });

  /* ---- Segmented control (data-seg) ---- */
  document.querySelectorAll("[data-seg]").forEach(function (seg) {
    var btns = seg.querySelectorAll("button");
    var note = document.getElementById(seg.getAttribute("data-seg"));
    btns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        btns.forEach(function (b) { b.setAttribute("aria-selected", "false"); });
        btn.setAttribute("aria-selected", "true");
        if (note) note.textContent = btn.getAttribute("data-note") || "";
      });
    });
  });

  /* ---- Lightbox (gallery + certificates) with prev/next ---- */
  var lb = document.querySelector(".lightbox");
  if (lb) {
    var lbImg = lb.querySelector("img");
    var lbCount = lb.querySelector(".lightbox-count");
    var lbPrev = lb.querySelector(".lightbox-nav.prev");
    var lbNext = lb.querySelector(".lightbox-nav.next");
    var zoomEls = [].slice.call(document.querySelectorAll("[data-zoom]"));
    var items = zoomEls.map(function (el) {
      var img = el.tagName === "IMG" ? el : el.querySelector("img");
      return img ? { src: img.getAttribute("data-full") || img.currentSrc || img.src, alt: img.alt || "" } : null;
    }).filter(Boolean);
    var idx = 0;
    var multi = items.length > 1;

    function show(i) {
      idx = (i + items.length) % items.length;
      lbImg.src = items[idx].src; lbImg.alt = items[idx].alt;
      if (lbCount) lbCount.textContent = multi ? (idx + 1) + " / " + items.length : "";
    }
    function openLb(i) { show(i); lb.classList.add("open"); document.body.style.overflow = "hidden"; }
    function closeLb() { lb.classList.remove("open"); document.body.style.overflow = ""; lbImg.src = ""; }

    if (lbPrev) lbPrev.hidden = !multi;
    if (lbNext) lbNext.hidden = !multi;

    zoomEls.forEach(function (el, i) { el.addEventListener("click", function () { openLb(i); }); });
    if (lbPrev) lbPrev.addEventListener("click", function (e) { e.stopPropagation(); show(idx - 1); });
    if (lbNext) lbNext.addEventListener("click", function (e) { e.stopPropagation(); show(idx + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb || e.target.closest(".lightbox-close")) closeLb(); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") closeLb();
      else if (multi && e.key === "ArrowLeft") show(idx - 1);
      else if (multi && e.key === "ArrowRight") show(idx + 1);
    });
  }

  /* ---- Telefon: povolit jen číslice, mezeru a "+" ---- */
  document.querySelectorAll('input[type="tel"]').forEach(function (input) {
    input.addEventListener("input", function () {
      var cleaned = input.value.replace(/[^0-9+ ]/g, "");
      if (cleaned !== input.value) input.value = cleaned;
    });
  });

  /* ---- Forms → Make webhooks (Sheets + e-mail), then thank-you page ---- */
  var WEBHOOKS = [
    "https://hook.eu1.make.com/e9pudvqzs61cgefqiob8kwjditwnd15z", // zápis do Google Sheets
    "https://hook.eu1.make.com/ti79ao0bu97x7tu8tosscd1xh6oqdm3s"  // potvrzení + notifikace
  ];
  document.querySelectorAll("form[data-thanks]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var get = function (n) { var f = form.elements[n]; return f ? f.value.trim() : ""; };
      // honeypot – pokud je vyplněný, je to bot: tváříme se OK, nic neposíláme
      if (get("website")) { window.location.href = form.getAttribute("data-thanks"); return; }
      if (!form.checkValidity()) { form.reportValidity(); return; }

      var data = new URLSearchParams();
      data.append("jmeno", get("jmeno"));
      data.append("email", get("email"));
      data.append("telefon", get("tel"));
      data.append("predmet", get("predmet"));
      data.append("zprava", get("zprava"));
      data.append("typ", form.getAttribute("data-typ") || "kontakt");
      data.append("stranka", location.href);
      var now = new Date();
      var pad2 = function (n) { return String(n).padStart(2, "0"); };
      var datum = pad2(now.getDate()) + "." + pad2(now.getMonth() + 1) + "." + String(now.getFullYear()).slice(-2)
        + " " + pad2(now.getHours()) + ":" + pad2(now.getMinutes());
      data.append("datum", datum);

      var btn = form.querySelector("button[type=submit]");
      if (btn) { btn.disabled = true; btn.textContent = "Odesílám…"; }

      var thanks = form.getAttribute("data-thanks") || "dekujeme";
      var posts = WEBHOOKS.map(function (url) {
        return fetch(url, { method: "POST", mode: "no-cors", body: data });
      });
      Promise.allSettled(posts).then(function () { window.location.href = thanks; });
    });
  });

  /* ---- Footer year ---- */
  var y = document.querySelector("[data-year]"); if (y) y.textContent = new Date().getFullYear();
})();
