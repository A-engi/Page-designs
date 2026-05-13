/* =========================================================
   RF ATLAS SHELL v0.1.34
   Shared shell builder and shell-only interactions.
========================================================= */

(() => {
  /* 01. Page config
     These links can be changed once the real pages exist. */
  const pageLinks = {
    map: "map.html",
    sites: "sites.html",
    rf: "index.html",
    network: "network.html",
    tools: "tools.html",
    dtt: "dtt.html",
    dab: "dab.html",
    fm: "fm.html",
    more: "services.html"
  };

  /* 02. Shared icons
     Icons are inline SVG so the shell has no external dependencies. */
  const icons = {
    menu: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
        <path d="M4 6h16M4 12h16M4 18h16" stroke-linecap="round" />
      </svg>
    `,

    transmitter: `
      <svg class="atlas-transmitter" viewBox="0 0 48 48" fill="none" stroke="currentColor" aria-hidden="true">
        <path d="M24 19v24M17 43l7-24 7 24M15 31h18M19 22h10" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" />
        <circle cx="24" cy="15" r="4" stroke-width="2.6" />
        <path d="M14 16a12 12 0 0 1 0-12M34 4a12 12 0 0 1 0 12M8 20a20 20 0 0 1 0-20M40 0a20 20 0 0 1 0 20" stroke-width="2.6" stroke-linecap="round" />
      </svg>
    `,

    dtt: `
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="16" cy="8.5" r="2.5" stroke-width="2.1" />
        <path d="M16 11v14M11.5 25l4.5-14 4.5 14M10.5 18.5h11" stroke-width="2.1" />
        <path d="M8.5 10.5a7.5 7.5 0 0 1 0-7M23.5 3.5a7.5 7.5 0 0 1 0 7" stroke-width="1.9" />
        <path d="M5 13a12 12 0 0 1 0-12M27 1a12 12 0 0 1 0 12" stroke-width="1.7" opacity="0.92" />
      </svg>
    `,

    dab: `
      <svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
        <circle cx="6" cy="16" r="1.4" />
        <circle cx="10" cy="12.5" r="1.4" /><circle cx="10" cy="16" r="1.4" /><circle cx="10" cy="19.5" r="1.4" />
        <circle cx="14" cy="9.5" r="1.4" /><circle cx="14" cy="13" r="1.4" /><circle cx="14" cy="16.5" r="1.4" /><circle cx="14" cy="20" r="1.4" /><circle cx="14" cy="23.5" r="1.4" />
        <circle cx="18" cy="7" r="1.4" /><circle cx="18" cy="10.5" r="1.4" /><circle cx="18" cy="14" r="1.4" /><circle cx="18" cy="17.5" r="1.4" /><circle cx="18" cy="21" r="1.4" /><circle cx="18" cy="24.5" r="1.4" />
        <circle cx="22" cy="10" r="1.4" /><circle cx="22" cy="13.5" r="1.4" /><circle cx="22" cy="17" r="1.4" /><circle cx="22" cy="20.5" r="1.4" />
        <circle cx="26" cy="13.5" r="1.4" /><circle cx="26" cy="17" r="1.4" /><circle cx="26" cy="20.5" r="1.4" />
      </svg>
    `,

    fm: `
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="16" cy="16" r="4.3" fill="currentColor" stroke="none" opacity="0.95" />
        <circle cx="16" cy="16" r="8.6" stroke-width="1.8" opacity="0.92" />
        <circle cx="16" cy="16" r="12" stroke-width="1.5" opacity="0.72" />
        <path d="M3.5 16h7M21.5 16h7" stroke-width="1.9" opacity="0.96" />
      </svg>
    `,

    more: `
      <svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
        <circle cx="9" cy="16" r="2.5" />
        <circle cx="16" cy="16" r="2.5" />
        <circle cx="23" cy="16" r="2.5" />
      </svg>
    `,

    map: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
        <path d="M3 6.5 9 4l6 2.5 6-2.5v13.5L15 20l-6-2.5L3 20V6.5Z" stroke-linejoin="round" />
        <path d="M9 4v13.5M15 6.5V20" />
      </svg>
    `,

    sites: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
        <path d="M4 11.5 12 5l8 6.5V20H6v-8" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M10 20v-6h4v6" stroke-linejoin="round" />
      </svg>
    `,

    rf: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
        <path d="M12 10v11M8 21l4-11 4 11M8.5 16h7" stroke-linecap="round" stroke-linejoin="round" />
        <circle cx="12" cy="7" r="2.25" />
        <path d="M6.5 8a6 6 0 0 1 0-6M17.5 2a6 6 0 0 1 0 6M3.5 10a10 10 0 0 1 0-10M20.5 0a10 10 0 0 1 0 10" stroke-linecap="round" />
      </svg>
    `,

    network: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <rect x="9" y="3" width="6" height="5" rx="1.1" />
        <rect x="4" y="16" width="5" height="5" rx="1.1" />
        <rect x="15" y="16" width="5" height="5" rx="1.1" />
        <path d="M12 8v4M6.5 16v-4h11v4" />
      </svg>
    `,

    tools: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M21 6.4a5 5 0 0 1-6.3 6.2L8.1 19.2a2.6 2.6 0 0 1-3.7-3.7l6.6-6.6A5 5 0 0 1 17.2 2.6l-3 3 2.2 2.2 3-3c.6.4 1.1.9 1.6 1.6Z" />
        <path d="M6.1 17.4h.1" />
      </svg>
    `
  };

  /* 03. Shell markup
     The header and footer are injected into any page with .phone. */
  const buildHeader = () => `
    <header class="top-shell">
      <section class="command-row" aria-label="App header">
        <button class="menu-button" type="button" aria-label="Open menu">${icons.menu}</button>

        <button class="atlas-command" type="button" aria-label="Open search">
          <span class="search-symbol" aria-hidden="true"></span>
          <span class="command-search-text">Search</span>
          <span class="command-divider" aria-hidden="true"></span>
          <span class="atlas-identity" aria-label="ATLAS">
            ${icons.transmitter}
            <span class="atlas-mini-word">ATLAS</span>
          </span>
        </button>
      </section>

      <nav class="quick-access" aria-label="Quick access">
        <a class="quick-chip is-dtt" href="${pageLinks.dtt}" aria-label="DTT">${icons.dtt}<span>DTT</span></a>
        <a class="quick-chip is-dab" href="${pageLinks.dab}" aria-label="DAB">${icons.dab}<span>DAB</span></a>
        <a class="quick-chip is-fm" href="${pageLinks.fm}" aria-label="FM">${icons.fm}<span>FM</span></a>
        <a class="quick-chip is-more" href="${pageLinks.more}" aria-label="More">${icons.more}<span>More</span></a>
      </nav>

      <button class="quick-toggle" type="button" aria-label="Collapse service buttons" aria-expanded="true"></button>
    </header>
  `;

  /* The bottom nav classes are calculated so the active tab has real blue gaps either side. */
  const buildFooter = (activePage) => {
    const items = [
      ["map", "Map"],
      ["sites", "Sites"],
      ["rf", "RF"],
      ["network", "Network"],
      ["tools", "Tools"]
    ];

    const activeIndex = Math.max(0, items.findIndex(([key]) => key === activePage));

    const itemMarkup = items.map(([key, label], index) => {
      const classes = ["nav-item"];

      if (key === activePage) classes.push("is-active");
      if (index === activeIndex - 1) classes.push("is-group-end");
      if (index === activeIndex + 1) classes.push("is-group-start");

      return `
        <a class="${classes.join(" ")}" href="${pageLinks[key]}" aria-label="${label}" ${key === activePage ? 'aria-current="page"' : ""}>
          ${icons[key]}
          <span>${label}</span>
        </a>
      `;
    }).join("");

    return `
      <footer class="bottom-shell">
        <nav class="bottom-nav" aria-label="Primary navigation">${itemMarkup}</nav>
      </footer>
    `;
  };

  /* 04. Shell boot
     This creates the shell, ensures a content canvas exists, and wires interactions. */
  const app = document.querySelector(".phone");
  if (!app) return;

  const activePage = app.dataset.page || "rf";
  app.dataset.version = app.dataset.version || "0.1.34";

  let content = app.querySelector(".content-canvas");
  if (!content) {
    content = document.createElement("section");
    content.className = "content-canvas";
    content.setAttribute("aria-label", "Content canvas");
    content.innerHTML = '<div class="blank-canvas" aria-hidden="true"></div>';
    app.append(content);
  }

  app.insertAdjacentHTML("afterbegin", buildHeader());
  app.insertAdjacentHTML("beforeend", buildFooter(activePage));

  /* 05. Shell interaction
     The quick row collapses and the content snaps to the shortened shell. */
  const toggle = app.querySelector(".quick-toggle");

  const setCollapsed = (collapsed) => {
    app.classList.toggle("quick-collapsed", collapsed);
    toggle.setAttribute("aria-expanded", String(!collapsed));
    toggle.setAttribute(
      "aria-label",
      collapsed ? "Expand service buttons" : "Collapse service buttons"
    );
  };

  setCollapsed(app.dataset.quick === "collapsed");

  toggle.addEventListener("click", () => {
    setCollapsed(!app.classList.contains("quick-collapsed"));
  });
})();
