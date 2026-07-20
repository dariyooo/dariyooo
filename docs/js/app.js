/* ---------- intro animation ---------- */
/* The hero animation is CSS, but it may only start once the text it animates
   actually exists (content.json fetched) and its font is loaded - otherwise a
   slow first load eats the animation and it looks skipped. */
function playIntro() {
  const top = document.getElementById('top');
  if (top.classList.contains('intro-play')) return;
  requestAnimationFrame(() => top.classList.add('intro-play'));
}
async function startIntroWhenReady() {
  const fonts = document.fonts
    ? Promise.all([
        document.fonts.load("400 60px 'Luckiest Guy'"),
        document.fonts.load("900 40px 'Zen Maru Gothic'"),
      ]).catch(() => {})
    : Promise.resolve();
  // never let a hanging font request hold the page hostage
  await Promise.race([fonts, new Promise(r => setTimeout(r, 1200))]);
  playIntro();
}

/* ---------- boot ---------- */
async function boot() {
  let c;
  try {
    const res = await fetch('data/content.json', { cache: 'no-store' });
    c = await res.json();
  } catch (e) {
    playIntro(); // don't leave the veil covering the page
    document.getElementById('sections').innerHTML = '<p style="max-width:600px;margin:120px auto;text-align:center;color:#626875;font-size:16px;">Could not load <b>data/content.json</b>. Serve this folder over HTTP (e.g. <code>python3 -m http.server</code>) rather than opening the file directly.</p>';
    return;
  }
  const top = document.getElementById('top');
  top.style.setProperty('--accent', c.theme.accent);
  top.style.setProperty('--accent-2', c.theme.accent2);
  renderNav(c);
  renderHero(c);
  document.getElementById('sections').innerHTML =
    aboutSection(c.about) + workSection(c.work) + toolkitSection(c.toolkit) +
    experienceSection(c.experience) + creditsSection(c.credits) +
    openSourceSection(c.opensource) + contactSection(c.contact);
  startIntroWhenReady();
  fetchContribs(c.opensource);

  const faceCanvas = document.getElementById('dario-face-canvas');
  const fieldCanvas = document.getElementById('kanji-field');
  window.__field = new Field(fieldCanvas, faceCanvas); window.__field.init();
  const head = new Head(faceCanvas, c.character.model, c.character.texture);
  let tries = 0;
  (function waitThree() {
    if (window.THREE) head.init3D();
    else if (tries++ < 400) requestAnimationFrame(waitThree);
  })();
}
boot();
// hard safety net: if boot() dies unexpectedly, still reveal the page
setTimeout(playIntro, 6000);
