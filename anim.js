/* Choco Quente Rico — animação por rolagem na página de produto (testes)
   Carregado pelo loader em custom_seal_code só nos produtos configurados abaixo. */
(function () {
  'use strict';

  var VARIANTS = {
    349115962: { dir: 'wan', frames: 180 }, // Choco Quente Rico - 160g (produto real)
    367440811: { dir: 'kling', frames: 182 },
    367440830: { dir: 'wan', frames: 180 }
  };
  var BASE = 'https://cdn.jsdelivr.net/gh/somosmovaagencia-create/rico-choco-anim@main/';
  var KIT_URL = '/produtos/kit-3-unidades-choco-quente-rico-160g-x8a2s/';

  var productId = window.LS && LS.product && LS.product.id;
  var cfg = VARIANTS[productId];
  var detail = document.getElementById('single-product');
  if (!cfg || !cfg.frames || !detail || document.getElementById('rico-anim')) return;

  var reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var N = cfg.frames;
  var FRAME_END = 0.9; // depois disso o último quadro fica parado sob a oferta

  // Cenas: [início, fim] em progresso 0..1; tema claro/escuro define cor do texto
  var BEATS = [
    { from: 0.0, to: 0.19, theme: 'dark', html:
      '<p class="ra-eyebrow">Choco Quente Rico</p>' +
      '<h2 class="ra-title">Uma pausa.<br>Muito sabor.</h2>' +
      '<p class="ra-sub">Mistura para chocolate quente, pronta em minutos.</p>' },
    { from: 0.23, to: 0.43, theme: 'dark', html:
      '<h2 class="ra-title">O sabor<br>começa aqui.</h2>' +
      '<ul class="ra-chips"><li>160 g</li><li>8 porções de 20 g</li><li>Não contém glúten</li></ul>' },
    { from: 0.49, to: 0.68, theme: 'light', html:
      '<h2 class="ra-title">Do preparo à<br>primeira xícara.</h2>' +
      '<ol class="ra-steps">' +
      '<li>Na panela, coloque 1 litro de água filtrada e a mistura.</li>' +
      '<li>Leve ao fogo, mexendo até iniciar a fervura.</li>' +
      '<li>Desligue o fogo e sirva quente.</li></ol>' },
    { from: 0.72, to: 0.84, theme: 'light', html:
      '<p class="ra-eyebrow">Ingredientes</p>' +
      '<h2 class="ra-title ra-title-sm">Açúcar, leite em pó, amido de milho, cacau em pó e sal refinado.</h2>' +
      '<p class="ra-sub">Alérgicos: pode conter traços de derivados de soja.</p>' },
    { from: 0.88, to: 1.5, theme: 'light', offer: true, html:
      '<h2 class="ra-title">Sua próxima pausa<br>tem sabor.</h2>' +
      '<div class="ra-offer">' +
      '<p class="ra-offer-name">Choco Quente Rico · 160 g</p>' +
      '<p class="ra-offer-price" data-ra="price"></p>' +
      '<p class="ra-offer-inst" data-ra="inst"></p>' +
      '<button type="button" class="ra-buy" data-ra="buy">Comprar agora</button>' +
      '<a class="ra-kit" href="' + KIT_URL + '">Kit com 3 unidades &rarr;</a>' +
      '</div>' }
  ];

  var CSS =
    '#rico-anim{position:relative;height:620vh;background:#140b07;margin:0 0 8px}' +
    '#rico-anim .ra-stage{position:sticky;top:var(--ra-top,0px);height:calc(100vh - var(--ra-top,0px));height:calc(100svh - var(--ra-top,0px));overflow:hidden;background:#140b07}' +
    '#rico-anim canvas{position:absolute;inset:0;width:100%;height:100%;display:block}' +
    '#rico-anim .ra-shade{position:absolute;left:0;right:0;top:0;height:58%;pointer-events:none;transition:opacity .5s}' +
    '#rico-anim .ra-shade-dark{background:linear-gradient(180deg,rgba(15,8,5,.82) 0%,rgba(15,8,5,.55) 45%,rgba(15,8,5,0) 100%)}' +
    '#rico-anim .ra-shade-light{background:linear-gradient(180deg,rgba(250,244,236,.92) 0%,rgba(250,244,236,.7) 45%,rgba(250,244,236,0) 100%);opacity:0}' +
    '#rico-anim .ra-beat{position:absolute;left:0;right:0;top:0;padding:28px 22px 0;opacity:0;transform:translateY(18px);will-change:opacity,transform;pointer-events:none}' +
    '#rico-anim .ra-beat.is-on{pointer-events:auto}' +
    '#rico-anim .ra-dark{color:#fff8ef}' +
    '#rico-anim .ra-light{color:#35251e}' +
    '#rico-anim .ra-eyebrow{font:600 12px/1.2 Montserrat,Inter,system-ui,sans-serif;letter-spacing:.18em;text-transform:uppercase;margin:0 0 10px;opacity:.85}' +
    '#rico-anim .ra-title{font:700 clamp(30px,9.6vw,40px)/1.05 "Playfair Display",Lora,Georgia,serif;margin:0 0 12px;color:inherit;letter-spacing:-.01em}' +
    '#rico-anim .ra-title-sm{font-size:clamp(21px,6.4vw,26px);line-height:1.2}' +
    '#rico-anim .ra-sub{font:400 15px/1.45 Inter,system-ui,sans-serif;margin:0;max-width:30ch;opacity:.9}' +
    '#rico-anim .ra-chips{list-style:none;padding:0;margin:14px 0 0;display:flex;flex-wrap:wrap;gap:8px}' +
    '#rico-anim .ra-chips li{font:600 13px/1 Inter,system-ui,sans-serif;padding:9px 12px;border-radius:999px;background:rgba(20,11,7,.55);border:1px solid rgba(255,248,239,.4);backdrop-filter:blur(4px)}' +
    '#rico-anim .ra-steps{counter-reset:ra;list-style:none;padding:12px 12px 4px;margin:12px 26px 0 -4px;max-width:36ch;background:rgba(250,244,236,.9);backdrop-filter:blur(6px);border-radius:14px}' +
    '#rico-anim .ra-steps li{counter-increment:ra;position:relative;padding:0 0 8px 36px;font:500 15px/1.4 Inter,system-ui,sans-serif}' +
    '#rico-anim .ra-steps li:before{content:counter(ra);position:absolute;left:0;top:-2px;width:26px;height:26px;border-radius:50%;background:#176445;color:#fff;font:700 13px/26px Inter,system-ui,sans-serif;text-align:center}' +
    '#rico-anim .ra-beat-offer{bottom:0;display:flex;flex-direction:column;justify-content:space-between;padding-bottom:calc(16px + env(safe-area-inset-bottom))}' +
    '#rico-anim .ra-offer{background:#fffaf3;border-radius:16px;padding:14px 16px 8px;box-shadow:0 12px 32px rgba(20,11,7,.25);color:#35251e}' +
    '#rico-anim .ra-offer-name{font:500 14px/1.3 Inter,system-ui,sans-serif;margin:0 0 2px}' +
    '#rico-anim .ra-offer-price{font:800 34px/1.1 Inter,system-ui,sans-serif;color:#176445;margin:0}' +
    '#rico-anim .ra-offer-inst{font:400 13px/1.3 Inter,system-ui,sans-serif;margin:2px 0 12px;color:#555}' +
    '#rico-anim .ra-buy{display:block;width:100%;min-height:52px;border:0;border-radius:10px;background:#176445;color:#fff;font:700 16px/1 Inter,system-ui,sans-serif;letter-spacing:.02em;cursor:pointer}' +
    '#rico-anim .ra-buy:focus-visible{outline:3px solid #f0b43c;outline-offset:2px}' +
    '#rico-anim .ra-kit{display:inline-block;margin-top:12px;font:600 14px/1 Inter,system-ui,sans-serif;color:#35251e;text-decoration:underline;text-underline-offset:3px;padding:8px 0}' +
    '#rico-anim .ra-hint{position:absolute;left:0;right:0;bottom:22px;text-align:center;color:#fff8ef;font:500 13px/1 Inter,system-ui,sans-serif;letter-spacing:.04em;transition:opacity .4s}' +
    '#rico-anim .ra-hint span{display:block;margin:8px auto 0;width:10px;height:10px;border-right:2px solid;border-bottom:2px solid;transform:rotate(45deg);animation:ra-bob 1.6s ease-in-out infinite}' +
    '#rico-anim .ra-dots{position:absolute;right:12px;top:50%;transform:translateY(-50%);display:flex;flex-direction:column;gap:8px}' +
    '#rico-anim .ra-dots i{width:6px;height:6px;border-radius:50%;background:currentColor;opacity:.35;transition:opacity .3s,transform .3s}' +
    '#rico-anim .ra-dots i.is-on{opacity:1;transform:scale(1.4)}' +
    '#rico-anim .ra-loader{position:absolute;left:0;bottom:0;height:2px;background:#f0b43c;width:0;transition:width .3s,opacity .6s}' +
    '.ra-bar{position:fixed;left:0;right:0;bottom:0;z-index:40;display:flex;align-items:center;gap:12px;padding:10px 16px calc(10px + env(safe-area-inset-bottom));background:#fff;box-shadow:0 -6px 20px rgba(0,0,0,.12);transform:translateY(110%);transition:transform .35s}' +
    '.ra-bar.is-on{transform:none}' +
    '.ra-bar p{margin:0;flex:1;font:500 14px/1.25 Inter,system-ui,sans-serif;color:#35251e}' +
    '.ra-bar strong{display:block;font:800 17px/1.2 Inter,system-ui,sans-serif;color:#176445}' +
    '.ra-bar button{min-height:46px;padding:0 22px;border:0;border-radius:10px;background:#176445;color:#fff;font:700 15px/1 Inter,system-ui,sans-serif;cursor:pointer}' +
    '@media (min-width:900px){.ra-bar{left:auto;right:96px;bottom:16px;border-radius:14px;padding:10px 12px 10px 18px;width:360px;transform:translateY(calc(100% + 40px))}.ra-bar.is-on{transform:none}}' +
    '@keyframes ra-bob{0%,100%{transform:translateY(0) rotate(45deg)}50%{transform:translateY(5px) rotate(45deg)}}' +
    '@media (min-width:900px){' +
    '#rico-anim .ra-beat{right:auto;width:44%;top:50%;padding:0 0 0 6vw;transform:translateY(calc(-50% + 18px))}' +
    '#rico-anim .ra-title{font-size:56px}#rico-anim .ra-title-sm{font-size:34px}' +
    '#rico-anim .ra-shade{display:none}' +
    '#rico-anim .ra-sub,#rico-anim .ra-steps li{font-size:17px}' +
    '#rico-anim .ra-beat-offer{bottom:auto;display:block;padding-bottom:0}#rico-anim .ra-offer{max-width:380px;margin-top:8px}#rico-anim .ra-steps{background:none;backdrop-filter:none;padding:0;margin:14px 0 0}' +
    '}' +
    '@media (prefers-reduced-motion:reduce){#rico-anim .ra-hint span{animation:none}}';

  // ---------- DOM ----------
  var style = document.createElement('style');
  style.textContent = CSS;
  document.head.appendChild(style);

  var section = document.createElement('section');
  section.id = 'rico-anim';
  section.setAttribute('aria-label', 'Apresentação do Choco Quente Rico');
  var html = '<div class="ra-stage"><canvas aria-hidden="true"></canvas>' +
    '<div class="ra-shade ra-shade-dark"></div><div class="ra-shade ra-shade-light"></div>';
  BEATS.forEach(function (b, i) {
    html += '<div class="ra-beat ra-' + b.theme + (b.offer ? ' ra-beat-offer' : '') + '" data-i="' + i + '">' + b.html + '</div>';
  });
  html += '<div class="ra-dots" aria-hidden="true">' + BEATS.map(function () { return '<i></i>'; }).join('') + '</div>' +
    '<p class="ra-hint">Role para descobrir<span></span></p><div class="ra-loader"></div></div>';
  section.innerHTML = html;
  detail.parentNode.insertBefore(section, detail);

  var stage = section.querySelector('.ra-stage');
  var canvas = section.querySelector('canvas');
  var ctx = canvas.getContext('2d');
  var beatEls = [].slice.call(section.querySelectorAll('.ra-beat'));
  var dots = [].slice.call(section.querySelectorAll('.ra-dots i'));
  var dotsWrap = section.querySelector('.ra-dots');
  var hint = section.querySelector('.ra-hint');
  var loader = section.querySelector('.ra-loader');
  var shadeDark = section.querySelector('.ra-shade-dark');
  var shadeLight = section.querySelector('.ra-shade-light');

  // Oferta: lê preço/parcelas do bloco nativo (fonte única da verdade)
  var nativePrice = detail.querySelector('.js-price-display');
  var nativeInst = detail.querySelector('.js-max-installments-container');
  var nativeSubmit = detail.querySelector('#product_form [type=submit], .js-addtocart[type=submit]');
  function syncOffer() {
    var price = nativePrice ? nativePrice.textContent.trim() : '';
    [].forEach.call(document.querySelectorAll('[data-ra=price]'), function (el) { el.textContent = price; });
    var inst = nativeInst ? nativeInst.textContent.replace(/\s+/g, ' ').trim() : '';
    [].forEach.call(document.querySelectorAll('[data-ra=inst]'), function (el) { el.textContent = inst; el.hidden = !inst; });
  }
  function buy() {
    if (nativeSubmit) nativeSubmit.click();
    else detail.scrollIntoView({ behavior: 'smooth' });
  }
  section.querySelector('[data-ra=buy]').addEventListener('click', buy);

  var bar = document.createElement('div');
  bar.className = 'ra-bar';
  bar.innerHTML = '<p>Choco Quente Rico<strong data-ra="price"></strong></p><button type="button">Comprar</button>';
  bar.querySelector('button').addEventListener('click', buy);
  document.body.appendChild(bar);
  syncOffer();

  // ---------- Frames ----------
  var frames = new Array(N);
  var loaded = 0;
  function src(i) { return BASE + cfg.dir + '/f_' + ('00' + (i + 1)).slice(-3) + '.webp'; }
  function load(i) {
    return new Promise(function (resolve) {
      if (frames[i]) return resolve();
      var img = new Image();
      img.decoding = 'async';
      img.onload = function () { frames[i] = img; loaded++; loader.style.width = (loaded / N * 100) + '%'; resolve(); if (i === current) draw(i); };
      img.onerror = function () { resolve(); };
      img.src = src(i);
    });
  }
  // ordem: primeiro quadro, depois grade grossa → fina (a animação fica usável cedo)
  var order = [], seen = {};
  order.push(0, N - 1); seen[0] = seen[N - 1] = 1;
  [24, 12, 6, 3, 1].forEach(function (step) {
    for (var i = 0; i < N; i += step) if (!seen[i]) { seen[i] = 1; order.push(i); }
  });
  var keyFrames = [0, Math.round(N * 0.33), Math.round(N * 0.66), N - 1];
  if (reduced) order = keyFrames.slice();
  function pump(conc) {
    var q = order.slice(1);
    function next() { if (!q.length) { loader.style.opacity = 0; return; } load(q.shift()).then(next); }
    for (var k = 0; k < conc; k++) next();
  }
  load(order[0]).then(function () { draw(current); pump(6); });

  function nearest(i) {
    for (var d = 0; d < N; d++) {
      if (frames[i - d]) return frames[i - d];
      if (frames[i + d]) return frames[i + d];
    }
    return null;
  }

  var dpr = 1, cw = 0, ch = 0, desktop = false;
  function resize() {
    // o cabeçalho vira sobreposição (fixed), então a animação ocupa a tela toda
    section.style.setProperty('--ra-top', '0px');
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    cw = stage.clientWidth; ch = stage.clientHeight;
    canvas.width = Math.round(cw * dpr); canvas.height = Math.round(ch * dpr);
    desktop = window.innerWidth >= 900;
    lastDrawn = -1;
    update();
  }

  var current = 0, lastDrawn = -1;
  function draw(i) {
    var img = nearest(i);
    if (!img) return;
    var W = canvas.width, H = canvas.height, iw = img.naturalWidth, ih = img.naturalHeight;
    ctx.clearRect(0, 0, W, H);
    var s, dw, dh, dx, dy;
    if (desktop) {
      // vídeo vertical à direita, inteiro; texto ocupa a esquerda
      s = H / ih; dw = iw * s; dh = H;
      dx = Math.max(W * 0.52, W - dw - W * 0.06); dy = 0;
    } else {
      s = Math.max(W / iw, H / ih); dw = iw * s; dh = ih * s;
      dx = (W - dw) / 2; dy = (H - dh) / 2;
    }
    ctx.drawImage(img, dx, dy, dw, dh);
    if (desktop) {
      // funde as bordas do vídeo com o fundo
      var f = Math.round(48 * dpr);
      [[dx, dx + f], [dx + dw, dx + dw - f]].forEach(function (e) {
        var g = ctx.createLinearGradient(e[0], 0, e[1], 0);
        g.addColorStop(0, bgColor); g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.fillRect(Math.min(e[0], e[1]), 0, f, H);
      });
    }
    lastDrawn = i;
    lastBg = bgColor;
  }

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  var FADE = 0.035;
  var DARK = [20, 11, 7], LIGHT = [239, 228, 214];
  var bgColor = 'rgb(20,11,7)', lastBg = '';
  function mix(t) {
    return 'rgb(' + DARK.map(function (c, k) { return Math.round(c + (LIGHT[k] - c) * t); }).join(',') + ')';
  }

  function update() {
    var rect = section.getBoundingClientRect();
    var top = parseFloat(section.style.getPropertyValue('--ra-top')) || 0;
    var travel = section.offsetHeight - stage.offsetHeight;
    var p = clamp((top - rect.top) / (travel || 1), 0, 1);

    var activeBeat = 0;
    beatEls.forEach(function (el, i) {
      var b = BEATS[i];
      var o = clamp(Math.min((p - b.from) / FADE + (i === 0 ? 1 : 0), (b.to - p) / FADE), 0, 1);
      el.style.opacity = o;
      el.style.transform = desktop ? 'translateY(calc(-50% + ' + (1 - o) * 18 + 'px))' : 'translateY(' + (1 - o) * 18 + 'px)';
      el.classList.toggle('is-on', o > 0.5);
      if (p >= b.from - 0.02) activeBeat = i;
    });
    var theme = BEATS[activeBeat].theme;
    // escuro → claro acontece no intervalo sem texto entre as cenas 2 e 3
    var t = clamp((p - 0.435) / 0.05, 0, 1);
    bgColor = mix(t);
    stage.style.backgroundColor = bgColor;
    shadeDark.style.opacity = 1 - t;
    shadeLight.style.opacity = t;
    dotsWrap.style.color = t < 0.5 ? '#fff8ef' : '#35251e';
    dots.forEach(function (d, i) { d.classList.toggle('is-on', i === activeBeat); });
    hint.style.opacity = p < 0.06 ? 1 : 0;

    var target = reduced
      ? keyFrames[Math.min(activeBeat, keyFrames.length - 1)]
      : Math.round(clamp(p / FRAME_END, 0, 1) * (N - 1));
    current = target;
    if (target !== lastDrawn || (desktop && bgColor !== lastBg)) draw(target);

    var barOn = p > 0.04 && p < 0.86 && rect.bottom > window.innerHeight * 0.6;
    if (barOn !== barState) {
      barState = barOn;
      bar.classList.toggle('is-on', barOn);
      // o tema reescreve as classes do body; ajusta o botão do WhatsApp direto
      [].forEach.call(document.querySelectorAll('.js-btn-fixed-bottom'), function (el) {
        el.style.transition = 'bottom .35s';
        el.style.bottom = barOn ? (bar.offsetHeight + 12) + 'px' : '';
      });
    }
  }
  var barState = false;

  // ---------- Cabeçalho ----------
  // Some durante a animação (imersão); desce de novo ao rolar para cima.
  var head = document.querySelector('.js-head-main');
  var headShown = true, lastY = window.pageYOffset;
  if (head) {
    head.style.setProperty('position', 'fixed', 'important');
    head.style.setProperty('top', '0', 'important');
    head.style.left = '0'; head.style.right = '0'; head.style.width = '100%';
    head.style.zIndex = '60';
    head.style.transition = 'transform .35s ease';
  }
  function setHead(show) {
    if (!head || show === headShown) return;
    headShown = show;
    head.style.transform = show ? '' : 'translateY(-100%)';
  }
  function updateHead() {
    var y = window.pageYOffset, dy = y - lastY;
    // durante a animação o cabeçalho fica sempre escondido, mesmo rolando para cima
    if (section.getBoundingClientRect().bottom > 0) { lastY = y; setHead(false); return; }
    if (Math.abs(dy) < 6) return;
    lastY = y;
    setHead(dy < 0);
  }
  setHead(false);

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { ticking = false; update(); updateHead(); });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', resize);
  // preço/parcelas podem mudar ao trocar variante/quantidade
  if (window.MutationObserver && nativePrice) new MutationObserver(syncOffer).observe(detail, { subtree: true, childList: true, characterData: true });
  resize();
})();
