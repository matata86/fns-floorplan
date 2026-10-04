// FNS Floorplan card: an animated 2D floor plan with the home's live state.
// The plan comes from the fns_floorplan integration (websocket fns_floorplan/plan/get).

const VERSION = "0.3.5";
// Material Design Icons paths (the icon set HA uses), 24×24
const MDI = {"mdiFan":"M12,11A1,1 0 0,0 11,12A1,1 0 0,0 12,13A1,1 0 0,0 13,12A1,1 0 0,0 12,11M12.5,2C17,2 17.11,5.57 14.75,6.75C13.76,7.24 13.32,8.29 13.13,9.22C13.61,9.42 14.03,9.73 14.35,10.13C18.05,8.13 22.03,8.92 22.03,12.5C22.03,17 18.46,17.1 17.28,14.73C16.78,13.74 15.72,13.3 14.79,13.11C14.59,13.59 14.28,14 13.88,14.34C15.87,18.03 15.08,22 11.5,22C7,22 6.91,18.42 9.27,17.24C10.25,16.75 10.69,15.71 10.89,14.79C10.4,14.59 9.97,14.27 9.65,13.87C5.96,15.85 2,15.07 2,11.5C2,7 5.56,6.89 6.74,9.26C7.24,10.25 8.29,10.68 9.22,10.87C9.41,10.39 9.73,9.97 10.14,9.65C8.15,5.96 8.94,2 12.5,2Z","mdiAirPurifier":"M11,9A4,4 0 0,1 15,13A4,4 0 0,1 11,17A4,4 0 0,1 7,13A4,4 0 0,1 11,9M11,11A2,2 0 0,0 9,13A2,2 0 0,0 11,15A2,2 0 0,0 13,13A2,2 0 0,0 11,11M7,4H14A4,4 0 0,1 18,8V9H16V8A2,2 0 0,0 14,6H7A2,2 0 0,0 5,8V20H16V18H18V22H3V8A4,4 0 0,1 7,4M16,11C18.5,11 18.5,9 21,9V11C18.5,11 18.5,13 16,13V11M16,15C18.5,15 18.5,13 21,13V15C18.5,15 18.5,17 16,17V15Z","mdiDishwasher":"M18,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V4A2,2 0 0,0 18,2M10,4A1,1 0 0,1 11,5A1,1 0 0,1 10,6A1,1 0 0,1 9,5A1,1 0 0,1 10,4M7,4A1,1 0 0,1 8,5A1,1 0 0,1 7,6A1,1 0 0,1 6,5A1,1 0 0,1 7,4M18,20H6V8H18V20M14.67,15.33C14.69,16.03 14.41,16.71 13.91,17.21C12.86,18.26 11.15,18.27 10.09,17.21C9.59,16.71 9.31,16.03 9.33,15.33C9.4,14.62 9.63,13.94 10,13.33C10.37,12.5 10.81,11.73 11.33,11L12,10C13.79,12.59 14.67,14.36 14.67,15.33","mdiTumbleDryer":"M6,2H18A2,2 0 0,1 20,4V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V4A2,2 0 0,1 6,2M7,4A1,1 0 0,0 6,5A1,1 0 0,0 7,6A1,1 0 0,0 8,5A1,1 0 0,0 7,4M10,4A1,1 0 0,0 9,5A1,1 0 0,0 10,6A1,1 0 0,0 11,5A1,1 0 0,0 10,4M12,8A6,6 0 0,0 6,14A6,6 0 0,0 12,20A6,6 0 0,0 18,14A6,6 0 0,0 12,8M8.11,10.5H10C9.76,11.88 10,12.67 10.58,13.29C11.68,14.36 12.16,15.71 11.89,17.5H10C10.24,16.12 10,15.33 9.42,14.71C8.32,13.64 7.85,12.29 8.11,10.5M12.11,10.5H14C13.76,11.88 14,12.67 14.58,13.29C15.68,14.36 16.16,15.71 15.89,17.5H14C14.24,16.12 14,15.33 13.42,14.71C12.32,13.64 11.85,12.29 12.11,10.5Z","mdiWaterBoiler":"M8 2C6.89 2 6 2.89 6 4V16C6 17.11 6.89 18 8 18H9V20H6V22H9C10.11 22 11 21.11 11 20V18H13V20C13 21.11 13.89 22 15 22H18V20H15V18H16C17.11 18 18 17.11 18 16V4C18 2.89 17.11 2 16 2H8M12 4.97A2 2 0 0 1 14 6.97A2 2 0 0 1 12 8.97A2 2 0 0 1 10 6.97A2 2 0 0 1 12 4.97M10 14.5H14V16H10V14.5Z","mdiFire":"M17.66 11.2C17.43 10.9 17.15 10.64 16.89 10.38C16.22 9.78 15.46 9.35 14.82 8.72C13.33 7.26 13 4.85 13.95 3C13 3.23 12.17 3.75 11.46 4.32C8.87 6.4 7.85 10.07 9.07 13.22C9.11 13.32 9.15 13.42 9.15 13.55C9.15 13.77 9 13.97 8.8 14.05C8.57 14.15 8.33 14.09 8.14 13.93C8.08 13.88 8.04 13.83 8 13.76C6.87 12.33 6.69 10.28 7.45 8.64C5.78 10 4.87 12.3 5 14.47C5.06 14.97 5.12 15.47 5.29 15.97C5.43 16.57 5.7 17.17 6 17.7C7.08 19.43 8.95 20.67 10.96 20.92C13.1 21.19 15.39 20.8 17.03 19.32C18.86 17.66 19.5 15 18.56 12.72L18.43 12.46C18.22 12 17.66 11.2 17.66 11.2M14.5 17.5C14.22 17.74 13.76 18 13.4 18.1C12.28 18.5 11.16 17.94 10.5 17.28C11.69 17 12.4 16.12 12.61 15.23C12.78 14.43 12.46 13.77 12.33 13C12.21 12.26 12.23 11.63 12.5 10.94C12.69 11.32 12.89 11.7 13.13 12C13.9 13 15.11 13.44 15.37 14.8C15.41 14.94 15.43 15.08 15.43 15.23C15.46 16.05 15.1 16.95 14.5 17.5H14.5Z","mdiCeilingLight":"M8,9H11V4H13V9H16L20,17H4L8,9M14,18A2,2 0 0,1 12,20A2,2 0 0,1 10,18H14Z","mdiLamp":"M8,2H16L20,14H4L8,2M11,15H13V20H18V22H6V20H11V15Z","mdiWallSconceFlat":"M5,5V11H19V5H5M5.27,13.32L3.5,15.09L4.91,16.5L6.68,14.73L5.27,13.32M18.73,13.32L17.32,14.73L19.09,16.5L20.5,15.09L18.73,13.32M11,16V19H13V16H11Z","mdiLightbulbOn":"M12,6A6,6 0 0,1 18,12C18,14.22 16.79,16.16 15,17.2V19A1,1 0 0,1 14,20H10A1,1 0 0,1 9,19V17.2C7.21,16.16 6,14.22 6,12A6,6 0 0,1 12,6M14,21V22A1,1 0 0,1 13,23H11A1,1 0 0,1 10,22V21H14M20,11H23V13H20V11M1,11H4V13H1V11M13,1V4H11V1H13M4.92,3.5L7.05,5.64L5.63,7.05L3.5,4.93L4.92,3.5M16.95,5.63L19.07,3.5L20.5,4.93L18.37,7.05L16.95,5.63Z","mdiWindowOpenVariant":"M21 20V2H3V20H1V23H23V20M19 4V11H17V4M5 4H7V11H5M5 20V13H7V20M9 20V4H15V20M17 20V13H19V20Z","mdiWaterAlert":"M10 3.25C10 3.25 16 10 16 14C16 17.31 13.31 20 10 20S4 17.31 4 14C4 10 10 3.25 10 3.25M20 7V13H18V7H20M18 17H20V15H18V17Z","mdiThermometer":"M15 13V5A3 3 0 0 0 9 5V13A5 5 0 1 0 15 13M12 4A1 1 0 0 1 13 5V8H11V5A1 1 0 0 1 12 4Z","mdiRobotVacuum":"M12,2C14.65,2 17.19,3.06 19.07,4.93L17.65,6.35C16.15,4.85 14.12,4 12,4C9.88,4 7.84,4.84 6.35,6.35L4.93,4.93C6.81,3.06 9.35,2 12,2M3.66,6.5L5.11,7.94C4.39,9.17 4,10.57 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12C20,10.57 19.61,9.17 18.88,7.94L20.34,6.5C21.42,8.12 22,10.04 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12C2,10.04 2.58,8.12 3.66,6.5M12,6A6,6 0 0,1 18,12C18,13.59 17.37,15.12 16.24,16.24L14.83,14.83C14.08,15.58 13.06,16 12,16C10.94,16 9.92,15.58 9.17,14.83L7.76,16.24C6.63,15.12 6,13.59 6,12A6,6 0 0,1 12,6M12,8A1,1 0 0,0 11,9A1,1 0 0,0 12,10A1,1 0 0,0 13,9A1,1 0 0,0 12,8Z","mdiWeatherNight":"M17.75,4.09L15.22,6.03L16.13,9.09L13.5,7.28L10.87,9.09L11.78,6.03L9.25,4.09L12.44,4L13.5,1L14.56,4L17.75,4.09M21.25,11L19.61,12.25L20.2,14.23L18.5,13.06L16.8,14.23L17.39,12.25L15.75,11L17.81,10.95L18.5,9L19.19,10.95L21.25,11M18.97,15.95C19.8,15.87 20.69,17.05 20.16,17.8C19.84,18.25 19.5,18.67 19.08,19.07C15.17,23 8.84,23 4.94,19.07C1.03,15.17 1.03,8.83 4.94,4.93C5.34,4.53 5.76,4.17 6.21,3.85C6.96,3.32 8.14,4.21 8.06,5.04C7.79,7.9 8.75,10.87 10.95,13.06C13.14,15.26 16.1,16.22 18.97,15.95M17.33,17.97C14.5,17.81 11.7,16.64 9.53,14.5C7.36,12.31 6.2,9.5 6.04,6.68C3.23,9.82 3.34,14.64 6.35,17.66C9.37,20.67 14.19,20.78 17.33,17.97Z","mdiWhiteBalanceSunny":"M3.55 19.09L4.96 20.5L6.76 18.71L5.34 17.29M12 6C8.69 6 6 8.69 6 12S8.69 18 12 18 18 15.31 18 12C18 8.68 15.31 6 12 6M20 13H23V11H20M17.24 18.71L19.04 20.5L20.45 19.09L18.66 17.29M20.45 5L19.04 3.6L17.24 5.39L18.66 6.81M13 1H11V4H13M6.76 5.39L4.96 3.6L3.55 5L5.34 6.81L6.76 5.39M1 13H4V11H1M13 20H11V23H13","mdiClockOutline":"M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z","rWave1":"M7.95,3L6.53,5.19L7.95,7.4H7.94L5.95,10.5L4.22,9.6L5.64,7.39L4.22,5.19L6.22,2.09L7.95,3","rWave2":"M13.95,2.89L12.53,5.1L13.95,7.3L13.94,7.31L11.95,10.4L10.22,9.5L11.64,7.3L10.22,5.1L12.22,2L13.95,2.89","rWave3":"M20,2.89L18.56,5.1L20,7.3V7.31L18,10.4L16.25,9.5L17.67,7.3L16.25,5.1L18.25,2L20,2.89","rBody":"M2,22V14A2,2 0 0,1 4,12H20A2,2 0 0,1 22,14V22H20V20H4V22H2M6,14A1,1 0 0,0 5,15V17A1,1 0 0,0 6,18A1,1 0 0,0 7,17V15A1,1 0 0,0 6,14M10,14A1,1 0 0,0 9,15V17A1,1 0 0,0 10,18A1,1 0 0,0 11,17V15A1,1 0 0,0 10,14M14,14A1,1 0 0,0 13,15V17A1,1 0 0,0 14,18A1,1 0 0,0 15,17V15A1,1 0 0,0 14,14M18,14A1,1 0 0,0 17,15V17A1,1 0 0,0 18,18A1,1 0 0,0 19,17V15A1,1 0 0,0 18,14Z"};
const S = 80; // px per metre
const PAD = 24;
const NS = "http://www.w3.org/2000/svg";
const LIGHT_DEFAULT = "#ffd9a0";
const OFF_STATES = new Set(["off", "standby", "unavailable", "unknown"]);
// colour names usable in rules; anything else is taken as a CSS colour
const COLORS = { red: "#ef4444", orange: "#f59e0b", yellow: "#facc15", green: "#4ade80", blue: "#60a5fa", purple: "#a855f7", pink: "#ec4899", white: "#f8fafc", black: "#000" };
const color = (c) => COLORS[c] || c;
const MOTION_CLASSES = new Set(["motion", "occupancy", "presence"]);

const el = (tag, attrs = {}, parent) => {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  if (parent) parent.appendChild(e);
  return e;
};
const P = ([x, z]) => [x * S + PAD, z * S + PAD];
const polyD = (pts) => "M" + pts.map(P).map((p) => p.join(",")).join("L") + "Z";
const mdiSvg = (name) => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${MDI[name]}"/></svg>`;
// an MDI icon inside the plan: centred on 0,0 and `size` px big
const mdiPath = (name, size, cls = "") =>
  `<path class="${cls}" d="${MDI[name]}" transform="translate(${-size / 2} ${-size / 2}) scale(${size / 24})"/>`;
const inPoly = ([x, z], pts) => {
  let c = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, zi] = pts[i], [xj, zj] = pts[j];
    if (zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) c = !c;
  }
  return c;
};
const centroid = (pts) => {
  let a = 0, cx = 0, cz = 0;
  for (let i = 0; i < pts.length; i++) {
    const [x0, z0] = pts[i], [x1, z1] = pts[(i + 1) % pts.length];
    const f = x0 * z1 - x1 * z0;
    a += f; cx += (x0 + x1) * f; cz += (z0 + z1) * f;
  }
  return [cx / (3 * a), cz / (3 * a)];
};
const segInside = (a, b, pts) => {
  for (let t = 0.1; t < 1; t += 0.1) if (!inPoly([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t], pts)) return false;
  return true;
};
const hex = (rgb) => "#" + rgb.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
// colour temperature to RGB (Tanner Helland's approximation)
const kelvinHex = (k) => {
  const t = k / 100;
  const r = t <= 66 ? 255 : 329.698727446 * Math.pow(t - 60, -0.1332047592);
  const g = t <= 66 ? 99.4708025861 * Math.log(t) - 161.1195681661 : 288.1221695283 * Math.pow(t - 60, -0.0755148492);
  const b = t >= 66 ? 255 : t <= 19 ? 0 : 138.5177312231 * Math.log(t - 10) - 305.0447927307;
  return hex([r, g, b]);
};
const num = (v, d = 1) => Number(v).toFixed(d).replace(".", ",");
const minutes = (m) => (m >= 60 ? `${Math.floor(m / 60)} h ${Math.round(m % 60)} min` : `${Math.round(m)} min`);

const STYLE = `
:host { display: block; }
ha-card { overflow: hidden; background: none; border: 0; }
.app {
  --bg: #0a0e1c; --bg2: #10162b; --floor: #141b33; --floor-hi: #19223f;
  --wall: #8b93ff; --wall-glow: rgba(99, 102, 241, .55);
  --text: #e8ebff; --muted: #8d95c0; --chip: rgba(18, 24, 48, .78); --line: rgba(139, 147, 255, .22);
  --accent: #818cf8; --warm: #ffc46b; --open: #ffb02e; --alarm: #ff4d6d; --cold: #60a5fa; --hot: #fb923c;
  container-type: inline-size;
  position: relative; display: flex; flex-direction: column;
  border-radius: var(--ha-card-border-radius, 12px);
  background: radial-gradient(ellipse at 50% 0%, var(--bg2), var(--bg) 70%);
  color: var(--text); font: 14px/1.35 var(--ha-font-family-body, Roboto, system-ui, sans-serif);
  transition: background .8s, color .8s; -webkit-tap-highlight-color: transparent;
}
.app[data-mode="day"] {
  --bg: #e9ecf8; --bg2: #f6f7fd; --floor: #ffffff; --floor-hi: #f3f4ff;
  --wall: #3f46c8; --wall-glow: rgba(99, 102, 241, .18);
  --text: #1b1f3b; --muted: #5b638f; --chip: rgba(255, 255, 255, .86); --line: rgba(63, 70, 200, .16);
}
[hidden] { display: none !important; }
.stage { position: relative; border-radius: inherit; overflow: hidden; max-height: 85vh;
  background: linear-gradient(160deg, rgba(255,255,255,.025), rgba(255,255,255,0)); }
svg.plan { width: 100%; height: 100%; display: block; }
.room-floor { fill: var(--floor); transition: fill .8s; cursor: pointer; }
.room-floor:hover, .room-floor.sel { fill: var(--floor-hi); }
.walls { fill: none; stroke: var(--wall); stroke-width: 6; stroke-linejoin: round; transition: stroke .8s; }
.gwalls { filter: drop-shadow(0 0 3px var(--wall-glow)); }
.cut { stroke: var(--floor); stroke-width: 9; transition: stroke .8s; }
.door-arc { fill: none; stroke: var(--muted); stroke-width: 1.2; stroke-dasharray: 3 3; opacity: .7; }
.door-leaf { stroke: var(--muted); stroke-width: 2; stroke-linecap: round; }
.win { stroke: #67e8f9; stroke-width: 4; stroke-linecap: round; filter: drop-shadow(0 0 2px #67e8f9); }
.sash { stroke: #67e8f9; stroke-width: 3; stroke-linecap: round; }
.is-open .door-arc { opacity: .5; }
.alert-open .win { stroke: var(--open); }
.alert-open.fresh .win, .alert-open.fresh .sash, .alert-open.fresh .door-leaf { animation: winPulse .8s ease-in-out infinite; }
.alert-open .door-leaf, .alert-open .sash { stroke: var(--open); filter: drop-shadow(0 0 3px var(--open)); }
.furn { fill: rgba(139,147,255,.05); stroke: rgba(139,147,255,.28); stroke-width: 1; pointer-events: none; }
.app[data-mode="day"] .furn { fill: rgba(63,70,200,.04); stroke: rgba(63,70,200,.25); }
/* crisp lines on a scaled-down plan: thin strokes stay 1 px on screen instead of a blurry half pixel */
.furn, .door-arc, .door-leaf, .label rect, .tv { vector-effect: non-scaling-stroke; }
svg.plan text { text-rendering: geometricPrecision; }
/* daylight: no glow halos around walls and windows, they only smudge the lines */
.app[data-mode="day"] .gwalls, .app[data-mode="day"] .win { filter: none; }
.glow { mix-blend-mode: screen; pointer-events: none; }
.app[data-mode="day"] .glow { mix-blend-mode: multiply; opacity: .35 !important; }
.lamp { cursor: pointer; --lamp: #ffd9a0; }
.lamp .hit { fill: transparent; }
.lamp circle.core { fill: var(--chip); stroke: rgba(139,147,255,.45); stroke-width: 1.2; transition: fill .4s, stroke .4s; }
.lamp .lamp-icon path { fill: var(--muted); transition: fill .4s; }
.lamp.on .lamp-icon path { fill: #2a1a00; }
.lamp circle.halo { fill: none; stroke: rgba(139,147,255,.35); stroke-width: 1.2; transition: stroke .4s; }
.lamp.on circle.core { fill: var(--lamp); stroke: #fff; filter: drop-shadow(0 0 3px var(--lamp)); }
.lamp.on circle.halo { stroke: var(--lamp); stroke-width: 2; animation: halo 3s ease-in-out infinite; }
.strip { stroke: #2a3156; stroke-width: 3.5; stroke-linecap: round; transition: stroke .4s; }
.strip.on { stroke: #fff3d6; filter: drop-shadow(0 0 4px #fff3d6); }
.app[data-mode="day"] .strip:not(.on) { stroke: #c9cdea; }
.dev { cursor: pointer; }
.dev .badge { fill: var(--chip); stroke: var(--line); stroke-width: 1.2; }
.dev .ring { fill: none; stroke: var(--accent); stroke-width: 2; opacity: 0; }
.dev .icon path { fill: var(--muted); stroke: none; transition: fill .4s; }
.dev .icon .waves path { fill: none; stroke: #67e8f9; stroke-width: 1.4; stroke-linecap: round; }
.dev .icon .drops circle { fill: #67e8f9; opacity: 0; }
.dev .icon .flame { opacity: 0; }
.dev .icon .flame path { fill: #ff8a3d; }
.dev .devtext { fill: var(--text); font-size: 10px; font-weight: 600; }
.dev.on .badge { stroke: var(--accent); }
.dev.on .ring { animation: devRing 2.4s ease-out infinite; }
.dev.on .icon > path, .dev.on .icon .spin path, .dev.on .icon .wobble path { fill: #c7d2fe; }
.app[data-mode="day"] .dev.on .icon > path, .app[data-mode="day"] .dev.on .icon .spin path, .app[data-mode="day"] .dev.on .icon .wobble path { fill: var(--accent); }
.dev .spin, .dev .wobble { transform-box: fill-box; transform-origin: center; }
.dev .waves { opacity: 0; }
.dev-dryer.on .wobble { animation: wobble .35s ease-in-out infinite alternate; }
.dev-fan.on .spin { animation: spin .7s linear infinite; }
.dev-purifier.on .waves { animation: waves 2s ease-out infinite; }
.dev-dishwasher.on .drops circle { animation: drop 1s ease-in infinite; }
.dev-dishwasher.on .drops circle:nth-child(2) { animation-delay: .33s; }
.dev-dishwasher.on .drops circle:nth-child(3) { animation-delay: .66s; }
.dev-boiler.on .flame { opacity: 1; filter: drop-shadow(0 0 2px #ff8a3d); }
.dev-boiler.on .flame path { transform-box: fill-box; transform-origin: 50% 100%; animation: flame .5s ease-in-out infinite alternate; }
.dev-boiler.on .badge, .dev-boiler.on .ring { stroke: #ff8a3d; }
.dev .heatwaves g { opacity: 0; }
.dev-radiator.on .heatwaves path { fill: var(--wave, #ef4444) !important; }
.dev-radiator.on .heatwaves g { animation: heatwave 1.6s ease-in-out infinite; }
.dev-radiator.on .heatwaves g:nth-child(2) { animation-delay: .35s; }
.dev-radiator.on .heatwaves g:nth-child(3) { animation-delay: .7s; }
.dev-radiator.on .ring { stroke: var(--wave, #ef4444); }
.dev.ruled .icon path:not(.heatwaves path) { fill: var(--dev) !important; }
.dev.ruled .badge { stroke: var(--dev); }
.dev.glow .badge { filter: drop-shadow(0 0 4px var(--dev)); }
.furn.ruled { fill: var(--furn); fill-opacity: .25; stroke: var(--furn); stroke-opacity: .8; }
.furn.glow { filter: drop-shadow(0 0 5px var(--furn)); }
.tint { pointer-events: none; transition: fill .6s, opacity .6s; }
.tint.glow { filter: drop-shadow(0 0 8px currentColor); }
.label { pointer-events: none; }
.label rect { fill: var(--chip); stroke: var(--line); }
.label .name { fill: var(--text); font-weight: 600; font-size: 12px; }
.label .clim { font-size: 10.5px; font-weight: 500; }
.t-cold { fill: var(--cold); } .t-ok { fill: var(--muted); } .t-hot { fill: var(--hot); }
.ripple { fill: none; stroke: var(--accent); stroke-width: 2; animation: ripple 2.2s ease-out infinite; pointer-events: none; }
.ripple.r2 { animation-delay: .7s; } .ripple.r3 { animation-delay: 1.4s; }
.leak { fill: var(--alarm); opacity: 0; animation: leak 1.2s ease-in-out infinite; pointer-events: none; }
.tv { fill: #05070f; stroke: rgba(139,147,255,.6); stroke-width: 1; }
.tv.playing { animation: tvHue 4s linear infinite; }
.robot { cursor: pointer; }
.robot .rbadge { fill: var(--chip); stroke: var(--line); stroke-width: 2; }
.robot.on .rbadge { stroke: var(--accent); }
.robot .ricon path { fill: var(--muted); }
.robot.on .ricon path { fill: #c7d2fe; }
.trail { fill: none; stroke: var(--accent); stroke-width: 16; stroke-linecap: round; stroke-linejoin: round; opacity: .1; pointer-events: none; }
.sheet {
  position: absolute; right: 12px; top: 12px; bottom: 12px; width: 290px; z-index: 2;
  background: var(--chip); border: 1px solid var(--line); border-radius: 16px;
  backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); padding: 14px; transform: translateX(120%);
  transition: transform .45s cubic-bezier(.2,.9,.3,1); overflow: auto;
}
.sheet.open { transform: none; }
.sheet h2 { margin: 0 0 2px; font-size: 18px; }
.sheet .sub { color: var(--muted); margin-bottom: 12px; }
.row { display: flex; align-items: center; justify-content: space-between; padding: 9px 0; border-top: 1px solid var(--line); gap: 10px; }
.row.link { cursor: pointer; }
.row .st { color: var(--muted); }
.row .st.open { color: var(--open); }
.sw { width: 44px; height: 26px; border-radius: 99px; background: #2a3156; position: relative; cursor: pointer; transition: background .3s; flex: none; border: 0; }
.sw::after { content: ""; position: absolute; left: 3px; top: 3px; width: 20px; height: 20px; border-radius: 50%; background: #fff; transition: transform .3s; }
.sw.on { background: var(--warm); }
.sw.on::after { transform: translateX(18px); }
.close { position: absolute; right: 10px; top: 10px; background: none; border: 0; color: var(--muted); font-size: 20px; cursor: pointer; }
.hint { color: var(--muted); font-size: 12px; }
.msg { padding: 16px; }
@container (max-width: 600px) {
  .sheet { left: 8px; right: 8px; top: auto; width: auto; max-height: 60%; bottom: 8px; transform: translateY(120%); }
}
@keyframes heatwave { 0%, 100% { opacity: .45; transform: translateY(1px); } 50% { opacity: 1; transform: translateY(-1.4px); } }
@keyframes halo { 50% { opacity: .55; } }
@keyframes wobble { from { transform: rotate(-4deg); } to { transform: rotate(4deg); } }
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes devRing { from { r: 17; opacity: .7; } to { r: 30; opacity: 0; } }
@keyframes waves { 0% { opacity: 0; transform: translateY(3px); } 40% { opacity: 1; } 100% { opacity: 0; transform: translateY(-3px); } }
@keyframes drop { 0% { transform: translateY(-3px); opacity: 0; } 30% { opacity: 1; } 100% { transform: translateY(4px); opacity: 0; } }
@keyframes flame { from { transform: scale(.88, .8); } to { transform: scale(1.05, 1.12); } }
@keyframes ripple { from { r: 6; opacity: .9; } to { r: 70; opacity: 0; } }
@keyframes winPulse { 50% { opacity: .45; } }
@keyframes leak { 50% { opacity: .22; } }
@keyframes blink { 50% { opacity: .3; } }
@keyframes tvHue { 0% { fill: #3b2bff; } 33% { fill: #ff2bd1; } 66% { fill: #2bd9ff; } 100% { fill: #3b2bff; } }
@media (prefers-reduced-motion: reduce) { .ripple, .alert-open.fresh *, .leak, .tv.playing, .dev *, .lamp * { animation: none !important; } }
`;

// appliance glyphs: an MDI icon plus the bits that animate
const ICON = {
  fan: () => `<g class="spin">${mdiPath("mdiFan", 20)}</g>`,
  purifier: () => `${mdiPath("mdiAirPurifier", 20)}<g class="waves"><path d="M-9 -13 Q0 -17 9 -13"/><path d="M-11 -16 Q0 -21 11 -16"/></g>`,
  dishwasher: () => `${mdiPath("mdiDishwasher", 20)}<g class="drops"><circle cx="-3" cy="2" r="1.3"/><circle cx="1" cy="4" r="1.3"/><circle cx="4" cy="1" r="1.3"/></g>`,
  dryer: () => `<g class="wobble">${mdiPath("mdiTumbleDryer", 20)}</g>`,
  radiator: () => `<g class="heatwaves">${["rWave1", "rWave2", "rWave3"].map((n) => `<g>${mdiPath(n, 20)}</g>`).join("")}</g>${mdiPath("rBody", 20)}`,
  boiler: () => `${mdiPath("mdiWaterBoiler", 20)}<g class="flame" transform="translate(5 5)">${mdiPath("mdiFire", 9)}</g>`,
};

// tap runs `tap`, a press held for half a second runs `hold`
function press(node, tap, hold) {
  let timer = 0, held = false;
  node.addEventListener("pointerdown", () => {
    held = false;
    clearTimeout(timer);
    timer = setTimeout(() => { held = true; hold(); }, 500);
  });
  for (const ev of ["pointerup", "pointerleave", "pointercancel"]) node.addEventListener(ev, () => clearTimeout(timer));
  node.addEventListener("click", (e) => { e.stopPropagation(); if (!held) tap(); });
  node.addEventListener("contextmenu", (e) => e.preventDefault());
}

class FnsFloorplanCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  setConfig(config) {
    this._config = { mode: "auto", rotate: "auto", ...config };
    if (this._v) { this._v.update(true); this._v.layout(); }
  }

  set hass(hass) {
    this._hass = hass;
    if (this._v) this._v.update();
    else if (!this._loading && !this._failed) this._load();
  }

  getCardSize() { return 9; }
  getGridOptions() { return { columns: "full", min_columns: 6 }; }
  static getStubConfig() { return {}; }
  static getConfigElement() { return document.createElement("fns-floorplan-card-editor"); }

  connectedCallback() {
    if (this._v) this._v.attach();
  }

  disconnectedCallback() {
    this._v?.detach();
  }

  async _load() {
    this._loading = true;
    let plan;
    try {
      plan = await this._hass.callWS({ type: "fns_floorplan/plan/get" });
    } catch (err) {
      this._fail(`Integrace FNS Floorplan neodpovídá (${err.message || err.code || err}).`);
      return;
    } finally {
      this._loading = false;
    }
    if (!plan?.rooms?.length) {
      this._fail("Plán je prázdný. Naimportuj ho přes websocket fns_floorplan/plan/save.");
      return;
    }
    this._v = buildView(this, plan);
    if (this.isConnected) this._v.attach();
    this._v.update(true);
  }

  _fail(text) {
    this._failed = true;
    this.shadowRoot.innerHTML = `<style>${STYLE}</style><ha-card><div class="app msg"></div></ha-card>`;
    this.shadowRoot.querySelector(".msg").textContent = text;
  }
}

// builds the static plan once; returns the hooks the card calls on every hass update
function buildView(card, plan) {
  const root$ = card.shadowRoot;
  root$.innerHTML = `<style>${STYLE}</style>
<ha-card><div class="app">
  <div class="stage">
    <svg class="plan" preserveAspectRatio="xMidYMid meet"></svg>
    <aside class="sheet">
      <button class="close" aria-label="Zavřít">✕</button>
      <h2></h2>
      <div class="sub"></div>
      <div class="rows"></div>
    </aside>
  </div>
</div></ha-card>`;
  const $ = (sel) => root$.querySelector(sel);
  root$.querySelectorAll("[data-mdi]").forEach((n) => (n.innerHTML = mdiSvg(n.dataset.mdi)));
  const app = $(".app"), stage = $(".stage"), svg = $("svg.plan"), sheet = $(".sheet");
  const hass = () => card._hass;
  const cfg = () => card._config || {};
  const st = (id) => (id ? hass().states[id] : undefined);
  const moreInfo = (entityId) =>
    card.dispatchEvent(new CustomEvent("hass-more-info", { detail: { entityId }, bubbles: true, composed: true }));
  const toggle = (entityId) => hass().callService("homeassistant", "toggle", { entity_id: entityId });
  const nameOf = (id) => st(id)?.attributes.friendly_name || id;

  // ---- rules: an ordered list, each {if: [conditions], color, glow, animate, wave, text};
  // for every field the first matching rule that sets it wins. A condition is
  // {entity, attribute?, state | state_not | above | below}, or {any: [conditions]} for OR.
  const condOk = (c) => {
    if (c.any) return c.any.some(condOk);
    const s = st(c.entity);
    if (!s) return false;
    const v = c.attribute ? s.attributes[c.attribute] : s.state;
    if (c.state != null && ![].concat(c.state).map(String).includes(String(v))) return false;
    if (c.state_not != null && [].concat(c.state_not).map(String).includes(String(v))) return false;
    if (c.above != null && !(Number(v) > c.above)) return false;
    if (c.below != null && !(Number(v) < c.below)) return false;
    return true;
  };
  const applyRules = (rules) => {
    const out = {};
    for (const r of rules || []) {
      if (!(r.if ? [].concat(r.if) : []).every(condOk)) continue;
      for (const [k, v] of Object.entries(r)) if (k !== "if" && !(k in out)) out[k] = v;
    }
    return out;
  };
  const ruleEntities = (rules, into) => {
    const walk = (c) => { if (c.any) c.any.forEach(walk); else if (c.entity) into.add(c.entity); };
    for (const r of rules || []) [].concat(r.if || []).forEach(walk);
  };

  const rooms = plan.rooms;
  const R = Object.fromEntries(rooms.map((r) => [r.id, r]));
  const roomAt = (x, z) => rooms.find((r) => inPoly([x, z], r.points));
  const furniture = plan.furniture || [];
  const isLight = (f) => /^(lamp|led)/.test(f.type);
  const lampGroups = {};
  for (const f of furniture) if (isLight(f) && f.entity) (lampGroups[f.entity] ||= []).push(f);

  // ---- svg skeleton ----
  const xs = rooms.flatMap((r) => r.points.map((p) => p[0]));
  const zs = rooms.flatMap((r) => r.points.map((p) => p[1]));
  const W = Math.max(...xs) * S + PAD * 2, H = Math.max(...zs) * S + PAD * 2;
  const defs = el("defs", {}, svg);
  defs.innerHTML = `<filter id="blurBig" filterUnits="userSpaceOnUse" x="-2000" y="-2000" width="6000" height="6000"><feGaussianBlur stdDeviation="18"/></filter>`;
  const root = el("g", {}, svg);
  const layer = (cls = "") => el("g", cls ? { class: cls } : {}, root);
  const gFloor = layer(), gGlow = layer(), gTrail = layer(), gFurn = layer(), gFx = layer(), gWalls = layer("gwalls");
  const gOpen = layer(), gLamps = layer(), gDevices = layer(), gRobot = layer(), gLabels = layer();

  for (const r of rooms) {
    const d = polyD(r.points);
    el("path", { d }, el("clipPath", { id: "clip_" + r.id }, defs));
    const f = el("path", { d, class: "room-floor", "data-room": r.id }, gFloor);
    f.addEventListener("click", () => openSheet(r.id));
    if (r.rules) r.tint = el("path", { d, class: "tint", opacity: 0 }, gFloor);
    r.glowLayer = el("g", { "clip-path": `url(#clip_${r.id})` }, gGlow);
    el("path", { d, class: "walls" }, gWalls);
    r.fx = el("g", { "clip-path": `url(#clip_${r.id})` }, gFx);
  }

  // furniture outlines; a wall TV with a media player lights up while it plays
  const tvs = [];
  for (const f of furniture) {
    if (isLight(f) || f.type === "robot_vacuum") continue;
    const [cx, cz] = P([f.x, f.z]);
    const w = f.w * S, d = f.d * S;
    const g = el("g", { transform: `translate(${cx} ${cz}) rotate(${f.rotation || 0})` }, gFurn);
    if (f.type === "tv_wall") {
      const node = el("rect", { x: -w / 2, y: -Math.max(d, 4) / 2, width: w, height: Math.max(d, 5), rx: 2, class: "tv" }, g);
      if (f.entity) tvs.push({ entity: f.entity, node });
      continue;
    }
    f.node = el("rect", { x: -w / 2, y: -d / 2, width: w, height: d, rx: Math.min(6, d / 4), class: "furn" }, g);
  }
  const ruledFurniture = furniture.filter((f) => f.rules && f.node);

  // openings: doors and windows with a contact swing open and shut (angle eased every frame)
  const swingers = [];
  for (const o of plan.openings || []) {
    const r = R[o.room_id];
    if (!r) continue;
    const p = r.points, a = p[o.edge], b = p[(o.edge + 1) % p.length];
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const u = [(b[0] - a[0]) / L, (b[1] - a[1]) / L];
    const s0 = o.offset - o.width / 2, s1 = o.offset + o.width / 2;
    const A = P([a[0] + u[0] * s0, a[1] + u[1] * s0]), B = P([a[0] + u[0] * s1, a[1] + u[1] * s1]);
    const c = centroid(p);
    let n = [-u[1], u[0]];
    const mid = [a[0] + u[0] * o.offset, a[1] + u[1] * o.offset];
    if ((c[0] - mid[0]) * n[0] + (c[1] - mid[1]) * n[1] < 0) n = [-n[0], -n[1]];
    const g = el("g", {}, gOpen);
    el("line", { x1: A[0], y1: A[1], x2: B[0], y2: B[1], class: "cut" }, g);
    if (o.style === "passage") continue;
    const isWin = o.type === "window";
    if (isWin) el("line", { x1: A[0], y1: A[1], x2: B[0], y2: B[1], class: "win" }, g);
    if (isWin && !o.contact) continue; // a fixed or unsensed sash stays drawn as glass
    // the hinge sits on the side the plan says; the sash swings into the room (or out)
    const hingeAtA = o.hinge !== "right";
    const H0 = hingeAtA ? A : B, E0 = hingeAtA ? B : A;
    const len = Math.hypot(E0[0] - H0[0], E0[1] - H0[1]);
    const along = [(E0[0] - H0[0]) / len, (E0[1] - H0[1]) / len];
    const dir = o.swing === "out" ? -1 : 1;
    const sw = { o, g, H0, len, along, nn: [n[0] * dir, n[1] * dir], max: isWin ? 0.62 : Math.PI / 2, cur: 0, target: 0, isWin };
    sw.arc = el("path", { class: "door-arc", d: "" }, g);
    sw.leaf = el("line", { class: isWin ? "sash" : "door-leaf", x1: H0[0], y1: H0[1], x2: E0[0], y2: E0[1] }, g);
    swingers.push(sw);
  }
  function drawSwing(sw) {
    const a = sw.cur;
    const tip = [
      sw.H0[0] + (sw.along[0] * Math.cos(a) + sw.nn[0] * Math.sin(a)) * sw.len,
      sw.H0[1] + (sw.along[1] * Math.cos(a) + sw.nn[1] * Math.sin(a)) * sw.len,
    ];
    sw.leaf.setAttribute("x2", tip[0]);
    sw.leaf.setAttribute("y2", tip[1]);
    const E0 = [sw.H0[0] + sw.along[0] * sw.len, sw.H0[1] + sw.along[1] * sw.len];
    const cross = sw.along[0] * sw.nn[1] - sw.along[1] * sw.nn[0];
    sw.arc.setAttribute("d", a > 0.02 ? `M${E0[0]},${E0[1]} A${sw.len},${sw.len} 0 0 ${cross > 0 ? 1 : 0} ${tip[0]},${tip[1]}` : "");
    sw.g.classList.toggle("is-open", sw.target > 0);
  }
  function stepSwings() {
    let busy = false;
    for (const sw of swingers) {
      const d = sw.target - sw.cur;
      if (Math.abs(d) > 0.002) { sw.cur += d * 0.07; busy = true; drawSwing(sw); }
      else if (sw.cur !== sw.target) { sw.cur = sw.target; drawSwing(sw); }
    }
    return busy;
  }

  // lamps: one element per light and room (a room's ceiling spots count as one light); strips stay lines
  const lampNodes = [];
  for (const [id, list] of Object.entries(lampGroups)) {
    for (const f of list.filter((f) => f.type === "led_strip")) {
      const [cx, cz] = P([f.x, f.z]);
      const a = ((f.rotation || 0) * Math.PI) / 180, h = (f.w * S) / 2;
      const ln = el("line", { x1: cx - Math.cos(a) * h, y1: cz - Math.sin(a) * h, x2: cx + Math.cos(a) * h, y2: cz + Math.sin(a) * h, class: "strip lamp" }, gLamps);
      press(ln, () => toggle(id), () => moreInfo(id));
      lampNodes.push({ id, node: ln, strip: true, f, room: roomAt(f.x, f.z) });
    }
    const byRoom = new Map();
    for (const f of list.filter((f) => f.type !== "led_strip")) {
      const room = roomAt(f.x, f.z);
      if (!byRoom.has(room)) byRoom.set(room, []);
      byRoom.get(room).push(f);
    }
    for (const [room, fs] of byRoom) {
      const x = fs.reduce((s, f) => s + f.x, 0) / fs.length, z = fs.reduce((s, f) => s + f.z, 0) / fs.length;
      const spread = Math.max(...fs.map((f) => Math.hypot(f.x - x, f.z - z)), 0);
      const small = fs.every((f) => f.type === "lamp_table" || f.type === "lamp_wall");
      const [cx, cz] = P([x, z]);
      const g = el("g", { class: "lamp pin", "data-x": cx, "data-z": cz, transform: `translate(${cx} ${cz})` }, gLamps);
      el("circle", { r: 22, class: "hit" }, g);
      el("circle", { r: small ? 14 : 18, class: "halo" }, g);
      el("circle", { r: small ? 10 : 13, class: "core" }, g);
      const icon = fs[0].type === "lamp_table" ? "mdiLamp" : fs[0].type === "lamp_wall" ? "mdiWallSconceFlat" : "mdiCeilingLight";
      el("g", { class: "lamp-icon" }, g).innerHTML = mdiPath(icon, small ? 12 : 16);
      press(g, () => toggle(id), () => moreInfo(id));
      lampNodes.push({ id, node: g, x, z, spread, small, room, room_light: fs[0].room_light, fid: fs[0].id });
    }
  }

  // appliances: badge with an animated glyph, state text under it; tap opens the entity
  const devices = (plan.devices || []).filter((d) => ICON[d.kind]);
  for (const d of devices) {
    const [cx, cz] = P([d.x, d.z]);
    d.g = el("g", { class: "dev pin dev-" + d.kind, "data-x": cx, "data-z": cz, transform: `translate(${cx} ${cz})` }, gDevices);
    el("circle", { r: 17, class: "badge" }, d.g);
    el("circle", { r: 17, class: "ring" }, d.g);
    el("g", { class: "icon" }, d.g).innerHTML = ICON[d.kind]();
    d.label = el("text", { y: 30, class: "devtext", "text-anchor": "middle" }, d.g);
    d.g.addEventListener("click", (e) => { e.stopPropagation(); moreInfo(d.entity); });
  }
  const devActive = (d) => {
    const s = st(d.entity);
    if (!s) return false;
    if (Array.isArray(d.active)) return d.active.includes(s.state);
    if (d.active && d.active.above != null) return Number(s.state) > d.active.above;
    if (d.active && d.active.entity) return condOk(d.active);
    return !OFF_STATES.has(s.state);
  };
  const devText = (d, on) => {
    if (!on) return "";
    if (d.text) return d.text;
    const s = st(d.info);
    if (!s || OFF_STATES.has(s.state)) return "";
    const a = s.attributes;
    let out;
    if (a.device_class === "timestamp") {
      const left = (new Date(s.state) - Date.now()) / 60000;
      out = left > 0 ? minutes(left) : "";
    } else if (a.unit_of_measurement === "min") out = minutes(Number(s.state));
    else if (a.unit_of_measurement === "h") out = minutes(Number(s.state) * 60);
    else out = isNaN(s.state) ? s.state : `${Math.round(Number(s.state))}`;
    return out ? (d.prefix || "") + out : "";
  };
  function renderDevices() {
    for (const d of devices) {
      const r = applyRules(d.rules);
      const on = r.animate ?? devActive(d);
      d.g.classList.toggle("on", !!on);
      d.g.classList.toggle("ruled", !!r.color);
      d.g.classList.toggle("glow", !!(r.glow && r.color));
      d.g.style.setProperty("--dev", r.color ? color(r.color) : "");
      d.g.style.setProperty("--wave", r.wave ? color(r.wave) : "");
      d.label.textContent = r.text ?? devText(d, on);
    }
  }
  function renderRuled() {
    for (const r of rooms) {
      if (!r.tint) continue;
      const res = applyRules(r.rules);
      const c = res.tint || res.color;
      r.tint.setAttribute("fill", c ? color(c) : "transparent");
      r.tint.style.color = c ? color(c) : "";
      r.tint.setAttribute("opacity", c ? (res.opacity ?? 0.14) : 0);
      r.tint.classList.toggle("glow", !!(c && res.glow));
    }
    for (const f of ruledFurniture) {
      const res = applyRules(f.rules);
      f.node.classList.toggle("ruled", !!res.color);
      f.node.classList.toggle("glow", !!(res.color && res.glow));
      f.node.style.setProperty("--furn", res.color ? color(res.color) : "");
    }
  }

  // labels: a label never covers the room's light or an appliance, it moves up (or down) out of their way
  const LABEL_AT = plan.labels || {};
  function labelSpot(r) {
    if (LABEL_AT[r.id]) return LABEL_AT[r.id];
    const [x, z] = centroid(r.points);
    const things = lampNodes.filter((l) => !l.strip).map((l) => [l.x, l.z]).concat(devices.map((d) => [d.x, d.z]));
    const busy = (x, z) => things.some(([tx, tz]) => Math.abs(tx - x) < 0.75 && Math.abs(tz - z) < 0.45);
    for (const dz of [0, -0.55, 0.55, -0.9, 0.9]) if (!busy(x, z + dz) && inPoly([x, z + dz], r.points)) return [x, z + dz];
    return [x, z];
  }
  for (const r of rooms) {
    const [cx, cz] = P(labelSpot(r));
    const g = el("g", { class: "label", "data-x": cx, "data-z": cz }, gLabels);
    r.labelRect = el("rect", { rx: 10 }, g);
    const t1 = el("text", { class: "name", "text-anchor": "middle", y: r.temperature ? -2 : 4 }, g);
    t1.textContent = r.name;
    r.nameText = t1;
    if (r.temperature) r.clim = el("text", { class: "clim", "text-anchor": "middle", y: 12 }, g);
    r.labelG = g;
  }
  const fitLabels = () => {
    // measure only the texts: the group's box includes the rect itself, which would grow on every update
    for (const r of rooms) {
      const boxes = [r.nameText, r.clim].filter(Boolean).map((t) => t.getBBox());
      if (!boxes[0].width) continue;
      const x0 = Math.min(...boxes.map((b) => b.x)), y0 = Math.min(...boxes.map((b) => b.y));
      const bb = { x: x0, y: y0, width: Math.max(...boxes.map((b) => b.x + b.width)) - x0, height: Math.max(...boxes.map((b) => b.y + b.height)) - y0 };
      r.labelRect.setAttribute("x", bb.x - 8);
      r.labelRect.setAttribute("y", bb.y - 4);
      r.labelRect.setAttribute("width", bb.width + 16);
      r.labelRect.setAttribute("height", bb.height + 8);
    }
  };
  const roomClimate = (r) => {
    const t = Number(st(r.temperature)?.state), h = Number(st(r.humidity)?.state);
    return { t: isFinite(t) ? t : null, h: isFinite(h) ? h : null };
  };
  function renderLabels() {
    for (const r of rooms) {
      if (!r.clim) continue;
      const { t, h } = roomClimate(r);
      const cls = t == null ? "t-ok" : t < 19 ? "t-cold" : t > 25 ? "t-hot" : "t-ok";
      r.clim.innerHTML =
        `<tspan class="${cls}">${t == null ? "–" : num(t)}°</tspan>` + (h == null ? "" : `<tspan class="t-ok"> · ${Math.round(h)} %</tspan>`);
    }
    fitLabels();
  }

  // ---- live state ----
  const lightState = (id) => {
    const s = st(id);
    if (!s) return { on: false, color: LIGHT_DEFAULT, bri: 1 };
    const a = s.attributes;
    const color =
      a.color_mode === "color_temp" && a.color_temp_kelvin ? kelvinHex(a.color_temp_kelvin)
      : a.rgb_color ? hex(a.rgb_color)
      : a.color_temp_kelvin ? kelvinHex(a.color_temp_kelvin)
      : LIGHT_DEFAULT;
    return { on: s.state === "on", color, bri: a.brightness != null ? Math.max(0.05, a.brightness / 255) : 1 };
  };
  function renderLights() {
    for (const r of rooms) r.glowLayer.innerHTML = "";
    for (const L of lampNodes) {
      const s = lightState(L.id);
      L.node.classList.toggle("on", s.on);
      L.node.style.setProperty("--lamp", s.color);
      // a dimmed light shows a paler badge or strip
      const dim = s.on ? (0.35 + 0.65 * s.bri).toFixed(2) : "";
      if (L.strip) L.node.style.strokeOpacity = dim;
      else L.node.querySelector(".core").style.fillOpacity = dim;
      if (!s.on || !L.room) continue;
      const f = L.f || L;
      const share = f.room_light === false ? 0.15 : typeof f.room_light === "number" ? f.room_light : L.strip ? 0.45 : 1;
      if (L.strip) {
        const [cx, cz] = P([f.x, f.z]);
        const a = ((f.rotation || 0) * Math.PI) / 180, h = (f.w * S) / 2;
        el("line", {
          x1: cx - Math.cos(a) * h, y1: cz - Math.sin(a) * h, x2: cx + Math.cos(a) * h, y2: cz + Math.sin(a) * h,
          stroke: s.color, "stroke-width": 26 * (0.5 + share), "stroke-linecap": "round",
          opacity: (0.6 * s.bri).toFixed(2), filter: "url(#blurBig)", class: "glow",
        }, L.room.glowLayer);
        continue;
      }
      const rad = ((L.small ? 1.1 : 2.3) + L.spread * 0.9) * S * (0.6 + 0.4 * share) * (0.55 + 0.45 * s.bri);
      const gid = "g_" + L.fid;
      let grad = defs.querySelector("#" + CSS.escape(gid));
      if (!grad) {
        grad = el("radialGradient", { id: gid }, defs);
        el("stop", { offset: "0" }, grad); el("stop", { offset: ".45" }, grad); el("stop", { offset: "1" }, grad);
      }
      const stops = grad.children;
      stops[0].setAttribute("stop-color", s.color); stops[0].setAttribute("stop-opacity", (0.75 * s.bri * share + 0.15).toFixed(2));
      stops[1].setAttribute("stop-color", s.color); stops[1].setAttribute("stop-opacity", (0.3 * s.bri * share).toFixed(2));
      stops[2].setAttribute("stop-color", s.color); stops[2].setAttribute("stop-opacity", "0");
      const [cx, cz] = P([L.x, L.z]);
      el("circle", { cx, cy: cz, r: rad, fill: `url(#${gid})`, class: "glow" }, L.room.glowLayer);
    }
  }
  const isOpen = (o) => o.contact && st(o.contact)?.state === "on";
  const FRESH_MS = 6000; // an opening pulses this long after it opened, then stays plain orange
  function renderOpenings() {
    for (const sw of swingers) {
      const on = isOpen(sw.o);
      sw.target = on ? sw.max : 0;
      sw.g.classList.toggle("alert-open", !!on);
      const age = on ? Date.now() - Date.parse(st(sw.o.contact).last_changed) : Infinity;
      clearTimeout(sw.freshTimer);
      sw.g.classList.toggle("fresh", age < FRESH_MS);
      if (age < FRESH_MS) sw.freshTimer = setTimeout(() => sw.g.classList.remove("fresh"), FRESH_MS - age);
      if (sw.cur === 0 && sw.target === 0) drawSwing(sw);
    }
  }
  const sensors = (plan.sensors || []).map((s) => ({ ...s, room: roomAt(s.x, s.z) })).filter((s) => s.room);
  function renderFx() {
    for (const r of rooms) r.fx.innerHTML = "";
    for (const s of sensors) {
      const e = st(s.entity);
      if (e?.state !== "on") continue;
      const dc = e.attributes.device_class;
      if (MOTION_CLASSES.has(dc)) {
        const [cx, cz] = P([s.x, s.z]);
        for (const k of ["", " r2", " r3"]) el("circle", { cx, cy: cz, r: 6, class: "ripple" + k }, s.room.fx);
      } else if (dc === "moisture") {
        el("path", { d: polyD(s.room.points), class: "leak" }, s.room.fx);
      }
    }
    for (const t of tvs) t.node.classList.toggle("playing", !OFF_STATES.has(st(t.entity)?.state ?? "off"));
  }
  function renderMode() {
    const m = cfg().mode;
    const day = m === "day" || (m === "auto" && st("sun.sun")?.state === "above_horizon");
    app.dataset.mode = day ? "day" : "night";
  }

  // ---- robot vacuum: drives lanes through the room its sensor reports ----
  const vacCfg = plan.vacuum;
  const dock = furniture.find((f) => f.type === "robot_vacuum");
  const vac = { on: false, state: null, room: null, path: [], pi: 0, pts: [], tick: 0 };
  let robot = null, trail = null;
  if (vacCfg?.entity && dock) {
    robot = el("g", { class: "robot" }, gRobot);
    el("circle", { r: 14, class: "rbadge" }, robot);
    el("g", { class: "ricon" }, robot).innerHTML = mdiPath("mdiRobotVacuum", 18);
    robot.addEventListener("click", (e) => { e.stopPropagation(); moreInfo(vacCfg.entity); });
    trail = el("polyline", { class: "trail", points: "" }, gTrail);
    vac.rp = P([dock.x, dock.z]);
    vac.heading = 0;
  }
  let iconK = 1;
  const placeRobot = () => robot.setAttribute("transform", `translate(${vac.rp[0]} ${vac.rp[1]}) rotate(${vac.heading}) scale(${iconK})`);
  // lanes back and forth through one room; a move to the next lane never cuts through a wall (L-shaped rooms)
  function lanes(room) {
    const pts = room.points;
    const x0 = Math.min(...pts.map((p) => p[0])) + 0.3, x1 = Math.max(...pts.map((p) => p[0])) - 0.3;
    const z0 = Math.min(...pts.map((p) => p[1])) + 0.3, z1 = Math.max(...pts.map((p) => p[1])) - 0.3;
    const out = [];
    let flip = false;
    for (let z = z0; z <= z1 + 1e-6; z += 0.3) {
      const row = [];
      for (let x = x0; x <= x1 + 1e-6; x += 0.1) if (inPoly([x, z], pts)) row.push([x, z]);
      if (!row.length) continue;
      if (flip) row.reverse();
      const last = out[out.length - 1];
      if (last && !segInside(last, row[0], pts)) {
        const via = [row[0][0], last[1]];
        if (inPoly(via, pts)) out.push(via);
      }
      out.push(row[0], row[row.length - 1]);
      flip = !flip;
    }
    return out;
  }
  function renderVac() {
    if (!robot) return;
    const state = st(vacCfg.entity)?.state;
    const where = st(vacCfg.room_sensor)?.state;
    const room = rooms.find((r) => r.name === where || r.id === where);
    const docked = state === "docked" || state === "charging";
    if (state === "cleaning") {
      if (vac.state !== "cleaning" && (vac.state === "docked" || vac.state === null)) vac.pts = [];
      // ponytail: the robot crosses straight to the new room's first lane, a route through the doors if it looks bad
      if (room && room !== vac.room) { vac.room = room; vac.path = lanes(room).map(P); vac.pi = 0; }
      vac.on = vac.path.length > 0;
    } else if (state === "returning") {
      vac.room = null; vac.path = [P([dock.x, dock.z])]; vac.pi = 0; vac.on = true;
    } else {
      vac.on = false;
      vac.room = null;
      if (docked) { vac.rp = P([dock.x, dock.z]); vac.heading = 0; vac.pts = []; trail.setAttribute("points", ""); placeRobot(); }
    }
    vac.state = state;
    robot.classList.toggle("on", vac.on || state === "cleaning");
  }
  function stepVac() {
    if (!vac.on) return false;
    const t = vac.path[vac.pi];
    const dx = t[0] - vac.rp[0], dz = t[1] - vac.rp[1], dist = Math.hypot(dx, dz), sp = 0.7;
    if (dist < sp) {
      vac.rp = [t[0], t[1]];
      if (vac.pi < vac.path.length - 1) vac.pi++;
      else if (vac.state === "cleaning") { vac.path.reverse(); vac.pi = 0; } // keeps going over the room until it leaves
      else vac.on = false;
    } else {
      vac.rp = [vac.rp[0] + (dx / dist) * sp, vac.rp[1] + (dz / dist) * sp];
      vac.heading = (Math.atan2(dz, dx) * 180) / Math.PI;
    }
    placeRobot();
    // the trail keeps whole points (no string slicing) and is redrawn every few frames
    const last = vac.pts[vac.pts.length - 1];
    if (!last || Math.hypot(last[0] - vac.rp[0], last[1] - vac.rp[1]) > 3) {
      vac.pts.push([vac.rp[0], vac.rp[1]]);
      if (vac.pts.length > 3000) vac.pts.splice(0, 500);
    }
    if (++vac.tick % 4 === 0) trail.setAttribute("points", vac.pts.map((q) => q[0].toFixed(1) + "," + q[1].toFixed(1)).join(" "));
    return true;
  }

  // ---- animation loop: runs only while something moves and the card is on screen ----
  let raf = 0, attached = false;
  const frame = () => {
    const busy = stepSwings() | stepVac();
    raf = busy && attached ? requestAnimationFrame(frame) : 0;
  };
  const kick = () => { if (!raf && attached) raf = requestAnimationFrame(frame); };

  // ---- room sheet ----
  let sheetRoom = null;
  const row = (rows, html, cls = "row") => {
    const d = document.createElement("div");
    d.className = cls;
    d.innerHTML = html;
    rows.appendChild(d);
    return d;
  };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  function openSheet(id) {
    sheetRoom = id;
    const r = R[id];
    root$.querySelectorAll(".room-floor").forEach((f) => f.classList.toggle("sel", f.dataset.room === id));
    sheet.querySelector("h2").textContent = r.name;
    const { t, h } = roomClimate(r);
    sheet.querySelector(".sub").textContent =
      t != null ? `${num(t)} °C` + (h != null ? ` · ${Math.round(h)} % vlhkost` : "") : "bez čidla";
    const rows = sheet.querySelector(".rows");
    rows.innerHTML = "";
    const ids = Object.entries(lampGroups).filter(([, l]) => l.some((f) => roomAt(f.x, f.z) === r)).map(([e]) => e);
    for (const e of ids) {
      const line = row(rows, `<span>${esc(nameOf(e))}</span>`);
      const b = document.createElement("button");
      b.className = "sw" + (st(e)?.state === "on" ? " on" : "");
      b.setAttribute("aria-label", nameOf(e));
      b.onclick = () => toggle(e);
      line.appendChild(b);
    }
    for (const o of (plan.openings || []).filter((o) => o.room_id === id && o.contact)) {
      const open = isOpen(o);
      const label = o.type === "window" ? "Okno" : "Dveře";
      row(rows, `<span>${label}</span><span class="st${open ? " open" : ""}">${open ? "otevřeno" : "zavřeno"}</span>`, "row link")
        .addEventListener("click", () => moreInfo(o.contact));
    }
    for (const d of devices.filter((d) => roomAt(d.x, d.z) === r)) {
      const on = devActive(d);
      row(rows, `<span>${esc(d.name || nameOf(d.entity))}</span><span class="st">${esc(on ? devText(d, on) || "běží" : "vypnuto")}</span>`, "row link")
        .addEventListener("click", () => moreInfo(d.entity));
    }
    if (!rows.children.length) row(rows, "Nic k ovládání", "row hint");
    sheet.classList.add("open");
  }
  function closeSheet() {
    sheetRoom = null;
    sheet.classList.remove("open");
    root$.querySelectorAll(".room-floor").forEach((f) => f.classList.remove("sel"));
  }
  sheet.querySelector(".close").addEventListener("click", closeSheet);

  // ---- layout: a narrow card turns a wide plan 90°; on a small screen labels and icons grow so they stay readable ----
  let lastKey = "";
  function layout() {
    const w = app.clientWidth;
    if (!w) return;
    const rot = cfg().rotate;
    const portrait = rot === true || (rot === "auto" && w < 600 && W > H * 1.25);
    svg.setAttribute("viewBox", portrait ? `0 0 ${H} ${W}` : `0 0 ${W} ${H}`);
    stage.style.aspectRatio = portrait ? `${H} / ${W}` : `${W} / ${H}`;
    root.setAttribute("transform", portrait ? `translate(${H} 0) rotate(90)` : "");
    // screen px per plan px as drawn: a very wide card is capped by its height (max-height on the stage)
    const scale = Math.min(stage.clientWidth / (portrait ? H : W), stage.clientHeight / (portrait ? W : H)) || (w - 2) / (portrait ? H : W);
    const kL = Math.min(2.2, Math.max(0.5, 0.95 / scale)), kI = Math.min(1.5, Math.max(0.55, 0.8 / scale));
    const key = `${portrait}|${kL.toFixed(2)}|${kI.toFixed(2)}`;
    if (key === lastKey) return;
    lastKey = key;
    const turn = portrait ? -90 : 0;
    for (const g of gLabels.children) g.setAttribute("transform", `translate(${g.dataset.x} ${g.dataset.z}) rotate(${turn}) scale(${kL})`);
    for (const g of root.querySelectorAll(".pin")) g.setAttribute("transform", `translate(${g.dataset.x} ${g.dataset.z}) rotate(${turn}) scale(${kI})`);
    iconK = kI;
    if (robot) placeRobot();
    fitLabels();
  }
  const ro = new ResizeObserver(() => layout());
  const clock = () => {
    renderDevices(); // a finishing time counts down without a state change
  };
  let clockTimer = 0;

  // re-render only when one of the plan's entities changed (HA swaps the state object on every change)
  const tracked = new Set(["sun.sun"]);
  for (const id of Object.keys(lampGroups)) tracked.add(id);
  for (const o of plan.openings || []) if (o.contact) tracked.add(o.contact);
  for (const s of sensors) tracked.add(s.entity);
  for (const d of devices) { tracked.add(d.entity); if (d.info) tracked.add(d.info); ruleEntities(d.rules, tracked); }
  for (const r of rooms) ruleEntities(r.rules, tracked);
  for (const f of ruledFurniture) ruleEntities(f.rules, tracked);
  for (const t of tvs) tracked.add(t.entity);
  for (const r of rooms) { if (r.temperature) tracked.add(r.temperature); if (r.humidity) tracked.add(r.humidity); }
  if (vacCfg) { tracked.add(vacCfg.entity); if (vacCfg.room_sensor) tracked.add(vacCfg.room_sensor); }
  const seen = new Map();

  return {
    update(force = false) {
      const h = hass();
      if (!h) return;
      let changed = force;
      for (const id of tracked) {
        const s = h.states[id];
        if (seen.get(id) !== s) { seen.set(id, s); changed = true; }
      }
      if (!changed) return;
      renderMode(); renderLights(); renderOpenings(); renderFx(); renderDevices(); renderRuled(); renderLabels(); renderVac();
      if (sheetRoom) openSheet(sheetRoom);
      kick();
    },
    layout,
    attach() {
      attached = true;
      ro.observe(app);
      clearInterval(clockTimer);
      clock();
      clockTimer = setInterval(clock, 10000);
      layout();
      kick();
    },
    detach() {
      attached = false;
      ro.disconnect();
      clearInterval(clockTimer);
      cancelAnimationFrame(raf);
      raf = 0;
    },
  };
}

// Some dashboard add-on swaps window.customElements for a scoped-registry polyfill. An element
// defined before the swap is unknown to the new registry and HA shows "Custom element doesn't
// exist". Check again a few times and define a subclass in the registry that is current then.
function defineSafe(tag, cls) {
  const ensure = () => {
    if (customElements.get(tag)) return;
    try { customElements.define(tag, class extends cls {}); } catch (err) { /* defined meanwhile */ }
  };
  ensure();
  for (const ms of [500, 2000, 5000, 10000]) setTimeout(ensure, ms);
}

defineSafe("fns-floorplan-card", FnsFloorplanCard);

// visual editor of the card in the dashboard: the card's own options and a way to the plan editor
const EDITOR_SCHEMA = [
  { name: "mode", selector: { select: { mode: "dropdown", options: [
    { value: "auto", label: "Podle slunce" }, { value: "day", label: "Vždy den" }, { value: "night", label: "Vždy noc" },
  ] } } },
  { name: "rotate", selector: { select: { mode: "dropdown", options: [
    { value: "auto", label: "Automaticky (úzká karta)" }, { value: "true", label: "Vždy otočit o 90°" }, { value: "false", label: "Nikdy" },
  ] } } },
];
const EDITOR_LABELS = { mode: "Vzhled", rotate: "Otočení plánu" };

class FnsFloorplanCardEditor extends HTMLElement {
  setConfig(config) {
    this._config = config;
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    if (this._form) this._form.hass = hass;
  }

  _render() {
    if (!this._form) {
      this.innerHTML = `<div style="display:flex;flex-direction:column;gap:12px">
        <div class="fp-form"></div>
        <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
          <button class="fp-open">Upravit půdorys</button>
          <span style="color:var(--secondary-text-color);font-size:13px">Světla, spotřebiče, senzory, nábytek a jmenovky se upravují v panelu Půdorys v postranním menu.</span>
        </div></div>`;
      const btn = this.querySelector(".fp-open");
      btn.style.cssText = "cursor:pointer;padding:8px 16px;border-radius:18px;border:0;background:var(--primary-color);color:var(--text-primary-color,#fff);font:inherit;font-weight:500";
      btn.addEventListener("click", () => {
        // a full page load also closes the card editor dialog
        window.location.assign("/fns-floorplan");
      });
      this._form = document.createElement("ha-form");
      this._form.schema = EDITOR_SCHEMA;
      this._form.computeLabel = (s) => EDITOR_LABELS[s.name] || s.name;
      this._form.addEventListener("value-changed", (e) => {
        const v = { ...e.detail.value };
        const config = { ...this._config, mode: v.mode || "auto" };
        if (v.rotate === "true") config.rotate = true;
        else if (v.rotate === "false") config.rotate = false;
        else delete config.rotate;
        if (config.mode === "auto") delete config.mode;
        this.dispatchEvent(new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true }));
      });
      this.querySelector(".fp-form").appendChild(this._form);
    }
    this._form.hass = this._hass;
    const r = this._config?.rotate;
    this._form.data = { mode: this._config?.mode || "auto", rotate: r === true ? "true" : r === false ? "false" : "auto" };
  }
}
defineSafe("fns-floorplan-card-editor", FnsFloorplanCardEditor);
window.customCards = window.customCards || [];
window.customCards.push({
  type: "fns-floorplan-card",
  name: "FNS Floorplan",
  description: "Animovaný 2D půdorys se živým stavem domácnosti.",
  preview: false,
});
console.info(`%c FNS-FLOORPLAN %c ${VERSION} `, "color:#fff;background:#6366f1;border-radius:3px 0 0 3px", "color:#6366f1;background:#eef");
