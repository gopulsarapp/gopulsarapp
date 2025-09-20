(function () {
  "use strict";

  // ======= Sticky
  window.onscroll = function () {
    const ud_header = document.querySelector(".ud-header");
    const sticky = ud_header.offsetTop;
    const logo = document.querySelectorAll(".header-logo");

    if (window.pageYOffset > sticky) {
      ud_header.classList.add("sticky");
    } else {
      ud_header.classList.remove("sticky");
    }

    if(logo.length) {
      // === logo change
      if (ud_header.classList.contains("sticky")) {
        document.querySelector(".header-logo").src =
          "assets/images/logo/logo.svg"
      } else {
        document.querySelector(".header-logo").src =
          "assets/images/logo/logo-white.svg"
      }
    }

    if (document.documentElement.classList.contains("dark")) {
      if(logo.length) {
        // === logo change
        if (ud_header.classList.contains("sticky")) {
          document.querySelector(".header-logo").src =
            "assets/images/logo/logo-white.svg"
        } 
      }
    }

    // show or hide the back-top-top button
    const backToTop = document.querySelector(".back-to-top");
    if (
      document.body.scrollTop > 50 ||
      document.documentElement.scrollTop > 50
    ) {
      backToTop.style.display = "flex";
    } else {
      backToTop.style.display = "none";
    }
  };

  // ===== responsive navbar
  let navbarToggler = document.querySelector("#navbarToggler");
  const navbarCollapse = document.querySelector("#navbarCollapse");

  navbarToggler.addEventListener("click", () => {
    navbarToggler.classList.toggle("navbarTogglerActive");
    navbarCollapse.classList.toggle("hidden");
  });

  //===== close navbar-collapse when a  clicked
  document
    .querySelectorAll("#navbarCollapse ul li:not(.submenu-item) a")
    .forEach((e) =>
      e.addEventListener("click", () => {
        navbarToggler.classList.remove("navbarTogglerActive");
        navbarCollapse.classList.add("hidden");
      })
    );

  // ===== Sub-menu
  const submenuItems = document.querySelectorAll(".submenu-item");
  submenuItems.forEach((el) => {
    el.querySelector("a").addEventListener("click", () => {
      el.querySelector(".submenu").classList.toggle("hidden");
    });
  });

  // ===== Faq accordion
  const faqs = document.querySelectorAll(".single-faq");
  faqs.forEach((el) => {
    el.querySelector(".faq-btn").addEventListener("click", () => {
      el.querySelector(".icon").classList.toggle("rotate-180");
      el.querySelector(".faq-content").classList.toggle("hidden");
    });
  });

  // ===== wow js
  new WOW().init();

  // ====== scroll top js
  function scrollTo(element, to = 0, duration = 500) {
    const start = element.scrollTop;
    const change = to - start;
    const increment = 20;
    let currentTime = 0;

    const animateScroll = () => {
      currentTime += increment;

      const val = Math.easeInOutQuad(currentTime, start, change, duration);

      element.scrollTop = val;

      if (currentTime < duration) {
        setTimeout(animateScroll, increment);
      }
    };

    animateScroll();
  }

  Math.easeInOutQuad = function (t, b, c, d) {
    t /= d / 2;
    if (t < 1) return (c / 2) * t * t + b;
    t--;
    return (-c / 2) * (t * (t - 2) - 1) + b;
  };

  document.querySelector(".back-to-top").onclick = () => {
    scrollTo(document.documentElement);
  };

    /* ========  themeSwitcher start ========= */

  // themeSwitcher
  const themeSwitcher = document.getElementById('themeSwitcher');

  // Theme Vars
  const userTheme = localStorage.getItem('theme');
  const systemTheme = window.matchMedia('(prefers-color0scheme: dark)').matches;

  // Initial Theme Check
  const themeCheck = () => {
    if (userTheme === 'dark' || (!userTheme && systemTheme)) {
      document.documentElement.classList.add('dark');
      return;
    }
  };

  // Manual Theme Switch
  const themeSwitch = () => {
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      return;
    }

    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  };

  // call theme switch on clicking buttons
  themeSwitcher.addEventListener('click', () => {
    themeSwitch();
  });

  // invoke theme check on initial load
  themeCheck();
  /* ========  themeSwitcher End ========= */
})();





/* ======== Contentful integration (improved) ========= */

// safe references from window (written by contentful-config.js at build-time)
const spaceId = window.CONTENTFUL_SPACE_ID;
const accessToken = window.CONTENTFUL_ACCESS_TOKEN;

/* ---- tiny helpers (minimal) ---- */

// small html escape to avoid injection
function escapeHtml(s = '') {
  return String(s)
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'",'&#39;');
}

// minimal renderer for a few component types
function renderEntryHTML(entry) {
  if (!entry || !entry.sys) return '';
  const typeId = entry.sys.contentType && entry.sys.contentType.sys && entry.sys.contentType.sys.id;

  if (typeId === 'hero') {
    const title = entry.fields.title || entry.fields.heroTitle || '';
    const subtitle = entry.fields.subtitle || entry.fields.heroSubtitle || entry.fields.description || '';
    return `
      <section class="hero py-20 text-center">
        <div class="container mx-auto">
          <h1 class="text-4xl font-bold">${escapeHtml(title)}</h1>
          ${subtitle ? `<p class="mt-4 text-lg">${escapeHtml(typeof subtitle === 'string' ? subtitle : String(subtitle))}</p>` : ''}
        </div>
      </section>
    `;
  }

  if (typeId === 'feature') {
    const heading = entry.fields.heading || '';
    const description = entry.fields.description || '';
    return `
      <section class="feature p-6">
        <div class="container mx-auto">
          <h3 class="text-2xl font-semibold">${escapeHtml(heading)}</h3>
          ${description ? `<p class="mt-2">${escapeHtml(typeof description === 'string' ? description : String(description))}</p>` : ''}
        </div>
      </section>
    `;
  }

  if (typeId === 'testimonial') {
    const quote = entry.fields.quote || '';
    const author = entry.fields.author || '';
    return `
      <section class="testimonial p-6">
        <div class="container mx-auto">
          <blockquote class="italic">"${escapeHtml(quote)}"</blockquote>
          ${author ? `<p class="mt-2 font-medium">— ${escapeHtml(author)}</p>` : ''}
        </div>
      </section>
    `;
  }

  // fallback
  return `<section class="unknown p-4"><div class="container mx-auto">Component: ${escapeHtml(typeId || 'unknown')}</div></section>`;
}

// render sections from a page entry using items list to resolve links
function renderPageSections(pageEntry, allItems = []) {
  const container = document.getElementById("page-sections");
  if (!container || !pageEntry || !pageEntry.fields) return;

  // clear previous
  container.innerHTML = "";

  // map items by id (items is the data.items array from your fetch)
  const itemsMap = {};
  allItems.forEach(i => { if (i && i.sys && i.sys.id) itemsMap[i.sys.id] = i; });

  const sections = pageEntry.fields.sections || [];
  sections.forEach(ref => {
    // resolve entry: either already expanded (has fields) or a link (sys.id)
    let entry = null;
    if (ref && ref.fields) entry = ref;
    else if (ref && ref.sys && ref.sys.id) entry = itemsMap[ref.sys.id];
    if (!entry) return;

    const html = renderEntryHTML(entry);
    container.insertAdjacentHTML("beforeend", html);
  });
}

async function loadContentful() {
  if (!spaceId || !accessToken) {
    console.error("⚠️ Contentful credentials missing.");
    return;
  }

  try {
    const url = `https://cdn.contentful.com/spaces/${spaceId}/entries?access_token=${accessToken}&limit=100`;
    const res = await fetch(url);
    const data = await res.json();
    console.log("✅ Fetched Contentful data:", data);

    const items = Array.isArray(data.items) ? data.items : [];

    if (items.length === 0) {
      console.log("No entries returned from Contentful.");
      return;
    }

    // 1) Try to find an item with slug 'home'
    let homepage = items.find(item => item.fields && item.fields.slug === "home");

    // 2) If not found, try to find by common headline fields
    if (!homepage) {
      homepage = items.find(item => {
        if (!item.fields) return false;
        return !!(item.fields.heroTitle || item.fields.title || item.fields.headline || item.fields.hero);
      });
    }

    // 3) Fallback to the first item
    if (!homepage) homepage = items[0];

    if (!homepage || !homepage.fields) {
      console.log("Found no suitable homepage entry in Contentful data.");
      return;
    }

    // Accept multiple field names — be tolerant
    const fields = homepage.fields;
    const newTitle =
      fields.heroTitle ||
      fields.title ||
      fields.headline ||
      fields.hero ||
      "";

    const newSubtitle =
      fields.subtitle ||
      fields.description ||
      fields.heroSubtitle ||
      "";

    // update #hero-title
    const titleEl = document.getElementById("hero-title");
    if (titleEl && newTitle) titleEl.textContent = newTitle;

    // optional: update #hero-subtitle if you have it
    const subEl = document.getElementById("hero-subtitle");
    if (subEl && newSubtitle) subEl.textContent = newSubtitle;

    // also set document title (browser tab)
    if (newTitle) document.title = `${newTitle} — ${document.title || "Site"}`;

    // <-- IMPORTANT: render page sections into #page-sections (uses items array to resolve links) -->
    renderPageSections(homepage, items);

    console.log("✅ Injected homepage content from Contentful:", {
      id: homepage.sys && homepage.sys.id,
      title: newTitle,
      subtitle: newSubtitle
    });
  } catch (err) {
    console.error("❌ Error fetching from Contentful:", err);
  }
}

loadContentful();
