/* =========================================================
   Chữ Thập Đỏ — tương tác & chuyển động (GSAP 3.13)
   ========================================================= */
(() => {
  'use strict';

  const D = window.HCTD_DATA;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const nf = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 });
  const nf1 = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 });

  /** 3260000000 → "3,26 tỷ", 742500000 → "742,5 tr" */
  const fmtShort = (n) => n >= 1e9 ? `${nf.format(n / 1e9)} tỷ` : `${nf1.format(n / 1e6)} tr`;
  const fmtVND = (n) => `${Math.round(n).toLocaleString('vi-VN')}đ`;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // Trạng thái dùng chung (khai báo sớm để UI cơ bản chạy được cả khi không có GSAP)
  let smoother = null;
  let programsST = null;
  let boardType = 'personal';
  let boardShown = false;

  // Luôn bắt đầu từ đầu trang để intro chạy đúng
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  if (!location.hash) window.scrollTo(0, 0);

  /* ---------------------------------------------------------
     RENDER — chương trình
     --------------------------------------------------------- */
  const track = $('#programs-track');

  function renderPrograms() {
    const cards = D.programs.map((p) => {
      const pct = Math.min(100, Math.round((p.raised / p.goal) * 100));
      return `
      <article class="card" data-cat="${p.cat}">
        <span class="card__tag">${D.categories[p.cat]}</span>
        ${p.urgent ? '<span class="card__urgent">Khẩn cấp</span>' : ''}
        <figure class="card__media"><img src="${p.img}" alt="${p.title}" loading="lazy" /></figure>
        <div class="card__body">
          <span class="card__org">${p.org}</span>
          <h3 class="card__title"><a href="#" class="card__link" data-soon="${p.title}">${p.title}</a></h3>
          <div class="progress" role="progressbar" aria-label="Tiến độ gây quỹ" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}">
            <i style="transform: scaleX(${pct / 100})"></i>
          </div>
          <div class="card__nums">
            <div><span class="card__raised">${fmtShort(p.raised)}</span> <span class="card__goal">/ ${fmtShort(p.goal)}</span></div>
            <span class="card__pct">${pct}%</span>
          </div>
          <div class="card__meta">
            <span><b>${p.donors.toLocaleString('vi-VN')}</b> lượt ủng hộ</span>
            <span>Còn <b>${p.days}</b> ngày</span>
          </div>
          <div class="card__cta">
            <a href="#" class="btn btn--red btn--sm magnetic card__btn" data-donate="${p.title}"><span class="btn__text">Ủng hộ ngay</span></a>
          </div>
        </div>
      </article>`;
    }).join('');

    track.innerHTML = cards + `
      <article class="card card--end">
        <span class="card__tag">Khởi tạo quỹ</span>
        <div class="card__media" aria-hidden="true"><span class="card__cross"></span></div>
        <div class="card__body">
          <span class="card__org">Dành cho Cá nhân &amp; Tổ chức hợp pháp</span>
          <h3 class="card__title"><a href="#khoi-tao" data-scroll class="card__link">Có một hoàn cảnh cần giúp đỡ?</a></h3>
          <p class="card__desc">Tạo quỹ mới chỉ trong vài phút — Hội Chữ thập đỏ đồng hành xác minh và giải ngân.</p>
          <div class="card__meta">
            <span><b>3</b> bước đăng ký</span>
            <span>Duyệt trong <b>24</b> giờ</span>
          </div>
          <div class="card__cta">
            <a href="#khoi-tao" data-scroll class="btn btn--red btn--sm magnetic card__btn"><span class="btn__text">Tạo quỹ ngay</span></a>
          </div>
        </div>
      </article>`;
  }

  /* ---------------------------------------------------------
     RENDER — bảng vàng
     --------------------------------------------------------- */
  const podium = $('#podium');
  const ranks = $('#ranks');
  const AV_COLORS = ['#E91D24', '#006C45', '#B3141B', '#8A5A2B', '#2F4858', '#C2410C', '#5B3A8C', '#0F766E'];
  const ORG_STOP = new Set(['tập', 'đoàn', 'công', 'ty', 'cp', 'tnhh', 'ngân', 'hàng', 'clb', 'quỹ', 'hiệp', 'hội', 'trường', 'đh']);

  function initials(name, type) {
    const words = name.split(/\s+/);
    if (type === 'personal') return words.slice(-2).map((w) => w[0]).join('').toUpperCase();
    const core = words.filter((w) => !ORG_STOP.has(w.toLowerCase()));
    return (core.length ? core : words).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  }

  function renderBoard(type) {
    const list = D.board[type];
    const max = list[0].amount;

    // Top 3: thẻ theo đúng thứ tự hạng
    podium.innerHTML = list.slice(0, 3).map((r, i) => `
      <article class="top-card top-card--${i + 1}">
        <div class="top-card__rank"><img class="medal" src="Emages/hc-${i + 1}.webp" alt="" width="48" height="48" /><span>Hạng ${i + 1}</span></div>
        <div class="top-card__who">
          <span class="avatar" style="--av:${AV_COLORS[i]}">${initials(r.name, type)}</span>
          <div><div class="top-card__name">${r.name}</div><div class="top-card__sub">${r.sub}</div></div>
        </div>
        <div class="top-card__total"><span>Tổng ủng hộ</span><b class="top-card__amount" data-amount="${r.amount}">${fmtVND(r.amount)}</b></div>
      </article>`).join('');

    // Hạng 4 trở đi: bảng có thanh so với hạng 1
    ranks.innerHTML = list.slice(3).map((r, j) => {
      const share = r.amount / max;
      return `
      <li class="rank">
        <span class="rank__pos">${String(j + 4).padStart(2, '0')}</span>
        <span class="avatar" style="--av:${AV_COLORS[(j + 3) % AV_COLORS.length]}">${initials(r.name, type)}</span>
        <div class="rank__who"><div class="rank__name">${r.name}</div><div class="rank__sub">${r.sub}</div></div>
        <div class="rank__share"><div class="rank__bar"><i style="transform: scaleX(${share.toFixed(3)})"></i></div><span class="rank__pct">${Math.round(share * 100)}%</span></div>
        <span class="rank__amount" data-amount="${r.amount}">${fmtVND(r.amount)}</span>
      </li>`;
    }).join('');
    const now = new Date();
    $('#board-time').textContent = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  }


  /** Bản đồ cứu trợ: ghim điểm, số liệu tổng, thẻ khẩn cấp */
  function renderRelief() {
    const { need, standby } = D.relief;
    const sum = (arr, key) => arr.reduce((t, x) => t + x[key], 0);
    const totals = {
      need: sum(need, 'count'),
      urgent: sum(need.filter((x) => x.urgent), 'count'),
      people: sum(standby, 'people'),
      teams: sum(standby, 'teams')
    };
    $$('[data-relief]').forEach((el) => {
      el.dataset.count = totals[el.dataset.relief];
      el.textContent = totals[el.dataset.relief].toLocaleString('vi-VN');
    });

    const pin = (x, cls, size, tip) => `
      <span class="pin ${cls}" style="--x:${x.x}%; --y:${x.y}%">
        <i class="pin__dot"${size ? ` style="--s:${size}rem"` : ''}></i>
        <span class="pin__tip"><b>${x.name}</b>${tip}</span>
      </span>`;
    $('.relief__pins').innerHTML =
      need.map((x) => pin(x, x.urgent ? 'pin--need pin--urgent' : 'pin--need', (0.6 + x.count * 0.025).toFixed(2), `${x.count} điểm cần hỗ trợ · ${x.note}`)).join('') +
      standby.map((x) => pin(x, 'pin--standby', 0, `${x.people.toLocaleString('vi-VN')} người · ${x.teams} đội sẵn sàng`)).join('');

    // Điểm khẩn cấp lớn nhất + lực lượng gần nhất
    const hot = need.filter((x) => x.urgent).sort((a, b) => b.count - a.count)[0];
    if (hot) {
      const near = standby.reduce((a, b) => (Math.hypot(b.x - hot.x, b.y - hot.y) < Math.hypot(a.x - hot.x, a.y - hot.y) ? b : a));
      $('.relief__callout').innerHTML = `
        <span class="relief__callout-tag">Khẩn cấp</span>
        <strong>${hot.name}</strong>
        <p>${hot.count} điểm cần hỗ trợ · ${hot.note}</p>
        <p>Gần nhất: ${near.name} · ${near.teams} đội sẵn sàng</p>`;
    }
  }

  renderPrograms();
  renderBoard('personal');
  renderRelief();

  /* ---------------------------------------------------------
     Không có GSAP (mất mạng/CDN lỗi) → trang vẫn dùng được
     --------------------------------------------------------- */
  if (!window.gsap || !window.ScrollTrigger || !window.ScrollSmoother || !window.SplitText) {
    $('.preloader')?.remove();
    bindBasicUI();
    placeThumb($('.segmented__btn.is-active'));
    return;
  }

  gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText);
  gsap.defaults({ ease: 'expo.out', duration: 1.1 });

  smoother = reduceMotion ? null : ScrollSmoother.create({
    wrapper: '#smooth-wrapper',
    content: '#smooth-content',
    smooth: 1.15,
    smoothTouch: false,
    effects: false
  });

  const gutter = () => parseFloat(getComputedStyle($('.container')).paddingLeft) || 16;

  /* ---------------------------------------------------------
     Helpers chuyển động
     --------------------------------------------------------- */
  function countUp(el, to, { decimals = 0, suffix = '', format, duration = 2 } = {}) {
    const o = { v: 0 };
    const fmt = format || ((v) => `${v.toLocaleString('vi-VN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${suffix}`);
    return gsap.to(o, {
      v: to, duration, ease: 'power3.out',
      onUpdate: () => { el.textContent = fmt(decimals ? o.v : Math.round(o.v)); }
    });
  }

  /** Tiêu đề: tách dòng, trượt lên từ mặt nạ, rồi trả lại DOM gốc */
  function splitReveal(el, vars = {}) {
    const split = SplitText.create(el, { type: 'lines', mask: 'lines', linesClass: 'split-line' });
    return gsap.from(split.lines, {
      yPercent: 110, duration: 1.2, stagger: 0.09, ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 86%', once: true },
      onComplete: () => split.revert(),
      ...vars
    });
  }

  function reveal(targets, trigger, vars = {}) {
    return gsap.from(targets, {
      y: 40, autoAlpha: 0, duration: 1, stagger: 0.08,
      scrollTrigger: { trigger, start: 'top 85%', once: true },
      ...vars
    });
  }

  /* =========================================================
     PRELOADER → HERO INTRO
     ========================================================= */
  const preloader = $('.preloader');
  const heroLines = $$('.hero__title .line__inner');

  function lockScroll(on) { document.documentElement.style.overflow = on ? 'hidden' : ''; }

  function setHeroStart() {
    gsap.set(heroLines, { yPercent: 115 });
    gsap.set('.hero__title .pill', { scaleX: 0 });
    gsap.set('.hero__fade', { autoAlpha: 0, y: 24 });
    gsap.set('.hero__badge', { scale: 0 });
    gsap.set('.hero__media img', { scale: 1.35, yPercent: 12 });
    gsap.set('.hero__media', { y: 120 });
    gsap.set('.nav', { yPercent: -160 });
  }

  function heroIntro() {
    return gsap.timeline({ defaults: { ease: 'expo.out', duration: 1.4 }, onComplete: () => ScrollTrigger.refresh() })
      .to(heroLines, { yPercent: 0, stagger: 0.1 })
      .to('.hero__title .pill', { scaleX: 1, duration: 1.2, stagger: 0.15 }, 0.45)
      .to('.nav', { yPercent: 0, duration: 1.2 }, 0.3)
      .to('.hero__badge', { scale: 1, duration: 1.4, ease: 'elastic.out(1, 0.6)' }, 0.6)
      .to('.hero__fade', { autoAlpha: 1, y: 0, stagger: 0.08, duration: 1 }, 0.7)
      .to('.hero__media', { y: 0, duration: 1.6 }, 0.55)
      .to('.hero__media img', { scale: 1, yPercent: 0, duration: 2 }, 0.55);
  }

  function runPreloader() {
    if (reduceMotion || !preloader) {
      preloader?.remove();
      return Promise.resolve();
    }
    lockScroll(true);
    setHeroStart();

    const num = $('.preloader__num', preloader);
    const counter = { v: 0 };
    const setNum = () => { num.textContent = Math.round(counter.v); };

    const intro = gsap.timeline()
      .from('.preloader__bar--v', { scaleY: 0, duration: 0.9, ease: 'expo.inOut' })
      .from('.preloader__bar--h', { scaleX: 0, duration: 0.9, ease: 'expo.inOut' }, 0.2)
      .from('.preloader__meta span', { yPercent: 120, autoAlpha: 0, stagger: 0.08, duration: 0.8 }, 0.2)
      .to(counter, { v: 86, duration: 1.6, ease: 'power2.out', onUpdate: setNum }, 0);

    const loaded = new Promise((res) => {
      if (document.readyState === 'complete') return res();
      window.addEventListener('load', res, { once: true });
      setTimeout(res, 3500); // không chờ quá lâu khi mạng chậm
    });
    const fonts = document.fonts ? document.fonts.ready : Promise.resolve();

    return Promise.all([intro.then(), loaded, fonts]).then(() => new Promise((done) => {
      gsap.timeline({ onComplete: () => { preloader.remove(); lockScroll(false); } })
        .to(counter, { v: 100, duration: 0.45, ease: 'power1.inOut', onUpdate: setNum })
        .to('.preloader__cross', { rotate: 90, scale: 0, duration: 0.7, ease: 'power3.in' })
        .to('.preloader__count, .preloader__meta', { yPercent: -60, autoAlpha: 0, duration: 0.6, ease: 'power3.in' }, '<')
        .to(preloader, { clipPath: 'inset(0% 0% 100% 0%)', duration: 1.1, ease: 'expo.inOut' }, '-=0.15')
        .add(() => { heroIntro(); done(); }, '-=0.75');
    }));
  }

  /* =========================================================
     HERO — scroll
     ========================================================= */
  function initHero() {
    // Badge quay liên tục + tăng tốc theo scroll
    const spin = gsap.to('.hero__badge-text', { rotate: 360, duration: 16, repeat: -1, ease: 'none', transformOrigin: '50% 50%' });
    ScrollTrigger.create({
      trigger: '.hero', start: 'top top', end: 'bottom top',
      onUpdate: (self) => {
        const v = gsap.utils.clamp(1, 5, Math.abs(self.getVelocity()) / 250);
        gsap.to(spin, { timeScale: v * (self.direction || 1), duration: 0.2, overwrite: true });
        gsap.to(spin, { timeScale: 1, duration: 1.2, delay: 0.25 });
      }
    });

    // Các dòng tiêu đề trôi lệch nhau khi cuộn
    $$('.hero__title .line').forEach((line, i) => {
      gsap.to(line, {
        xPercent: i % 2 ? 6 : -6, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
      });
    });

    // Ảnh hero: mở rộng tràn viền + parallax
    const media = $('.hero__media');
    const radius = () => parseFloat(getComputedStyle(document.documentElement).fontSize) * (window.innerWidth > 900 ? 3 : 1.5);
    gsap.fromTo(media,
      { clipPath: () => `inset(0px ${gutter()}px 0px ${gutter()}px round ${radius()}px)` },
      {
        clipPath: 'inset(0px 0px 0px 0px round 0px)', ease: 'none',
        scrollTrigger: { trigger: media, start: 'top 85%', end: 'top 10%', scrub: true, invalidateOnRefresh: true }
      });
    gsap.fromTo('.hero__media-inner', { yPercent: -6 }, {
      yPercent: 6, ease: 'none',
      scrollTrigger: { trigger: media, start: 'top bottom', end: 'bottom top', scrub: true }
    });
    gsap.from('.hero__caption', {
      y: 30, autoAlpha: 0, duration: 1,
      scrollTrigger: { trigger: media, start: 'top 40%', once: true }
    });

    // Bộ đếm thống kê
    ScrollTrigger.create({
      trigger: '.stats', start: 'top 85%', once: true,
      onEnter: () => {
        $$('.stat__num').forEach((el, i) => {
          gsap.delayedCall(i * 0.12, () => countUp(el, parseFloat(el.dataset.count), {
            decimals: +el.dataset.decimals || 0, suffix: el.dataset.suffix || ''
          }));
        });
      }
    });
    gsap.from('.stat', {
      y: 50, autoAlpha: 0, stagger: 0.1, duration: 1.1,
      scrollTrigger: { trigger: '.stats', start: 'top 88%', once: true }
    });
  }

  /* =========================================================
     MARQUEE — tốc độ & chiều theo vận tốc cuộn
     ========================================================= */
  function initMarquee() {
    const loop = gsap.to('.marquee__track', { xPercent: -50, duration: 24, ease: 'none', repeat: -1 });
    loop.totalTime(loop.duration() * 200); // để có thể chạy lùi vô hạn
    ScrollTrigger.create({
      trigger: '.marquee', start: 'top bottom', end: 'bottom top',
      onUpdate: (self) => {
        const dir = self.direction || 1;
        const boost = gsap.utils.clamp(1, 7, Math.abs(self.getVelocity()) / 220);
        gsap.timeline({ overwrite: true })
          .to(loop, { timeScale: dir * boost, duration: 0.15 })
          .to(loop, { timeScale: dir, duration: 1.2, ease: 'power2.out' }, '+=0.2');
      }
    });
  }

  /* =========================================================
     BẢN ĐỒ CỨU TRỢ — số liệu đếm lên, ghim điểm bật dần
     ========================================================= */
  function initRelief() {
    splitReveal($('#relief-title'));
    reveal(['.relief__lead', '.relief-stat', '.relief .btn'], '.relief__left', { stagger: 0.06 });

    const nums = $$('.relief-stat__num');
    nums.forEach((el) => { el.textContent = '0'; });
    ScrollTrigger.create({
      trigger: '.relief__stats', start: 'top 85%', once: true,
      onEnter: () => nums.forEach((el, i) => gsap.delayedCall(i * 0.12, () => countUp(el, +el.dataset.count)))
    });

    if (reduceMotion) return;
    const map = '.relief__map';
    gsap.from('.relief__canvas img', { autoAlpha: 0, scale: 0.94, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: map, start: 'top 80%', once: true } });
    gsap.from('.pin__dot', { scale: 0, duration: 0.7, ease: 'back.out(2.5)', stagger: { each: 0.05, from: 'start' }, scrollTrigger: { trigger: map, start: 'top 60%', once: true } });
    gsap.from(['.relief__callout', '.relief__legend'], { y: 30, autoAlpha: 0, duration: 1, stagger: 0.1, scrollTrigger: { trigger: map, start: 'top 50%', once: true } });
  }

  /* =========================================================
     CHƯƠNG TRÌNH — cuộn ngang (desktop) / vuốt (mobile)
     ========================================================= */
  function initPrograms(isDesktop) {
    const section = $('.programs');
    const viewport = $('.programs__viewport');
    splitReveal($('#programs-title'));
    reveal('.filters .chip', '.programs__tools', { y: 20, stagger: 0.05 });

    const bars = () => $$('.card:not(.card--end) .progress i').filter((b) => b.offsetParent);

    if (!isDesktop || reduceMotion) {
      reveal('.card', '.programs__viewport', { y: 60, stagger: 0.08 });
      ScrollTrigger.create({
        trigger: viewport, start: 'top 80%', once: true,
        onEnter: () => gsap.from(bars(), { scaleX: 0, duration: 1.6, stagger: 0.08, ease: 'power3.out' })
      });
      programsST = null;
      return () => {};
    }

    section.classList.add('is-pinned');
    const dist = () => {
      const content = viewport.clientWidth - parseFloat(getComputedStyle(viewport).paddingLeft);
      return Math.max(1, track.scrollWidth - content);
    };
    const scrollTween = gsap.to(track, {
      x: () => -dist(),
      ease: 'none',
      scrollTrigger: {
        trigger: '.programs__pin',
        start: 'top top',
        end: () => `+=${dist()}`,
        pin: true,
        scrub: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true
      }
    });
    programsST = scrollTween.scrollTrigger;

    // Thẻ trượt lên khi section xuất hiện
    gsap.from('.card', {
      y: 120, autoAlpha: 0, stagger: 0.07, duration: 1.4,
      scrollTrigger: { trigger: section, start: 'top 70%', once: true }
    });

    // Thanh tiến độ chạy khi từng thẻ lướt vào khung nhìn ngang
    $$('.card:not(.card--end)').forEach((card) => {
      gsap.from($('.progress i', card), {
        scaleX: 0, duration: 1.6, ease: 'power3.out',
        scrollTrigger: { trigger: card, containerAnimation: scrollTween, start: 'left 95%', once: true }
      });
    });

    return () => { section.classList.remove('is-pinned'); programsST = null; };
  }

  function bindFilters() {
    const chips = $$('.chip');
    chips.forEach((chip) => chip.addEventListener('click', () => {
      if (chip.classList.contains('is-active')) return;
      chips.forEach((c) => { c.classList.toggle('is-active', c === chip); c.setAttribute('aria-selected', c === chip); });

      const f = chip.dataset.filter;
      const cards = $$('.card[data-cat]');
      const show = (c) => f === 'all' || c.dataset.cat === f;

      if (!window.gsap) { cards.forEach((c) => { c.style.display = show(c) ? '' : 'none'; }); return; }

      gsap.timeline()
        .to(cards.filter((c) => c.offsetParent), { autoAlpha: 0, y: 30, scale: 0.94, duration: 0.35, stagger: 0.03, ease: 'power2.in' })
        .add(() => {
          cards.forEach((c) => { c.style.display = show(c) ? '' : 'none'; });
          $('.programs__viewport').scrollLeft = 0;
          ScrollTrigger.refresh();
          if (programsST && programsST.isActive) {
            smoother ? smoother.scrollTo(programsST.start, true) : window.scrollTo({ top: programsST.start, behavior: 'smooth' });
          }
        })
        .fromTo(cards.filter(show), { autoAlpha: 0, y: 40, scale: 0.94 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.8, stagger: 0.06, ease: 'expo.out' });
    }));
  }

  /* =========================================================
     TIN TỨC
     ========================================================= */
  function initNews() {
    splitReveal($('#news-title'));

    // Ảnh tin nổi bật mở từ dưới lên, các tin phụ trượt vào lần lượt
    gsap.fromTo('.news-feature__media', { clipPath: 'inset(100% 0% 0% 0%)' }, {
      clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut', clearProps: 'clipPath',
      scrollTrigger: { trigger: '.news-feature', start: 'top 80%', once: true }
    });
    gsap.from('.news-feature__media img', {
      scale: 1.3, duration: 1.8,
      scrollTrigger: { trigger: '.news-feature', start: 'top 80%', once: true }
    });
    reveal($$('.news-feature__body > *'), '.news-feature', { y: 30, delay: 0.4 });
    reveal('.news__list li', '.news__list', { y: 50, stagger: 0.12 });
  }

  /* =========================================================
     ĐƠN VỊ ĐỒNG HÀNH — 2 hàng logo chạy vô tận, ngược chiều
     ========================================================= */
  function initPartners() {
    splitReveal($('#partners-title'));
    reveal('.partners__row', '.partners__rows', { y: 40, stagger: 0.12 });

    const loops = $$('.partners__row').map((row) => {
      const trackEl = $('.partners__track', row);
      // Nhân đôi nội dung để vòng lặp xPercent -50% nối liền mạch
      if (!trackEl.dataset.cloned) {
        [...trackEl.children].forEach((li) => {
          const clone = li.cloneNode(true);
          clone.setAttribute('aria-hidden', 'true');
          trackEl.appendChild(clone);
        });
        trackEl.dataset.cloned = '1';
      }
      if (reduceMotion) return null;

      const reverse = row.classList.contains('partners__row--reverse');
      const loop = gsap.fromTo(trackEl, { xPercent: reverse ? -50 : 0 }, {
        xPercent: reverse ? 0 : -50, duration: 38, ease: 'none', repeat: -1
      });
      // Rê chuột vào thì chậm dần rồi dừng, rời ra thì chạy lại
      row.addEventListener('mouseenter', () => gsap.to(loop, { timeScale: 0, duration: 0.6, overwrite: true }));
      row.addEventListener('mouseleave', () => gsap.to(loop, { timeScale: 1, duration: 0.6, overwrite: true }));
      return loop;
    });

    // Chỉ chạy khi section nằm trong khung nhìn
    ScrollTrigger.create({
      trigger: '.partners__rows', start: 'top bottom', end: 'bottom top',
      onToggle: (self) => loops.forEach((l) => l && (self.isActive ? l.play() : l.pause()))
    });
  }

  /* =========================================================
     BẢNG VÀNG
     ========================================================= */
  function animateBoardIn() {
    const items = $$('.top-card');
    const tl = gsap.timeline();
    tl.from(items, { y: 60, autoAlpha: 0, duration: 1.1, stagger: 0.1 })
      .from('.top-card .medal, .top-card .avatar', { scale: 0, duration: 1, stagger: 0.06, ease: 'back.out(2)' }, 0.2)
      .from('.rank', { y: 30, autoAlpha: 0, duration: 0.8, stagger: 0.05 }, 0.3)
      .from('.rank__bar i', { scaleX: 0, duration: 1.4, stagger: 0.05, ease: 'power3.out' }, 0.5);

    $$('.top-card__amount').forEach((el) => {
      tl.add(countUp(el, +el.dataset.amount, { format: fmtVND, duration: 1.8 }), 0.3);
    });
    $$('.rank__amount').forEach((el, i) => {
      tl.add(countUp(el, +el.dataset.amount, { format: fmtVND, duration: 1.6 }), 0.45 + i * 0.05);
    });
    return tl;
  }

  function placeThumb(btn, instant) {
    const thumb = $('.segmented__thumb');
    const x = btn.offsetLeft - parseFloat(getComputedStyle(thumb.parentElement).paddingLeft);
    const width = btn.offsetWidth;
    if (!window.gsap) { thumb.style.transform = `translateX(${x}px)`; thumb.style.width = `${width}px`; return; }
    if (instant) gsap.set(thumb, { x, width });
    else gsap.to(thumb, { x, width, duration: 0.7, ease: 'expo.inOut' });
  }

  function initBoard() {
    splitReveal($('#board-title'));
    reveal('.segmented', '.board__head', { y: 20 });
    reveal('.board__foot > *', '.board__foot', { y: 20 });

    ScrollTrigger.create({
      trigger: '.top3', start: 'top 80%', once: true,
      onEnter: () => { boardShown = true; animateBoardIn(); }
    });
    // Board trượt lên phủ lên section trước
    gsap.from('.board', {
      yPercent: 6, ease: 'none',
      scrollTrigger: { trigger: '.board', start: 'top bottom', end: 'top 40%', scrub: true }
    });
  }

  function switchBoard(type, btn) {
    if (type === boardType) return;
    boardType = type;
    $$('.segmented__btn').forEach((b) => { b.classList.toggle('is-active', b === btn); b.setAttribute('aria-selected', b === btn); });

    placeThumb(btn);
    if (!window.gsap) { renderBoard(type); return; }
    gsap.timeline()
      .to('.top-card, .rank', { y: -24, autoAlpha: 0, duration: 0.35, stagger: 0.025, ease: 'power2.in' })
      .add(() => { renderBoard(type); if (boardShown) animateBoardIn(); });
  }

  /* =========================================================
     KHỞI TẠO QUỸ — 2 panel
     ========================================================= */
  function initCreate(isDesktop) {
    splitReveal($('#create-title'));
    const panels = $$('.panel');

    gsap.from(panels, {
      yPercent: 25, autoAlpha: 0, rotate: (i) => (i ? 3 : -3), duration: 1.4, stagger: 0.12,
      scrollTrigger: { trigger: '.create__panels', start: 'top 85%', once: true }
    });
    panels.forEach((p) => {
      gsap.fromTo($('.panel__media img', p), { yPercent: -8 }, {
        yPercent: 8, ease: 'none',
        scrollTrigger: { trigger: p, start: 'top bottom', end: 'bottom top', scrub: true }
      });
      reveal($$('.panel__kicker, .panel__title, .panel__list li, .panel .btn', p), p, { y: 30, stagger: 0.06, scrollTrigger: { trigger: p, start: 'top 60%', once: true } });
    });

    if (!isDesktop || reduceMotion) return () => {};

    // Hover: panel được chọn nở rộng, panel kia thu lại
    const wrap = $('.create__panels');
    const onEnter = (e) => {
      const p = e.target.closest('.panel');
      if (!p) return;
      panels.forEach((o) => gsap.to(o, { flexGrow: o === p ? 1.45 : 1, duration: 0.9, ease: 'expo.out', overwrite: 'auto' }));
    };
    const onLeave = () => gsap.to(panels, { flexGrow: 1, duration: 0.9, ease: 'expo.out', overwrite: 'auto' });
    wrap.addEventListener('mouseover', onEnter);
    wrap.addEventListener('mouseleave', onLeave);
    return () => {
      wrap.removeEventListener('mouseover', onEnter);
      wrap.removeEventListener('mouseleave', onLeave);
      gsap.set(panels, { clearProps: 'flexGrow' });
    };
  }

  /* =========================================================
     FOOTER
     ========================================================= */
  function initFooter() {
    splitReveal($('.footer__quote'));
    gsap.from('.footer__circle', {
      scale: 0, rotate: -120, duration: 1.4, ease: 'back.out(1.6)',
      scrollTrigger: { trigger: '.footer__cta', start: 'top 80%', once: true }
    });
    reveal('.footer__grid > div', '.footer__grid', { y: 30 });
    gsap.from('.footer__giant-word', {
      yPercent: 100, duration: 1.4, stagger: 0.12,
      scrollTrigger: { trigger: '.footer__giant', start: 'top 95%', once: true }
    });
    gsap.from('.footer__giant-cross', {
      scale: 0, rotate: -180, duration: 1.5, ease: 'expo.out',
      scrollTrigger: { trigger: '.footer__giant', start: 'top 95%', once: true }
    });
  }

  /* =========================================================
     NAV, PROGRESS, MAGNETIC
     ========================================================= */
  function initChrome() {
    gsap.to('.scroll-progress', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });

    // Ẩn nav khi cuộn xuống, hiện khi cuộn lên
    const nav = $('.nav');
    let hidden = false;
    ScrollTrigger.create({
      start: 0, end: 'max',
      onUpdate: (self) => {
        const hide = self.direction === 1 && self.scroll() > 400;
        if (hide === hidden || document.body.classList.contains('menu-open')) return;
        hidden = hide;
        gsap.to(nav, { yPercent: hide ? -160 : 0, duration: 0.7, ease: 'expo.out', overwrite: 'auto' });
      }
    });

    // Đánh dấu mục đang xem
    $$('.nav__links a[data-scroll]').forEach((a) => {
      const sec = $(a.getAttribute('href'));
      if (!sec) return;
      ScrollTrigger.create({
        trigger: sec, start: 'top 50%', end: 'bottom 50%',
        onToggle: (self) => a.classList.toggle('is-current', self.isActive)
      });
    });

    if (!finePointer || reduceMotion) return;

    // Nút nam châm
    $$('.magnetic').forEach((el) => {
      const mx = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3' });
      const my = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3' });
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        mx((e.clientX - r.left - r.width / 2) * 0.3);
        my((e.clientY - r.top - r.height / 2) * 0.35);
      });
      el.addEventListener('pointerleave', () => {
        gsap.to(el, { x: 0, y: 0, duration: 1, ease: 'elastic.out(1, 0.4)', overwrite: true });
      });
    });
  }

  /* =========================================================
     UI dùng chung (hoạt động cả khi không có GSAP)
     ========================================================= */
  function scrollToTarget(sel) {
    const el = sel === '#top' ? document.body : $(sel);
    if (!el) return;
    if (smoother) smoother.scrollTo(sel === '#top' ? 0 : el, true, 'top top');
    else if (sel === '#top') window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    else el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
  }

  function toast(msg) {
    let t = $('.toast');
    if (!t) {
      t = document.createElement('div');
      t.className = 'toast';
      t.setAttribute('role', 'status');
      document.body.appendChild(t);
    }
    t.textContent = msg;
    if (!window.gsap) { t.style.opacity = 1; setTimeout(() => { t.style.opacity = 0; }, 2600); return; }
    gsap.killTweensOf(t);
    gsap.timeline()
      .fromTo(t, { yPercent: 150, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.7 })
      .to(t, { yPercent: 150, autoAlpha: 0, duration: 0.5, ease: 'power3.in' }, '+=2.4');
  }

  function bindBasicUI() {
    // Cuộn mượt tới anchor
    document.addEventListener('click', (e) => {
      const a = e.target.closest('[data-scroll]');
      if (a) {
        e.preventDefault();
        closeMenu();
        scrollToTarget(a.getAttribute('href'));
        return;
      }
      if (e.target.closest('[data-scroll-top]')) { scrollToTarget('#top'); return; }

      // Tab chưa có trang riêng
      const soon = e.target.closest('[data-soon]');
      if (soon) { e.preventDefault(); closeMenu(); toast(`Trang "${soon.dataset.soon}" đang được cập nhật.`); return; }

      const donate = e.target.closest('[data-donate]');
      if (donate) { e.preventDefault(); toast(`Cảm ơn bạn! Cổng thanh toán cho "${donate.dataset.donate}" sẽ mở tại đây.`); }
    });

    // Segmented bảng vàng
    $$('.segmented__btn').forEach((b) => b.addEventListener('click', () => switchBoard(b.dataset.board, b)));
    bindFilters();

    // Menu mobile
    $('.nav__burger').addEventListener('click', () => (document.body.classList.contains('menu-open') ? closeMenu() : openMenu()));

    // Modal
    bindModal();
  }

  function openMenu() {
    const menu = $('.menu');
    document.body.classList.add('menu-open');
    $('.nav__burger').setAttribute('aria-expanded', 'true');
    menu.setAttribute('aria-hidden', 'false');
    lockScroll(true);
    if (!window.gsap) { menu.style.visibility = 'visible'; menu.style.clipPath = 'none'; return; }
    gsap.timeline()
      .set(menu, { visibility: 'visible' })
      .to(menu, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9, ease: 'expo.inOut' })
      .from('.menu__link, .menu__auth', { yPercent: 100, autoAlpha: 0, stagger: 0.06, duration: 0.9 }, 0.35);
  }

  function closeMenu() {
    if (!document.body.classList.contains('menu-open')) return;
    const menu = $('.menu');
    document.body.classList.remove('menu-open');
    $('.nav__burger').setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-hidden', 'true');
    lockScroll(false);
    if (!window.gsap) { menu.style.visibility = 'hidden'; return; }
    gsap.to(menu, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.8, ease: 'expo.inOut', onComplete: () => gsap.set(menu, { visibility: 'hidden' }) });
  }

  /* =========================================================
     MODAL TẠO QUỸ (form 3 bước)
     ========================================================= */
  function bindModal() {
    const modal = $('.modal');
    const panel = $('.modal__panel');
    const overlay = $('.modal__overlay');
    const form = $('.fund-form');
    const stepsEls = $$('.fund-step', form);
    const dots = $$('.modal__steps li', modal);
    const prevBtn = $('[data-prev]', form);
    const nextBtn = $('[data-next]', form);
    const success = $('.fund-success', form);
    const hasGsap = !!window.gsap;
    let step = 0;
    let opener = null;
    let isOpen = false;

    const TYPES = {
      personal: { kicker: 'Quỹ cá nhân', title: 'Tạo quỹ cá nhân' },
      org: { kicker: 'Quỹ tổ chức', title: 'Tạo quỹ tổ chức' }
    };

    function setType(type) {
      $('#modal-kicker').textContent = TYPES[type].kicker;
      $('#modal-title').textContent = TYPES[type].title;
      $$('[data-only]', form).forEach((f) => {
        const on = f.dataset.only === type;
        f.hidden = !on;
        $$('input, select, textarea', f).forEach((i) => { i.disabled = !on; });
      });
    }

    function updateNav() {
      dots.forEach((d, i) => {
        d.classList.toggle('is-active', i === step);
        d.classList.toggle('is-done', i < step);
      });
      prevBtn.disabled = step === 0;
      $('.btn__text', nextBtn).textContent = step === stepsEls.length - 1 ? 'Gửi hồ sơ' : 'Tiếp tục';
    }

    function showStep(next, dir = 1) {
      const from = stepsEls[step];
      const to = stepsEls[next];
      step = next;
      updateNav();
      if (!hasGsap || reduceMotion) {
        from.classList.remove('is-active'); to.classList.add('is-active');
        return;
      }
      gsap.timeline()
        .to(from, { x: -40 * dir, autoAlpha: 0, duration: 0.3, ease: 'power2.in' })
        .add(() => { from.classList.remove('is-active'); gsap.set(from, { clearProps: 'transform,opacity,visibility' }); to.classList.add('is-active'); })
        .fromTo(to.children, { x: 50 * dir, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.7, stagger: 0.05, ease: 'expo.out' });
    }

    function validate(fieldset) {
      let ok = true;
      $$('input, select, textarea', fieldset).forEach((input) => {
        if (input.disabled) return;
        const wrap = input.closest('.field') || input.closest('.check');
        const valid = input.type === 'checkbox' ? (!input.required || input.checked) : input.checkValidity() && (!input.required || input.value.trim() !== '');
        wrap?.classList.toggle('is-invalid', !valid);
        if (!valid && ok) { ok = false; input.focus({ preventScroll: true }); }
      });
      if (!ok && hasGsap) gsap.fromTo(panel, { x: 0 }, { keyframes: { x: [-10, 10, -6, 6, 0] }, duration: 0.45, ease: 'none' });
      return ok;
    }

    function resetForm() {
      form.reset();
      modal.classList.remove('is-done');
      success.classList.remove('is-active');
      $$('.is-invalid', form).forEach((el) => el.classList.remove('is-invalid'));
      stepsEls.forEach((s, i) => {
        s.classList.toggle('is-active', i === 0);
        if (hasGsap) gsap.set([s, ...s.children], { clearProps: 'transform,opacity,visibility' });
      });
      if (hasGsap) gsap.set($$('*', success), { clearProps: 'transform,opacity,visibility' });
      step = 0;
      updateNav();
    }

    function open(type, btn) {
      if (isOpen) return;
      isOpen = true;
      opener = btn;
      resetForm();
      setType(type);
      modal.setAttribute('aria-hidden', 'false');
      lockScroll(true);
      if (!hasGsap || reduceMotion) {
        modal.style.visibility = 'visible'; overlay.style.opacity = 1; panel.style.transform = 'none';
      } else {
        gsap.timeline()
          .set(modal, { visibility: 'visible' })
          .to(overlay, { opacity: 1, duration: 0.5, ease: 'power2.out' })
          .fromTo(panel, { xPercent: 110 }, { xPercent: 0, x: 0, duration: 1, ease: 'expo.out' }, 0)
          .from($$('.modal__top > *, .modal__steps li', panel), { y: 30, autoAlpha: 0, stagger: 0.05, duration: 0.8 }, 0.25)
          .from(stepsEls[0].children, { y: 30, autoAlpha: 0, stagger: 0.05, duration: 0.8 }, 0.35);
      }
      setTimeout(() => $('input:not([disabled])', stepsEls[0])?.focus({ preventScroll: true }), 450);
    }

    function close() {
      if (!isOpen) return;
      isOpen = false;
      modal.setAttribute('aria-hidden', 'true');
      const done = () => { modal.style.visibility = 'hidden'; lockScroll(false); opener?.focus({ preventScroll: true }); };
      if (!hasGsap || reduceMotion) { overlay.style.opacity = 0; done(); return; }
      gsap.timeline({ onComplete: done })
        .to(panel, { xPercent: 110, duration: 0.7, ease: 'expo.in' })
        .to(overlay, { opacity: 0, duration: 0.4 }, 0.3);
    }

    function submit() {
      modal.classList.add('is-done');
      dots.forEach((d) => { d.classList.remove('is-active'); d.classList.add('is-done'); });
      const last = stepsEls[step];
      const showSuccess = () => {
        last.classList.remove('is-active');
        success.classList.add('is-active');
        if (!hasGsap) return;
        const circle = $('circle', success);
        const tick = $('path', success);
        [circle, tick].forEach((p) => { const l = p.getTotalLength(); gsap.set(p, { strokeDasharray: l, strokeDashoffset: l }); });
        gsap.timeline()
          .to(circle, { strokeDashoffset: 0, duration: 0.9, ease: 'power2.inOut' })
          .to(tick, { strokeDashoffset: 0, duration: 0.5, ease: 'power3.out' }, '-=0.2')
          .from($$('h4, p, .btn', success), { y: 24, autoAlpha: 0, stagger: 0.08, duration: 0.8 }, 0.3);
      };
      if (hasGsap) gsap.to(last, { autoAlpha: 0, y: -20, duration: 0.3, onComplete: showSuccess });
      else showSuccess();
    }

    $$('[data-open]').forEach((b) => b.addEventListener('click', () => open(b.dataset.open, b)));
    $$('[data-close]', modal).forEach((b) => b.addEventListener('click', close));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { close(); closeMenu(); }
    });
    nextBtn.addEventListener('click', () => {
      if (!validate(stepsEls[step])) return;
      if (step < stepsEls.length - 1) showStep(step + 1, 1);
      else submit();
    });
    prevBtn.addEventListener('click', () => { if (step > 0) showStep(step - 1, -1); });
    form.addEventListener('submit', (e) => e.preventDefault());
    form.addEventListener('input', (e) => {
      e.target.closest('.is-invalid')?.classList.remove('is-invalid');
      if (e.target.name === 'goal') {
        const digits = e.target.value.replace(/\D/g, '');
        e.target.value = digits ? Number(digits).toLocaleString('vi-VN') : '';
      }
    });
  }

  /* =========================================================
     BOOT
     ========================================================= */
  bindBasicUI();
  placeThumb($('.segmented__btn.is-active'), true);

  runPreloader().then(() => {
    // Hero & các phần chung
    initHero();
    initMarquee();
    initRelief();

    // Các phần phụ thuộc kích thước — tự dựng lại khi đổi breakpoint
    const mm = gsap.matchMedia();
    mm.add({ isDesktop: '(min-width: 901px)', isMobile: '(max-width: 900px)' }, (ctx) => {
      const { isDesktop } = ctx.conditions;
      const cleanups = [initPrograms(isDesktop)];
      initNews();
      initPartners();
      initBoard();
      cleanups.push(initCreate(isDesktop));
      initFooter();
      return () => cleanups.forEach((fn) => fn && fn());
    });

    initChrome();
    placeThumb($('.segmented__btn.is-active'), true);
    window.addEventListener('resize', () => placeThumb($('.segmented__btn.is-active'), true));
    ScrollTrigger.refresh();

    // Nhảy tới anchor nếu mở trang bằng link có #hash
    if (location.hash && $(location.hash)) gsap.delayedCall(0.3, () => scrollToTarget(location.hash));
  });
})();
