/*
 * Streaming Gear Budget Builder - standalone version of
 * https://streamgearlab.com/tools/streaming-gear-budget-builder/
 * Part of StreamGearLab's free tools (https://streamgearlab.com). MIT License.
 */
(function () {
  'use strict';
  var usd = function (n) { return '$' + Math.round(n).toLocaleString('en-US'); };

  // Approximate US street-price ranges for NEW gear in each category (planning estimates, not quotes).
  var AUDIO = [
    { name: 'Budget USB dynamic microphone', lo: 30, hi: 60, typ: 45, what: 'Plug-and-play USB mic. Choose a dynamic capsule and keep it close to your mouth.' },
    { name: 'Better USB (or USB/XLR hybrid) dynamic mic + desk boom arm', lo: 70, hi: 170, typ: 120, what: 'A boom arm puts the mic close to your mouth and out of the camera shot. A hybrid mic can move to XLR later.' },
    { name: 'XLR dynamic mic + 1-channel USB audio interface + boom arm', lo: 180, hi: 350, typ: 265, what: 'A proper interface gives you a gain knob, a headphone output and room to upgrade the mic later.' },
    { name: 'Broadcast XLR dynamic mic + interface with plenty of clean gain + boom arm', lo: 350, hi: 650, typ: 500, what: 'The radio-style sound. Low-output broadcast mics need a lot of gain, so pair one with a strong interface or an inline preamp.' },
  ];
  var VIDEO = [
    { name: 'Phone or the webcam you already have', lo: 0, hi: 0, typ: 0, what: 'Modern phones make good webcams (Continuity Camera on Mac, Phone Link on Windows, or a webcam app). Put the money into light first.' },
    { name: '1080p webcam', lo: 40, hi: 100, typ: 70, what: 'A clear step up from laptop cameras. Look for 1080p at 30 fps or better, and adjustable exposure.' },
    { name: 'Premium webcam (1080p60 or 4K, larger sensor)', lo: 100, hi: 250, typ: 175, what: 'Better in low light, with sharper focus and software controls. Still a single USB cable.' },
    { name: 'Mirrorless camera with clean HDMI + capture card + dummy battery', lo: 500, hi: 1200, typ: 650, what: 'Background blur and a much better image, but more setup. Check the camera outputs clean HDMI and can run continuously. Used bodies cost less.' },
  ];
  var CAMERA_OWNED = { name: 'Capture card + dummy battery for your camera', lo: 60, hi: 200, typ: 120, what: 'Turns your existing camera into a webcam. Confirm it has clean HDMI output (or webcam-over-USB support) first.' };
  var LIGHT = [
    { name: 'Daylight-bulb desk lamp + white foam board bounce', lo: 15, hi: 40, typ: 28, what: 'Bounce the lamp off the board, or a wall, in front of you for soft light that costs almost nothing.' },
    { name: 'One dimmable bi-color LED key light with diffusion', lo: 40, hi: 120, typ: 80, what: "Place it at about 45° in front of you, slightly above eye level. Bi-color lets you match the room's colour temperature." },
    { name: 'Key + fill: two bi-color panels or small softboxes', lo: 100, hi: 250, typ: 175, what: 'A second, dimmer light on the other side softens shadows.' },
    { name: 'Large softbox key + fill + RGB backlight or background accent', lo: 250, hi: 500, typ: 375, what: 'A backlight separates you from the background, and a coloured accent gives the "streamer look".' },
  ];
  var HEADPHONES = { name: 'Closed-back headphones', lo: 30, hi: 100, typ: 65, what: 'Stop game audio and alerts leaking from speakers into your mic.' };
  var TREATMENT = { name: 'Soft furnishings: rug, heavy curtains or moving blankets', lo: 30, hi: 120, typ: 60, what: 'Soft surfaces near you and behind the mic cut echo more than a pricier mic would.' };

  var form = document.getElementById('gear-form');
  var out = document.getElementById('gear-results');
  var range = document.getElementById('budget');
  var bOut = document.getElementById('budget-out');

  function compute() {
    var fd = new FormData(form);
    var budget = parseInt(String(fd.get('budget')), 10);
    var prio = String(fd.get('prio'));
    var room = String(fd.get('room'));
    var cam = String(fd.get('cam')) === 'yes';
    var own = new Set(fd.getAll('own').map(String));
    bOut.textContent = budget >= 2000 ? '$2,000+' : usd(budget);

    var ladders = {
      audio: AUDIO,
      video: !cam ? [] : own.has('camera') ? [VIDEO[0], CAMERA_OWNED] : own.has('webcam') ? [VIDEO[0], VIDEO[2], VIDEO[3]] : VIDEO,
      lighting: cam ? LIGHT : [],
      extras: own.has('headphones') ? [] : [Object.assign({}, HEADPHONES, { typ: 0, lo: 0, hi: 0, name: '' }), HEADPHONES],
    };
    var lvl = { audio: 0, video: 0, lighting: 0, extras: 0 };
    var fixed = [];
    if (room === 'echo') fixed.push(TREATMENT);
    if (room === 'dark' && cam && budget >= 150) lvl.lighting = 1; // a real key light first in a dark room
    var cost = function () {
      return Object.keys(ladders).reduce(function (s, k) { var it = ladders[k][lvl[k]]; return s + (it ? it.typ : 0); }, 0) + fixed.reduce(function (s, i) { return s + i.typ; }, 0);
    };
    var base = prio === 'balanced' ? ['audio', 'lighting', 'video'] : prio === 'audio' ? ['audio', 'audio', 'lighting', 'video'] : prio === 'video' ? ['video', 'video', 'lighting', 'audio'] : ['lighting', 'lighting', 'audio', 'video'];
    var order = base.concat(['extras']);
    // Priority pre-pass: let the priority category climb first, up to ~65% of the budget.
    if (prio !== 'balanced') {
      var L0 = ladders[prio];
      while (lvl[prio] + 1 < L0.length && L0[lvl[prio] + 1].typ <= budget * 0.65 && cost() + L0[lvl[prio] + 1].typ - L0[lvl[prio]].typ <= budget) lvl[prio]++;
    }
    var changed = true;
    while (changed) {
      changed = false;
      for (var i = 0; i < order.length; i++) {
        var k = order[i];
        var L = ladders[k];
        if (lvl[k] + 1 >= L.length) continue;
        var next = L[lvl[k] + 1].typ - L[lvl[k]].typ;
        if (cost() + next <= budget) { lvl[k]++; changed = true; }
      }
    }
    var picks = [];
    var catName = { audio: 'Microphone & audio', video: 'Camera', lighting: 'Lighting', extras: 'Monitoring' };
    ['audio', 'video', 'lighting', 'extras'].forEach(function (k) {
      var it = ladders[k][lvl[k]];
      if (it && it.name) picks.push({ cat: catName[k], item: it });
    });
    fixed.forEach(function (it) { picks.push({ cat: 'Room', item: it }); });
    var lo = picks.reduce(function (s, p) { return s + p.item.lo; }, 0), hi = picks.reduce(function (s, p) { return s + p.item.hi; }, 0), typ = cost();

    var notes = [];
    if (room === 'treated' && lvl.audio >= 2) notes.push('Your room is quiet and treated, so a condenser microphone (USB, or XLR with phantom power) is a reasonable alternative to the dynamic mic suggested here.');
    if (room === 'noisy') notes.push("Shared or noisy space: keep the dynamic mic 5–10 cm from your mouth and add OBS's free Noise Suppression filter (RNNoise). See our <a href=\"https://streamgearlab.com/guides/reduce-background-noise-in-obs/\">background noise guide</a>.");
    if (room === 'window') notes.push('Bright window: face it, or put it to your side, rather than having it behind you. Window light makes a great free key light, and curtains or blinds help on sunny days.');
    if (room === 'echo') notes.push('Echoey room: the soft furnishings are listed first on purpose. Treat the room before buying a more sensitive mic.');
    if (!cam) notes.push('No face cam, so the budget goes into audio. Many VTuber setups also need a webcam for face tracking. Switch Face cam to "Yes" if yours does.');
    if (budget < 150 && cam) notes.push('At this budget, use your phone as the camera and a lamp for light. Add a key light next; it does more than a webcam upgrade.');
    if (budget - typ > 50) notes.push('About ' + usd(budget - typ) + ' is left over. Keep it for cables, a pop filter or foam windscreen, or the next upgrade on the list.');

    var card = function (p) {
      var price = p.item.hi === 0 ? 'Free (already own)' : '≈ ' + usd(p.item.lo) + '–' + usd(p.item.hi);
      return '<div class="gear-item"><span class="card-cat">' + p.cat + '</span><h3>' + p.item.name + '</h3><span class="price">' + price + ' <span class="small muted">approx.</span></span><p>' + p.item.what + '</p></div>';
    };
    out.innerHTML = '<div class="result-summary"><p class="small muted">Your ' + bOut.textContent + ' plan</p><p class="big-number">≈ ' + usd(lo) + '–' + usd(hi) + '</p><p>Typical total about <strong>' + usd(typ) + '</strong> for the categories below.' + (typ > budget ? ' <span class="warn">That is a little over budget; start with the first item and add the rest later.</span>' : '') + '</p>' + (notes.length ? '<ul class="plan-list">' + notes.map(function (n) { return '<li>' + n + '</li>'; }).join('') + '</ul>' : '') + '</div><div class="gear-grid">' + picks.map(card).join('') + '</div><p class="small muted" style="margin-top:12px"><strong>Prices are approximate</strong> ranges for typical new gear in each category, as of November 2026. They vary by retailer, region and sales, so check current prices at several retailers before you buy.</p>';
  }
  // Prefill from the URL, e.g. ?budget=600&prio=audio&room=echo&cam=yes&own=webcam
  var qs = new URLSearchParams(location.search);
  if (qs.get('budget')) range.value = qs.get('budget');
  if (qs.get('prio')) form.elements.namedItem('prio').value = qs.get('prio');
  if (qs.get('room')) form.elements.namedItem('room').value = qs.get('room');
  if (qs.get('cam')) form.elements.namedItem('cam').value = qs.get('cam');
  qs.getAll('own').forEach(function (o) {
    var cb = Array.prototype.find.call(form.querySelectorAll('input[name=own]'), function (el) { return el.value === o; });
    if (cb) cb.checked = true;
  });
  Array.prototype.forEach.call(form.querySelectorAll('button[data-b]'), function (b) { b.addEventListener('click', function () { range.value = b.dataset.b; compute(); }); });
  form.addEventListener('submit', function (e) { e.preventDefault(); compute(); });
  form.addEventListener('input', compute);
  form.addEventListener('change', compute);
  compute();
})();
