(function () {
  const cfg = window.ONYRA || {};
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  const KEY = "onyra-motion";
  const listeners = [];

  let motion = !reduce.matches;
  try {
    const stored = sessionStorage.getItem(KEY);
    if (stored === "on") motion = true;
    if (stored === "off") motion = false;
  } catch (err) {
    /* session storage can be blocked; the in-memory flag still works */
  }

  function motionOn() {
    return motion;
  }

  function onMotion(fn) {
    listeners.push(fn);
  }

  function labelButtons() {
    document.querySelectorAll("[data-motion-toggle]").forEach(function (btn) {
      btn.setAttribute("aria-pressed", motion ? "false" : "true");
      btn.textContent = motion ? "Pause motion" : "Play motion";
    });
  }

  function setMotion(on) {
    motion = on;
    document.documentElement.classList.toggle("is-paused", !motion);
    try {
      sessionStorage.setItem(KEY, motion ? "on" : "off");
    } catch (err) {
      /* ignore */
    }
    labelButtons();
    listeners.forEach(function (fn) {
      fn(motion);
    });
  }

  document.documentElement.classList.toggle("is-paused", !motion);
  labelButtons();

  function shortAddress(addr) {
    if (addr.length <= 16) return addr;
    return addr.slice(0, 6) + "…" + addr.slice(-4);
  }

  function applyConfig() {
    const addr = String(cfg.contractAddress || "").trim();
    const full = addr ? "CA: " + addr : "CA: coming soon";
    const short = addr ? "CA: " + shortAddress(addr) : "CA: coming soon";
    document.querySelectorAll("[data-ca-label]").forEach(function (el) {
      const showFull = el.hasAttribute("data-ca-full");
      el.textContent = showFull ? full : short;
      el.classList.toggle("is-address", Boolean(addr) && showFull);
    });
    document.querySelectorAll("[data-ca-copy]").forEach(function (btn) {
      btn.setAttribute(
        "aria-label",
        addr ? "Copy contract address " + addr : "Contract address coming soon"
      );
    });
    if (cfg.ticker) {
      document.querySelectorAll("[data-ticker]").forEach(function (el) {
        el.textContent = cfg.ticker;
      });
    }
    if (cfg.xHandle) {
      document.querySelectorAll("[data-x-handle]").forEach(function (el) {
        el.textContent = cfg.xHandle;
      });
    }
    if (cfg.xUrl) {
      document.querySelectorAll("[data-x-link]").forEach(function (el) {
        el.setAttribute("href", cfg.xUrl);
      });
    }
    if (cfg.githubUrl) {
      document.querySelectorAll("[data-github-link]").forEach(function (el) {
        el.setAttribute("href", cfg.githubUrl);
      });
    }
    const year = String(new Date().getFullYear());
    document.querySelectorAll("[data-year]").forEach(function (el) {
      el.textContent = year;
    });
  }

  let toastTimer = 0;
  function toast(message) {
    const el = document.querySelector("[data-toast]");
    if (!el) return;
    el.textContent = message;
    el.classList.add("is-on");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      el.classList.remove("is-on");
    }, 2600);
  }

  function initCopy() {
    document.querySelectorAll("[data-ca-copy]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const addr = String(cfg.contractAddress || "").trim();
        if (!addr) {
          toast("Contract address coming soon");
          return;
        }
        if (!navigator.clipboard || !navigator.clipboard.writeText) {
          toast("Could not copy. The address is shown on this page.");
          return;
        }
        navigator.clipboard.writeText(addr).then(
          function () {
            toast("Contract address copied");
          },
          function () {
            toast("Could not copy. The address is shown on this page.");
          }
        );
      });
    });
  }

  function initNav() {
    const header = document.querySelector("[data-header]");
    if (!header) return;
    const btn = header.querySelector(".nav-toggle");
    const nav = document.getElementById("site-nav");
    if (!btn || !nav) return;
    const mq = window.matchMedia("(max-width: 959px)");

    function setOpen(open) {
      document.body.classList.toggle("nav-open", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      if (!mq.matches) {
        nav.removeAttribute("inert");
        return;
      }
      if (open) nav.removeAttribute("inert");
      else nav.setAttribute("inert", "");
    }

    function sync() {
      if (!mq.matches) {
        document.body.classList.remove("nav-open");
        btn.setAttribute("aria-expanded", "false");
        nav.removeAttribute("inert");
      } else if (!document.body.classList.contains("nav-open")) {
        nav.setAttribute("inert", "");
        btn.setAttribute("aria-expanded", "false");
      }
    }

    btn.addEventListener("click", function () {
      const open = !document.body.classList.contains("nav-open");
      setOpen(open);
      if (open) {
        const first = nav.querySelector("a");
        if (first) first.focus();
      }
    });

    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) setOpen(false);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && document.body.classList.contains("nav-open")) {
        setOpen(false);
        btn.focus();
      }
    });

    if (mq.addEventListener) mq.addEventListener("change", sync);
    else mq.addListener(sync);
    sync();
  }

  function initHeader() {
    const header = document.querySelector("[data-header]");
    if (!header) return;
    function onScroll() {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  function initReveal() {
    const nodes = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
    if (!nodes.length) return;
    if (!("IntersectionObserver" in window) || reduce.matches) {
      nodes.forEach(function (node) {
        node.classList.add("is-in");
      });
      return;
    }
    const io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -6% 0px" }
    );
    nodes.forEach(function (node) {
      io.observe(node);
    });
  }

  function initSky() {
    const canvas = document.querySelector("[data-sky]");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let w = 0;
    let h = 0;
    let dpr = 1;
    let points = [];
    let raf = 0;
    let visible = true;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 1.6);
      w = canvas.clientWidth || 1;
      h = canvas.clientHeight || 1;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(Math.min(100, Math.max(36, (w * h) / 17000)));
      points = Array.from({ length: count }, function () {
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 1.25 + 0.35,
          vx: (Math.random() - 0.5) * 0.16,
          vy: (Math.random() - 0.5) * 0.16,
          a: Math.random() * 0.5 + 0.18,
          tint: Math.random() > 0.88
        };
      });
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      const linkDist = Math.min(130, Math.max(86, w / 12));
      for (let i = 0; i < points.length; i++) {
        const a = points[i];
        for (let j = i + 1; j < points.length; j++) {
          const b = points[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist >= linkDist) continue;
          const alpha = (1 - dist / linkDist) * 0.38;
          ctx.strokeStyle = "rgba(78, 92, 196, " + alpha + ")";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
      for (let k = 0; k < points.length; k++) {
        const p = points[k];
        ctx.fillStyle = p.tint
          ? "rgba(225, 93, 76, " + Math.min(0.9, p.a + 0.25) + ")"
          : "rgba(47, 120, 214, " + Math.min(0.8, p.a + 0.2) + ")";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function loop() {
      if (motionOn() && visible) {
        for (let i = 0; i < points.length; i++) {
          const p = points[i];
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < -8 || p.x > w + 8) p.vx *= -1;
          if (p.y < -8 || p.y > h + 8) p.vy *= -1;
        }
      }
      draw();
      if (motionOn() && visible) raf = window.requestAnimationFrame(loop);
    }

    function start() {
      window.cancelAnimationFrame(raf);
      if (motionOn() && visible) raf = window.requestAnimationFrame(loop);
      else draw();
    }

    resize();
    start();
    window.addEventListener("resize", function () {
      resize();
      start();
    });
    document.addEventListener("visibilitychange", function () {
      visible = !document.hidden;
      start();
    });
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(function (entries) {
        visible = entries.some(function (entry) {
          return entry.isIntersecting;
        }) && !document.hidden;
        start();
      });
      io.observe(canvas);
    }
    onMotion(start);
  }

  const LINES = [
    { who: "you", text: "Build a one-page night log. Host it. Keep the laptop out of it." },
    { who: "onyra", text: "Brief received. I'll take this one in Onyra Cloud." },
    { who: "onyra", text: "Writing the page, the type, and a short note about the watch." },
    { who: "onyra", text: "Safety judge: no secrets on the page, no spend past the ceiling. Clear." },
    { who: "onyra", text: "Publishing. The page gets a link of its own." },
    { who: "link", text: "https://night-log.example.com" },
    { who: "onyra", text: "Hosted on the agent's cloud. The calls sit inside the wallet ceiling. A receipt is ready when the wallet is live." }
  ];

  function wait(ms) {
    return new Promise(function (resolve) {
      window.setTimeout(resolve, ms);
    });
  }

  function renderLine(line, partial) {
    const p = document.createElement("p");
    p.className = "line " + line.who;
    const who = document.createElement("span");
    who.className = "who";
    who.textContent = line.who;
    const say = document.createElement("span");
    say.className = "say";
    say.textContent = partial == null ? line.text : partial;
    p.appendChild(who);
    p.appendChild(say);
    return p;
  }

  function staticScreen(screen) {
    screen.replaceChildren();
    LINES.forEach(function (line) {
      screen.appendChild(renderLine(line));
    });
  }

  function initTerm() {
    const screen = document.querySelector("[data-term-screen]");
    if (!screen) return;
    const transcript = document.querySelector("[data-term-at]");
    let gen = 0;

    function showStatic() {
      gen += 1;
      if (transcript) transcript.hidden = true;
      screen.removeAttribute("aria-hidden");
      staticScreen(screen);
    }

    async function play() {
      const mine = ++gen;
      if (transcript) transcript.hidden = false;
      screen.setAttribute("aria-hidden", "true");
      screen.replaceChildren();
      for (let n = 0; n < LINES.length; n++) {
        if (mine !== gen || !motionOn()) return;
        const line = LINES[n];
        const node = renderLine(line, "");
        const say = node.querySelector(".say");
        const caret = document.createElement("span");
        caret.className = "caret";
        caret.setAttribute("aria-hidden", "true");
        node.appendChild(caret);
        screen.appendChild(node);
        for (let i = 1; i <= line.text.length; i++) {
          if (mine !== gen || !motionOn()) return;
          say.textContent = line.text.slice(0, i);
          screen.scrollTop = screen.scrollHeight;
          await wait(line.who === "you" ? 18 : 12);
        }
        caret.remove();
        await wait(380);
      }
      await wait(2600);
      if (mine === gen && motionOn()) play();
    }

    if (motionOn()) play();
    onMotion(function (on) {
      if (on) play();
      else showStatic();
    });
  }

  function initWatch() {
    const root = document.querySelector("[data-watch]");
    if (!root) return;
    const steps = Array.prototype.slice.call(root.querySelectorAll("[data-step]"));
    if (!steps.length) return;
    let index = 0;
    let timer = 0;

    function paint() {
      const playing = motionOn();
      root.classList.toggle("is-playing", playing);
      steps.forEach(function (step, i) {
        const on = playing && i === index;
        step.classList.toggle("is-on", on);
        const btn = step.querySelector("button");
        if (btn) btn.setAttribute("aria-pressed", on ? "true" : "false");
      });
    }

    function start() {
      window.clearInterval(timer);
      paint();
      if (!motionOn()) return;
      timer = window.setInterval(function () {
        index = (index + 1) % steps.length;
        paint();
      }, 1800);
    }

    steps.forEach(function (step, i) {
      const btn = step.querySelector("button");
      if (!btn) return;
      btn.addEventListener("click", function () {
        index = i;
        start();
      });
    });

    onMotion(start);
    start();
  }

  function initMotionToggles() {
    document.querySelectorAll("[data-motion-toggle]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        setMotion(!motionOn());
      });
    });
  }

  const DEMOS = [
    {
      session: "night-log",
      model: "Onyra · balanced",
      status: "Streaming",
      steps: [
        { kind: "user", text: "Build a one-page night log and host it. Keep the laptop out of it." },
        { kind: "agent", text: "Reading the brief. I'll write the page, check it, and publish it from Onyra Cloud." },
        { kind: "tool", name: "read_file", args: "notes/brief.md", log: "18 lines · no secrets in the brief" },
        { kind: "tool", name: "run_command", args: "python3 -m http.server", log: "listening · local check only" },
        { kind: "tool", name: "edit_file", args: "site/index.html", log: "wrote the night log" },
        { kind: "diff", file: "site/index.html", add: 1, del: 1 },
        { kind: "tool", name: "deploy", args: "onyra cloud", log: "publishing · link assigned" },
        { kind: "link", url: "app.onyraai.com/night-log" }
      ]
    },
    {
      session: "two-models",
      model: "Fast draft",
      status: "Switching models",
      steps: [
        { kind: "user", text: "Draft this on a fast model, then switch to a careful one for the page that ships." },
        { kind: "agent", text: "Fast model for the draft. I'll change models before the edit that gets published." },
        { kind: "tool", name: "run_command", args: "model use fast", log: "draft model ready · ceiling unchanged" },
        { kind: "agent", text: "Draft is in. Switching for the pass that ships." },
        { kind: "tool", name: "run_command", args: "model use careful", log: "careful model ready" },
        { kind: "tool", name: "edit_file", args: "site/index.html", log: "final pass written" },
        { kind: "diff", file: "site/index.html", add: 1, del: 1 },
        { kind: "agent", text: "Both passes stayed inside the ceiling you set." }
      ]
    },
    {
      session: "cloud-desk",
      model: "Onyra · cloud",
      status: "Desk awake",
      steps: [
        { kind: "user", text: "Leave this running after I close the lid." },
        { kind: "agent", text: "Moving the desk to Onyra Cloud. Your laptop can sleep." },
        { kind: "tool", name: "deploy", args: "onyra cloud --stay", log: "desk is awake · laptop not required" },
        { kind: "link", url: "app.onyraai.com/watch" },
        { kind: "agent", text: "The link stays with the cloud desk. Closing the lid does not close the page." }
      ]
    },
    {
      session: "ceiling",
      model: "Onyra · balanced",
      status: "Inside ceiling",
      steps: [
        { kind: "user", text: "Pay for the calls this task used. Do not cross the ceiling." },
        { kind: "agent", text: "Three model calls. I'll check them against the ceiling before anything settles." },
        { kind: "tool", name: "run_command", args: "wallet.check", log: "3 calls · inside ceiling · waiting for a live wallet" },
        { kind: "agent", text: "Nothing crossed the line. A receipt appears here when the wallet is live." }
      ]
    }
  ];

  function initStage() {
    const root = document.querySelector("[data-stage]");
    if (!root) return;
    const chat = root.querySelector("[data-chat]");
    const at = root.querySelector("[data-stage-at]");
    const tabs = Array.prototype.slice.call(document.querySelectorAll("[data-stage-tab]"));
    const toggle = document.querySelector("[data-stage-toggle]");
    const modelChip = root.querySelector("[data-model]");
    const statusChip = root.querySelector("[data-status]");
    const sessionButtons = Array.prototype.slice.call(root.querySelectorAll("[data-session]"));
    let index = 0;
    let gen = 0;
    let stagePaused = false;

    function stagePlaying() {
      return motionOn() && !stagePaused;
    }

    function make(tag, className, text) {
      const node = document.createElement(tag);
      if (className) node.className = className;
      if (text != null) node.textContent = text;
      return node;
    }

    function renderStep(step, full) {
      if (step.kind === "user" || step.kind === "agent") {
        const row = make("div", "bubble " + step.kind);
        row.append(
          make("p", "bubble-who", step.kind === "user" ? "You" : "Onyra"),
          make("p", "bubble-say", full ? step.text : "")
        );
        return row;
      }
      if (step.kind === "tool") {
        const details = document.createElement("details");
        details.className = "tool";
        details.open = true;
        const summary = document.createElement("summary");
        summary.append(make("span", "tool-name", step.name), make("span", "tool-args", step.args));
        details.append(summary, make("pre", "tool-log", step.log));
        return details;
      }
      if (step.kind === "diff") {
        const card = make("div", "diff-card");
        card.append(
          make("span", "diff-file", step.file),
          make("span", "diff-stat", "1 file changed +" + step.add + " −" + step.del)
        );
        return card;
      }
      const card = make("div", "link-ready");
      card.append(
        make("p", "link-kicker", "Live link ready"),
        make("p", "link-url", step.url),
        make("p", "link-note", "Example address. Not a hosted app.")
      );
      return card;
    }

    function transcript(demo) {
      return demo.steps.map(function (step) {
        if (step.kind === "user") return "You: " + step.text;
        if (step.kind === "agent") return "Onyra: " + step.text;
        if (step.kind === "tool") return step.name + " " + step.args + ". " + step.log;
        if (step.kind === "diff") return step.file + ". 1 file changed +" + step.add + " −" + step.del;
        return "Live link ready: " + step.url + ". Example address. Not a hosted app.";
      }).join(" ");
    }

    function setMeta(demo) {
      if (modelChip) modelChip.textContent = demo.model;
      if (statusChip) statusChip.textContent = demo.status;
      sessionButtons.forEach(function (btn) {
        const on = btn.getAttribute("data-session") === demo.session;
        btn.classList.toggle("is-current", on);
        if (on) btn.setAttribute("aria-current", "true");
        else btn.removeAttribute("aria-current");
      });
      if (at) at.textContent = transcript(demo);
    }

    function showStatic(demo) {
      gen += 1;
      setMeta(demo);
      chat.removeAttribute("aria-hidden");
      if (at) at.hidden = true;
      chat.replaceChildren();
      demo.steps.forEach(function (step) {
        chat.appendChild(renderStep(step, true));
      });
      chat.scrollTop = chat.scrollHeight;
    }

    function play(demo) {
      const mine = ++gen;
      setMeta(demo);
      chat.setAttribute("aria-hidden", "true");
      if (at) at.hidden = false;
      chat.replaceChildren();
      (async function () {
        for (let s = 0; s < demo.steps.length; s++) {
          if (mine !== gen || !stagePlaying()) return;
          const step = demo.steps[s];
          if (step.kind === "user" || step.kind === "agent") {
            const node = renderStep(step, false);
            const say = node.querySelector(".bubble-say");
            chat.appendChild(node);
            const pieces = step.kind === "agent" ? step.text.split(/(\s+)/) : step.text.split("");
            let built = "";
            for (let i = 0; i < pieces.length; i++) {
              if (mine !== gen || !stagePlaying()) return;
              built += pieces[i];
              say.textContent = built;
              chat.scrollTop = chat.scrollHeight;
              await wait(step.kind === "agent" ? 36 : 16);
            }
            await wait(260);
          } else {
            chat.appendChild(renderStep(step, true));
            chat.scrollTop = chat.scrollHeight;
            await wait(step.kind === "tool" ? 480 : 360);
          }
        }
        await wait(2400);
        if (mine === gen && stagePlaying()) play(demo);
      })();
    }

    function labelToggle() {
      if (!toggle) return;
      const on = stagePlaying();
      toggle.setAttribute("aria-pressed", on ? "false" : "true");
      toggle.textContent = on ? "Pause" : "Play";
    }

    function select(next, focusTab) {
      index = next;
      const demo = DEMOS[index];
      tabs.forEach(function (tab, i) {
        const on = i === index;
        tab.setAttribute("aria-selected", on ? "true" : "false");
        tab.tabIndex = on ? 0 : -1;
        if (on && focusTab) tab.focus();
      });
      const panel = document.getElementById("stage-panel");
      if (panel) panel.setAttribute("aria-labelledby", tabs[index].id);
      labelToggle();
      if (stagePlaying()) play(demo);
      else showStatic(demo);
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () { select(i, false); });
      tab.addEventListener("keydown", function (event) {
        if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
        event.preventDefault();
        const dir = event.key === "ArrowRight" ? 1 : -1;
        select((i + dir + tabs.length) % tabs.length, true);
      });
    });
    sessionButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        const id = btn.getAttribute("data-session");
        const found = DEMOS.findIndex(function (demo) { return demo.session === id; });
        if (found >= 0) select(found, false);
      });
    });
    const replay = root.querySelector("[data-stage-replay]");
    if (replay) {
      replay.addEventListener("click", function () {
        stagePaused = false;
        select(index, false);
      });
    }
    if (toggle) {
      toggle.addEventListener("click", function () {
        stagePaused = !stagePaused;
        labelToggle();
        if (stagePlaying()) play(DEMOS[index]);
        else showStatic(DEMOS[index]);
      });
    }
    onMotion(function () {
      labelToggle();
      if (stagePlaying()) play(DEMOS[index]);
      else showStatic(DEMOS[index]);
    });
    labelToggle();
    if (stagePlaying()) play(DEMOS[0]);
    else showStatic(DEMOS[0]);
  }

  applyConfig();
  initCopy();
  initNav();
  initHeader();
  initReveal();
  initSky();
  initTerm();
  initWatch();
  initStage();
  initMotionToggles();
})();
