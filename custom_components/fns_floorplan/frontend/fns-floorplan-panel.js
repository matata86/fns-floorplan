// FNS Floorplan editor: the sidebar panel "Půdorys". Lights, appliances, sensors, furniture and
// room labels can be dragged, assigned an entity, turned, resized, added and removed.
// In the "Místnosti" mode rooms (corner points, whole rooms), windows and doors are edited.

// icons, furniture types and the rules engine come from the card module (same URL, so loaded once)
const { MDI, COLORS, FURNITURE, lightIcon, SIZES, evalRules, resolveIcon, iconHtml } =
  await import(new URL("./fns-floorplan-card.js", import.meta.url).href + new URL(import.meta.url).search);

const S = 80; // px per metre, same as the card
const PAD = 40;
const SNAP = 0.05; // metres
const NS = "http://www.w3.org/2000/svg";

const FURNITURE_TYPES = Object.keys(FURNITURE);
const LIGHT_TYPES = { lamp_ceiling: "Stropní světlo", lamp_pendant: "Závěsné světlo", lamp_panel: "Panel", lamp_table: "Lampička", lamp_wall: "Nástěnné světlo", led_strip: "LED pásek" };
const DEVICE_KINDS = {
  fan: "Větrák", purifier: "Čistička", dishwasher: "Myčka", dryer: "Sušička", boiler: "Kotel", radiator: "Radiátor",
  alarm: "Alarm (zabezpečení)", media: "TV / přehrávač", aquarium: "Akvárium (filtrace)", camera: "Kamera", fridge: "Lednice",
  fireplace: "Krb", lock: "Zámek", generic: "Jiné zařízení (ikona entity)",
};
const DEVICE_ICON = {
  fan: "mdiFan", purifier: "mdiAirPurifier", dishwasher: "mdiDishwasher", dryer: "mdiTumbleDryer", boiler: "mdiWaterBoiler",
  radiator: "mdiRadiator", alarm: "mdiShieldOutline", media: "mdiCastVariant", generic: "mdiShapeOutline",
  aquarium: "mdiFishbowlOutline", camera: "mdiCctv", fridge: "mdiFridgeOutline", fireplace: "mdiFireplace", lock: "mdiLock",
};
const SIZE_NAMES = { xs: "XS", s: "S", "": "M (výchozí)", l: "L", xl: "XL", xxl: "XXL" };
const COLOR_NAMES = { red: "Červená", orange: "Oranžová", yellow: "Žlutá", green: "Zelená", blue: "Modrá", purple: "Fialová", pink: "Růžová", white: "Bílá", black: "Černá" };
const ACTIONS = { "": "Výchozí", toggle: "Přepnout", "more-info": "Detail entity", "perform-action": "Zavolat akci", navigate: "Přejít na stránku", url: "Otevřít odkaz", none: "Nic" };
const ACTION_KEYS = { tap: "Klepnutí", double_tap: "Dvojklik", hold: "Podržení" };
const OPS = { state: "je", state_not: "není", above: "větší než", below: "menší než", template: "šablona (Jinja)" };
// a point item (lamp, robot dock) has no size or rotation of its own
const isPoint = (f) => (isLight(f) && f.type !== "led_strip") || f.type === "robot_vacuum";
// what "+" can add: [label, factory]
const ADD = [
  ["Stropní světlo", () => ({ cat: "furniture", item: { type: "lamp_ceiling", w: 0.3, d: 0.3, rotation: 0, entity: "" } })],
  ["Lampička", () => ({ cat: "furniture", item: { type: "lamp_table", w: 0.28, d: 0.28, rotation: 0, entity: "" } })],
  ["Nástěnné světlo", () => ({ cat: "furniture", item: { type: "lamp_wall", w: 0.2, d: 0.1, rotation: 0, entity: "" } })],
  ["LED pásek", () => ({ cat: "furniture", item: { type: "led_strip", w: 1, d: 0.04, rotation: 0, entity: "" } })],
  ["Nábytek", () => ({ cat: "furniture", item: { type: "table", w: 1, d: 0.6, rotation: 0 } })],
  ["Spotřebič", () => ({ cat: "devices", item: { kind: "fan", name: "", entity: "" } })],
  ["Radiátor", () => ({ cat: "devices", item: { kind: "radiator", name: "", entity: "" } })],
  ["Alarm", () => ({ cat: "devices", item: { kind: "alarm", name: "", entity: "" } })],
  ["TV / přehrávač", () => ({ cat: "devices", item: { kind: "media", name: "", entity: "" } })],
  ["Kamera", () => ({ cat: "devices", item: { kind: "camera", name: "", entity: "" } })],
  ["Zámek", () => ({ cat: "devices", item: { kind: "lock", name: "", entity: "" } })],
  ["Jiné zařízení", () => ({ cat: "devices", item: { kind: "generic", name: "", entity: "" } })],
  ["Text (stav entity)", () => ({ cat: "texts", item: { entity: "" } })],
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

const DOOR_STYLES = { interior: "Vnitřní", front: "Vchodové", glass: "Prosklené (balkón)", passage: "Jen otvor ve zdi" };
// edge k of room r: start point, unit vector and length
const edgeOf = (r, k) => {
  const a = r.points[k], c = r.points[(k + 1) % r.points.length];
  const L = Math.hypot(c[0] - a[0], c[1] - a[1]) || 1e-9;
  return { a, c, L, u: [(c[0] - a[0]) / L, (c[1] - a[1]) / L] };
};
const SIDE = (u) => (Math.abs(u[0]) > Math.abs(u[1]) ? (u[0] > 0 ? "horní" : "dolní") : u[1] > 0 ? "pravá" : "levá");
const inPoly = ([x, z], pts) => {
  let c = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, zi] = pts[i], [xj, zj] = pts[j];
    if (zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) c = !c;
  }
  return c;
};
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const uid = (p) => `${p}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;
const selEq = (a, b) => !!a && !!b && a.cat === b.cat && (a.cat === "labels" ? a.id === b.id : a.i === b.i);
const GROUPABLE = ["furniture", "devices", "sensors", "texts"];

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
.btn.undo, .btn.redo { padding: 7px 11px; font-size: 16px; line-height: 1; }
.top select.level { max-width: 150px; }
.top select { border-radius: 18px; padding: 6px 10px; border: 1px solid var(--divider-color, #e0e0e0); background: var(--card-background-color, #fff); color: var(--primary-text-color, #212121); }
.main { display: flex; height: calc(100vh - 56px); }
.stage { flex: 1; min-width: 0; padding: 12px; box-sizing: border-box; position: relative; }
.zoom { position: absolute; left: 20px; top: 20px; display: flex; flex-direction: column; gap: 6px; z-index: 1; }
.zoom button { width: 34px; height: 34px; border-radius: 10px; border: 1px solid var(--divider-color, #e0e0e0); cursor: pointer; font-size: 18px; line-height: 1;
  background: var(--card-background-color, #fff); color: var(--primary-text-color, #212121); box-shadow: 0 1px 3px rgba(0,0,0,.15); }
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
.ico path { fill: var(--primary-color, #03a9f4); pointer-events: none; }
.lamp-ico path { fill: #7b4a00; }
.sensor-ico path { fill: #6b46c1; }
.furn-ico path { fill: var(--primary-text-color, #212121); opacity: .35; }
.count { fill: var(--primary-color, #03a9f4); }
.count-t { fill: var(--text-primary-color, #fff); font-size: 10px; font-weight: 700; pointer-events: none; }
.rhid { opacity: .35; }
.tint { pointer-events: none; }
.swing-arc { fill: none; stroke: var(--secondary-text-color, #727272); stroke-width: 1.2; stroke-dasharray: 3 3; pointer-events: none; opacity: .7; }
.swing-leaf { stroke: var(--secondary-text-color, #727272); stroke-width: 2; stroke-linecap: round; pointer-events: none; }
.swing-arc.on, .swing-leaf.on { stroke: var(--primary-color, #03a9f4); opacity: 1; }
.flip { cursor: pointer; }
.flip circle { fill: var(--primary-color, #03a9f4); stroke: #fff; stroke-width: 2; }
.flip text { fill: #fff; font-size: 13px; font-weight: 700; pointer-events: none; }
.blind { stroke: var(--secondary-text-color, #727272); stroke-width: 4; stroke-dasharray: 5 3; pointer-events: none; }
.door-lock { pointer-events: none; }
.rsz { fill: #fff; stroke: var(--primary-color, #03a9f4); stroke-width: 2; cursor: nwse-resize; }
.rot-line { stroke: var(--primary-color, #03a9f4); stroke-width: 1.5; stroke-dasharray: 3 2; pointer-events: none; }
.rot-h { fill: var(--primary-color, #03a9f4); stroke: #fff; stroke-width: 2; cursor: grab; }
.rule { border: 1px solid var(--divider-color, #e0e0e0); border-radius: 10px; padding: 8px; margin-top: 8px; }
.rule-h { display: flex; align-items: center; gap: 4px; font-weight: 600; font-size: 13px; }
.rule-h span { flex: 1; }
.rule button, .mini { border: 1px solid var(--divider-color, #e0e0e0); background: var(--primary-background-color, #fafafa); color: var(--primary-text-color, #212121);
  border-radius: 6px; padding: 3px 8px; cursor: pointer; }
.cond { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; margin-top: 6px; padding-top: 6px; border-top: 1px dashed var(--divider-color, #e0e0e0); }
.cond .wide { grid-column: 1 / -1; }
.side .cond input, .side .cond select, .side .outc input, .side .outc select { padding: 5px; font-size: 13px; }
.outc { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; margin-top: 8px; font-size: 13px; }
.outc select { width: auto; flex: 1; }
.outc input[type=color] { width: 36px; height: 30px; padding: 1px; }
.outc input[type=text] { flex: 1 1 100%; }
.side label.chk { display: flex; align-items: center; gap: 6px; margin: 6px 0; color: var(--primary-text-color, #212121); font-size: 14px; }
.side label.chk input { width: auto; }
.badge-opts { border: 0; padding: 0 0 0 22px; margin: 0; }
.badge-opts:disabled { opacity: .45; }
.icon-row { display: flex; gap: 6px; align-items: center; }
.icon-row ha-icon { flex: none; color: var(--primary-color, #03a9f4); }
.icon-row input, .icon-row ha-icon-picker { flex: 1; }
.place { display: grid; grid-template-columns: repeat(3, 38px); gap: 4px; margin-top: 4px; }
.place button { height: 30px; border-radius: 6px; border: 1px solid var(--divider-color, #e0e0e0); background: var(--primary-background-color, #fafafa);
  color: var(--primary-text-color, #212121); cursor: pointer; font-size: 15px; padding: 0; }
.layers { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-top: 6px; }
.layers button { padding: 6px 2px; border-radius: 8px; border: 1px solid var(--divider-color, #e0e0e0); background: var(--primary-background-color, #fafafa);
  color: var(--primary-text-color, #212121); cursor: pointer; font-size: 12px; }
details { margin-top: 14px; }
details summary { cursor: pointer; font-weight: 600; font-size: 14px; }
.modes { display: flex; border: 1px solid var(--divider-color, #e0e0e0); border-radius: 18px; overflow: hidden; }
.modes button { border: 0; padding: 7px 12px; background: var(--card-background-color, #fff); color: var(--primary-text-color, #212121); cursor: pointer; }
.modes button.on { background: var(--primary-color, #03a9f4); color: var(--text-primary-color, #fff); }
.mode-rooms .item { pointer-events: none; opacity: .3; }
.mode-rooms .floor { cursor: move; }
.mode-rooms .floor.sel { fill: var(--primary-color, #03a9f4); fill-opacity: .08; stroke: var(--primary-color, #03a9f4); stroke-opacity: 1; }
.mode-items .open-hit, .mode-items .vtx, .mode-items .mid { display: none; }
.open-hit { stroke: transparent; stroke-width: 16; cursor: ew-resize; }
.open-sel { stroke: var(--primary-color, #03a9f4); stroke-width: 6; stroke-linecap: round; pointer-events: none; }
.vtx { fill: #fff; stroke: var(--primary-color, #03a9f4); stroke-width: 2.5; cursor: grab; }
.vtx.sel { fill: var(--primary-color, #03a9f4); }
.mid { fill: var(--primary-color, #03a9f4); fill-opacity: .35; cursor: copy; }
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
    // HA may set properties before the element is defined (the module loads the card first);
    // such values sit on the instance and hide the setters, so pass them through again
    for (const k of ["narrow", "hass"]) {
      if (!Object.prototype.hasOwnProperty.call(this, k)) continue;
      const v = this[k];
      delete this[k];
      this[k] = v;
    }
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
      // right after an HA restart the integration may not be loaded yet: try again for a while
      this._tries = (this._tries || 0) + 1;
      this.shadowRoot.innerHTML = `<style>${STYLE}</style><div class="err"></div>`;
      this.shadowRoot.querySelector(".err").textContent = this._tries < 30 ? "Čekám na integraci FNS Floorplan…" : `Plán nejde načíst: ${err.message || err.code || err}`;
      if (this._tries < 30) setTimeout(() => this.isConnected && this._load(), 2000);
      return;
    }
    this._tries = 0;
    for (const k of ["furniture", "devices", "sensors", "texts"]) this._plan[k] ||= [];
    this._plan.labels ||= {};
    this._dirty = false;
    this._sel = null;
    this._mode ||= "items";
    this._level ??= this._levels()[0].id;
    this._undo = [];
    this._redo = [];
    this._last = this._snap();
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
  <div class="modes"><button data-m="items">Vybavení</button><button data-m="rooms">Místnosti</button></div>
  <select class="level" title="Patro"></select>
  <select class="add"><option value="">+ Přidat</option>${ADD.map(([l], i) => `<option value="${i}">${l}</option>`).join("")}</select>
  <button class="btn undo" disabled title="Zpět (Ctrl+Z)">↶</button>
  <button class="btn redo" disabled title="Vpřed (Ctrl+Y)">↷</button>
  <button class="btn revert" disabled>Zahodit</button>
  <button class="btn primary save" disabled>Uložit</button>
</div>
<div class="main">
  <div class="stage"><svg preserveAspectRatio="xMidYMin meet"></svg>
    <div class="zoom"><button data-z="in" title="Přiblížit">+</button><button data-z="out" title="Oddálit">−</button><button data-z="fit" title="Celý plán">⤢</button></div></div>
  <div class="side"></div>
</div>
<datalist id="ents"></datalist>`;
    const $ = (s) => this.shadowRoot.querySelector(s);
    const menu = $("ha-menu-button");
    menu.hass = this._hass;
    menu.narrow = this._narrow;
    $(".save").addEventListener("click", () => this._save());
    $(".undo").addEventListener("click", () => this._history(this._undo, this._redo));
    $(".redo").addEventListener("click", () => this._history(this._redo, this._undo));
    $(".revert").addEventListener("click", () => { if (confirm("Zahodit neuložené změny?")) this._load(); });
    this.shadowRoot.querySelectorAll(".modes button").forEach((b) => b.addEventListener("click", () => {
      this._mode = b.dataset.m;
      this._sel = null;
      this._draw();
      this._form();
    }));
    $(".level").addEventListener("change", (e) => this._levelAction(e.target.value));
    $(".add").addEventListener("change", (e) => {
      if (e.target.value === "") return;
      if (e.target.value === "room") {
        e.target.value = "";
        const [cx, cz] = centroid(this._bounds()).map((v) => r3(snap(v)));
        this._plan.rooms.push(this._stamp({ id: uid("room"), name: "Nová místnost", points: [[cx - 1, cz - 1], [cx + 1, cz - 1], [cx + 1, cz + 1], [cx - 1, cz + 1]], temperature: null, humidity: null }));
        this._mode = "rooms";
        this._sel = { cat: "rooms", i: this._plan.rooms.length - 1 };
        return this._changed();
      }
      const { cat, item } = ADD[Number(e.target.value)][1]();
      e.target.value = "";
      const [cx, cz] = centroid(this._bounds());
      Object.assign(this._stamp(item), { x: r3(snap(cx)), z: r3(snap(cz)) });
      if (cat === "furniture") item.id = `f_${Date.now().toString(36)}`;
      this._plan[cat].push(item);
      this._sel = { cat, i: this._plan[cat].length - 1 };
      this._changed();
    });
    // the browser matches typed text in both the id and the friendly name (label)
    $("#ents").innerHTML = Object.values(this._hass.states).sort((a, b) => a.entity_id.localeCompare(b.entity_id))
      .map((st) => `<option value="${esc(st.entity_id)}" label="${esc(st.attributes.friendly_name || "")}"></option>`).join("");
    const svg = $("svg");
    // empty space: a tap deselects, a drag pans, two fingers zoom; the wheel zooms around the pointer
    const pts = new Map();
    let pan = null, pinch = null;
    svg.addEventListener("pointerdown", (e) => {
      if (!(e.target === svg || (this._mode !== "rooms" && e.target.classList.contains("floor")))) return;
      svg.setPointerCapture(e.pointerId);
      pts.set(e.pointerId, [e.clientX, e.clientY]);
      if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch = Math.hypot(a[0] - b[0], a[1] - b[1]); pan = null; }
      else pan = { x: e.clientX, y: e.clientY, moved: false };
    });
    svg.addEventListener("pointermove", (e) => {
      if (!pts.has(e.pointerId)) return;
      pts.set(e.pointerId, [e.clientX, e.clientY]);
      if (pinch && pts.size === 2) {
        const [a, b] = [...pts.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]);
        const mid = this._svgPt((a[0] + b[0]) / 2, (a[1] + b[1]) / 2);
        if (d) this._zoom(pinch / d, mid[0], mid[1]);
        pinch = d;
        return;
      }
      if (!pan) return;
      const dx = e.clientX - pan.x, dy = e.clientY - pan.y;
      if (!pan.moved && Math.hypot(dx, dy) < 4) return;
      pan.moved = true;
      const k = 1 / svg.getScreenCTM().a, v = this._view || this._fullView();
      this._view = { ...v, x: v.x - dx * k, y: v.y - dy * k };
      pan.x = e.clientX; pan.y = e.clientY;
      this._applyView();
    });
    const end = (e) => {
      if (!pts.has(e.pointerId)) return;
      pts.delete(e.pointerId);
      if (pan && !pan.moved && !pinch) { this._sel = null; this._draw(); this._form(); }
      if (pts.size < 2) pinch = null;
      pan = null;
    };
    svg.addEventListener("pointerup", end);
    svg.addEventListener("pointercancel", end);
    svg.addEventListener("wheel", (e) => {
      e.preventDefault();
      const p = this._svgPt(e.clientX, e.clientY);
      this._zoom(e.deltaY > 0 ? 1.15 : 1 / 1.15, p[0], p[1]);
    }, { passive: false });
    this.shadowRoot.querySelectorAll(".zoom button").forEach((b) => b.addEventListener("click", () => {
      if (b.dataset.z === "fit") { this._view = null; this._applyView(); }
      else this._zoom(b.dataset.z === "in" ? 1 / 1.4 : 1.4);
    }));
  }

  // the whole plan; a zoomed or panned view (this._view) stays until "fit"
  _fullView() {
    const b = this._bounds(), extra = this._mode === "rooms" ? S : 0;
    return { x: 0, y: 0, w: b[2][0] * S + PAD * 2 + extra, h: b[2][1] * S + PAD * 2 + extra };
  }

  _applyView() {
    const v = this._view || this._fullView();
    this.shadowRoot.querySelector("svg").setAttribute("viewBox", `${v.x} ${v.y} ${v.w} ${v.h}`);
  }

  // svg coordinates of a screen point
  _svgPt(cx, cy) {
    const svg = this.shadowRoot.querySelector("svg");
    const pt = svg.createSVGPoint();
    pt.x = cx; pt.y = cy;
    const p = pt.matrixTransform(svg.getScreenCTM().inverse());
    return [p.x, p.y];
  }

  // zoom by factor k around an svg point (default: the middle of the view)
  _zoom(k, px, py) {
    const full = this._fullView(), v = this._view || full;
    const w = clamp(v.w * k, 2 * S, full.w * 2), f = w / v.w;
    if (px == null) { px = v.x + v.w / 2; py = v.y + v.h / 2; }
    this._view = { x: px - (px - v.x) * f, y: py - (py - v.y) * f, w, h: v.h * f };
    this._applyView();
  }

  // floors: plan.levels [{id, name}]; a room or item without `level` is on the first floor
  _levels() {
    return this._plan.levels?.length ? this._plan.levels : [{ id: "0", name: "Přízemí" }];
  }

  _on(x) {
    return String(x.level ?? this._levels()[0].id) === String(this._level);
  }

  // what a new room or item gets: nothing on the first floor, otherwise the current floor
  _stamp(item) {
    if (String(this._level) !== String(this._levels()[0].id)) item.level = this._level;
    return item;
  }

  _roomsHere() {
    return this._plan.rooms.filter((r) => this._on(r));
  }

  _fillLevels() {
    const sel = this.shadowRoot.querySelector(".level");
    const levels = this._levels();
    if (!levels.some((l) => String(l.id) === String(this._level))) this._level = levels[0].id;
    sel.innerHTML = levels.map((l) => `<option value="${esc(l.id)}">${esc(l.name)}</option>`).join("") +
      '<option value="+new">＋ Nové patro…</option><option value="+rename">Přejmenovat patro…</option>' +
      (levels.length > 1 && String(this._level) !== String(levels[0].id) ? '<option value="+delete">Smazat patro…</option>' : "");
    sel.value = String(this._level);
  }

  _levelAction(v) {
    const levels = this._levels();
    const cur = levels.find((l) => String(l.id) === String(this._level));
    if (v === "+new") {
      const name = prompt("Název nového patra", `${levels.length}. patro`);
      if (!name) return this._fillLevels();
      this._plan.levels = [...levels, { id: uid("lvl"), name }];
      this._level = this._plan.levels.at(-1).id;
      this._mode = "rooms"; // an empty floor starts with drawing rooms
    } else if (v === "+rename") {
      const name = prompt("Nový název patra", cur.name);
      if (!name) return this._fillLevels();
      this._plan.levels = levels.map((l) => (l === cur ? { ...l, name } : l));
    } else if (v === "+delete") {
      const rooms = this._roomsHere(), n = rooms.length + ["furniture", "devices", "sensors", "texts"].reduce((t, k) => t + this._plan[k].filter((x) => this._on(x)).length, 0);
      if (!confirm(`Smazat patro ${cur.name}${n ? ` i s ${n} místnostmi a prvky` : ""}?`)) return this._fillLevels();
      const ids = new Set(rooms.map((r) => r.id));
      this._plan.openings = this._plan.openings.filter((o) => !ids.has(o.room_id));
      for (const id of ids) delete this._plan.labels[id];
      for (const k of ["rooms", "furniture", "devices", "sensors", "texts"]) this._plan[k] = this._plan[k].filter((x) => !this._on(x));
      this._plan.levels = levels.filter((l) => l !== cur);
      this._level = this._plan.levels[0].id;
    } else this._level = v;
    this._sel = null;
    this._view = null;
    if (v.startsWith("+")) this._changed();
    else { this._draw(); this._form(); }
  }

  _bounds() {
    const rooms = this._roomsHere();
    if (!rooms.length) return [[0, 0], [6, 0], [6, 6], [0, 6]];
    const xs = rooms.flatMap((r) => r.points.map((p) => p[0]));
    const zs = rooms.flatMap((r) => r.points.map((p) => p[1]));
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
    if (sel.g) {
      // several fixtures of one light in one room: edited as one item, like the card shows it
      const fs = sel.g.map((i) => this._plan.furniture[i]);
      return { ...fs[0], x: r3(fs.reduce((t, f) => t + f.x, 0) / fs.length), z: r3(fs.reduce((t, f) => t + f.z, 0) / fs.length), count: fs.length };
    }
    return this._plan[sel.cat][sel.i];
  }

  _move(sel, x, z) {
    if (sel.cat === "rooms" || sel.cat === "openings") return; // moved by their own handlers
    if (sel.g) {
      const o = this._get(sel), dx = snap(x - o.x), dz = snap(z - o.z);
      for (const i of sel.g) { const f = this._plan.furniture[i]; f.x = r3(f.x + dx); f.z = r3(f.z + dz); }
      return;
    }
    if (sel.cat === "labels") this._plan.labels[sel.id] = [r3(snap(x)), r3(snap(z))];
    else Object.assign(this._plan[sel.cat][sel.i], { x: r3(snap(x)), z: r3(snap(z)) });
  }

  _draw() {
    const svg = this.shadowRoot.querySelector("svg");
    // the view stays put while dragging, so a moved corner does not shift the whole plan under the pointer
    if (!this._dragging) this._applyView();
    svg.innerHTML = "";
    svg.setAttribute("class", "mode-" + this._mode);
    if (this._multi && !this._multi.some((m) => selEq(m, this._sel))) this._multi = null;
    this.shadowRoot.querySelectorAll(".modes button").forEach((b) => b.classList.toggle("on", b.dataset.m === this._mode));
    this._fillAdd();
    const plan = this._plan;
    const states = this._hass.states;
    // colour rules are previewed with the current states (templates are left out here)
    const ruled = (o) => (o.rules ? evalRules(o.rules, states) : {});
    const paint = (node, res, fill) => {
      if (res.color) {
        const c = COLORS[res.color] || res.color;
        node.style.stroke = c;
        if (fill) { node.style.fill = c; node.style.fillOpacity = ".45"; }
        if (res.glow) node.style.filter = `drop-shadow(0 0 3px ${c}) drop-shadow(0 0 8px ${c})`;
      }
    };
    plan.openings ||= [];
    this._fillLevels();
    plan.rooms.forEach((r, i) => {
      if (!this._on(r)) return;
      const f = el("path", { d: "M" + r.points.map(P).map((p) => p.join(",")).join("L") + "Z", class: "floor" + (this._sel?.cat === "rooms" && this._sel.i === i ? " sel" : "") }, svg);
      const res = ruled(r), tint = res.tint || res.color;
      if (tint) el("path", { d: f.getAttribute("d"), class: "tint", fill: COLORS[tint] || tint, "fill-opacity": res.opacity ?? 0.14 }, svg);
      if (this._mode !== "rooms") return;
      f.addEventListener("pointerdown", (e) => {
        const base = r.points.map((p) => [...p]);
        this._press(e, { cat: "rooms", i }, (dx, dz) => {
          const sx = snap(dx), sz = snap(dz);
          r.points = base.map(([x, z]) => [r3(Math.max(0, x + sx)), r3(Math.max(0, z + sz))]);
        });
      });
    });
    plan.openings.forEach((o, oi) => {
      const r = plan.rooms.find((x) => x.id === o.room_id);
      if (!r || !this._on(r)) return;
      const { a, u, L } = edgeOf(r, o.edge);
      const A = P([a[0] + u[0] * (o.offset - o.width / 2), a[1] + u[1] * (o.offset - o.width / 2)]);
      const B = P([a[0] + u[0] * (o.offset + o.width / 2), a[1] + u[1] * (o.offset + o.width / 2)]);
      el("line", { x1: A[0], y1: A[1], x2: B[0], y2: B[1], class: "open-line" }, svg);
      const selected = this._sel?.cat === "openings" && this._sel.i === oi;
      if (o.style !== "passage") {
        el("line", { x1: A[0], y1: A[1], x2: B[0], y2: B[1], class: o.type === "window" ? "win" : "door" }, svg);
        // the leaf and its arc show the hinge side and which way it opens, as on the card
        // without a contact a window (or glass door) stays shut on the card: drawn shut here too
        const shut = !o.contact && (o.type === "window" || o.style === "glass");
        const g = this._swing(o, r), ang = shut ? 0 : o.type === "window" ? 0.62 : Math.PI / 2;
        const tip = [g.H[0] + (g.along[0] * Math.cos(ang) + g.nn[0] * Math.sin(ang)) * g.w, g.H[1] + (g.along[1] * Math.cos(ang) + g.nn[1] * Math.sin(ang)) * g.w];
        const [hx, hz] = P(g.H), [tx, tz] = P(tip), [ex, ez] = P(g.E);
        const cross = g.along[0] * g.nn[1] - g.along[1] * g.nn[0];
        if (!shut) el("path", { d: `M${ex},${ez} A${g.w * S},${g.w * S} 0 0 ${cross > 0 ? 1 : 0} ${tx},${tz}`, class: "swing-arc" + (selected ? " on" : "") }, svg);
        el("line", { x1: hx, y1: hz, x2: tx, y2: tz, class: "swing-leaf" + (selected ? " on" : "") }, svg);
        if (selected && this._mode === "rooms") {
          const flip = (cx, cz, glyph, title, fn) => {
            const h = el("g", { class: "flip", transform: `translate(${cx} ${cz})` }, svg);
            el("circle", { r: 10 }, h);
            el("text", { "text-anchor": "middle", y: 4 }, h).textContent = glyph;
            el("title", {}, h).textContent = title;
            h.addEventListener("pointerdown", (e) => { e.stopPropagation(); fn(); this._changed(); });
          };
          flip(hx, hz, "⇄", "Panty na druhou stranu", () => (o.hinge = o.hinge === "right" ? "left" : "right"));
          const [mx, mz] = P([g.H[0] + (g.along[0] + g.nn[0]) * g.w * 0.45, g.H[1] + (g.along[1] + g.nn[1]) * g.w * 0.45]);
          flip(mx, mz, "⇅", "Otevírat na druhou stranu", () => (o.swing = o.swing === "out" ? "in" : "out"));
        }
      }
      if (o.blind) {
        const c = centroid(r.points), m = [a[0] + u[0] * o.offset, a[1] + u[1] * o.offset];
        let n = [-u[1], u[0]];
        if ((c[0] - m[0]) * n[0] + (c[1] - m[1]) * n[1] < 0) n = [-n[0], -n[1]];
        const k = o.blind_side === "out" ? -8 : 8;
        el("line", { x1: A[0] + n[0] * k, y1: A[1] + n[1] * k, x2: B[0] + n[0] * k, y2: B[1] + n[1] * k, class: "blind" }, svg);
      }
      if (o.lock) {
        const c = centroid(r.points), m = [a[0] + u[0] * o.offset, a[1] + u[1] * o.offset];
        let n = [-u[1], u[0]];
        if ((c[0] - m[0]) * n[0] + (c[1] - m[1]) * n[1] < 0) n = [-n[0], -n[1]];
        const [lx, lz] = P([m[0] + n[0] * 0.3, m[1] + n[1] * 0.3]);
        const g = el("g", { transform: `translate(${lx} ${lz})`, class: "door-lock" }, svg);
        el("circle", { r: 9, class: "dev" }, g);
        el("g", { class: "ico" }, g).innerHTML = iconHtml(null, 12, "mdiLock");
      }
      if (selected) el("line", { x1: A[0], y1: A[1], x2: B[0], y2: B[1], class: "open-sel" }, svg);
      // dragging slides the opening along its wall
      el("line", { x1: A[0], y1: A[1], x2: B[0], y2: B[1], class: "open-hit" }, svg).addEventListener("pointerdown", (e) => {
        const base = o.offset;
        this._press(e, { cat: "openings", i: oi }, (dx, dz) => {
          o.offset = r3(clamp(snap(base + dx * u[0] + dz * u[1]), o.width / 2, L - o.width / 2));
        });
      });
    });
    const same = (sel) => selEq(this._sel, sel) || !!this._multi?.some((m) => selEq(m, sel));
    const groups = this._groups();
    const grouped = new Set([...groups.values()].filter((g) => g.length > 1).flat());
    const group = (sel, x, z, rot = 0, k = 1) => {
      const [cx, cz] = P([x, z]);
      const g = el("g", { class: "item" + (same(sel) ? " sel" : ""), transform: `translate(${cx} ${cz}) rotate(${rot}) scale(${k})` }, svg);
      this._drag(g, sel);
      return g;
    };
    const icon = (g, item, size, fallback, cls = "ico") => (el("g", { class: cls }, g).innerHTML = iconHtml(item.icon, size, fallback));
    const layer = (o) => o.layer || 0;
    // furniture first (by layer), lights over it, then appliances, sensors and labels on top
    const order = plan.furniture.map((f, i) => [f, i]).sort((a, b) => isLight(a[0]) - isLight(b[0]) || layer(a[0]) - layer(b[0]));
    for (const [f, i] of order) {
      if (grouped.has(i) || !this._on(f)) continue;
      const res = ruled(f);
      const point = isPoint(f);
      const g = group({ cat: "furniture", i }, f.x, f.z, point ? 0 : f.rotation || 0, point ? SIZES[f.size] || 1 : 1);
      if (res.hide) g.classList.add("rhid");
      const w = f.w * S, d = f.d * S;
      const missing = isLight(f) && !f.entity;
      if (f.type === "led_strip") {
        el("line", { x1: -w / 2, y1: 0, x2: w / 2, y2: 0, class: "strip-hit" }, g);
        el("line", { x1: -w / 2, y1: 0, x2: w / 2, y2: 0, class: "strip" + (missing ? " noent" : "") }, g);
      } else if (isLight(f)) {
        el("circle", { r: 11, class: "lamp" + (missing ? " noent" : "") }, g);
        icon(g, f, 14, lightIcon(f.type), "ico lamp-ico");
      } else if (f.type === "robot_vacuum") {
        el("circle", { r: 12, class: "dev" }, g);
        icon(g, f, 16, "mdiRobotVacuum");
      } else {
        paint(el("rect", { x: -w / 2, y: -d / 2, width: Math.max(w, 2), height: Math.max(d, 2), rx: 3, class: "furn" }, g), res, true);
        const size = Math.min(w, d) * 0.6;
        if (size >= 9 && f.icon !== "none") el("g", { transform: `rotate(${-(f.rotation || 0)})` }, g).innerHTML = `<g class="ico furn-ico">${iconHtml(f.icon, Math.min(size, 26), FURNITURE[f.type]?.[1] || "mdiShapeOutline")}</g>`;
      }
    }
    for (const members of groups.values()) {
      if (members.length < 2) continue;
      const sel = { cat: "furniture", i: members[0], g: members }, o = this._get(sel);
      const g = group(sel, o.x, o.z, 0, SIZES[o.size] || 1);
      if (ruled(o).hide) g.classList.add("rhid");
      el("circle", { r: 11, class: "lamp" }, g);
      icon(g, o, 14, lightIcon(o.type), "ico lamp-ico");
      el("circle", { cx: 10, cy: -10, r: 7, class: "count" }, g);
      el("text", { class: "count-t", "text-anchor": "middle", x: 10, y: -6.5 }, g).textContent = members.length;
    }
    plan.devices.map((d, i) => [d, i]).filter(([d]) => this._on(d)).sort((a, b) => layer(a[0]) - layer(b[0])).forEach(([d, i]) => {
      const g = group({ cat: "devices", i }, d.x, d.z, 0, SIZES[d.size] || 1);
      const res = ruled(d);
      if (res.hide) g.classList.add("rhid");
      paint(el("circle", { r: 15, class: "dev" + (d.entity ? "" : " noent") }, g), res, false);
      icon(g, d, 18, DEVICE_ICON[d.kind] || "mdiShapeOutline");
    });
    plan.sensors.forEach((s, i) => {
      if (!this._on(s)) return;
      const g = group({ cat: "sensors", i }, s.x, s.z);
      el("circle", { r: 11, class: "sensor" + (s.entity ? "" : " noent") }, g);
      const dc = states[s.entity]?.attributes.device_class;
      icon(g, s, 14, dc === "moisture" ? "mdiWaterAlert" : "mdiMotionSensor", "ico sensor-ico");
    });
    plan.texts.forEach((t, i) => {
      if (!this._on(t)) return;
      const g = group({ cat: "texts", i }, t.x, t.z, t.rotation || 0, SIZES[t.size] || 1);
      g.classList.add("label");
      const res = ruled(t);
      if (res.hide) g.classList.add("rhid");
      const rect = el("rect", { rx: 5, class: t.entity || t.text ? "" : "noent" }, g);
      const tx = el("text", { "text-anchor": "middle", y: 4 }, g);
      const s = states[t.entity];
      tx.textContent = t.text || (s ? s.state + (s.attributes.unit_of_measurement ? " " + s.attributes.unit_of_measurement : "") : t.entity || "Text");
      const fg = res.color || t.color, bg = res.background || t.background;
      if (fg) tx.style.fill = COLORS[fg] || fg;
      if (bg) rect.style.fill = bg === "none" ? "transparent" : COLORS[bg] || bg;
      const bb = tx.getBBox();
      Object.entries({ x: bb.x - 6, y: bb.y - 3, width: bb.width + 12, height: bb.height + 6 }).forEach(([k, v]) => rect.setAttribute(k, v));
    });
    for (const r of plan.rooms) {
      if (!this._on(r)) continue;
      const [x, z] = plan.labels[r.id] || centroid(r.points);
      const g = group({ cat: "labels", id: r.id }, x, z, r.label_rotation || 0);
      g.classList.add("label");
      if (r.label_hidden || ruled(r).hide) g.classList.add("rhid");
      const rect = el("rect", { rx: 8 }, g);
      const t = el("text", { "text-anchor": "middle", y: 4 }, g);
      t.textContent = r.label_name === false ? `(${r.name})` : r.name;
      const bb = t.getBBox();
      Object.entries({ x: bb.x - 8, y: bb.y - 4, width: bb.width + 16, height: bb.height + 8 }).forEach(([k, v]) => rect.setAttribute(k, v));
    }
    if (this._sel?.cat === "rooms") this._handles(svg, this._sel.i);
    const f = this._sel?.cat === "furniture" && !this._sel.g && plan.furniture[this._sel.i];
    if (f && !isPoint(f) && this._mode === "items") this._resize(svg, f, this._sel);
    // custom icons load asynchronously from HA's icon set
    svg.querySelectorAll("[data-icon]").forEach((p) => resolveIcon(p.dataset.icon).then((d) => d && p.setAttribute("d", d)));
  }

  // fixtures of one light in one room are one item, as on the card (a room's ceiling spots count as one light)
  _groups() {
    const plan = this._plan;
    const rooms = this._roomsHere();
    const roomOf = (f) => rooms.find((r) => inPoly([f.x, f.z], r.points))?.id;
    const groups = new Map();
    plan.furniture.forEach((f, i) => {
      if (!isLight(f) || f.type === "led_strip" || !f.entity || !this._on(f)) return;
      const key = f.entity + "|" + roomOf(f);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(i);
    });
    return groups;
  }

  // door or window leaf geometry in metres: hinge H, free end E, unit vector along the wall and the swing normal
  _swing(o, r) {
    const { a, u } = edgeOf(r, o.edge);
    const c = centroid(r.points);
    let n = [-u[1], u[0]];
    const mid = [a[0] + u[0] * o.offset, a[1] + u[1] * o.offset];
    if ((c[0] - mid[0]) * n[0] + (c[1] - mid[1]) * n[1] < 0) n = [-n[0], -n[1]];
    const s0 = o.offset - o.width / 2, s1 = o.offset + o.width / 2;
    const A = [a[0] + u[0] * s0, a[1] + u[1] * s0], B = [a[0] + u[0] * s1, a[1] + u[1] * s1];
    const atA = o.hinge !== "right";
    const H = atA ? A : B, E = atA ? B : A, w = o.width || 1e-9;
    const k = o.swing === "out" ? -1 : 1;
    return { H, E, w, along: [(E[0] - H[0]) / w, (E[1] - H[1]) / w], nn: [n[0] * k, n[1] * k] };
  }

  // resize handles on the corners and sides (strip: its two ends) and a rotate handle above the item
  _resize(svg, f, sel) {
    const a = ((f.rotation || 0) * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a);
    const strip = f.type === "led_strip";
    const toW = (b, lx, lz) => [b.x + lx * c - lz * s, b.z + lx * s + lz * c];
    const toL = (b, p) => { const dx = p[0] - b.x, dz = p[1] - b.z; return [dx * c + dz * s, -dx * s + dz * c]; };
    const spots = strip ? [[-1, 0], [1, 0]] : [[-1, -1], [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0]];
    for (const [sx, sz] of spots) {
      const [hx, hz] = P(toW(f, (sx * f.w) / 2, (sz * f.d) / 2));
      el("rect", { x: hx - 5, y: hz - 5, width: 10, height: 10, class: "rsz" }, svg).addEventListener("pointerdown", (e) => {
        const b = { x: f.x, z: f.z, w: f.w, d: f.d };
        this._press(e, sel, (dx, dz, p) => {
          // the opposite side stays where it is
          const [lx, lz] = toL(b, p);
          let cx = 0, cz = 0;
          if (sx) { const fixed = (-sx * b.w) / 2; f.w = r3(Math.max(SNAP, snap((lx - fixed) * sx))); cx = fixed + (sx * f.w) / 2; }
          if (sz) { const fixed = (-sz * b.d) / 2; f.d = r3(Math.max(SNAP, snap((lz - fixed) * sz))); cz = fixed + (sz * f.d) / 2; }
          const [nx, nz] = toW(b, cx, cz);
          f.x = r3(nx); f.z = r3(nz);
        });
      });
    }
    const top = strip ? 0 : -f.d / 2;
    const [ax, az] = P(toW(f, 0, top)), [rx, rz] = P(toW(f, 0, top - 0.35));
    el("line", { x1: ax, y1: az, x2: rx, y2: rz, class: "rot-line" }, svg);
    const h = el("circle", { cx: rx, cy: rz, r: 7, class: "rot-h" }, svg);
    el("title", {}, h).textContent = "Otočit (po 15°)";
    h.addEventListener("pointerdown", (e) => this._press(e, sel, (dx, dz, p) => {
      const deg = (Math.atan2(p[1] - f.z, p[0] - f.x) * 180) / Math.PI + 90;
      f.rotation = (((Math.round(deg / 15) * 15) % 360) + 360) % 360;
    }));
  }

  // corners of the selected room: drag to move (snaps to other rooms' corners), "+" between two adds one
  _handles(svg, ri) {
    const r = this._plan.rooms[ri];
    r.points.forEach((p, k) => {
      const q = r.points[(k + 1) % r.points.length];
      const [mx, mz] = P([(p[0] + q[0]) / 2, (p[1] + q[1]) / 2]);
      el("circle", { cx: mx, cy: mz, r: 6, class: "mid" }, svg).addEventListener("pointerdown", (e) => {
        e.stopPropagation();
        this._insertCorner(r, k, [r3(snap((p[0] + q[0]) / 2)), r3(snap((p[1] + q[1]) / 2))]);
        this._sel = { cat: "rooms", i: ri, v: k + 1 };
        this._changed();
      });
    });
    const others = this._plan.rooms.filter((x) => x !== r).flatMap((x) => x.points);
    r.points.forEach((p, k) => {
      const [cx, cz] = P(p);
      el("circle", { cx, cy: cz, r: 8, class: "vtx" + (this._sel.v === k ? " sel" : "") }, svg).addEventListener("pointerdown", (e) => {
        const base = [...p];
        this._press(e, { cat: "rooms", i: ri, v: k }, (dx, dz) => {
          let x = base[0] + dx, z = base[1] + dz;
          const near = others.find((o) => Math.hypot(o[0] - x, o[1] - z) < 0.15);
          [x, z] = near || [snap(x), snap(z)];
          r.points[k] = [r3(Math.max(0, x)), r3(Math.max(0, z))];
        });
      });
    });
  }

  // a new corner splits edge k; openings further along that wall move to the second half
  _insertCorner(r, k, pt) {
    const split = Math.hypot(pt[0] - r.points[k][0], pt[1] - r.points[k][1]);
    for (const o of this._plan.openings) {
      if (o.room_id !== r.id) continue;
      if (o.edge > k) o.edge++;
      else if (o.edge === k && o.offset > split) { o.edge = k + 1; o.offset = r3(o.offset - split); }
    }
    r.points.splice(k + 1, 0, pt);
  }

  // removing corner k joins edges k-1 and k; their openings stay on the joined wall
  _removeCorner(r, k) {
    const n = r.points.length, prev = (k - 1 + n) % n, before = edgeOf(r, prev).L;
    for (const o of this._plan.openings) {
      if (o.room_id !== r.id) continue;
      let e = o.edge;
      if (e === k) { e = prev; o.offset = r3(o.offset + before); }
      // indices after the removed corner shift down by one (for corner 0 all of them)
      o.edge = k === 0 ? e - 1 : e > k ? e - 1 : e;
    }
    r.points.splice(k, 1);
    // the joined wall can be shorter than the two old ones: keep openings on it
    for (const o of this._plan.openings) {
      if (o.room_id !== r.id) continue;
      const L = edgeOf(r, o.edge).L;
      o.width = Math.min(o.width ?? 0.8, L);
      o.offset = r3(clamp(o.offset, o.width / 2, L - o.width / 2));
    }
  }

  _fillAdd() {
    const sel = this.shadowRoot.querySelector(".add");
    const want = this._mode === "rooms" ? "rooms" : "items";
    if (sel.dataset.for === want) return;
    sel.dataset.for = want;
    sel.innerHTML = want === "rooms"
      ? '<option value="">+ Přidat</option><option value="room">Místnost</option>'
      : `<option value="">+ Přidat</option>${ADD.map(([l], i) => `<option value="${i}">${l}</option>`).join("")}`;
  }

  _drag(g, sel) {
    g.addEventListener("pointerdown", (e) => {
      let bases = null;
      this._press(e, sel, (dx, dz) => {
        // a dragged member of the multi-selection moves all of it by the same snapped offset
        bases ??= (this._multi?.some((m) => selEq(m, sel)) ? this._multi : [sel]).map((s) => [s, this._get(s)]);
        if (bases.length === 1) return this._move(sel, bases[0][1].x + dx, bases[0][1].z + dz);
        const sx = snap(dx), sz = snap(dz);
        for (const [s, o] of bases) {
          if (s.g || s.cat === "labels") this._move(s, o.x + sx, o.z + sz);
          else Object.assign(this._plan[s.cat][s.i], { x: r3(o.x + sx), z: r3(o.z + sz) });
        }
      });
    });
  }

  // all items sharing the `group` of the item under `sel` (null when it has none)
  _groupOf(sel) {
    const o = GROUPABLE.includes(sel.cat) && !sel.g && this._plan[sel.cat][sel.i];
    if (!o?.group) return null;
    const out = [];
    for (const cat of GROUPABLE) this._plan[cat].forEach((x, i) => { if (x.group === o.group && this._on(x)) out.push({ cat, i }); });
    return out.length > 1 ? out : null;
  }

  // Ctrl+click: add an item (with its group) to the selection or take it out
  _toggle(sel) {
    const add = this._groupOf(sel) || [sel];
    let m = this._multi || (this._sel && this._sel.cat !== "rooms" && this._sel.cat !== "openings" ? [this._sel] : []);
    if (m.some((x) => selEq(x, sel))) m = m.filter((x) => !add.some((a) => selEq(a, x)));
    else m = [...m, ...add.filter((a) => !m.some((x) => selEq(x, a)))];
    this._multi = m.length > 1 ? m : null;
    this._sel = m.at(-1) || null;
  }

  // the selection as plan objects: [cat, object, index]; light groups expand to their fixtures, labels are left out
  _picked() {
    const out = [];
    for (const s of this._multi || (this._sel ? [this._sel] : [])) {
      if (s.cat === "labels" || s.cat === "rooms" || s.cat === "openings") continue;
      for (const i of s.g || [s.i]) out.push([s.cat, this._plan[s.cat][i], i]);
    }
    return out;
  }

  // select `sel` on press; while the pointer moves, onMove(dx, dz, point) gets the offset in metres
  _press(e, sel, onMove) {
    {
      e.stopPropagation();
      const changedSel = JSON.stringify(this._sel) !== JSON.stringify(sel);
      const toggle = (e.ctrlKey || e.metaKey) && this._mode === "items";
      const inMulti = this._multi?.some((m) => selEq(m, sel));
      if (!toggle) {
        if (!inMulti) this._multi = this._groupOf(sel);
        this._sel = sel;
      }
      const start = this._toPlan(e);
      let moved = false, axis = null;
      const svg = this.shadowRoot.querySelector("svg");
      svg.setPointerCapture(e.pointerId);
      const move = (ev) => {
        const p = this._toPlan(ev);
        let dx = p[0] - start[0], dz = p[1] - start[1];
        if (!moved && Math.hypot(dx, dz) < 0.03) return;
        // Ctrl (or Shift) held: only along one axis, chosen by the first few cm of the move and kept until released
        if (ev.ctrlKey || ev.metaKey || ev.shiftKey) {
          if (!axis && Math.hypot(dx, dz) >= 0.05) axis = Math.abs(dx) >= Math.abs(dz) ? "x" : "z";
          if (axis === "x" || (!axis && Math.abs(dx) >= Math.abs(dz))) dz = 0; else dx = 0;
        } else axis = null;
        if (!moved && toggle && !inMulti) { this._sel = sel; this._multi = this._groupOf(sel); }
        moved = true;
        this._dragging = true;
        onMove(dx, dz, p);
        this._dirty = true;
        this._draw();
      };
      const up = () => {
        this._dragging = false;
        svg.removeEventListener("pointermove", move);
        svg.removeEventListener("pointerup", up);
        svg.removeEventListener("pointercancel", up);
        if (moved) this._changed();
        else if (toggle) { this._toggle(sel); this._draw(); this._form(); }
        else if (changedSel || this._multi) { this._draw(); this._form(); }
      };
      svg.addEventListener("pointermove", move);
      svg.addEventListener("pointerup", up);
      svg.addEventListener("pointercancel", up);
    }
  }

  _changed() {
    this._dirty = true;
    // undo history: one step per finished change (a whole drag is one step)
    const now = this._snap();
    if (now !== this._last) {
      this._undo.push(this._last);
      if (this._undo.length > 100) this._undo.shift();
      this._redo = [];
      this._last = now;
    }
    this._draw();
    this._form();
  }

  // the plan without its revision, so undo never brings back an old rev (the save would conflict)
  _snap() {
    const { rev, ...rest } = this._plan;
    return JSON.stringify(rest);
  }

  // undo (from = undo stack) or redo (from = redo stack)
  _history(from, to) {
    if (!from.length) return;
    to.push(this._last);
    this._last = from.pop();
    const rev = this._plan.rev;
    this._plan = JSON.parse(this._last);
    if (rev != null) this._plan.rev = rev;
    this._sel = null;
    this._dirty = true;
    this._draw();
    this._form();
  }

  _status() {
    const $ = (s) => this.shadowRoot.querySelector(s);
    $(".undo").disabled = !this._undo?.length;
    $(".redo").disabled = !this._redo?.length;
    $(".save").disabled = !this._dirty;
    $(".revert").disabled = !this._dirty;
    $(".state").textContent = this._dirty ? "Neuložené změny" : "";
  }

  // properties of the selected item
  _form() {
    this._status();
    const side = this.shadowRoot.querySelector(".side");
    const sel = this._sel, o = this._get();
    if (!o && this._mode === "rooms") {
      side.innerHTML = `<h2>Místnosti, okna a dveře</h2><p class="hint">Klepni na místnost: táhnutím ji posuneš celou, za modré body táhneš rohy (přichytí se k rohům sousedních místností), poloprůhledné body mezi rohy přidají nový roh.<br><br>Okno nebo dveře vybereš klepnutím a táhnutím posuneš po stěně. U vybraných dveří přehodí ⇄ panty a ⇅ směr otevírání. Nové přidáš v panelu vybrané místnosti.<br><br>Místnosti mají každá své stěny: když posuneš společnou stěnu, posuň i sousední místnost.</p>`;
      return;
    }
    if (this._multi && this._mode === "items") return this._multiForm(side);
    if (sel?.cat === "rooms") return this._roomForm(side, o);
    if (sel?.cat === "openings") return this._openingForm(side, o);
    if (!o) {
      side.innerHTML = `<h2>Úpravy půdorysu</h2><p class="hint">Klepni na světlo, spotřebič, senzor, text, nábytek nebo badge místnosti a uprav ho. Táhnutím ji přesuneš (mřížka 5 cm, s Ctrl nebo Shift jen v jedné ose), šipky posouvají vybraný prvek, Delete ho smaže. Ctrl+klik vybere víc prvků najednou (pak je jde táhnout spolu a seskupit), Ctrl+C / Ctrl+V kopíruje. Vybraný nábytek má úchyty na změnu velikosti a kolečko na otáčení.<br><br>Prvky bez entity mají červený přerušovaný okraj, prvky skryté pravidlem jsou bledé.<br><br>Změny se na dashboardu projeví hned po uložení.</p>`;
      return;
    }
    const field = (label, key, value, type = "text", extra = "") =>
      `<label>${label}</label><input data-k="${key}" type="${type}" value="${esc(value)}" ${extra}>`;
    const num = (label, key, value) => field(label, key, value ?? "", "number", 'step="0.05"');
    const xz = `<div class="row2"><div>${num("X (m)", "x", o.x)}</div><div>${num("Z (m)", "z", o.z)}</div></div>${this._placeField()}`;
    const rotation = `<label>Otočení (°)</label><input data-k="rotation" type="number" step="1" value="${o.rotation || 0}">
        <div class="rot"><button data-a="rot-15">−15°</button><button data-a="rot15">+15°</button><button data-a="rot90">+90°</button></div>`;
    let html = "";
    if (sel.cat === "labels") {
      html = `<h2>Badge místnosti: ${esc(o.room.name)}</h2><p class="hint">Přetáhni ho, kam patří. Co ukazuje, nastavíš u místnosti v režimu Místnosti.</p>
        ${xz}
        <label>Otočení (°)</label><input data-k="rotation" type="number" step="1" value="${o.room.label_rotation || 0}">
        <div class="rot"><button data-a="rot-15">−15°</button><button data-a="rot15">+15°</button><button data-a="rot90">+90°</button></div>
        <div class="actions"><button data-a="auto">Vrátit doprostřed místnosti</button></div>`;
    } else if (sel.cat === "furniture") {
      const light = isLight(o), point = isPoint(o), dock = o.type === "robot_vacuum";
      const types = light ? Object.keys(LIGHT_TYPES) : FURNITURE_TYPES;
      const label = (t) => (light ? LIGHT_TYPES[t] : FURNITURE[t]?.[0] || t);
      html = `<h2>${esc(label(o.type))}${sel.g ? ` <span class="hint">(${sel.g.length} svítidla jednoho světla)</span>` : ""}</h2>
        ${sel.g ? `<p class="hint">Svítidla jednoho světla v jedné místnosti jsou na kartě jeden prvek. Táhnutím posuneš všechna, změny platí pro všechna.</p>` : ""}
        <label>Typ</label><select data-k="type">${types.map((t) => `<option value="${t}" ${t === o.type ? "selected" : ""}>${esc(label(t))}</option>`).join("")}</select>
        ${field(light ? "Entita (světlo nebo spínač)" : o.type === "tv_wall" ? "Entita (media_player)" : dock ? "Entita (vacuum)" : "Entita (nepovinná, klepnutí otevře její detail)", "entity", o.entity || "", "text", 'list="ents"')}
        ${light ? `<label>Osvětlení místnosti</label><select data-k="room_light">
          <option value="" ${o.room_light == null ? "selected" : ""}>Výchozí</option>
          <option value="false" ${o.room_light === false ? "selected" : ""}>Jen slabě (akvárium, dekorace)</option>
          ${[0.3, 0.5, 0.75].map((v) => `<option value="${v}" ${o.room_light === v ? "selected" : ""}>${Math.round(v * 100)} %</option>`).join("")}
        </select>` : ""}
        ${light ? `<label class="chk"><input type="checkbox" data-k="sheet_hide" ${o.sheet_hide ? "checked" : ""}> nezobrazovat v panelu místnosti</label>` : ""}
        ${xz}
        ${point ? "" : o.type === "led_strip" ? num("Délka (m)", "w", o.w) : `<div class="row2"><div>${num("Šířka (m)", "w", o.w)}</div><div>${num("Hloubka (m)", "d", o.d)}</div></div>`}
        ${point ? "" : rotation}
        ${o.type === "led_strip" ? "" : this._iconField(o, light ? lightIcon(o.type) : FURNITURE[o.type]?.[1])}
        ${point ? this._sizeField(o) : ""}
        ${dock ? "" : this._layerField(o)}
        ${this._actionsUI(o, light ? { tap: "Přepnout", hold: "Detail entity" } : { tap: "Detail entity" })}
        ${this._rulesUI(o, o.type === "led_strip" ? ["hide"] : light || dock ? ["icon", "hide"] : ["color", "glow", "icon", "hide"])}`;
    } else if (sel.cat === "devices") {
      html = `<h2>${DEVICE_KINDS[o.kind] || "Spotřebič"}</h2>
        <label>Druh</label><select data-k="kind">${Object.entries(DEVICE_KINDS).map(([k, v]) => `<option value="${k}" ${k === o.kind ? "selected" : ""}>${v}</option>`).join("")}</select>
        ${field("Název", "name", o.name || "")}
        ${field("Entita", "entity", o.entity || "", "text", 'list="ents"')}
        <label>Běží, když má entita stav (čárkou, nebo {"above": 20})</label><input data-k="active" value="${esc(Array.isArray(o.active) ? o.active.join(", ") : o.active ? JSON.stringify(o.active) : "")}" placeholder="${o.kind === "media" ? "playing" : "on, run"}">
        ${field("Text pod ikonou z entity", "info", o.info || "", "text", 'list="ents"')}
        ${field("Předpona textu", "prefix", o.prefix || "")}
        <div class="row2"><div>${field("Text pod ikonou", "text", o.text || "")}</div><div>${field("Text, když běží", "text_on", o.text_on || "")}</div></div>
        <p class="hint">Oba texty můžou být šablona {{ … }}. Když běží a text pro běh je prázdný, ukáže se text z entity výše (nebo název u přehrávače), jinak text pod ikonou.</p>
        <div class="row2"><div><label>Barva</label>${this._colorPick("color", o.color)}</div><div><label>Barva, když běží</label>${this._colorPick("color_on", o.color_on)}</div></div>
        <p class="hint">Výchozí = barva stavu entity z motivu HA.</p>
        <label class="chk"><input type="checkbox" data-k="sheet_hide" ${o.sheet_hide ? "checked" : ""}> nezobrazovat v panelu místnosti</label>
        ${o.kind === "media" ? `<label class="chk"><input type="checkbox" data-k="cover" ${o.cover === false ? "" : "checked"}> obal alba nebo pořadu v odznaku (při přehrávání a pauze)</label>` : ""}
        ${xz}
        ${this._iconField(o, DEVICE_ICON[o.kind])}
        ${this._sizeField(o)}
        ${this._layerField(o)}
        ${this._actionsUI(o, { tap: "Detail entity" })}
        ${this._rulesUI(o, ["color", "glow", "animate", "text", "icon", "wave", "hide"])}`;
    } else if (sel.cat === "texts") {
      html = `<h2>Text</h2><p class="hint">Ukáže stav entity (s jednotkou), nebo vlastní text. Text může být šablona, třeba {{ states('sensor.x') }}.</p>
        ${field("Entita", "entity", o.entity || "", "text", 'list="ents"')}
        ${field("Vlastní text (místo stavu)", "text", o.text || "")}
        <label>Barva textu</label>${this._colorPick("color", o.color)}
        <label>Pozadí</label>${this._colorPick("background", o.background, true)}
        ${xz}${rotation}
        ${this._sizeField(o)}
        ${this._actionsUI(o, { tap: "Detail entity" })}
        ${this._rulesUI(o, ["color", "background", "text", "hide"])}`;
    } else {
      html = `<h2>Senzor</h2><p class="hint">Pohyb a přítomnost dělají vlnky, voda (třída moisture) rozbliká místnost.</p>
        ${field("Entita (binary_sensor)", "entity", o.entity || "", "text", 'list="ents"')}${xz}`;
    }
    if (sel.cat !== "labels") html += `<div class="actions"><button data-a="dup">Duplikovat</button><button data-a="del" class="del">Smazat</button></div>`;
    side.innerHTML = html;
    this._bind(side, (k, v, inp) => this._set(k, v, inp), (a) => this._action(a));
    this._afterForm(side);
  }

  _bind(side, set, act) {
    side.querySelectorAll("[data-k]").forEach((inp) => inp.addEventListener("change", () => set(inp.dataset.k, inp.type === "checkbox" ? inp.checked : inp.value, inp)));
    side.querySelectorAll("[data-a]").forEach((btn) => btn.addEventListener("click", () => act(btn.dataset.a)));
  }

  // what the shared fields need after the html is in place: the HA icon picker and the YAML text of the rules
  _afterForm(side) {
    const inp = side.querySelector('input[data-k="icon"]');
    if (inp && customElements.get("ha-icon-picker")) {
      const pick = document.createElement("ha-icon-picker");
      pick.hass = this._hass;
      pick.value = inp.value;
      pick.placeholder = inp.placeholder;
      pick.addEventListener("value-changed", (e) => this._set("icon", e.detail.value || ""));
      inp.replaceWith(pick);
    }
    const ta = side.querySelector('[data-k="rules_yaml"]');
    if (ta) {
      const rules = this._targets()[0]?.rules;
      if (!rules?.length) ta.value = "";
      else this._hass.callWS({ type: "fns_floorplan/yaml/dump", data: rules }).then((r) => (ta.value = r.text), () => (ta.value = JSON.stringify(rules, null, 1)));
    }
  }

  // the objects a change applies to: every fixture of a light group, otherwise the selected item
  _multiForm(side) {
    const items = this._picked().map(([, o]) => o);
    const groups = new Set(items.map((o) => o.group));
    const one = groups.size === 1 && !groups.has(undefined);
    side.innerHTML = `<h2>Vybráno ${this._multi.length} prvků</h2>
      <p class="hint">Ctrl+klik přidá nebo odebere další prvek. Táhnutím nebo šipkami posuneš všechny najednou, Ctrl+C / Ctrl+V je zkopíruje, Delete smaže. ${one ? "Prvky tvoří skupinu: klepnutí na kterýkoli vybere celou skupinu." : "Seskupené prvky se pak vybírají a táhnou vždy spolu."}</p>
      <div class="actions">${one ? "" : '<button data-a="group">Seskupit</button>'}${[...groups].some(Boolean) ? '<button data-a="ungroup">Zrušit skupinu</button>' : ""}<button data-a="mdel" class="del">Smazat</button></div>`;
    side.querySelectorAll("[data-a]").forEach((btn) => btn.addEventListener("click", () => {
      const a = btn.dataset.a;
      if (a === "group") { const id = uid("grp"); for (const o of items) o.group = id; }
      else if (a === "ungroup") for (const o of items) delete o.group;
      else if (a === "mdel") this._deletePicked();
      this._changed();
    }));
  }

  _deletePicked() {
    const picked = this._picked().sort((a, b) => b[2] - a[2]);
    for (const [cat, , i] of picked) this._plan[cat].splice(i, 1);
    this._sel = null;
    this._multi = null;
  }

  _targets() {
    const sel = this._sel;
    if (!sel) return [];
    if (sel.g) return sel.g.map((i) => this._plan.furniture[i]);
    if (sel.cat === "labels") return [];
    return [this._plan[sel.cat][sel.i]];
  }

  _iconField(o, fallback) {
    const def = fallback ? "mdi:" + fallback.slice(3).replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase() : "";
    if (o.icon === "none") return `<label>Ikona</label><div class="icon-row"><span class="hint" style="flex:1">bez ikony</span><button class="mini" data-a="icon-reset">Vrátit výchozí</button></div>`;
    return `<label>Ikona (prázdná = výchozí)</label><div class="icon-row"><ha-icon icon="${esc(o.icon || def)}"></ha-icon>
      <input data-k="icon" value="${esc(o.icon || "")}" placeholder="${esc(def || "mdi:…")}">${o.icon ? `<button class="mini" data-a="icon-reset" title="Výchozí ikona">✕</button>` : ""}
      <button class="mini" data-a="icon-none" title="Nezobrazovat žádnou ikonu">Bez ikony</button></div>`;
  }

  // quick placement inside the item's room: corners, sides, middle
  _placeField() {
    const cells = [["tl", "↖"], ["t", "↑"], ["tr", "↗"], ["l", "←"], ["c", "•"], ["r", "→"], ["bl", "↙"], ["b", "↓"], ["br", "↘"]];
    return `<label>Umístit v místnosti</label><div class="place">${cells.map(([k, g]) => `<button data-a="place:${k}" title="${k === "c" ? "Střed místnosti" : "K okraji místnosti"}">${g}</button>`).join("")}</div>`;
  }

  _place(where) {
    const sel = this._sel, o = this._get();
    const room = sel.cat === "labels" ? o.room : this._roomsHere().find((r) => inPoly([o.x, o.z], r.points));
    if (!room) return;
    const xs = room.points.map((p) => p[0]), zs = room.points.map((p) => p[1]);
    // keep the whole item inside: half of its turned box, or a fixed gap for point items
    let hx = 0.3, hz = 0.3;
    if (sel.cat === "furniture" && !sel.g && !isPoint(o)) {
      const a = ((o.rotation || 0) * Math.PI) / 180, c = Math.abs(Math.cos(a)), sn = Math.abs(Math.sin(a));
      const d = o.type === "led_strip" ? 0 : o.d;
      hx = (o.w * c + d * sn) / 2 + 0.05; hz = (o.w * sn + d * c) / 2 + 0.05;
    }
    const x0 = Math.min(...xs) + hx, x1 = Math.max(...xs) - hx, z0 = Math.min(...zs) + hz, z1 = Math.max(...zs) - hz;
    let x = where.includes("l") ? x0 : where.includes("r") ? x1 : (x0 + x1) / 2;
    let z = where.includes("t") ? z0 : where.includes("b") ? z1 : (z0 + z1) / 2;
    if (where === "c") { const c = centroid(room.points); if (inPoly(c, room.points)) [x, z] = c; }
    this._move(sel, x, z);
  }

  _sizeField(o) {
    return `<label>Velikost</label><select data-k="size">${Object.entries(SIZE_NAMES).map(([k, v]) => `<option value="${k}" ${(o.size || "") === k ? "selected" : ""}>${v}</option>`).join("")}</select>`;
  }

  _layerField(o) {
    return `<label>Pořadí při překrytí (vrstva ${o.layer || 0})</label><div class="layers">
      <button data-a="layer:top">Úplně nahoru</button><button data-a="layer:up">Dopředu</button><button data-a="layer:down">Dozadu</button><button data-a="layer:bottom">Úplně dolů</button></div>`;
  }

  // a colour: one of the named colours or any picked one; `none` offers a transparent background
  _colorPick(key, value, none = false) {
    const custom = value && !COLORS[value] && value !== "none";
    return `<div class="outc" style="margin-top:0"><select data-k="${key}">
      <option value="">Výchozí</option>${none ? `<option value="none" ${value === "none" ? "selected" : ""}>Žádné</option>` : ""}
      ${Object.entries(COLOR_NAMES).map(([k, v]) => `<option value="${k}" ${value === k ? "selected" : ""}>${v}</option>`).join("")}
      <option value="custom" ${custom ? "selected" : ""}>Vlastní…</option></select>
      <input type="color" data-k="${key}" value="${custom ? esc(value) : "#ff0000"}" ${custom ? "" : "hidden"}></div>`;
  }

  // tap, double tap and hold: default (as the card does it) or an action of choice
  _actionsUI(o, defaults) {
    const rows = Object.entries(ACTION_KEYS).map(([k, label]) => {
      const a = o[k + "_action"] || {};
      const cur = a.action || "";
      const def = defaults[k] ? `Výchozí (${defaults[k]})` : "Výchozí (nic)";
      let more = "";
      if (cur === "perform-action") more = `<input data-k="act:${k}:perform_action" value="${esc(a.perform_action || a.service || "")}" placeholder="light.turn_on">
        <input data-k="act:${k}:data" value="${esc(a.data ? JSON.stringify(a.data) : "")}" placeholder="data v YAML, např. entity_id: light.x">`;
      else if (cur === "navigate") more = `<input data-k="act:${k}:navigation_path" value="${esc(a.navigation_path || "")}" placeholder="/lovelace/0">`;
      else if (cur === "url") more = `<input data-k="act:${k}:url_path" value="${esc(a.url_path || "")}" placeholder="https://…">`;
      else if (cur === "more-info" || cur === "toggle") more = `<input data-k="act:${k}:entity" value="${esc(a.entity || "")}" placeholder="jiná entita (nepovinné)" list="ents">`;
      return `<label>${label}</label><select data-k="act:${k}:action">${Object.entries(ACTIONS).map(([v, t]) => `<option value="${v}" ${v === cur ? "selected" : ""}>${v ? t : def}</option>`).join("")}</select>${more}`;
    }).join("");
    const set = Object.keys(ACTION_KEYS).some((k) => o[k + "_action"]);
    return `<details ${set ? "open" : ""}><summary>Akce (klepnutí, dvojklik, podržení)</summary>${rows}</details>`;
  }

  // colour rules as a form: each rule has conditions (all must hold) and what it changes; YAML for the rest
  _rulesUI(o, fields) {
    const rules = o.rules || [];
    const own = this._ownEntity(o);
    const opOf = (c) => (c.template != null ? "template" : ["state_not", "above", "below"].find((k) => c[k] != null) || "state");
    const valOf = (c, op) => (op === "template" ? c.template : [].concat(c[op] ?? "").join(", "));
    const out = (i, r) => {
      const parts = [];
      if (fields.includes("color")) parts.push(`<span>${fields.includes("background") ? "Text" : "Barva"}</span>${this._colorPick(`ro:${i}:color`, r.color).replace(/^<div class="outc" style="margin-top:0">|<\/div>$/g, "")}`);
      if (fields.includes("background")) parts.push(`<span>Pozadí</span>${this._colorPick(`ro:${i}:background`, r.background, true).replace(/^<div class="outc" style="margin-top:0">|<\/div>$/g, "")}`);
      if (fields.includes("wave") && o.kind === "radiator") parts.push(`<span>Vlny</span>${this._colorPick(`ro:${i}:wave`, r.wave).replace(/^<div class="outc" style="margin-top:0">|<\/div>$/g, "")}`);
      if (fields.includes("glow")) parts.push(`<label class="chk"><input type="checkbox" data-k="ro:${i}:glow" ${r.glow ? "checked" : ""}> záře</label>`);
      if (fields.includes("animate")) parts.push(`<select data-k="ro:${i}:animate"><option value="">animace podle stavu</option><option value="true" ${r.animate === true ? "selected" : ""}>animovat</option><option value="false" ${r.animate === false ? "selected" : ""}>neanimovat</option></select>`);
      if (fields.includes("hide")) parts.push(`<label class="chk"><input type="checkbox" data-k="ro:${i}:hide" ${r.hide ? "checked" : ""}> skrýt</label>`);
      if (o.points) parts.push(`<span>Průhlednost</span><input type="number" step="0.05" min="0" max="1" data-k="ro:${i}:opacity" value="${r.opacity ?? ""}" placeholder="0,14" style="width:70px">`);
      if (fields.includes("icon")) parts.push(`<input type="text" data-k="ro:${i}:icon" value="${esc(r.icon || "")}" placeholder="ikona, např. mdi:timer-sand (none = bez ikony)">`);
      if (fields.includes("text")) parts.push(`<input type="text" data-k="ro:${i}:text" value="${esc(r.text || "")}" placeholder="text (může být šablona {{ … }})">`);
      return `<div class="outc">${parts.join("")}</div>`;
    };
    const list = rules.map((r, i) => {
      const conds = [].concat(r.if || []);
      const simple = conds.every((c) => !c.any);
      return `<div class="rule"><div class="rule-h"><span>Pravidlo ${i + 1}</span>
          <button data-a="ra:up:${i}" ${i ? "" : "disabled"}>↑</button><button data-a="ra:down:${i}" ${i < rules.length - 1 ? "" : "disabled"}>↓</button><button data-a="ra:del:${i}">✕</button></div>
        ${simple ? conds.map((c, j) => {
          const op = opOf(c);
          return `<div class="cond">${op === "template" ? "" : `<input data-k="rc:${i}:${j}:entity" value="${esc(c.entity || "")}" placeholder="entita" list="ents">
              ${own && c.entity !== own ? `<button class="mini wide" data-a="ra:self:${i}:${j}" title="${esc(own)}">↳ tato entita</button>` : ""}
              <input data-k="rc:${i}:${j}:attribute" value="${esc(c.attribute || "")}" placeholder="atribut (jinak stav)">`}
            <select data-k="rc:${i}:${j}:op">${Object.entries(OPS).map(([k, v]) => `<option value="${k}" ${k === op ? "selected" : ""}>${v}</option>`).join("")}</select>
            <input data-k="rc:${i}:${j}:value" value="${esc(valOf(c, op))}" placeholder="${op === "template" ? "{{ is_state('timer.x', 'active') }}" : op === "state" || op === "state_not" ? "on, open" : "20"}" ${op === "template" ? 'class="wide"' : ""}>
            <button data-a="ra:cdel:${i}:${j}" class="mini">✕ podmínka</button></div>`;
        }).join("") + `<button data-a="ra:cadd:${i}" class="mini" style="margin-top:6px">+ podmínka</button>${conds.length ? "" : ' <span class="hint">bez podmínky platí vždy</span>'}`
          : `<p class="hint">Pravidlo s podmínkou „nebo“ (any) uprav v YAML.</p>`}
        ${out(i, r)}</div>`;
    }).join("");
    return `<details ${rules.length ? "open" : ""}><summary>Pravidla: barvy, skrytí${fields.includes("icon") ? ", ikona" : ""}${rules.length ? ` (${rules.length})` : ""}</summary>
      <p class="hint">Pro každou vlastnost platí první pravidlo, jehož podmínky platí.</p>${list}
      <div class="actions"><button data-a="ra:add">+ pravidlo</button><button data-a="ra:yaml">${this._yaml ? "Skrýt YAML" : "Upravit v YAML"}</button></div>
      ${this._yaml ? `<textarea data-k="rules_yaml" spellcheck="false" placeholder="- if:\n    - entity: binary_sensor.x\n      state: \"on\"\n  color: red">Načítám…</textarea>` : ""}</details>`;
  }

  // rule, action and look fields shared by every kind of item; true when the key was one of them
  async _setShared(targets, key, value, inp) {
    const [kind, a, b, c] = key.split(":");
    const first = targets[0];
    const parseYaml = async (text) => {
      try { const r = await this._hass.callWS({ type: "fns_floorplan/yaml/parse", text }); inp?.classList.remove("bad"); return r.data; }
      catch (err) { inp?.classList.add("bad"); if (inp) inp.title = err.message || ""; throw err; }
    };
    const color = (v) => (v === "custom" ? (inp?.nextElementSibling?.value || "#ff0000") : v);
    if (key === "rules_yaml") {
      const data = value.trim() ? await parseYaml(value).catch(() => undefined) : [];
      if (data === undefined) return true;
      if (data !== null && !Array.isArray(data)) { inp?.classList.add("bad"); return true; }
      for (const t of targets) if (data?.length) t.rules = JSON.parse(JSON.stringify(data)); else delete t.rules;
      this._changed();
      return true;
    }
    if (kind === "act") {
      const k = a + "_action", field = b;
      for (const t of targets) {
        const act = { ...(t[k] || {}) };
        if (field === "action") { if (!value) { delete t[k]; continue; } for (const x of Object.keys(act)) delete act[x]; act.action = value; }
        else if (field === "data") {
          const data = value.trim() ? await parseYaml(value).catch(() => undefined) : null;
          if (data === undefined) return true;
          if (data) act.data = data; else delete act.data;
        } else if (value) act[field] = value; else delete act[field];
        t[k] = act;
      }
      this._changed();
      return true;
    }
    if (kind !== "rc" && kind !== "ro") return false;
    const rules = JSON.parse(JSON.stringify(first.rules || []));
    const r = rules[Number(a)];
    if (!r) return true;
    if (kind === "rc") {
      const conds = [].concat(r.if || []), j = Number(b), cond = conds[j] || {};
      const op = c === "op" ? value : cond.template != null ? "template" : ["state_not", "above", "below"].find((x) => cond[x] != null) || "state";
      const raw = c === "value" ? value : cond.template ?? [].concat(cond[["state_not", "above", "below"].find((x) => cond[x] != null) || "state"] ?? "").join(", ");
      const next = op === "template" ? {} : { entity: c === "entity" ? value : cond.entity || "" };
      const attr = c === "attribute" ? value : cond.attribute;
      if (op !== "template" && attr) next.attribute = attr;
      if (op === "template") next.template = raw;
      else if (op === "above" || op === "below") next[op] = Number(String(raw).replace(",", ".")) || 0;
      else { const list = String(raw).split(",").map((x) => x.trim()).filter(Boolean); next[op] = list.length > 1 ? list : list[0] ?? ""; }
      conds[j] = next;
      r.if = conds;
    } else {
      const v = b === "glow" || b === "hide" ? value === true : b === "animate" ? (value === "" ? undefined : value === "true")
        : b === "opacity" ? (value === "" ? undefined : Number(value)) : b === "color" || b === "background" || b === "wave" ? color(value) : value;
      if (v === undefined || v === "" || v === false) delete r[b]; else r[b] = v;
    }
    for (const t of targets) t.rules = JSON.parse(JSON.stringify(rules));
    this._changed();
    return true;
  }

  // the entity a condition most likely refers to: the item's own (a room: its temperature sensor)
  _ownEntity(o) {
    return o.entity || o.contact || o.temperature || "";
  }

  // rule list buttons: add, remove, move a rule, add or remove a condition, YAML view
  _ruleAction(targets, a) {
    const [, op, i, j] = a.split(":");
    if (op === "yaml") { this._yaml = !this._yaml; return this._form(); }
    const rules = JSON.parse(JSON.stringify(targets[0].rules || []));
    const n = Number(i), own = this._ownEntity(targets[0]);
    if (op === "self") { const c = [].concat(rules[n].if || []); c[Number(j)] = { ...c[Number(j)], entity: own }; rules[n].if = c; }
    else if (op === "add") rules.push({ if: [{ entity: own, state: "on" }] });
    else if (op === "del") rules.splice(n, 1);
    else if (op === "up" && n > 0) [rules[n - 1], rules[n]] = [rules[n], rules[n - 1]];
    else if (op === "down" && n < rules.length - 1) [rules[n + 1], rules[n]] = [rules[n], rules[n + 1]];
    else if (op === "cadd") rules[n].if = [...[].concat(rules[n].if || []), { entity: own, state: "on" }];
    else if (op === "cdel") { const c = [].concat(rules[n].if || []); c.splice(Number(j), 1); if (c.length) rules[n].if = c; else delete rules[n].if; }
    for (const t of targets) if (rules.length) t.rules = JSON.parse(JSON.stringify(rules)); else delete t.rules;
    this._changed();
  }

  _roomForm(side, r) {
    const v = this._sel.v;
    const walls = r.points.map((_, k) => { const e = edgeOf(r, k); return `<option value="${k}">Stěna ${k + 1} – ${SIDE(e.u)}, ${e.L.toFixed(2).replace(".", ",")} m</option>`; }).join("");
    const info = r.label_info ?? ["temperature", "humidity"];
    const extra = info.filter((k) => k !== "temperature" && k !== "humidity");
    side.innerHTML = `<h2>Místnost</h2>
      <label>Název</label><input data-k="name" value="${esc(r.name)}">
      <label>Teplota (entita)</label><input data-k="temperature" value="${esc(r.temperature || "")}" list="ents">
      <label>Vlhkost (entita)</label><input data-k="humidity" value="${esc(r.humidity || "")}" list="ents">
      <details open><summary>Badge místnosti</summary>
        <label class="chk"><input type="checkbox" data-k="label_show" ${r.label_hidden ? "" : "checked"}> zobrazit badge</label>
        <fieldset class="badge-opts" ${r.label_hidden ? "disabled" : ""}>
        <label class="chk"><input type="checkbox" data-k="label_name" ${r.label_name === false ? "" : "checked"}> název místnosti</label>
        <label class="chk"><input type="checkbox" data-k="label_t" ${info.includes("temperature") ? "checked" : ""}> teplota</label>
        <label class="chk"><input type="checkbox" data-k="label_h" ${info.includes("humidity") ? "checked" : ""}> vlhkost</label>
        <label>Další údaje pod názvem (entita nebo šablona, každá na řádek)</label>
        <textarea data-k="label_extra" spellcheck="false" style="min-height:60px" placeholder="sensor.co2_obyvak">${esc(extra.join("\n"))}</textarea>
        </fieldset>
      </details>
      ${v != null ? `<div class="row2"><div><label>Roh ${v + 1}: X (m)</label><input data-k="vx" type="number" step="0.05" value="${r.points[v][0]}"></div><div><label>Z (m)</label><input data-k="vz" type="number" step="0.05" value="${r.points[v][1]}"></div></div>
        <div class="actions"><button data-a="delv" ${r.points.length <= 3 ? "disabled" : ""}>Smazat roh ${v + 1}</button></div>` : `<p class="hint">Rohů: ${r.points.length}. Klepnutím na roh ho vybereš.</p>`}
      <label>Další entity v panelu místnosti (každá na řádek; světla a spínače s přepínačem)</label>
      <textarea data-k="sheet_extra" spellcheck="false" style="min-height:60px" placeholder="switch.zasuvka_pracovna">${esc((r.sheet_extra || []).join("\n"))}</textarea>
      <label>Přidat na stěnu</label><select data-k="wall">${walls}</select>
      <div class="actions"><button data-a="adddoor">+ Dveře</button><button data-a="addwin">+ Okno</button></div>
      ${this._rulesUI(r, ["color", "glow", "hide"]).replace("Pravidla: barvy, skrytí", "Pravidla: podbarvení, skrytí badge")}
      <div class="actions"><button data-a="delroom" class="del">Smazat místnost</button></div>`;
    this._bind(side, async (k, val, inp) => {
      if (await this._setShared([r], k, val, inp)) return;
      if (k === "wall") return (this._wall = Number(val));
      if (k === "vx" || k === "vz") r.points[v][k === "vx" ? 0 : 1] = r3(Math.max(0, Number(val)));
      else if (k === "sheet_extra") { const list = val.split("\n").map((x) => x.trim()).filter(Boolean); if (list.length) r.sheet_extra = list; else delete r.sheet_extra; }
      else if (k === "label_show") { if (val) delete r.label_hidden; else r.label_hidden = true; }
      else if (k === "label_name") { if (val) delete r.label_name; else r.label_name = false; }
      else if (k === "label_t" || k === "label_h" || k === "label_extra") {
        const q = (x) => side.querySelector(`[data-k="${x}"]`);
        const list = [...(q("label_t").checked ? ["temperature"] : []), ...(q("label_h").checked ? ["humidity"] : []),
          ...q("label_extra").value.split("\n").map((x) => x.trim()).filter(Boolean)];
        if (list.join() === "temperature,humidity") delete r.label_info; else r.label_info = list;
      } else r[k] = k === "name" ? val : val || null;
      this._changed();
    }, (a) => {
      if (a.startsWith("ra:")) return this._ruleAction([r], a);
      if (a === "delv") { this._removeCorner(r, v); this._sel = { cat: "rooms", i: this._sel.i }; }
      else if (a === "delroom") {
        if (!confirm(`Smazat místnost ${r.name} i s jejími okny a dveřmi?`)) return;
        this._plan.openings = this._plan.openings.filter((o) => o.room_id !== r.id);
        delete this._plan.labels[r.id];
        this._plan.rooms.splice(this._sel.i, 1);
        this._sel = null;
      } else {
        const k = clamp(this._wall ?? 0, 0, r.points.length - 1), e = edgeOf(r, k), win = a === "addwin";
        const width = Math.min(win ? 1.2 : 0.8, e.L);
        this._plan.openings.push({ id: uid(win ? "w" : "d"), room_id: r.id, edge: k, offset: r3(snap(e.L / 2)), width,
          type: win ? "window" : "door", style: win ? null : "interior", hinge: "left", swing: "in", contact: null });
        this._sel = { cat: "openings", i: this._plan.openings.length - 1 };
      }
      this._changed();
    });
    const wall = side.querySelector('[data-k="wall"]');
    wall.value = String(clamp(this._wall ?? 0, 0, r.points.length - 1));
    this._afterForm(side);
  }

  _openingForm(side, o) {
    const r = this._plan.rooms.find((x) => x.id === o.room_id), L = r ? edgeOf(r, o.edge).L : 0;
    const win = o.type === "window";
    const opt = (k, val, cur) => `<option value="${k}" ${k === cur ? "selected" : ""}>${val}</option>`;
    side.innerHTML = `<h2>${win ? "Okno" : "Dveře"}</h2><p class="hint">${esc(r?.name || "")}, stěna ${o.edge + 1} (${L.toFixed(2).replace(".", ",")} m). Táhnutím ho posuneš po stěně, ⇄ přehodí panty, ⇅ směr otevírání.</p>
      <label>Druh</label><select data-k="type">${opt("door", "Dveře", o.type)}${opt("window", "Okno", o.type)}</select>
      ${win ? "" : `<label>Provedení</label><select data-k="style">${Object.entries(DOOR_STYLES).map(([k, val]) => opt(k, val, o.style || "interior")).join("")}</select>`}
      <div class="row2"><div><label>Šířka (m)</label><input data-k="width" type="number" step="0.05" value="${o.width}"></div><div><label>Od začátku stěny (m)</label><input data-k="offset" type="number" step="0.05" value="${o.offset}"></div></div>
      ${o.style === "passage" ? "" : `<div class="row2"><div><label>Panty (z místnosti)</label><select data-k="hinge">${opt("left", "Vlevo", o.hinge || "left")}${opt("right", "Vpravo", o.hinge)}</select></div>
        <div><label>Otevírá se</label><select data-k="swing">${opt("in", "Dovnitř", o.swing || "in")}${opt("out", "Ven", o.swing)}</select></div></div>
      <label>Kontakt (binary_sensor; ${win || o.style === "glass" ? "bez něj zůstane zavřené" : "dveře bez něj jsou pootevřené na 45°"})</label><input data-k="contact" value="${esc(o.contact || "")}" list="ents">
      <label>Roleta (cover, nepovinné)</label><input data-k="blind" value="${esc(o.blind || "")}" list="ents">
      ${o.blind ? `<div class="row2"><div><label>Roleta je</label><select data-k="blind_side">${opt("in", "Uvnitř", o.blind_side || "in")}${opt("out", "Venku", o.blind_side)}</select></div>
        <div><label class="chk" style="margin-top:30px"><input type="checkbox" data-k="blind_invert" ${o.blind_invert ? "checked" : ""}> pozice obráceně</label></div></div>` : ""}
      ${win ? "" : `<label>Zámek (lock, nepovinné; klepnutí na odznak otevře jeho detail)</label><input data-k="lock" value="${esc(o.lock || "")}" list="ents">`}
      <label class="chk"><input type="checkbox" data-k="sheet_hide" ${o.sheet_hide ? "checked" : ""}> nezobrazovat v panelu místnosti</label>
      ${this._actionsUI(o, { tap: o.blind ? "Detail rolety" : o.contact ? "Detail kontaktu" : "" })}`}
      <div class="actions"><button data-a="del" class="del">Smazat</button></div>`;
    this._bind(side, async (k, val, inp) => {
      if (await this._setShared([o], k, val, inp)) return;
      if (k === "sheet_hide") { if (val) o.sheet_hide = true; else delete o.sheet_hide; }
      else if (k === "blind_invert") { if (val) o.blind_invert = true; else delete o.blind_invert; }
      else if (k === "blind_side") { if (val === "out") o.blind_side = "out"; else delete o.blind_side; }
      else if (k === "width" || k === "offset") o[k] = r3(Math.max(0.1, Number(val)));
      else if (k === "type") { o.type = val; o.style = val === "window" ? null : o.style || "interior"; }
      else o[k] = val || null;
      if (L) { o.width = Math.min(o.width, L); o.offset = r3(clamp(o.offset, o.width / 2, L - o.width / 2)); }
      this._changed();
    }, (a) => {
      if (a === "del") { this._plan.openings.splice(this._sel.i, 1); this._sel = null; }
      this._changed();
    });
  }

  async _set(key, value, inp) {
    const sel = this._sel, o = this._get();
    if (sel.cat === "labels") {
      if (key === "rotation") {
        const v = ((Number(value) % 360) + 360) % 360;
        if (v) o.room.label_rotation = v; else delete o.room.label_rotation;
        return this._changed();
      }
      const cur = this._plan.labels[sel.id] || [o.x, o.z];
      this._plan.labels[sel.id] = key === "x" ? [r3(Number(value)), cur[1]] : [cur[0], r3(Number(value))];
      return this._changed();
    }
    const targets = this._targets();
    if (await this._setShared(targets, key, value, inp)) return;
    if (sel.g && (key === "x" || key === "z")) {
      this._move(sel, key === "x" ? Number(value) : o.x, key === "z" ? Number(value) : o.z);
      return this._changed();
    }
    if (key === "active") {
      // parsed before touching the item, so a typo does not wipe the old value
      let v;
      if (value.trim().startsWith("{")) { try { v = JSON.parse(value); inp.classList.remove("bad"); } catch { inp.classList.add("bad"); return; } }
      else { const list = value.split(",").map((s) => s.trim()).filter(Boolean); v = list.length ? list : undefined; }
      for (const t of targets) if (v) t.active = v; else delete t.active;
      return this._changed();
    }
    for (const t of targets) {
      if (["x", "z", "w", "d"].includes(key)) t[key] = r3(Number(value));
      else if (key === "rotation") t.rotation = ((Number(value) % 360) + 360) % 360;
      else if (key === "cover") { if (value) delete t.cover; else t.cover = false; }
      else if (key === "sheet_hide") { if (value) t.sheet_hide = true; else delete t.sheet_hide; }
      else if (key === "room_light") { if (value === "") delete t.room_light; else t.room_light = value === "false" ? false : Number(value); }
      else if (key === "color" || key === "color_on" || key === "background") {
        const v = value === "custom" ? inp.nextElementSibling.value : value;
        if (v) t[key] = v; else delete t[key];
      } else if (value === "") delete t[key];
      else t[key] = value;
    }
    this._changed();
  }

  _action(a) {
    const sel = this._sel, o = this._get(), targets = this._targets();
    if (a.startsWith("ra:")) return this._ruleAction(targets, a);
    if (a.startsWith("place:")) this._place(a.slice(6));
    else if (a === "auto") delete this._plan.labels[sel.id];
    else if (a === "icon-reset") for (const t of targets) delete t.icon;
    else if (a === "icon-none") for (const t of targets) t.icon = "none";
    else if (a.startsWith("rot") && sel.cat === "labels") {
      const v = (((o.room.label_rotation || 0) + Number(a.slice(3))) % 360 + 360) % 360;
      if (v) o.room.label_rotation = v; else delete o.room.label_rotation;
    } else if (a.startsWith("rot")) o.rotation = (((o.rotation || 0) + Number(a.slice(3))) % 360 + 360) % 360;
    else if (a.startsWith("layer:")) {
      // z-order among items of the same kind
      const all = this._plan[sel.cat].filter((x) => sel.cat !== "furniture" || isLight(x) === isLight(o)).map((x) => x.layer || 0);
      const cur = o.layer || 0, op = a.slice(6);
      const next = op === "up" ? cur + 1 : op === "down" ? cur - 1 : op === "top" ? Math.max(...all) + 1 : Math.min(...all) - 1;
      for (const t of targets) if (next) t.layer = next; else delete t.layer;
    } else if (a === "dup") {
      const base = this._plan[sel.cat].length;
      for (const t of targets) {
        const copy = { ...JSON.parse(JSON.stringify(t)), x: r3(t.x + 0.3), z: r3(t.z + 0.3) };
        if (sel.cat === "furniture") copy.id = `f_${Date.now().toString(36)}${this._plan.furniture.length}`;
        this._plan[sel.cat].push(copy);
      }
      this._sel = sel.g ? { cat: sel.cat, i: base, g: targets.map((_, k) => base + k) } : { cat: sel.cat, i: base };
    } else if (a === "del") {
      const idx = sel.g ? [...sel.g] : [sel.i];
      for (const i of idx.sort((x, y) => y - x)) this._plan[sel.cat].splice(i, 1);
      this._sel = null;
    }
    this._changed();
  }

  // Ctrl+C / Ctrl+V: an in-editor clipboard for items and rooms (not doors, windows or labels)
  _copy() {
    const sel = this._sel;
    if (!sel || sel.cat === "openings") return false;
    const items = sel.cat === "rooms" ? [["rooms", this._plan.rooms[sel.i]]] : this._picked().map(([cat, o]) => [cat, o]);
    if (!items.length) return false;
    this._clip = { items: JSON.parse(JSON.stringify(items)), level: this._level, n: 0 };
    return true;
  }

  _paste() {
    const c = this._clip, rooms = c.items[0][0] === "rooms";
    // on the same floor every paste moves a bit further, on another floor it lands in the same spot
    const d = String(c.level) === String(this._level) ? r3(++c.n * (rooms ? 0.5 : 0.3)) : 0;
    const groups = {}, sels = [];
    c.items.forEach(([cat, t], k) => {
      const copy = JSON.parse(JSON.stringify(t));
      delete copy.level;
      this._stamp(copy);
      if (cat === "rooms") {
        copy.id = uid("room");
        copy.points = copy.points.map(([x, z]) => [r3(x + d), r3(z + d)]);
      } else Object.assign(copy, { x: r3(copy.x + d), z: r3(copy.z + d) });
      if (cat === "furniture") copy.id = `f_${Date.now().toString(36)}${this._plan.furniture.length}${k}`;
      if (copy.group) copy.group = groups[copy.group] ||= uid("grp");
      sels.push({ cat, i: this._plan[cat].push(copy) - 1 });
    });
    this._mode = rooms ? "rooms" : "items";
    this._sel = sels.at(-1);
    this._multi = sels.length > 1 ? sels : null;
    this._changed();
  }

  _key(e) {
    if (!this.isConnected || !this._plan) return;
    const typing = e.composedPath().some((n) => n.tagName === "INPUT" || n.tagName === "TEXTAREA" || n.tagName === "SELECT");
    if ((e.ctrlKey || e.metaKey) && !typing && /^[zy]$/i.test(e.key)) {
      e.preventDefault();
      const redo = e.key.toLowerCase() === "y" || e.shiftKey;
      return redo ? this._history(this._redo, this._undo) : this._history(this._undo, this._redo);
    }
    if ((e.ctrlKey || e.metaKey) && !typing && /^[cv]$/i.test(e.key)) {
      if (e.key.toLowerCase() === "c") return this._copy() && e.preventDefault();
      if (this._clip) { e.preventDefault(); this._paste(); }
      return;
    }
    if (e.key === "Escape" && !typing && this._sel) { this._sel = null; this._draw(); return this._form(); }
    if (!this._sel) return;
    if (typing) return;
    const step = { ArrowLeft: [-SNAP, 0], ArrowRight: [SNAP, 0], ArrowUp: [0, -SNAP], ArrowDown: [0, SNAP] }[e.key];
    if (this._sel.cat === "rooms" || this._sel.cat === "openings") {
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        if (this._sel.cat === "openings") { this._plan.openings.splice(this._sel.i, 1); this._sel = null; }
        else if (this._sel.v != null && this._plan.rooms[this._sel.i].points.length > 3) {
          this._removeCorner(this._plan.rooms[this._sel.i], this._sel.v);
          this._sel = { cat: "rooms", i: this._sel.i };
        } else return;
        return this._changed();
      }
      if (!step) return;
      e.preventDefault();
      if (this._sel.cat === "rooms") {
        const r = this._plan.rooms[this._sel.i];
        const pts = this._sel.v != null ? [r.points[this._sel.v]] : r.points;
        for (const p of pts) { p[0] = r3(Math.max(0, p[0] + step[0])); p[1] = r3(Math.max(0, p[1] + step[1])); }
      } else {
        const o = this._plan.openings[this._sel.i], r = this._plan.rooms.find((x) => x.id === o.room_id), ed = edgeOf(r, o.edge);
        o.offset = r3(clamp(o.offset + step[0] * ed.u[0] + step[1] * ed.u[1], o.width / 2, ed.L - o.width / 2));
      }
      return this._changed();
    }
    if (step) {
      e.preventDefault();
      for (const s of this._multi || [this._sel]) {
        const o = this._get(s);
        if (this._multi && !s.g && s.cat !== "labels") Object.assign(this._plan[s.cat][s.i], { x: r3(o.x + step[0]), z: r3(o.z + step[1]) });
        else this._move(s, o.x + step[0], o.z + step[1]);
      }
      this._changed();
    } else if ((e.key === "Delete" || e.key === "Backspace") && this._multi) {
      e.preventDefault();
      this._deletePicked();
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
