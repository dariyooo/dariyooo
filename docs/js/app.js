/* ---------- boot ---------- */
async function boot() {
  let c;
  try {
    const res = await fetch('data/content.json', { cache: 'no-store' });
    c = await res.json();
  } catch (e) {
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
