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
// Countdown — doors on the Tuesday before DEF CON 34 (placeholder 6pm PT).
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
// Terminal emulator + DEF CON text adventure
// ---------------------------------------------------------------------
(function terminal() {
  const root = document.getElementById("term");
  const body = document.getElementById("term-body");
  const input = document.getElementById("term-input");
  const ps1 = document.getElementById("term-ps1");
  if (!root || !body || !input) return;

  const esc = (s) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));

  // print rich HTML / print raw text (newlines preserved via CSS pre-wrap)
  function line(html, cls) {
    const d = document.createElement("div");
    d.className = "term__line" + (cls ? " " + cls : "");
    d.innerHTML = html;
    body.appendChild(d);
    body.scrollTop = body.scrollHeight;
  }
  function text(s) {
    const d = document.createElement("div");
    d.className = "term__line";
    d.textContent = s;
    body.appendChild(d);
    body.scrollTop = body.scrollHeight;
  }

  // ---- virtual filesystem ----
  const days = Math.max(0, Math.ceil((TARGET - Date.now()) / 86400000));
  const FS = {
    name: "~", type: "dir", children: {
      "README.txt": { type: "file", body: "MIDWESTCOAST.BEST shell.\nThe Tuesday before DEF CON 34. Bring something with firmware and regrets.\npsst: run `adventure` — there's a flag for the taking." },
      "lineup.txt": { type: "file", body: "your host: Aask (midwest x west coast)\nfeaturing: CantBeABird (hosting, not spinning)\n+ main-stage DEF CON DJs, one mystery slot" },
      "prizes.txt": { type: "file", body: "top hackers win 100 GOLD COINS*\n*not real gold. obviously." },
      "scoring.txt": { type: "file", body: "points: uniqueness, impact, keys, firmware dumps, weird services,\ncursed findings, and 'wait, what the f*ck?' count.\ndump your own device — or the one next to you. fair game." },
      ".flag": { type: "file", body: "nice try. the flag is earned, not catted.\nrun: adventure" },
      villages: { type: "dir", children: {
        "iot.txt": { type: "file", body: "IoT Village: bring routers, cameras, smart plugs, mystery boards." },
        "hardware.txt": { type: "file", body: "Hardware Hacking Village: solder, UART, SPI clips, FT232s." },
        "crypto.txt": { type: "file", body: "Crypto & Privacy Village: locks, ciphers, and sealed laptops." },
      } },
    },
  };
  let cwd = [FS]; // stack of dir nodes

  function cwdPath() {
    return cwd.map((n) => n.name).join("/").replace(/^~\/?/, "~/").replace(/\/$/, "") || "~";
  }
  function resolve(path) {
    let nodes = path.startsWith("~") || path.startsWith("/") ? [FS] : cwd.slice();
    for (const part of path.split("/")) {
      if (!part || part === "~" || part === ".") continue;
      if (part === "..") { if (nodes.length > 1) nodes.pop(); continue; }
      const cur = nodes[nodes.length - 1];
      const child = cur.children && cur.children[part];
      if (!child) return null;
      if (child.type === "dir") { child.name = part; nodes.push(child); }
      else return { file: child, name: part };
    }
    return { dir: nodes };
  }

  // ---- shell commands ----
  const BANNER =
    "  __  __ ___ ____  _    _ ___ ___ _____\n" +
    " |  \\/  |_ _|  _ \\| |  | / __/ __|_   _|\n" +
    " | |\\/| || || |_) | |/\\| \\__ \\__ \\ | |   midwest x west coast\n" +
    " |_|  |_|___|____/|__/\\__|___/___/ |_|   pre-def con firmware bonanza";

  const CMDS = {
    help() {
      line('<span class="c">commands:</span> help  ls  cd  cat  pwd  echo  whoami  date  history  banner  neofetch  clear');
      line('<span class="c">party:</span> lineup  prizes  prep  scoring  devices  defcon  rsvp');
      line('<span class="m">game:</span> adventure  &mdash; hack your way through DEF CON and find the flag 🚩');
    },
    ls(args) {
      const r = resolve(args[0] || ".");
      if (!r) return text("ls: no such path: " + args[0]);
      if (r.file) return line('<span class="g">' + esc(r.name) + "</span>");
      const node = r.dir[r.dir.length - 1];
      const names = Object.keys(node.children || {}).sort();
      line(names.map((n) => (node.children[n].type === "dir" ? '<span class="c">' + n + "/</span>" : (n.startsWith(".") ? '<span class="echo">' + n + "</span>" : n))).join("   ") || "(empty)");
    },
    cd(args) {
      const t = args[0] || "~";
      if (t === "~" || t === "/") { cwd = [FS]; return; }
      const r = resolve(t);
      if (!r || r.file) return text("cd: not a directory: " + t);
      cwd = r.dir;
    },
    pwd() { text(cwdPath()); },
    cat(args) {
      if (!args[0]) return text("usage: cat <file>");
      const r = resolve(args[0]);
      if (!r || !r.file) return text("cat: no such file: " + args[0]);
      text(r.file.body);
    },
    echo(args) { text(args.join(" ")); },
    whoami() { text("guest — unverified hacker. RSVP to get on the approved list."); },
    date() { line('Tuesday, August 4, 2026 &middot; <span class="m">' + days + " days</span> to doors (start TBD)."); },
    history() { hist.forEach((h, i) => text(String(i + 1).padStart(3) + "  " + h)); },
    banner() { text(BANNER); },
    neofetch() {
      line('<span class="c">guest@defcon</span>');
      line("OS: MidwestCoastOS 2.0 (cursed)   Uptime: " + days + "d to chaos");
      line('Shell: zsh-but-evil   Host: <span class="m">LVCC West Hall</span>');
      line('Packages: binwalk, flashrom, ghidra, regret   Mood: <span class="g">drink all the booze, hack all the things</span>');
    },
    lineup() { CMDS.cat(["lineup.txt"]); },
    prizes() { CMDS.cat(["prizes.txt"]); },
    scoring() { CMDS.cat(["scoring.txt"]); },
    prep() { line('pack a USB-TTL adapter, SOIC clip + flasher, multimeter.<br>install: <span class="c">binwalk flashrom picocom sigrok ghidra</span> &middot; see #prep'); },
    devices() { line("bring: routers, cameras, smart plugs, mystery boards, cursed cloud trash,<br>bad ideas from Amazon — anything with firmware and regrets."); },
    defcon() { line('DEF CON 34 &middot; Aug 6&ndash;9, 2026 &middot; LVCC West Hall. we go <span class="m">before</span>.'); },
    rsvp() { line('opening Partiful&hellip; <span class="c">' + PARTIFUL_URL + "</span>"); window.open(PARTIFUL_URL, "_blank", "noopener"); },
    sudo() { line('<span class="m">guest is not in the sudoers file. This incident will be reported.</span>'); },
    clear() { body.innerHTML = ""; },
    adventure() { Game.start(); },
    play() { Game.start(); },
    exit() { text("there is no escape from the firmware. (try `clear`)"); },
  };

  // =====================================================================
  // DEF CON text adventure
  // =====================================================================
  const FLAG_B64 = "WW9ValVzVHdPblRoRWdBbUU=";
  const CODE = "l1n3c0n_l00p"; // hidden in the router firmware dump

  const ITEMS = {
    cash: { name: "a wad of cash", look: "Crumpled twenties. Enough for one human badge." },
    badge: { name: "a DEF CON 34 badge", look: "A glowing electronic badge. Your ticket past the goons." },
    cable: { name: "a USB-TTL cable", look: "An FT232 serial cable. GND/TX/RX, 3.3V. The key to a board's soul." },
    router: { name: "the DemoCorp R7 router", look: "UART pads exposed, no password sticker. Begging to be dumped.\nYou need a USB-TTL cable to talk to it." },
  };

  const ROOMS = {
    street: {
      name: "PARADISE RD",
      desc: "Outside the LVCC West Hall. Heat shimmers off the asphalt; a flyer skitters past your boots.\nThe entrance is NORTH.",
      exits: { north: "line" },
      look: { flyer: "MIDWESTCOAST.BEST — 'bring the weird IoT thing you forgot about.'", entrance: "Glass doors. A river of lanyards flows in." },
    },
    line: {
      name: "LINECON",
      desc: "The line bends spacetime. A goon in a black shirt eyes your empty lanyard.\nRegistration is NORTH. The street is SOUTH.",
      exits: { north: "reg", south: "street" },
      look: { goon: "GOON: 'No badge? Reg desk is right there. Keep it movin'.'", line: "It hasn't moved in 45 minutes. Classic." },
    },
    reg: {
      name: "REGISTRATION",
      desc: "A bored human slides a badge across the table. 'Four-sixty. Cash only.'\nThe CONCOURSE is NORTH (badge required). Line is SOUTH.",
      exits: { north: "concourse", south: "line" },
      look: { human: "They have seen things. Mostly other people's hangovers.", desk: "Stacks of badges and zip-tie lanyards." },
    },
    concourse: {
      name: "THE CONCOURSE",
      desc: "A roar of soldering irons and sub-bass. Villages branch off in every direction.\nIoT VILLAGE is EAST. HARDWARE HACKING is WEST. CRYPTO & PRIVACY is NORTH. Registration is SOUTH.",
      exits: { east: "iot", west: "hardware", north: "crypto", south: "reg" },
      look: { crowd: "Hackers, feds-who-say-they're-not-feds, and a person in a full inflatable shark costume." },
    },
    iot: {
      name: "IoT VILLAGE",
      desc: "On a folding table, a DemoCorp R7 travel router blinks green. Its UART pads are exposed and begging.\nThe concourse is WEST.",
      exits: { west: "concourse" },
      look: {},
    },
    hardware: {
      name: "HARDWARE HACKING VILLAGE",
      desc: "Bins of adapters, clips, and questionable FT232s. A USB-TTL CABLE pokes out of a bin, free for the taking.\nThe concourse is EAST.",
      exits: { east: "concourse" },
      look: { bin: "Mostly broken JTAG clips. But that cable looks alive." },
    },
    crypto: {
      name: "CRYPTO & PRIVACY VILLAGE",
      desc: "A sealed black laptop hums on a pedestal. A prompt blinks: ENTER PASSPHRASE.\nThe concourse is SOUTH.",
      exits: { south: "concourse" },
      look: { laptop: "Locked. It wants a passphrase you don't have yet. Maybe a device knows it." },
    },
  };

  const DIRS = { n: "north", s: "south", e: "east", w: "west", north: "north", south: "south", east: "east", west: "west" };

  const Game = {
    on: false,
    state: null,
    start() {
      this.on = true;
      this.state = { room: "street", inv: new Set(["cash"]), placed: { hardware: new Set(["cable"]), iot: new Set(["router"]) }, dumped: false };
      line('<span class="m">== HACK YOUR WAY THROUGH DEF CON 34 ==</span>');
      text("Goal: get in, get a badge, get to the firmware, find the flag.");
      line('Type <span class="c">look</span>, <span class="c">go north</span> (or just <span class="c">n</span>), <span class="c">take</span>, <span class="c">use</span>, <span class="c">inv</span>, <span class="c">help</span>, <span class="c">quit</span>.');
      this.look();
      setPrompt();
    },
    stop() { this.on = false; line('<span class="echo">[ left the game — back to shell ]</span>'); setPrompt(); },
    room() { return ROOMS[this.state.room]; },
    here() { return this.state.placed[this.state.room] || new Set(); },
    look() {
      const r = this.room();
      line('<span class="c">[ ' + r.name + " ]</span>");
      text(r.desc);
      const items = [...this.here()];
      if (items.length) text("You see: " + items.map((i) => ITEMS[i].name).join(", ") + ".");
    },
    move(dir) {
      const r = this.room();
      const dest = r.exits[dir];
      if (!dest) return text("You can't go " + dir + " from here.");
      if (this.state.room === "reg" && dest === "concourse" && !this.state.inv.has("badge")) {
        return line('<span class="m">A goon blocks you:</span> \'No badge, no entry. Reg desk is right here.\'');
      }
      this.state.room = dest;
      this.look();
    },
    take(noun) {
      const set = this.here();
      const id = [...set].find((i) => i === noun || ITEMS[i].name.includes(noun));
      if (!id) return text("There's no '" + noun + "' to take here.");
      if (id === "router") return text("The router is bolted to the table. You dump it in place, not pocket it.");
      set.delete(id); this.state.inv.add(id);
      line('Taken: <span class="g">' + ITEMS[id].name + "</span>");
    },
    examine(noun) {
      if (!noun) return this.look();
      const invId = [...this.state.inv].find((i) => i === noun || ITEMS[i].name.includes(noun));
      const hereId = [...this.here()].find((i) => i === noun || ITEMS[i].name.includes(noun));
      if (invId || hereId) return text(ITEMS[invId || hereId].look);
      const scenery = this.room().look[noun];
      if (scenery) return text(scenery);
      text("You examine the " + noun + ". Nothing jumps out.");
    },
    inv() {
      const items = [...this.state.inv];
      text(items.length ? "Inventory: " + items.map((i) => ITEMS[i].name).join(", ") : "Your pockets are empty.");
    },
    buy(noun) {
      if (this.state.room !== "reg") return text("Nothing to buy here.");
      if (!/badge/.test(noun || "badge")) return text("They only sell badges.");
      if (this.state.inv.has("badge")) return text("You already have a badge.");
      if (!this.state.inv.has("cash")) return text("You're out of cash. Should've skipped the $14 beer.");
      this.state.inv.delete("cash"); this.state.inv.add("badge");
      line('You slap down the cash. <span class="g">Got: a DEF CON 34 badge.</span> The concourse opens up NORTH.');
    },
    dump(noun) {
      if (this.state.room !== "iot") return text("There's nothing here worth dumping.");
      if (!/router|r7|device|firmware/.test(noun || "router")) return text("Dump what, exactly?");
      if (!this.state.inv.has("cable")) return line('<span class="m">No connection.</span> Those UART pads need a USB-TTL cable. (Hardware Village had one.)');
      this.state.dumped = true;
      text("[*] Attaching to UART @ 115200 8N1 ...\n[*] Dropping to U-Boot ... done\n[*] Dumping SPI flash (4096 KB) ........ ok\n[*] strings firmware.bin | grep -i pass");
      line('    &gt;&gt; <span class="g">admin_passphrase=' + CODE + "</span>");
      line('<span class="c">[+] Firmware dumped.</span> Scribble that passphrase down. The Crypto Village laptop wants one.');
    },
    unlock(arg) {
      if (this.state.room !== "crypto") return text("There's nothing locked here.");
      if (!arg) return text("usage: unlock <passphrase>");
      if (arg === CODE) {
        const flag = atob(FLAG_B64);
        line('<span class="g">*** CLICK ***</span> The laptop unlocks. A single line glows:');
        line('<span class="m" style="font-size:1.1em">' + flag + "</span>");
        text("You dumped the last device before DEF CON even started.\nBring this flag to MIDWESTCOAST.BEST and claim your gold. (Not real gold. Obviously.)");
        line('<span class="echo">[ you win — type `quit` to drop back to shell ]</span>');
      } else {
        line('<span class="m">DENIED.</span> The passphrase is wrong. Maybe a device knows the real one.');
      }
    },
    help() {
      line('<span class="c">verbs:</span> look(l)  go <dir> / n s e w  examine(x) <thing>  take <item>  use <item>  inv(i)');
      line('<span class="c">special:</span> buy badge  dump router  unlock <passphrase>  map  quit');
    },
    map() {
      text(
        "        [crypto]\n           |\n[hardware]-[concourse]-[iot]\n           |\n         [reg]\n           |\n         [line]\n           |\n        [street]"
      );
    },
    handle(raw) {
      const t = raw.trim().toLowerCase();
      if (!t) return;
      const parts = t.split(/\s+/);
      let verb = parts[0];
      const rest = parts.slice(1).join(" ");
      if (["quit", "exit", "q"].includes(verb)) return this.stop();
      if (["look", "l"].includes(verb)) return this.look();
      if (["help", "?", "h"].includes(verb)) return this.help();
      if (["map", "m"].includes(verb)) return this.map();
      if (["inv", "inventory", "i"].includes(verb)) return this.inv();
      if (["examine", "x", "inspect", "look-at"].includes(verb)) return this.examine(rest);
      if (["take", "get", "grab", "pick"].includes(verb)) return this.take(rest.replace(/^up /, ""));
      if (["buy", "pay"].includes(verb)) return this.buy(rest);
      if (["dump", "flash", "read"].includes(verb)) return this.dump(rest);
      if (["unlock", "enter", "type"].includes(verb)) return this.unlock(parts[1] || "");
      if (verb === "go" || verb === "move" || verb === "walk") {
        const d = DIRS[parts[1]];
        return d ? this.move(d) : text("Go where? Try a direction.");
      }
      if (DIRS[verb]) return this.move(DIRS[verb]);
      if (verb === "use") {
        if (this.state.room === "iot") return this.dump("router");
        if (this.state.room === "reg") return this.buy("badge");
        return text("Use it how? Be specific (e.g. `dump router`, `unlock <code>`).");
      }
      text("I don't know how to '" + esc(verb) + "'. Try `help`.");
    },
  };

  // ---- prompt + history + input handling ----
  const hist = [];
  let hidx = -1;

  function setPrompt() {
    if (!ps1) return;
    ps1.textContent = Game.on ? "defcon>" : "guest@defcon:" + cwdPath() + "$";
  }

  function runShell(raw) {
    const argv = raw.trim().split(/\s+/);
    const cmd = argv[0].toLowerCase();
    const fn = CMDS[cmd];
    if (fn) fn(argv.slice(1));
    else line('<span class="m">' + esc(cmd) + ": command not found</span> — try <span class=\"c\">help</span> or <span class=\"m\">adventure</span>");
  }

  function submit(raw) {
    line('<span class="echo">' + esc(ps1 ? ps1.textContent : "$") + " " + esc(raw) + "</span>");
    if (raw.trim()) { hist.push(raw); hidx = hist.length; }
    if (Game.on) Game.handle(raw);
    else if (raw.trim()) runShell(raw);
    setPrompt();
  }

  function complete() {
    const v = input.value;
    if (v.includes(" ")) return; // only complete the first token
    const pool = Game.on ? ["look", "go", "north", "south", "east", "west", "take", "examine", "inventory", "buy", "dump", "unlock", "map", "help", "quit"] : Object.keys(CMDS);
    const hits = pool.filter((c) => c.startsWith(v.toLowerCase()));
    if (hits.length === 1) input.value = hits[0];
    else if (hits.length > 1) line('<span class="echo">' + hits.join("  ") + "</span>");
  }

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") { const v = input.value; input.value = ""; submit(v); }
    else if (e.key === "Tab") { e.preventDefault(); complete(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); if (hidx > 0) input.value = hist[--hidx]; }
    else if (e.key === "ArrowDown") { e.preventDefault(); if (hidx < hist.length - 1) input.value = hist[++hidx]; else { hidx = hist.length; input.value = ""; } }
    else if (e.ctrlKey && e.key.toLowerCase() === "l") { e.preventDefault(); body.innerHTML = ""; }
  });
  root.addEventListener("click", () => input.focus());
  setPrompt();
})();
