// FNS Floorplan editor: the sidebar panel "Půdorys". Lights, appliances, sensors, furniture and
// room labels can be dragged, assigned an entity, turned, resized, added and removed.
// Rooms, walls, windows and doors are shown but not edited here yet.

const S = 80; // px per metre, same as the card
const PAD = 40;
const SNAP = 0.05; // metres
const NS = "http://www.w3.org/2000/svg";

const FURNITURE_TYPES = [
  "bed", "bunk_bed", "nightstand", "wardrobe", "dresser", "shelf", "tall_cabinet", "sideboard", "sofa", "coffee_table",
  "table", "chair", "desk", "office_chair", "bench", "coat_rack", "tv_board", "tv_wall", "kitchen", "kitchen_wall",
  "kitchen_tall", "fridge", "sink", "stove", "dishwasher", "washer", "dryer", "bathtub", "shower", "washbasin", "wc",
  "radiator", "robot_vacuum",
];
const LIGHT_TYPES = { lamp_ceiling: "Stropní světlo", lamp_pendant: "Závěsné světlo", lamp_panel: "Panel", lamp_table: "Lampička", lamp_wall: "Nástěnné světlo", led_strip: "LED pásek" };
const DEVICE_KINDS = { fan: "Větrák", purifier: "Čistička", dishwasher: "Myčka", dryer: "Sušička", boiler: "Kotel", radiator: "Radiátor" };
const DEVICE_SHORT = { fan: "Vě", purifier: "Či", dishwasher: "My", dryer: "Su", boiler: "Ko", radiator: "Ra" };
// what "+" can add: [label, factory]
const ADD = [
  ["Stropní světlo", () => ({ cat: "furniture", item: { type: "lamp_ceiling", w: 0.3, d: 0.3, rotation: 0, entity: "" } })],
  ["Lampička", () => ({ cat: "furniture", item: { type: "lamp_table", w: 0.28, d: 0.28, rotation: 0, entity: "" } })],
  ["Nástěnné světlo", () => ({ cat: "furniture", item: { type: "lamp_wall", w: 0.2, d: 0.1, rotation: 0, entity: "" } })],
  ["LED pásek", () => ({ cat: "furniture", item: { type: "led_strip", w: 1, d: 0.04, rotation: 0, entity: "" } })],
  ["Nábytek", () => ({ cat: "furniture", item: { type: "table", w: 1, d: 0.6, rotation: 0 } })],
  ["Spotřebič", () => ({ cat: "devices", item: { kind: "fan", name: "", entity: "" } })],
  ["Radiátor", () => ({ cat: "devices", item: { kind: "radiator", name: "", entity: "" } })],
  ["Senzor (pohyb, voda)", () => ({ cat: "sensors", item: { entity: "" } })],
];

const el = (tag, attrs = {}, parent) => {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  if (parent) parent.appendChild(e);
  return e;
};
const P = ([x, z]) => [x * S + PAD, z * S + PAD];
const snap = (v) => Math.round(v / SNAP) * SNAP;
const r3 = (v) => Math.round(v * 1000) / 1000;
const isLight = (f) => /^(lamp|led)/.test(f.type);
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const centroid = (pts) => {
  let a = 0, cx = 0, cz = 0;
  for (let i = 0; i < pts.length; i++) {
    const [x0, z0] = pts[i], [x1, z1] = pts[(i + 1) % pts.length];
    const f = x0 * z1 - x1 * z0;
    a += f; cx += (x0 + x1) * f; cz += (z0 + z1) * f;
  }
  return [cx / (3 * a), cz / (3 * a)];
};

const STYLE = `
:host { display: block; height: 100%; background: var(--primary-background-color, #fafafa); color: var(--primary-text-color, #212121);
  font-family: var(--ha-font-family-body, Roboto, sans-serif); }
.top { display: flex; align-items: center; gap: 8px; height: 56px; padding: 0 12px; box-sizing: border-box;
  background: var(--app-header-background-color, var(--primary-color, #03a9f4)); color: var(--app-header-text-color, #fff); }
.top h1 { font-size: 20px; font-weight: 400; margin: 0 8px 0 0; flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.top .state { font-size: 13px; opacity: .85; }
button, select, input, textarea { font: inherit; }
.btn { border: 1px solid var(--divider-color, #e0e0e0); border-radius: 18px; padding: 7px 14px; cursor: pointer; background: var(--card-background-color, #fff); color: var(--primary-text-color, #212121); }
.btn.primary { background: var(--primary-color, #03a9f4); border-color: transparent; color: var(--text-primary-color, #fff); font-weight: 600; }
.btn:disabled { opacity: .45; cursor: default; }
.top select { border-radius: 18px; padding: 6px 10px; border: 1px solid var(--divider-color, #e0e0e0); background: var(--card-background-color, #fff); color: var(--primary-text-color, #212121); }
.main { display: flex; height: calc(100% - 56px); }
.stage { flex: 1; min-width: 0; padding: 12px; box-sizing: border-box; }
svg { width: 100%; height: 100%; display: block; touch-action: none; user-select: none; }
.floor { fill: var(--card-background-color, #fff); stroke: var(--primary-text-color, #212121); stroke-opacity: .55; stroke-width: 4; }
.open-line { stroke: var(--card-background-color, #fff); stroke-width: 7; }
.win { stroke: #22b8cf; stroke-width: 4; }
.door { stroke: var(--secondary-text-color, #727272); stroke-width: 2; stroke-dasharray: 4 3; }
.item { cursor: grab; }
.item.sel { cursor: grabbing; }
.furn { fill: var(--primary-text-color, #212121); fill-opacity: .06; stroke: var(--primary-text-color, #212121); stroke-opacity: .35; stroke-width: 1; }
.lamp { fill: #ffd27a; stroke: #b7791f; stroke-width: 1.5; }
.strip { stroke: #f6ad55; stroke-width: 5; stroke-linecap: round; }
.strip-hit { stroke: transparent; stroke-width: 18; }
.dev { fill: var(--primary-color, #03a9f4); fill-opacity: .15; stroke: var(--primary-color, #03a9f4); stroke-width: 1.5; }
.dev-t { fill: var(--primary-color, #03a9f4); font-size: 11px; font-weight: 700; pointer-events: none; }
.sensor { fill: #9f7aea; fill-opacity: .25; stroke: #9f7aea; stroke-width: 1.5; }
.label rect { fill: var(--card-background-color, #fff); stroke: var(--divider-color, #e0e0e0); }
.label text { fill: var(--primary-text-color, #212121); font-size: 12px; font-weight: 600; pointer-events: none; }
.noent { stroke: var(--error-color, #db4437) !important; stroke-dasharray: 3 2; }
.sel .furn, .sel .lamp, .sel .dev, .sel .sensor, .sel rect { stroke: var(--primary-color, #03a9f4) !important; stroke-width: 3 !important; stroke-opacity: 1 !important; }
.sel .strip { stroke: var(--primary-color, #03a9f4); }
.side { width: 320px; flex: none; overflow: auto; padding: 16px; box-sizing: border-box; border-left: 1px solid var(--divider-color, #e0e0e0);
  background: var(--card-background-color, #fff); }
.side h2 { font-size: 17px; margin: 0 0 4px; }
.side .hint { color: var(--secondary-text-color, #727272); font-size: 13px; line-height: 1.45; }
.side label { display: block; font-size: 12px; color: var(--secondary-text-color, #727272); margin: 12px 0 4px; }
.side input, .side select, .side textarea { width: 100%; box-sizing: border-box; padding: 8px; border-radius: 8px;
  border: 1px solid var(--divider-color, #e0e0e0); background: var(--primary-background-color, #fafafa); color: var(--primary-text-color, #212121); }
.side textarea { min-height: 120px; font-family: monospace; font-size: 12px; }
.side textarea.bad { border-color: var(--error-color, #db4437); }
.row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.row2 label { margin-top: 12px; }
.rot { display: flex; gap: 6px; margin-top: 6px; }
.rot button, .actions button { flex: 1; padding: 7px; border-radius: 8px; border: 1px solid var(--divider-color, #e0e0e0);
  background: var(--primary-background-color, #fafafa); color: var(--primary-text-color, #212121); cursor: pointer; }
.actions { display: flex; gap: 8px; margin-top: 18px; }
.actions .del { color: var(--error-color, #db4437); }
.err { color: var(--error-color, #db4437); margin: 12px 16px; }
@media (max-width: 800px) {
  .main { flex-direction: column; }
  .stage { flex: none; height: 58vh; }
  .side { width: auto; border-left: 0; border-top: 1px solid var(--divider-color, #e0e0e0); flex: 1; }
  .top .state { display: none; }
}
`;

class FnsFloorplanPanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._sel = null; // {cat, i} or {cat: "labels", id}
    this._dirty = false;
  }

  set hass(hass) {
    const first = !this._hass;
    this._hass = hass;
    if (first) this._load();
    const menu = this.shadowRoot.querySelector("ha-menu-button");
    if (menu) menu.hass = hass;
  }

  set narrow(v) {
    this._narrow = v;
    const menu = this.shadowRoot.querySelector("ha-menu-button");
    if (menu) menu.narrow = v;
  }

  connectedCallback() {
    this._onKey = (e) => this._key(e);
    window.addEventListener("keydown", this._onKey);
    this._onLeave = (e) => { if (this._dirty) { e.preventDefault(); e.returnValue = ""; } };
    window.addEventListener("beforeunload", this._onLeave);
  }

  disconnectedCallback() {
    window.removeEventListener("keydown", this._onKey);
    window.removeEventListener("beforeunload", this._onLeave);
  }

  async _load() {
    try {
      this._plan = await this._hass.callWS({ type: "fns_floorplan/plan/get" });
    } catch (err) {
      this.shadowRoot.innerHTML = `<style>${STYLE}</style><div class="err"></div>`;
      this.shadowRoot.querySelector(".err").textContent = `Plán nejde načíst: ${err.message || err.code || err}`;
      return;
    }
    for (const k of ["furniture", "devices", "sensors"]) this._plan[k] ||= [];
    this._plan.labels ||= {};
    this._dirty = false;
    this._sel = null;
    this._skeleton();
    this._draw();
    this._form();
  }

  _skeleton() {
    this.shadowRoot.innerHTML = `<style>${STYLE}</style>
<div class="top">
  <ha-menu-button></ha-menu-button>
  <h1>Půdorys</h1>
  <span class="state"></span>
  <select class="add"><option value="">+ Přidat</option>${ADD.map(([l], i) => `<option value="${i}">${l}</option>`).join("")}</select>
  <button class="btn revert" disabled>Zahodit</button>
  <button class="btn primary save" disabled>Uložit</button>
</div>
<div class="main">
  <div class="stage"><svg preserveAspectRatio="xMidYMid meet"></svg></div>
  <div class="side"></div>
</div>
<datalist id="ents"></datalist>`;
    const $ = (s) => this.shadowRoot.querySelector(s);
    const menu = $("ha-menu-button");
    menu.hass = this._hass;
    menu.narrow = this._narrow;
    $(".save").addEventListener("click", () => this._save());
    $(".revert").addEventListener("click", () => { if (confirm("Zahodit neuložené změny?")) this._load(); });
    $(".add").addEventListener("change", (e) => {
      if (e.target.value === "") return;
      const { cat, item } = ADD[Number(e.target.value)][1]();
      e.target.value = "";
      const [cx, cz] = centroid(this._bounds());
      Object.assign(item, { x: r3(snap(cx)), z: r3(snap(cz)) });
      if (cat === "furniture") item.id = `f_${Date.now().toString(36)}`;
      this._plan[cat].push(item);
      this._sel = { cat, i: this._plan[cat].length - 1 };
      this._changed();
    });
    $("#ents").innerHTML = Object.keys(this._hass.states).sort().map((id) => `<option value="${id}">`).join("");
    const svg = $("svg");
    svg.addEventListener("pointerdown", (e) => { if (e.target === svg || e.target.classList.contains("floor")) { this._sel = null; this._draw(); this._form(); } });
  }

  _bounds() {
    const xs = this._plan.rooms.flatMap((r) => r.points.map((p) => p[0]));
    const zs = this._plan.rooms.flatMap((r) => r.points.map((p) => p[1]));
    const x1 = Math.max(...xs), z1 = Math.max(...zs);
    return [[0, 0], [x1, 0], [x1, z1], [0, z1]];
  }

  // plan point under the pointer
  _toPlan(e) {
    const svg = this.shadowRoot.querySelector("svg");
    const pt = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const p = pt.matrixTransform(svg.getScreenCTM().inverse());
    return [(p.x - PAD) / S, (p.y - PAD) / S];
  }

  _get(sel = this._sel) {
    if (!sel) return null;
    if (sel.cat === "labels") {
      const r = this._plan.rooms.find((r) => r.id === sel.id);
      return { x: (this._plan.labels[sel.id] || centroid(r.points))[0], z: (this._plan.labels[sel.id] || centroid(r.points))[1], room: r };
    }
    return this._plan[sel.cat][sel.i];
  }

  _move(sel, x, z) {
    if (sel.cat === "labels") this._plan.labels[sel.id] = [r3(snap(x)), r3(snap(z))];
    else Object.assign(this._plan[sel.cat][sel.i], { x: r3(snap(x)), z: r3(snap(z)) });
  }

  _draw() {
    const svg = this.shadowRoot.querySelector("svg");
    const b = this._bounds();
    const W = b[2][0] * S + PAD * 2, H = b[2][1] * S + PAD * 2;
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.innerHTML = "";
    const plan = this._plan;
    for (const r of plan.rooms) el("path", { d: "M" + r.points.map(P).map((p) => p.join(",")).join("L") + "Z", class: "floor" }, svg);
    for (const o of plan.openings || []) {
      const r = plan.rooms.find((x) => x.id === o.room_id);
      if (!r) continue;
      const a = r.points[o.edge], c = r.points[(o.edge + 1) % r.points.length];
      const L = Math.hypot(c[0] - a[0], c[1] - a[1]), u = [(c[0] - a[0]) / L, (c[1] - a[1]) / L];
      const A = P([a[0] + u[0] * (o.offset - o.width / 2), a[1] + u[1] * (o.offset - o.width / 2)]);
      const B = P([a[0] + u[0] * (o.offset + o.width / 2), a[1] + u[1] * (o.offset + o.width / 2)]);
      el("line", { x1: A[0], y1: A[1], x2: B[0], y2: B[1], class: "open-line" }, svg);
      if (o.style !== "passage") el("line", { x1: A[0], y1: A[1], x2: B[0], y2: B[1], class: o.type === "window" ? "win" : "door" }, svg);
    }
    const same = (sel) => this._sel && this._sel.cat === sel.cat && (sel.cat === "labels" ? this._sel.id === sel.id : this._sel.i === sel.i);
    const group = (sel, x, z, rot = 0) => {
      const [cx, cz] = P([x, z]);
      const g = el("g", { class: "item" + (same(sel) ? " sel" : ""), transform: `translate(${cx} ${cz}) rotate(${rot})` }, svg);
      this._drag(g, sel);
      return g;
    };
    // furniture first, lights over it, then appliances, sensors and labels on top
    const order = plan.furniture.map((f, i) => [f, i]).sort((a, b) => isLight(a[0]) - isLight(b[0]));
    for (const [f, i] of order) {
      const g = group({ cat: "furniture", i }, f.x, f.z, f.rotation || 0);
      const w = f.w * S, d = f.d * S;
      const missing = isLight(f) && !f.entity;
      if (f.type === "led_strip") {
        el("line", { x1: -w / 2, y1: 0, x2: w / 2, y2: 0, class: "strip-hit" }, g);
        el("line", { x1: -w / 2, y1: 0, x2: w / 2, y2: 0, class: "strip" + (missing ? " noent" : "") }, g);
      } else if (isLight(f)) el("circle", { r: 9, class: "lamp" + (missing ? " noent" : "") }, g);
      else el("rect", { x: -w / 2, y: -d / 2, width: Math.max(w, 2), height: Math.max(d, 2), rx: 3, class: "furn" }, g);
    }
    plan.devices.forEach((d, i) => {
      const g = group({ cat: "devices", i }, d.x, d.z);
      el("circle", { r: 15, class: "dev" + (d.entity ? "" : " noent") }, g);
      el("text", { class: "dev-t", "text-anchor": "middle", y: 4 }, g).textContent = DEVICE_SHORT[d.kind] || "?";
    });
    plan.sensors.forEach((s, i) => {
      const g = group({ cat: "sensors", i }, s.x, s.z);
      el("rect", { x: -7, y: -7, width: 14, height: 14, transform: "rotate(45)", class: "sensor" + (s.entity ? "" : " noent") }, g);
    });
    for (const r of plan.rooms) {
      const [x, z] = plan.labels[r.id] || centroid(r.points);
      const g = group({ cat: "labels", id: r.id }, x, z);
      g.classList.add("label");
      const rect = el("rect", { rx: 8 }, g);
      const t = el("text", { "text-anchor": "middle", y: 4 }, g);
      t.textContent = r.name;
      const bb = t.getBBox();
      Object.entries({ x: bb.x - 8, y: bb.y - 4, width: bb.width + 16, height: bb.height + 8 }).forEach(([k, v]) => rect.setAttribute(k, v));
    }
  }

  _drag(g, sel) {
    g.addEventListener("pointerdown", (e) => {
      e.stopPropagation();
      const changedSel = !this._sel || this._sel.cat !== sel.cat || this._sel.i !== sel.i || this._sel.id !== sel.id;
      this._sel = sel;
      const start = this._toPlan(e), o = this._get(sel), base = [o.x, o.z];
      let moved = false;
      const svg = this.shadowRoot.querySelector("svg");
      svg.setPointerCapture(e.pointerId);
      const move = (ev) => {
        const p = this._toPlan(ev);
        const dx = p[0] - start[0], dz = p[1] - start[1];
        if (!moved && Math.hypot(dx, dz) < 0.03) return;
        moved = true;
        this._move(sel, base[0] + dx, base[1] + dz);
        this._dirty = true;
        this._draw();
      };
      const up = () => {
        svg.removeEventListener("pointermove", move);
        svg.removeEventListener("pointerup", up);
        svg.removeEventListener("pointercancel", up);
        if (moved) this._changed();
        else if (changedSel) { this._draw(); this._form(); }
      };
      svg.addEventListener("pointermove", move);
      svg.addEventListener("pointerup", up);
      svg.addEventListener("pointercancel", up);
    });
  }

  _changed() {
    this._dirty = true;
    this._draw();
    this._form();
  }

  _status() {
    const $ = (s) => this.shadowRoot.querySelector(s);
    $(".save").disabled = !this._dirty;
    $(".revert").disabled = !this._dirty;
    $(".state").textContent = this._dirty ? "Neuložené změny" : "";
  }

  // properties of the selected item
  _form() {
    this._status();
    const side = this.shadowRoot.querySelector(".side");
    const sel = this._sel, o = this._get();
    if (!o) {
      side.innerHTML = `<h2>Úpravy půdorysu</h2><p class="hint">Klepni na světlo, spotřebič, senzor, nábytek nebo jmenovku místnosti a uprav ji. Táhnutím ji přesuneš (mřížka 5 cm), šipky posouvají vybraný prvek, Delete ho smaže.<br><br>Prvky bez entity mají červený přerušovaný okraj.<br><br>Změny se na dashboardu projeví po uložení a obnovení stránky.</p>`;
      return;
    }
    const field = (label, key, value, type = "text", extra = "") =>
      `<label>${label}</label><input data-k="${key}" type="${type}" value="${esc(value)}" ${extra}>`;
    const num = (label, key, value) => field(label, key, value ?? "", "number", 'step="0.05"');
    let html = "";
    if (sel.cat === "labels") {
      html = `<h2>Jmenovka: ${esc(o.room.name)}</h2><p class="hint">Přetáhni ji, kam patří.</p>
        <div class="row2"><div>${num("X (m)", "x", o.x)}</div><div>${num("Z (m)", "z", o.z)}</div></div>
        <div class="actions"><button data-a="auto">Vrátit doprostřed místnosti</button></div>`;
    } else if (sel.cat === "furniture") {
      const light = isLight(o);
      const types = light ? Object.keys(LIGHT_TYPES) : FURNITURE_TYPES;
      html = `<h2>${light ? LIGHT_TYPES[o.type] : "Nábytek"}</h2>
        <label>Typ</label><select data-k="type">${types.map((t) => `<option value="${t}" ${t === o.type ? "selected" : ""}>${light ? LIGHT_TYPES[t] : t}</option>`).join("")}</select>
        ${light || o.type === "tv_wall" || o.type === "robot_vacuum" ? field(light ? "Entita (světlo nebo spínač)" : o.type === "tv_wall" ? "Entita (media_player)" : "Entita (vacuum)", "entity", o.entity || "", "text", 'list="ents"') : ""}
        ${light ? `<label>Osvětlení místnosti</label><select data-k="room_light">
          <option value="" ${o.room_light == null ? "selected" : ""}>Výchozí</option>
          <option value="false" ${o.room_light === false ? "selected" : ""}>Jen slabě (akvárium, dekorace)</option>
          ${[0.3, 0.5, 0.75].map((v) => `<option value="${v}" ${o.room_light === v ? "selected" : ""}>${Math.round(v * 100)} %</option>`).join("")}
        </select>` : ""}
        <div class="row2"><div>${num("X (m)", "x", o.x)}</div><div>${num("Z (m)", "z", o.z)}</div></div>
        <div class="row2"><div>${num(o.type === "led_strip" ? "Délka (m)" : "Šířka (m)", "w", o.w)}</div><div>${num("Hloubka (m)", "d", o.d)}</div></div>
        <label>Otočení (°)</label><input data-k="rotation" type="number" step="1" value="${o.rotation || 0}">
        <div class="rot"><button data-a="rot-15">−15°</button><button data-a="rot15">+15°</button><button data-a="rot90">+90°</button></div>
        ${light ? "" : this._rulesField(o)}`;
    } else if (sel.cat === "devices") {
      html = `<h2>${DEVICE_KINDS[o.kind] || "Spotřebič"}</h2>
        <label>Druh</label><select data-k="kind">${Object.entries(DEVICE_KINDS).map(([k, v]) => `<option value="${k}" ${k === o.kind ? "selected" : ""}>${v}</option>`).join("")}</select>
        ${field("Název", "name", o.name || "")}
        ${field("Entita (klepnutí otevře její detail)", "entity", o.entity || "", "text", 'list="ents"')}
        <label>Běží, když má entita stav (čárkou, nebo JSON {"above": 20})</label><input data-k="active" value="${esc(Array.isArray(o.active) ? o.active.join(", ") : o.active ? JSON.stringify(o.active) : "")}" placeholder="on, run">
        ${field("Text pod ikonou z entity", "info", o.info || "", "text", 'list="ents"')}
        ${field("Předpona textu", "prefix", o.prefix || "")}
        <div class="row2"><div>${num("X (m)", "x", o.x)}</div><div>${num("Z (m)", "z", o.z)}</div></div>
        ${this._rulesField(o)}`;
    } else {
      html = `<h2>Senzor</h2><p class="hint">Pohyb a přítomnost dělají vlnky, voda (třída moisture) rozbliká místnost.</p>
        ${field("Entita (binary_sensor)", "entity", o.entity || "", "text", 'list="ents"')}
        <div class="row2"><div>${num("X (m)", "x", o.x)}</div><div>${num("Z (m)", "z", o.z)}</div></div>`;
    }
    if (sel.cat !== "labels") html += `<div class="actions"><button data-a="dup">Duplikovat</button><button data-a="del" class="del">Smazat</button></div>`;
    side.innerHTML = html;

    side.querySelectorAll("[data-k]").forEach((inp) => inp.addEventListener("change", () => this._set(inp.dataset.k, inp.value, inp)));
    side.querySelectorAll("[data-a]").forEach((btn) => btn.addEventListener("click", () => this._action(btn.dataset.a)));
  }

  _rulesField(o) {
    return `<label>Pravidla barev (JSON, viz dokumentace)</label><textarea data-k="rules" spellcheck="false">${esc(o.rules ? JSON.stringify(o.rules, null, 1) : "")}</textarea>`;
  }

  _set(key, value, inp) {
    const sel = this._sel, o = this._get();
    if (sel.cat === "labels") {
      const cur = this._plan.labels[sel.id] || [o.x, o.z];
      this._plan.labels[sel.id] = key === "x" ? [r3(Number(value)), cur[1]] : [cur[0], r3(Number(value))];
      return this._changed();
    }
    if (["x", "z", "w", "d"].includes(key)) o[key] = r3(Number(value));
    else if (key === "rotation") o.rotation = ((Number(value) % 360) + 360) % 360;
    else if (key === "room_light") { if (value === "") delete o.room_light; else o.room_light = value === "false" ? false : Number(value); }
    else if (key === "active" && value.trim().startsWith("{")) {
      try { o.active = JSON.parse(value); inp.classList.remove("bad"); } catch { inp.classList.add("bad"); return; }
    }
    else if (key === "active") { const list = value.split(",").map((s) => s.trim()).filter(Boolean); if (list.length) o.active = list; else delete o.active; }
    else if (key === "rules") {
      if (!value.trim()) delete o.rules;
      else {
        try { o.rules = JSON.parse(value); inp.classList.remove("bad"); }
        catch { inp.classList.add("bad"); return; }
      }
    } else if (value === "") delete o[key];
    else o[key] = value;
    this._changed();
  }

  _action(a) {
    const sel = this._sel, o = this._get();
    if (a === "auto") delete this._plan.labels[sel.id];
    else if (a.startsWith("rot")) o.rotation = (((o.rotation || 0) + Number(a.slice(3))) % 360 + 360) % 360;
    else if (a === "dup") {
      const copy = { ...JSON.parse(JSON.stringify(o)), x: r3(o.x + 0.3), z: r3(o.z + 0.3) };
      if (sel.cat === "furniture") copy.id = `f_${Date.now().toString(36)}`;
      this._plan[sel.cat].push(copy);
      this._sel = { cat: sel.cat, i: this._plan[sel.cat].length - 1 };
    } else if (a === "del") {
      this._plan[sel.cat].splice(sel.i, 1);
      this._sel = null;
    }
    this._changed();
  }

  _key(e) {
    if (!this._sel || !this.isConnected) return;
    if (e.composedPath().some((n) => n.tagName === "INPUT" || n.tagName === "TEXTAREA" || n.tagName === "SELECT")) return;
    const step = { ArrowLeft: [-SNAP, 0], ArrowRight: [SNAP, 0], ArrowUp: [0, -SNAP], ArrowDown: [0, SNAP] }[e.key];
    if (step) {
      e.preventDefault();
      const o = this._get();
      this._move(this._sel, o.x + step[0], o.z + step[1]);
      this._changed();
    } else if ((e.key === "Delete" || e.key === "Backspace") && this._sel.cat !== "labels") {
      e.preventDefault();
      this._action("del");
    }
  }

  async _save() {
    const btn = this.shadowRoot.querySelector(".save");
    btn.disabled = true;
    try {
      const res = await this._hass.callWS({ type: "fns_floorplan/plan/save", plan: this._plan, rev: this._plan.rev || 0 });
      this._plan.rev = res.rev;
      this._dirty = false;
      this._status();
      this.shadowRoot.querySelector(".state").textContent = "Uloženo";
    } catch (err) {
      btn.disabled = false;
      if (err.code === "conflict") alert("Plán mezitím změnil někdo jiný. Načti ho znovu (Zahodit) a změny zopakuj.");
      else alert(`Uložení selhalo: ${err.message || err.code || err}`);
    }
  }
}

// see defineSafe in the card: a scoped-registry polyfill may replace the registry after load
const ensurePanel = () => {
  if (customElements.get("fns-floorplan-panel")) return;
  try { customElements.define("fns-floorplan-panel", class extends FnsFloorplanPanel {}); } catch (err) { /* defined meanwhile */ }
};
ensurePanel();
for (const ms of [500, 2000, 5000, 10000]) setTimeout(ensurePanel, ms);
