import { useState, useEffect, useMemo } from "react";

/* ─── FONT LOADER ─── */
function useFonts() {
  useEffect(() => {
    const id = "bw-pvp-fonts";
    if (!document.getElementById(id)) {
      const l = document.createElement("link");
      l.id = id;
      l.rel = "stylesheet";
      l.href =
        "https://fonts.googleapis.com/css2?family=Oxanium:wght@400;600;700;800;900&family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600&display=swap";
      document.head.appendChild(l);
    }
  }, []);
}

/* ─── ICONS ─── */
const SunIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="4" />
    <line x1="12" y1="2" x2="12" y2="6" />
    <line x1="12" y1="18" x2="12" y2="22" />
    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
    <line x1="2" y1="12" x2="6" y2="12" />
    <line x1="18" y1="12" x2="22" y2="12" />
    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
  </svg>
);

const MoonIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const ChevronIcon = ({ open }) => (
  <svg
    width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
    style={{ transition: "transform 0.3s ease", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

/* ─── DATA ─── */

const PVP = [
  {
    name: "Sprint Control (No Sprint Tech)",
    icon: "🔴",
    color: "#ef4444",
    rgb: "239,68,68",
    diff: "Core Tech",
    what:
      "In Roblox BedWars, sprinting increases how much knockback you receive. Not sprinting means you take less KB — but you move slower and lose some attack range. The tech is knowing exactly when to use it.",
    how: [
      "Only turn sprint off when you are already at point-blank range and actively trading hits",
      "If you are chasing or need to close distance, sprint is still required — walking is too slow to maintain range",
      "In a close tracking fight where neither player is trying to escape, no sprint = less KB buildup on you",
      "If the enemy starts running or you lose the close range angle, re-sprint immediately to not fall behind",
      "Never go no-sprint on a bridge or near a void — the reduced KB resistance isn't worth the slower movement in risky spots",
    ],
    tips: [
      "This is NOT the same as w-tap or s-tap — those don't work in Roblox BedWars",
      "Most useful in tight corridors, bed fights, or 1v1 tracking scenarios",
      "Sprint toggle keybind makes it easier to switch quickly mid-fight",
      "On high ping, no-sprint is riskier — you can get stuck out of range if the enemy creates separation",
    ],
  },
  {
    name: "Strafing",
    icon: "🟡",
    color: "#eab308",
    rgb: "234,179,8",
    diff: "Intermediate",
    what:
      "Move left and right unpredictably while attacking to make it harder for enemies to land hits and to control fight positioning.",
    how: [
      "Hold A or D while engaging instead of walking straight in",
      "Switch directions mid-fight every 1-2 hits",
      "Never stand still — always be moving",
      "Combine with sprint control for full positional management",
    ],
    tips: [
      "Use natural terrain and edges to amplify strafe angles",
      "Works best with lower ping",
      "Counter strafing: track with your crosshair and time your swing to their movement",
    ],
  },
  {
    name: "Combo Control",
    icon: "💜",
    color: "#8b5cf6",
    rgb: "139,92,246",
    diff: "Intermediate",
    what:
      "Keep an enemy in a consistent knockback chain so they never get to reset or retaliate cleanly.",
    how: [
      "Land first hit and sprint-in to maintain follow-up pressure",
      "Every swing should push them further from their reset position",
      "Use rod mid-combo to pull them back if they reach a block or wall",
      "Don't spam clicks — time each hit at max reach",
    ],
    tips: [
      "Don't chase into their blocks — bait them out first",
      "Sword reach is further than it looks — use max range",
      "Losing combo? Step back, reset, and re-engage with better positioning",
    ],
  },
  {
    name: "Rod Usage",
    icon: "🎣",
    color: "#06b6d4",
    rgb: "6,182,212",
    diff: "Intermediate",
    what:
      "Fishing rod pulls enemies toward you when they're blocking or retreating — key for combo openers and resets.",
    how: [
      "Right click rod to pull the enemy when they're blocking or backing off",
      "Use it to stop someone running away mid-combo",
      "Don't throw randomly — wait for a clean pull window",
      "After pull, immediately swap back to sword and swing",
    ],
    tips: [
      "Rod into knockback = very strong edge push toward void",
      "Keep rod in a fast-access hotbar slot",
      "Can interrupt ledge-jumping escapes cleanly",
    ],
  },
  {
    name: "Ping Awareness",
    icon: "📡",
    color: "#10b981",
    rgb: "16,185,129",
    diff: "Advanced",
    what:
      "Your ping affects when your hits register. High ping players need to swing earlier and anticipate enemy position.",
    how: [
      "On high ping (100ms+): lead your swings slightly ahead of where the enemy visually is",
      "On low ping: you can react faster and play more reactively",
      "Check server ping before deciding how aggressive to play",
      "On bad ping: prioritize combo control over raw aggression",
    ],
    tips: [
      "High ping: rely more on defensive spacing and safer trades",
      "Low ping: sprint-in aggression is more consistent and punishing",
      "VPN to a closer server if playing cross-region",
    ],
  },
  {
    name: "Positioning",
    icon: "📐",
    color: "#f59e0b",
    rgb: "245,158,11",
    diff: "Core Tech",
    what:
      "Where you stand during a fight determines who takes more KB, who has escape routes, and who can reset. Positioning beats raw damage output every time.",
    how: [
      "Always fight with your back to safety, not toward the void or edges",
      "Higher ground = more knockback onto the enemy when you hit down",
      "Deny the enemy high ground by contesting it before the fight starts",
      "In multi-player fights, position so you don't take hits from multiple angles",
    ],
    tips: [
      "A well-positioned player with average gear beats a poorly positioned player with better gear",
      "Check your surroundings before committing to a fight — know your escape route",
      "In base fights: control the bridge entry point so 1v2s happen on your terms",
    ],
  },
];

const MS_SECTIONS = [
  {
    title: "How Hitreg Works",
    color: "#ef4444",
    rgb: "239,68,68",
    items: [
      { k: "Hit Cap", v: "Roblox caps hit registration at 34 hits per 10 seconds server-side.", note: "" },
      { k: "What that means", v: "Clicking faster than 3.4 CPS doesn't give more hits — extras are ignored by the server.", note: "" },
      { k: "Optimal target", v: "3.4 CPS is the sweet spot to hit the cap consistently without wasting inputs.", note: "" },
      { k: "XMBC advantage", v: "XMBC fires consistent timed inputs which land closer to the 3.4 CPS cap than manual clicking.", note: "" },
    ],
  },
  {
    title: "Mouse Settings",
    color: "#8b5cf6",
    rgb: "139,92,246",
    items: [
      { k: "DPI", v: "800–1600 DPI. Find what lets you aim consistently. 800 DPI is most common for BedWars.", note: "" },
      { k: "In-game sensitivity", v: "Set sensitivity so a full arm swipe ≈ 180°. Most players sit at 0.4–0.8.", note: "" },
      { k: "Polling rate", v: "500Hz or 1000Hz. Higher polling = more responsive inputs, negligible in-game difference.", note: "" },
      { k: "Raw Input", v: "Enable raw input in Roblox settings — removes mouse acceleration from the OS.", note: "" },
    ],
  },
  {
    title: "Natural CPS Training",
    color: "#10b981",
    rgb: "16,185,129",
    items: [
      { k: "Goal", v: "Train yourself to click consistently at 3–4 CPS for reliable hitreg without any tools.", note: "" },
      { k: "Regular click", v: "Slow, deliberate 3–4 clicks per second. Most reliable and comfortable long term.", note: "Recommended" },
      { k: "Practice tool", v: "Use clickspeedtest.net to check your CPS consistency. Aim for low variance, not high peak.", note: "" },
      { k: "Jitter click", v: "Tense forearm slightly and vibrate your finger — gives 6–10 CPS but only 3–4 register.", note: "" },
    ],
  },
];

const FFLAGS = [
  // FPS
  { name: "DFIntTaskSchedulerTargetFps", val: "9999", desc: "Uncaps the internal FPS scheduler. Pair with an FPS unlocker.", category: "FPS" },
  { name: "FFlagDisablePostFx", val: "True", desc: "Disables post-processing effects like bloom and depth of field. Major FPS boost.", category: "FPS" },
  { name: "FFlagRenderNoLowFrequencyLighting", val: "True", desc: "Disables low-frequency ambient lighting calculations. Noticeable FPS gain.", category: "FPS" },
  { name: "FIntShadowMapMeshBias", val: "1", desc: "Reduces shadow map complexity. Fewer shadows drawn = more FPS in combat.", category: "FPS" },
  { name: "FIntDebugForceMSAASamples", val: "1", desc: "Sets MSAA (anti-aliasing samples) to minimum. Less AA = better FPS.", category: "FPS" },
  { name: "FIntGrassMovementReducedMotionFactor", val: "0", desc: "Disables animated grass movement. Small but consistent FPS gain.", category: "FPS" },
  { name: "FIntFRMMinGrassDistance", val: "0", desc: "Sets minimum grass draw distance to zero. No grass rendered at any range.", category: "FPS" },
  { name: "FIntFRMMaxGrassDistance", val: "0", desc: "Sets maximum grass draw distance to zero. Fully eliminates grass rendering.", category: "FPS" },
  { name: "DFIntDebugFRMQualityLevelOverride", val: "1", desc: "Overrides the FRM (Frame Rate Manager) quality level to minimum.", category: "FPS" },
  // Graphics
  { name: "FFlagDebugForceFutureIsBright3", val: "False", desc: "Disables the future lighting engine. Older lighting is significantly more performant.", category: "Graphics" },
  { name: "FFlagDebugGraphicsPreferD3D11", val: "True", desc: "Forces Direct3D 11 rendering path for better stability on most Windows setups.", category: "Graphics" },
  { name: "FFlagDebugSkyGray", val: "True", desc: "Replaces the sky with a flat gray. Removes skybox rendering overhead entirely.", category: "Graphics" },
  { name: "DFFlagTextureQualityOverrideEnabled", val: "True", desc: "Enables the texture quality override system so DFIntTextureQualityOverride takes effect.", category: "Graphics" },
  { name: "DFIntTextureQualityOverride", val: "1", desc: "Forces texture quality to level 1 (lowest). Reduces VRAM usage and GPU load.", category: "Graphics" },
  { name: "DFIntCSGLevelOfDetailSwitchingDistance", val: "0", desc: "Disables CSG mesh LOD switching. All union/mesh parts rendered at base LOD.", category: "Graphics" },
  { name: "DFIntCSGLevelOfDetailSwitchingDistanceL12", val: "0", desc: "Sets L1-L2 CSG LOD switching distance to zero.", category: "Graphics" },
  { name: "DFIntCSGLevelOfDetailSwitchingDistanceL23", val: "0", desc: "Sets L2-L3 CSG LOD switching distance to zero.", category: "Graphics" },
  { name: "DFIntCSGLevelOfDetailSwitchingDistanceL34", val: "0", desc: "Sets L3-L4 CSG LOD switching distance to zero.", category: "Graphics" },
  { name: "DFFlagDebugPauseVoxelizer", val: "True", desc: "Pauses the voxelizer used for ambient lighting. Removes a background CPU cost.", category: "Graphics" },
  // Performance
  { name: "FIntRomarkBackgroundFrameRate", val: "0", desc: "Prevents Roblox throttling FPS when the window is out of focus.", category: "Performance" },
  { name: "FFlagEnableReloadableAssets", val: "False", desc: "Disables dynamic asset reloading, reducing memory spikes during gameplay.", category: "Performance" },
  { name: "DFFlagDisableDPIScale", val: "True", desc: "Disables DPI scaling in Roblox. Can improve rendering performance on high-DPI screens.", category: "Performance" },
  // Latency
  { name: "DFIntMaxFrameBufferSize", val: "4", desc: "Limits frame buffer size. Reduces input latency at the cost of some visual smoothness.", category: "Latency" },
  // Window
  { name: "FFlagHandleAltEnterFullscreenManually", val: "False", desc: "Disables Roblox's manual fullscreen handling. Lets the OS manage it for lower overhead.", category: "Window" },
  { name: "FFlagDebugGraphicsDisableDirect3D11", val: "True", desc: "Forces OpenGL on Windows. Can improve stability on some GPU configurations.", category: "Window" },
  { name: "DFIntRenderShadowIntensity", val: "0", desc: "Sets shadow intensity to 0. Essentially removes shadows completely.", category: "Performance" },
];

const FPS_TIPS = [
  {
    title: "Roblox Graphics Settings",
    icon: "🖥️",
    color: "#8b5cf6",
    steps: [
      "Set Roblox graphics quality to 1–3. Anything higher is wasted for BedWars.",
      "Disable shadows in graphics settings if the option appears.",
      "Turn off fullscreen mode and use borderless window instead — lower input latency.",
      "Set to 1080p or native resolution. Lower res doesn't help much in Roblox.",
    ],
  },
  {
    title: "Windows Optimization",
    icon: "🪟",
    color: "#ef4444",
    steps: [
      "Set Windows power plan to High Performance (Search: Power & sleep settings > Additional power settings).",
      "Disable Xbox Game Bar (Settings > Gaming > Xbox Game Bar > Off).",
      "Close all background apps: Discord, browsers, Spotify. Kill anything using GPU/CPU.",
      "Right-click RobloxPlayerBeta.exe > Properties > Compatibility > Disable fullscreen optimizations.",
      "Set RobloxPlayerBeta.exe to High priority in Task Manager > Details tab.",
    ],
  },
  {
    title: "FPS Unlocker",
    icon: "🔓",
    color: "#f59e0b",
    steps: [
      "Use rbxfpsunlocker (GitHub). Removes Roblox's default 60 FPS cap.",
      "Set target FPS to 144 or 240 depending on your monitor.",
      "Even on a 60Hz monitor, higher FPS reduces input latency noticeably.",
      "Combine with DFIntTaskSchedulerTargetFps=9999 fflag for best results.",
    ],
  },
  {
    title: "Hardware Tips",
    icon: "⚡",
    color: "#10b981",
    steps: [
      "Use an ethernet cable instead of WiFi — reduces ping variance massively.",
      "Make sure your monitor is running at its max refresh rate (right-click desktop > Display settings).",
      "Update GPU drivers. Outdated drivers cause stutters and lower average FPS.",
      "If on laptop: plug in while playing. Battery mode throttles CPU/GPU aggressively.",
    ],
  },
];

const STRAPS = [
  {
    name: "Snap Trap (Trapper Kit)",
    icon: "🪤",
    color: "#06b6d4",
    rgb: "6,182,212",
    status: "Kit-only",
    link: "https://robloxbedwars.fandom.com/wiki/Snap_Trap",
    what: "A Trapper kit item that places a hidden floor trap. Enemies stepping on it trigger crowd-control and become easier to finish.",
    placement: ["Place in bridge choke points where players sprint in straight lines", "Hide it just outside your bed defense so rushers trigger before entering", "Drop one after forcing enemies to path through a narrow side route"],
    counters: "Look for suspicious floor placements and clear them with safe spacing before hard pushing.",
    tips: ["Best value when you force movement into one lane", "Place during downtime, not while being directly rushed", "Pair with team focus fire when the trap triggers"],
  },
  {
    name: "Tesla Coil Trap",
    icon: "⚡",
    color: "#ef4444",
    rgb: "239,68,68",
    status: "Item shop",
    link: "https://robloxbedwars.fandom.com/wiki/Tesla_Coil_Trap",
    what: "A placeable trap block that zaps nearby enemy players for repeated damage over time.",
    placement: ["Place near your bed entrance so enemies must either tank damage or stop to break it", "Use around mid control platforms to punish close-range fights", "Protect it with blocks so fireballs/TNT cannot remove it instantly"],
    counters: "Break it immediately from range with projectiles or quickly melee it before full commit.",
    tips: ["Strongest when enemies are forced to hold space nearby", "Don’t place it where opponents can ignore it and walk around", "Use when defending against repeated team pushes"],
  },
  {
    name: "Gloop (Glue Trap Projectile)",
    icon: "🟢",
    color: "#f59e0b",
    rgb: "245,158,11",
    status: "Item shop",
    link: "https://robloxbedwars.fandom.com/wiki/Gloop",
    what: "A throwable trap-like projectile that slows and grounds enemies, disabling many movement tools.",
    placement: ["Throw into chokepoints before melee engage", "Use on bridge fights to prevent escape tools", "Pre-throw on enemies preparing to pearl or mobility rush"],
    counters: "Bait the throw first, then re-engage while it is on cooldown.",
    tips: ["Use as engage setup instead of panic throw", "Great against mobility-heavy kits", "Coordinate timing so teammates swing right as it procs"],
  },
  {
    name: "Fish Trap (Fish Net - Removed)",
    icon: "🐟",
    color: "#f97316",
    rgb: "249,115,22",
    status: "Removed item",
    link: "https://robloxbedwars.fandom.com/wiki/Fish_Net",
    what: "Fish Net was a trap-style utility item from older updates and is no longer available in normal matches.",
    placement: ["Historical item: no current placement in live queues", "Only relevant for old clips/legacy discussions", "Can appear in older guide references as a 'fish trap'"],
    counters: "Not needed in current games because this item is removed.",
    tips: ["Use current trap tools like Tesla/Gloop instead", "If you see old tutorials with fish trap paths, treat them as outdated", "Keep this entry as a quick reality check for returning players"],
  },
  {
    name: "Glue Trap (Unused/Test Item)",
    icon: "🧪",
    color: "#7c3aed",
    rgb: "124,58,237",
    status: "Unused content",
    link: "https://robloxbedwars.fandom.com/wiki/Glue_Trap",
    what: "Glue Trap exists as unused/test content and is not part of normal gameplay.",
    placement: ["Not placeable in current public matches", "Do not rely on this in ranked strategy", "Listed to prevent confusion with the active Gloop item"],
    counters: "No counter needed in live queues.",
    tips: ["People often confuse Glue Trap with Gloop", "If a guide says Glue Trap is buyable, it is outdated", "Use Gloop page for live mechanics"],
  },
  {
    name: "Trap Reality Check",
    icon: "✅",
    color: "#10b981",
    rgb: "16,185,129",
    status: "Guide note",
    link: "https://robloxbedwars.fandom.com/wiki/Item_Shop",
    what: "Use this tab for currently recognized trap-style items and clearly marked removed/unused entries.",
    placement: ["Prefer pages with update history when checking item availability", "If an item is marked removed, don't build ranked strategies around it", "Check patch notes before trusting old clips"],
    counters: "Counter misinformation by verifying with current item pages.",
    tips: ["This section now prioritizes real items + status labels", "Returning players should double-check old trap memories", "Keep links handy so teammates can confirm quickly"],
  },
];

/* ─── SNOW ─── */
function SnowLayer() {
  const flakes = useMemo(
    () =>
      Array.from({ length: 34 }, (_, i) => ({
        id: i,
        left: `${(i * 2.9 + (i % 7) * 11) % 100}%`,
        size: 4 + (i % 4),
        duration: 8 + (i % 6) * 1.2,
        delay: (i % 10) * 0.8,
      })),
    []
  );
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 1 }}>
      {flakes.map((f) => (
        <span
          key={f.id}
          style={{
            position: "absolute", left: f.left, top: -20,
            width: f.size, height: f.size, borderRadius: "50%",
            background: "rgba(255,255,255,.88)",
            animation: `snow-fall ${f.duration}s linear ${f.delay}s infinite, snow-sway ${3.6 + (f.id % 5)}s ease-in-out ${f.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

/* ─── AMBIENT ─── */
function Ambient() {
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
      <div style={{ position: "absolute", width: 420, height: 420, borderRadius: "50%", top: -80, left: -80, background: "radial-gradient(circle,rgba(239,68,68,.09) 0%,transparent 70%)" }} />
      <div style={{ position: "absolute", width: 320, height: 320, borderRadius: "50%", top: "15%", right: -40, background: "radial-gradient(circle,rgba(245,158,11,.07) 0%,transparent 70%)" }} />
      <div style={{ position: "absolute", width: 360, height: 360, borderRadius: "50%", bottom: -40, right: "10%", background: "radial-gradient(circle,rgba(139,92,246,.07) 0%,transparent 70%)" }} />
    </div>
  );
}

/* ─── XMBC CARD ─── */
function XmbcCard({ dark }) {
  const [copied, setCopied] = useState(false);
  const seq = "{LMB}{LMB}{WAITMX:1.05}{LMB}{LMB}";
  const handleCopy = () => {
    navigator.clipboard.writeText(seq).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };
  const card = {
    borderRadius: 20,
    background: dark ? "rgba(14,15,22,.78)" : "rgba(255,255,255,.84)",
    border: `1px solid ${dark ? "rgba(255,255,255,.07)" : "rgba(0,0,0,.08)"}`,
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    padding: "20px",
  };
  const label = { fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: "'DM Mono',monospace" };
  const muted = { color: dark ? "rgba(255,255,255,.5)" : "rgba(0,0,0,.55)", fontSize: 13, lineHeight: 1.65 };

  return (
    <div style={card}>
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 16 }}>
        <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#f59e0b", boxShadow: "0 0 8px #f59e0b80" }} />
        <span style={{ ...label, color: "#f59e0b" }}>X-Mouse Button Control (XMBC) Setup</span>
      </div>

      {/* sequence field */}
      <div style={{ background: dark ? "rgba(245,158,11,.06)" : "rgba(245,158,11,.06)", border: "1px solid rgba(245,158,11,.18)", borderRadius: 14, padding: "14px 16px", marginBottom: 12 }}>
        <div style={{ ...label, color: "rgba(255,255,255,.4)", marginBottom: 8 }}>Key Sequence (paste into XMBC)</div>
        <div style={{ background: dark ? "rgba(0,0,0,.35)" : "rgba(0,0,0,.06)", border: `1px solid ${dark ? "rgba(255,255,255,.12)" : "rgba(0,0,0,.12)"}`, borderRadius: 10, padding: "10px 14px", fontFamily: "'DM Mono',monospace", fontSize: 12, color: "#10b981", letterSpacing: ".02em", wordBreak: "break-all" }}>
          {seq}
        </div>
        <button
          onClick={handleCopy}
          style={{ marginTop: 9, background: copied ? "rgba(16,185,129,.1)" : "rgba(255,255,255,.06)", border: `1px solid ${copied ? "rgba(16,185,129,.4)" : "rgba(255,255,255,.1)"}`, color: copied ? "#10b981" : "rgba(255,255,255,.6)", padding: "4px 10px", borderRadius: 8, fontSize: 11, cursor: "pointer", fontFamily: "'DM Mono',monospace", transition: "all .18s" }}
        >
          {copied ? "Copied!" : "Copy sequence"}
        </button>
      </div>

      {/* settings grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
        {[
          { k: "How to send", v: "6 Repeatedly while button is down", vc: dark ? "rgba(255,255,255,.7)" : "rgba(0,0,0,.7)" },
          { k: "Auto repeat delay", v: "25 milliseconds", vc: "#10b981" },
        ].map((row) => (
          <div key={row.k} style={{ background: dark ? "rgba(255,255,255,.03)" : "rgba(0,0,0,.022)", border: `1px solid ${dark ? "rgba(255,255,255,.07)" : "rgba(0,0,0,.07)"}`, borderRadius: 14, padding: "14px 16px" }}>
            <div style={{ ...label, color: "rgba(255,255,255,.4)", marginBottom: 5 }}>{row.k}</div>
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 12.5, color: row.vc }}>{row.v}</div>
          </div>
        ))}
      </div>

      {/* checkboxes */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 13 }}>
        {[
          { checked: true, label: "Block original mouse input — enabled" },
          { checked: false, label: "Randomise auto repeat delay by 10% — disabled" },
          { checked: false, label: "Block original mouse input only if active window matches — off" },
          { checked: false, label: "Only send if profile's process is active — off" },
        ].map((row, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 13, color: row.checked ? (dark ? "rgba(255,255,255,.6)" : "rgba(0,0,0,.6)") : "rgba(255,255,255,.3)" }}>
            <div style={{ width: 16, height: 16, borderRadius: 4, background: row.checked ? "rgba(59,130,246,.25)" : "rgba(255,255,255,.06)", border: `1.5px solid ${row.checked ? "#3b82f6" : "rgba(255,255,255,.2)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 10, color: "#3b82f6" }}>
              {row.checked ? "✓" : ""}
            </div>
            <span>{row.label}</span>
          </div>
        ))}
      </div>

      {/* explanation */}
      <div style={{ background: "rgba(239,68,68,.06)", border: "1px solid rgba(239,68,68,.18)", borderRadius: 12, padding: "11px 14px" }}>
        <p style={{ fontSize: 12.5, lineHeight: 1.65, color: dark ? "rgba(255,255,255,.5)" : "rgba(0,0,0,.55)" }}>
          The <span style={{ color: "#f59e0b", fontFamily: "'DM Mono',monospace" }}>{"{WAITMX:1.05}"}</span> tag waits ~1.05ms between bursts. Combined with 25ms auto repeat delay and 10% randomization, this fires at roughly <strong style={{ color: "#10b981" }}>3.4 CPS</strong> — exactly at the Roblox hitreg cap.
        </p>
      </div>
    </div>
  );
}

/* ─── PVP CARD ─── */
function PvpCard({ p, dark }) {
  const [open, setOpen] = useState(false);
  const diffColor = p.diff === "Core Tech" ? "#ef4444" : p.diff === "Intermediate" ? "#f59e0b" : "#10b981";
  const cardBg = dark ? "rgba(14,15,22,.78)" : "rgba(255,255,255,.84)";

  return (
    <div
      onClick={() => setOpen((o) => !o)}
      style={{ borderRadius: 20, background: cardBg, border: `1px solid ${open ? `rgba(${p.rgb},.34)` : dark ? "rgba(255,255,255,.07)" : "rgba(0,0,0,.08)"}`, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", cursor: "pointer", overflow: "hidden", transition: ".28s ease", userSelect: "none", WebkitTapHighlightColor: "transparent" }}
    >
      <div style={{ height: 3, background: `linear-gradient(90deg, transparent, ${p.color}, transparent)`, opacity: open ? 1 : 0.5 }} />
      <div style={{ padding: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 46, height: 46, borderRadius: 14, flexShrink: 0, background: `linear-gradient(135deg,rgba(${p.rgb},.18),rgba(${p.rgb},.06))`, border: `1px solid rgba(${p.rgb},.22)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{p.icon}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: "'DM Mono',monospace", color: p.color, marginBottom: 3 }}>{p.name}</div>
            <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 999, fontFamily: "'DM Mono',monospace", textTransform: "uppercase", letterSpacing: ".06em", background: `${diffColor}18`, color: diffColor, border: `1px solid ${diffColor}30` }}>{p.diff}</span>
          </div>
          <div style={{ color: dark ? "rgba(255,255,255,.3)" : "rgba(0,0,0,.3)" }}>
            <ChevronIcon open={open} />
          </div>
        </div>

        <p style={{ margin: "12px 0 0", fontSize: 13.4, lineHeight: 1.7, color: dark ? "rgba(255,255,255,.52)" : "rgba(0,0,0,.55)" }}>{p.what}</p>

        <div style={{ overflow: "hidden", maxHeight: open ? 900 : 0, opacity: open ? 1 : 0, transition: "max-height 0.45s cubic-bezier(0.32,0.72,0,1), opacity 0.25s ease" }}>
          <div style={{ paddingTop: 14, display: "flex", flexDirection: "column", gap: 9 }}>
            {/* how to */}
            <div style={{ background: `rgba(${p.rgb},.06)`, border: `1px solid rgba(${p.rgb},.14)`, borderRadius: 14, padding: "13px 15px" }}>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: "'DM Mono',monospace", color: p.color, marginBottom: 9 }}>How to do it</div>
              {p.how.map((h, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 7 }}>
                  <div style={{ width: 22, height: 22, borderRadius: 7, background: `rgba(${p.rgb},.12)`, border: `1px solid rgba(${p.rgb},.22)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, fontFamily: "'DM Mono',monospace", color: p.color, flexShrink: 0 }}>{i + 1}</div>
                  <p style={{ margin: "2px 0 0", fontSize: 13, lineHeight: 1.65, color: dark ? "rgba(255,255,255,.58)" : "rgba(0,0,0,.58)" }}>{h}</p>
                </div>
              ))}
            </div>
            {/* tips */}
            <div style={{ background: dark ? "rgba(255,255,255,.025)" : "rgba(0,0,0,.022)", border: `1px solid ${dark ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.06)"}`, borderRadius: 14, padding: "13px 15px" }}>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: "'DM Mono',monospace", color: dark ? "rgba(255,255,255,.35)" : "rgba(0,0,0,.35)", marginBottom: 8 }}>Tips</div>
              {p.tips.map((t, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 6 }}>
                  <span style={{ color: p.color, fontSize: 13, flexShrink: 0 }}>•</span>
                  <p style={{ margin: 0, fontSize: 13, lineHeight: 1.65, color: dark ? "rgba(255,255,255,.5)" : "rgba(0,0,0,.5)" }}>{t}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── MS SECTION ─── */
function MsSection({ dark }) {
  const cardStyle = { borderRadius: 20, background: dark ? "rgba(14,15,22,.78)" : "rgba(255,255,255,.84)", border: `1px solid ${dark ? "rgba(255,255,255,.07)" : "rgba(0,0,0,.08)"}`, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", padding: "18px 20px" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <XmbcCard dark={dark} />
      {MS_SECTIONS.map((sec) => (
        <div key={sec.title} style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 13 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: sec.color, boxShadow: `0 0 8px ${sec.color}60` }} />
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: "'DM Mono',monospace", color: sec.color }}>{sec.title}</span>
          </div>
          {sec.items.map((item) => (
            <div key={item.k} style={{ background: dark ? "rgba(255,255,255,.03)" : "rgba(0,0,0,.022)", border: `1px solid ${dark ? "rgba(255,255,255,.07)" : "rgba(0,0,0,.07)"}`, borderRadius: 14, padding: "14px 16px", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: 12, fontWeight: 700, fontFamily: "'DM Mono',monospace", color: dark ? "rgba(255,255,255,.75)" : "rgba(0,0,0,.7)" }}>{item.k}</span>
                {item.note && (
                  <span style={{ fontSize: 10, padding: "5px 11px", borderRadius: 999, fontFamily: "'DM Mono',monospace", fontWeight: 600, background: item.note === "Recommended" ? "rgba(16,185,129,.1)" : "rgba(239,68,68,.1)", color: item.note === "Recommended" ? "#10b981" : "#ef4444", border: `1px solid ${item.note === "Recommended" ? "rgba(16,185,129,.22)" : "rgba(239,68,68,.22)"}` }}>{item.note}</span>
                )}
              </div>
              <p style={{ margin: "5px 0 0", fontSize: 13, lineHeight: 1.65, color: dark ? "rgba(255,255,255,.48)" : "rgba(0,0,0,.52)" }}>{item.v}</p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/* ─── FFLAGS SECTION ─── */
function FflagsSection({ dark }) {
  const [copiedKey, setCopiedKey] = useState(null);

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1500);
    });
  };

  const allJson =
    "{\n" + FFLAGS.map((f) => `  "${f.name}": "${f.val}"`).join(",\n") + "\n}";

  const catColors = { FPS: "#ef4444", Performance: "#f59e0b", Graphics: "#8b5cf6", Memory: "#10b981", Latency: "#06b6d4", Window: "#94a3b8" };
  const cats = [...new Set(FFLAGS.map((f) => f.category))];

  const cardStyle = { borderRadius: 20, background: dark ? "rgba(14,15,22,.78)" : "rgba(255,255,255,.84)", border: `1px solid ${dark ? "rgba(255,255,255,.07)" : "rgba(0,0,0,.08)"}`, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", padding: "18px 20px" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* setup card */}
      <div style={cardStyle}>
        <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: "'DM Mono',monospace", color: "#10b981", marginBottom: 10 }}>How to apply FFlags</div>
        {["Open File Explorer:", "Go to: %LOCALAPPDATA%/Roblox/Versions/", "Open your current version folder", "Find or create ClientAppSettings.json", "Paste flags as a JSON object"].map((s, i) => (
          <div key={i} style={{ display: "flex", gap: 9, alignItems: "flex-start", marginBottom: 7 }}>
            <div style={{ width: 20, height: 20, borderRadius: 7, background: "rgba(16,185,129,.1)", border: "1px solid rgba(16,185,129,.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, fontFamily: "'DM Mono',monospace", color: "#10b981", flexShrink: 0 }}>{i + 1}</div>
            <p style={{ margin: "1px 0 0", fontSize: 12.5, lineHeight: 1.65, color: dark ? "rgba(255,255,255,.5)" : "rgba(0,0,0,.5)" }}>{s}</p>
          </div>
        ))}
        <button
          onClick={() => handleCopy(allJson, "all")}
          style={{ marginTop: 12, background: copiedKey === "all" ? "rgba(16,185,129,.1)" : "rgba(255,255,255,.06)", border: `1px solid ${copiedKey === "all" ? "rgba(16,185,129,.4)" : "rgba(255,255,255,.1)"}`, color: copiedKey === "all" ? "#10b981" : "rgba(255,255,255,.6)", padding: "7px 14px", borderRadius: 8, fontSize: 12, cursor: "pointer", fontFamily: "'DM Mono',monospace", transition: "all .18s" }}
        >
          {copiedKey === "all" ? "Copied!" : `Copy all ${FFLAGS.length} flags as JSON`}
        </button>
      </div>

      {/* per-category cards */}
      {cats.map((cat) => {
        const catFlags = FFLAGS.filter((f) => f.category === cat);
        const col = catColors[cat] || "#888";
        return (
          <div key={cat} style={cardStyle}>
            <div style={{ marginBottom: 13 }}>
              <span style={{ fontSize: 11, padding: "5px 11px", borderRadius: 999, fontFamily: "'DM Mono',monospace", fontWeight: 600, background: `rgba(${hexToRgbStr(col)},.1)`, color: col, border: `1px solid rgba(${hexToRgbStr(col)},.22)` }}>{cat} ({catFlags.length})</span>
            </div>
            {catFlags.map((f) => (
              <div key={f.name} style={{ background: dark ? "rgba(255,255,255,.025)" : "rgba(0,0,0,.022)", border: `1px solid ${dark ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.06)"}`, borderRadius: 14, padding: "13px 15px", marginBottom: 8, display: "flex", flexDirection: "column", gap: 7 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                  <code style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: dark ? "rgba(255,255,255,.8)" : "rgba(0,0,0,.7)", wordBreak: "break-all" }}>{f.name}</code>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, flexShrink: 0 }}>
                    <code style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", background: "rgba(16,185,129,.1)", color: "#10b981", padding: "3px 8px", borderRadius: 7, border: "1px solid rgba(16,185,129,.2)" }}>{f.val}</code>
                    <button
                      onClick={() => handleCopy(`"${f.name}": "${f.val}"`, f.name)}
                      style={{ background: copiedKey === f.name ? "rgba(16,185,129,.1)" : "rgba(255,255,255,.06)", border: `1px solid ${copiedKey === f.name ? "rgba(16,185,129,.4)" : "rgba(255,255,255,.1)"}`, color: copiedKey === f.name ? "#10b981" : "rgba(255,255,255,.6)", padding: "4px 10px", borderRadius: 8, fontSize: 11, cursor: "pointer", fontFamily: "'DM Mono',monospace", transition: "all .18s", whiteSpace: "nowrap" }}
                    >
                      {copiedKey === f.name ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: 12, lineHeight: 1.6, color: dark ? "rgba(255,255,255,.42)" : "rgba(0,0,0,.45)" }}>{f.desc}</p>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

function hexToRgbStr(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

/* ─── FPS SECTION ─── */
function FpsSection({ dark }) {
  const cardStyle = { borderRadius: 20, background: dark ? "rgba(14,15,22,.78)" : "rgba(255,255,255,.84)", border: `1px solid ${dark ? "rgba(255,255,255,.07)" : "rgba(0,0,0,.08)"}`, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", padding: "20px" };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {FPS_TIPS.map((sec) => (
        <div key={sec.title} style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 15 }}>
            <span style={{ fontSize: 22 }}>{sec.icon}</span>
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: "'DM Mono',monospace", color: sec.color }}>{sec.title}</span>
          </div>
          {sec.steps.map((s, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 8 }}>
              <div style={{ width: 24, height: 24, borderRadius: 8, background: `rgba(${hexToRgbStr(sec.color)},.1)`, border: `1px solid rgba(${hexToRgbStr(sec.color)},.2)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, fontFamily: "'DM Mono',monospace", color: sec.color, flexShrink: 0 }}>{i + 1}</div>
              <p style={{ margin: "3px 0 0", fontSize: 13, lineHeight: 1.65, color: dark ? "rgba(255,255,255,.55)" : "rgba(0,0,0,.55)" }}>{s}</p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/* ─── STRAP CARD ─── */
function StrapCard({ strap, dark }) {
  const [open, setOpen] = useState(false);
  const cardBg = dark ? "rgba(14,15,22,.78)" : "rgba(255,255,255,.84)";
  return (
    <div onClick={() => setOpen((o) => !o)} style={{ borderRadius: 20, background: cardBg, border: `1px solid ${dark ? "rgba(255,255,255,.07)" : "rgba(0,0,0,.08)"}`, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", cursor: "pointer", overflow: "hidden", transition: ".28s ease", userSelect: "none", WebkitTapHighlightColor: "transparent" }}>
      <div style={{ padding: "18px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 46, height: 46, borderRadius: 14, flexShrink: 0, background: `linear-gradient(135deg,rgba(${strap.rgb},.18),rgba(${strap.rgb},.06))`, border: `1px solid rgba(${strap.rgb},.22)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{strap.icon}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: "'DM Mono',monospace", color: strap.color, marginBottom: 3 }}>{strap.name}</div>
            <p style={{ fontSize: 12, color: dark ? "rgba(255,255,255,.42)" : "rgba(0,0,0,.45)", lineHeight: 1.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", margin: 0 }}>{strap.what}</p>
            <p style={{ margin: "5px 0 0", fontSize: 10, fontWeight: 700, fontFamily: "'DM Mono',monospace", letterSpacing: ".08em", textTransform: "uppercase", color: dark ? "rgba(255,255,255,.46)" : "rgba(0,0,0,.46)" }}>{strap.status}</p>
          </div>
          <div style={{ color: dark ? "rgba(255,255,255,.3)" : "rgba(0,0,0,.3)" }}>
            <ChevronIcon open={open} />
          </div>
        </div>

        <div style={{ overflow: "hidden", maxHeight: open ? 900 : 0, opacity: open ? 1 : 0, transition: "max-height 0.45s cubic-bezier(0.32,0.72,0,1), opacity 0.25s ease" }}>
          <div style={{ paddingTop: 14, display: "flex", flexDirection: "column", gap: 9 }}>
            <p style={{ fontSize: 13.5, lineHeight: 1.7, color: dark ? "rgba(255,255,255,.55)" : "rgba(0,0,0,.55)", margin: 0 }}>{strap.what}</p>
            <a
              href={strap.link}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              style={{ fontSize: 12, color: strap.color, fontWeight: 700, textDecoration: "none", width: "fit-content" }}
            >
              Official/reference link ↗
            </a>
            {/* placement */}
            <div style={{ background: `rgba(${strap.rgb},.05)`, border: `1px solid rgba(${strap.rgb},.14)`, borderRadius: 14, padding: "13px 15px" }}>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: "'DM Mono',monospace", color: strap.color, marginBottom: 9 }}>Placement</div>
              {strap.placement.map((p, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 7 }}>
                  <div style={{ width: 22, height: 22, borderRadius: 7, background: `rgba(${strap.rgb},.12)`, border: `1px solid rgba(${strap.rgb},.22)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, fontFamily: "'DM Mono',monospace", color: strap.color, flexShrink: 0 }}>{i + 1}</div>
                  <p style={{ margin: "2px 0 0", fontSize: 13, lineHeight: 1.65, color: dark ? "rgba(255,255,255,.55)" : "rgba(0,0,0,.55)" }}>{p}</p>
                </div>
              ))}
            </div>
            {/* counter */}
            <div style={{ background: "rgba(239,68,68,.05)", border: "1px solid rgba(239,68,68,.14)", borderRadius: 14, padding: "12px 15px" }}>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: "'DM Mono',monospace", color: "#ef4444", marginBottom: 6 }}>Counter</div>
              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.65, color: dark ? "rgba(255,255,255,.5)" : "rgba(0,0,0,.5)" }}>{strap.counters}</p>
            </div>
            {/* tips */}
            <div style={{ background: dark ? "rgba(255,255,255,.025)" : "rgba(0,0,0,.022)", border: `1px solid ${dark ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.06)"}`, borderRadius: 14, padding: "13px 15px" }}>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: "'DM Mono',monospace", color: dark ? "rgba(255,255,255,.35)" : "rgba(0,0,0,.35)", marginBottom: 8 }}>Tips</div>
              {strap.tips.map((t, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 6 }}>
                  <span style={{ color: strap.color, fontSize: 13, flexShrink: 0 }}>•</span>
                  <p style={{ margin: 0, fontSize: 13, lineHeight: 1.65, color: dark ? "rgba(255,255,255,.48)" : "rgba(0,0,0,.48)" }}>{t}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── TAB BAR ─── */
function TabBar({ tab, setTab, dark }) {
  const tabs = [
    { key: "pvp", label: "PvP", icon: "⚔️", color: "#ef4444" },
    { key: "ms", label: "MS", icon: "🖱️", color: "#f59e0b" },
    { key: "fflags", label: "FFlags", icon: "🚩", color: "#10b981" },
    { key: "fps", label: "FPS", icon: "⚡", color: "#8b5cf6" },
    { key: "straps", label: "Traps", icon: "🧊", color: "#06b6d4" },
  ];
  return (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 200, background: dark ? "rgba(6,7,12,.9)" : "rgba(255,255,255,.88)", backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)", borderTop: `1px solid ${dark ? "rgba(255,255,255,.08)" : "rgba(0,0,0,.08)"}`, display: "flex", paddingBottom: "env(safe-area-inset-bottom,0px)" }}>
      {tabs.map((t) => {
        const isA = t.key === tab;
        return (
          <button key={t.key} onClick={() => setTab(t.key)} style={{ flex: 1, border: "none", background: "none", cursor: "pointer", padding: "10px 0 12px", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, WebkitTapHighlightColor: "transparent" }}>
            <span style={{ fontSize: 21, lineHeight: 1 }}>{t.icon}</span>
            <span style={{ fontSize: 10, fontWeight: isA ? 800 : 600, fontFamily: "'Oxanium',sans-serif", color: isA ? t.color : dark ? "rgba(255,255,255,.35)" : "rgba(0,0,0,.4)" }}>{t.label}</span>
            {isA && <div style={{ marginTop: 2, width: 18, height: 3, borderRadius: 999, background: t.color }} />}
          </button>
        );
      })}
    </div>
  );
}

/* ─── MAIN ─── */
export default function App() {
  useFonts();
  const [dark, setDark] = useState(true);
  const [tab, setTab] = useState("pvp");
  const [mounted, setMounted] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  if (!mounted) return null;

  return (
    <div style={{ minHeight: "100vh", background: dark ? "linear-gradient(180deg,#07070a,#0b0b10 46%,#0e1016)" : "linear-gradient(180deg,#f7f7f5,#ffffff 46%,#f1f1ee)", color: dark ? "#f5f7fb" : "#0f0f10", fontFamily: "'DM Sans',-apple-system,BlinkMacSystemFont,sans-serif", position: "relative", overflowX: "hidden", paddingBottom: 90 }}>
      <style>{`
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { margin: 0; -webkit-font-smoothing: antialiased; background: ${dark ? "#09090d" : "#f7f7f5"}; }
        ::-webkit-scrollbar { display: none; }
        button, select { font-family: inherit; }
        @keyframes fade-up { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse-dot { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.35); opacity: 0.65; } }
        @keyframes snow-fall { 0% { transform: translateY(-10vh); opacity: 0; } 12% { opacity: 0.9; } 55% { opacity: 0.9; } 100% { transform: translateY(100vh); opacity: 0; } }
        @keyframes snow-sway { 0%,100% { margin-left: -5px; } 50% { margin-left: 7px; } }
        .fade { animation: fade-up 0.56s cubic-bezier(0.22,0.8,0.2,1) both; }
        .fade1 { animation-delay: 0.06s; }
        .fade2 { animation-delay: 0.12s; }
        .liveDot { animation: pulse-dot 2.4s ease-in-out infinite; }
      `}</style>

      <Ambient />
      <SnowLayer />

      {/* NAV */}
      <div style={{ position: "sticky", top: 0, zIndex: 100, background: dark ? "rgba(7,7,10,.72)" : "rgba(255,255,255,.72)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", borderBottom: `1px solid ${dark ? "rgba(255,255,255,.07)" : "rgba(0,0,0,.07)"}` }}>
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "12px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 12, background: dark ? "linear-gradient(135deg,#1a0505,#2d0808)" : "linear-gradient(135deg,#fff,#f1f1f1)", border: `1px solid ${dark ? "rgba(239,68,68,.22)" : "rgba(0,0,0,.08)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, boxShadow: dark ? "0 10px 26px rgba(0,0,0,.28)" : "0 10px 24px rgba(0,0,0,.08)" }}>⚔️</div>
            <div>
              <div style={{ fontSize: 14.5, fontWeight: 900, fontFamily: "'Oxanium',sans-serif", letterSpacing: "-.02em", color: dark ? "#fff" : "#0f0f10", lineHeight: 1.05 }}>BedWars PvP</div>
              <div style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: ".12em", textTransform: "uppercase", fontFamily: "'DM Mono',monospace", color: dark ? "rgba(255,255,255,.3)" : "rgba(0,0,0,.34)" }}>Combat Guide</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "5px 12px", borderRadius: 999, background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.18)" }}>
              <div className="liveDot" style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444" }} />
              <span style={{ fontSize: 10, fontWeight: 700, fontFamily: "'DM Mono',monospace", color: "#ef4444", letterSpacing: ".08em" }}>LIVE</span>
            </div>
            <button onClick={() => setDark((d) => !d)} style={{ width: 38, height: 38, borderRadius: 12, border: `1px solid ${dark ? "rgba(255,255,255,.08)" : "rgba(0,0,0,.08)"}`, cursor: "pointer", background: dark ? "rgba(255,255,255,.05)" : "rgba(255,255,255,.92)", display: "flex", alignItems: "center", justifyContent: "center", color: dark ? "rgba(255,255,255,.76)" : "rgba(0,0,0,.72)", WebkitTapHighlightColor: "transparent" }}>
              {dark ? <SunIcon /> : <MoonIcon />}
            </button>
          </div>
        </div>
      </div>

      {/* HERO */}
      <div className="fade" style={{ maxWidth: 960, margin: "0 auto", padding: "72px 18px 20px", textAlign: "center", position: "relative", zIndex: 5 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 999, marginBottom: 20, background: dark ? "rgba(255,255,255,.06)" : "rgba(255,255,255,.88)", border: `1px solid ${dark ? "rgba(255,255,255,.09)" : "rgba(0,0,0,.08)"}` }}>
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase", fontFamily: "'DM Mono',monospace", color: dark ? "rgba(255,255,255,.78)" : "rgba(0,0,0,.75)" }}>Roblox BedWars · PvP Guide</span>
        </div>
        <h1 style={{ margin: "0 0 10px", fontSize: "clamp(3rem,11vw,5.8rem)", fontWeight: 900, letterSpacing: "-.05em", lineHeight: .9, fontFamily: "'Oxanium',sans-serif", color: dark ? "#fff" : "#0f0f10" }}>Combat</h1>
        <p style={{ margin: "0 0 6px", fontSize: "clamp(.95rem,3.5vw,1.4rem)", fontWeight: 700, fontFamily: "'Oxanium',sans-serif", letterSpacing: "-.02em", color: dark ? "rgba(255,255,255,.75)" : "rgba(0,0,0,.75)" }}>PvP · Settings · Traps</p>
        <p style={{ margin: "14px auto 0", maxWidth: 520, fontSize: 14.4, lineHeight: 1.8, color: dark ? "rgba(255,255,255,.42)" : "rgba(0,0,0,.52)" }}>Real trap-style BedWars items with status tags, descriptions, and direct links.</p>

        <div style={{ marginTop: 20 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 999, background: dark ? "rgba(255,255,255,.05)" : "rgba(0,0,0,.04)", border: `1px solid ${dark ? "rgba(255,255,255,.09)" : "rgba(0,0,0,.09)"}`, fontFamily: "'DM Mono',monospace", fontSize: 13, fontWeight: 600, color: dark ? "#fff" : "#0f0f10" }}>
            ⏱ {formatTime(seconds)}
          </div>
        </div>

        <div className="fade fade1" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 10, maxWidth: 700, margin: "24px auto 0" }}>
          {[
            { val: "34", label: "hitreg cap", color: "#ef4444", sub: "hits / 10s" },
            { val: "3.4", label: "optimal CPS", color: "#f59e0b", sub: "clicks / sec" },
            { val: String(FFLAGS.length), label: "total fflags", color: "#10b981", sub: "performance flags" },
            { val: String(STRAPS.length), label: "traps listed", color: "#8b5cf6", sub: "trap entries" },
          ].map((s) => (
            <div key={s.label} style={{ borderRadius: 20, background: dark ? "rgba(14,15,22,.8)" : "rgba(255,255,255,.88)", border: `1px solid ${dark ? "rgba(255,255,255,.08)" : "rgba(0,0,0,.08)"}`, backdropFilter: "blur(20px)", padding: "14px 16px", textAlign: "left" }}>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase", fontFamily: "'DM Mono',monospace", color: dark ? "rgba(255,255,255,.3)" : "rgba(0,0,0,.35)", marginBottom: 5 }}>{s.label}</div>
              <div style={{ fontSize: "1.7rem", fontWeight: 900, fontFamily: "'Oxanium',sans-serif", color: s.color }}>{s.val}</div>
              <div style={{ fontSize: 10, color: dark ? "rgba(255,255,255,.35)" : "rgba(0,0,0,.35)", fontFamily: "'DM Mono',monospace" }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      <div className="fade fade2" style={{ maxWidth: 960, margin: "0 auto", padding: "12px 18px", position: "relative", zIndex: 5 }}>
        {tab === "pvp" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {PVP.map((p, i) => <PvpCard key={i} p={p} dark={dark} />)}
          </div>
        )}
        {tab === "ms" && <MsSection dark={dark} />}
        {tab === "fflags" && <FflagsSection dark={dark} />}
        {tab === "fps" && <FpsSection dark={dark} />}
        {tab === "straps" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {STRAPS.map((s, i) => <StrapCard key={i} strap={s} dark={dark} />)}
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="fade" style={{ maxWidth: 960, margin: "24px auto 0", padding: "0 18px", position: "relative", zIndex: 5 }}>
        <div style={{ borderRadius: 28, padding: "28px 22px", background: dark ? "linear-gradient(135deg,rgba(255,255,255,.05),rgba(255,255,255,.025))" : "linear-gradient(135deg,rgba(255,255,255,.95),rgba(247,247,244,.96))", border: `1px solid ${dark ? "rgba(255,255,255,.08)" : "rgba(0,0,0,.08)"}`, backdropFilter: "blur(24px)", textAlign: "center" }}>
          <h3 style={{ margin: "0 0 8px", fontSize: "clamp(1.15rem,4vw,1.6rem)", fontWeight: 900, fontFamily: "'Oxanium',sans-serif", letterSpacing: "-.03em", color: dark ? "#fff" : "#0f0f10" }}>Hit harder. Lag less.</h3>
          <p style={{ margin: "0 auto", maxWidth: 460, fontSize: 13.4, lineHeight: 1.72, color: dark ? "rgba(255,255,255,.48)" : "rgba(0,0,0,.52)" }}>Combat mechanics, optimized settings, and real trap info for ranked players who want every edge.</p>
          <div style={{ marginTop: 16, display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 999, background: dark ? "rgba(255,255,255,.05)" : "rgba(0,0,0,.03)", border: `1px solid ${dark ? "rgba(255,255,255,.08)" : "rgba(0,0,0,.06)"}` }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: dark ? "#fff" : "#0f0f10" }} />
            <span style={{ fontSize: 10.5, fontWeight: 800, fontFamily: "'DM Mono',monospace", letterSpacing: ".1em", textTransform: "uppercase", color: dark ? "rgba(255,255,255,.7)" : "rgba(0,0,0,.7)" }}>made by justcyril</span>
          </div>
        </div>
      </div>

      <TabBar tab={tab} setTab={setTab} dark={dark} />
    </div>
  );
}
