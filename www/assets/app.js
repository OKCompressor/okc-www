const year = new Date().getFullYear();
document.querySelectorAll("[data-year]").forEach(el => el.textContent = year);

document.querySelectorAll("[data-copy]").forEach(btn => {
  btn.addEventListener("click", async () => {
    const target = document.querySelector(btn.dataset.copy);
    if (!target) return;
    try {
      await navigator.clipboard.writeText(target.innerText);
      const old = btn.innerText;
      btn.innerText = "Copied";
      setTimeout(() => btn.innerText = old, 1200);
    } catch(e) {
      btn.innerText = "Copy failed";
    }
  });
});

function manifestURL() {
  const script = document.currentScript;
  if (script?.src) return new URL("releases.json", new URL(".", script.src)).href;
  return "/assets/releases.json";
}

function niceStatus(s) {
  return String(s || "queued").replaceAll("-", " ").toUpperCase();
}

function addButton(container, label, href, cls="btn ghost") {
  if (!container || !href) return;
  const a = document.createElement("a");
  a.className = cls;
  a.href = href;
  a.textContent = label;
  if (/^https?:/.test(href)) {
    a.target = "_blank";
    a.rel = "noreferrer";
  }
  container.appendChild(a);
}

function renderCard(card, p) {
  card.querySelector("[data-release-status]")?.replaceChildren(document.createTextNode(niceStatus(p.status)));

  const binary = card.querySelector("[data-release-binary]");
  if (binary) {
    const version = p.version ? `v${p.version}` : niceStatus(p.status);
    const availability = p.download?.primary ? version : `${version} · link pending`;
    binary.textContent = `${availability} · ${p.download?.price || "€0"}`;
  }

  const rust = card.querySelector("[data-release-rust]");
  if (rust && p.source?.rust?.price) rust.textContent = p.source.rust.price;

  const actions = card.querySelector("[data-release-actions]");
  if (actions) {
    if (p.download?.primary) addButton(actions, "Download ↘", p.download.primary, "btn primary");
    if (p.source?.python?.url) addButton(actions, `Python source ${p.source.python.price || ""} ↗`, p.source.python.url);
    if (p.source?.rust?.url) addButton(actions, `Rust source ${p.source.rust.price || ""} ↗`, p.source.rust.url);
    if (p.repository) addButton(actions, "Repository ↗", p.repository);
    if (p.release) addButton(actions, "Release ↗", p.release);
    if (p.commercial?.url) addButton(actions, "Commercial ↗", p.commercial.url);
  }

  const mirrors = card.querySelector("[data-release-mirrors]");
  if (mirrors) {
    mirrors.innerHTML = "";
    const all = p.download?.mirrors || [];
    if (all.length) {
      const label = document.createElement("span");
      label.className = "small";
      label.textContent = "mirrors: ";
      mirrors.appendChild(label);
      all.forEach((m, i) => {
        const a = document.createElement("a");
        a.href = m.url;
        a.textContent = m.label || `mirror ${i+1}`;
        a.target = "_blank";
        a.rel = "noreferrer";
        mirrors.appendChild(a);
        if (i < all.length - 1) mirrors.append(" · ");
      });
    }
  }
}

function renderProductPage(main, p) {
  const box = main.querySelector("[data-release-page-summary]");
  if (!box) return;
  box.innerHTML = "";
  const rows = [
    ["status", niceStatus(p.status)],
    ["version", p.version ? `v${p.version}` : "not tagged"],
    ["target", p.release_target || "—"],
    ["scope", p.scope || "—"],
    ["free artifact", p.download?.primary ? "published" : "queued / link pending"],
    ["Python source", `${p.source?.python?.status || "—"}${p.source?.python?.price ? " · " + p.source.python.price : ""}`],
    ["Rust/native source", `${p.source?.rust?.status || "—"}${p.source?.rust?.price ? " · " + p.source.rust.price : ""}`],
  ];
  rows.forEach(([k,v]) => {
    const row = document.createElement("div");
    row.className = "price-line";
    const a = document.createElement("span"); a.textContent = k;
    const b = document.createElement("strong"); b.textContent = v;
    row.append(a,b); box.appendChild(row);
  });
  const actions = document.createElement("div");
  actions.className = "artifact-actions";
  addButton(actions, "Primary download ↘", p.download?.primary, "btn primary");
  addButton(actions, "Release page ↗", p.release);
  addButton(actions, "Repository ↗", p.repository);
  (p.download?.mirrors || []).forEach(m => addButton(actions, `${m.label || "Mirror"} ↗`, m.url));
  addButton(actions, "Python source ↗", p.source?.python?.url);
  addButton(actions, "Rust/native source ↗", p.source?.rust?.url);
  addButton(actions, "Commercial ↗", p.commercial?.url);
  box.appendChild(actions);
}

fetch(manifestURL(), {cache: "no-store"})
  .then(r => {
    if (!r.ok) throw new Error(`release manifest HTTP ${r.status}`);
    return r.json();
  })
  .then(data => {
    const products = data.products || {};
    document.querySelectorAll("[data-product]").forEach(card => {
      const p = products[card.dataset.product];
      if (p) renderCard(card, p);
    });

    document.querySelectorAll("[data-release-terminal]").forEach(el => {
      const p = products[el.dataset.releaseTerminal];
      if (!p) return;
      el.className = p.download?.primary ? "good" : "warn";
      el.textContent = `${p.name.padEnd(10)} → ${p.version ? "v"+p.version : niceStatus(p.status)}`;
    });

    document.querySelectorAll("main[data-release-page]").forEach(main => {
      const p = products[main.dataset.releasePage];
      if (p) renderProductPage(main, p);
    });
  })
  .catch(err => {
    console.warn("OKC release manifest unavailable; static fallback stays visible.", err);
  });
