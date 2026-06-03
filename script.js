/* ---------------------------------------------------------------
   Dr. S. Hasnain Rizvi — site behaviour
   --------------------------------------------------------------- */

(() => {
  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ----- year ----- */
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ----- nav scroll state ----- */
  const nav = $('#nav');
  const onScroll = () => {
    if (!nav) return;
    nav.classList.toggle('is-scrolled', window.scrollY > 8);
    const toTop = $('#toTop');
    if (toTop) {
      const show = window.scrollY > 600;
      toTop.hidden = !show;
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ----- back to top ----- */
  const toTop = $('#toTop');
  if (toTop) {
    toTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ----- explore overlay ----- */
  const exploreBtn     = $('.nav__explore');
  const exploreOverlay = $('#explore-overlay');
  const openExplore = () => {
    if (!exploreOverlay) return;
    exploreOverlay.hidden = false;
    exploreBtn?.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    /* focus the close button for accessibility */
    setTimeout(() => $('.explore-overlay__close')?.focus(), 50);
  };
  const closeExplore = () => {
    if (!exploreOverlay) return;
    exploreOverlay.hidden = true;
    exploreBtn?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    exploreBtn?.focus();
  };
  exploreBtn?.addEventListener('click', openExplore);
  $$('[data-explore-close]').forEach(el => el.addEventListener('click', closeExplore));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && exploreOverlay && !exploreOverlay.hidden) closeExplore();
  });

  /* ----- mobile menu ----- */
  const burger = $('.nav__burger');
  const menu   = $('#mobile-menu');
  const closeMenu = () => {
    if (!burger || !menu) return;
    burger.setAttribute('aria-expanded', 'false');
    menu.hidden = true;
  };
  if (burger && menu) {
    burger.addEventListener('click', () => {
      const open = burger.getAttribute('aria-expanded') === 'true';
      burger.setAttribute('aria-expanded', String(!open));
      menu.hidden = open;
    });
    $$('a', menu).forEach(a => a.addEventListener('click', closeMenu));
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeMenu();
    });
  }

  /* ----- engagement-type prefill (works for both URL param and in-page click) ----- */
  const prefillField = $('select[name="engagement"]');
  const PREFILL_MAP = {
    'Keynote':     'Keynote / public speaking',
    'Training':    'Corporate training or workshop',
    'Mentorship':  'Executive or 1:1 mentorship',
    'Advisory':    'Program / transformation advisory',
    'Cohort':      'Certification cohort (PMP, CAPM, PBA, SAFe, etc.)',
    'Media':       'Media, podcast or panel',
    'Academic':    'University / academic engagement'
  };
  const applyPrefill = (type) => {
    if (!prefillField || !type) return;
    const target = PREFILL_MAP[type];
    if (!target) return;
    const opt = Array.from(prefillField.options).find(o => o.value === target);
    if (opt) prefillField.value = target;
  };
  /* URL param on load */
  if (prefillField) {
    const params = new URLSearchParams(window.location.search);
    applyPrefill(params.get('type'));
  }
  /* In-page click on service tile (now that form lives on Services page) */
  $$('[data-prefill]').forEach(link => {
    link.addEventListener('click', () => {
      applyPrefill(link.getAttribute('data-prefill'));
    });
  });

  /* ----- hire form: build a mailto: ----- */
  const form = $('#hireForm');
  const note = $('#formNote');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      if (!form.reportValidity()) return;

      const data = new FormData(form);
      const get = k => (data.get(k) || '').toString().trim();

      const subject = `Engagement enquiry — ${get('engagement') || 'Dr. Rizvi'} (${get('org') || get('name') || 'New enquiry'})`;

      const lines = [
        `Name:            ${get('name')}`,
        `Email:           ${get('email')}`,
        `Organisation:    ${get('org')}`,
        `Title:           ${get('title')}`,
        '',
        `Engagement:      ${get('engagement')}`,
        `Audience size:   ${get('audience')}`,
        `Preferred dates: ${get('dates')}`,
        `Format:          ${get('format')}`,
        `Budget:          ${get('budget')}`,
        `Location:        ${get('location')}`,
        '',
        'Details',
        '-------',
        get('message'),
        '',
        `Newsletter opt-in: ${data.get('newsletter') ? 'Yes' : 'No'}`,
        '',
        '— Sent from rizvis.ca/hire'
      ].join('\n');

      const href = `mailto:info@rizvis.ca?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines)}`;
      window.location.href = href;

      if (note) {
        note.textContent = "Thanks — your email client should now open with the enquiry pre-filled. If nothing happens, please write to info@rizvis.ca directly.";
        note.className = 'form-note is-success';
      }
    });
  }

  /* ----- newsletter ----- */
  const nlForm = $('#newsletterForm');
  const nlNote = $('#nlNote');
  if (nlForm) {
    nlForm.addEventListener('submit', e => {
      e.preventDefault();
      if (!nlForm.reportValidity()) return;
      const email = (new FormData(nlForm).get('email') || '').toString().trim();
      const subject = encodeURIComponent('Newsletter signup');
      const body = encodeURIComponent(`Please add this address to Dr. Rizvi's newsletter list:\n\n${email}\n`);
      window.location.href = `mailto:info@rizvis.ca?subject=${subject}&body=${body}`;
      if (nlNote) {
        nlNote.textContent = 'Thanks — your email client should now open with the request pre-filled.';
        nlNote.className = 'newsletter__note is-success';
      }
    });
  }

  /* ----- reveal on scroll (disabled — kept here for future enable) ----- */
  // Intentionally left off. The design intentionally renders solid on first paint
  // so screenshots, RSS-style previews and slow renderers always see full content.

  /* ----- portrait fallback ----- */
  const portraitImg = $('.portrait img');
  if (portraitImg) {
    portraitImg.addEventListener('error', () => {
      portraitImg.style.display = 'none';
      const wrap = portraitImg.parentElement;
      if (!wrap) return;
      wrap.innerHTML += `
        <div style="display:grid;place-items:center;width:100%;height:100%;
                    color:#e3c98e;font-family:Georgia,serif;text-align:center;padding:24px;">
          <div>
            <div style="font-size:5rem;font-weight:700;line-height:1;">HR</div>
            <div style="margin-top:14px;letter-spacing:.18em;text-transform:uppercase;
                        color:rgba(255,255,255,.7);font-size:.78rem;">
              Dr. S. Hasnain Rizvi
            </div>
          </div>
        </div>`;
    });
  }
})();
