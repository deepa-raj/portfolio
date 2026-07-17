
// Butterfly cursor
(function () {
  function initButterflyCursor() {
    var bfc = document.getElementById('bfc');
    if (!bfc || !window.matchMedia('(pointer: fine)').matches) return;

    var targetX = window.innerWidth / 2;
    var targetY = window.innerHeight / 2;
    var x = targetX, y = targetY;
    var mouseTilt = 0;
    var scrollTilt = 0, scrollTarget = 0;
    var lastScrollY = window.scrollY;
    var scrollResetTimer = null;
    var lastSpawnX = x, lastSpawnY = y;
    var interacting = false;

    window.addEventListener('mousemove', function (e) {
      targetX = e.clientX;
      targetY = e.clientY;
      bfc.style.opacity = '1';
    });
    document.addEventListener('mouseleave', function () { bfc.style.opacity = '0'; });

    document.addEventListener('mouseover', function (e) {
      if (e.target.closest && e.target.closest('a, button')) interacting = true;
    });
    document.addEventListener('mouseout', function (e) {
      if (e.target.closest && e.target.closest('a, button')) interacting = false;
    });

    window.addEventListener('scroll', function () {
      var currentScrollY = window.scrollY;
      scrollTarget = currentScrollY > lastScrollY ? 5 : -5;
      lastScrollY = currentScrollY;
      clearTimeout(scrollResetTimer);
      scrollResetTimer = setTimeout(function () { scrollTarget = 0; }, 150);
    }, { passive: true });

    function spawnBeam(px, py, boosted) {
      var count = boosted ? 10 + Math.floor(Math.random() * 10) : 6 + Math.floor(Math.random() * 20);
      var spread = boosted ? 100 : 100;
      for (var i = 0; i < count; i++) {
        var angle = Math.random() * Math.PI * 2;
        var radius = Math.random() * spread;
        createParticle(px + Math.cos(angle) * radius, py + Math.sin(angle) * radius, boosted);
      }
    }

    function createParticle(px, py, boosted) {
      var el = document.createElement('span');
      el.className = 'bfl';
      var gold = Math.random() < .5;
      var size = boosted ? 2 + Math.random() * 2 : 3 + Math.random() * 2;
      var bg = gold
        ? 'radial-gradient(circle, #F5DFA3 0%, #fcfa98 70%, rgba(255, 205, 67, 0) 100%)'
        : 'radial-gradient(circle, #6fcbf0 0%, #76efff 60%, rgba(204, 252, 255, 0) 60%)';
      el.style.left = px + 'px';
      el.style.top = py + 'px';
      el.style.width = size + 'px';
      el.style.height = size + 'px';
      el.style.margin = (-size / 2) + 'px 0 0 ' + (-size / 2) + 'px';
      el.style.background = bg;
      el.style.opacity = boosted ? '0.8' : '0.9';
      el.style.transform = 'scale(1)';
      el.style.transition = 'opacity 1.1s ease-out, transform 1.1s ease-out';
      document.body.appendChild(el);
      requestAnimationFrame(function () {
        el.style.opacity = '0';
        el.style.transform = 'scale(0.2) translateY(-6px)';
      });
      setTimeout(function () { el.remove(); }, 1150);
    }

    function tick() {
      var dx = targetX - x;
      var dy = targetY - y;
      x += dx * 0.18;
      y += dy * 0.18;

      var lean = Math.max(-20, Math.min(20, dx * 0.6));
      mouseTilt += (lean - mouseTilt) * 0.15;
      scrollTilt += (scrollTarget - scrollTilt) * 0.12;

      var rotation = mouseTilt + scrollTilt;
      bfc.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0) rotate(' + rotation.toFixed(1) + 'deg)';

      var dist = Math.hypot(x - lastSpawnX, y - lastSpawnY);
      var threshold = interacting ? 3 : 7;
      if (dist > threshold) {
        spawnBeam(x, y, interacting);
        lastSpawnX = x;
        lastSpawnY = y;
      }

      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initButterflyCursor);
  } else {
    initButterflyCursor();
  }
})();




// NAV
(function () {
  const nav = document.getElementById("sitenav");
  if (!nav) return;

  // ---------- Entrance: nav starts hidden above the viewport (see the
  // nav-hidden class already on the element in HTML) and slides down
  // into view once, right after the first paint ----------
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      nav.classList.remove("nav-hidden");
    });
  });

  let lastScrollY = window.scrollY;
  let ticking = false;

  const HIDE_THRESHOLD = 8;   // ignore tiny jitters (trackpad, mobile bounce)
  const TOP_REVEAL_ZONE = 80; // always show near the very top of the page

  function onScroll() {
    const currentScrollY = window.scrollY;
    const diff = currentScrollY - lastScrollY;
    const menuOpen = document.querySelector(".nlinks.open");

    if (Math.abs(diff) < HIDE_THRESHOLD) {
      ticking = false;
      return;
    }

    if (currentScrollY <= TOP_REVEAL_ZONE || menuOpen) {
      nav.classList.remove("nav-hidden");   // always visible at the top / while menu is open
    } else if (diff > 0) {
      nav.classList.add("nav-hidden");      // scrolling down -> hide
    } else {
      nav.classList.remove("nav-hidden");   // scrolling up -> reveal
    }

    lastScrollY = currentScrollY;
    ticking = false;
  }

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        window.requestAnimationFrame(onScroll);
        ticking = true;
      }
    },
    { passive: true }
  );
})();



// ---------- Mobile nav toggle ----------
(function () {
  const toggle = document.getElementById("navToggle");
  const links = document.querySelector(".nlinks");
  if (!toggle || !links) return;

  function closeMenu() {
    links.classList.remove("open");
    toggle.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  }

  toggle.addEventListener("click", () => {
    const isOpen = links.classList.toggle("open");
    toggle.classList.toggle("open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  // tapping a link closes the menu instead of leaving it open over the
  // section you just navigated to
  links.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMenu));

  // close on resize back up to desktop, so it can't get stuck open
  window.addEventListener("resize", () => {
    if (window.innerWidth > 860) closeMenu();
  });
})();




// NEW GUITAR WITH TEXT
(function () {
  const svg = document.getElementById("guitarSvg");
  const hitPaths = Array.from(svg.querySelectorAll(".string-hit"));
  const visibleById = {};
  svg
    .querySelectorAll(".string-visible")
    .forEach((el) => (visibleById[el.id] = el));

  // ---------- Audio: real recorded guitar-string samples ----------
  // Same 6 samples used at github.com/iam-sarthak/guitar (sound/E, A, D, G, B, E2).
  // Preload one Audio object per string, keyed by the data-sound path set on each string.
  const audioBySound = {};
  svg.querySelectorAll(".string-visible").forEach((el) => {
    const src = el.dataset.sound;
    const audio = new Audio(src);
    audio.preload = "auto";
    audioBySound[src] = audio;
  });

  function pluckAudio(src) {
    const audio = audioBySound[src];
    if (!audio) return;
    audio.currentTime = 2; // each sample has ~2s of lead-in silence before the pluck
    audio.play().catch(() => {});
  }

  // ---------- Visual: bend the string into a curve that oscillates and decays ----------
  const animState = {}; // id -> { raf, start }

  function animateString(el, pluckX) {
    const x1 = parseFloat(el.dataset.x1);
    const x2 = parseFloat(el.dataset.x2);
    const y = parseFloat(el.dataset.y);
    const cx = Math.min(Math.max(pluckX, x1 + 60), x2 - 60);

    const amplitude0 = 26; // how far the string bows on pluck
    const visualFreq = 16; // visible oscillations per second (not the audio pitch)
    const durationMs = 900;

    if (animState[el.id]) cancelAnimationFrame(animState[el.id].raf);
    const startTime = performance.now();

    function frame(now) {
      const t = (now - startTime) / 1000;
      const decay = Math.exp(-t * 4.5);
      const offset =
        amplitude0 * decay * Math.cos(2 * Math.PI * visualFreq * t);

      if (t * 1000 < durationMs && Math.abs(offset) > 0.15) {
        el.setAttribute("d", `M${x1} ${y} Q${cx} ${y + offset} ${x2} ${y}`);
        animState[el.id].raf = requestAnimationFrame(frame);
      } else {
        el.setAttribute("d", `M${x1} ${y} L${x2} ${y}`);
        delete animState[el.id];
      }
    }
    animState[el.id] = { raf: requestAnimationFrame(frame) };
  }

  function pluck(hitEl, clientX) {
    const targetId = hitEl.dataset.target;
    const visibleEl = visibleById[targetId];

    const rect = svg.getBoundingClientRect();
    const scale = 1355 / rect.width;
    const svgX = (clientX - rect.left) * scale;

    pluckAudio(visibleEl.dataset.sound);
    animateString(visibleEl, svgX);
  }

  // ---------- Scroll reveal: letters fade/slide in once the guitar comes into view ----------
  const guitarWrap = document.querySelector(".guitar-wrap");
  const letters = Array.from(document.querySelectorAll(".letter"));

  const STAGGER_MS = 70; // gap between each letter's start — matches your original stagger
  // Stagger now runs from JS, so zero out the baked-in inline delays to avoid stacking on top of it
letters.forEach((letter) => {
  letter.style.transitionDelay = "0ms";
});

let pendingTimers = [];
function clearPendingTimers() {
  pendingTimers.forEach((id) => clearTimeout(id));
  pendingTimers = [];
}

let revealState = "hidden"; // "hidden" | "revealed"
let lastScrollY = window.scrollY;

function revealForward() {
  if (revealState === "revealed") return; // already showing — don't replay
  revealState = "revealed";
  clearPendingTimers();
  letters.forEach((letter, i) => {
    const id = setTimeout(() => letter.classList.add("revealed"), i * STAGGER_MS);
    pendingTimers.push(id);
  });
}

function revealBackward() {
  if (revealState === "hidden") return; // already hidden — don't replay
  revealState = "hidden";
  clearPendingTimers();
  const last = letters.length - 1;
  letters.forEach((letter, i) => {
    const order = last - i; // last letter goes first
    const id = setTimeout(() => letter.classList.remove("revealed"), order * STAGGER_MS);
    pendingTimers.push(id);
  });
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      const scrollingUp = window.scrollY < lastScrollY;
      lastScrollY = window.scrollY;

      if (entry.isIntersecting) {
        revealForward();
      } else if (scrollingUp) {
        revealBackward(); // only reverse when actually retreating to the previous section
      }
      // leaving by scrolling further down is intentionally ignored — text stays as-is
    });
  },
  {
    threshold: 0.25,
    // rootMargin: "0px 0px 250px 0px", // extends the trigger zone 250px below the real viewport, so it fires while the section is still approaching from below
  },
);

revealObserver.observe(guitarWrap);


  // ---------- Silently unlock audio on the page's first interaction ----------
  // Browsers refuse to play any audio (even <audio> elements) until the page
  // has seen one real click/tap/keypress — there's no way around that rule,
  // it's a browser-level anti-autoplay-noise policy, not something this code
  // controls. Instead of a visible prompt, we just listen for that first
  // interaction anywhere on the page (a nav click, a keypress, a tap) and
  // prime all six samples right then, invisibly. From that point on, hovering
  // the strings plays sound with no prompt at all.
  let soundReady = false;

  function primeAudio() {
    if (soundReady) return;
    soundReady = true;
    Object.values(audioBySound).forEach((audio) => {
      audio
        .play()
        .then(() => {
          audio.pause();
          audio.currentTime = 0;
        })
        .catch(() => {});
    });
  }
  document.addEventListener("pointerdown", primeAudio, {
    once: true,
    capture: true,
  });
  document.addEventListener("keydown", primeAudio, {
    once: true,
    capture: true,
  });

  // ---------- Interaction: hovering a string plucks it; gliding across strings strums ----------
  const lastPluckAt = {}; // per-string cooldown so jitter doesn't double-trigger

  hitPaths.forEach((hitEl) => {
    hitEl.addEventListener("pointerenter", (e) => {
      if (!soundReady) return; // wait for the one-time unlock tap
      const id = hitEl.dataset.target;
      const now = performance.now();
      if (lastPluckAt[id] && now - lastPluckAt[id] < 120) return;
      lastPluckAt[id] = now;
      pluck(hitEl, e.clientX);
    });
  });
})();




// WORK
// ============================================================
// PROJECT DATA — one object per project. Add/remove/edit projects here;
// no HTML editing needed.
//
//   cat   — 'fs' | 'ux' | 'brand' | 'data'
//   image — null for now (icon tile shows instead) until real
//           screenshots are uploaded — swap in a path later, e.g.
//           "images/medishare.png"
// ============================================================
const PROJECTS = [
  // ---------------- FULL STACK ----------------
  {
    cat: "fs",
    badge: "Full Stack",
    title: "MediShare",
    desc: "A platform that connects unused, unexpired medicine with the NGOs and clinics that can put it to use — before it's too late.",
    tags: ["React", "Node JS", "Tailwind CSS", "Express", "Docker"],
    links: [{ label: "GitHub", url: "https://github.com/deepa-raj/MediShare" }],
    image: "./images/medishare.png",
  },
  {
    cat: "fs",
    badge: "Full Stack",
    title: "Cleoni",
    desc: "A full-stack e-commerce app with product browsing and filtering, guest + authenticated cart, a complete checkout-to-order pipeline, Cloudinary image uploads, and a full admin panel — deployed live on Vercel.",
    tags: ["React", "Node.js", "Express", "MongoDB", "Cloudinary", "Vercel"],
    links: [{ label: "GitHub", url: "https://github.com/deepa-raj/Cleoni" }],
    image: "./images/cleoni.png",
  },
  {
    cat: "fs",
    badge: "Full Stack · AI",
    title: "Spark GPT",
    desc: "A full-stack AI chat app where users hold text conversations powered by Google Gemini and generate images via ImageKit AI — gated behind a credit-based system with real Stripe payments. Deployed on Vercel.",
    tags: ["React", "Node.js", "MongoDB", "Gemini API"],
    links: [{ label: "GitHub", url: "https://github.com/deepa-raj/SparkGPT" }],
    image: "./images/sparkgpt.png",
  },
  {
    cat: "fs",
    badge: "Backend · Flask",
    title: "Flasker",
    desc: "A full-stack blog/CMS built with Python Flask — user authentication, rich-text post management, profile customization, and content search, deployed with Gunicorn.",
    tags: ["Python", "Flask", "SQLAlchemy", "Flask-Login", "MySQL"],
    links: [{ label: "GitHub", url: "https://github.com/deepa-raj/Flasker" }],
    image: null,
  },

  // ---------------- UI / UX ----------------
  {
    cat: "ux",
    badge: "UI/UX",
    title: "Orbitorx",
    desc: "A freelance studio portfolio designed and developed from scratch — identity, design system, and a custom-built Framer site.",
    tags: ["Figma", "Framer", "Wireframing", "Prototyping"],
    links: [{ label: "Live Site", url: "https://itsorbitorx.framer.website/" }],
    image: "./images/orbitorx.png",
  },
  {
    cat: "ux",
    badge: "UI/UX",
    title: "Bibiq",
    desc: "A restaurant food delivery app — ordering flow, menu browsing, and cart-to-checkout designed for speed and clarity.",
    tags: ["Figma", "Illustration", "Wireframing", "Prototyping"],
    links: [
      {
        label: "Behance",
        url: "https://www.behance.net/gallery/177861333/BiBiQ-Restaurant-food-delivery-app-UIUX",
      },
    ],
    image: "./images/bibiq.png",
  },
  {
    cat: "ux",
    badge: "UI/UX",
    title: "Glinnk",
    desc: "A meditation app designed around calm, unhurried flows — from onboarding through daily session tracking.",
    tags: ["Figma", "Adobe XD", "Illustrator", "Wireframing"],
    links: [
      {
        label: "Behance",
        url: "https://www.behance.net/gallery/155619375/Glinnk-Meditation-app",
      },
    ],
    image: "./images/glinnk.png",
  },
  {
    cat: "ux",
    badge: "UI/UX",
    title: "Nexurs",
    desc: "A cryptocurrency platform that makes trading and learning about crypto feel effortless and enjoyable, not intimidating.",
    tags: ["Figma", "Adobe XD", "Wireframing", "Prototyping"],
    links: [
      {
        label: "Behance",
        url: "https://www.behance.net/gallery/160245425/NEXURS-A-Crypto-trading-app",
      },
    ],
    image: "./images/nexurs.png",
  },
  {
    cat: "ux",
    badge: "UI · Mobile",
    title: "NFT App",
    desc: "A conceptual NFT app exploring browsing, minting, and trading flows for digital collectors.",
    tags: ["Figma", "Adobe XD", "Wireframing", "Prototyping"],
    links: [
      {
        label: "Behance",
        url: "https://www.behance.net/gallery/156069551/NFT-App-design",
      },
    ],
    image: "./images/nft.png",
  },
  {
    cat: "ux",
    badge: "Web Design",
    title: "NEW-MEN",
    desc: "A website designed for NEW-MEN, a dance studio — bold, high-energy visuals matching the brand's movement-first identity.",
    tags: ["Figma", "Photoshop", "Wireframing", "Prototyping"],
    links: [
      {
        label: "Behance",
        url: "https://www.behance.net/gallery/174334897/NEW-MEN-Website-design",
      },
    ],
    image: "./images/new-men.png",
  },
  {
    cat: "ux",
    badge: "UI/UX · Web",
    title: "Handpick",
    desc: "A website for Handpick, an interior design studio in Milan offering interior design, architecture, and project management services.",
    tags: ["Figma"],
    links: [
      {
        label: "Behance",
        url: "https://www.behance.net/gallery/167927741/HANDPICK-Interior-studio",
      },
    ],
    image: "./images/handpick.png",
  },
  {
    cat: "ux",
    badge: "UI/UX · Framer",
    title: "Parallel",
    desc: "A creative studio website designed in Figma and built out in Framer.",
    tags: ["Figma", "Framer", "Wireframing", "Prototyping"],
    links: [
      { label: "Live Site", url: "https://parallel-agency.framer.website/" },
    ],
    image: "./images/parallel.png",
  },
  {
    cat: "ux",
    badge: "UI/UX · Framer",
    title: "Adriana Quill",
    desc: "A personal portfolio built for a creative artist, designed in Figma and shipped on Framer.",
    tags: ["Figma", "Framer", "Wireframing", "Prototyping"],
    links: [
      { label: "Live Site", url: "https://adrianaquill.framer.website/" },
    ],
    image: "./images/adriana.png",
  },

  // ---------------- BRAND IDENTITY ----------------
  {
    cat: "brand",
    badge: "UI/UX · Brand",
    title: "Claire Rayonner",
    desc: "Brand identity and website for Claire Rayonner, a French fashion label selling trendy clothing made with unique style and attention to detail.",
    tags: ["Brand Identity", "Logos", "Packaging", "Figma", "Photoshop"],
    links: [
      {
        label: "Behance",
        url: "https://www.behance.net/gallery/163147287/CLAIRE-RAYONNER-Brand-Identity-and-Website-Design",
      },
    ],
    image: "./images/claireRayonner.png",
  },
  {
    cat: "brand",
    badge: "Brand Identity",
    title: "Eyto",
    desc: "Brand identity and packaging design for Eyto Cosmetics.",
    tags: ["Brand Identity", "Packaging", "Illustration", "Photoshop"],
    links: [
      {
        label: "Behance",
        url: "https://www.behance.net/gallery/168438129/Eyto-Brand-identity-packaging-design",
      },
    ],
    image: "./images/eyto.png",
  },
  {
    cat: "brand",
    badge: "Brand Identity",
    title: "One & One Candles",
    desc: "Brand identity and packaging design for One & One Candles.",
    tags: ["Brand Identity", "Packaging", "Illustration", "Photoshop"],
    links: [
      {
        label: "Behance",
        url: "https://www.behance.net/gallery/170951601/One-One-Candles-Brand-Identity-Packaging",
      },
    ],
    image: "./images/one-one.png",
  },

  // ---------------- DATA & ML ----------------
  {
    cat: "data",
    badge: "ML · Python",
    title: "Customer Churn Prediction",
    desc: "End-to-end churn-prediction pipeline on the Telco customer dataset — EDA and model-building notebooks feeding a saved classifier, served through a lightweight Flask app for live predictions.",
    tags: ["Python", "Scikit-learn", "Pandas", "Flask", "Jupyter"],
    links: [
      {
        label: "GitHub",
        url: "https://github.com/deepa-raj/Customer-Churn-Prediction-ML",
      },
    ],
    image: null,
  },
  {
    cat: "data",
    badge: "ML · Regression",
    title: "House Price Prediction",
    desc: "A multivariable regression valuation model estimating property prices from features like room count and distance to employment centers, with residual analysis to check the fit.",
    tags: ["Python", "Scikit-learn", "NumPy", "Pandas", "Matplotlib"],
    links: [
      {
        label: "GitHub",
        url: "https://github.com/deepa-raj/House-Price-Prediction-using-Multivariable-Regression",
      },
    ],
    image: null,
  },
  {
    cat: "data",
    badge: "Data Analysis",
    title: "App Success Factors — Google Play",
    desc: "Exploratory analysis of the Google Play Store dataset looking at which factors — category, pricing, size, ratings — correlate most with an app's installs and reception.",
    tags: ["Python", "Pandas", "Seaborn", "Matplotlib"],
    links: [
      {
        label: "GitHub",
        url: "https://github.com/deepa-raj/Analyzing-App-Success-Factors-on-Google-Play-Store",
      },
    ],
    image: null,
  },
  {
    cat: "data",
    badge: "SQL · Power BI",
    title: "Customer Behavior & Revenue Insights",
    desc: "SQL queries against restaurant sales data — revenue trends, best- and worst-selling items, order patterns — visualized in an interactive Power BI dashboard.",
    tags: ["SQL", "Power BI"],
    links: [
      {
        label: "GitHub",
        url: "https://github.com/deepa-raj/Customer-Behavior-Analysis-Revenue-Insights-SQL-PowerBI",
      },
    ],
    image: null,
  },
];

// Fallback icon tiles shown when a project has no image yet.
const CATEGORY_ICONS = {
  fs: `<svg viewBox="0 0 100 100" fill="none"><path d="M35 30 L15 50 L35 70" stroke="#000" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M65 30 L85 50 L65 70" stroke="#000" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M58 22 L42 78" stroke="#000" stroke-width="7" stroke-linecap="round"/></svg>`,
  ux: `<svg viewBox="0 0 100 100" fill="none"><path d="M25 20 L25 78 L40 64 L50 82 L58 78 L48 60 L68 60Z" fill="#000" stroke="#000" stroke-width="2" stroke-linejoin="round"/></svg>`,
  brand: `<svg viewBox="0 0 100 100" fill="none"><path d="M20 20 H55 L82 47 L52 77 L20 45 Z" stroke="#000" stroke-width="7" stroke-linejoin="round" fill="none"/><circle cx="38" cy="38" r="6" fill="#000"/></svg>`,
  data: `<svg viewBox="0 0 100 100" fill="none"><rect x="16" y="55" width="16" height="30" rx="3" fill="#000"/><rect x="42" y="35" width="16" height="50" rx="3" fill="#000"/><rect x="68" y="18" width="16" height="67" rx="3" fill="#000"/></svg>`,
  default: `<svg viewBox="0 0 100 100" fill="none"><circle cx="50" cy="50" r="30" fill="#000"/></svg>`,
};

// Human-readable label for each category — shown as the big heading
// inside the card.
const CAT_LABELS = {
  fs: "Full Stack",
  ux: "UI/UX",
  brand: "Brand Identity",
  data: "Data Analysis",
};

// ============================================================
// CAROUSEL — one project visible at a time, filtered by the active
// category tab. Prev/next arrows step through the filtered list.
// ============================================================
let currentCat = "all";
let filtered = PROJECTS.slice();
let current = 0;
let animating = false;

const wcCard = document.getElementById("wcCard");
const wcCat = document.getElementById("wcCat");
const wcCount = document.getElementById("wcCount");
const wcTitle = document.getElementById("wcTitle");
const wcDesc = document.getElementById("wcDesc");
const wcTags = document.getElementById("wcTags");
const wcLink = document.getElementById("wcLink");
const wcThumb = document.getElementById("wcThumb");

function getFiltered(cat) {
  return cat === "all" ? PROJECTS.slice() : PROJECTS.filter((p) => p.cat === cat);
}

function fillCard(p, idx) {
  wcCat.textContent = CAT_LABELS[p.cat] || p.badge;
  wcCount.textContent = `${String(idx + 1).padStart(2, "0")} / ${String(
    filtered.length,
  ).padStart(2, "0")}`;
  wcTitle.textContent = p.title;
  wcDesc.textContent = p.desc;

  // Ruler-style tags: a tick (triangle) sitting on the shared line,
  // with the label underneath — not a bullet between two words.
  wcTags.innerHTML = p.tags
    .map(
      (t) =>
        `<div class="wc-tag-item"><span class="wc-tri"></span><span class="wc-tag-label">${t}</span></div>`,
    )
    .join("");

  const link = p.links && p.links[0];
  if (link) {
    wcLink.href = link.url;
    wcLink.style.visibility = "visible";
  } else {
    wcLink.style.visibility = "hidden";
  }

  wcThumb.innerHTML = p.image
    ? `<img src="${p.image}" alt="${p.title}" loading="lazy">`
    : CATEGORY_ICONS[p.cat] || CATEGORY_ICONS.default;
}

// Waits for a CSS transition on `el` (matching `prop`) to finish, then
// calls `cb` exactly once. Falls back to a timeout slightly longer than
// the transition in case the event never fires (e.g. tab backgrounded),
// so the carousel can never get stuck mid-animation.
function onTransitionEnd(el, prop, fallbackMs, cb) {
  let done = false;
  function finish() {
    if (done) return;
    done = true;
    el.removeEventListener("transitionend", handler);
    clearTimeout(timer);
    cb();
  }
  function handler(e) {
    if (e.target === el && e.propertyName === prop) finish();
  }
  el.addEventListener("transitionend", handler);
  const timer = setTimeout(finish, fallbackMs);
}

// Smooth crossfade + soft scale — content swaps while the card is fully
// faded out, so there's never a visible jump or slide to mistime.
function renderCard(animate) {
  const p = filtered[current];
  if (!p) return;

  if (!animate) {
    fillCard(p, current);
    return;
  }

  if (animating) return;
  animating = true;

  wcCard.classList.add("fading");
  onTransitionEnd(wcCard, "opacity", 450, () => {
    fillCard(p, current);
    requestAnimationFrame(() => {
      wcCard.classList.remove("fading");
      onTransitionEnd(wcCard, "opacity", 450, () => {
        animating = false;
      });
    });
  });
}

function goTo(step) {
  if (!filtered.length || animating) return;
  current = (current + step + filtered.length) % filtered.length;
  renderCard(true);
}

document.getElementById("workNext")?.addEventListener("click", () => goTo(1));
document.getElementById("workPrev")?.addEventListener("click", () => goTo(-1));

document.querySelectorAll(".wctab").forEach((btn) => {
  btn.addEventListener("click", () => {
    const cat = btn.dataset.cat;
    if (cat === currentCat || animating) return;
    document.querySelectorAll(".wctab").forEach((b) => b.classList.remove("on"));
    btn.classList.add("on");
    currentCat = cat;
    filtered = getFiltered(cat);
    current = 0;
    renderCard(true);
  });
});

// initial paint (no animation on first load)
renderCard(false);

// ---------- WORK heading: letters reveal one by one on scroll into view ----------
const workSection = document.querySelector(".work-sec");
const workLetters = Array.from(document.querySelectorAll(".work-letter"));
if (workSection && workLetters.length) {
  const workObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          workLetters.forEach((letter, i) => {
            setTimeout(() => letter.classList.add("revealed"), i * 90);
          });
          workObserver.disconnect();
        }
      });
    },
    { threshold: 0.3 },
  );
  workObserver.observe(workSection);
}


// Note: Prev/Next arrows (.work-arrow) used to be position:fixed with an
// IntersectionObserver toggling visibility on/off the viewport. They're now
// position:absolute within .work-sec, so they're naturally confined to that
// section already — no observer needed.




// SKILLS
(function(){

  const track = document.getElementById('skillsCards');
  if (!track) return;
  /* ------------------------------------------------------------
     1. DATA — pulled straight from your Figma export
     ------------------------------------------------------------ */
  const SKILLS = [
    { code:'LANG',   title:'Programming Languages', accent:'#F6DB44', surface:'#938586',
      from:'PRB', to:'CDE',
      tags:['Python','Java','JavaScript','DSA','OOPS','SQL'] },
    { code:'DEV',    title:'Frontend Development', accent:'#B2F644', surface:'#709081',
      from:'DES', to:'DEV',
      tags:['HTML/CSS/JS','React','Tailwind CSS','TypeScript','Front-end libraries','Git','Docker'] },
    { code:'BCK',    title:'Backend Development', accent:'#7F44F6', surface:'#5738DD',
      from:'SYS', to:'SER',
      tags:['Flask','Selenium','BeautifulSoup','REST APIs','Express','API','NodeJS'] },
    { code:'DESIGN', title:'UI/UX Design', accent:'#F64444', surface:'#923985',
      from:'WIR', to:'PRO',
      tags:['User Research','User Journey','Figma','Design Systems','Wireframes','Prototypes','Testing','Framer'] },
    { code:'BRD',    title:'Brand Design', accent:'#4497F6', surface:'#3962DC',
      from:'CPT', to:'ACT',
      tags:['Concept','Guidelines','Templates','Moodboards','Logos','Mockups','Design System','Assets'] },
    { code:'DATA',   title:'Data &\u00A0ML', accent:'#F644B2', surface:'#9335B3',
      from:'CLN', to:'MDL',
      tags:['Pandas','Numpy','Scikit-learn','PowerBI','Classification','Regression','Statistical Modelling','Predictive Modeling'] },
    { code:'CLOUD',  title:'Database &\u00A0Cloud', accent:'#44F676', surface:'#39929F',
      from:'DBS', to:'CLD',
      tags:['PostgreSQL','MySQL','MongoDB','SQLAlchemy','Docker','Git/GitHub','CI/CD','AWS'] },
  ];

  const ARROW_SVG = `<svg viewBox="0 0 40 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <line x1="2" y1="8" x2="29" y2="8" stroke="black" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M22 1 L30 8 L22 15" stroke="black" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;

  /* ------------------------------------------------------------
     2. BUILD CARDS
     ------------------------------------------------------------ */
  // const track = document.getElementById('skillsCards');

  track.innerHTML = '<div class="skills-wire"></div>' + SKILLS.map(s => `
    <article class="skill-card" style="--accent:${s.accent}; --surface:${s.surface}">
      <div class="skill-card__frame">
        <div class="skill-card__head">
          <div class="skill-card__icon"></div>
          <span class="skill-card__rivet"></span>
          <h3 class="skill-card__code">${s.code}</h3>
        </div>
        <div class="skill-card__body">
          <h4 class="skill-card__title">${s.title.split(' ').map(w => `<span>${w}</span>`).join('')}</h4>
          <div class="tag-row">
            ${s.tags.map((t,i)=>`<span class="tag ${i%2===0?'tag--below':'tag--above'}"><span class="tag__label">${t}</span></span>`).join('')}
          </div>
          <div class="skill-card__divider"></div>
          <div class="skill-card__footer">
            <span>${s.from}</span>${ARROW_SVG}<span>${s.to}</span>
          </div>
        </div>
      </div>
      <div class="skill-card__pipe"></div>
    </article>
  `).join('');

  /* ------------------------------------------------------------
     3. SPLIT "SKILLS" INTO LETTERS
     ------------------------------------------------------------ */
  // const lettersHost = document.querySelector('.skills-title .letters');
  // const word = 'SKILLS';
  // lettersHost.innerHTML = word.split('').map(ch =>
  //   `<span class="letter">${ch}</span>`
  // ).join('');


   /* ------------------------------------------------------------
     3. TITLE REVEAL — SKILLS is now a traced <svg> like WORK (see
     index.html), so this is just the reveal: the identical mechanism
     WORK uses — an IntersectionObserver adding a staggered .revealed
     class per letter, on top of the 120ms transition-delay already
     baked into each <path> in the HTML — not a GSAP tween, so SKILLS
     and WORK behave identically, including the same compounding
     double-stagger.
     ------------------------------------------------------------ */
  // const skillsSection = document.querySelector('.skills');
  const skillsTitleEl = document.querySelector('.skills-title');
  const skillsTitleLetters = Array.from(document.querySelectorAll('.skills-title .skills-letter'));
  // if (skillsSection && skillsTitleLetters.length) {
  if (skillsTitleEl && skillsTitleLetters.length) {
    const skillsTitleObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            skillsTitleLetters.forEach((letter, i) => {
              setTimeout(() => letter.classList.add("revealed"), i * 90);
            });
            skillsTitleObserver.disconnect();
          }
        });
      },
      { threshold: 0.3 },
    );
    skillsTitleObserver.observe(skillsTitleEl);
  }

/* ------------------------------------------------------------
     4. WIRE + CARD WAVE ANIMATION (GSAP/ScrollTrigger)
     ------------------------------------------------------------ */
  /* ------------------------------------------------------------
     4. WIRE + CARD WAVE ANIMATION (GSAP/ScrollTrigger)
     Same pinned horizontal scroll + wave animation at every screen
     size now — previously split via gsap.matchMedia() into a
     >=900px pin-jack version and a lighter <900px fade-in-place
     fallback. Removed that split; this now runs unconditionally.
     ------------------------------------------------------------ */
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (window.gsap && !prefersReduced) {
    gsap.registerPlugin(ScrollTrigger);

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => ScrollTrigger.refresh());
    }
    window.addEventListener('load', () => ScrollTrigger.refresh());

    gsap.set('.skills-wire', { scaleX: 0 });
    gsap.to('.skills-wire', {
      scaleX: 1,
      duration: 0.9,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.skills',
        start: 'top 75%',
        toggleActions: 'play none none none',
      },
    });

    const cards = gsap.utils.toArray('.skill-card');
    const frames = cards.map(c => c.querySelector('.skill-card__frame'));

    gsap.set(cards, { transformOrigin: 'top center' });

    const rotators = cards.map((c, i) =>
      gsap.quickTo(c, 'rotate', { duration: 0.45 + i * 0.055, ease: 'elastic.out(1, 0.32)' })
    );
    let idleTimer;

    const scrollTween = gsap.to(track, {
      x: () => -(track.scrollWidth - document.documentElement.clientWidth + 40),
      ease: 'none',
      scrollTrigger: {
        trigger: '.skills-inner',
        start: 'top top',
        end: () => '+=' + (track.scrollWidth - document.documentElement.clientWidth + 40),
        pin: true,
        // pinType: 'transform',
        // anticipatePin: 1,
        scrub: 1,
        invalidateOnRefresh: true,
        onUpdate(self) {
          const v = gsap.utils.clamp(-16, 16, self.getVelocity() / 180);
          rotators.forEach((set, i) => set(v * (1 - i * 0.06)));
          clearTimeout(idleTimer);
          idleTimer = setTimeout(() => rotators.forEach((set) => set(0)), 140);
        },
      },
    });

    cards.forEach((card, i) => {
      gsap.fromTo(frames[i],
        { autoAlpha: 0, y: -90, rotate: i % 2 === 0 ? -20 : 20 },
        {
          autoAlpha: 1, y: 0, rotate: 0,
          duration: 1.4,
          ease: 'elastic.out(1, 0.45)',
          scrollTrigger: {
            trigger: card,
            containerAnimation: scrollTween,
            start: 'left 88%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    });
  }

    // const mm = gsap.matchMedia();

    // mm.add('(min-width: 900px)', () => {
    //   const cards = gsap.utils.toArray('.skill-card');
    //   const frames = cards.map(c => c.querySelector('.skill-card__frame'));

    //   gsap.set(cards, { transformOrigin: 'top center' });

    //   // A quickTo rotator per card, applied to the SHELL (.skill-card),
    //   // never to the frame — the frame is entrance-animation territory.
    //   // Keeping them on separate elements means a fast scroll into a
    //   // card that's mid-entrance can't cause the two tweens to overwrite
    //   // each other on the same `rotate` property.
    //   // Duration (and therefore how long the elastic ease keeps
    //   // oscillating) increases with index, so the same nudge reaches
    //   // later cards a beat later and keeps swinging longer — that lag
    //   // is what reads as a wave rippling down the row.
    //   const rotators = cards.map((c, i) =>
    //     gsap.quickTo(c, 'rotate', { duration: 0.45 + i * 0.055, ease: 'elastic.out(1, 0.32)' })
    //   );
    //   let idleTimer;

    //   // Pin the section and translate the card row horizontally as
    //   // the user scrolls down — same mechanic Dave Holloway's site uses.
    //   const scrollTween = gsap.to(track, {
    //     x: () => -(track.scrollWidth - document.documentElement.clientWidth + 40),
    //     ease: 'none',
    //     scrollTrigger: {
    //       trigger: '.skills-inner',
    //       start: 'top top',
    //       end: () => '+=' + (track.scrollWidth - document.documentElement.clientWidth + 40),
    //       pin: true,
    //       // pinType: 'transform',
    //       // anticipatePin: 1,
    //       scrub: 1,
    //       invalidateOnRefresh: true,
    //       onUpdate(self) {
    //         // Turn scroll speed into a rotation impulse, like flicking
    //         // a row of hanging cards — faster scroll = wider swing, and
    //         // the elastic ease on each rotator overshoots/corrects on
    //         // its own delayed schedule, which is what produces the
    //         // alternating tilt-left/tilt-right wave along the row.
    //         const v = gsap.utils.clamp(-16, 16, self.getVelocity() / 180);
    //         rotators.forEach((set, i) => set(v * (1 - i * 0.06)));
    //         clearTimeout(idleTimer);
    //         idleTimer = setTimeout(() => rotators.forEach((set) => set(0)), 140);
    //       },
    //     },
    //   });

    //   // Each card's frame swings onto the wire like a pendulum let go
    //   // from an angle — elastic.out overshoots past 0 and rocks back
    //   // a couple of times before settling, rather than just easing
    //   // down once — as it first enters the pinned viewport, using the
    //   // horizontal scroll itself as the trigger's container animation.
    //   cards.forEach((card, i) => {
    //     gsap.fromTo(frames[i],
    //       { autoAlpha: 0, y: -90, rotate: i % 2 === 0 ? -20 : 20 },
    //       {
    //         autoAlpha: 1, y: 0, rotate: 0,
    //         duration: 1.4,
    //         ease: 'elastic.out(1, 0.45)',
    //         scrollTrigger: {
    //           trigger: card,
    //           containerAnimation: scrollTween,
    //           start: 'left 88%',
    //           toggleActions: 'play none none reverse',
    //         },
    //       }
    //     );
    //   });

    //   return () => { /* gsap.matchMedia auto-reverts on cleanup */ };
    // });

    // mm.add('(max-width: 899px)', () => {
    //   // No scroll-jacking on small/touch screens — cards fade/slide
    //   // up in place as they're scrolled to naturally, with a lighter
    //   // version of the same swing (shorter throw, since there's no
    //   // horizontal scroll wave to play off of here).
    //   gsap.utils.toArray('.skill-card').forEach((card, i) => {
    //     const frame = card.querySelector('.skill-card__frame');
    //     gsap.fromTo(frame,
    //       { autoAlpha: 0, y: 40, rotate: i % 2 === 0 ? -10 : 10 },
    //       {
    //         autoAlpha: 1, y: 0, rotate: 0, duration: 1,
    //         ease: 'elastic.out(1, 0.5)',
    //         scrollTrigger: { trigger: card, start: 'top 90%' },
    //       }
    //     );
    //   });
    //   return () => {};
    // });
  // }
}
)();



// ---------- ABOUT heading: same letter-by-letter reveal as WORK ----------
const aboutSection = document.querySelector(".about-sec");
const aboutLetters = Array.from(document.querySelectorAll(".about-letter"));
if (aboutSection && aboutLetters.length) {
  const aboutObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          aboutLetters.forEach((letter, i) => {
            setTimeout(() => letter.classList.add("revealed"), i * 90);
          });
          aboutObserver.disconnect();
        }
      });
    },
    { threshold: 0.3 },
  );
  aboutObserver.observe(aboutSection);
}
