// FNS Floorplan editor: the sidebar panel "Floor plan". Lights, appliances, sensors, furniture and
// room labels can be dragged, assigned an entity, turned, resized, added and removed.
// In the "Rooms" mode rooms (corner points, whole rooms), windows and doors are edited.

// icons, furniture types and the rules engine come from the card module (same URL, so loaded once)
const { t, setLang, getLang, furnName, furnShape, vacRoom, MDI, COLORS, UI_COLORS, color, FURNITURE, lightIcon, SIZES, evalRules, resolveIcon, iconHtml, FX_SVG, DOMAIN_DEV, STYLE: CARD_STYLE } =
  await import(new URL("./fns-floorplan-card.js", import.meta.url).href + new URL(import.meta.url).search);

// key → label tables; the labels are looked up when read, so they follow a language change
const tbl = (prefix, keys) => {
  const o = {};
  for (const k of keys) Object.defineProperty(o, k, { get: () => t(`${prefix}.${k || "default"}`), enumerable: true });
  return o;
};
// what a generic item does by default is shown from t("domain_hint.<domain>") (the behaviour itself is DOMAIN_DEV in the card)

const S = 80; // px per metre, same as the card
const PAD = 40;
const SNAP = 0.05; // metres
const NS = "http://www.w3.org/2000/svg";

// pickers list types by name (in the UI language), the catch-all one last
const byName = (keys, label, last) => keys.filter((k) => k !== last).sort((a, b) => label(a).localeCompare(label(b), getLang())).concat(keys.includes(last) ? [last] : []);
const furnTypes = () => byName(Object.keys(FURNITURE), furnName, "other");
const LIGHT_TYPES = tbl("panel.light_type", ["lamp_spot", "lamp_ceiling", "lamp_pendant", "lamp_panel", "lamp_table", "lamp_wall", "led_strip"]);
const DEVICE_KINDS = tbl("panel.device_kind", ["fan", "purifier", "dishwasher", "dryer", "boiler", "radiator", "alarm", "media", "aquarium", "camera", "fridge", "fireplace", "lock", "generic"]);
const DEVICE_FX = tbl("panel.device_fx", ["ring", "radar", "comet", "countdown", "spin", "orbit", "breath", "blink", "heartbeat", "shake", "none"]);
const DEVICE_ICON = {
  fan: "mdiFan", purifier: "mdiAirPurifier", dishwasher: "mdiDishwasher", dryer: "mdiTumbleDryer", boiler: "mdiWaterBoiler",
  radiator: "mdiRadiator", alarm: "mdiShieldOutline", media: "mdiCastVariant", generic: "mdiShapeOutline",
  aquarium: "mdiFishbowlOutline", camera: "mdiCctv", fridge: "mdiFridgeOutline", fireplace: "mdiFireplace", lock: "mdiLock",
};
const SIZE_NAMES = tbl("panel.size", ["xs", "s", "", "l", "xl", "xxl"]);
const COLOR_NAMES = tbl("panel.color", ["red", "orange", "yellow", "green", "blue", "purple", "pink", "white", "black"]);
const ACTIONS = tbl("panel.action_opt", ["", "toggle", "more-info", "perform-action", "navigate", "url", "none"]);
const ACTION_KEYS = tbl("panel.action_key", ["tap", "double_tap", "hold"]);
// conditions of the entity form as one Jinja expression (all must hold; "any" = or)
const toJinja = (conds) => {
  const q = (v) => `'${String(v).replace(/'/g, "\\'")}'`;
  const one = (c) => {
    if (c.any) return "(" + c.any.map(one).join(" or ") + ")";
    if (c.template != null) return "(" + String(c.template).replace(/^\s*\{\{|\}\}\s*$/g, "").trim() + ")";
    const v = c.attribute ? `state_attr(${q(c.entity)}, ${q(c.attribute)})` : `states(${q(c.entity)})`;
    if (c.above != null) return `${v} | float(0) > ${c.above}`;
    if (c.below != null) return `${v} | float(0) < ${c.below}`;
    const list = [].concat(c.state ?? c.state_not ?? ""), e = list.length > 1 ? `${v} in [${list.map(q).join(", ")}]` : `${v} == ${q(list[0])}`;
    return c.state_not != null ? `not (${e})` : e;
  };
  return conds.length ? `{{ ${conds.map(one).join(" and ")} }}` : "";
};
const OPS = tbl("panel.op", ["state", "state_not", "above", "below", "template"]);
// a point item (lamp, robot dock) has no size or rotation of its own
const isPoint = (f) => (isLight(f) && f.type !== "led_strip") || f.type === "robot_vacuum";
// what "+" can add: [label key, factory]
// the add menu stays short: the light type and the device kind are picked in the item's form
const ADD = [
  ["panel.add.light", () => ({ cat: "furniture", item: { type: "lamp_ceiling", w: 0.3, d: 0.3, rotation: 0, entity: "" } })],
  ["panel.add.device", () => ({ cat: "devices", item: { kind: "generic", name: "", entity: "" } })],
  ["panel.add.sensor", () => ({ cat: "sensors", item: { entity: "" } })],
  ["panel.add.furniture", () => ({ cat: "furniture", item: { type: "table", w: 1, d: 0.6, rotation: 0 } })],
  ["panel.add.text", () => ({ cat: "texts", item: { entity: "" } })],
];

const ADD_ICONS = ["mdi:lightbulb", "mdi:devices", "mdi:motion-sensor", "mdi:sofa", "mdi:format-text"];

const el = (tag, attrs = {}, parent) => {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  if (parent) parent.appendChild(e);
  return e;
};
const P = ([x, z]) => [x * S + PAD, z * S + PAD];
const snap = (v) => Math.round(v / SNAP) * SNAP;
// the smallest shift (within 15 cm) that puts one of `vals` on one of `targets`: {d, t} or null
const nearest = (vals, targets, tol = 0.15) => {
  let best = null;
  for (const v of vals) for (const t of targets) if (Math.abs(t - v) < tol && (!best || Math.abs(t - v) < Math.abs(best.d))) best = { d: t - v, t };
  return best;
};
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

const DOOR_STYLES = tbl("panel.door_style", ["interior", "front", "glass", "passage"]);
// edge k of room r: start point, unit vector and length
const edgeOf = (r, k) => {
  const a = r.points[k], c = r.points[(k + 1) % r.points.length];
  const L = Math.hypot(c[0] - a[0], c[1] - a[1]) || 1e-9;
  return { a, c, L, u: [(c[0] - a[0]) / L, (c[1] - a[1]) / L] };
};
// one entry per line, with or without a leading "- "; a template over several lines ({% if %} … {% endif %}) stays one entry
const entries = (text) => {
  const out = [];
  let open = 0, buf = [];
  for (const line of text.split("\n")) {
    if (!line.trim() && !open) continue;
    buf.push(line);
    open += (line.match(/{%-?\s*(if|for|macro|raw)\b/g) || []).length - (line.match(/{%-?\s*end(if|for|macro|raw)\b/g) || []).length;
    if (open > 0) continue;
    open = 0;
    out.push(buf.join("\n").trim());
    buf = [];
  }
  if (buf.length) out.push(buf.join("\n").trim());
  // "- light.a" (a YAML list line) is the same as "light.a"; a template keeps its text
  return out.map((e) => (e.includes("{") ? e : e.replace(/^-\s*/, ""))).filter(Boolean);
};
const SIDE = (u) => (Math.abs(u[0]) > Math.abs(u[1]) ? (u[0] > 0 ? t("panel.side.top") : t("panel.side.bottom")) : u[1] > 0 ? t("panel.side.right") : t("panel.side.left"));
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
// the native select treats "" as "nothing chosen" and shows an empty field, so the default option gets this value in the UI
const DEF = "__default";
// card CSS for the animation preview tiles: only the .dev rules and keyframes, scoped under .fxapp so they cannot hit the panel's own .dev circles
const scopeFx = (css) => css.split("\n").filter((l) => /^@keyframes|^[^{]*\.dev[^{]*\{/.test(l)).map((l) => {
  if (l.startsWith("@keyframes")) return l;
  const i = l.indexOf("{");
  return l.slice(0, i).split(",").map((s) => (s = s.trim(), s.startsWith(".app") ? ".fxapp" + s : ".fxapp " + s)).join(", ") + " " + l.slice(i);
}).join("\n");

const STYLE = `
.fxapp { background: none; display: block; color: var(--primary-text-color); --accent: var(--primary-color); --chip: var(--card-background-color); --line: var(--divider-color); --muted: var(--secondary-text-color); --text: var(--primary-text-color); }
.fxapp .dev { fill: none; stroke: none; }
.fxpick { display: grid; grid-template-columns: repeat(auto-fill, minmax(64px, 1fr)); gap: 6px; margin-top: 4px; }
.fxt { display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 4px 2px; border: 1px solid var(--divider-color); border-radius: 12px; background: none; color: inherit; cursor: pointer; font-size: 11px; }
.fxt.on { border-color: var(--primary-color); background: color-mix(in srgb, var(--primary-color) 12%, transparent); }
:host { display: block; height: 100%; background: var(--primary-background-color, #fafafa); color: var(--primary-text-color, #212121);
  font-family: var(--ha-font-family-body, Roboto, sans-serif); }
.top { display: flex; align-items: center; gap: 8px; height: 56px; padding: 0 12px; box-sizing: border-box;
  background: var(--app-header-background-color); color: var(--app-header-text-color, var(--primary-text-color));
  border-bottom: var(--app-header-border-bottom, none); }
.top h1 { font-size: var(--ha-font-size-xl, 20px); font-weight: var(--ha-font-weight-normal, 400); margin: 0 8px 0 0; flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.top .state { font-size: 13px; opacity: .85; }
button, select, input, textarea { font: inherit; }
/* fallback while HA's own elements are not defined yet (or never are) */
ha-button:not(:defined) { border: 1px solid var(--divider-color, #e0e0e0); border-radius: 18px; padding: 7px 14px; cursor: pointer; background: var(--card-background-color, #fff); color: var(--primary-text-color, #212121); }
ha-button.save:not(:defined) { background: var(--primary-color, #03a9f4); border-color: transparent; color: var(--text-primary-color, #fff); font-weight: 600; }
ha-icon-button:not(:defined) { display: inline-block; padding: 4px; cursor: pointer; }
ha-button[disabled], ha-icon-button[disabled] { opacity: .45; }
.top select.level { max-width: 150px; }
.top ha-selector.level { width: 170px; flex: none; margin: 0; }
ha-dropdown-item[hidden] { display: none; }
.more { position: relative; }
.more ha-icon-button { position: relative; }
.more.warn ha-icon-button::after { content: ""; position: absolute; top: 8px; right: 8px; width: 8px; height: 8px; border-radius: 50%; background: var(--warning-color, #ffa600); }
.top select { height: 36px; border-radius: 8px; padding: 6px 10px; border: 1px solid var(--divider-color, #e0e0e0); background: var(--card-background-color, #fff); color: var(--primary-text-color, #212121); }
.main { display: flex; height: calc(100vh - 56px); }
.stage { flex: 1; min-width: 0; padding: 12px; box-sizing: border-box; position: relative; }
.look-card { display: none; }
.main.look .look-card { display: block; position: absolute; inset: 0; overflow: auto; padding: 12px; box-sizing: border-box;
  pointer-events: none; } /* a preview: a tap must not switch a real light; on a phone it reopens the form */
.main.look .stage > svg, .main.look .zoom { display: none; }
.look-row { display: flex; align-items: center; gap: 8px; margin: 4px 0; font-size: 14px; }
.look-row span { flex: 1; }
.side .look-row input[type="color"] { width: 44px; height: 32px; padding: 2px; flex: none; cursor: pointer; }
.side .look-row input.def { opacity: .5; }
.rot button { flex: 1; padding: 7px; border-radius: 8px; border: 1px solid var(--divider-color, #e0e0e0); background: var(--primary-background-color, #fafafa); color: var(--primary-text-color, #212121); cursor: pointer; }
.rot button.on { border-color: var(--primary-color); color: var(--primary-color); }
.zoom { position: absolute; left: 20px; top: 20px; z-index: 1; display: flex; flex-direction: column; overflow: hidden;
  background: var(--ha-card-background, var(--card-background-color)); border-radius: var(--ha-card-border-radius, 12px);
  box-shadow: var(--ha-card-box-shadow, 0 2px 6px rgba(0,0,0,.18));
  border: var(--ha-card-border-width, 1px) solid var(--ha-card-border-color, var(--divider-color)); }
.zoom [data-z] { color: var(--primary-text-color); }
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
.rule { border: 1px solid var(--divider-color, #e0e0e0); border-radius: var(--ha-card-border-radius, 12px); padding: 8px 12px; margin-top: 8px; }
.rule-h { display: flex; align-items: center; gap: 4px; font-weight: 600; font-size: 13px; }
.rule-h span { flex: 1; }
.cmode { display: inline-flex; margin: 8px 0 6px; border: 1px solid var(--divider-color, #e0e0e0); border-radius: 16px; overflow: hidden; }
.cmode button { border: 0; background: none; padding: 5px 14px; font: inherit; font-size: 13px; color: var(--secondary-text-color, #727272); cursor: pointer; }
.cmode button + button { border-left: 1px solid var(--divider-color, #e0e0e0); }
.cmode button.on { background: var(--primary-color, #03a9f4); color: var(--text-primary-color, #fff); }
.mini { border: 1px solid var(--divider-color, #e0e0e0); background: var(--primary-background-color, #fafafa); color: var(--primary-text-color, #212121);
  border-radius: 6px; padding: 3px 8px; cursor: pointer; }
.cond { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 6px; padding-top: 6px; border-top: 1px dashed var(--divider-color, #e0e0e0); }
.cond .wide { flex: 1 1 100%; }
.cond-foot { display: flex; align-items: center; gap: 8px; flex: 1 1 100%; margin-top: 2px; }
.cond-foot .sp { flex: 1; }
.cond-foot .hint { margin: 0; }
.side ha-icon-button.mini { border: 0; background: none; padding: 0; }
.side .cond input, .side .cond select, .side .outc input, .side .outc select { padding: 5px; font-size: 13px; }
.outc { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; margin-top: 8px; font-size: 13px; }
.outc select { width: auto; flex: 1; }
.outc ha-icon-picker { flex: 1 1 100%; }
.outc input[type=color] { width: 36px; height: 30px; padding: 1px; }
.outc input[type=text] { flex: 1 1 100%; }
.side label.chk { display: flex; align-items: center; gap: 6px; margin: 6px 0; color: var(--primary-text-color, #212121); font-size: 14px; }
.side label.chk input { width: auto; }
.badge-opts { border: 0; padding: 0 0 0 22px; margin: 0; }
.badge-opts:disabled { opacity: .45; }
.icon-row { display: flex; align-items: flex-start; gap: 8px; margin-top: 12px; }
/* the picker field is 56 px tall (its helper hangs below it): centre the button on the field, not on field + helper */
.icon-row > ha-button, .icon-row > button { margin-top: 8px; height: 40px; }
.icon-row > ha-icon-button { flex: none; margin-top: 4px; color: var(--secondary-text-color, #727272); }
.icon-row ha-icon { flex: none; color: var(--primary-color, #03a9f4); }
.icon-row input, .icon-row ha-icon-picker { flex: 1; }
.place { display: grid; grid-template-columns: repeat(3, 40px); gap: 0; margin-top: 4px; }
.layers { display: flex; gap: 4px; margin-top: 6px; }
.side ha-selector { display: block; margin-top: 12px; }
.vrow.cur ha-selector { outline: 2px solid var(--primary-color); border-radius: 4px; }
.outc ha-selector, .cond ha-selector { flex: 1 1 100%; margin-top: 4px; }
.side .bad { --mdc-theme-error: var(--error-color); outline: 1px solid var(--error-color); border-radius: 4px; }
.side ha-expansion-panel { margin-top: 12px; display: block; }
.sec { padding: 0 4px 12px; }
details { margin-top: 14px; }
details summary { cursor: pointer; font-weight: 600; font-size: 14px; }
div.modes { display: flex; border: 1px solid var(--divider-color, #e0e0e0); border-radius: 18px; overflow: hidden; }
div.modes button { border: 0; padding: 7px 12px; background: var(--card-background-color, #fff); color: var(--primary-text-color, #212121); cursor: pointer; }
ha-tab-group.modes { align-self: flex-end; }
div.modes button.on { background: var(--primary-color, #03a9f4); color: var(--text-primary-color, #fff); }
.spot-cone { fill: var(--primary-color, #03a9f4); fill-opacity: .1; stroke: var(--primary-color, #03a9f4); stroke-opacity: .35; stroke-dasharray: 3 3; pointer-events: none; }
.mode-rooms .item { pointer-events: none; opacity: .3; }
.mode-rooms .floor { cursor: move; }
.mode-rooms .floor.sel { fill: var(--primary-color, #03a9f4); fill-opacity: .08; stroke: var(--primary-color, #03a9f4); stroke-opacity: 1; }
.mode-items .open-hit, .mode-items .vtx, .mode-items .mid { display: none; }
.open-hit { stroke: transparent; stroke-width: 16; cursor: ew-resize; }
.open-sel { stroke: var(--primary-color, #03a9f4); stroke-width: 6; stroke-linecap: round; pointer-events: none; }
.vtx { fill: #fff; stroke: var(--primary-color, #03a9f4); stroke-width: 2.5; cursor: grab; }
.vtx.sel { fill: var(--primary-color, #03a9f4); }
.mid { fill: var(--primary-color, #03a9f4); fill-opacity: .35; cursor: copy; }
.edge-hit { stroke: transparent; stroke-width: 14; }
.mode-items .edge-hit { display: none; }
.sheet-x { display: none; }
.grip { width: 6px; flex: none; cursor: col-resize; background: transparent; border-left: 1px solid var(--divider-color, #e0e0e0); touch-action: none; }
.grip:hover, .grip.on { background: var(--primary-color); opacity: .4; }
.side { width: 320px; flex: none; overflow: auto; padding: 16px; box-sizing: border-box;
  background: var(--card-background-color, #fff); }
.side h2 { font-size: 17px; margin: 0 0 4px; }
.side .hint { color: var(--secondary-text-color, #727272); font-size: 13px; line-height: 1.45; }
.side label { display: block; font-size: 12px; color: var(--secondary-text-color, #727272); margin: 12px 0 4px; }
.side input, .side select, .side textarea { width: 100%; box-sizing: border-box; padding: 8px; border-radius: 8px;
  border: 1px solid var(--divider-color, #e0e0e0); background: var(--primary-background-color, #fafafa); color: var(--primary-text-color, #212121); }
.side textarea { min-height: 120px; font-family: monospace; font-size: 12px; }
.side textarea.bad { border-color: var(--error-color, #db4437); }
.side ha-code-editor { display: block; margin-top: 8px; border-radius: 8px; overflow: hidden; border: 1px solid var(--divider-color, #e0e0e0); }
.side ha-code-editor.bad { border-color: var(--error-color, #db4437); }
.ai-ask { margin-top: 16px; }
.ai-ask .actions { margin-top: 8px; }
.side .hint.err { color: var(--error-color, #db4437); }
.row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.row2 label { margin-top: 12px; }
.rot { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 6px; }
.actions button { flex: 1; padding: 7px; border-radius: 8px; border: 1px solid var(--divider-color, #e0e0e0);
  background: var(--primary-background-color, #fafafa); color: var(--primary-text-color, #212121); cursor: pointer; }
.actions { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 18px; }
.actions .del { color: var(--error-color, #db4437); }
.err { color: var(--error-color, #db4437); margin: 12px 16px; }
.prob { display: block; width: 100%; text-align: left; border: 0; border-bottom: 1px solid var(--divider-color, #e0e0e0); background: none; color: inherit; padding: 8px 4px; cursor: pointer; }
.prob:hover { background: var(--secondary-background-color, #f5f5f5); }
.hist-row { display: flex; align-items: center; gap: 8px; padding: 8px 0; border-bottom: 1px solid var(--divider-color, #e0e0e0); }
.hist-row span { flex: 1; }
.wall-ang { stroke: var(--warning-color, #ff9800); stroke-width: 3; pointer-events: none; }
.wall-ang.ok { stroke: var(--success-color, #4caf50); stroke-width: 5; }
.ang-t { font-size: 11px; font-weight: 600; fill: var(--warning-color, #ff9800); paint-order: stroke; stroke: var(--card-background-color, #fff); stroke-width: 3; pointer-events: none; }
.len-t { font-size: 11px; fill: var(--primary-text-color, #212121); paint-order: stroke; stroke: var(--card-background-color, #fff); stroke-width: 3; pointer-events: none; }
.ang-t.ok { fill: var(--success-color, #4caf50); }
.guide { stroke: #ff4081; stroke-width: 1; stroke-dasharray: 4 3; pointer-events: none; }
.side h3 { font-size: 14px; margin: 18px 0 4px; }
@media (max-width: 800px) {
  .main { flex-direction: column; }
  /* phone: the plan fills the screen, the item's form opens as a near full-height sheet like more-info (tap an item; ✕ closes it) */
  .grip { display: none; }
  .side { display: none; }
  .main.sheet::before { content: ""; position: fixed; inset: 0; background: rgba(0, 0, 0, .35); z-index: 9; }
  /* looks like HA's more-info sheet: grab handle, ✕ left of the title, the header stays while the form scrolls */
  .main.sheet .side { display: block; position: fixed; left: 0; right: 0; top: calc(8px + env(safe-area-inset-top, 0px)); bottom: 0; width: auto !important; z-index: 10;
    border-radius: var(--ha-dialog-border-radius, 28px) var(--ha-dialog-border-radius, 28px) 0 0; box-shadow: 0 -4px 24px rgba(0, 0, 0, .3); padding-top: 0; }
  .main.sheet .side > h2:first-child { position: sticky; top: 0; z-index: 2; margin: 0 -16px 8px; padding: 22px 16px 14px 60px;
    background: var(--card-background-color, #fff); font-size: 20px; font-weight: 500; line-height: 28px; }
  .main.sheet .side > h2:first-child::before { content: ""; position: absolute; top: 8px; left: 50%; width: 32px; height: 4px; margin-left: -16px;
    border-radius: 2px; background: var(--secondary-text-color, #727272); opacity: .4; }
  .main.sheet .sheet-x { display: block; position: fixed; top: calc(24px + env(safe-area-inset-top, 0px)); left: 8px; z-index: 11; }
  .top .state { display: none; }
  /* the toolbar wraps to two rows instead of scrolling the page sideways */
  :host { display: flex; flex-direction: column; height: 100vh; }
  .top { flex-wrap: wrap; height: auto; padding: 4px 8px; gap: 4px; }
  .top h1 { display: none; }
  /* first row: menu, mode tabs, save; the rest wraps to the second row */
  .top .modes { flex: 1 1 calc(100% - 132px); min-width: 0; }
  .top > :not(ha-menu-button):not(.modes):not(.save), .top > ha-dropdown > * { order: 1; } /* a dropdown is display: contents, its trigger is the flex item */
  .top ha-selector.level { width: 100px; }
  .top .lbl { display: none; }
  /* without its label the save button is a circle, like an icon button */
  .top ha-button.save::part(base) { aspect-ratio: 1; padding: 0; justify-content: center; border-radius: 50%; }
  .top ha-button.save::part(label) { display: none; }
  .top ha-button.save::part(start) { margin: 0; }
  .main { flex: 1; min-height: 0; height: auto; }
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
    const langChanged = setLang(hass.locale?.language || hass.language);
    if (first) this._load();
    else if (langChanged && this._plan) { this._skeleton(); this._draw(); this._form(); } // every text follows the language
    const lc = this.shadowRoot?.querySelector(".look-card");
    if (lc) lc.hass = hass;
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
      this.shadowRoot.querySelector(".err").textContent = this._tries < 30 ? t("panel.waiting") : t("panel.load_failed", { err: err.message || err.code || err });
      if (this._tries < 30) setTimeout(() => this.isConnected && this._load(), 2000);
      return;
    }
    this._tries = 0;
    for (const k of ["rooms", "openings", "furniture", "devices", "sensors", "texts"]) this._plan[k] ||= []; // a fresh install stores an empty plan
    this._plan.labels ||= {};
    // vacuum settings moved from plan.vacuum to the dock; saved with the next save
    const vdock = this._plan.vacuum && this._plan.furniture.find((f) => f.type === "robot_vacuum");
    if (vdock) {
      vdock.entity ||= this._plan.vacuum.entity;
      if (this._plan.vacuum.room_sensor) vdock.room_sensor ||= this._plan.vacuum.room_sensor;
      delete this._plan.vacuum;
    }
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
    if (!this._haLoading) {
      this._haLoading = true;
      this._loadHa().then(() => { this._skeleton(); this._draw(); this._form(); });
    }
  }

  // ha-selector / ha-entity-picker are lazy-loaded by HA; the entities card editor pulls them in
  async _loadHa() {
    if (customElements.get("ha-selector")) return;
    try {
      const helpers = await window.loadCardHelpers?.();
      const card = await helpers?.createCardElement({ type: "entities", entities: [] });
      await card?.constructor?.getConfigElement?.();
    } catch (err) { /* stays on plain inputs */ }
    await Promise.race([customElements.whenDefined("ha-selector"), new Promise((r) => setTimeout(r, 5000))]);
  }

  _skeleton() {
    const nd = (n) => !!customElements.get(n);
    this.shadowRoot.innerHTML = `<style>${STYLE}</style><style>${scopeFx(CARD_STYLE)}</style>
<div class="top">
  <ha-menu-button></ha-menu-button>
  <h1>${t("panel.title")}</h1>
  <span class="state"></span>
  ${nd("ha-tab-group") ? `<ha-tab-group class="modes"><ha-tab-group-tab slot="nav" panel="items">${t("panel.mode_items")}</ha-tab-group-tab><ha-tab-group-tab slot="nav" panel="rooms">${t("panel.mode_rooms")}</ha-tab-group-tab><ha-tab-group-tab slot="nav" panel="look">${t("panel.mode_look")}</ha-tab-group-tab></ha-tab-group>` : `<div class="modes"><button data-m="items">${t("panel.mode_items")}</button><button data-m="rooms">${t("panel.mode_rooms")}</button><button data-m="look">${t("panel.mode_look")}</button></div>`}
  ${nd("ha-selector") ? '<ha-selector class="level"></ha-selector>' : `<select class="level" title="${t("panel.level")}"></select>`}
  ${nd("ha-dropdown") ? `<ha-dropdown class="add"><ha-button slot="trigger" appearance="filled" size="small" with-caret><ha-icon slot="start" icon="mdi:plus"></ha-icon><span class="lbl">${t("panel.add")}</span></ha-button></ha-dropdown>` : `<select class="add"><option value="">+ ${t("panel.add")}</option></select>`}
  <ha-icon-button class="undo" label="${t("panel.undo")}" disabled><ha-icon icon="mdi:undo"></ha-icon></ha-icon-button>
  <ha-icon-button class="redo" label="${t("panel.redo")}" disabled><ha-icon icon="mdi:redo"></ha-icon></ha-icon-button>
  ${nd("ha-dropdown") ? `<ha-dropdown class="more" placement="bottom-end">
    <ha-icon-button slot="trigger" label="${t("panel.more")}"><ha-icon icon="mdi:dots-vertical"></ha-icon></ha-icon-button>
    <ha-dropdown-item class="hist"><ha-icon slot="icon" icon="mdi:history"></ha-icon><span>${t("panel.history")}</span></ha-dropdown-item>
    <ha-dropdown-item class="check"><ha-icon slot="icon" icon="mdi:check-decagram-outline"></ha-icon><span>${t("panel.check")}</span></ha-dropdown-item>
    <ha-dropdown-item class="revert" disabled><ha-icon slot="icon" icon="mdi:restore"></ha-icon><span>${t("panel.revert")}</span></ha-dropdown-item>
    <wa-divider></wa-divider>
    <ha-dropdown-item class="lvl-new"><ha-icon slot="icon" icon="mdi:plus"></ha-icon><span>${t("panel.level_new")}</span></ha-dropdown-item>
    <ha-dropdown-item class="lvl-ren"><ha-icon slot="icon" icon="mdi:rename"></ha-icon><span>${t("panel.level_rename")}</span></ha-dropdown-item>
    <ha-dropdown-item class="lvl-del" variant="danger" hidden><ha-icon slot="icon" icon="mdi:delete"></ha-icon><span>${t("panel.level_delete")}</span></ha-dropdown-item>
  </ha-dropdown>` : `<ha-button class="hist" appearance="plain" title="${t("panel.history")}">${t("panel.history_short")}</ha-button>
  <ha-button class="check" appearance="plain" title="${t("panel.check")}">${t("panel.check_short")}</ha-button>
  <ha-button class="revert" appearance="plain" disabled>${t("panel.revert_short")}</ha-button>`}
  <ha-button class="save" appearance="accent" disabled><ha-icon slot="start" icon="mdi:content-save"></ha-icon><span class="lbl">${t("panel.save")}</span></ha-button>
</div>
<div class="main">
  <div class="stage"><svg preserveAspectRatio="xMidYMin meet"></svg>
    <div class="zoom"><ha-icon-button data-z="in" label="${t("panel.zoom_in")}"><ha-icon icon="mdi:plus"></ha-icon></ha-icon-button><ha-icon-button data-z="out" label="${t("panel.zoom_out")}"><ha-icon icon="mdi:minus"></ha-icon></ha-icon-button><ha-icon-button data-z="fit" label="${t("panel.zoom_fit")}"><ha-icon icon="mdi:fit-to-screen-outline"></ha-icon></ha-icon-button></div></div>
  <div class="grip" title="${t("panel.grip")}"></div>
  <div class="side"></div>
  <ha-icon-button class="sheet-x" label="${t("panel.close")}"><ha-icon icon="mdi:close"></ha-icon></ha-icon-button>
</div>
<datalist id="ents"></datalist>`;
    const $ = (s) => this.shadowRoot.querySelector(s);
    const menu = $("ha-menu-button");
    menu.hass = this._hass;
    menu.narrow = this._narrow;
    $(".save").addEventListener("click", () => this._save());
    $(".undo").addEventListener("click", () => this._history(this._undo, this._redo));
    $(".redo").addEventListener("click", () => this._history(this._redo, this._undo));
    // menu items (or the plain buttons without ha-dropdown): the click closes the menu and runs the action
    const more = $(".more");
    const acts = {
      hist: () => this._showHistory(),
      check: () => this._showCheck(),
      revert: () => { if (confirm(t("panel.revert_confirm"))) this._load(); },
      "lvl-new": () => this._levelAction("+new"),
      "lvl-ren": () => this._levelAction("+rename"),
      "lvl-del": () => this._levelAction("+delete"),
    };
    for (const [c, fn] of Object.entries(acts)) {
      const it = $("." + c);
      it?.addEventListener("click", () => { if (it.disabled) return; if (more) more.open = false; fn(); });
    }
    // drag the grip to resize the side panel; the width is remembered
    const side = $(".side"), grip = $(".grip"), main = $(".main");
    // phone sheet: ✕ or a tap on the dimmed plan closes it, the selection stays (the item can be dragged then)
    const closeSheet = () => { this._sheet = false; this._sheetUI(); };
    $(".stage").addEventListener("click", () => { if (this._mode === "look" && !this._sheet) { this._sheet = true; this._sheetUI(); } });
    $(".sheet-x").addEventListener("click", closeSheet);
    main.addEventListener("click", (e) => { if (e.target === main) closeSheet(); });
    try { const w = Number(localStorage.getItem("fns-floorplan-side-w")); if (w > 0) side.style.width = w + "px"; } catch (err) { /* storage blocked */ }
    grip.addEventListener("pointerdown", (e) => { grip.setPointerCapture(e.pointerId); grip.classList.add("on"); });
    grip.addEventListener("pointermove", (e) => {
      if (!grip.hasPointerCapture(e.pointerId)) return;
      side.style.width = clamp(main.getBoundingClientRect().right - e.clientX, 260, Math.min(720, innerWidth * 0.6)) + "px";
    });
    const gripEnd = (e) => {
      if (!grip.hasPointerCapture(e.pointerId)) return;
      grip.releasePointerCapture(e.pointerId);
      grip.classList.remove("on");
      try { localStorage.setItem("fns-floorplan-side-w", String(parseInt(side.style.width, 10) || "")); } catch (err) { /* storage blocked */ }
    };
    grip.addEventListener("pointerup", gripEnd);
    grip.addEventListener("pointercancel", gripEnd);
    const modes = $(".modes");
    // HA's tabs (as in Settings): wa-tab-show names the picked panel
    if (modes.localName === "ha-tab-group") {
      modes.active = this._mode;
      modes.addEventListener("wa-tab-show", (e) => this._setMode(e.detail.name));
    } else modes.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => this._setMode(b.dataset.m)));
    const level = $(".level");
    if (level.localName === "ha-selector") {
      level.addEventListener("value-changed", (e) => {
        e.stopPropagation();
        const v = e.detail.value;
        if (v != null && String(v) !== String(this._level)) this._levelAction(String(v));
      });
    } else level.addEventListener("change", (e) => this._levelAction(e.target.value));
    const add = $(".add");
    if (add.localName === "select") add.addEventListener("change", (e) => { const v = e.target.value; e.target.value = ""; if (v) this._addItem(v); });
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
    this.shadowRoot.querySelectorAll(".zoom [data-z]").forEach((b) => b.addEventListener("click", () => {
      if (b.dataset.z === "fit") { this._view = null; this._applyView(); }
      else this._zoom(b.dataset.z === "in" ? 1 / 1.4 : 1.4);
    }));
  }

  _setMode(m) {
    if (!m || m === this._mode) return; // the toggle group may report no value or the current one
    this._mode = m;
    this._sel = null;
    if (m === "look") this._sheet = true; // on a phone the form opens right away
    this._draw();
    this._form();
  }

  // v: "room" or the index into ADD
  _addItem(v) {
    if (this._mode === "look") this._mode = "items";
    this._sheet = true;
    if (v === "room") {
      const [cx, cz] = centroid(this._bounds()).map((v) => r3(snap(v)));
      this._plan.rooms.push(this._stamp({ id: uid("room"), name: t("panel.new_room"), points: [[cx - 1, cz - 1], [cx + 1, cz - 1], [cx + 1, cz + 1], [cx - 1, cz + 1]], temperature: null, humidity: null }));
      this._mode = "rooms";
      this._sel = { cat: "rooms", i: this._plan.rooms.length - 1 };
      return this._changed();
    }
    const { cat, item } = ADD[Number(v)][1]();
    const [cx, cz] = centroid(this._bounds());
    Object.assign(this._stamp(item), { x: r3(snap(cx)), z: r3(snap(cz)) });
    if (cat === "furniture") item.id = `f_${Date.now().toString(36)}`;
    this._plan[cat].push(item);
    this._sel = { cat, i: this._plan[cat].length - 1 };
    this._changed();
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
    return this._plan.levels?.length ? this._plan.levels : [{ id: "0", name: t("card.ground_floor") }];
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
    // the floor actions live in the ⋮ menu; "Delete floor" only for a non-first floor
    this.shadowRoot.querySelector(".lvl-del")?.toggleAttribute("hidden", !(levels.length > 1 && String(this._level) !== String(levels[0].id)));
    if (sel.localName === "ha-selector") {
      Object.assign(sel, { hass: this._hass, selector: { select: { mode: "dropdown", options: levels.map((l) => ({ value: String(l.id), label: l.name })) } }, label: t("panel.level"), required: true, value: String(this._level) });
      return;
    }
    sel.innerHTML = levels.map((l) => `<option value="${esc(l.id)}">${esc(l.name)}</option>`).join("") +
      `<option value="+new">＋ ${t("panel.level_new")}</option><option value="+rename">${t("panel.level_rename")}</option>` +
      (levels.length > 1 && String(this._level) !== String(levels[0].id) ? `<option value="+delete">${t("panel.level_delete")}</option>` : "");
    sel.value = String(this._level);
  }

  _levelAction(v) {
    const levels = this._levels();
    const cur = levels.find((l) => String(l.id) === String(this._level));
    if (v === "+new") {
      const name = prompt(t("panel.level_name_prompt"), t("panel.level_default", { n: levels.length }));
      if (!name) return this._fillLevels();
      this._plan.levels = [...levels, { id: uid("lvl"), name }];
      this._level = this._plan.levels.at(-1).id;
      this._mode = "rooms"; // an empty floor starts with drawing rooms
    } else if (v === "+rename") {
      const name = prompt(t("panel.level_rename_prompt"), cur.name);
      if (!name) return this._fillLevels();
      this._plan.levels = levels.map((l) => (l === cur ? { ...l, name } : l));
    } else if (v === "+delete") {
      const rooms = this._roomsHere(), n = rooms.length + ["furniture", "devices", "sensors", "texts"].reduce((t, k) => t + this._plan[k].filter((x) => this._on(x)).length, 0);
      if (!confirm(n ? t("panel.level_delete_confirm_n", { name: cur.name, n }) : t("panel.level_delete_confirm", { name: cur.name }))) return this._fillLevels();
      const ids = new Set(rooms.map((r) => r.id));
      this._plan.openings = this._plan.openings.filter((o) => !ids.has(o.room_id));
      for (const id of ids) delete this._plan.labels[id];
      delete this._plan.backgrounds?.[cur.id];
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

  // exact: the position comes from a snap guide, keep it instead of rounding to the grid
  _move(sel, x, z, exact) {
    if (sel.cat === "rooms" || sel.cat === "openings") return; // moved by their own handlers
    const q = exact ? (v) => v : snap;
    if (sel.g) {
      const o = this._get(sel), dx = q(x - o.x), dz = q(z - o.z);
      for (const i of sel.g) { const f = this._plan.furniture[i]; f.x = r3(f.x + dx); f.z = r3(f.z + dz); }
      return;
    }
    if (sel.cat === "labels") this._plan.labels[sel.id] = [r3(q(x)), r3(q(z))];
    else Object.assign(this._plan[sel.cat][sel.i], { x: r3(q(x)), z: r3(q(z)) });
  }

  _draw() {
    const svg = this.shadowRoot.querySelector("svg");
    // the view stays put while dragging, so a moved corner does not shift the whole plan under the pointer
    if (!this._dragging) this._applyView();
    svg.innerHTML = "";
    // tracing image of the floor (editor only)
    const bg = this._plan.backgrounds?.[this._level];
    if (bg?.url) {
      const [bx, bz] = P([bg.left || 0, bg.top || 0]);
      el("image", { href: bg.url, x: bx, y: bz, width: bg.width * S, height: bg.width * S * 3, preserveAspectRatio: "xMinYMin meet", opacity: bg.opacity ?? 0.4, style: "pointer-events:none" }, svg);
    }
    svg.setAttribute("class", "mode-" + this._mode);
    if (this._multi && !this._multi.some((m) => selEq(m, this._sel))) this._multi = null;
    const modes = this.shadowRoot.querySelector(".modes");
    if (modes.localName === "ha-tab-group") modes.active = this._mode;
    else modes.querySelectorAll("button").forEach((b) => b.classList.toggle("on", b.dataset.m === this._mode));
    this._fillAdd();
    const plan = this._plan;
    const states = this._hass.states;
    // colour rules are previewed with the current states (templates are left out here)
    const ruled = (o) => (o.rules ? evalRules(o.rules, states) : {});
    const paint = (node, res, fill) => {
      if (res.color) {
        const c = color(res.color);
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
      if (tint) el("path", { d: f.getAttribute("d"), class: "tint", "fill-opacity": res.opacity ?? 0.14 }, svg).style.fill = color(tint);
      if (this._mode !== "rooms") return;
      f.addEventListener("pointerdown", (e) => {
        const base = r.points.map((p) => [...p]);
        const others = this._otherCorners(r, []);
        this._press(e, { cat: "rooms", i }, (dx, dz, p, ev) => {
          // walls line up with other rooms' corners and walls (Alt turns it off)
          const nx = !ev?.altKey && nearest(base.map((b) => b[0] + dx), others.map((o) => o[0]));
          const nz = !ev?.altKey && nearest(base.map((b) => b[1] + dz), others.map((o) => o[1]));
          const sx = nx ? dx + nx.d : snap(dx), sz = nz ? dz + nz.d : snap(dz);
          this._guides = [...(nx ? [{ x: nx.t }] : []), ...(nz ? [{ z: nz.t }] : [])];
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
          flip(hx, hz, "⇄", t("panel.flip_hinge"), () => (o.hinge = o.hinge === "right" ? "left" : "right"));
          const [mx, mz] = P([g.H[0] + (g.along[0] + g.nn[0]) * g.w * 0.45, g.H[1] + (g.along[1] + g.nn[1]) * g.w * 0.45]);
          flip(mx, mz, "⇅", t("panel.flip_swing"), () => (o.swing = o.swing === "out" ? "in" : "out"));
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
      // dragging slides the opening along its wall, or onto the nearest wall of any room on this floor
      el("line", { x1: A[0], y1: A[1], x2: B[0], y2: B[1], class: "open-hit" }, svg).addEventListener("pointerdown", (e) => {
        const p0 = this._toPlan(e), grab = (p0[0] - a[0]) * u[0] + (p0[1] - a[1]) * u[1] - o.offset;
        const walls = this._roomsHere().flatMap((rr) => rr.points.map((_, k) => ({ rr, k, ...edgeOf(rr, k) }))).filter((w) => w.L >= o.width);
        this._press(e, { cat: "openings", i: oi }, (dx, dz, p) => {
          let best = null;
          for (const w of walls) {
            const t = clamp((p[0] - w.a[0]) * w.u[0] + (p[1] - w.a[1]) * w.u[1], 0, w.L);
            const d = Math.hypot(w.a[0] + w.u[0] * t - p[0], w.a[1] + w.u[1] * t - p[1]);
            // its own room wins on a shared wall, so the opening does not flip rooms there
            if (!best || d < best.d - 1e-6 || (Math.abs(d - best.d) < 1e-6 && w.rr.id === o.room_id)) best = { w, t, d };
          }
          if (!best) return;
          const { w, t } = best, own = w.rr.id === o.room_id && w.k === o.edge;
          o.room_id = w.rr.id;
          o.edge = w.k;
          o.offset = r3(clamp(snap(own ? t - grab : t), o.width / 2, w.L - o.width / 2));
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
        // one-sided glow: a dashed band on that side (the group is turned with the strip)
        if (f.glow_side === 1 || f.glow_side === -1) el("rect", { x: -w / 2, y: f.glow_side === 1 ? 0 : -20, width: w, height: 20, class: "spot-cone" }, g);
        el("line", { x1: -w / 2, y1: 0, x2: w / 2, y2: 0, class: "strip-hit" }, g);
        el("line", { x1: -w / 2, y1: 0, x2: w / 2, y2: 0, class: "strip" + (missing ? " noent" : "") }, g);
      } else if (isLight(f)) {
        if (f.type === "lamp_spot") {
          // preview of the cone, 1.5 m long
          const a = ((f.rotation || 0) * Math.PI) / 180, h = (((f.beam || 40) / 2) * Math.PI) / 180, L = 1.5 * S / (SIZES[f.size] || 1);
          const pt = (t) => `${Math.cos(t) * L} ${Math.sin(t) * L}`;
          el("path", { d: `M0 0 L${pt(a - h)} A${L} ${L} 0 0 1 ${pt(a + h)} Z`, class: "spot-cone" }, g);
        }
        el("circle", { r: 15, class: "lamp" + (missing ? " noent" : "") }, g);
        icon(g, f, 18, lightIcon(f.type), "ico lamp-ico");
      } else if (f.type === "robot_vacuum") {
        el("circle", { r: 12, class: "dev" }, g);
        icon(g, f, 16, "mdiRobotVacuum");
      } else {
        const sh = furnShape(f.type, Math.max(w, 2), Math.max(d, 2));
        paint(el(sh.tag, { ...sh.attrs, rx: 3, class: "furn" }, g), { ...res, color: res.color || f.color }, true);
        const size = sh.fit * 0.6;
        if (size >= 9 && f.icon !== "none") el("g", { transform: `translate(${sh.ix} ${sh.iz})` }, g).innerHTML = `<g class="ico furn-ico">${iconHtml(f.icon, Math.min(size, 26), FURNITURE[f.type]?.[1] || "mdiShapeOutline")}</g>`;
      }
    }
    for (const members of groups.values()) {
      if (members.length < 2) continue;
      const sel = { cat: "furniture", i: members[0], g: members }, o = this._get(sel);
      const g = group(sel, o.x, o.z, 0, SIZES[o.size] || 1);
      if (ruled(o).hide) g.classList.add("rhid");
      el("circle", { r: 15, class: "lamp" }, g);
      icon(g, o, 18, lightIcon(o.type), "ico lamp-ico");
      el("circle", { cx: 13, cy: -13, r: 7, class: "count" }, g);
      el("text", { class: "count-t", "text-anchor": "middle", x: 13, y: -9.5 }, g).textContent = members.length;
    }
    plan.devices.map((d, i) => [d, i]).filter(([d]) => this._on(d)).sort((a, b) => layer(a[0]) - layer(b[0])).forEach(([d, i]) => {
      const g = group({ cat: "devices", i }, d.x, d.z, 0, SIZES[d.size] || 1);
      const res = ruled(d);
      if (res.hide) g.classList.add("rhid");
      paint(el("circle", { r: 15, class: "dev" + (d.entity ? "" : " noent") }, g), res, false);
      icon(g, d, 18, DEVICE_ICON[d.kind] || "mdiShapeOutline");
      // a generic item without its own icon shows its entity's icon, as on the card
      const so = !d.icon && d.kind === "generic" && this._hass.states[d.entity], ip = g.lastElementChild.querySelector("path");
      if (so) resolveIcon(null, so, this._hass).then((x) => x && ip.setAttribute("d", x));
    });
    plan.sensors.map((s, i) => [s, i]).filter(([s]) => this._on(s)).sort((a, b) => layer(a[0]) - layer(b[0])).forEach(([s, i]) => {
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
      if (fg) tx.style.fill = color(fg);
      if (bg) rect.style.fill = bg === "none" ? "transparent" : color(bg);
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
    if (f && f.type === "lamp_spot" && this._mode === "items") {
      const a = ((f.rotation || 0) * Math.PI) / 180, [cx, cz] = P([f.x, f.z]), [hx, hz] = P([f.x + Math.cos(a) * 1.2, f.z + Math.sin(a) * 1.2]);
      el("line", { x1: cx, y1: cz, x2: hx, y2: hz, class: "rot-line" }, svg);
      const h = el("circle", { cx: hx, cy: hz, r: 7, class: "rot-h" }, svg);
      el("title", {}, h).textContent = t("panel.beam_dir");
      h.addEventListener("pointerdown", (e) => this._press(e, this._sel, (dx, dz, p, ev) => {
        const deg = (Math.atan2(p[1] - f.z, p[0] - f.x) * 180) / Math.PI, st = ev?.ctrlKey || ev?.metaKey ? 15 : 1;
        f.rotation = (((Math.round(deg / st) * st) % 360) + 360) % 360;
      }));
    }
    if (this._guides) {
      const b = this._bounds(), x1 = b[2][0] + 1, z1 = b[2][1] + 1;
      for (const g of this._guides) {
        const [A, B] = g.x != null ? [P([g.x, -1]), P([g.x, z1])] : [P([-1, g.z]), P([x1, g.z])];
        el("line", { x1: A[0], y1: A[1], x2: B[0], y2: B[1], class: "guide" }, svg);
      }
    }
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
      if (!isLight(f) || f.type === "led_strip" || f.type === "lamp_spot" || !f.entity || !this._on(f)) return;
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
    el("title", {}, h).textContent = t("panel.rotate_hint");
    h.addEventListener("pointerdown", (e) => this._press(e, sel, (dx, dz, p, ev) => {
      const deg = (Math.atan2(p[1] - f.z, p[0] - f.x) * 180) / Math.PI + 90, st = ev?.ctrlKey || ev?.metaKey ? 15 : 1;
      f.rotation = (((Math.round(deg / st) * st) % 360) + 360) % 360;
    }));
  }

  // corners of the selected room: drag to move (snaps to other rooms' corners), "+" between two adds one;
  // a wall itself drags out or in as a whole (its two corners move together, square to the wall)
  _handles(svg, ri) {
    const r = this._plan.rooms[ri], c0 = centroid(r.points);
    r.points.forEach((p, k) => {
      const k2 = (k + 1) % r.points.length, q = r.points[k2];
      const L = Math.hypot(q[0] - p[0], q[1] - p[1]);
      if (L < 1e-6) return;
      const n = [-(q[1] - p[1]) / L, (q[0] - p[0]) / L];
      const [A, B] = [P(p), P(q)];
      // wall length, outside the room
      const m = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2], out = (m[0] - c0[0]) * n[0] + (m[1] - c0[1]) * n[1] < 0 ? -1 : 1;
      const [tx, tz] = P([m[0] + n[0] * out * 0.25, m[1] + n[1] * out * 0.25]);
      el("text", { x: tx, y: tz + 4, "text-anchor": "middle", class: "len-t" }, svg).textContent = L.toFixed(2).replace(".", ",") + " m";
      const hit = el("line", { x1: A[0], y1: A[1], x2: B[0], y2: B[1], class: "edge-hit" }, svg);
      hit.style.cursor = Math.abs(n[1]) > Math.abs(n[0]) ? "ns-resize" : "ew-resize";
      hit.addEventListener("pointerdown", (e) => {
        const b0 = [...p], b1 = [...q], u = [(q[0] - p[0]) / L, (q[1] - p[1]) / L];
        // corners of other rooms on this wall (its ends or anywhere along it) share it and move along
        const on = this._plan.rooms.filter((x) => x !== r && this._on(x)).flatMap((x) => x.points.map((o, j) => ({ room: x, k: j, b: [...o] })))
          .filter(({ b }) => {
            const w = [b[0] - b0[0], b[1] - b0[1]], t = w[0] * u[0] + w[1] * u[1];
            return Math.abs(w[0] * n[0] + w[1] * n[1]) < 0.02 && t > -0.02 && t < L + 0.02;
          });
        // how far each other corner is from the wall, measured square to it
        const dist = this._otherCorners(r, on).map((o) => (o[0] - b0[0]) * n[0] + (o[1] - b0[1]) * n[1]);
        this._press(e, { cat: "rooms", i: ri }, (dx, dz, pt, ev) => {
          const raw = dx * n[0] + dz * n[1], hit = !ev?.altKey && nearest([raw], dist);
          const d = hit ? hit.t : snap(raw), mv = (b) => [r3(Math.max(0, b[0] + n[0] * d)), r3(Math.max(0, b[1] + n[1] * d))];
          r.points[k] = mv(b0);
          r.points[k2] = mv(b1);
          for (const x of on) x.room.points[x.k] = ev?.altKey ? [...x.b] : mv(x.b);
        });
      });
    });
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
    // the two walls of the selected corner: green when exactly straight, else orange with their angle
    if (this._sel.v != null && r.points[this._sel.v]) {
      const n = r.points.length, v = this._sel.v;
      for (const [a, b] of [[r.points[(v - 1 + n) % n], r.points[v]], [r.points[v], r.points[(v + 1) % n]]]) {
        const ang = ((Math.round((Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI) % 180) + 180) % 180;
        const ok = Math.abs(a[0] - b[0]) < 0.002 || Math.abs(a[1] - b[1]) < 0.002, cls = ok ? " ok" : "";
        const [A, B] = [P(a), P(b)];
        el("line", { x1: A[0], y1: A[1], x2: B[0], y2: B[1], class: "wall-ang" + cls }, svg);
        const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], d = Math.hypot(c0[0] - m[0], c0[1] - m[1]) || 1;
        const [tx, tz] = P([m[0] + ((c0[0] - m[0]) / d) * 0.25, m[1] + ((c0[1] - m[1]) / d) * 0.25]);
        el("text", { x: tx, y: tz + 4, "text-anchor": "middle", class: "ang-t" + cls }, svg).textContent = ok ? t("panel.straight") : ang + "°";
      }
    }
    r.points.forEach((p, k) => {
      const [cx, cz] = P(p);
      el("circle", { cx, cy: cz, r: 8, class: "vtx" + (this._sel.v === k ? " sel" : "") }, svg).addEventListener("pointerdown", (e) => {
        const base = [...p];
        // the same corner of a neighbouring room (a shared wall) moves along, unless Alt is held
        const twins = this._twins(r, base);
        const others = this._otherCorners(r, twins);
        this._press(e, { cat: "rooms", i: ri, v: k }, (dx, dz, pt, ev) => {
          if (ev?.ctrlKey || ev?.metaKey) {
            r.points[k] = this._angleSnap(r, k, pt);
            if (!ev.altKey) for (const t of twins) t.room.points[t.k] = [...r.points[k]];
            return;
          }
          let x = base[0] + dx, z = base[1] + dz;
          // onto another room's corner, else in line with other corners (walls), else the grid; Alt: grid only
          const near = !ev?.altKey && others.find((o) => Math.hypot(o[0] - x, o[1] - z) < 0.15);
          const nx = !ev?.altKey && !near && nearest([x], others.map((o) => o[0]));
          const nz = !ev?.altKey && !near && nearest([z], others.map((o) => o[1]));
          this._guides = [...(nx ? [{ x: nx.t }] : []), ...(nz ? [{ z: nz.t }] : [])];
          [x, z] = near || [nx ? nx.t : snap(x), nz ? nz.t : snap(z)];
          r.points[k] = [r3(Math.max(0, x)), r3(Math.max(0, z))];
          if (!ev?.altKey) for (const t of twins) t.room.points[t.k] = [...r.points[k]];
        });
      });
    });
  }

  // Ctrl: corner k goes where a wall to one of its two neighbours runs at a multiple of 15°
  // (onto both walls at once near their crossing, e.g. a square corner); wall length on the 5 cm grid
  _angleSnap(r, k, pt) {
    const n = r.points.length, step = Math.PI / 12, rays = [];
    for (const a of [r.points[(k - 1 + n) % n], r.points[(k + 1) % n]]) {
      const vx = pt[0] - a[0], vz = pt[1] - a[1];
      if (Math.hypot(vx, vz) < 1e-6) continue;
      const t = Math.round(Math.atan2(vz, vx) / step) * step, c = Math.cos(t), s = Math.sin(t);
      rays.push({ a, c, s, p: [a[0] + c * snap(vx * c + vz * s), a[1] + s * snap(vx * c + vz * s)] });
    }
    let best = rays.map((x) => x.p).sort((p, q) => Math.hypot(p[0] - pt[0], p[1] - pt[1]) - Math.hypot(q[0] - pt[0], q[1] - pt[1]))[0] || pt;
    if (rays.length === 2) {
      const [u, w] = rays, det = u.c * -w.s + w.c * u.s;
      if (Math.abs(det) > 1e-6) {
        const t = ((w.a[0] - u.a[0]) * -w.s + w.c * (w.a[1] - u.a[1])) / det, X = [u.a[0] + u.c * t, u.a[1] + u.s * t];
        if (t > 0 && Math.hypot(X[0] - pt[0], X[1] - pt[1]) < 0.2) best = X;
      }
    }
    return [r3(Math.max(0, best[0])), r3(Math.max(0, best[1]))];
  }

  // corners of the other rooms on this floor, except the shared ones that move along (`twins`)
  _otherCorners(r, twins) {
    const skip = new Set(twins.map((t) => t.room.points[t.k]));
    return this._plan.rooms.filter((x) => x !== r && this._on(x)).flatMap((x) => x.points).filter((o) => !skip.has(o));
  }

  // corners of other rooms on this floor that sit on `pt` (within 2 cm): [{room, k}]
  _twins(r, pt) {
    return this._plan.rooms.filter((x) => x !== r && this._on(x))
      .flatMap((x) => x.points.map((q, k) => ({ room: x, k, q })).filter((t) => Math.hypot(t.q[0] - pt[0], t.q[1] - pt[1]) < 0.02));
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
    const dd = this.shadowRoot.querySelector(".add");
    const want = this._mode === "rooms" ? "rooms" : "items";
    if (dd.dataset.for === want) return;
    dd.dataset.for = want;
    const entries = want === "rooms" ? [["room", t("panel.room"), ""]] : ADD.map(([l], i) => [String(i), t(l), ADD_ICONS[i]]);
    if (dd.localName === "select") {
      dd.innerHTML = `<option value="">+ ${t("panel.add")}</option>` + entries.map(([v, l]) => `<option value="${v}">${l}</option>`).join("");
      return;
    }
    dd.querySelectorAll("ha-dropdown-item").forEach((i) => i.remove());
    for (const [v, l, ic] of entries) {
      const it = document.createElement("ha-dropdown-item");
      it.dataset.add = v;
      it.innerHTML = (ic ? `<ha-icon slot="icon" icon="${ic}"></ha-icon>` : "") + esc(l);
      it.addEventListener("click", () => { dd.open = false; this._addItem(v); });
      dd.appendChild(it);
    }
  }

  _drag(g, sel) {
    g.addEventListener("pointerdown", (e) => {
      let bases = null;
      this._press(e, sel, (dx, dz, p, ev) => {
        // a dragged member of the multi-selection moves all of it by the same snapped offset
        bases ??= (this._multi?.some((m) => selEq(m, sel)) ? this._multi : [sel]).map((s) => { const o = this._get(s); return [s, { x: o.x, z: o.z }]; }); // start positions, not the live objects
        const base = bases.find(([s]) => selEq(s, sel))[1];
        // snap to the axis of another item, a room centre or a wall (Alt turns it off)
        const gd = ev?.altKey ? { x: null, z: null, lines: null } : this._guide(base.x + dx, base.z + dz, bases.map(([s]) => s));
        this._guides = gd.lines;
        const exact = gd.x != null || gd.z != null;
        if (gd.x != null) dx = gd.x - base.x;
        if (gd.z != null) dz = gd.z - base.z;
        if (bases.length === 1) {
          const x = base.x + dx, z = base.z + dz;
          return this._move(sel, gd.x != null || !exact ? x : snap(x), gd.z != null || !exact ? z : snap(z), exact);
        }
        const sx = gd.x != null ? dx : snap(dx), sz = gd.z != null ? dz : snap(dz);
        for (const [s, o] of bases) {
          if (s.g || s.cat === "labels") this._move(s, o.x + sx, o.z + sz, exact);
          else Object.assign(this._plan[s.cat][s.i], { x: r3(o.x + sx), z: r3(o.z + sz) });
        }
      });
    });
  }

  // nearest axis (per x and z) of other items, label and room centres or axis-parallel walls on this floor
  _guide(x, z, exclude) {
    const plan = this._plan, xs = [], zs = [];
    const ex = (cat, i, id) => exclude.some((s) => s.cat === cat && (cat === "labels" ? s.id === id : s.i === i || s.g?.includes(i)));
    for (const cat of GROUPABLE) plan[cat].forEach((o, i) => { if (this._on(o) && !ex(cat, i)) { xs.push(o.x); zs.push(o.z); } });
    for (const r of this._roomsHere()) {
      if (!ex("labels", null, r.id)) { const l = plan.labels[r.id] || centroid(r.points); xs.push(l[0]); zs.push(l[1]); }
      const c = centroid(r.points);
      xs.push(c[0]); zs.push(c[1]);
      r.points.forEach((a, k) => {
        const b = r.points[(k + 1) % r.points.length];
        if (Math.abs(a[0] - b[0]) < 1e-3) xs.push(a[0]);
        if (Math.abs(a[1] - b[1]) < 1e-3) zs.push(a[1]);
      });
    }
    const th = clamp(0.1 / (this._view ? this._fullView().w / this._view.w : 1), 0.03, 0.15); // closer when zoomed in
    const near = (v, list) => { let best = null, d = th; for (const c of list) if (Math.abs(c - v) < d) { d = Math.abs(c - v); best = c; } return best; };
    const gx = near(x, xs), gz = near(z, zs);
    return { x: gx, z: gz, lines: [...(gx != null ? [{ x: gx }] : []), ...(gz != null ? [{ z: gz }] : [])] };
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
    this._sidePage = null;
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
        this._sidePage = null;
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
        onMove(dx, dz, p, ev);
        this._dirty = true;
        this._draw();
      };
      const up = () => {
        this._dragging = false;
        this._guides = null;
        svg.removeEventListener("pointermove", move);
        svg.removeEventListener("pointerup", up);
        svg.removeEventListener("pointercancel", up);
        if (moved) return this._changed();
        this._sheet = true; // a tap (not a drag) opens the phone sheet
        if (toggle) { this._toggle(sel); this._draw(); this._form(); }
        else if (changedSel || this._multi) { this._draw(); this._form(); }
        else this._sheetUI();
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

  // everything in the plan that points to a missing or unavailable entity: [{name, text, sel, level, mode}]
  _problems() {
    const out = [], states = this._hass.states, plan = this._plan, first = this._levels()[0].id;
    const bad = (id) => (!(id in states) ? t("panel.check_missing") : ["unavailable", "unknown"].includes(states[id].state) ? t("panel.check_unavailable") : null);
    const add = (name, text, sel, level, mode = "items") => out.push({ name, text, sel, level: level ?? first, mode });
    const check = (id, name, sel, level, mode, empty) => {
      if (!id) return empty && add(name, empty, sel, level, mode);
      const b = bad(id);
      if (b) add(name, `${id}: ${b}`, sel, level, mode);
    };
    const rules = (o, name, sel, mode) => {
      const walk = (c) => {
        if (c.any) c.any.forEach(walk);
        else if (c.entity && !(c.entity in states)) add(name, t("panel.check_rule_missing", { id: c.entity }), sel, o.level, mode);
      };
      for (const r of o.rules || []) [].concat(r.if || []).forEach(walk);
    };
    plan.furniture.forEach((f, i) => {
      const light = isLight(f), name = light ? LIGHT_TYPES[f.type] || f.type : FURNITURE[f.type] ? furnName(f.type) : f.type, sel = { cat: "furniture", i };
      check(f.entity, name, sel, f.level, "items", light && t("panel.check_no_entity"));
      rules(f, name, sel, "items");
    });
    plan.devices.forEach((d, i) => {
      const name = d.name || DEVICE_KINDS[d.kind] || d.entity || t("panel.device"), sel = { cat: "devices", i };
      check(d.entity, name, sel, d.level, "items", t("panel.check_no_entity"));
      rules(d, name, sel, "items");
    });
    plan.sensors.forEach((s, i) => check(s.entity, s.entity || t("panel.sensor"), { cat: "sensors", i }, s.level, "items", t("panel.check_no_entity")));
    plan.texts.forEach((x, i) => {
      const name = x.text || x.entity || "Text", sel = { cat: "texts", i };
      if (!x.entity && !x.text) add(name, t("panel.check_no_entity_text"), sel, x.level);
      else if (x.entity) check(x.entity, name, sel, x.level, "items");
      rules(x, name, sel, "items");
    });
    plan.openings?.forEach((o, i) => {
      const r = plan.rooms.find((x) => x.id === o.room_id);
      const name = `${o.type === "window" ? t("panel.window") : t("panel.door")} (${r?.name || "?"})`, sel = { cat: "openings", i };
      for (const k of ["contact", "blind", "lock"]) if (o[k]) check(o[k], name, sel, r?.level, "rooms");
    });
    plan.rooms.forEach((r, i) => {
      const sel = { cat: "rooms", i };
      for (const id of [r.temperature, r.humidity, ...(r.sheet_extra || [])]) if (id && !id.includes("{")) check(id, r.name, sel, r.level, "rooms");
      rules(r, r.name, sel, "rooms");
    });
    const vdock = plan.furniture.find((f) => f.type === "robot_vacuum");
    if (vdock || plan.vacuum) {
      const vsel = vdock ? { cat: "furniture", i: plan.furniture.indexOf(vdock) } : null, vlevel = vdock?.level;
      const vsensor = vdock?.room_sensor || plan.vacuum?.room_sensor;
      for (const id of [vdock?.entity || plan.vacuum?.entity, vsensor]) if (id) check(id, t("panel.vacuum"), vsel, vlevel, "items");
      // every room name the sensor can report needs a plan room (pairing or same name)
      for (const n of states[vsensor]?.attributes?.options || []) {
        if (!vdock?.room_map?.[n] && !vacRoom(n, plan.rooms, {})) add(t("panel.vacuum"), t("panel.check_room_unpaired", { name: n }), vsel, vlevel);
      }
    }
    return out;
  }

  _sideHead(page, title, hint) {
    this._sel = null;
    this._multi = null;
    this._sidePage = page;
    this._sheet = true;
    this._draw();
    const side = this.shadowRoot.querySelector(".side");
    side.innerHTML = `<h2>${title}</h2>${hint ? `<p class="hint">${hint}</p>` : ""}<div class="list"></div><div class="actions"><button data-a="close">${t("panel.close")}</button></div>`;
    side.querySelector('[data-a="close"]').addEventListener("click", () => { this._sidePage = null; this._form(); });
    return side.querySelector(".list");
  }

  _showCheck() {
    const list = this._sideHead("check", t("panel.check"));
    const probs = this._problems();
    if (!probs.length) list.innerHTML = `<p class="hint">${t("panel.check_ok")}</p>`;
    probs.forEach((p) => {
      const b = document.createElement("button");
      b.className = "prob";
      b.innerHTML = `<b>${esc(p.name)}</b><br>${esc(p.text)}`;
      b.addEventListener("click", () => {
        this._level = p.level; this._mode = p.mode; this._sidePage = null;
        this._sel = p.sel; this._multi = null; this._view = null;
        this._draw(); this._form();
      });
      list.appendChild(b);
    });
  }

  async _showHistory() {
    const list = this._sideHead("history", t("panel.history"), t("panel.history_hint"));
    let rows;
    try {
      rows = await this._hass.callWS({ type: "fns_floorplan/history/list" });
    } catch (err) {
      list.innerHTML = `<p class="err">${esc(t("card.history_failed", { err: err.message || err.code || err }))}</p>`;
      return;
    }
    if (this._sidePage !== "history") return;
    if (!rows.length) list.innerHTML = `<p class="hint">${t("panel.history_empty")}</p>`;
    for (const h of rows) {
      const row = document.createElement("div");
      row.className = "hist-row";
      row.innerHTML = `<span><b>#${h.rev}</b> ${esc(new Date(h.saved_at).toLocaleString(getLang()))}<br><small>${t("panel.history_row", { rooms: h.rooms, items: h.items })}</small></span><button class="mini">${t("panel.history_load")}</button>`;
      row.querySelector("button").addEventListener("click", async () => {
        if (this._dirty && !confirm(t("panel.history_discard_confirm"))) return;
        try {
          const old = await this._hass.callWS({ type: "fns_floorplan/history/get", rev: h.rev });
          const rev = this._plan.rev;
          this._plan = old;
          this._plan.rev = rev;
          for (const k of ["rooms", "openings", "furniture", "devices", "sensors", "texts"]) this._plan[k] ||= []; // a fresh install stores an empty plan
          this._plan.labels ||= {};
          this._sel = null; this._multi = null; this._sidePage = null;
          this._changed();
        } catch (err) {
          alert(t("panel.version_failed", { err: err.message || err.code || err }));
        }
      });
      list.appendChild(row);
    }
  }

  // tracing image of the current floor: upload, position, opacity (the card never shows it)
  _bgUI(side) {
    const lvl = String(this._level), bg = this._plan.backgrounds?.[lvl];
    const box = document.createElement("div");
    const num = (k, label, step) => `<label>${label}</label><input type="number" step="${step}" data-bg="${k}" value="${bg[k] ?? ""}">`;
    box.innerHTML = `<h3>${t("panel.bg_title")}</h3>
      <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml">
      ${bg ? `<div class="row2"><div>${num("width", t("panel.bg_width"), 0.05)}</div><div>${num("left", t("panel.bg_left"), 0.05)}</div></div>${num("top", t("panel.bg_top"), 0.05)}
        <label>${t("panel.bg_opacity")}</label><input type="range" min="0.1" max="1" step="0.05" data-bg="opacity" value="${bg.opacity ?? 0.4}">
        <div class="actions"><button data-a="bgdel" class="del">${t("panel.bg_remove")}</button></div>` : ""}
      <p class="hint">${t("panel.bg_hint")}</p>`;
    side.appendChild(box);
    box.querySelector("input[type=file]").addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const fd = new FormData();
      fd.append("level", lvl); // before the file, the server reads fields in order
      fd.append("file", file);
      try {
        const res = await this._hass.fetchWithAuth("/api/fns_floorplan/background", { method: "POST", body: fd });
        if (!res.ok) throw new Error((await res.text()) || res.status);
        const { url } = await res.json();
        (this._plan.backgrounds ||= {})[lvl] = { url, left: 0, top: 0, width: r3(this._bounds()[2][0]) || 10, opacity: 0.4 };
        this._changed();
      } catch (err) {
        alert(t("panel.bg_upload_failed", { err: err.message || err }));
      }
    });
    box.querySelectorAll("[data-bg]").forEach((inp) => inp.addEventListener("change", () => {
      const v = Number(inp.value);
      if (!Number.isFinite(v)) return;
      bg[inp.dataset.bg] = inp.dataset.bg === "width" ? Math.max(0.5, v) : v;
      this._changed();
    }));
    box.querySelector('[data-a="bgdel"]')?.addEventListener("click", async () => {
      try {
        const res = await this._hass.fetchWithAuth(`/api/fns_floorplan/background?level=${encodeURIComponent(lvl)}`, { method: "DELETE" });
        if (!res.ok) throw new Error((await res.text()) || res.status);
        delete this._plan.backgrounds[lvl];
        this._changed();
      } catch (err) {
        alert(t("panel.bg_remove_failed", { err: err.message || err }));
      }
    });
  }

  _status() {
    const $ = (s) => this.shadowRoot.querySelector(s);
    $(".undo").disabled = !this._undo?.length;
    $(".redo").disabled = !this._redo?.length;
    $(".save").disabled = !this._dirty;
    $(".revert").disabled = !this._dirty;
    const n = this._problems().length;
    const ct = $(".check span"); // menu item text, or the plain button
    if (ct) ct.textContent = n ? t("panel.check_n", { n }) : t("panel.check");
    else $(".check").textContent = n ? t("panel.check_short_n", { n }) : t("panel.check_short");
    $(".more")?.classList.toggle("warn", n > 0);
    $(".state").textContent = this._dirty ? t("panel.state_dirty") : "";
  }

  // HA's searchable select (custom_value → ha-generic-picker) shows the raw value ("lamp_table"); show its label instead
  async _nameSearchPick(h, options) {
    const names = new Map(options.map((o) => [o.value, o.label]));
    await h.updateComplete;
    await customElements.whenDefined("ha-selector-select");
    const s = h.shadowRoot?.querySelector("ha-selector-select");
    await s?.updateComplete;
    const p = s?.shadowRoot?.querySelector("ha-generic-picker");
    if (!p) return;
    p.valueRenderer = (v) => Object.assign(document.createElement("span"), { slot: "headline", textContent: names.get(v) ?? v });
  }

  // properties of the selected item
  // the phone sheet is shown while it is open and has something to show
  _sheetUI() {
    this.shadowRoot.querySelector(".main")?.classList.toggle("sheet", !!this._sheet && !!(this._sel || this._multi?.length || this._sidePage || this._mode === "look"));
  }

  // the form is rebuilt after every change and HA's fields grow in a moment later: the shorter page clamped
  // the scroll position and the form jumped; the same form gets its position back
  _keepScroll(side) {
    const key = [this._mode, this._sel?.cat, this._sel?.i, this._sel?.v, this._multi?.length].join("|");
    const top = key === this._formKey ? side.scrollTop : 0;
    this._formKey = key;
    if (!top) return;
    // puts the position back (the page may jump up or down), never fights the user scrolling meanwhile
    if (!side._scrollSeen) { side._scrollSeen = true; for (const ev of ["wheel", "touchmove", "keydown"]) side.addEventListener(ev, () => (this._scrollT = performance.now()), { passive: true }); }
    const t0 = performance.now();
    const fix = () => { if (this._formKey === key && Math.abs(side.scrollTop - top) > 1 && !(this._scrollT > t0)) side.scrollTop = top; };
    requestAnimationFrame(fix);
    for (const ms of [60, 200, 500]) setTimeout(fix, ms);
  }

  _form() {
    this._status();
    this._sheetUI();
    this._lookPreview();
    if (this._sidePage && !this._sel) return; // history / check list stays until closed or an item is picked
    const side = this.shadowRoot.querySelector(".side");
    this._keepScroll(side);
    if (this._mode === "look") return this._lookForm(side);
    const sel = this._sel, o = this._get();
    if (!o && this._mode === "rooms") {
      side.innerHTML = `<h2>${t("panel.f.rooms_title")}</h2><p class="hint">${t("panel.f.rooms_hint")}</p>`;
      this._bgUI(side);
      return;
    }
    if (this._multi && this._mode === "items") return this._multiForm(side);
    if (sel?.cat === "rooms") return this._roomForm(side, o);
    if (sel?.cat === "openings") return this._openingForm(side, o);
    if (!o) {
      side.innerHTML = `<h2>${t("panel.f.items_title")}</h2><p class="hint">${t("panel.f.items_hint")}</p>`;
      return;
    }
    const field = (label, key, value, type = "text", extra = "") =>
      `<label>${label}</label><input data-k="${key}" type="${type}" value="${esc(value)}" ${extra}>`;
    const num = (label, key, value) => field(label, key, value ?? "", "number", 'step="0.05"');
    const xz = `<div class="row2"><div>${num("X (m)", "x", o.x)}</div><div>${num("Z (m)", "z", o.z)}</div></div>${this._placeField()}`;
    const rotation = `<label>${t("panel.f.rotation")}</label><input data-k="rotation" type="number" step="1" value="${o.rotation || 0}">
        <div class="rot"><button data-a="rot-15">−15°</button><button data-a="rot15">+15°</button><button data-a="rot90">+90°</button></div>`;
    let html = "";
    if (sel.cat === "labels") {
      html = `<h2>${t("panel.f.badge_title", { name: esc(o.room.name) })}</h2><p class="hint">${t("panel.f.badge_hint")}</p>
        ${xz}
        <label>${t("panel.f.rotation")}</label><input data-k="rotation" type="number" step="1" value="${o.room.label_rotation || 0}">
        <div class="rot"><button data-a="rot-15">−15°</button><button data-a="rot15">+15°</button><button data-a="rot90">+90°</button></div>
        <div class="actions"><button data-a="auto">${t("panel.f.badge_center")}</button></div>`;
    } else if (sel.cat === "furniture") {
      const light = isLight(o), point = isPoint(o), dock = o.type === "robot_vacuum";
      const types = light ? byName(Object.keys(LIGHT_TYPES), (k) => LIGHT_TYPES[k]) : furnTypes();
      const label = (ty) => (light ? LIGHT_TYPES[ty] : FURNITURE[ty] ? furnName(ty) : ty);
      const look = `${o.type === "led_strip" ? `<label>${t("panel.f.glow_side")}</label><select data-k="glow_side">
          <option value="" ${!o.glow_side ? "selected" : ""}>${t("panel.f.glow_all")}</option>
          <option value="1" ${o.glow_side === 1 ? "selected" : ""}>${t("panel.f.glow_one")}</option>
          <option value="-1" ${o.glow_side === -1 ? "selected" : ""}>${t("panel.f.glow_other")}</option></select>` : ""}
        ${point || light ? "" : `<label>${t("panel.f.color")}</label>${this._colorPick("color", o.color)}`}
        ${o.type === "lamp_spot" ? `${rotation.replace(t("panel.f.rotation"), t("panel.f.beam_rotation"))}<label>${t("panel.f.beam_width")}</label><input data-k="beam" type="number" min="5" max="180" step="5" value="${o.beam || 40}">` : ""}
        ${o.type === "led_strip" ? "" : this._iconField(o, light ? lightIcon(o.type) : FURNITURE[o.type]?.[1])}
        ${point ? this._sizeField(o) : ""}`;
      html = `<h2>${esc(label(o.type))}${sel.g ? ` <span class="hint">${t("panel.f.group_count", { n: sel.g.length })}</span>` : ""}</h2>
        ${sel.g ? `<p class="hint">${t("panel.f.group_hint")}</p>` : ""}
        ${this._sec(t("panel.f.sec_basic"), `<label>${t("panel.f.type")}</label><select data-k="type" data-search>${types.map((t) => `<option value="${t}" ${t === o.type ? "selected" : ""}>${esc(label(t))}</option>`).join("")}</select>
        ${field(light ? t("panel.f.entity_light") : o.type === "tv_wall" ? t("panel.f.entity_tv") : dock ? t("panel.f.entity_vac") : t("panel.f.entity_opt"), "entity", o.entity || "", "text", 'list="ents"')}
        ${dock ? `<label>${t("panel.f.battery")}</label><input data-k="battery" value="${esc(o.battery || "")}" placeholder="sensor.*_battery" list="ents">` : ""}
        ${dock ? this._vacPairing(o) : ""}
        ${light ? `<label>${t("panel.f.room_light")}</label><input data-k="room_light" type="number" min="0" step="5" placeholder="100"
          value="${o.room_light === false ? 15 : typeof o.room_light === "number" ? Math.round(o.room_light * 100) : ""}">` : ""}
        ${light || dock ? `<label class="chk"><input type="checkbox" data-k="sheet_hide" ${o.sheet_hide ? "checked" : ""}> ${t("panel.f.sheet_hide")}</label>` : ""}`, true)}
        ${dock ? this._sec(t("panel.f.sec_running_vac"), `<label>${t("panel.f.color_cleaning")}</label>${this._colorPick("color_on", o.color_on)}
        <p class="hint">${t("panel.f.state_color_hint")}</p>
        ${this._fxPicker("fx", o.fx, t("panel.f.fx_none_drive"), "none", "mdiRobotVacuum", "progress", o.progress, t("panel.f.none_lc"), t("panel.f.fx_title_cleaning"), o.progress_total).replace(/<button class="fxt[^"]*" data-fx="none"[\s\S]*?<\/button>/, "")}`) : ""}
        ${look.replace(/\s/g, "") ? this._sec(t("panel.f.sec_look"), look) : ""}
        ${this._sec(dock ? t("panel.f.sec_dock") : point ? t("panel.f.sec_pos") : t("panel.f.sec_dims"), `${xz}
        ${point ? "" : o.type === "led_strip" ? num(t("panel.f.length"), "w", o.w) : `<div class="row2"><div>${num(t("panel.f.width"), "w", o.w)}</div><div>${num(t("panel.f.depth"), "d", o.d)}</div></div>`}
        ${point ? "" : rotation}
        ${this._layerField(o)}${dock ? `<p class="hint">${t("panel.f.dock_layer_hint")}</p>` : ""}`)}
        ${this._actionsUI(o, light ? { tap: ACTIONS.toggle, hold: ACTIONS["more-info"] } : { tap: ACTIONS["more-info"] })}
        ${this._rulesUI(o, o.type === "led_strip" ? ["color", "fx", "hide"] : light || dock ? ["color", "fx", "icon", "hide"] : ["color", "glow", "fx", "icon", "hide"])}`;
    } else if (sel.cat === "devices") {
      // domain defaults of a generic item: hint, default ring, default tap
      const dom = o.kind === "generic" ? String(o.entity || "").split(".")[0] : "", dd = DOMAIN_DEV[dom];
      const domFx = typeof dd?.fx === "string" ? dd.fx : "", domTap = dd?.tap?.("")?.perform_action || "";
      const hintKey = `domain_hint.${dom}`, hasHint = t(hintKey) !== hintKey;
      html = `<h2>${DEVICE_KINDS[o.kind] || t("panel.appliance")}</h2>
        ${this._sec(t("panel.f.sec_basic"), `<label>${t("panel.f.kind")}</label><select data-k="kind" data-search>${byName(Object.keys(DEVICE_KINDS), (k) => DEVICE_KINDS[k], "generic").map((k) => [k, DEVICE_KINDS[k]]).map(([k, v]) => `<option value="${k}" ${k === o.kind ? "selected" : ""}>${v}</option>`).join("")}</select>
        ${field(t("panel.f.name"), "name", o.name || "")}
        ${field(t("panel.f.entity"), "entity", o.entity || "", "text", 'list="ents"')}
        ${o.kind === "generic" && hasHint ? `<p class="hint">${t(hintKey)}</p>` : ""}
        ${dom === "vacuum" ? `<label>${t("panel.f.battery")}</label><input data-k="battery" value="${esc(o.battery || "")}" placeholder="sensor.*_battery" list="ents">` : ""}
        <label class="chk"><input type="checkbox" data-k="sheet_hide" ${o.sheet_hide ? "checked" : ""}> ${t("panel.f.sheet_hide")}</label>
        ${o.kind === "media" ? `<label class="chk"><input type="checkbox" data-k="cover" ${o.cover === false ? "" : "checked"}> ${t("panel.f.cover_chk")}</label>` : ""}`, true)}
        ${this._sec(t("panel.f.sec_running"), `<label>${t("panel.f.active_state")}</label><input data-k="active" value="${esc(Array.isArray(o.active) ? o.active.join(", ") : o.active ? JSON.stringify(o.active) : "")}" placeholder="${o.kind === "media" ? "playing" : "on, run"}">
        <p class="hint">${t("panel.f.active_hint")}</p>
        ${field(t("panel.f.text_on"), "text_on", o.text_on || "")}
        <label>${t("panel.f.color_on")}</label>${this._colorPick("color_on", o.color_on)}
        <p class="hint">${t("panel.f.color_on_hint")}</p>
        ${this._fxPicker("fx", o.fx, o.kind === "alarm" ? t("panel.f.fx_alarm_def") : domFx ? t("panel.f.fx_def_x", { fx: DEVICE_FX[domFx].split(" ")[0] }) : t("panel.f.fx_def_ring"), o.kind === "alarm" ? "radar" : domFx || "ring", DEVICE_ICON[o.kind] || "mdiShapeOutline", "progress", o.progress, undefined, undefined, o.progress_total)}`, true)}
        ${this._sec(t("panel.f.sec_look"), `${field(t("panel.f.text_below_icon"), "text", o.text || "")}
        <p class="hint">${t("panel.f.template_hint")}</p>
        <label>${t("panel.f.label_pos")}</label><select data-k="label_position">${["", "top", "left", "right"].map((v) => `<option value="${v}" ${(o.label_position || "") === v ? "selected" : ""}>${t("panel.f.label_pos_" + (v || "bottom"))}</option>`).join("")}</select>
        <label class="chk"><input type="checkbox" data-k="label_vertical" ${o.label_vertical ? "checked" : ""}> ${t("panel.f.label_vertical")}</label>
        <label>${t("panel.f.color")}</label>${this._colorPick("color", o.color)}
        ${this._iconField(o, DEVICE_ICON[o.kind])}
        ${this._sizeField(o)}`)}
        ${this._sec(t("panel.f.sec_pos"), `${xz}
        ${this._layerField(o)}`)}
        ${this._actionsUI(o, { tap: domTap ? (domTap.includes("press") ? t("panel.f.act_press") : t("panel.f.act_run")) : ACTIONS["more-info"] })}
        ${this._rulesUI(o, ["color", "glow", "animate", "fx", "text", "icon", "wave", "hide"])}`;
    } else if (sel.cat === "texts") {
      html = `<h2>Text</h2><p class="hint">${t("panel.f.text_hint")}</p>
        ${this._sec(t("panel.f.sec_basic"), `${field(t("panel.f.entity"), "entity", o.entity || "", "text", 'list="ents"')}
        ${field(t("panel.f.custom_text"), "text", o.text || "")}`, true)}
        ${this._sec(t("panel.f.sec_look"), `<label>${t("panel.f.text_color")}</label>${this._colorPick("color", o.color)}
        <label>${t("panel.f.background")}</label>${this._colorPick("background", o.background, true)}
        ${this._sizeField(o)}`)}
        ${this._sec(t("panel.f.sec_pos"), `${xz}${rotation}`)}
        ${this._actionsUI(o, { tap: ACTIONS["more-info"] })}
        ${this._rulesUI(o, ["color", "background", "text", "hide"])}`;
    } else {
      html = `<h2>${t("panel.sensor")}</h2><p class="hint">${t("panel.f.sensor_hint")}</p>
        ${field(t("panel.f.entity_bs"), "entity", o.entity || "", "text", 'list="ents"')}${xz}${this._layerField(o)}`;
    }
    if (sel.cat !== "labels") html += `<div class="actions"><button data-a="dup">${t("panel.f.duplicate")}</button><button data-a="del" class="del">${t("panel.f.delete")}</button></div>`;
    side.innerHTML = html;
    this._bind(side, (k, v, inp) => this._set(k, v, inp), (a) => this._action(a));
    this._afterForm(side);
  }

  // a collapsible group of fields (ha-expansion-panel as in HA editors); remembers open/closed per title
  _sec(title, html, open = false, key = title) {
    const ex = this._secOpen?.[key] ?? open;
    return customElements.get("ha-expansion-panel")
      ? `<ha-expansion-panel outlined header="${esc(title)}" data-sec="${esc(key)}" ${ex ? "expanded" : ""}><div class="sec">${html}</div></ha-expansion-panel>`
      : `<details data-sec="${esc(key)}" ${ex ? "open" : ""}><summary>${esc(title)}</summary>${html}</details>`;
  }

  // dock: vacuum room sensor and the table "room name in the vacuum" -> "room in the plan"
  _vacPairing(o) {
    const sensor = o.room_sensor || this._plan.vacuum?.room_sensor || "", s = this._hass.states[sensor], cur = s?.state;
    const names = [...new Set([...(s?.attributes?.options || []), ...Object.keys(o.room_map || {}), ...(cur && !["unknown", "unavailable"].includes(cur) ? [cur] : []), ...(this._vacExtra || [])])].sort((a, b) => a.localeCompare(b, getLang()));
    const rooms = this._plan.rooms;
    const rows = names.map((name) => {
      const auto = vacRoom(name, rooms, {}), val = o.room_map?.[name] || "";
      return `<div class="vrow${name === cur ? " cur" : ""}"><select data-k="rm:${esc(name)}" data-label="${esc(name)}${name === cur ? " " + t("panel.f.vp_now") : ""}">
        <option value="" ${val === "" ? "selected" : ""}>${esc(t("panel.f.vp_auto", { name: auto ? auto.name : t("panel.f.vp_unpaired") }))}</option>
        <option value="__none" ${val === "__none" ? "selected" : ""}>${t("panel.f.vp_none")}</option>
        ${rooms.map((r) => `<option value="${esc(r.id)}" ${val === r.id ? "selected" : ""}>${esc(r.name)}</option>`).join("")}</select></div>`;
    }).join("");
    return this._sec(t("panel.f.sec_pairing"), `<input data-k="room_sensor" value="${esc(sensor)}" data-label="${t("panel.f.vp_sensor")}" placeholder="sensor.*_current_room" list="ents">
      <p class="hint">${t("panel.f.vp_hint")}</p>
      ${sensor ? `${rows}<input data-k="rm_add" data-label="${t("panel.f.vp_add")}" placeholder="${t("panel.f.vp_add_ph")}">` : `<p class="hint">${t("panel.f.vp_first")}</p>`}`, true);
  }

  // swaps plain inputs and selects for HA's ha-selector (same data-k, same set callback)
  // tile picker of the circle animations, each tile plays its animation with the card's own CSS
  // a countdown tile adds an entity field (progKey) that drives the arc; defText names the default tile, title the label above
  _fxPicker(key, value, defLabel, defFx, iconName, progKey, progValue, defText = t("panel.f.default_lc"), title = t("panel.f.fx_title"), total) {
    const tile = (v, anim, text, title) => `<button class="fxt${(value || "") === v ? " on" : ""}" data-fx="${v}" title="${esc(title)}">
      <svg viewBox="-34 -34 68 68" width="56" height="56"><g class="dev on dev-generic" data-fx="${anim}"><circle r="17" class="badge"/><circle r="17" class="ring"/><g class="fx">${FX_SVG[anim] || ""}</g><g class="icon">${iconHtml(null, 20, iconName, "glyph")}</g></g></svg>
      <span>${text}</span></button>`;
    const prog = value === "countdown" && progKey ? `<input data-k="${progKey}" value="${esc(progValue || "")}" placeholder="${t("panel.f.fx_prog_ph")}" data-label="${t("panel.f.fx_prog_label")}" list="ents">
      <input data-k="${progKey}_total" type="number" min="0" step="0.5" value="${total ?? ""}" data-label="${t("panel.f.fx_total")}">
      <p class="hint">${t("panel.f.fx_prog_hint")}</p>` : "";
    return `<label>${title}</label><div class="app fxapp" data-mode="day"><div class="fxpick" data-fx-key="${key}">${tile("", defFx, defText, defLabel)}${Object.entries(DEVICE_FX).map(([k, t]) => tile(k, k, t.split(" ")[0], t)).join("")}</div></div>${prog}`;
  }

  _nativize(side, set) {
    if (!customElements.get("ha-selector")) return;
    // colour pickers: a known value (theme colour name, default, none) becomes HA's ui_color selector; others keep the select
    side.querySelectorAll(".colorpick").forEach((box) => {
      const raw = box.dataset.value, key = box.dataset.color;
      const v = raw === "" ? "state" : raw === "none" ? "none" : raw.match(/^var\(--([a-z-]+)-color\)$/)?.[1] ?? raw;
      if (v !== "state" && v !== "none" && !UI_COLORS.has(v)) return;
      const prev = box.previousElementSibling;
      let label = t("panel.f.color");
      if (prev && (prev.tagName === "LABEL" || prev.tagName === "SPAN")) { label = prev.textContent.trim(); prev.remove(); }
      const h = document.createElement("ha-selector");
      Object.assign(h, { hass: this._hass, selector: { ui_color: { include_state: true, include_none: box.hasAttribute("data-none"), default_color: "state" } }, label, value: v, required: false });
      h.dataset.k = key;
      h.addEventListener("value-changed", (e) => {
        e.stopPropagation();
        const nv = e.detail.value, same = nv === h.value;
        h.value = nv;
        if (!same) set(key, !nv || nv === "state" ? "" : nv, h);
      });
      box.replaceWith(h);
    });
    side.querySelectorAll("[data-k]").forEach((el) => {
      const tag = el.tagName, type = tag === "INPUT" ? el.getAttribute("type") || "text" : "";
      if (tag !== "SELECT" && !(tag === "INPUT" && ["text", "number", "checkbox"].includes(type))) return;
      // rule icons get the HA icon picker in _bind
      if (el.closest(".icon-row, .colorpick") || el.dataset.k.endsWith(":icon")) return;
      const k = el.dataset.k;
      let label = el.placeholder || "", selector, value, typed = false;
      const chk = type === "checkbox" ? el.closest("label.chk") : null, prev = el.previousElementSibling;
      if (chk) label = chk.textContent.trim();
      else if ((prev?.tagName === "LABEL" && !prev.classList.contains("chk")) || (prev?.tagName === "SPAN" && el.closest(".outc"))) { label = prev.textContent.trim(); prev.remove(); }
      if (el.dataset.label) label = el.dataset.label;
      // a long "Name (explanation)" label overflows the field: the explanation goes to the helper line below
      let helper;
      const m = label.length > 30 && label.match(/^(.+?)\s*\((.+)\)$/s);
      if (m) [, label, helper] = m;
      if (tag === "SELECT") {
        // data-search: a long list gets HA's picker with a search box
        selector = { select: { mode: "dropdown", custom_value: el.hasAttribute("data-search"), options: [...el.options].map((o) => ({ value: o.value === "" ? DEF : o.value, label: o.textContent.trim() })) } };
        value = el.value === "" ? DEF : el.value;
      } else if (el.getAttribute("list") === "ents") { selector = { entity: {} }; value = el.value || undefined; }
      else if (type === "number") {
        const n = { mode: "box", step: Number(el.step) || "any" };
        if (el.hasAttribute("min")) n.min = Number(el.min);
        if (el.hasAttribute("max")) n.max = Number(el.max);
        selector = { number: n }; value = el.value === "" ? undefined : Number(el.value); typed = true;
      } else if (type === "checkbox") { selector = { boolean: {} }; value = el.checked; }
      else { selector = { text: {} }; value = el.value; typed = true; }
      const h = document.createElement("ha-selector");
      // a select has no required star: the clear ✕ gives "" (norm turns DEF/undefined into "")
      Object.assign(h, { hass: this._hass, selector, value, label, required: false });
      if (helper) h.helper = helper;
      if (tag === "INPUT" && type === "text") h.placeholder = el.placeholder;
      h.dataset.k = k;
      if (el.closest("fieldset[disabled]")) h.disabled = true;
      const norm = (v) => (type === "checkbox" ? !!v : v === DEF ? "" : String(v ?? ""));
      let last = norm(value), pending; // last: what the typed field committed
      if (typed) {
        // a re-render after every keystroke would steal the focus: commit on blur or Enter
        h.addEventListener("value-changed", (e) => { e.stopPropagation(); h.value = e.detail.value; const v = norm(e.detail.value); pending = v === last ? undefined : v; });
        const commit = () => { if (pending === undefined) return; last = pending; pending = undefined; set(k, last, h); };
        h.addEventListener("focusout", commit);
        h.addEventListener("keydown", (e) => { if (e.key === "Enter") commit(); });
      } else {
        // h.value follows the pick (other code reads it back, e.g. the room badge checkboxes); compared to it, not to a stale copy
        h.addEventListener("value-changed", (e) => { e.stopPropagation(); const v = norm(e.detail.value), same = v === norm(h.value); h.value = e.detail.value; if (!same) set(k, v, h); });
      }
      (chk || el).replaceWith(h);
      if (selector.select?.custom_value) this._nameSearchPick(h, selector.select.options);
    });
    // buttons: icon buttons for data-icon, otherwise ha-button; data-a clicks are bound by _bind afterwards
    if (!customElements.get("ha-button")) return;
    side.querySelectorAll("button").forEach((b) => {
      if (b.closest(".fxpick, .cmode")) return;
      const text = b.textContent.trim(), icon = b.dataset.icon;
      let n;
      if (icon) {
        if (!customElements.get("ha-icon-button")) return;
        n = document.createElement("ha-icon-button");
        n.label = b.title || text;
        n.innerHTML = `<ha-icon icon="${esc(icon)}"></ha-icon>`;
      } else {
        n = document.createElement("ha-button");
        n.setAttribute("appearance", b.classList.contains("mini") && !b.classList.contains("on") ? "plain" : "filled");
        n.setAttribute("size", "small");
        if (b.classList.contains("del")) n.setAttribute("variant", "danger");
        n.textContent = text;
      }
      if (b.dataset.a) n.dataset.a = b.dataset.a;
      if (b.title) n.title = b.title;
      if (b.className) n.className = b.className;
      if (b.getAttribute("style")) n.setAttribute("style", b.getAttribute("style"));
      n.toggleAttribute("disabled", b.disabled);
      b.replaceWith(n);
    });
  }

  _bind(side, set, act) {
    this._nativize(side, set);
    // rule icons: HA's icon picker with its list and search (typing "none" still works)
    if (customElements.get("ha-icon-picker")) side.querySelectorAll('input[data-k$=":icon"]').forEach((inp) => {
      const pick = document.createElement("ha-icon-picker");
      Object.assign(pick, { hass: this._hass, value: inp.value, label: t("panel.f.icon"), helper: t("panel.f.icon_helper_item") });
      pick.dataset.k = inp.dataset.k;
      // HA 2026.9: the choice is only announced by the picker's inner combo box, so it is caught on the way down
      pick.addEventListener("value-changed", (e) => set(inp.dataset.k, e.detail?.value || "", pick), true);
      inp.replaceWith(pick);
    });
    // the rules YAML gets HA's own code editor (syntax colours, entity completion); commits on blur
    const ta = side.querySelector('textarea[data-k="rules_yaml"], textarea[data-k^="rule_yaml:"]');
    if (ta && customElements.get("ha-code-editor")) {
      const ed = document.createElement("ha-code-editor");
      Object.assign(ed, { hass: this._hass, mode: "yaml", linewrap: true, autocompleteEntities: true, autocompleteIcons: true });
      ed.dataset.k = ta.dataset.k;
      ed.addEventListener("focusout", () => ed.dispatchEvent(new Event("change")));
      ta.replaceWith(ed);
    }
    if (customElements.get("ha-code-editor")) side.querySelectorAll("textarea[data-jinja]").forEach((t) => {
      const ed = document.createElement("ha-code-editor");
      Object.assign(ed, { hass: this._hass, mode: "jinja2", linewrap: true, autocompleteEntities: true, value: t.value });
      ed.dataset.k = t.dataset.k;
      ed.addEventListener("focusout", () => ed.dispatchEvent(new Event("change")));
      t.replaceWith(ed);
    });
    side.querySelectorAll(".fxpick .fxt").forEach((b) => b.addEventListener("click", () => set(b.closest(".fxpick").dataset.fxKey, b.dataset.fx, b)));
    side.querySelectorAll("[data-sec]").forEach((el) => {
      const rec = (open) => ((this._secOpen ||= {})[el.dataset.sec] = open);
      if (el.localName === "details") el.addEventListener("toggle", () => rec(el.open));
      else el.addEventListener("expanded-changed", (e) => rec(e.detail.expanded));
    });
    // not the icon picker: the change of its search box bubbles out of it and would reset the choice
    side.querySelectorAll("[data-k]:not(ha-selector):not(ha-icon-picker)").forEach((inp) => inp.addEventListener("change", () => set(inp.dataset.k, inp.type === "checkbox" ? inp.checked : inp.value, inp)));
    side.querySelectorAll("[data-a]").forEach((btn) => btn.addEventListener("click", () => act(btn.dataset.a)));
  }

  // what the shared fields need after the html is in place: the HA icon picker and the YAML text of the rules
  _afterForm(side) {
    const inp = side.querySelector('input[data-k="icon"]');
    if (inp && customElements.get("ha-icon-picker")) {
      const pick = document.createElement("ha-icon-picker");
      pick.hass = this._hass;
      pick.value = inp.value;
      Object.assign(pick, { label: t("panel.f.icon"), placeholder: inp.placeholder, helper: t("panel.f.icon_helper_default") });
      pick.addEventListener("value-changed", (e) => this._set("icon", e.detail?.value || ""), true);
      // the default of a generic item is its entity's own icon: show that one in the empty picker
      const o = this._get(), so = o && !o.icon && o.kind === "generic" && this._hass.states[o.entity];
      if (so) { pick.placeholder = so.attributes.icon || ""; resolveIcon(null, so, this._hass).then((x) => x && (pick.fallbackPath = x)); }
      // the picker has its own label, preview and clear button
      const row = inp.closest(".icon-row"), lab = row?.previousElementSibling;
      if (lab?.tagName === "LABEL") lab.remove();
      row?.querySelector(":scope > ha-icon")?.remove();
      row?.querySelector('[data-a="icon-reset"]')?.remove();
      inp.replaceWith(pick);
    }
    const one = side.querySelector('[data-k^="rule_yaml:"]'), rule = one && this._targets()[0]?.rules?.[Number(one.dataset.k.split(":")[1])];
    if (one) this._hass.callWS({ type: "fns_floorplan/yaml/dump", data: rule || {} }).then((r) => (one.value = r.text), () => (one.value = JSON.stringify(rule || {}, null, 1)));
    const ta = side.querySelector('[data-k="rules_yaml"]');
    if (ta && this._aiDraft != null && this._aiFor === this._targets()[0]) ta.value = this._aiDraft;
    else if (ta) {
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
    side.innerHTML = `<h2>${t("panel.f.multi_title", { n: this._multi.length })}</h2>
      <p class="hint">${t("panel.f.multi_hint")} ${one ? t("panel.f.multi_group_one") : t("panel.f.multi_group_none")}</p>
      <div class="actions">${one ? "" : `<button data-a="group">${t("panel.f.group")}</button>`}${[...groups].some(Boolean) ? `<button data-a="ungroup">${t("panel.f.ungroup")}</button>` : ""}<button data-a="mdel" class="del">${t("panel.f.delete")}</button></div>`;
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
    if (o.icon === "none") return `<label>${t("panel.f.icon")}</label><div class="icon-row"><span class="hint" style="flex:1">${t("panel.f.icon_none_state")}</span><button class="mini" data-a="icon-reset">${t("panel.f.icon_restore")}</button></div>`;
    return `<label>${t("panel.f.icon_label")}</label><div class="icon-row"><ha-icon icon="${esc(o.icon || def)}"></ha-icon>
      <input data-k="icon" value="${esc(o.icon || "")}" placeholder="${esc(def || "mdi:…")}">${o.icon ? `<button class="mini" data-a="icon-reset" data-icon="mdi:restore" title="${t("panel.f.icon_default_title")}">✕</button>` : ""}
      <button class="mini" data-a="icon-none" data-icon="mdi:eye-off-outline" title="${t("panel.f.icon_none_btn")}">${t("panel.f.icon_none_btn")}</button></div>`;
  }

  // quick placement inside the item's room: corners, sides, middle
  _placeField() {
    const PLACE_ICONS = { tl: "mdi:arrow-top-left", t: "mdi:arrow-up", tr: "mdi:arrow-top-right", l: "mdi:arrow-left", c: "mdi:circle-small", r: "mdi:arrow-right", bl: "mdi:arrow-bottom-left", b: "mdi:arrow-down", br: "mdi:arrow-bottom-right" };
    const cells = [["tl", "↖"], ["t", "↑"], ["tr", "↗"], ["l", "←"], ["c", "•"], ["r", "→"], ["bl", "↙"], ["b", "↓"], ["br", "↘"]];
    return `<label>${t("panel.f.place_label")}</label><div class="place">${cells.map(([k, g]) => `<button data-a="place:${k}" data-icon="${PLACE_ICONS[k]}" title="${k === "c" ? t("panel.f.place_center") : t("panel.f.place_edge")}">${g}</button>`).join("")}</div>`;
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
    return `<label>${t("panel.f.size")}</label><select data-k="size">${Object.entries(SIZE_NAMES).map(([k, v]) => `<option value="${k}" ${(o.size || "") === k ? "selected" : ""}>${v}</option>`).join("")}</select>`;
  }

  _layerField() {
    return `<label>${t("panel.f.layer")}</label><div class="layers">
      <button data-a="layer:top" data-icon="mdi:arrange-bring-to-front" title="${t("panel.f.to_front")}">${t("panel.f.to_front")}</button><button data-a="layer:bottom" data-icon="mdi:arrange-send-to-back" title="${t("panel.f.to_back")}">${t("panel.f.to_back")}</button></div>`;
  }

  // a colour: one of the named colours or any picked one; `none` offers a transparent background
  _colorPick(key, value, none = false) {
    const custom = value && !COLORS[value] && value !== "none";
    return `<div class="outc colorpick" style="margin-top:0" data-color="${key}" data-value="${esc(value || "")}" ${none ? "data-none" : ""}><select data-k="${key}">
      <option value="">${t("panel.f.default")}</option>${none ? `<option value="none" ${value === "none" ? "selected" : ""}>${t("panel.f.none")}</option>` : ""}
      ${Object.entries(COLOR_NAMES).map(([k, v]) => `<option value="${k}" ${value === k ? "selected" : ""}>${v}</option>`).join("")}
      <option value="custom" ${custom ? "selected" : ""}>${t("panel.f.custom")}</option></select>
      <input type="color" data-k="${key}" value="${custom ? esc(value) : "#ff0000"}" ${custom ? "" : "hidden"}></div>`;
  }

  // tap, double tap and hold: default (as the card does it) or an action of choice
  _actionsUI(o, defaults) {
    const rows = Object.entries(ACTION_KEYS).map(([k, label]) => {
      const a = o[k + "_action"] || {};
      const cur = a.action || "";
      const def = defaults[k] ? t("panel.f.def_x", { x: defaults[k] }) : t("panel.f.def_nothing");
      let more = "";
      if (cur === "perform-action") {
        // every action HA knows, searchable; an unknown one (integration not loaded) stays selectable, and one can still be typed
        const now = a.perform_action || a.service || "";
        const svc = Object.entries(this._hass.services || {}).flatMap(([d, list]) => Object.keys(list).map((x) => `${d}.${x}`)).sort();
        if (now && !svc.includes(now)) svc.unshift(now);
        more = `<select data-k="act:${k}:perform_action" data-search data-label="${t("panel.f.act_service")}"><option value="">—</option>${svc.map((x) => `<option value="${esc(x)}" ${x === now ? "selected" : ""}>${esc(x)}</option>`).join("")}</select>
        <input data-k="act:${k}:data" value="${esc(a.data ? JSON.stringify(a.data) : "")}" placeholder="${t("panel.f.act_data_ph")}">`;
      } else if (cur === "navigate") more = `<input data-k="act:${k}:navigation_path" value="${esc(a.navigation_path || "")}" placeholder="/lovelace/0">`;
      else if (cur === "url") more = `<input data-k="act:${k}:url_path" value="${esc(a.url_path || "")}" placeholder="https://…">`;
      else if (cur === "more-info" || cur === "toggle") more = `<input data-k="act:${k}:entity" value="${esc(a.entity || "")}" placeholder="${t("panel.f.act_entity_ph")}" list="ents">`;
      return `<label>${label}</label><select data-k="act:${k}:action">${Object.entries(ACTIONS).map(([v, txt]) => `<option value="${v}" ${v === cur ? "selected" : ""}>${v ? txt : def}</option>`).join("")}</select>${more}`;
    }).join("");
    const set = Object.keys(ACTION_KEYS).some((k) => o[k + "_action"]);
    return this._sec(t("panel.f.actions_title"), rows, set, "Akce");
  }

  // colour rules as a form: each rule has conditions (all must hold) and what it changes; YAML for the rest
  _rulesUI(o, fields) {
    const rules = o.rules || [];
    const own = this._ownEntity(o);
    // AI suggestions need an ai_task entity that can generate data; remember the fields for the prompt
    const ai = this._aiTask(), draft = this._aiDraft != null && this._aiFor === o;
    // one rule can be open as YAML (its header button)
    const yr = this._yamlRule?.o === o ? this._yamlRule.i : null;
    this._ruleFields = fields;
    const opOf = (c) => (c.template != null ? "template" : ["state_not", "above", "below"].find((k) => c[k] != null) || "state");
    const valOf = (c, op) => (op === "template" ? c.template : [].concat(c[op] ?? "").join(", "));
    const out = (i, r) => {
      const parts = [];
      if (fields.includes("color")) parts.push(`<span>${fields.includes("background") ? "Text" : t("panel.f.color")}</span>${this._colorPick(`ro:${i}:color`, r.color)}`);
      if (fields.includes("background")) parts.push(`<span>${t("panel.f.background")}</span>${this._colorPick(`ro:${i}:background`, r.background, true)}`);
      if (fields.includes("wave") && o.kind === "radiator") parts.push(`<span>${t("panel.rule.wave")}</span>${this._colorPick(`ro:${i}:wave`, r.wave)}`);
      if (fields.includes("glow")) parts.push(`<label class="chk"><input type="checkbox" data-k="ro:${i}:glow" ${r.glow ? "checked" : ""}> ${t("panel.rule.glow")}</label>`);
      if (fields.includes("animate")) parts.push(`<select data-k="ro:${i}:animate" data-label="${t("panel.rule.anim_label")}"><option value="">${t("panel.rule.anim_state")}</option><option value="true" ${r.animate === true ? "selected" : ""}>${t("panel.rule.anim_on")}</option><option value="false" ${r.animate === false ? "selected" : ""}>${t("panel.rule.anim_off")}</option></select>`);
      if (fields.includes("fx")) parts.push(`<div style="flex:1 1 100%">${(o.kind ? this._fxPicker(`ro:${i}:fx`, r.fx, t("panel.f.fx_by_item"), o.kind === "alarm" ? "radar" : "ring", DEVICE_ICON[o.kind] || "mdiShapeOutline", `ro:${i}:progress`, r.progress, t("panel.f.fx_by_item"), t("panel.f.fx_title_rule"), r.progress_total)
        // lights, strips, the dock and furniture have no animation of their own: empty = none
        : this._fxPicker(`ro:${i}:fx`, r.fx === "none" ? "" : r.fx, t("panel.f.fx_no_anim"), "none", FURNITURE[o.type]?.[1] || "mdiShapeOutline", `ro:${i}:progress`, r.progress, t("panel.f.none_lc"), t("panel.f.fx_title_rule"), r.progress_total).replace(/<button class="fxt[^"]*" data-fx="none"[\s\S]*?<\/button>/, ""))}</div>`);
      if (fields.includes("hide")) parts.push(`<label class="chk"><input type="checkbox" data-k="ro:${i}:hide" ${r.hide ? "checked" : ""}> ${t("panel.rule.hide")}</label>`);
      if (o.points) parts.push(`<span>${t("panel.bg_opacity")}</span><input type="number" step="0.05" min="0" max="1" data-k="ro:${i}:opacity" value="${r.opacity ?? ""}" placeholder="${t("panel.rule.opacity_ph")}" style="width:70px">`);
      // the icon picker cannot take "none": a button next to it hides the icon, another brings the picker back
      if (fields.includes("icon")) parts.push(r.icon === "none"
        ? `<div class="icon-row" style="flex:1 1 100%"><span class="hint" style="flex:1">${t("panel.rule.icon_none")}</span><button class="mini" data-a="ra:icon:${i}:" data-icon="mdi:restore" title="${t("panel.rule.icon_restore_title")}">${t("panel.rule.restore")}</button></div>`
        : `<div class="icon-row" style="flex:1 1 100%"><input type="text" data-k="ro:${i}:icon" value="${esc(r.icon || "")}" placeholder="${t("panel.rule.icon_ph")}">
          <button class="mini" data-a="ra:icon:${i}:none" data-icon="mdi:eye-off-outline" title="${t("panel.f.icon_none_btn")}">${t("panel.f.icon_none_btn")}</button></div>`);
      if (fields.includes("text")) parts.push(`<input type="text" data-k="ro:${i}:text" value="${esc(r.text || "")}" placeholder="${t("panel.rule.text_ph")}">`);
      return `<div class="outc">${parts.join("")}</div>`;
    };
    const list = rules.map((r, i) => {
      const conds = [].concat(r.if || []);
      const simple = conds.every((c) => !c.any);
      // the condition is either the entity form or one Jinja template (and / or / anything), true = the settings below apply
      const tplMode = conds.length === 1 && conds[0].template != null;
      const mode = `<div class="cmode"><button class="${tplMode ? "" : "on"}" data-a="ra:cmode:${i}:form">${t("panel.rule.by_entities")}</button><button class="${tplMode ? "on" : ""}" data-a="ra:cmode:${i}:tpl">${t("panel.rule.jinja")}</button></div>`;
      const tplUI = `<textarea data-k="rc:${i}:0:value" data-jinja spellcheck="false" placeholder="{{ is_state('vacuum.x', 'cleaning') and states('sensor.y') | float(0) > 20 }}">${esc(conds[0]?.template || "")}</textarea>
        <p class="hint">${t("panel.rule.tpl_hint")}</p>`;
      // "+ condition" sits in the footer of the last condition, next to its delete icon
      const addCond = `<button data-a="ra:cadd:${i}" class="mini">${t("panel.rule.add_cond")}</button>`;
      return `<div class="rule"><div class="rule-h"><span>${t("panel.rule.n", { n: i + 1 })}</span>
          <button data-a="ra:up:${i}" data-icon="mdi:arrow-up" title="${t("panel.rule.up")}" ${i ? "" : "disabled"}>↑</button><button data-a="ra:down:${i}" data-icon="mdi:arrow-down" title="${t("panel.rule.down")}" ${i < rules.length - 1 ? "" : "disabled"}>↓</button><button data-a="ra:ryaml:${i}" data-icon="${yr === i ? "mdi:form-select" : "mdi:code-braces"}" title="${yr === i ? t("panel.rule.back_form") : t("panel.rule.edit_yaml")}">YAML</button><button data-a="ra:del:${i}" data-icon="mdi:delete" title="${t("panel.rule.delete")}">✕</button></div>
        ${yr === i ? `<textarea data-k="rule_yaml:${i}" spellcheck="false">${t("panel.rule.loading")}</textarea>` : `${mode}${tplMode ? tplUI : simple ? conds.map((c, j) => {
          const op = opOf(c);
          return `<div class="cond">${op === "template" ? "" : `<input data-k="rc:${i}:${j}:entity" value="${esc(c.entity || "")}" placeholder="${t("panel.rule.entity_ph")}" data-label="${t("panel.f.entity")}" list="ents">
              ${own && c.entity !== own ? `<button class="mini wide" data-a="ra:self:${i}:${j}" title="${esc(own)}">${t("panel.rule.self")}</button>` : ""}
              <input data-k="rc:${i}:${j}:attribute" value="${esc(c.attribute || "")}" placeholder="${t("panel.rule.attr_ph")}" data-label="${t("panel.rule.attr")}">`}
            <select data-k="rc:${i}:${j}:op" data-label="${t("panel.rule.cond")}">${Object.entries(OPS).map(([k, v]) => `<option value="${k}" ${k === op ? "selected" : ""}>${v}</option>`).join("")}</select>
            <input data-k="rc:${i}:${j}:value" value="${esc(valOf(c, op))}" placeholder="${op === "template" ? "{{ is_state('timer.x', 'active') }}" : op === "state" || op === "state_not" ? "on, open" : "20"}" data-label="${t("panel.rule.value")}" ${op === "template" ? 'class="wide"' : ""}>
            <div class="cond-foot">${j === conds.length - 1 ? addCond : ""}<span class="sp"></span><button data-a="ra:cdel:${i}:${j}" data-icon="mdi:delete-outline" title="${t("panel.rule.del_cond")}">✕</button></div></div>`;
        }).join("") + (conds.length ? "" : `<div class="cond-foot">${addCond}<span class="hint">${t("panel.rule.no_cond")}</span></div>`)
          : `<p class="hint">${t("panel.rule.any_hint")}</p>`}
        ${out(i, r)}`}</div>`;
    }).join("");
    return this._sec(`${t("panel.rule.head")}${fields.includes("icon") ? t("panel.rule.head_icon") : ""}${rules.length ? ` (${rules.length})` : ""}`, `
      <p class="hint">${t("panel.rule.intro")}</p>${list}
      <div class="actions"><button data-a="ra:add">${t("panel.rule.add")}</button>${ai ? `<button data-a="ra:ai">${this._ai ? t("panel.rule.ai_hide") : t("panel.rule.ai_suggest_btn")}</button>` : ""}</div>
      ${ai && this._ai ? `<div class="ai-ask"><input data-k="rules_ai" value="${esc(this._aiText || "")}" data-label="${t("panel.rule.ai_ask")}" placeholder="${t("panel.rule.ai_ph")}">
        <div class="actions"><button data-a="ra:aigo" ${this._aiBusy ? "disabled" : ""}>${this._aiBusy ? t("panel.rule.ai_thinking") : t("panel.rule.ai_go")}</button></div></div>
        ${this._aiErr ? `<p class="hint err">${esc(this._aiErr)}</p>` : ""}` : ""}
      ${draft ? `<p class="hint">${t("panel.rule.ai_draft", { ai: esc(ai) })}</p>` : ""}
      ${draft ? `<textarea data-k="rules_yaml" spellcheck="false" placeholder="- if:\n    - entity: binary_sensor.x\n      state: \"on\"\n  color: red">${t("panel.rule.loading")}</textarea>` : ""}
      ${draft ? `<div class="actions"><button data-a="ra:aiok">${t("panel.rule.ai_apply")}</button><button data-a="ra:aino">${t("panel.revert_short")}</button></div>` : ""}`, rules.length > 0 || draft, "Pravidla");
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
    if (key === "rules_ai") { this._aiText = value; return true; }
    // while an AI draft is open, the editor edits the draft, not the rules
    if (key === "rules_yaml" && this._aiDraft != null && this._aiFor === first) { this._aiDraft = value; return true; }
    if (key.startsWith("rule_yaml:")) {
      // one rule as YAML: a mapping (a one-item list is taken too)
      let data = await parseYaml(value).catch(() => undefined);
      if (Array.isArray(data) && data.length === 1) data = data[0];
      if (!data || typeof data !== "object" || Array.isArray(data)) { inp?.classList.add("bad"); return true; }
      const n = Number(key.split(":")[1]);
      for (const t of targets) if (t.rules?.[n]) t.rules[n] = JSON.parse(JSON.stringify(data));
      this._changed();
      return true;
    }
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
        : b === "opacity" || b === "progress_total" ? (value === "" ? undefined : Number(String(value).replace(",", ".")) || undefined) : b === "color" || b === "background" || b === "wave" ? color(value) : value;
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
    if (op === "ryaml") { const n = Number(i); this._yamlRule = this._yamlRule?.o === targets[0] && this._yamlRule.i === n ? null : { o: targets[0], i: n }; return this._form(); }
    if (op === "ai") { this._ai = !this._ai; this._aiErr = ""; return this._form(); }
    if (op === "aigo") return this._aiSuggest(targets);
    if (op === "aino") { this._aiDraft = null; return this._form(); }
    if (op === "aiok") return this._aiApply(targets);
    const rules = JSON.parse(JSON.stringify(targets[0].rules || []));
    const n = Number(i), own = this._ownEntity(targets[0]);
    if (op === "self") { const c = [].concat(rules[n].if || []); c[Number(j)] = { ...c[Number(j)], entity: own }; rules[n].if = c; }
    else if (op === "add") rules.push({ if: [{ entity: own, state: "on" }] });
    else if (op === "del") rules.splice(n, 1);
    else if (op === "up" && n > 0) [rules[n - 1], rules[n]] = [rules[n], rules[n - 1]];
    else if (op === "down" && n < rules.length - 1) [rules[n + 1], rules[n]] = [rules[n], rules[n + 1]];
    else if (op === "cadd") rules[n].if = [...[].concat(rules[n].if || []), { entity: own, state: "on" }];
    else if (op === "icon") { if (j) rules[n].icon = j; else delete rules[n].icon; }
    else if (op === "cmode") {
      const c = [].concat(rules[n].if || []);
      if (j === "tpl" && !(c.length === 1 && c[0].template != null)) rules[n].if = [{ template: toJinja(c) }];
      else if (j === "form" && c.length === 1 && c[0].template != null) rules[n].if = [{ entity: own, state: "on" }];
      else return;
    } else if (op === "cdel") { const c = [].concat(rules[n].if || []); c.splice(Number(j), 1); if (c.length) rules[n].if = c; else delete rules[n].if; }
    for (const t of targets) if (rules.length) t.rules = JSON.parse(JSON.stringify(rules)); else delete t.rules;
    this._changed();
  }

  // the first ai_task entity that can generate data
  _aiTask() {
    return Object.keys(this._hass.states).find((e) => e.startsWith("ai_task.") && this._hass.states[e].attributes.supported_features & 1) || "";
  }

  // ask HA's AI Task for rules from a plain-language request; the answer opens as a draft in the YAML editor
  async _aiSuggest(targets) {
    const ask = (this._aiText || "").trim();
    if (!ask) { this._aiErr = t("panel.rule.ai_empty"); return this._form(); }
    const o = targets[0], fields = this._ruleFields || [], hass = this._hass;
    const own = this._ownEntity(o), so = hass.states[own];
    const OUT = { color: "color: colour of the item (or its text when background is allowed)", background: "background: badge background colour",
      wave: "wave: colour of radiator heat waves", glow: "glow: true = glowing", animate: "animate: true / false = force animation on / off",
      fx: `fx: ring animation, one of ${Object.keys(DEVICE_FX).join(", ")}`, hide: "hide: true = hide the item",
      icon: 'icon: "mdi:name" ("none" = no icon)', text: "text: label text, may be a Jinja template {{ }}" };
    const outs = fields.filter((f) => OUT[f]).map((f) => "  - " + OUT[f]);
    if (fields.includes("fx")) outs.push("  - progress: entity with remaining time or percent, for fx: countdown");
    if (o.points) outs.push("  - opacity: 0..1 fill opacity");
    const skip = /^(update|event|image|button|scene|script|automation|zone|tts|stt|wake_word|conversation|ai_task|todo|calendar|tag|notify)\./;
    const ents = Object.values(hass.states).filter((s) => !skip.test(s.entity_id)).slice(0, 1500)
      .map((s) => `${s.entity_id}: ${s.attributes.friendly_name || ""}`).join("\n");
    const cur = o.rules?.length ? (await hass.callWS({ type: "fns_floorplan/yaml/dump", data: o.rules }).catch(() => ({ text: JSON.stringify(o.rules) }))).text : "(none)";
    const instructions = `You write display rules for one item of a Home Assistant floor plan card.
Answer with ONLY a YAML list of rules: no prose, no code fences.

Rule format:
- if:                          # all conditions must hold; leave "if" out for a rule that always applies
    - entity: binary_sensor.x  # entity id
      attribute: hvac_action   # optional; without it the state is compared
      state: "on"              # or a list of states; instead of state use state_not, above or below (numbers)
    - template: "{{ is_state('timer.x', 'active') }}"   # a Jinja condition instead of entity
  <outputs>

Outputs allowed for this item:
${outs.join("\n")}
For each output the first rule whose conditions hold wins, so put specific rules first.
Colours are Home Assistant colour names (${[...UI_COLORS].join(", ")}) or "#rrggbb". Quote states like "on" and "off".
Keep the current rules unless the request says to change them; return the whole new list.
If the request cannot be done with these outputs or entities, answer with one short sentence in the request's language instead of YAML.

Item: ${o.kind || o.type || "room"}${o.name ? ` "${o.name}"` : ""}
Own entity: ${own || "(none)"}${so ? `, state "${so.state}", attributes ${JSON.stringify(so.attributes).slice(0, 2000)}` : ""}
Current rules:
${cur}

Entities (id: name):
${ents}

Request (may be in Czech): ${ask}`;
    this._aiBusy = true; this._aiErr = ""; this._form();
    try {
      const r = await hass.callWS({ type: "call_service", domain: "ai_task", service: "generate_data", return_response: true,
        service_data: { task_name: "FNS Floorplan rules", entity_id: this._aiTask(), instructions } });
      const text = String(r.response?.data ?? "").replace(/^\s*```\w*\n?/, "").replace(/```\s*$/, "").trim();
      let data = (await hass.callWS({ type: "fns_floorplan/yaml/parse", text })).data;
      if (data && typeof data === "object" && !Array.isArray(data)) data = [data];
      // no list = the AI explains why it can't do it; show that as it is
      if (!Array.isArray(data)) this._aiErr = t("panel.rule.ai_answer", { text: typeof data === "string" ? data : t("panel.rule.ai_no_list") });
      else { this._aiDraft = Array.isArray(data) && !text.trimStart().startsWith("-") ? (await hass.callWS({ type: "fns_floorplan/yaml/dump", data })).text : text; this._aiFor = o; }
    } catch (err) { this._aiErr = t("panel.rule.ai_failed", { err: err.message || err }); }
    this._aiBusy = false;
    this._form();
  }

  // the checked draft replaces the item's rules
  async _aiApply(targets) {
    let data;
    try { data = (await this._hass.callWS({ type: "fns_floorplan/yaml/parse", text: this._aiDraft })).data; }
    catch (err) { this._aiErr = t("panel.rule.yaml_error", { err: err.message || err }); return this._form(); }
    if (data && typeof data === "object" && !Array.isArray(data)) data = [data];
    if (!Array.isArray(data)) { this._aiErr = t("panel.rule.must_list"); return this._form(); }
    for (const t of targets) if (data.length) t.rules = JSON.parse(JSON.stringify(data)); else delete t.rules;
    this._aiDraft = null; this._aiErr = "";
    this._changed();
  }

  // Look tab: a real card with the unsaved plan replaces the editing canvas
  _lookPreview() {
    const main = this.shadowRoot.querySelector(".main"), stage = this.shadowRoot.querySelector(".stage");
    const on = this._mode === "look";
    main?.classList.toggle("look", on);
    let card = stage?.querySelector(".look-card");
    if (!on || !stage) return card?.remove();
    if (!customElements.get("fns-floorplan-card")) return;
    if (!card) { card = document.createElement("fns-floorplan-card"); card.className = "look-card"; stage.appendChild(card); }
    card.setConfig({ type: "custom:fns-floorplan-card", mode: this._lookMode || "night", level: this._level });
    card.previewPlan(JSON.parse(JSON.stringify(this._plan)), this._hass);
  }

  _lookForm(side) {
    const style = this._plan.style || {};
    const css = getComputedStyle(this), varHex = (n, fb) => { const v = css.getPropertyValue(n).trim(); return /^#[0-9a-f]{6}$/i.test(v) ? v : fb; };
    const primary = varHex("--primary-color", "#03a9f4");
    const rows = [
      ["panel.look.walls", [["wall_day", "panel.look.wall_day", primary], ["wall_night", "panel.look.wall_night", primary],
        ["floor_day", "panel.look.floor_day", "#ffffff"], ["floor_night", "panel.look.floor_night", "#141b33"],
        ["text_day", "panel.look.text_day", "#1b1f3b"], ["text_night", "panel.look.text_night", "#e8ebff"]]],
      ["panel.look.states", [["accent", "panel.look.accent", primary], ["lamp", "panel.look.lamp", varHex("--state-light-active-color", "#ffd9a0")],
        ["open", "panel.look.open", varHex("--state-binary_sensor-active-color", "#ffb02e")],
        ["alarm", "panel.look.alarm", varHex("--state-alarm_control_panel-triggered-color", "#ff4d6d")],
        ["blind", "panel.look.blind", varHex("--state-cover-closed-color", primary)],
        ["cold", "panel.look.cold", "#60a5fa"], ["hot", "panel.look.hot", "#fb923c"]]],
    ];
    const mode = this._lookMode || "night";
    side.innerHTML = `<h2>${t("panel.look.title")}</h2><p class="hint">${t("panel.look.hint")}</p>
      <div class="rot"><button data-look-mode="day" class="${mode === "day" ? "on" : ""}">${t("panel.look.preview_day")}</button><button data-look-mode="night" class="${mode === "night" ? "on" : ""}">${t("panel.look.preview_night")}</button></div>
      ${rows.map(([title, list]) => `<h3>${t(title)}</h3>${list.map(([k, label, def]) => `<div class="look-row"><span>${t(label)}</span>
        <input type="color" data-look="${k}" value="${esc(style[k] || def)}" class="${style[k] ? "" : "def"}">
        <ha-icon-button class="mini" data-look-reset="${k}" label="${t("panel.look.reset_one")}" ${style[k] ? "" : "disabled"}><ha-icon icon="mdi:restore"></ha-icon></ha-icon-button></div>`).join("")}`).join("")}
      <div class="actions"><button data-a="look-reset">${t("panel.look.reset_all")}</button></div>`;
    const set = (k, v) => {
      const s = { ...(this._plan.style || {}) };
      if (v) s[k] = v; else delete s[k];
      if (Object.keys(s).length) this._plan.style = s; else delete this._plan.style;
      this._changed();
    };
    side.querySelectorAll("input[data-look]").forEach((i) => i.addEventListener("change", () => set(i.dataset.look, i.value)));
    side.querySelectorAll("[data-look-reset]").forEach((b) => b.addEventListener("click", () => set(b.dataset.lookReset, "")));
    side.querySelector('[data-a="look-reset"]').addEventListener("click", () => { delete this._plan.style; this._changed(); });
    side.querySelectorAll("[data-look-mode]").forEach((b) => b.addEventListener("click", () => { this._lookMode = b.dataset.lookMode; this._form(); }));
  }

  _roomForm(side, r) {
    const v = this._sel.v;
    const walls = r.points.map((_, k) => { const e = edgeOf(r, k); return `<option value="${k}">${t("panel.room.wall", { n: k + 1, side: SIDE(e.u), len: e.L.toFixed(2).replace(".", ",") })}</option>`; }).join("");
    const info = r.label_info ?? ["temperature", "humidity"];
    const extra = info.filter((k) => k !== "temperature" && k !== "humidity");
    side.innerHTML = `<h2>${t("panel.room")}</h2>
      <label>${t("panel.f.name")}</label><input data-k="name" value="${esc(r.name)}">
      <input type="text" data-k="r:icon" value="${esc(r.icon || "")}" placeholder="${t("panel.room.icon_ph")}">
      <label>${t("panel.room.temp")}</label><input data-k="temperature" value="${esc(r.temperature || "")}" list="ents">
      <label>${t("panel.room.hum")}</label><input data-k="humidity" value="${esc(r.humidity || "")}" list="ents">
      ${this._sec(t("panel.room.badge_sec"), `<label class="chk"><input type="checkbox" data-k="label_show" ${r.label_hidden ? "" : "checked"}> ${t("panel.room.show_badge")}</label>
        <fieldset class="badge-opts" ${r.label_hidden ? "disabled" : ""}>
        <label class="chk"><input type="checkbox" data-k="label_name" ${r.label_name === false ? "" : "checked"}> ${t("panel.room.show_name")}</label>
        <label class="chk"><input type="checkbox" data-k="label_t" ${info.includes("temperature") ? "checked" : ""}> ${t("panel.room.show_temp")}</label>
        <label class="chk"><input type="checkbox" data-k="label_h" ${info.includes("humidity") ? "checked" : ""}> ${t("panel.room.show_hum")}</label>
        <label>${t("panel.room.extra")}</label>
        <textarea data-k="label_extra" spellcheck="false" style="min-height:60px" placeholder="sensor.co2_obyvak">${esc(extra.join("\n"))}</textarea>
        </fieldset>`, true)}
      ${v != null ? `<div class="row2"><div><label>${t("panel.room.corner", { n: v + 1 })}</label><input data-k="vx" type="number" step="0.05" value="${r.points[v][0]}"></div><div><label>Z (m)</label><input data-k="vz" type="number" step="0.05" value="${r.points[v][1]}"></div></div>
        <div class="actions"><button data-a="delv" ${r.points.length <= 3 ? "disabled" : ""}>${t("panel.room.del_corner", { n: v + 1 })}</button></div>` : `<p class="hint">${t("panel.room.corners", { n: r.points.length })}</p>`}
      <label>${t("panel.room.sheet_extra")}</label>
      <textarea data-k="sheet_extra" spellcheck="false" style="min-height:60px" placeholder="switch.zasuvka_pracovna">${esc((r.sheet_extra || []).join("\n"))}</textarea><p class="hint">${t("panel.room.lists_hint")}</p>
      <label>${t("panel.room.add_wall")}</label><select data-k="wall">${walls}</select>
      <div class="actions"><button data-a="adddoor">${t("panel.room.add_door")}</button><button data-a="addwin">${t("panel.room.add_win")}</button></div>
      ${this._rulesUI(r, ["color", "glow", "hide"]).replace(t("panel.rule.head"), t("panel.rule.head_room"))}
      <div class="actions"><button data-a="delroom" class="del">${t("panel.room.delete")}</button></div>`;
    // an entity picker under each list: the pick is added as a new line (templates are still typed)
    if (customElements.get("ha-selector")) side.querySelectorAll('textarea[data-k="label_extra"], textarea[data-k="sheet_extra"]').forEach((ta) => {
      const pick = document.createElement("ha-selector");
      Object.assign(pick, { hass: this._hass, selector: { entity: {} }, placeholder: t("panel.room.add_entity"), required: false, disabled: !!ta.closest("fieldset[disabled]") });
      pick.addEventListener("value-changed", (e) => {
        e.stopPropagation();
        const id = e.detail?.value;
        if (!id) return;
        ta.value = [...ta.value.split("\n").map((x) => x.trim()).filter(Boolean), id].join("\n");
        ta.dispatchEvent(new Event("change"));
      }, true);
      ta.after(pick);
    });
    this._bind(side, async (k, val, inp) => {
      if (await this._setShared([r], k, val, inp)) return;
      if (k === "wall") return (this._wall = Number(val));
      if (k === "r:icon") { if (val) r.icon = val; else delete r.icon; return this._changed(); }
      if (k === "vx" || k === "vz") r.points[v][k === "vx" ? 0 : 1] = r3(Math.max(0, Number(val)));
      else if (k === "sheet_extra") { const list = entries(val); if (list.length) r.sheet_extra = list; else delete r.sheet_extra; }
      else if (k === "label_show") { if (val) delete r.label_hidden; else r.label_hidden = true; }
      else if (k === "label_name") { if (val) delete r.label_name; else r.label_name = false; }
      else if (k === "label_t" || k === "label_h" || k === "label_extra") {
        const q = (x) => side.querySelector(`[data-k="${x}"]`);
        const on = (x) => { const n = q(x); return n.localName === "ha-selector" ? !!n.value : n.checked; }; // checkbox or its ha-selector twin
        const list = [...(on("label_t") ? ["temperature"] : []), ...(on("label_h") ? ["humidity"] : []),
          ...entries(q("label_extra").value)];
        if (list.join() === "temperature,humidity") delete r.label_info; else r.label_info = list;
      } else r[k] = k === "name" ? val : val || null;
      this._changed();
    }, (a) => {
      if (a.startsWith("ra:")) return this._ruleAction([r], a);
      if (a === "delv") { this._removeCorner(r, v); this._sel = { cat: "rooms", i: this._sel.i }; }
      else if (a === "delroom") {
        if (!confirm(t("panel.room.delete_confirm", { name: r.name }))) return;
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
    side.innerHTML = `<h2>${win ? t("panel.window") : t("panel.door")}</h2><p class="hint">${t("panel.open.intro", { room: esc(r?.name || ""), n: o.edge + 1, len: L.toFixed(2).replace(".", ",") })}</p>
      <label>${t("panel.f.kind")}</label><select data-k="type">${opt("door", t("panel.door"), o.type)}${opt("window", t("panel.window"), o.type)}</select>
      ${win ? "" : `<label>${t("panel.open.style")}</label><select data-k="style">${Object.entries(DOOR_STYLES).map(([k, val]) => opt(k, val, o.style || "interior")).join("")}</select>`}
      <div class="row2"><div><label>${t("panel.f.width")}</label><input data-k="width" type="number" step="0.05" value="${o.width}"></div><div><label>${t("panel.open.offset")}</label><input data-k="offset" type="number" step="0.05" value="${o.offset}"></div></div>
      ${o.style === "passage" ? "" : `<div class="row2"><div><label>${t("panel.open.hinge")}</label><select data-k="hinge">${opt("left", t("panel.open.left"), o.hinge || "left")}${opt("right", t("panel.open.right"), o.hinge)}</select></div>
        <div><label>${t("panel.open.swing")}</label><select data-k="swing">${opt("in", t("panel.open.in"), o.swing || "in")}${opt("out", t("panel.open.out"), o.swing)}</select></div></div>
      <label>${t("panel.open.contact", { note: win || o.style === "glass" ? t("panel.open.contact_shut") : t("panel.open.contact_door") })}</label><input data-k="contact" value="${esc(o.contact || "")}" list="ents">
      <label>${t("panel.open.blind")}</label><input data-k="blind" value="${esc(o.blind || "")}" list="ents">
      ${o.blind ? `<div class="row2"><div><label>${t("panel.open.blind_is")}</label><select data-k="blind_side">${opt("in", t("panel.open.inside"), o.blind_side || "in")}${opt("out", t("panel.open.outside"), o.blind_side)}</select></div>
        <div><label class="chk" style="margin-top:30px"><input type="checkbox" data-k="blind_invert" ${o.blind_invert ? "checked" : ""}> ${t("panel.open.blind_invert")}</label></div></div>` : ""}
      ${win ? "" : `<label>${t("panel.open.lock")}</label><input data-k="lock" value="${esc(o.lock || "")}" list="ents">`}
      <label class="chk"><input type="checkbox" data-k="sheet_hide" ${o.sheet_hide ? "checked" : ""}> ${t("panel.f.sheet_hide")}</label>
      ${this._actionsUI(o, { tap: o.blind ? t("panel.f.act_blind_detail") : o.contact ? t("panel.f.act_contact_detail") : "" })}`}
      <div class="actions"><button data-a="del" class="del">${t("panel.f.delete")}</button></div>`;
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
    // dock vacuum pairing; before _setShared, which splits keys on ":"
    if (key.startsWith("rm:")) { const name = key.slice(3), t = targets[0]; const m = { ...(t.room_map || {}) }; if (value) m[name] = value; else delete m[name]; if (Object.keys(m).length) t.room_map = m; else delete t.room_map; return this._changed(); }
    if (key === "rm_add") { if (value.trim()) (this._vacExtra ||= new Set()).add(value.trim()); return this._form(); }
    if (await this._setShared(targets, key, value, inp)) return;
    // the searchable pickers also take typed text: only a known type or kind counts
    if ((key === "type" && sel.cat === "furniture" && !FURNITURE[value] && !LIGHT_TYPES[value]) || (key === "kind" && sel.cat === "devices" && !DEVICE_KINDS[value])) return this._form();
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
      else if (key === "glow_side") { if (value) t.glow_side = Number(value); else delete t.glow_side; }
      else if (key === "type" && value === "led_strip" && !(t.w >= 0.5)) Object.assign(t, { type: value, w: 1, d: 0.04 }); // a lamp turned into a strip gets a usable length
      else if (key === "beam") { if (value === "") delete t.beam; else t.beam = Math.min(180, Math.max(5, Number(value))); }
      else if (key === "sheet_hide" || key === "label_vertical") { if (value) t[key] = true; else delete t[key]; }
      else if (key === "room_light") { if (value === "") delete t.room_light; else t.room_light = Math.max(0, Number(value)) / 100; }
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
      // z-order among items of the same kind; only the other items count, so a repeated click changes nothing
      const others = this._plan[sel.cat].filter((x) => !targets.includes(x) && (sel.cat !== "furniture" || isLight(x) === isLight(o))).map((x) => x.layer || 0);
      if (others.length) {
        const cur = o.layer || 0;
        const next = a === "layer:top" ? Math.max(cur, Math.max(...others) + 1) : Math.min(cur, Math.min(...others) - 1);
        for (const t of targets) if (next) t.layer = next; else delete t.layer;
      }
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

  // Ctrl+C / Ctrl+X / Ctrl+V: an in-editor clipboard for items and rooms (a room with its doors and windows; not labels)
  _copy() {
    const sel = this._sel;
    if (!sel || sel.cat === "openings") return false;
    const items = sel.cat === "rooms" ? [["rooms", this._plan.rooms[sel.i]]] : this._picked().map(([cat, o]) => [cat, o]);
    if (!items.length) return false;
    const open = sel.cat === "rooms" ? this._plan.openings.filter((o) => o.room_id === items[0][1].id) : [];
    this._clip = { items: JSON.parse(JSON.stringify(items)), openings: JSON.parse(JSON.stringify(open)), level: this._level, n: 0 };
    return true;
  }

  // cut = copy, then delete (Ctrl+Z brings it back)
  _cut() {
    if (!this._copy()) return false;
    if (this._sel.cat !== "rooms") {
      const gone = new Set(this._picked().map(([, o]) => o));
      for (const k of GROUPABLE) this._plan[k] = this._plan[k].filter((o) => !gone.has(o));
      this._sel = this._multi = null;
      this._changed();
      return true;
    }
    const r = this._plan.rooms[this._sel.i];
    this._plan.openings = this._plan.openings.filter((o) => o.room_id !== r.id);
    delete this._plan.labels[r.id];
    this._plan.rooms.splice(this._sel.i, 1);
    this._sel = null;
    this._changed();
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
        for (const o of c.openings || []) this._plan.openings.push({ ...JSON.parse(JSON.stringify(o)), id: uid(o.type === "window" ? "w" : "d"), room_id: copy.id });
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
    const typing = e.composedPath().some((n) => n.tagName === "INPUT" || n.tagName === "TEXTAREA" || n.tagName === "SELECT" || n.tagName === "HA-SELECTOR" || n.tagName === "HA-ENTITY-PICKER" || n.tagName === "HA-COMBO-BOX");
    if ((e.ctrlKey || e.metaKey) && !typing && /^[zy]$/i.test(e.key)) {
      e.preventDefault();
      const redo = e.key.toLowerCase() === "y" || e.shiftKey;
      return redo ? this._history(this._redo, this._undo) : this._history(this._undo, this._redo);
    }
    if ((e.ctrlKey || e.metaKey) && !typing && /^[cxv]$/i.test(e.key)) {
      if (e.key.toLowerCase() === "c") return this._copy() && e.preventDefault();
      if (e.key.toLowerCase() === "x") return this._cut() && e.preventDefault();
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
        const pts = this._sel.v != null ? [r.points[this._sel.v], ...this._twins(r, r.points[this._sel.v]).map((t) => t.room.points[t.k])] : r.points;
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
      this.shadowRoot.querySelector(".state").textContent = t("panel.saved");
    } catch (err) {
      btn.disabled = false;
      if (err.code === "conflict") alert(t("panel.conflict"));
      else alert(t("panel.save_failed", { err: err.message || err.code || err }));
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
