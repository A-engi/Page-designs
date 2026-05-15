/* RF Atlas demo map renderer
   Uses private/real graph data if it exists, otherwise falls back to demo nodes. */

(() => {
  const FALLBACK_GRAPH = {
    nodes: [
      { id: "glasgow", name: "Glasgow", type: "core", x: 0.12, y: 0.18 },
      { id: "edinburgh", name: "Edinburgh", type: "core", x: 0.58, y: 0.18 },
      { id: "manchester", name: "Manchester", type: "main", x: 0.30, y: 0.42 },
      { id: "birmingham", name: "Birmingham", type: "main", x: 0.34, y: 0.58 },
      { id: "london", name: "London", type: "core", x: 0.48, y: 0.82, size: "large" },
      { id: "hilltop", name: "Hilltop", type: "relay", x: 0.72, y: 0.40 },
      { id: "ridgeway", name: "Ridgeway", type: "relay", x: 0.84, y: 0.56 },
      { id: "valley", name: "Valley", type: "remote", x: 0.14, y: 0.78 },
      { id: "pinewood", name: "Pinewood", type: "remote", x: 0.88, y: 0.82 }
    ],
    links: [
      { from: "glasgow", to: "manchester", type: "main" },
      { from: "edinburgh", to: "manchester", type: "main" },
      { from: "manchester", to: "birmingham", type: "main" },
      { from: "birmingham", to: "london", type: "main" },
      { from: "london", to: "valley", type: "backup" },
      { from: "london", to: "pinewood", type: "backup" },
      { from: "london", to: "hilltop", type: "alert" },
      { from: "hilltop", to: "ridgeway", type: "backup" },
      { from: "ridgeway", to: "pinewood", type: "backup" }
    ],
    selectedPathId: "london-hilltop"
  };

  const typeLabel = (type) => ({
    core: "CORE",
    main: "MAIN",
    relay: "RELAY",
    remote: "REMOTE"
  }[type] || String(type || "SITE").toUpperCase());

  const validateGraph = (data) => (
    data &&
    Array.isArray(data.nodes) &&
    data.nodes.length > 0 &&
    Array.isArray(data.links)
  );

  const getGraphData = async () => {
    if (validateGraph(window.ATLAS_PRIVATE_GRAPH)) return window.ATLAS_PRIVATE_GRAPH;
    if (validateGraph(window.ATLAS_NETWORK_GRAPH)) return window.ATLAS_NETWORK_GRAPH;

    try {
      const response = await fetch("./data/rf-network-map.json", { cache: "no-store" });
      if (response.ok) {
        const json = await response.json();
        if (validateGraph(json)) return json;
      }
    } catch (_) {}

    return FALLBACK_GRAPH;
  };

  const svg = (tag, attrs = {}, children = []) => {
    const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
    Object.entries(attrs).forEach(([key, value]) => {
      if (value !== null && value !== undefined) el.setAttribute(key, String(value));
    });
    children.forEach((child) => el.appendChild(child));
    return el;
  };

  const text = (value) => document.createTextNode(value);

  const makeMast = (x, y, scale = 1) => {
    const g = svg("g", { transform: `translate(${x} ${y}) scale(${scale})`, class: "mast" });
    g.append(
      svg("path", { d: "M0 -10v22M-7 12L0-10l7 22M-6 3H6M-4-4H4" }),
      svg("circle", { cx: 0, cy: -12, r: 2.2, fill: "currentColor", stroke: "none" }),
      svg("path", { d: "M-6-14C-12-8-12 0-6 6M6-14C12-8 12 0 6 6" }),
      svg("path", { d: "M-11-19C-21-9-21 5-11 15M11-19C21-9 21 5 11 15", opacity: 0.82 })
    );
    return g;
  };

  const render = (mount, graph) => {
    const rect = mount.getBoundingClientRect();
    const width = Math.max(260, Math.round(rect.width));
    const height = Math.max(120, Math.round(rect.height));
    const padX = Math.max(18, width * 0.055);
    const padY = Math.max(14, height * 0.075);

    const xOf = (node) => padX + node.x * (width - padX * 2);
    const yOf = (node) => padY + node.y * (height - padY * 2);

    const nodes = new Map(graph.nodes.map((node) => [node.id, node]));

    const root = svg("svg", {
      viewBox: `0 0 ${width} ${height}`,
      role: "img",
      "aria-label": "Demo network map"
    });

    root.append(svg("rect", { class: "demo-map-bg", x: 0, y: 0, width, height }));

    const linkLayer = svg("g", { class: "demo-links" });
    graph.links.forEach((link) => {
      const a = nodes.get(link.from);
      const b = nodes.get(link.to);
      if (!a || !b) return;

      const x1 = xOf(a);
      const y1 = yOf(a);
      const x2 = xOf(b);
      const y2 = yOf(b);
      const dx = x2 - x1;
      const curve = Math.max(-55, Math.min(55, dx * 0.16));
      const d = `M${x1} ${y1} C${x1 + curve} ${y1 + height * 0.035}, ${x2 - curve} ${y2 - height * 0.035}, ${x2} ${y2}`;

      if (link.type !== "alert") {
        linkLayer.append(svg("path", { class: `demo-route demo-link-soft ${link.type === "backup" ? "is-backup" : "is-main"}`, d }));
      }
      linkLayer.append(svg("path", { class: `demo-route is-${link.type || "main"}`, d }));
    });
    root.append(linkLayer);

    const dotLayer = svg("g", { class: "demo-route-dots" });
    graph.links.forEach((link) => {
      const a = nodes.get(link.from);
      const b = nodes.get(link.to);
      if (!a || !b) return;
      const cx = (xOf(a) + xOf(b)) / 2;
      const cy = (yOf(a) + yOf(b)) / 2;
      dotLayer.append(svg("circle", {
        class: `demo-route-dot ${link.type === "alert" ? "red" : link.type === "backup" ? "blue" : "green"}`,
        cx,
        cy,
        r: link.type === "alert" ? 6 : 4
      }));
    });
    root.append(dotLayer);

    const nodeLayer = svg("g", { class: "demo-nodes" });
    graph.nodes.forEach((node) => {
      const x = xOf(node);
      const y = yOf(node);
      const big = node.size === "large";
      const radius = big ? 22 : node.type === "relay" ? 19 : 16;
      const marker = svg("g", { class: `demo-node ${node.type}`, transform: `translate(${x} ${y})` });

      marker.append(
        svg("circle", { class: `halo ${node.type}`, r: radius + 8, fill: node.type === "relay" ? "#ff5d32" : "#e8d9a0" }),
        svg("circle", { class: node.type, r: radius, "stroke-width": node.type === "relay" ? 2.6 : 2.2 }),
        svg("circle", { class: "inner-ring", r: radius - 5 }),
        makeMast(0, 0, big ? 0.68 : 0.54)
      );

      nodeLayer.append(marker);

      const labelSide = x > width * 0.72 ? -1 : 1;
      const labelX = x + labelSide * (radius + 10);
      const labelY = y - 4;
      const label = svg("text", {
        class: `demo-label ${node.type}`,
        x: labelX,
        y: labelY,
        "text-anchor": labelSide < 0 ? "end" : "start"
      });

      const name = svg("tspan", { class: "name", x: labelX, y: labelY });
      name.append(text(node.name || node.id));
      const type = svg("tspan", { class: "type", x: labelX, dy: 13 });
      type.append(text(typeLabel(node.type)));

      label.append(name, type);
      nodeLayer.append(label);
    });
    root.append(nodeLayer);

    const compass = svg("g", {
      class: "demo-compass",
      transform: `translate(${padX + 28} ${height - padY - 24})`
    });
    compass.append(
      svg("circle", { r: 22 }),
      svg("path", { d: "M0-30V30M-30 0H30M-21-21L21 21M21-21L-21 21" }),
      svg("path", { d: "M0-22L5-5L22 0L5 5L0 22L-5 5L-22 0L-5-5Z" })
    );
    const n = svg("text", { x: -3, y: -31 });
    n.append(text("N"));
    compass.append(n);
    root.append(compass);

    const legendW = Math.min(230, width - padX * 2);
    const legendX = padX;
    const legendY = height - padY - 12;
    const legend = svg("g", { transform: `translate(${legendX} ${legendY})` });
    legend.append(svg("rect", { class: "demo-legend", x: 0, y: 0, width: legendW, height: 18, rx: 7 }));

    [
      ["Core", "#106228"],
      ["Main", "#106228"],
      ["Relay", "#9f231a"],
      ["Remote", "#1b4d81"]
    ].forEach(([label, color], index) => {
      const itemX = 14 + index * (legendW / 4);
      legend.append(svg("circle", { cx: itemX, cy: 9, r: 4, fill: color, stroke: "#fff7de", "stroke-width": 1 }));
      const t = svg("text", { class: "demo-legend-text", x: itemX + 8, y: 12 });
      t.append(text(label));
      legend.append(t);
    });
    root.append(legend);

    mount.replaceChildren(root);
  };

  const boot = async () => {
    const mount = document.querySelector("[data-demo-map]");
    if (!mount) return;

    const graph = await getGraphData();

    let raf = null;
    const draw = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => render(mount, graph));
    };

    const observer = new ResizeObserver(draw);
    observer.observe(mount);

    const toggle = document.querySelector(".rf-path-toggle");
    if (toggle) toggle.addEventListener("change", () => setTimeout(draw, 210));

    draw();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
