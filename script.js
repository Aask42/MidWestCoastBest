// MIDWESTCOAST.BEST — interactivity
// =====================================================================

// Single source of truth for the RSVP destination.
const PARTIFUL_URL = "https://partiful.com/e/czKYLqWMMKmPsYjMverL?c=wDvk6wEt";

document.querySelectorAll("[data-rsvp]").forEach((el) => {
  el.href = PARTIFUL_URL;
  el.target = "_blank";
  el.rel = "noopener noreferrer";
});

// ---------------------------------------------------------------------
// Countdown — doors on the Tuesday before DEF CON 34.
// Vegas is Pacific (PDT, UTC-7) in August. Time is a placeholder (6pm PT).
// ---------------------------------------------------------------------
const TARGET = new Date("2026-08-04T18:00:00-07:00").getTime();

(function countdown() {
  const cd = document.getElementById("countdown");
  if (!cd) return;
  const out = {
    days: cd.querySelector('[data-cd="days"]'),
    hours: cd.querySelector('[data-cd="hours"]'),
    mins: cd.querySelector('[data-cd="mins"]'),
    secs: cd.querySelector('[data-cd="secs"]'),
  };
  const pad = (n) => String(n).padStart(2, "0");

  function tick() {
    const diff = TARGET - Date.now();
    if (diff <= 0) {
      cd.classList.add("is-live");
      out.days.textContent = out.hours.textContent = out.mins.textContent = out.secs.textContent = "00";
      const cap = document.querySelector(".countdown__caption");
      if (cap) cap.innerHTML = '// <span class="neon-magenta">DOORS ARE OPEN. GO HACK.</span>';
      clearInterval(timer);
      return;
    }
    const s = Math.floor(diff / 1000);
    out.days.textContent = Math.floor(s / 86400);
    out.hours.textContent = pad(Math.floor((s % 86400) / 3600));
    out.mins.textContent = pad(Math.floor((s % 3600) / 60));
    out.secs.textContent = pad(s % 60);
  }
  tick();
  const timer = setInterval(tick, 1000);
})();

// ---------------------------------------------------------------------
// Interactive terminal
// ---------------------------------------------------------------------
(function terminal() {
  const body = document.getElementById("term-body");
  const input = document.getElementById("term-input");
  if (!body || !input) return;

  const print = (html, cls = "") => {
    const div = document.createElement("div");
    div.className = "term__line" + (cls ? " " + cls : "");
    div.innerHTML = html;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
  };

  const days = Math.max(0, Math.ceil((TARGET - Date.now()) / 86400000));

  const COMMANDS = {
    help: () =>
      'available: <span class="c">help whoami date lineup prizes devices prep scoring rsvp defcon sudo clear</span>',
    whoami: () => "guest &mdash; unverified hacker. RSVP to get on the approved list.",
    date: () => 'Tuesday, August 4, 2026 &middot; <span class="m">' + days + " days</span> until doors (start time TBD).",
    lineup: () =>
      '3+ live musicians, including main-stage DEF CON DJs.<br>now featuring <span class="c">CantBeABird</span>. one <span class="m">mystery</span> slot remains.',
    prizes: () => 'top hackers can win a bag of <span class="g">100 GOLD COINS</span>*<br><span class="echo">*not real gold. obviously.</span>',
    devices: () =>
      'bring: routers, cameras, smart plugs, mystery boards, cursed cloud trash,<br>bad ideas from Amazon &mdash; anything with firmware and regrets.',
    prep: () => 'pack a USB-TTL adapter, SOIC clip + flasher, multimeter.<br>install: <span class="c">binwalk flashrom picocom sigrok ghidra</span>. see #prep.',
    scoring: () =>
      "points for: uniqueness, impact, keys, firmware dumps, weird services,<br>cursed findings, and how many times someone says &ldquo;wait, what the f*ck?&rdquo;",
    defcon: () => 'DEF CON 34 &middot; Aug 6&ndash;9, 2026 &middot; LVCC West Hall. we go <span class="m">before</span>.',
    rsvp: () => {
      print('opening Partiful&hellip; <span class="c">' + PARTIFUL_URL + "</span>");
      window.open(PARTIFUL_URL, "_blank", "noopener");
      return "";
    },
    sudo: () => 'nice try. <span class="m">this incident will be reported.</span>',
    ls: () => 'lineup  prizes  devices  prep  scoring  <span class="m">secret.bin</span>',
    cat: () => 'usage: cat &lt;file&gt; &mdash; e.g. <span class="c">cat secret.bin</span>',
    clear: () => {
      body.innerHTML = "";
      return "";
    },
  };

  function run(raw) {
    const line = raw.trim();
    print('<span class="echo">guest@midwestcoast:~$ ' + escapeHtml(raw) + "</span>");
    if (!line) return;
    const [cmd, ...args] = line.split(/\s+/);
    const key = cmd.toLowerCase();

    if (key === "cat" && /secret\.bin/i.test(args[0] || "")) {
      print('<span class="g">CANTBEABIRD WAS HERE</span> &middot; the last device always falls. ☠');
      return;
    }
    const fn = COMMANDS[key];
    if (fn) {
      const out = fn();
      if (out) print(out);
    } else {
      print('<span class="m">' + escapeHtml(cmd) + ': command not found</span> &mdash; try <span class="c">help</span>');
    }
  }

  function escapeHtml(s) {
    return s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
  }

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      run(input.value);
      input.value = "";
    }
  });
  document.getElementById("term").addEventListener("click", () => input.focus());
})();
