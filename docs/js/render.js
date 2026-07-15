/* ---------- Section renderers ---------- */
const KICK = 'margin:0 0 12px;font-size:13px;letter-spacing:0.2em;font-weight:700;color:var(--accent,#3563A8);';
const H2 = "font-family:'Zen Maru Gothic',sans-serif;font-weight:700;font-size:clamp(28px,4.4vw,46px);letter-spacing:-0.01em;";
const SECPAD = 'max-width:1120px;margin:0 auto;padding:clamp(70px,10vw,120px) clamp(20px,5vw,56px);';

function statChip(s) {
  return `<span style="display:inline-flex;align-items:baseline;gap:5px;padding:6px 12px;border-radius:10px;background:#EEF1F6;border:1px solid rgba(35,39,51,0.06);"><span style="font-family:'Zen Maru Gothic',sans-serif;font-weight:900;font-size:15px;color:#232733;">${s.value}</span><span style="font-size:11px;font-weight:600;color:#949AA6;">${s.label}</span></span>`;
}
function workIcon(icon) {
  if (icon && icon.type === 'img') return `<img src="${icon.src}" alt="" style="flex:none;width:44px;height:44px;border-radius:12px;object-fit:contain;display:block;">`;
  return `<span style="flex:none;display:grid;place-items:center;width:44px;height:44px;font-family:'Zen Maru Gothic',sans-serif;font-weight:900;font-size:38px;color:#232733;">${(icon && icon.char) || ''}</span>`;
}

function renderNav(c) {
  const el = document.getElementById('nav');
  if (!el) return;
  const links = c.nav.map(n => `<a href="${n.href}" class="navlink" style="font-size:15px;font-weight:500;">${n.label}</a>`).join('');
  el.innerHTML = `
    <a href="#top" style="display:flex;align-items:center;gap:11px;font-family:'Zen Maru Gothic',sans-serif;font-weight:700;font-size:20px;color:#232733;">
      <img src="${c.brand.avatar}" alt="${c.brand.name}" style="width:34px;height:34px;border-radius:11px;object-fit:cover;display:block;box-shadow:0 3px 0 rgba(35,39,51,0.15);">
      ${c.brand.name}
    </a>
    <div style="display:flex;align-items:center;gap:clamp(12px,2.4vw,30px);">
      ${links}
      <a href="${c.brand.githubUrl}" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:6px;padding:8px 15px;border-radius:999px;background:var(--accent,#3563A8);color:#fff;font-weight:700;font-size:15px;">GitHub &#8599;</a>
    </div>`;
}

function renderHero(c) {
  document.getElementById('hero-eyebrow').textContent = c.hero.eyebrow;
  document.getElementById('intro1').textContent = c.hero.intro1;
  document.getElementById('intro2').textContent = c.hero.intro2;
  document.getElementById('hero-title').innerHTML = c.hero.title.replace('Dario', '<span style="color:var(--accent-2,#3E8A6E);font-family:\'Luckiest Guy\',cursive;font-weight:400;">Dario</span>');
  document.getElementById('hero-sub').textContent = c.hero.subtitle;
}

function aboutSection(a) {
  return `<section id="about" class="g-about" style="${SECPAD}display:grid;grid-template-columns:0.85fr 1.15fr;gap:clamp(30px,5vw,70px);align-items:center;">
    <div class="about-wrap" style="position:relative;width:min(100%,300px);">
      <div class="about-img" style="position:relative;width:100%;aspect-ratio:1;border-radius:28px;overflow:hidden;background:#E9ECF1;box-shadow:0 20px 50px rgba(35,39,51,0.14);border:1px solid rgba(35,39,51,0.08);">
        <img src="${a.avatar}" alt="portrait" style="width:100%;height:100%;object-fit:cover;display:block;">
      </div>
      <span style="position:absolute;transform:rotate(-8deg);right:-6px;bottom:-14px;display:grid;place-items:center;width:74px;height:74px;border-radius:20px;background:var(--accent,#3563A8);color:#fff;font-family:'Zen Maru Gothic',sans-serif;font-weight:900;font-size:32px;box-shadow:0 8px 20px rgba(53,99,168,0.35);">${a.badge}</span>
    </div>
    <div>
      <p style="${KICK}">${a.num} &middot; ${a.kicker}</p>
      <h2 style="margin:0 0 22px;font-family:'Zen Maru Gothic',sans-serif;font-weight:700;font-size:clamp(26px,3.8vw,40px);line-height:1.18;letter-spacing:-0.01em;">${a.heading}</h2>
      ${a.paras.map((p, i) => `<p style="margin:0 0 ${i < a.paras.length - 1 ? '16px' : '0'};font-size:17px;line-height:1.72;color:#626875;">${p}</p>`).join('')}
      <div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:26px;">
        ${a.tags.map(t => `<span style="display:inline-flex;align-items:center;gap:7px;padding:8px 14px;border-radius:999px;background:#FFFFFF;border:1px solid rgba(35,39,51,0.1);font-size:14px;font-weight:600;">${t}</span>`).join('')}
      </div>
    </div>
  </section>`;
}

function workSection(w) {
  const cards = w.items.map(it => `
    <a href="${it.url}" target="_blank" rel="noopener" class="card-lift" style="display:flex;flex-direction:column;gap:16px;padding:28px;border-radius:22px;background:#FFFFFF;border:1px solid rgba(35,39,51,0.09);color:#232733;">
      <div style="display:flex;align-items:center;justify-content:space-between;">
        <span style="display:inline-flex;align-items:center;gap:7px;font-size:13px;font-weight:600;color:#626875;"><span style="width:11px;height:11px;border-radius:50%;background:${it.langColor};"></span>${it.lang}</span>
        <span style="font-size:13px;font-weight:700;color:#949AA6;">${it.stars}</span>
      </div>
      <div style="display:flex;align-items:center;gap:11px;">
        ${workIcon(it.icon)}
        <h3 style="margin:0;font-family:'Zen Maru Gothic',sans-serif;font-weight:700;font-size:23px;">${it.name}</h3>
      </div>
      <p style="margin:0;font-size:15px;line-height:1.6;color:#626875;flex:1;">${it.desc}</p>
      <div style="display:flex;flex-wrap:wrap;gap:8px;">${it.stats.map(statChip).join('')}</div>
      <span style="font-size:14px;font-weight:700;color:var(--accent,#3563A8);">${it.footer}</span>
    </a>`).join('');
  return `<section id="work" style="background:#E9ECF1;border-top:1px solid rgba(35,39,51,0.07);border-bottom:1px solid rgba(35,39,51,0.07);">
    <div style="${SECPAD}">
      <div style="display:flex;align-items:flex-end;justify-content:space-between;flex-wrap:wrap;gap:16px;margin-bottom:44px;">
        <div>
          <p style="${KICK}">${w.num} &middot; ${w.kicker}</p>
          <h2 style="margin:0;${H2}">${w.heading}</h2>
        </div>
        <a href="${w.linkUrl}" target="_blank" rel="noopener" style="font-weight:700;font-size:15px;">${w.linkLabel}</a>
      </div>
      <div class="g-work" style="display:grid;grid-template-columns:repeat(2,1fr);gap:22px;">${cards}</div>
    </div>
  </section>`;
}

function toolkitSection(t) {
  const cats = t.categories.map(cat => `
    <div style="display:flex;flex-direction:column;gap:16px;padding:28px;border-radius:20px;background:#FFFFFF;border:1px solid rgba(35,39,51,0.09);box-shadow:0 1px 0 rgba(35,39,51,0.03);">
      <div style="display:flex;align-items:center;gap:13px;">
        <span style="flex:none;display:grid;place-items:center;width:46px;height:46px;border-radius:14px;background:${cat.markBg};color:#fff;font-family:'Zen Maru Gothic',sans-serif;font-weight:900;font-size:22px;">${cat.mark}</span>
        <div style="display:flex;flex-direction:column;gap:1px;">
          <span style="font-size:11px;font-weight:700;letter-spacing:0.14em;color:#949AA6;">${cat.jp}</span>
          <span style="font-family:'Zen Maru Gothic',sans-serif;font-weight:700;font-size:19px;line-height:1.15;color:#232733;">${cat.en}</span>
        </div>
      </div>
      <p style="margin:0;font-size:14.5px;line-height:1.55;color:#626875;">${cat.desc}</p>
      <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:auto;padding-top:4px;">
        ${cat.items.map(tool => `<span style="padding:6px 13px;border-radius:999px;background:#EEF1F6;border:1px solid rgba(35,39,51,0.06);font-size:13px;font-weight:600;color:#3A4150;">${tool}</span>`).join('')}
      </div>
    </div>`).join('');
  return `<section id="toolkit" style="${SECPAD}">
    <p style="${KICK}">${t.num} &middot; ${t.kicker}</p>
    <h2 style="margin:0 0 16px;${H2}max-width:640px;">${t.heading}</h2>
    <p style="margin:0 0 44px;max-width:580px;font-size:17px;line-height:1.6;color:#626875;">${t.intro}</p>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px;">${cats}</div>
  </section>`;
}

function experienceSection(e) {
  const roles = e.roles.map(r => `
    <div style="display:grid;grid-template-columns:minmax(150px,210px) 1fr;gap:clamp(16px,3vw,32px);padding:28px;border-radius:20px;background:#FFFFFF;border:1px solid rgba(35,39,51,0.09);">
      <div>
        <div style="font-family:'Zen Maru Gothic',sans-serif;font-weight:700;font-size:18px;color:#232733;">${r.company}</div>
        <div style="font-size:13px;font-weight:600;color:#949AA6;margin-top:3px;">${r.meta}</div>
      </div>
      <div>
        <div style="font-weight:700;font-size:17px;color:#232733;">${r.title}</div>
        <ul style="margin:10px 0 0;padding-left:18px;color:#626875;font-size:15px;line-height:1.6;">${r.bullets.map(b => `<li>${b}</li>`).join('')}</ul>
      </div>
    </div>`).join('');
  return `<section id="experience" style="${SECPAD}">
    <p style="${KICK}">${e.num} &middot; ${e.kicker}</p>
    <h2 style="margin:0 0 44px;${H2}">${e.heading}</h2>
    <div class="g-exp" style="display:flex;flex-direction:column;gap:18px;">${roles}</div>
  </section>`;
}

function creditsSection(cr) {
  const langs = cr.languages.map(l => `
    <div>
      <div style="display:flex;justify-content:space-between;margin-bottom:8px;"><span style="font-weight:700;font-size:16px;">${l.name}</span><span style="font-size:13px;font-weight:600;color:#949AA6;">${l.meta}</span></div>
      <div style="height:8px;border-radius:999px;background:#DEE3EA;overflow:hidden;"><div style="height:100%;width:${l.level}%;border-radius:999px;background:var(--accent,#3563A8);"></div></div>
    </div>`).join('');
  const achs = cr.achievements.map(a => `
    <div style="display:flex;gap:14px;align-items:flex-start;">
      <span style="flex:none;display:grid;place-items:center;width:34px;height:34px;border-radius:10px;background:var(--accent-2,#3E8A6E);color:#fff;font-family:'Zen Maru Gothic',sans-serif;font-weight:900;font-size:15px;">${a.mark}</span>
      <div>
        <div style="font-weight:700;font-size:16px;line-height:1.3;">${a.title}</div>
        <div style="font-size:14px;color:#626875;line-height:1.45;">${a.desc}</div>
      </div>
    </div>`).join('');
  return `<section id="credits" style="${SECPAD}">
    <p style="${KICK}">${cr.num} &middot; ${cr.kicker}</p>
    <h2 style="margin:0 0 44px;${H2}">${cr.heading}</h2>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:clamp(32px,5vw,64px);">
      <div>
        <h3 style="margin:0 0 24px;font-family:'Zen Maru Gothic',sans-serif;font-weight:700;font-size:20px;">語学 <span style="color:#949AA6;font-weight:500;">Languages</span></h3>
        <div style="display:flex;flex-direction:column;gap:20px;">${langs}</div>
      </div>
      <div>
        <h3 style="margin:0 0 24px;font-family:'Zen Maru Gothic',sans-serif;font-weight:700;font-size:20px;">実績 <span style="color:#949AA6;font-weight:500;">Achievements</span></h3>
        <div style="display:flex;flex-direction:column;gap:16px;">${achs}</div>
      </div>
    </div>
  </section>`;
}

function openSourceSection(o) {
  return `<section id="opensource" style="background:#E9ECF1;border-top:1px solid rgba(35,39,51,0.07);border-bottom:1px solid rgba(35,39,51,0.07);">
    <div style="${SECPAD}">
      <div style="display:flex;align-items:flex-end;justify-content:space-between;flex-wrap:wrap;gap:16px;margin-bottom:14px;">
        <div>
          <p style="${KICK}">${o.num} &middot; ${o.kicker}</p>
          <h2 style="margin:0;${H2}">${o.heading}</h2>
        </div>
        <a href="${o.linkUrl}" target="_blank" rel="noopener" style="font-weight:700;font-size:15px;">${o.linkLabel}</a>
      </div>
      <p style="margin:0 0 36px;max-width:620px;font-size:17px;line-height:1.6;color:#626875;">${o.intro}</p>
      <div id="os-body"></div>
    </div>
  </section>`;
}

function contactSection(c) {
  const btns = c.buttons.map(b => b.primary
    ? `<a href="${b.url}" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:9px;padding:15px 26px;border-radius:999px;background:var(--accent,#3563A8);color:#fff;font-weight:700;font-size:16px;">${b.label}</a>`
    : `<a href="${b.url}" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:9px;padding:15px 26px;border-radius:999px;background:transparent;border:1.5px solid rgba(245,246,248,0.35);color:#F5F6F8;font-weight:700;font-size:16px;">${b.label}</a>`).join('');
  return `<section id="contact" style="position:relative;overflow:hidden;background:#232733;color:#F5F6F8;">
    <span style="position:absolute;top:-30px;right:2%;font-size:clamp(160px,26vw,340px);font-weight:900;color:rgba(53,99,168,0.14);font-family:'Zen Maru Gothic',sans-serif;pointer-events:none;line-height:1;">${c.watermark}</span>
    <div style="position:relative;max-width:1120px;margin:0 auto;padding:clamp(80px,11vw,140px) clamp(20px,5vw,56px);">
      <p style="${KICK}">${c.num} &middot; ${c.kicker}</p>
      <h2 style="margin:0 0 30px;font-family:'Zen Maru Gothic',sans-serif;font-weight:900;font-size:clamp(34px,6vw,68px);line-height:1.05;letter-spacing:-0.01em;max-width:760px;">${c.heading}</h2>
      <div style="display:flex;flex-wrap:wrap;gap:14px;">${btns}</div>
    </div>
    <div style="position:relative;border-top:1px solid rgba(245,246,248,0.12);">
      <div style="max-width:1120px;margin:0 auto;padding:22px clamp(20px,5vw,56px);display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:space-between;font-size:13px;color:rgba(245,246,248,0.55);">
        <span>${c.footerLeft}</span>
        <span>${c.footerRight}</span>
      </div>
    </div>
  </section>`;
}

/* ---------- Open-source (live GitHub) ---------- */
const OS = { state: 'loading', contribs: [], total: 0, repoCount: 0, page: 0, error: '', cfg: null };

async function fetchContribs(o) {
  OS.cfg = o;
  renderOS();
  try {
    const q = encodeURIComponent('type:pr author:' + o.githubUser + ' -user:' + o.githubUser);
    const res = await fetch('https://api.github.com/search/issues?q=' + q + '&sort=created&order=desc&per_page=40', { headers: { Accept: 'application/vnd.github+json' } });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    const repos = new Set();
    OS.contribs = (data.items || []).map(it => {
      const repo = (it.repository_url || '').replace('https://api.github.com/repos/', '');
      repos.add(repo);
      return { repo, title: it.title, url: it.html_url, number: it.number, date: (it.created_at || '').slice(0, 7).replace('-', '.') };
    });
    OS.total = data.total_count || OS.contribs.length;
    OS.repoCount = repos.size;
    OS.state = OS.contribs.length ? 'ok' : 'empty';
  } catch (e) { OS.state = 'error'; OS.error = e.message; }
  renderOS();
}

function renderOS() {
  const el = document.getElementById('os-body');
  if (!el) return;
  const o = OS.cfg || {};
  const seeAll = `<a href="${o.linkUrl}" target="_blank" rel="noopener" style="font-weight:700;">See them on GitHub &#8599;</a>`;
  if (OS.state === 'loading') {
    el.innerHTML = `<div style="display:flex;align-items:center;gap:12px;color:#949AA6;font-size:15px;font-weight:500;"><span style="width:16px;height:16px;border-radius:50%;border:2px solid rgba(35,39,51,0.18);border-top-color:var(--accent,#3563A8);display:inline-block;animation:spin 0.8s linear infinite;"></span>Fetching contributions from GitHub&hellip;</div>`;
    return;
  }
  if (OS.state === 'empty') { el.innerHTML = `<p style="margin:0;font-size:16px;color:#626875;">No external pull requests came back (GitHub's API may be rate-limiting anonymous requests). ${seeAll}</p>`; return; }
  if (OS.state === 'error') { el.innerHTML = `<p style="margin:0;font-size:16px;color:#626875;">Couldn't reach GitHub right now (${OS.error}). ${seeAll}</p>`; return; }
  const size = o.pageSize || 9;
  const pageTotal = Math.max(1, Math.ceil(OS.contribs.length / size));
  const page = Math.min(OS.page, pageTotal - 1);
  const slice = OS.contribs.slice(page * size, page * size + size);
  const cards = slice.map(c => `
    <a href="${c.url}" target="_blank" rel="noopener" class="os-card" style="display:flex;flex-direction:column;gap:10px;padding:20px 22px;border-radius:16px;background:#FFFFFF;border:1px solid rgba(35,39,51,0.09);color:#232733;">
      <span style="font-size:13px;font-weight:700;color:#626875;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${c.repo}</span>
      <span style="font-family:'Zen Maru Gothic',sans-serif;font-weight:500;font-size:16px;line-height:1.4;color:#232733;">${c.title}</span>
      <span style="font-size:12px;font-weight:600;color:#949AA6;">#${c.number} &middot; ${c.date}</span>
    </a>`).join('');
  const pager = pageTotal > 1 ? `
    <div style="display:flex;align-items:center;justify-content:center;gap:18px;margin-top:34px;">
      <button id="os-prev" class="pgbtn" style="padding:10px 18px;border-radius:999px;background:#FFFFFF;border:1px solid rgba(35,39,51,0.14);color:#232733;font-family:inherit;font-weight:700;font-size:14px;cursor:pointer;">&larr; Prev</button>
      <span style="font-size:14px;font-weight:700;color:#626875;">${page + 1} / ${pageTotal}</span>
      <button id="os-next" class="pgbtn" style="padding:10px 18px;border-radius:999px;background:#FFFFFF;border:1px solid rgba(35,39,51,0.14);color:#232733;font-family:inherit;font-weight:700;font-size:14px;cursor:pointer;">Next &rarr;</button>
    </div>` : '';
  el.innerHTML = `
    <div style="display:flex;flex-wrap:wrap;gap:26px;margin-bottom:30px;">
      <div style="display:flex;flex-direction:column;gap:2px;"><span style="font-family:'Zen Maru Gothic',sans-serif;font-weight:900;font-size:34px;color:var(--accent,#3563A8);line-height:1;">${OS.total}</span><span style="font-size:13px;font-weight:600;color:#626875;">pull requests</span></div>
      <div style="display:flex;flex-direction:column;gap:2px;"><span style="font-family:'Zen Maru Gothic',sans-serif;font-weight:900;font-size:34px;color:#232733;line-height:1;">${OS.repoCount}</span><span style="font-size:13px;font-weight:600;color:#626875;">repositories</span></div>
    </div>
    <div class="g-os" style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;">${cards}</div>${pager}`;
  const prev = document.getElementById('os-prev'), next = document.getElementById('os-next');
  if (prev) prev.onclick = () => { OS.page = Math.max(0, page - 1); renderOS(); };
  if (next) next.onclick = () => { OS.page = Math.min(pageTotal - 1, page + 1); renderOS(); };
}
