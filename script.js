(function () {
  const config = window.DARENSTEFAN_CONFIG || {};
  const formspreeEndpoint = config.formspreeEndpoint || 'https://formspree.io/f/xpqgagly';
  const wallEndpoint = config.distanceWallEndpoint || '';

  const seedStories = [
    {
      name: 'Aisha',
      distance: 'Lagos -> Toronto · 5,600 miles',
      status: 'Still going - we make it work',
      story: "We've been doing this for two years. The hardest part isn't the distance - it's watching him eat breakfast on FaceTime while I'm getting ready for bed. We exist in different days.",
      shoutout: true
    },
    {
      name: 'Anonymous',
      distance: 'Manila -> Dubai · 4,100 miles',
      status: 'It became a success story',
      story: "Three years of calls that dropped at the wrong moment. One flight that changed everything. Distance teaches you to say what you mean - you can't afford small talk when your time zones only overlap for two hours.",
      shoutout: false
    },
    {
      name: 'James',
      distance: 'London -> Seoul · 5,500 miles',
      status: "We didn't make it",
      story: "I learned her language. Not Korean - her language. The way she went quiet when something was wrong. I learned it too late, through a screen, and by the time I understood it she'd already moved on.",
      shoutout: true
    }
  ];

  function $(selector, root = document) {
    return root.querySelector(selector);
  }

  function $all(selector, root = document) {
    return Array.from(root.querySelectorAll(selector));
  }

  function setButtonState(btn, text, disabled) {
    if (!btn) return;
    btn.textContent = text;
    btn.disabled = Boolean(disabled);
  }

  function validEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function initNav() {
    const nav = $('#nav');
    const hamburger = $('#hamburger');
    const navLinks = $('#nav-links');
    if (!nav || !hamburger || !navLinks) return;

    const syncScroll = () => nav.classList.toggle('scrolled', window.scrollY > 60);
    window.addEventListener('scroll', syncScroll, { passive: true });
    syncScroll();

    hamburger.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', String(isOpen));
    });

    $all('a', navLinks).forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  function initReveals() {
    const reveals = $all('.reveal');
    if (!reveals.length) return;
    if (!('IntersectionObserver' in window)) {
      reveals.forEach(el => el.classList.add('visible'));
      return;
    }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    reveals.forEach(el => observer.observe(el));
  }

  function initScrollButtons() {
    $all('[data-scroll-target]').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = document.getElementById(btn.dataset.scrollTarget);
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      });
    });
  }

  function initBioTabs() {
    const tabs = $all('[data-bio-tab]');
    if (!tabs.length) return;
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const type = tab.dataset.bioTab;
        tabs.forEach(item => {
          const active = item === tab;
          item.classList.toggle('active', active);
          item.setAttribute('aria-selected', String(active));
        });
        $all('.bio-panel').forEach(panel => panel.classList.toggle('active', panel.id === `bio-${type}`));
      });
    });
  }

  const bioTexts = {
    short: "Daren Stefan is an independent cinematic indie artist based in Dubai. His music explores digital intimacy, long-distance connection, and the feelings people carry but can't quite name. His debut trilogy LAING is available on all major streaming platforms.",
    medium: "Daren Stefan is an independent musician and content creator based in Dubai, making cinematic indie music that puts words to feelings people can't explain. His work sits at the intersection of emotional introspection, digital connection, and AI-assisted production.\n\nHis debut project LAING is a planned fifteen-song trilogy structured in three acts, exploring digital intimacy, long-distance love, and the emotional lives built through screens. Act One - five tracks including Typing..., Your Morning Is My Insomnia, and Temporary Heaven - is available on Spotify and all major platforms. Act Two, subtitled Friction, is currently in development.",
    long: "Daren Stefan is an independent musician, content creator, and digital storyteller based in Dubai. His music is cinematic and introspective - built for the 3am moments, the timezone gaps, the version of yourself that only exists in the reflection of a screen.\n\nHis debut project LAING is a fifteen-song cinematic indie trilogy structured in three acts. The project explores digital intimacy, long-distance love, and what it means to communicate across screens and time zones. Act One - Digital Intimacy - spans five tracks: Typing..., Your Morning Is My Insomnia, Stay Strange, Love in Translation, and Temporary Heaven. It is available on Spotify, Apple Music, and all major platforms via DistroKid.\n\nAct Two, subtitled Friction, is currently in development. Its five confirmed track titles - The Girl Before Me, Call Failed, Somebody Else Taught You Fear, I Learned Your Language Wrong, and Still Here (Barely) - signal a darker, more difficult emotional chapter. Act Three remains unrevealed.\n\nAlongside LAING, Daren has released the standalone singles Everybody Remembers Me Differently and Me in the Glass, as well as the EP Hollow Hours. Writing with instinct, producing with AI, releasing with intention - Daren Stefan is building a body of work that treats music not as content, but as correspondence."
  };

  function initCopyBio() {
    $all('[data-copy-bio]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const type = btn.dataset.copyBio;
        const original = btn.textContent;
        try {
          await navigator.clipboard.writeText(bioTexts[type] || '');
          btn.textContent = 'Copied';
          btn.style.borderColor = 'var(--gold-dim)';
          btn.style.color = 'var(--gold)';
        } catch {
          btn.textContent = 'Copy failed';
        }
        setTimeout(() => {
          btn.textContent = original;
          btn.style.borderColor = '';
          btn.style.color = '';
        }, 2000);
      });
    });
  }

  async function postForm(payload) {
    const response = await fetch(formspreeEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error('Form submission failed');
    return response;
  }

  function initContactForm() {
    const btn = $('[data-contact-submit]');
    if (!btn) return;
    btn.addEventListener('click', async () => {
      const name = $('#c-name')?.value.trim();
      const email = $('#c-email')?.value.trim();
      const subject = $('#c-subject')?.value;
      const message = $('#c-message')?.value.trim();

      if (!name || !validEmail(email || '') || !message) {
        setButtonState(btn, 'Check required fields.', false);
        setTimeout(() => setButtonState(btn, 'Send Message', false), 2200);
        return;
      }

      setButtonState(btn, 'Sending...', true);
      try {
        await postForm({ _subject: `Site Contact - ${subject || 'General'} - ${name}`, name, email, subject, message });
        setButtonState(btn, 'Sent - thank you.', true);
        ['c-name', 'c-email', 'c-subject', 'c-message'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
      } catch {
        setButtonState(btn, 'Could not send - try again.', false);
      }
    });
  }

  function initPressForm() {
    const btn = $('[data-press-submit]');
    if (!btn) return;
    btn.addEventListener('click', async () => {
      const name = $('#p-name')?.value.trim();
      const email = $('#p-email')?.value.trim();
      const type = $('#p-type')?.value;
      const outlet = $('#p-outlet')?.value.trim();
      const message = $('#p-message')?.value.trim();

      if (!name || !validEmail(email || '') || !message) {
        setButtonState(btn, 'Check required fields.', false);
        setTimeout(() => setButtonState(btn, 'Send Enquiry', false), 2200);
        return;
      }

      setButtonState(btn, 'Sending...', true);
      try {
        await postForm({ _subject: `Press Enquiry - ${type || 'General'} - ${name}`, name, email, enquiry_type: type || 'Not specified', outlet: outlet || 'Not provided', message });
        setButtonState(btn, "Sent - we'll be in touch.", true);
        ['p-name', 'p-email', 'p-type', 'p-outlet', 'p-message'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
      } catch {
        setButtonState(btn, 'Could not send - try again.', false);
      }
    });
  }

  function localStories() {
    try {
      return JSON.parse(localStorage.getItem('darenstefan.distanceWall') || '[]');
    } catch {
      return [];
    }
  }

  function saveLocalStory(story) {
    try {
      const stories = localStories();
      stories.unshift(story);
      localStorage.setItem('darenstefan.distanceWall', JSON.stringify(stories.slice(0, 20)));
    } catch {
      /* Local storage is optional. */
    }
  }

  function renderWall(stories, state) {
    const grid = $('#stories-grid');
    const empty = $('#wall-empty');
    const count = $('#wall-count');
    if (!grid || !empty || !count) return;

    let status = $('#wall-status');
    if (!status) {
      status = document.createElement('p');
      status.id = 'wall-status';
      status.className = 'wall-status';
      grid.parentNode.insertBefore(status, grid);
    }
    status.dataset.state = state || 'online';
    status.textContent = state === 'offline'
      ? 'Live wall endpoint unavailable here. Stories are previewed on this device and still sent privately.'
      : 'Public wall connected.';

    if (!stories.length) {
      grid.innerHTML = '';
      empty.style.display = 'block';
      count.textContent = '';
      return;
    }

    empty.style.display = 'none';
    count.textContent = `${stories.length} ${stories.length === 1 ? 'story' : 'stories'} shared`;
    grid.innerHTML = stories.map(story => `
      <div class="story-card">
        <div class="story-card-header">
          <span class="story-card-name">${escapeHtml(story.name || 'Anonymous')}</span>
          <span class="story-card-distance">${escapeHtml(story.distance || '')}</span>
        </div>
        <p class="story-card-text">"${escapeHtml(story.story || '')}"</p>
        ${story.shoutout ? '<p class="story-card-tag">Wants a mention in Act II or III</p>' : ''}
      </div>
    `).join('');
  }

  async function loadWall() {
    if (!$('#distance-wall')) return;
    const local = localStories();
    const fallback = local.length ? local : seedStories;
    if (!wallEndpoint || location.protocol === 'file:') {
      renderWall(fallback, 'offline');
      return;
    }
    try {
      const response = await fetch(wallEndpoint, { headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error('Wall fetch failed');
      const data = await response.json();
      const stories = Array.isArray(data.stories) ? data.stories : [];
      renderWall(stories.length ? stories : (local.length ? local : seedStories), 'online');
    } catch {
      renderWall(fallback, 'offline');
    }
  }

  function initStoryForm() {
    const btn = $('[data-story-submit]');
    if (!btn) return;
    btn.addEventListener('click', async () => {
      const story = {
        name: $('#s-name')?.value.trim() || 'Anonymous',
        distance: $('#s-distance')?.value.trim() || '',
        status: $('#s-status')?.value || '',
        email: $('#s-email')?.value.trim() || '',
        story: $('#s-story')?.value.trim() || '',
        shoutout: Boolean($('#s-shoutout')?.checked)
      };

      if (!story.story) {
        setButtonState(btn, 'Please write your story first.', false);
        setTimeout(() => setButtonState(btn, 'Share your distance', false), 2200);
        return;
      }

      if (story.email && !validEmail(story.email)) {
        setButtonState(btn, 'Check your email address.', false);
        setTimeout(() => setButtonState(btn, 'Share your distance', false), 2200);
        return;
      }

      setButtonState(btn, 'Sending...', true);
      let publicSaved = false;

      if (wallEndpoint && location.protocol !== 'file:') {
        try {
          const response = await fetch(wallEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify(story)
          });
          publicSaved = response.ok;
        } catch {
          publicSaved = false;
        }
      }

      try {
        await postForm({
          _subject: `LAING Distance Wall - ${story.name}`,
          name: story.name,
          distance: story.distance,
          status: story.status,
          email: story.email || 'Not provided',
          story: story.story,
          shoutout: story.shoutout ? 'Yes - wants a mention' : 'No'
        });
      } catch {
        /* The public wall is the primary path; Formspree is a private backup. */
      }

      if (!publicSaved) saveLocalStory(story);
      ['s-name', 's-distance', 's-status', 's-email', 's-story'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
      const shoutout = $('#s-shoutout');
      if (shoutout) shoutout.checked = false;
      await loadWall();
      setButtonState(btn, publicSaved ? 'Story shared publicly.' : 'Story saved locally and sent.', false);
      setTimeout(() => setButtonState(btn, 'Share your distance', false), 3000);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initNav();
    initReveals();
    initScrollButtons();
    initBioTabs();
    initCopyBio();
    initContactForm();
    initPressForm();
    initStoryForm();
    loadWall();
  });
})();
