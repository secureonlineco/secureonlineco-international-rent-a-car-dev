/* ═══════════════════════════════════════════════════════════════
   International Rent A Car — App Script
   Vanilla JS · No dependencies · Production-ready
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ─── DOM REFS ────────────────────────────────────────────────── */
  var nav           = document.getElementById('nav');
  var navBurger     = document.getElementById('navBurger');
  var mobMenu       = document.getElementById('mobMenu');
  var mobMenuBg     = document.getElementById('mobMenuBg');
  var mobMenuClose  = document.getElementById('mobMenuClose');
  var heroSlides    = Array.prototype.slice.call(document.querySelectorAll('.hero__slide'));
  var heroDots      = Array.prototype.slice.call(document.querySelectorAll('.hero__dot'));

  /* ─── NAV SCROLL ──────────────────────────────────────────────── */
  var scrollTicking = false;

  function updateNav() {
    if (nav) {
      nav.classList.toggle('scrolled', window.scrollY > 40);
    }
    scrollTicking = false;
  }

  window.addEventListener('scroll', function () {
    if (!scrollTicking) {
      requestAnimationFrame(updateNav);
      scrollTicking = true;
    }
  }, { passive: true });

  /* Run once on load in case page was scrolled (e.g. back navigation) */
  updateNav();

  /* ─── MOBILE MENU ─────────────────────────────────────────────── */
  function openMenu() {
    if (!mobMenu) return;
    mobMenu.setAttribute('aria-hidden', 'false');
    if (navBurger) {
      navBurger.setAttribute('aria-expanded', 'true');
      navBurger.classList.add('open');
    }
    document.body.style.overflow = 'hidden';
    var focusable = mobMenu.querySelector('button, a');
    if (focusable) setTimeout(function () { focusable.focus(); }, 60);
  }

  function closeMenu() {
    if (!mobMenu) return;
    mobMenu.setAttribute('aria-hidden', 'true');
    if (navBurger) {
      navBurger.setAttribute('aria-expanded', 'false');
      navBurger.classList.remove('open');
    }
    document.body.style.overflow = '';
    if (navBurger) navBurger.focus();
  }

  if (navBurger)    navBurger.addEventListener('click',    openMenu);
  if (mobMenuClose) mobMenuClose.addEventListener('click', closeMenu);
  if (mobMenuBg)    mobMenuBg.addEventListener('click',    closeMenu);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && mobMenu && mobMenu.getAttribute('aria-hidden') === 'false') {
      closeMenu();
    }
  });

  if (mobMenu) {
    var menuLinks = mobMenu.querySelectorAll('.mob-menu__link, .mob-menu__cta');
    for (var i = 0; i < menuLinks.length; i++) {
      menuLinks[i].addEventListener('click', closeMenu);
    }
  }

  /* ─── HERO SLIDER ─────────────────────────────────────────────── */
  var currentSlide = 0;
  var slideTimer   = null;

  function goToSlide(index) {
    if (!heroSlides.length) return;

    /* Deactivate current */
    heroSlides[currentSlide].classList.remove('active');
    if (heroDots[currentSlide]) {
      heroDots[currentSlide].classList.remove('active');
      heroDots[currentSlide].setAttribute('aria-selected', 'false');
    }

    /* Activate next */
    currentSlide = (index % heroSlides.length + heroSlides.length) % heroSlides.length;
    heroSlides[currentSlide].classList.add('active');
    if (heroDots[currentSlide]) {
      heroDots[currentSlide].classList.add('active');
      heroDots[currentSlide].setAttribute('aria-selected', 'true');
    }
  }

  function startSlider() {
    if (heroSlides.length < 2) return;
    slideTimer = setInterval(function () {
      goToSlide(currentSlide + 1);
    }, 8000);
  }

  function resetSlider() {
    clearInterval(slideTimer);
    startSlider();
  }

  for (var d = 0; d < heroDots.length; d++) {
    (function (dot) {
      dot.addEventListener('click', function () {
        var idx = parseInt(this.getAttribute('data-slide'), 10);
        if (!isNaN(idx)) {
          goToSlide(idx);
          resetSlider();
        }
      });
    })(heroDots[d]);
  }

  /* Randomise the first slide on every page load */
  if (heroSlides.length > 1) {
    var randomStart = Math.floor(Math.random() * heroSlides.length);
    if (randomStart !== 0) {
      heroSlides[0].classList.remove('active');
      if (heroDots[0]) { heroDots[0].classList.remove('active'); heroDots[0].setAttribute('aria-selected', 'false'); }
      currentSlide = randomStart;
      heroSlides[currentSlide].classList.add('active');
      if (heroDots[currentSlide]) { heroDots[currentSlide].classList.add('active'); heroDots[currentSlide].setAttribute('aria-selected', 'true'); }
    }
  }

  startSlider();

  /* ─── SMOOTH ANCHOR SCROLLING ─────────────────────────────────── */
  var anchors = document.querySelectorAll('a[href^="#"]');
  for (var a = 0; a < anchors.length; a++) {
    anchors[a].addEventListener('click', function (e) {
      var href = this.getAttribute('href');
      if (!href || href === '#') return;
      var targetId = href.slice(1);
      var target   = document.getElementById(targetId);
      if (!target) return;
      e.preventDefault();
      var navH = nav ? nav.offsetHeight : 0;
      var top  = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  }

  /* ─── FOOTER YEAR (auto-update) ────────────────────────────────── */
  var copyEl = document.querySelector('.footer__copy');
  if (copyEl) {
    var year = new Date().getFullYear();
    copyEl.innerHTML = copyEl.innerHTML.replace(/\d{4}/, year);
  }

  /* ─── QUICK ACCESS — entrance animation + mobile carousel ───────
     Desktop / tablet (≥640px):
       • Staggered qaFadeUp entrance, then .shown enables hover styles.
     Mobile (<640px):
       • No stagger — all cards shown instantly; carousel handles state.
       • Active (centred) card gets .qa-card--active for scale-up.
       • Dots sync on scroll; clicking a dot scrolls to that card.
  ─────────────────────────────────────────────────────────────────── */
  var qaCards = Array.prototype.slice.call(document.querySelectorAll('.qa-card'));

  if (window.innerWidth >= 640) {
    /* Desktop / tablet: staggered fade-up */
    var qaAnimMs    = 560;
    var qaBaseDelay = 320;
    var qaStagger   = 90;
    for (var qi = 0; qi < qaCards.length; qi++) {
      (function (card, i) {
        var startAt  = qaBaseDelay + i * qaStagger;
        var finishAt = startAt + qaAnimMs + 50;
        setTimeout(function () { card.classList.add('visible'); },  startAt);
        setTimeout(function () {
          card.classList.remove('visible');
          card.classList.add('shown');
        }, finishAt);
      })(qaCards[qi], qi);
    }
  } else {
    /* Mobile: no animation — mark all shown, first card active */
    qaCards.forEach(function (card) { card.classList.add('shown'); });
    if (qaCards[0]) qaCards[0].classList.add('qa-card--active');
  }

  /* ─── QA CAROUSEL — scale tracking + dots (mobile only) ──────── */
  var qaGrid   = document.querySelector('.qa-grid');
  var qaDotEls = Array.prototype.slice.call(document.querySelectorAll('.qa-dot'));

  function updateQaActive() {
    if (!qaGrid || !qaCards.length || window.innerWidth >= 640) return;
    var cx = qaGrid.getBoundingClientRect().left + qaGrid.offsetWidth / 2;
    var best = 0, bestDist = Infinity;
    qaCards.forEach(function (card, i) {
      var r    = card.getBoundingClientRect();
      var dist = Math.abs(r.left + r.width / 2 - cx);
      if (dist < bestDist) { bestDist = dist; best = i; }
    });
    qaCards.forEach(function (card, i) {
      card.classList.toggle('qa-card--active', i === best);
    });
    qaDotEls.forEach(function (dot, i) {
      var on = (i === best);
      dot.classList.toggle('qa-dot--active', on);
      dot.setAttribute('aria-selected', on ? 'true' : 'false');
    });
  }

  if (qaGrid && qaCards.length) {
    qaGrid.addEventListener('scroll', updateQaActive, { passive: true });
    qaDotEls.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        if (window.innerWidth >= 640 || !qaCards[i]) return;
        qaCards[i].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      });
    });
    updateQaActive();
  }

  /* ─── FLEET CARDS — entrance animation + mobile carousel ──────────
     Desktop / tablet (≥640px):
       • Each card individually observed; staggered fleetFadeUp on entry.
     Mobile (<640px):
       • Cards live in a horizontal scroll carousel; only the first is
         in the viewport initially. Observe the section instead, and
         reveal all cards at once when it enters view.
  ─────────────────────────────────────────────────────────────────── */
  var fleetCards   = Array.prototype.slice.call(document.querySelectorAll('.fleet-card'));
  var fleetAnimMs  = 480;  /* must match @keyframes fleetFadeUp duration */
  var fleetStagger = 80;   /* ms between each subsequent card */

  if (fleetCards.length) {
    if ('IntersectionObserver' in window) {

      if (window.innerWidth < 640) {
        /* ── Mobile: reveal all cards when the section scrolls in ── */
        var fleetSection = document.getElementById('fleet');
        var fleetMobObs  = new IntersectionObserver(function (entries) {
          if (!entries[0].isIntersecting) return;
          fleetCards.forEach(function (card) { card.classList.add('fleet-shown'); });
          fleetMobObs.disconnect();
        }, { threshold: 0.15 });
        if (fleetSection) fleetMobObs.observe(fleetSection);
        else fleetCards.forEach(function (c) { c.classList.add('fleet-shown'); });

      } else {
        /* ── Desktop / tablet: staggered per-card entrance ───────── */
        var fleetObs = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            var card = entry.target;
            var idx  = fleetCards.indexOf(card);
            setTimeout(function () {
              card.classList.add('fleet-in');
              setTimeout(function () {
                card.classList.remove('fleet-in');
                card.classList.add('fleet-shown');
              }, fleetAnimMs + 50);
            }, idx * fleetStagger);
            fleetObs.unobserve(card);
          });
        }, { threshold: 0.10, rootMargin: '0px 0px -30px 0px' });
        fleetCards.forEach(function (card) { fleetObs.observe(card); });
      }

    } else {
      /* Fallback: no IntersectionObserver — show all cards immediately */
      fleetCards.forEach(function (card) { card.classList.add('fleet-shown'); });
    }
  }

  /* ─── INFO CARDS — entrance animation (desktop) + carousel (mobile) ─
     Desktop/tablet (≥640px): staggered fleetFadeUp-style entrance.
     Mobile (<640px): all cards revealed immediately; center-mode
     carousel handles scale / opacity / elevation via JS classes.
  ─────────────────────────────────────────────────────────────────── */
  var infoCards   = Array.prototype.slice.call(document.querySelectorAll('.info-card'));
  var infoAnimMs  = 480;
  var infoStagger = 80;

  if (infoCards.length) {
    if (window.innerWidth < 640) {
      /* Mobile: show all cards immediately so the carousel can style them */
      infoCards.forEach(function (card) { card.classList.add('info-shown'); });

    } else if ('IntersectionObserver' in window) {
      /* Desktop: staggered per-card entrance animation */
      var infoObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var card = entry.target;
          var idx  = infoCards.indexOf(card);
          setTimeout(function () {
            card.classList.add('info-in');
            setTimeout(function () {
              card.classList.remove('info-in');
              card.classList.add('info-shown');
            }, infoAnimMs + 50);
          }, idx * infoStagger);
          infoObs.unobserve(card);
        });
      }, { threshold: 0.10, rootMargin: '0px 0px -30px 0px' });
      infoCards.forEach(function (card) { infoObs.observe(card); });

    } else {
      infoCards.forEach(function (card) { card.classList.add('info-shown'); });
    }
  }

  /* ─── PREMIUM CAROUSEL — SHARED ENGINE ────────────────────────────
     Center-mode scroll carousel with scale / opacity / shadow states
     and synced pagination dots. One instance per section.

     trackEl — the .prem-carousel__track scroll container
     dotsEl  — the .prem-carousel__dots pagination bar (may be null)
  ─────────────────────────────────────────────────────────────────── */
  function initPremiumCarousel(trackEl, dotsEl) {
    if (!trackEl) return;

    var cards   = Array.prototype.slice.call(trackEl.querySelectorAll('.prem-carousel__card'));
    var dots    = dotsEl ? Array.prototype.slice.call(dotsEl.querySelectorAll('.prem-carousel__dot')) : [];
    var ticking = false;

    function updateDots(activeIdx) {
      dots.forEach(function (dot, i) {
        var on = (i === activeIdx);
        dot.classList.toggle('prem-carousel__dot--active', on);
        dot.setAttribute('aria-selected', on ? 'true' : 'false');
      });
    }

    function update() {
      ticking = false;
      if (window.innerWidth >= 640 || !cards.length) return;

      /* Find card whose centre is closest to the track's centre */
      var rect    = trackEl.getBoundingClientRect();
      var centerX = rect.left + rect.width / 2;
      var best = 0, bestDist = Infinity;

      cards.forEach(function (card, i) {
        var r    = card.getBoundingClientRect();
        var dist = Math.abs((r.left + r.width / 2) - centerX);
        if (dist < bestDist) { bestDist = dist; best = i; }
      });

      /* Apply scale / opacity state classes */
      cards.forEach(function (card, i) {
        var d = Math.abs(i - best);
        card.classList.remove('prem-carousel__card--active', 'prem-carousel__card--far');
        if      (d === 0) card.classList.add('prem-carousel__card--active');
        else if (d >= 2)  card.classList.add('prem-carousel__card--far');
        /* d === 1: neighbour — default CSS (scale 0.93, opacity 0.85) */
      });

      updateDots(best);
    }

    /* rAF-throttled scroll listener */
    trackEl.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });

    /* Dot click → scroll matching card to centre */
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        if (window.innerWidth >= 640 || !cards[i]) return;
        cards[i].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      });
    });

    /* Initial render */
    update();
  }

  /* ─── CAROUSEL INSTANCES ────────────────────────────────────────── */
  initPremiumCarousel(
    document.querySelector('.fleet-grid'),
    document.querySelector('#fleet .prem-carousel__dots')
  );

  initPremiumCarousel(
    document.querySelector('.info-grid'),
    document.querySelector('#rental-guide .prem-carousel__dots')
  );

  initPremiumCarousel(
    document.querySelector('.explore-grid'),
    document.querySelector('#explore .prem-carousel__dots')
  );

  /* ─── CHECK AVAILABILITY MODAL ──────────────────────────────────── */
  var availModal        = document.getElementById('availModal');
  var availModalClose   = document.getElementById('availModalClose');
  var availModalForm    = document.getElementById('availModalForm');
  var availPickup       = document.getElementById('availPickup');
  var availReturn       = document.getElementById('availReturn');
  var availGroupBadge   = document.getElementById('availGroupBadge');
  var availVehicleName  = document.getElementById('availVehicleName');
  var availDurationRow  = document.getElementById('availDurationRow');
  var availDurationValue= document.getElementById('availDurationValue');

  var activeGroup   = '';
  var activeVehicle = '';

  /* ── Helpers ─────────────────────────────────────────────────── */

  function todayISO() {
    var d  = new Date();
    var mm = (d.getMonth() + 1 < 10 ? '0' : '') + (d.getMonth() + 1);
    var dd = (d.getDate()    < 10 ? '0' : '') + d.getDate();
    return d.getFullYear() + '-' + mm + '-' + dd;
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    var months = ['January','February','March','April','May','June','July',
                  'August','September','October','November','December'];
    var p = dateStr.split('-');
    return parseInt(p[2], 10) + ' ' + months[parseInt(p[1], 10) - 1] + ' ' + p[0];
  }

  function calcDays(pickup, ret) {
    if (!pickup || !ret) return 0;
    var diff = (new Date(ret) - new Date(pickup)) / 86400000;
    return diff > 0 ? Math.round(diff) : 0;
  }

  function durationLabel(days) {
    if (!days) return '';
    return days === 1 ? '1 Day' : days + ' Days';
  }

  function updateDuration() {
    var pickup = availPickup ? availPickup.value : '';
    var ret    = availReturn ? availReturn.value : '';
    var days   = calcDays(pickup, ret);
    if (days > 0) {
      if (availDurationValue) availDurationValue.textContent = durationLabel(days);
      if (availDurationRow)   availDurationRow.removeAttribute('hidden');
    } else {
      if (availDurationRow)   availDurationRow.setAttribute('hidden', '');
    }
  }

  function buildWAMessage(group, vehicle, pickup, ret) {
    var days = calcDays(pickup, ret);
    return (
      'Hello International Rent A Car!\n\n' +
      'I would like to check availability for:\n\n' +
      'Vehicle Group:\n' + group + '\n\n' +
      'Vehicle:\n' + vehicle + '\n\n' +
      'Pick-up Date:\n' + formatDate(pickup) + '\n\n' +
      'Return Date:\n'  + formatDate(ret)    + '\n\n' +
      'Rental Duration:\n' + durationLabel(days) + '\n\n' +
      'Rental Hours:\n08:30 - 21:00\n\n' +
      'Could you please let me know the availability and rental price?\n\n' +
      'Thank you!'
    );
  }

  /* ── Open / Close ────────────────────────────────────────────── */

  function openAvailModal(group, vehicle) {
    if (!availModal) return;
    activeGroup   = group;
    activeVehicle = vehicle;

    /* Populate header identity */
    if (availGroupBadge)  availGroupBadge.textContent  = group;
    if (availVehicleName) availVehicleName.textContent  = vehicle;

    /* Reset form */
    var today = todayISO();
    if (availPickup) { availPickup.min = today; availPickup.value = ''; availPickup.classList.remove('avail-modal__input--error'); }
    if (availReturn) { availReturn.min = today; availReturn.value = ''; availReturn.classList.remove('avail-modal__input--error'); }
    if (availDurationRow) availDurationRow.setAttribute('hidden', '');

    /* Show + animate */
    availModal.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        availModal.classList.add('avail-modal--open');
        if (availPickup) availPickup.focus();
      });
    });
  }

  function closeAvailModal() {
    if (!availModal) return;
    availModal.classList.remove('avail-modal--open');
    document.body.style.overflow = '';
    setTimeout(function () {
      availModal.setAttribute('hidden', '');
    }, 300);
  }

  /* ── Event: open on card CTA click ──────────────────────────── */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.fleet-card__cta[data-group]');
    if (btn) {
      e.preventDefault();
      openAvailModal(
        btn.getAttribute('data-group'),
        btn.getAttribute('data-vehicle') || ''
      );
    }
  });

  /* ── Event: close ────────────────────────────────────────────── */
  if (availModalClose) {
    availModalClose.addEventListener('click', closeAvailModal);
  }
  if (availModal) {
    availModal.addEventListener('click', function (e) {
      if (e.target === availModal) closeAvailModal();
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && availModal && !availModal.hasAttribute('hidden')) {
      closeAvailModal();
    }
  });

  /* ── Event: date changes → duration + return min sync ───────── */
  if (availPickup) {
    availPickup.addEventListener('change', function () {
      availPickup.classList.remove('avail-modal__input--error');
      if (availReturn) {
        availReturn.min = availPickup.value || todayISO();
        if (availReturn.value && availReturn.value < availPickup.value) {
          availReturn.value = '';
        }
      }
      updateDuration();
    });
  }
  if (availReturn) {
    availReturn.addEventListener('change', function () {
      availReturn.classList.remove('avail-modal__input--error');
      updateDuration();
    });
  }

  /* ── Event: form submit → WhatsApp ──────────────────────────── */
  if (availModalForm) {
    availModalForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var pickup = availPickup ? availPickup.value : '';
      var ret    = availReturn ? availReturn.value : '';
      var valid  = true;

      if (!pickup) { if (availPickup) availPickup.classList.add('avail-modal__input--error'); valid = false; }
      if (!ret)    { if (availReturn) availReturn.classList.add('avail-modal__input--error'); valid = false; }
      if (!valid)  return;

      var msg = buildWAMessage(activeGroup, activeVehicle, pickup, ret);
      window.open('https://wa.me/306944771738?text=' + encodeURIComponent(msg), '_blank', 'noopener,noreferrer');
      closeAvailModal();
    });
  }

}());
