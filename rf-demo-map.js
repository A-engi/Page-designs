/* RF Atlas demo map renderer
   Uses private/real graph data if it exists, otherwise falls back to demo nodes.
   Positions resize with the map. Marker and label sizes are clamped. */

(() => {
  const FALLBACK_GRAPH = {
    nodes: [
      { id: "glasgow", name: "Glasgow", type: "core", x: 0.12, y: 0.20, label: { dx: 18, dy: -9, anchor: "start" } },
      { id: "edinburgh", name: "Edinburgh", type: "core", x: 0.61, y: 0.20, label: { dx: 18, dy: -9, anchor: "start" } },
      { id: "manchester", name: "Manchester", type: "main", x: 0.30, y: 0.43, label: { dx: 16, dy: -4, anchor: "start" } },
      { id: "birmingham", name: "Birmingham", type: "main", x: 0.37, y: 0.60, label: { dx: 17, dy: -4, anchor: "start" } },
      { id: "london", name: "London", type: "core", x: 0.50, y: 0.82, size: "large", label: { dx: 0, dy: 25, anchor: "middle" } },
      { id: "hilltop", name: "Hilltop", type: "relay", x: 0.74, y: 0.42, label: { dx: 18, dy: -6, anchor: "start" } },
      { id: "ridgeway", name: "Ridgeway", type: "relay", x: 0.86, y: 0.58, label: { dx: -18, dy: 0, anchor: "end" } },
      { id: "valley", name: "Valley", type: "remote", x: 0.16, y: 0.78, label: { dx: 18, dy: 12, anchor: "start" } },
      { id: "pinewood", name: "Pinewood", type: "remote", x: 0.89, y: 0.82, label: { dx: -18, dy: 12, anchor: "end" } }
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

  const typeLabel = (type) => ({ core: "CORE", main: "MAIN", relay: "RELAY", remote: "REMOTE" }[type] || String(type || "SITE").toUpperCase());
  const validateGraph = (data) => data && Array.isArray(data.nodes) && data.nodes.length > 0 && Array.isArray(data.links);

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

  const markerRadius = (node, width) => {
    const tight = width < 300;
    if (node.size === "large") return tight ? 13.5 : 15;
    if (node.type === "relay") return tight ? 10.5 : 12;
    return tight ? 9.5 : 11;
  };

  const render = (mount, graph) => {
    const rect = mount.getBoundingClientRect();
    const width = Math.max(220, Math.round(rect.width));
    const height = Math.max(120, Math.round(rect.height));
    const tight = width < 300;
    const padX = tight ? 26 : 28;
    const padTop = Math.max(16, height * 0.09);
    const padBottom = Math.max(22, height * 0.16);
    const xOf = (node) => padX + node.x * (width - padX * 2);
    const yOf = (node) => padTop + node.y * (height - padTop - padBottom);
    const nodes = new Map(graph.nodes.map((node) => [node.id, node]));
    const root = svg("svg", { viewBox: `0 0 ${width} ${height}`, role: "img", "aria-label": "Demo network map" });
    root.append(svg("rect", { class: "demo-map-bg", x: 0, y: 0, width, height }));

    const linkLayer = svg("g", { class: "demo-links" });
    graph.links.forEach((link) => {
      const a = nodes.get(link.from);
      const b = nodes.get(link.to);
      if (!a || !b) return;
      const x1 = xOf(a), y1 = yOf(a), x2 = xOf(b), y2 = yOf(b);
      const dx = x2 - x1;
      const dy = y2 - y1;
      const curve = Math.max(-38, Math.min(38, dx * 0.12));
      const bow = Math.max(-18, Math.min(18, dy * 0.08));
      const d = `M${x1} ${y1} C${x1 + curve} ${y1 + bow}, ${x2 - curve} ${y2 - bow}, ${x2} ${y2}`;
      if (link.type !== "alert") linkLayer.append(svg("path", { class: `demo-route demo-link-soft ${link.type === "backup" ? "is-backup" : "is-main"}`, d }));
      linkLayer.append(svg("path", { class: `demo-route is-${link.type || "main"}`, d }));
    });
    root.append(linkLayer);

    const dotLayer = svg("g", { class: "demo-route-dots" });
    graph.links.forEach((link) => {
      const a = nodes.get(link.from), b = nodes.get(link.to);
      if (!a || !b) return;
      dotLayer.append(svg("circle", {
        class: `demo-route-dot ${link.type === "alert" ? "red" : link.type === "backup" ? "blue" : "green"}`,
        cx: (xOf(a) + xOf(b)) / 2,
        cy: (yOf(a) + yOf(b)) / 2,
        r: link.type === "alert" ? (tight ? 4.2 : 5) : (tight ? 3.1 : 3.6)
      }));
    });
    root.append(dotLayer);

    const nodeLayer = svg("g", { class: "demo-nodes" });
    graph.nodes.forEach((node) => {
      const x = xOf(node), y = yOf(node), radius = markerRadius(node, width);
      const marker = svg("g", { class: `demo-node ${node.type}`, transform: `translate(${x} ${y})` });
      marker.append(
        svg("circle", { class: `halo ${node.type}`, r: radius + (tight ? 7 : 8), fill: node.type === "relay" ? "#ff5d32" : "#e8d9a0" }),
        svg("circle", { class: node.type, r: radius, "stroke-width": node.type === "relay" ? 2 : 1.8 }),
        svg("circle", { class: "inner-ring", r: Math.max(3, radius - 4) }),
        makeMast(0, 0, node.size === "large" ? (tight ? 0.40 : 0.45) : (tight ? 0.31 : 0.35))
      );
      nodeLayer.append(marker);

      const label = node.label || {};
      const fallbackSide = x > width * 0.72 ? -1 : 1;
      const anchor = label.anchor || (fallbackSide < 0 ? "end" : "start");
      const dx = label.dx ?? fallbackSide * (radius + 8);
      const dy = label.dy ?? -4;
      const labelX = Math.max(4, Math.min(width - 4, x + dx));
      const labelY = y + dy;
      const labelText = svg("text", { class: `demo-label ${node.type}${tight ? " hide-type" : ""}`, x: labelX, y: labelY, "text-anchor": anchor });
      const name = svg("tspan", { class: "name", x: labelX, y: labelY });
      name.append(text(node.name || node.id));
      const type = svg("tspan", { class: "type", x: labelX, dy: tight ? 0 : 11 });
      type.append(text(typeLabel(node.type)));
      labelText.append(name, type);
      nodeLayer.append(labelText);
    });
    root.append(nodeLayer);

    const compass = svg("g", { class: "demo-compass", transform: `translate(${padX + 18} ${height - 34})` });
    compass.append(svg("circle", { r: 18 }), svg("path", { d: "M0-24V24M-24 0H24M-17-17L17 17M17-17L-17 17" }), svg("path", { d: "M0-18L4-4L18 0L4 4L0 18L-4 4L-18 0L-4-4Z" }));
    const n = svg("text", { x: -3, y: -25 });
    n.append(text("N"));
    compass.append(n);
    root.append(compass);

    const legendW = Math.min(210, width - padX * 2);
    const legend = svg("g", { transform: `translate(${padX} ${height - 22})` });
    legend.append(svg("rect", { class: "demo-legend", x: 0, y: 0, width: legendW, height: 16, rx: 7 }));
    [["Core", "#106228"], ["Main", "#106228"], ["Relay", "#9f231a"], ["Remote", "#1b4d81"]].forEach(([label, color], index) => {
      const itemX = 12 + index * (legendW / 4);
      legend.append(svg("circle", { cx: itemX, cy: 8, r: 3.4, fill: color, stroke: "#fff7de", "stroke-width": 0.8 }));
      const t = svg("text", { class: "demo-legend-text", x: itemX + 7, y: 11 });
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
    const draw = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => render(mount, graph)); };
    const observer = new ResizeObserver(draw);
    observer.observe(mount);
    const toggle = document.querySelector(".rf-path-toggle");
    if (toggle) toggle.addEventListener("change", () => setTimeout(draw, 210));
    draw();
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
