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












/* ======== Contentful integration (complete) =========
   Paste this as your main.js. It preserves markup and populates existing DOM nodes.
*/

const spaceId = window.CONTENTFUL_SPACE_ID;
const accessToken = window.CONTENTFUL_ACCESS_TOKEN;

/* small helpers */
const esc = s => String(s ?? '')
  .replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')
  .replaceAll('"','&quot;').replaceAll("'",'&#39;');

const buildAssetMap = data => {
  const map = {};
  if (!data) return map;
  (data.includes?.Asset || []).forEach(a => {
    const id = a?.sys?.id;
    const url = a?.fields?.file?.url;
    if (!id || !url) return;
    map[id] = url.startsWith('//') ? 'https:' + url : url;
  });
  (data.items || []).forEach(it => {
    if (it?.sys?.type === 'Asset' && it.sys.id) {
      const u = it.fields?.file?.url;
      if (u) map[it.sys.id] = u.startsWith('//') ? 'https:' + u : u;
    }
  });
  return map;
};

const getPlainText = v => {
  if (v == null) return '';
  if (typeof v === 'string') return v;
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  if (Array.isArray(v)) return v.map(getPlainText).join(' ').trim();
  if (typeof v === 'object') {
    if (v.nodeType === 'document' && Array.isArray(v.content)) {
      return v.content.map(getPlainText).join(' ').trim();
    }
    return Object.values(v).map(getPlainText).join(' ').trim();
  }
  return '';
};

/* ================= Hero Section (replace existing hero logic with this) ================= */
function populateHero(entries = [], assets = {}) {
  try {
    if (!Array.isArray(entries) || !entries.length) {
      console.warn('populateHero: no entries provided');
      return;
    }

    // prefer an entry whose contentType includes 'hero' or has hero-like fields
    const heroEntry = entries.find(it => {
      const ct = String(it?.sys?.contentType?.sys?.id || '').toLowerCase();
      const f = it.fields || {};
      return ct.includes('hero') ||
             Boolean(f.heroTitle || f.title && /hero|home|headline|homepage/i.test(String(f.title))) ||
             Boolean(f.backgroundImage || f.heroImage || f.image || f.featuredImage);
    }) || entries[0];

    if (!heroEntry || !heroEntry.fields) {
      console.warn('populateHero: hero entry not found or has no fields');
      return;
    }

    const f = heroEntry.fields;

    // TITLE & SUBTITLE
    const titleText = getPlainText(f.heroTitle || f.title || f.heading || f.headline || '');
    const subtitleText = getPlainText(f.subtitle || f.heroSubtitle || f.description || f.summary || '');
    const titleEl = document.querySelector('#home h1') || document.getElementById('hero-title') || document.querySelector('.hero-content h1');
    const subEl = document.querySelector('#home p') || document.getElementById('hero-subtitle') || document.querySelector('.hero-content p');
    if (titleEl && titleText) titleEl.textContent = titleText;
    if (subEl && subtitleText) subEl.textContent = subtitleText;

    // BUTTONS - try to find the two CTA anchors inside the hero <ul> or first anchors under #home
    const heroAnchors = Array.from(document.querySelectorAll('#home ul a')).filter(Boolean)
      .concat(Array.from(document.querySelectorAll('#home a')).filter(Boolean));

    const primaryText = getPlainText(f.primaryButtonText || f.ctaText || f.buttonText || 'Download Now');
    const primaryHref = f.primaryButtonLink || f.ctaUrl || f.buttonUrl || '#';
    const secondaryText = getPlainText(f.secondaryButtonText || f.secondaryCta || f.secondaryText || 'Star on Github');
    const secondaryHref = f.secondaryButtonLink || f.secondaryCtaUrl || f.secondaryButtonUrl || f.github || '#';

    if (heroAnchors.length) {
      if (heroAnchors[0]) {
        heroAnchors[0].textContent = primaryText;
        try { heroAnchors[0].href = primaryHref; } catch(e){}
      }
      if (heroAnchors[1]) {
        const a = heroAnchors[1];
        const svg = a.querySelector('svg');
        if (svg) {
          Array.from(a.childNodes).forEach(n => { if (n.nodeType === 3 && n.textContent.trim()) a.removeChild(n); });
          a.appendChild(document.createTextNode(' ' + secondaryText));
        } else {
          a.textContent = secondaryText;
        }
        try { a.href = secondaryHref; } catch(e){}
      }
    } else {
      console.debug('populateHero: no hero anchors found to populate CTAs');
    }

    // HERO IMAGE - prefer backgroundImage -> heroImage -> image -> featuredImage
    const imageField = f.backgroundImage || f.heroImage || f.image || f.featuredImage || f.hero_image || f.hero_img;
    const heroImgEl = document.querySelector('#home img') || document.querySelector('img[alt="hero"]') || document.querySelector('.hero-content + div img');



if (heroImgEl) {
  const applyHeroSizing = () => {
    heroImgEl.style.width = '100%';
    heroImgEl.style.height = 'auto';       // let image scale naturally
    heroImgEl.style.maxHeight = '80vh';    // don’t let it exceed viewport
    heroImgEl.style.objectFit = 'contain'; // show full image
    heroImgEl.style.objectPosition = 'center';
    heroImgEl.style.display = 'block';
    heroImgEl.classList.add('rounded-t-xl');
  };

  applyHeroSizing();
  window.addEventListener('resize', applyHeroSizing);
}

    if (imageField) {
      // if it's a link to an asset
      if (imageField.sys && imageField.sys.id && assets[imageField.sys.id]) {
        if (heroImgEl) {
          heroImgEl.src = assets[imageField.sys.id];
          if (titleText) heroImgEl.alt = titleText;
        } else {
          console.debug('populateHero: found asset but page hero <img> not found');
        }
      } else if (imageField.fields && imageField.fields.file && imageField.fields.file.url) {
        // inline asset object
        const url = imageField.fields.file.url.startsWith('//') ? 'https:' + imageField.fields.file.url : imageField.fields.file.url;
        if (heroImgEl) heroImgEl.src = url;
      } else {
        console.debug('populateHero: image field present but no linked asset found in include map');
      }
    } else {
      // No image field on the hero entry — attempt to find a "hero" asset elsewhere as a fallback
      const anyAssetUrl = Object.values(assets).find(Boolean);
      if (anyAssetUrl && heroImgEl && !heroImgEl.src.includes('http')) { // don't override a local production image unless empty
        heroImgEl.src = anyAssetUrl;
      }
    }

    // TECHNOLOGY LOGOS - optional: array of asset refs in fields.technologies or fields.techLogos
    const techContainer = Array.from(document.querySelectorAll('#home .wow')).find(el => /flex/i.test(el.className) && /items-center/i.test(el.className) && el.closest('#home'));
    const techRefs = f.technologies || f.techLogos || f.tech || f.technologyLogos || [];
    if (techContainer && Array.isArray(techRefs) && techRefs.length) {
      techContainer.innerHTML = '';
      techRefs.forEach(ref => {
        let url = '';
        if (ref && ref.sys && ref.sys.id && assets[ref.sys.id]) url = assets[ref.sys.id];
        else if (ref && ref.fields && ref.fields.file && ref.fields.file.url) url = ref.fields.file.url.startsWith('//') ? 'https:' + ref.fields.file.url : ref.fields.file.url;
        if (!url) return;
        const img = document.createElement('img');
        img.src = url;
        img.alt = getPlainText(ref.fields?.title || 'tech');
        img.className = 'h-8 w-auto';
        techContainer.appendChild(img);
      });
    }

    console.debug('populateHero: done (entry id=' + (heroEntry.sys?.id || 'unknown') + ')');
  } catch (err) {
    console.error('populateHero error', err);
  }
}


/* ================= Features ================= */
function populateFeatureCards(features = [], assets = {}) {
  try {
    const cards = Array.from(document.querySelectorAll('.wow.fadeInUp.group.mb-12'));
    if (!cards.length) { console.warn('populateFeatureCards: no feature card nodes found'); return; }

    const fill = (card, entry) => {
      if (!card || !entry?.fields) return;
      const f = entry.fields;
      const title = getPlainText(f.heading || f.title || '');
      const desc = getPlainText(f.description || f.summary || '');
      const cta = getPlainText(f.ctaText) || 'Learn More';
      const href = f.ctaUrl || f.buttonUrl || '#';

      const h4 = card.querySelector('h4') || card.querySelector('h3');
      if (h4) h4.textContent = title;
      const p = card.querySelector('p');
      if (p) p.textContent = desc;
      const a = card.querySelector('a');
      if (a) { a.textContent = cta; try { a.href = href } catch(e){} }

      const iconField = f.icon?.sys ? f.icon : (f.image?.sys ? f.image : null);
      const iconUrl = iconField?.sys ? assets[iconField.sys.id] : null;
      const iconContainer = card.querySelector('div.relative.z-10, div.flex.items-center') || card.querySelector('div');
      if (iconUrl && iconContainer) {
        while (iconContainer.firstChild) iconContainer.removeChild(iconContainer.firstChild);
        const img = document.createElement('img'); img.src = iconUrl; img.alt = title || 'icon'; img.className = 'w-8 h-8';
        iconContainer.appendChild(img);
      }
    };

    const use = Math.min(cards.length, features.length);
    for (let i = 0; i < use; i++) fill(cards[i], features[i]);

    if (features.length > cards.length) {
      let last = cards[cards.length - 1];
      for (let j = cards.length; j < features.length; j++) {
        const clone = last.cloneNode(true);
        last.parentElement.appendChild(clone);
        fill(clone, features[j]);
        last = clone;
      }
    }
    console.debug('populateFeatureCards: done');
  } catch (err) {
    console.error('populateFeatureCards error', err);
  }
}

/* ================= Pricing ================= */
function populatePricingCards(plans = [], assets = {}) {
  try {
    const cards = Array.from(document.querySelectorAll('#pricing .relative.z-10')).filter(c => c.closest('#pricing'));
    if (!cards.length) { console.warn('populatePricingCards: no pricing card DOM nodes found'); return; }

    const safeToFixed = v => {
      const n = parseFloat(String(v ?? '').replace(/[^0-9.\-]/g, ''));
      return Number.isFinite(n) ? n.toFixed(2) : String(v ?? '');
    };

    const fillPlan = (card, entry) => {
      if (!card || !entry?.fields) return;
      const f = entry.fields;
      const title = getPlainText(f.planName || f.name || f.title || f.heading || '');
      const rawPrice = (f.price !== undefined && f.price !== null) ? f.price : (f.amount !== undefined ? f.amount : '');
      const formattedPrice = safeToFixed(rawPrice);
      const currency = (getPlainText(f.currency) || '$').trim();
      const period = getPlainText(f.period || f.pricePeriod) || 'Per Month';

      let features = [];
      if (Array.isArray(f.features) && f.features.length) features = f.features.map(x => getPlainText(x));
      else {
        ['feature1','feature2','feature3','feature4','feature_1','feature_2'].forEach(k => { if (f[k]) features.push(getPlainText(f[k])); });
        if (!features.length && typeof f.details === 'string') features = f.details.split('\n').map(s => s.trim()).filter(Boolean);
      }

      const recommended = !!f.recommended;

      const titleEl = card.querySelector('span.mb-5, span.block, .mb-5') || card.querySelector('span') || null;
      if (titleEl) titleEl.textContent = title;

      const priceContainer = card.querySelector('h2') || card.querySelector('.price') || null;
      if (priceContainer) {
        priceContainer.innerHTML = `
          <span class="text-xl font-medium mr-1">${esc(currency)}</span>
          <span class="-tracking-[2px]">${esc(formattedPrice)}</span>
          <span class="text-base font-normal text-body-color dark:text-dark-6"> ${esc(period)}</span>
        `;
      }

      const featsContainer = card.querySelector('div.flex.flex-col') || card.querySelector('.mb-[50px] .flex') || card.querySelector('.mb-[50px]');
      if (featsContainer) {
        featsContainer.innerHTML = '';
        if (features.length) {
          features.forEach(ft => {
            const p = document.createElement('p');
            p.className = 'text-base text-body-color dark:text-dark-6';
            p.textContent = ft;
            featsContainer.appendChild(p);
          });
        }
      }

      const cta = card.querySelector('a') || card.querySelector('.btn') || null;
      if (cta) {
        cta.textContent = getPlainText(f.ctaText || f.buttonText) || 'Purchase Now';
        try { cta.href = f.ctaUrl || f.buttonUrl || '#'; } catch(e) {}
      }

      let ribbon = card.querySelector('.recommended-ribbon') || card.querySelector('[class*="-rotate-90"]');
      if (recommended) {
        if (!ribbon) {
          ribbon = document.createElement('p');
          ribbon.className = 'absolute right-[-50px] top-[60px] inline-block -rotate-90 rounded-bl-md rounded-tl-md bg-primary px-5 py-2 text-base font-medium text-white recommended-ribbon';
          ribbon.textContent = 'Recommended';
          card.appendChild(ribbon);
        } else {
          ribbon.style.display = '';
          ribbon.textContent = ribbon.textContent || 'Recommended';
        }
      } else if (ribbon) {
        ribbon.style.display = 'none';
      }

      const iconField = (f.icon?.sys) ? f.icon : (f.image?.sys ? f.image : null);
      const iconUrl = iconField?.sys ? assets[iconField.sys.id] : null;
      if (iconUrl) {
        const topSlot = card.querySelector('.mb-5.block, .mb-5') || card;
        if (topSlot) {
          const img = document.createElement('img');
          img.src = iconUrl;
          img.alt = title || 'plan';
          img.className = 'mb-4 max-w-[80px] mx-auto';
          topSlot.parentElement.insertBefore(img, topSlot);
        }
      }
    };

    const use = Math.min(cards.length, plans.length);
    for (let i = 0; i < use; i++) fillPlan(cards[i], plans[i]);

    if (plans.length > cards.length) {
      let last = cards[cards.length - 1];
      const wrapper = last.parentElement;
      for (let j = cards.length; j < plans.length; j++) {
        const clone = last.cloneNode(true);
        wrapper.appendChild(clone);
        fillPlan(clone, plans[j]);
        last = clone;
      }
    }
    console.debug('populatePricingCards: done');
  } catch (err) {
    console.error('populatePricingCards error', err);
  }
}

/* ================= FAQ ================= */
function populateFAQItems(faqs = []) {
  try {
    const sections = Array.from(document.querySelectorAll('section'));
    let faqSection = null;
    for (const s of sections) {
      const span = s.querySelector('span');
      const h2 = s.querySelector('h2');
      if ((span && /faq/i.test(span.textContent || '')) || (h2 && /questions|faq/i.test(h2.textContent || ''))) {
        faqSection = s;
        break;
      }
    }

    if (!faqSection) {
      const candidate = Array.from(document.querySelectorAll('.mb-12.flex')).find(n => n.closest('section'));
      faqSection = candidate ? candidate.closest('section') : null;
    }

    if (!faqSection) { console.warn('populateFAQItems: FAQ section not found'); return; }

    let nodes = Array.from(faqSection.querySelectorAll('.mb-12.flex'));
    if (!nodes.length) {
      nodes = Array.from(faqSection.querySelectorAll('.mb-12'));
      if (!nodes.length) { console.warn('populateFAQItems: no FAQ item nodes found inside section'); return; }
    }

    const fill = (node, entry) => {
      if (!node || !entry?.fields) return;
      const f = entry.fields;
      const q = getPlainText(f.question || f.title || f.heading || f.name || '');
      let a = '';
      if (typeof f.answer === 'string' && f.answer.trim()) a = f.answer;
      else if (typeof f.description === 'string' && f.description.trim()) a = f.description;
      else if (typeof f.summary === 'string' && f.summary.trim()) a = f.summary;
      else if (typeof f.content === 'string' && f.content.trim()) a = f.content;
      else a = getPlainText(f.answer || f.description || f.summary || f.content || '');

      const h3 = node.querySelector('h3') || node.querySelector('h4') || node.querySelector('.faq-question');
      if (h3) h3.textContent = q;
      const p = node.querySelector('p') || node.querySelector('.faq-content') || node.querySelector('.mb-6 .text-base');
      if (p) p.textContent = a;
    };

    const use = Math.min(nodes.length, faqs.length);
    for (let i = 0; i < use; i++) fill(nodes[i], faqs[i]);

    if (faqs.length > nodes.length) {
      let last = nodes[nodes.length - 1];
      for (let j = nodes.length; j < faqs.length; j++) {
        const clone = last.cloneNode(true);
        last.parentElement.appendChild(clone);
        fill(clone, faqs[j]);
        last = clone;
      }
    }
    console.debug('populateFAQItems: done');
  } catch (err) {
    console.error('populateFAQItems error', err);
  }
}

/* ================= Testimonials ================= */
function populateTestimonials(testimonials = [], assets = {}) {
  try {
    const section = document.querySelector('#testimonials');
    if (!section) { console.warn('populateTestimonials: testimonials section not found'); return; }

    const wrapper = section.querySelector('.swiper-wrapper');
    if (!wrapper) { console.warn('populateTestimonials: .swiper-wrapper not found'); return; }

    const slides = Array.from(wrapper.querySelectorAll('.swiper-slide'));
    if (!slides.length) { console.warn('populateTestimonials: no .swiper-slide elements found'); return; }

    const fillSlide = (slide, entry) => {
      if (!slide || !entry?.fields) return;
      const f = entry.fields;

      const quoteText = getPlainText(f.quote || f.text || f.testimonial || f.description || '');
      const quoteP = slide.querySelector('p.mb-6.text-base.text-body-color') || slide.querySelector('p.mb-6') || slide.querySelector('p');
      if (quoteP) quoteP.textContent = quoteText;

      const authorName = getPlainText(f.author || f.name || f.person || '');
      const authorRole = getPlainText(f.role || f.jobTitle || f.company || f.position || '');
      const authorH3 = slide.querySelector('a h3') || slide.querySelector('h3') || slide.querySelector('.author-name');
      if (authorH3) authorH3.textContent = authorName;
      const roleEl = slide.querySelector('a p.text-xs') || slide.querySelector('a .author-role') || (authorH3 ? authorH3.nextElementSibling : null);
      if (roleEl && authorRole) roleEl.textContent = authorRole;

      const avatarField = f.avatar?.sys ? f.avatar : (f.photo?.sys ? f.photo : (f.image?.sys ? f.image : null));
      const avatarUrl = avatarField?.sys ? assets[avatarField.sys.id] : null;
      if (avatarUrl) {
        const authorImg = slide.querySelector('a img[alt="author"]') || slide.querySelector('a img') || slide.querySelector('img[alt="author"]') || slide.querySelector('img');
        if (authorImg) {
          authorImg.src = avatarUrl;
          authorImg.alt = authorName || 'author';
        }
      }

      const ratingVal = (f.rating !== undefined && f.rating !== null) ? parseInt(f.rating,10) : (f.stars !== undefined ? parseInt(f.stars,10) : null);
      const starsContainer = slide.querySelector('div.mb-\\[18px\\].flex') || slide.querySelector('div.mb-[18px].flex') || slide.querySelector('div.mb-18') || slide.querySelector('.stars');
      if (starsContainer && Number.isInteger(ratingVal)) {
        starsContainer.innerHTML = '';
        const n = Math.max(0, Math.min(5, ratingVal));
        for (let i = 0; i < n; i++) {
          const img = document.createElement('img');
          img.src = './assets/images/testimonials/icon-star.svg';
          img.alt = 'star';
          starsContainer.appendChild(img);
        }
      }

      slide.dataset._populatedFrom = entry.sys?.id || 'unknown';
    };

    const use = Math.min(slides.length, testimonials.length);
    for (let i = 0; i < use; i++) fillSlide(slides[i], testimonials[i]);

    if (testimonials.length > slides.length) {
      let last = slides[slides.length - 1];
      for (let j = slides.length; j < testimonials.length; j++) {
        const clone = last.cloneNode(true);
        clone.removeAttribute('data-swiper-slide-index');
        wrapper.appendChild(clone);
        fillSlide(clone, testimonials[j]);
        last = clone;
      }
    }

    try {
      const carouselEl = section.querySelector('.testimonial-carousel') || section.querySelector('.swiper');
      if (carouselEl && carouselEl.swiper && typeof carouselEl.swiper.update === 'function') {
        carouselEl.swiper.update();
        console.debug('populateTestimonials: called carouselEl.swiper.update()');
      } else if (window.Swiper && window.Swiper.instances) {
        Object.values(window.Swiper.instances).forEach(inst => { try { inst.update(); } catch(_){} });
        console.debug('populateTestimonials: tried window.Swiper.instances update');
      } else if (window.mySwiper && typeof window.mySwiper.update === 'function') {
        window.mySwiper.update();
        console.debug('populateTestimonials: called window.mySwiper.update()');
      } else {
        console.debug('populateTestimonials: no Swiper instance detected; if your carousel was initialized before population you may need to call swiper.update() in your app init');
      }
    } catch (err) {
      console.warn('populateTestimonials: error when attempting swiper update', err);
    }

    console.debug('populateTestimonials: done');
  } catch (err) {
    console.error('populateTestimonials error', err);
  }
}

/* ================= Team Members ================= */
function populateTeamMembers(members = [], assets = {}) {
  try {
    let section = document.querySelector('#team');
    if (!section) {
      const sections = Array.from(document.querySelectorAll('section'));
      section = sections.find(s => {
        const h2 = s.querySelector('h2');
        const span = s.querySelector('span');
        return (h2 && /Our Creative Team|Our Team|Our Team Members/i.test(h2.textContent || '')) ||
               (span && /Our Team Members|Our Team/i.test(span.textContent || ''));
      }) || null;
    }
    if (!section) { console.warn('populateTeamMembers: team section not found'); return; }

    let wrapper = Array.from(section.querySelectorAll('.-mx-4.flex.flex-wrap')).find(r => r.classList.contains('justify-center') || r.querySelector('.w-full.px-4'));
    if (!wrapper) wrapper = section.querySelector('.container')?.querySelector('.-mx-4.flex.flex-wrap') || null;

    if (!wrapper) {
      const container = section.querySelector('.container') || section;
      wrapper = document.createElement('div');
      wrapper.className = '-mx-4 flex flex-wrap justify-center';
      container.appendChild(wrapper);
      console.debug('populateTeamMembers: created wrapper fallback');
    }

    wrapper.style.display = '';
    wrapper.classList.remove('hidden');

    const items = (members || []).slice(0, 12);
    if (!items.length) {
      wrapper.innerHTML = '<p class="w-full px-4 text-center text-body-color">No team members available.</p>';
      console.warn('populateTeamMembers: no team entries provided');
      return;
    }

    const resolveImageUrl = field => {
      if (!field) return '';
      if (field.sys && field.sys.id && assets[field.sys.id]) return assets[field.sys.id];
      if (field.fields?.file?.url) return field.fields.file.url.startsWith('//') ? 'https:' + field.fields.file.url : field.fields.file.url;
      if (typeof field === 'string' && field.trim()) return field;
      return '';
    };

    const svgFB = `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" class="fill-current"><path d="M13.3315 7.25625H11.7565H11.194V6.69375V4.95V4.3875H11.7565H12.9377C13.2471 4.3875 13.5002 4.1625 13.5002 3.825V0.84375C13.5002 0.534375 13.2752 0.28125 12.9377 0.28125H10.8846C8.66272 0.28125 7.11584 1.85625 7.11584 4.19062V6.6375V7.2H6.55334H4.64084C4.24709 7.2 3.88147 7.50937 3.88147 7.95937V9.98438C3.88147 10.3781 4.19084 10.7438 4.64084 10.7438H6.49709H7.05959V11.3063V16.9594C7.05959 17.3531 7.36897 17.7188 7.81897 17.7188H10.4627C10.6315 17.7188 10.7721 17.6344 10.8846 17.5219C10.9971 17.4094 11.0815 17.2125 11.0815 17.0437V11.3344V10.7719H11.6721H12.9377C13.3033 10.7719 13.5846 10.5469 13.6408 10.2094V10.1813V10.1531L14.0346 8.2125C14.0627 8.01562 14.0346 7.79063 13.8658 7.56562C13.8096 7.425 13.5565 7.28437 13.3315 7.25625Z"/></svg>`;
    const svgTW = `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" class="fill-current"><path d="M16.4647 4.83752C16.565 4.72065 16.4343 4.56793 16.2859 4.62263C15.9549 4.74474 15.6523 4.82528 15.2049 4.875C15.7552 4.56855 16.0112 4.13054 16.2194 3.59407C16.2696 3.46467 16.1182 3.34725 15.9877 3.40907C15.458 3.66023 14.8864 3.84658 14.2854 3.95668C13.6913 3.3679 12.8445 3 11.9077 3C10.1089 3 8.65027 4.35658 8.65027 6.02938C8.65027 6.26686 8.67937 6.49818 8.73427 6.71966C6.14854 6.59919 3.84286 5.49307 2.24098 3.79696C2.13119 3.68071 1.93197 3.69614 1.86361 3.83792C1.68124 4.21619 1.57957 4.63582 1.57957 5.07762C1.57957 6.12843 2.15446 7.05557 3.02837 7.59885C2.63653 7.58707 2.2618 7.51073 1.91647 7.38116C1.74834 7.31808 1.5556 7.42893 1.57819 7.59847C1.75162 8.9004 2.80568 9.97447 4.16624 10.2283C3.89302 10.2978 3.60524 10.3347 3.30754 10.3347C3.23536 10.3347 3.16381 10.3324 3.0929 10.3281C2.91247 10.3169 2.76583 10.4783 2.84319 10.6328C3.35357 11.6514 4.45563 12.3625 5.73809 12.3847C4.62337 13.1974 3.21889 13.6816 1.69269 13.6816C1.50451 13.6816 1.42378 13.9235 1.59073 14.0056C2.88015 14.6394 4.34854 15 5.90878 15C11.9005 15 15.1765 10.384 15.1765 6.38067C15.1765 6.24963 15.1732 6.11858 15.1672 5.98877C15.6535 5.66205 16.0907 5.27354 16.4647 4.83752Z"/></svg>`;
    const svgIG = `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" class="fill-current"><path d="M9.02429 11.8066C10.5742 11.8066 11.8307 10.5501 11.8307 9.00018C11.8307 7.45022 10.5742 6.19373 9.02429 6.19373C7.47433 6.19373 6.21783 7.45022 6.21783 9.00018C6.21783 10.5501 7.47433 11.8066 9.02429 11.8066Z"/><path d="M12.0726 1.5H5.92742C3.48387 1.5 1.5 3.48387 1.5 5.92742V12.0242C1.5 14.5161 3.48387 16.5 5.92742 16.5H12.0242C14.5161 16.5 16.5 14.5161 16.5 12.0726V5.92742C16.5 3.48387 14.5161 1.5 12.0726 1.5ZM9.02419 12.6774C6.96774 12.6774 5.34677 11.0081 5.34677 9C5.34677 6.99194 6.99194 5.32258 9.02419 5.32258C11.0323 5.32258 12.6774 6.99194 12.6774 9C12.6774 11.0081 11.0565 12.6774 9.02419 12.6774ZM14.1048 5.66129C13.8629 5.92742 13.5 6.07258 13.0887 6.07258C12.7258 6.07258 12.3629 5.92742 12.0726 5.66129C11.8065 5.39516 11.6613 5.05645 11.6613 4.64516C11.6613 4.23387 11.8065 3.91935 12.0726 3.62903C12.3387 3.33871 12.6774 3.19355 13.0887 3.19355C13.4516 3.19355 13.8387 3.33871 14.1048 3.60484C14.3468 3.91935 14.5161 4.28226 14.5161 4.66935C14.4919 5.05645 14.3468 5.39516 14.1048 5.66129Z"/></svg>`;

    const html = items.map((entry, idx) => {
      const f = entry.fields || {};
      const name = getPlainText(f.name || f.title || f.fullName || f.heading || f.person || '') || 'Unnamed';
      const role = getPlainText(f.role || f.position || f.jobTitle || f.description || '') || '';
      const photoField = f.photo || f.image || f.avatar || f.picture || f.photoImage;
      let imgUrl = resolveImageUrl(photoField);
      if (!imgUrl) {
        if (f.photo && f.photo.sys && f.photo.sys.id && assets[f.photo.sys.id]) imgUrl = assets[f.photo.sys.id];
      }
      if (!imgUrl) imgUrl = `./assets/images/team/team-0${(idx % 4) + 1}.png`;

      const facebook = (getPlainText(f.facebook || f.socialFacebook || (f.socials && f.socials.facebook) || '') || '').trim();
      const twitter = (getPlainText(f.twitter || f.socialTwitter || (f.socials && f.socials.twitter) || '') || '').trim();
      const instagram = (getPlainText(f.instagram || f.socialInstagram || (f.socials && f.socials.instagram) || '') || '').trim();

      const fbHref = facebook || 'javascript:void(0)';
      const twHref = twitter || 'javascript:void(0)';
      const igHref = instagram || 'javascript:void(0)';

      const fbTarget = facebook ? ' target="_blank" rel="noopener noreferrer"' : '';
      const twTarget = twitter ? ' target="_blank" rel="noopener noreferrer"' : '';
      const igTarget = instagram ? ' target="_blank" rel="noopener noreferrer"' : '';

      return `
      <div class="w-full px-4 sm:w-1/2 lg:w-1/4 xl:w-1/4">
        <div class="group mb-8 rounded-xl bg-white px-5 pb-10 pt-12 shadow-testimonial dark:bg-dark dark:shadow-none">
          <div class="relative z-10 mx-auto mb-5 h-[120px] w-[120px]">
            <img src="${esc(imgUrl)}" alt="${esc(name)}" class="h-[120px] w-[120px] rounded-full object-cover" />
            <span class="absolute bottom-0 left-0 -z-10 h-10 w-10 rounded-full bg-secondary opacity-0 transition-all group-hover:opacity-100"></span>
            <span class="absolute right-0 top-0 -z-10 opacity-0 transition-all group-hover:opacity-100">
              <svg width="55" height="53" viewBox="0 0 55 53" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.5 3.1a1.55 1.55 0 1 0 0-3.1 1.55 1.55 0 0 0 0 3.1z" fill="#3758F9"/></svg>
            </span>
          </div>
          <div class="text-center">
            <h4 class="mb-1 text-lg font-semibold text-dark dark:text-white">${esc(name)}</h4>
            <p class="mb-5 text-sm text-body-color dark:text-dark-6">${esc(role)}</p>
            <div class="flex items-center justify-center gap-5">
              <a href="${esc(fbHref)}" class="text-dark-6 hover:text-primary" ${fbTarget} aria-label="facebook">${svgFB}</a>
              <a href="${esc(twHref)}" class="text-dark-6 hover:text-primary" ${twTarget} aria-label="twitter">${svgTW}</a>
              <a href="${esc(igHref)}" class="text-dark-6 hover:text-primary" ${igTarget} aria-label="instagram">${svgIG}</a>
            </div>
          </div>
        </div>
      </div>
      `;
    }).join('\n');

    wrapper.innerHTML = html;
    console.debug('populateTeamMembers: injected', items.length, 'members');
  } catch (err) {
    console.error('populateTeamMembers error', err);
  }
}

/* ================= Blog Section ================= */
function populateBlogSection(posts = [], assets = {}) {
  try {
    let blogSection = null;
    const sections = Array.from(document.querySelectorAll('section'));
    for (const s of sections) {
      const h2 = s.querySelector('h2');
      const span = s.querySelector('span');
      if ((h2 && /Our Recent News|Our Blogs|Our Blog|Blogs|Recent News/i.test(h2.textContent || '')) ||
          (span && /Our Blogs|Our Blog/i.test(span.textContent || ''))) {
        blogSection = s;
        break;
      }
    }
    if (!blogSection) blogSection = sections.find(s => s.querySelector('.w-full.px-4')) || document.querySelector('section.bg-white') || sections[0];
    if (!blogSection) { console.warn('populateBlogSection: blog section not found'); return; }

    let blogRow = Array.from(blogSection.querySelectorAll('.-mx-4.flex.flex-wrap')).find(r => r.querySelector('.w-full.px-4'));
    if (!blogRow) {
      const container = blogSection.querySelector('.container');
      if (container) {
        const rows = Array.from(container.querySelectorAll('.-mx-4.flex.flex-wrap'));
        blogRow = rows[1] || rows[0] || null;
      }
    }
    if (!blogRow) {
      blogRow = document.createElement('div');
      blogRow.className = '-mx-4 flex flex-wrap';
      const container = blogSection.querySelector('.container') || blogSection;
      container.appendChild(blogRow);
      console.debug('populateBlogSection: created fallback blogRow wrapper');
    }

    blogRow.style.display = ''; blogRow.classList.remove('hidden');

    const itemsToUse = (posts || []).slice(0,3);
    if (!itemsToUse.length) {
      blogRow.innerHTML = '<p class="w-full px-4 text-center text-body-color">No blog posts available yet.</p>';
      return console.warn('populateBlogSection: no blog entries provided');
    }

    const formatDate = dateStr => {
      if (!dateStr) return '';
      const d = new Date(dateStr); if (isNaN(d)) return dateStr;
      return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });
    };
    const truncate = (s,n) => { if (!s) return ''; s = String(s); return (s.length > n) ? s.slice(0, n - 1) + '…' : s; };

    const cardsHTML = itemsToUse.map((entry, idx) => {
      const f = entry.fields || {};
      const titleRaw = getPlainText(f.title || f.heading || f.name || 'Untitled');
      const title = esc(titleRaw);
      const excerptRaw = getPlainText(f.excerpt || f.description || f.summary || f.body || '');
      const excerpt = esc(excerptRaw);
      let imgUrl = '';
      const imageField = f.media || f.featuredImage || f.image || f.photo || f.heroImage;
      if (imageField && imageField.sys && imageField.sys.id) imgUrl = assets[imageField.sys.id] || '';
      if (!imgUrl && imageField && imageField.fields && imageField.fields.file && imageField.fields.file.url) {
        imgUrl = imageField.fields.file.url.startsWith('//') ? 'https:' + imageField.fields.file.url : imageField.fields.file.url;
      }
      if (!imgUrl) imgUrl = `./assets/images/blog/blog-0${(idx % 3) + 1}.jpg`;
      const pubDate = formatDate(getPlainText(f.publishDate || f.date || f.dateAndTime || entry.sys?.createdAt));
      const slug = esc(String(f.slug || f.handle || '').trim());
      const href = slug ? `blog-details.html?slug=${encodeURIComponent(slug)}` : 'blog-details.html';

      return `
      <div class="w-full px-4 md:w-1/2 lg:w-1/3">
        <div class="wow fadeInUp group mb-10" data-wow-delay="${0.1 + idx*0.05}s">
          <div class="mb-8 overflow-hidden rounded-[5px]">
            <a href="${href}" class="block">
              <img src="${imgUrl}" alt="${titleRaw.replace(/"/g,'')}" class="w-full transition group-hover:rotate-6 group-hover:scale-125" />
            </a>
          </div>
          <div>
            <span class="mb-6 inline-block rounded-[5px] bg-primary px-4 py-0.5 text-center text-xs font-medium leading-loose text-white">
              ${pubDate}
            </span>
            <h3>
              <a href="${href}" class="mb-4 inline-block text-xl font-semibold text-dark hover:text-primary dark:text-white dark:hover:text-primary sm:text-2xl lg:text-xl xl:text-2xl">
                ${title}
              </a>
            </h3>
            <p class="max-w-[370px] text-base text-body-color dark:text-dark-6">
              ${truncate(excerpt, 140)}
            </p>
          </div>
        </div>
      </div>
      `;
    }).join('\n');

    blogRow.innerHTML = cardsHTML;
    console.debug('populateBlogSection: injected', itemsToUse.length, 'cards');
  } catch (err) {
    console.error('populateBlogSection error', err);
  }
}

/* ================= Main fetch + populate ================= */
async function loadContentfulIntegration() {
  if (!spaceId || !accessToken) { console.warn('Contentful credentials missing'); return; }
  try {
    const url = `https://cdn.contentful.com/spaces/${spaceId}/entries?access_token=${accessToken}&limit=200&include=2`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Network response not ok: ' + res.status);
    const data = await res.json();
    console.log('✅ Fetched Contentful data:', data);

    const items = Array.isArray(data.items) ? data.items : [];
    const assets = buildAssetMap(data);
    if (!items.length) { console.log('No entries returned from Contentful.'); return; }

    // HERO: call populateHero with all entries (it will pick the best match)
    populateHero(items, assets);

    // FEATURES
    const features = items.filter(it => String(it?.sys?.contentType?.sys?.id || '').toLowerCase().includes('feature'));
    if (features.length) populateFeatureCards(features, assets);

    // PRICING
    const pricingPlans = items.filter(it => {
      const id = String(it?.sys?.contentType?.sys?.id || '').toLowerCase();
      return id === 'pricing' || id === 'pricingplan' || id === 'pricingplanitem' || id === 'plan' || id.includes('pricing') || id.includes('plan');
    });
    if (pricingPlans.length) populatePricingCards(pricingPlans, assets);

    // FAQ
    const faqs = items.filter(it => {
      const id = String(it?.sys?.contentType?.sys?.id || '').toLowerCase();
      return id === 'faq' || id === 'faqs' || id.includes('faq') || id.includes('question');
    });
    if (faqs.length) populateFAQItems(faqs);

    // TESTIMONIALS
    const testimonials = items.filter(it => {
      const id = String(it?.sys?.contentType?.sys?.id || '').toLowerCase();
      return id === 'testimonial' || id === 'testimonials' || id.includes('testimonial') || id.includes('review') || id.includes('quote');
    });
    if (testimonials.length) populateTestimonials(testimonials, assets);

    // TEAM MEMBERS
    const teamMembers = items.filter(it => {
      const id = String(it?.sys?.contentType?.sys?.id || '').toLowerCase();
      return id === 'teammember' || id.includes('team') || id.includes('member');
    });
    if (teamMembers.length) populateTeamMembers(teamMembers, assets);

    // BLOG POSTS
    const blogPosts = items.filter(it => {
      const id = String(it?.sys?.contentType?.sys?.id || '').toLowerCase();
      return id.includes('blog') || id.includes('post') || id.includes('article') || id === 'blogpost';
    });
    if (blogPosts.length) populateBlogSection(blogPosts, assets);

    console.log('✅ Injected Contentful content (hero/features/pricing/faq/testimonials/team/blog).');
  } catch (err) {
    console.error('❌ Error fetching or injecting Contentful content:', err);
  }
}





// contact form 
(function(){
  const form = document.getElementById('contact-form');
  if (!form) return;

  const msgEl = document.getElementById('form-msg');
  const submitBtn = document.getElementById('contact-submit');

  form.addEventListener('submit', async function(e) {
    e.preventDefault();

    // Basic HTML5 validity check
    if (!form.checkValidity()) {
      msgEl.textContent = 'Please fill all required fields correctly.';
      msgEl.style.color = 'red';
      return;
    }

    // Simple anti-bot honeypot (if you add one later)
    const gotcha = form.querySelector('input[name="_gotcha"]');
    if (gotcha && gotcha.value) return;

    // Put the user's email into _replyto so Formspree sets reply-to
    const emailInput = form.querySelector('input[name="email"]');
    if (emailInput) {
      let reply = form.querySelector('input[name="_replyto"]');
      if (!reply) {
        reply = document.createElement('input');
        reply.type = 'hidden';
        reply.name = '_replyto';
        form.appendChild(reply);
      }
      reply.value = emailInput.value;
    }

    submitBtn.disabled = true;
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';
    msgEl.style.color = 'inherit';
    msgEl.textContent = '';

    try {
      const res = await fetch(form.action, {
        method: form.method || 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        msgEl.textContent = 'Thanks — your message was sent!';
        msgEl.style.color = 'green';
        form.reset();
      } else {
        // try to show Formspree error if any
        const data = await res.json().catch(()=>null);
        msgEl.textContent = (data && data.error) ? data.error : 'Sending failed. Please try again later.';
        msgEl.style.color = 'red';
      }
    } catch (err) {
      console.error(err);
      msgEl.textContent = 'Network error. Please try again later.';
      msgEl.style.color = 'red';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });
})();

/* run after DOM ready */
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', loadContentfulIntegration);
else loadContentfulIntegration();
