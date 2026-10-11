// Catalog completion metadata shared by the 59 demo routes.
export const completionDemos = [
  {
    "id": 4,
    "factory": "createPerspectiveTrack",
    "route": "perspective-track",
    "kind": "material",
    "geometry": "quad",
    "description": "Project a caller-owned map with heading and offset controls; a checker map is the fallback."
  },
  {
    "id": 5,
    "factory": "createItemRoulette",
    "route": "item-roulette",
    "kind": "material",
    "geometry": "quad",
    "description": "Scroll a horizontal item atlas with cubic deceleration; progress 1 lands on Target."
  },
  {
    "id": 8,
    "factory": "createMirrorWarpTransition",
    "route": "mirror-warp",
    "kind": "transition",
    "geometry": "quad",
    "description": "Ripple and brighten the view while transitioning between two world scenes."
  },
  {
    "id": 9,
    "factory": "createEtherBurst",
    "route": "ether-burst",
    "kind": "material",
    "geometry": "quad",
    "description": "Strike a vertical bolt, then expand jagged arcs around the caster."
  },
  {
    "id": 10,
    "factory": "createBombosRing",
    "route": "bombos-ring",
    "kind": "material",
    "geometry": "ground",
    "description": "Expand a segmented flame ring across a ground-aligned card."
  },
  {
    "id": 11,
    "factory": "createGroundShock",
    "route": "ground-shock",
    "kind": "material",
    "geometry": "ground",
    "description": "Send concentric shocks across the floor; add camera shake in the game if desired."
  },
  {
    "id": 13,
    "factory": "createSpeedAfterimages",
    "route": "speed-afterimages",
    "kind": "echo",
    "geometry": "quad",
    "description": "Stamp tinted snapshots of a supplied static or baked-pose mesh during a dash."
  },
  {
    "id": 15,
    "factory": "createXRayScopeEffect",
    "route": "xray-scope",
    "kind": "screen",
    "geometry": "quad",
    "description": "Reveal an alternate scene image inside an aimable scan cone."
  },
  {
    "id": 18,
    "factory": "createBossGrowth",
    "route": "boss-growth",
    "kind": "material",
    "geometry": "sphere",
    "description": "Grow the visible boss mesh with a flashing transformation envelope; gameplay bounds stay external."
  },
  {
    "id": 25,
    "factory": "createBrambleParallax",
    "route": "bramble-parallax",
    "kind": "material",
    "geometry": "quad",
    "description": "Scroll two bramble image layers at different rates using a camera-driven offset."
  },
  {
    "id": 26,
    "factory": "createRotatingRoom",
    "route": "rotating-room",
    "kind": "material",
    "geometry": "quad",
    "description": "Rotate room imagery around its center; camera heading and collision remain application responsibilities."
  },
  {
    "id": 28,
    "factory": "createChainedExplosions",
    "route": "chained-explosions",
    "kind": "particles",
    "geometry": "quad",
    "description": "Stagger expanding fire cards over the boss before the game removes it."
  },
  {
    "id": 29,
    "factory": "createOverheadRotation",
    "route": "overhead-rotation",
    "kind": "material",
    "geometry": "quad",
    "description": "Rotate the overhead map image and move its focus with heading and offset."
  },
  {
    "id": 32,
    "factory": "createAirshipMap",
    "route": "airship-map",
    "kind": "material",
    "geometry": "quad",
    "description": "Project a map from a higher apparent altitude with a fogged horizon."
  },
  {
    "id": 34,
    "factory": "createDashDust",
    "route": "dash-dust",
    "kind": "particles",
    "geometry": "quad",
    "description": "Stamp expanding dust at a moving runner; combine with SpeedAfterimages for a full dash sequence."
  },
  {
    "id": 37,
    "factory": "createVanishCap",
    "route": "vanish-cap",
    "kind": "material",
    "geometry": "sphere",
    "description": "Fade a character into a scan-lined rim silhouette while retaining readable edges."
  },
  {
    "id": 40,
    "factory": "createCollectibleBurst",
    "route": "collectible-burst",
    "kind": "particles",
    "geometry": "quad",
    "description": "Emit a bounded radial star burst when a collectible is acquired."
  },
  {
    "id": 41,
    "factory": "createDinsFire",
    "route": "dins-fire",
    "kind": "material",
    "geometry": "sphere",
    "description": "Expand a translucent fiery sphere from the caster and fade its shell."
  },
  {
    "id": 45,
    "factory": "createSwordRibbon",
    "route": "sword-ribbon",
    "kind": "ribbon",
    "geometry": "quad",
    "description": "Join recent blade endpoints into a short fading ribbon; feed animation socket positions."
  },
  {
    "id": 46,
    "factory": "createElementalArrowTrail",
    "route": "elemental-arrow-trail",
    "kind": "particles",
    "geometry": "quad",
    "description": "Stamp elemental stars at the projectile's previous positions; tint per element."
  },
  {
    "id": 47,
    "factory": "createWaterTentacle",
    "route": "water-tentacle",
    "kind": "material",
    "geometry": "tube",
    "description": "Bend a rooted subdivided tube with a traveling wave; use a tapered mesh rooted at local Y=0."
  },
  {
    "id": 49,
    "factory": "createMaskTransformTransition",
    "route": "mask-transform",
    "kind": "transition",
    "geometry": "quad",
    "description": "Flash and briefly zoom while changing between transformation scenes."
  },
  {
    "id": 50,
    "factory": "createTimeResetTransition",
    "route": "time-reset",
    "kind": "transition",
    "geometry": "quad",
    "description": "Pull both scenes through a radial vortex during the time reset."
  },
  {
    "id": 51,
    "factory": "createMoonDebris",
    "route": "moon-debris",
    "kind": "particles",
    "geometry": "quad",
    "description": "Drop falling debris cards with gravity over the scene; repeat bursts for a falling moon sequence."
  },
  {
    "id": 52,
    "factory": "createDriftSmoke",
    "route": "drift-smoke",
    "kind": "particles",
    "geometry": "quad",
    "description": "Leave rising smoke at a drifting tire's moving contact point."
  },
  {
    "id": 53,
    "factory": "createLightningShrink",
    "route": "lightning-shrink",
    "kind": "material",
    "geometry": "sphere",
    "description": "Flash and shrink the visible vehicle mesh; the game owns collision and speed changes."
  },
  {
    "id": 54,
    "factory": "createBooInvisibility",
    "route": "boo-invisibility",
    "kind": "material",
    "geometry": "sphere",
    "description": "Blend the vehicle into a pulsing pale rim silhouette."
  },
  {
    "id": 56,
    "factory": "createArwingThruster",
    "route": "arwing-thruster",
    "kind": "material",
    "geometry": "quad",
    "description": "Attach a tapered flickering engine flare behind the craft."
  },
  {
    "id": 57,
    "factory": "createLaserImpact",
    "route": "laser-impact",
    "kind": "particles",
    "geometry": "quad",
    "description": "Emit a brief radial spray of bright cross-shaped impact sparks."
  },
  {
    "id": 58,
    "factory": "createSmartBomb",
    "route": "smart-bomb",
    "kind": "material",
    "geometry": "sphere",
    "description": "Expand a cool spherical shock shell with moving bands."
  },
  {
    "id": 59,
    "factory": "createDamageSmoke",
    "route": "damage-smoke",
    "kind": "particles",
    "geometry": "quad",
    "description": "Leave dark expanding smoke behind a damaged craft as it moves."
  },
  {
    "id": 61,
    "factory": "createKnockbackTrail",
    "route": "knockback-trail",
    "kind": "particles",
    "geometry": "quad",
    "description": "Stamp pale puffs along the launched character's path."
  },
  {
    "id": 63,
    "factory": "createWatercraftWake",
    "route": "watercraft-wake",
    "kind": "material",
    "geometry": "ground",
    "description": "Place a twin-rail foam wake with central churn on the water behind a hull."
  },
  {
    "id": 64,
    "factory": "createCrestSpray",
    "route": "crest-spray",
    "kind": "particles",
    "geometry": "quad",
    "description": "Launch droplets upward from a moving wave crest, then pull them down with gravity."
  },
  {
    "id": 67,
    "factory": "createDistanceFog",
    "route": "distance-fog",
    "kind": "material",
    "geometry": "fog",
    "description": "Blend terrain surfaces toward the fog color using camera-space distance."
  },
  {
    "id": 69,
    "factory": "createCureColumn",
    "route": "cure-column",
    "kind": "material",
    "geometry": "quad",
    "description": "Raise six staggered sparkle lanes through the target during healing."
  },
  {
    "id": 70,
    "factory": "createFireSpell",
    "route": "fire-spell",
    "kind": "material",
    "geometry": "quad",
    "description": "Grow a noisy tapered fire plume through a one-shot lifetime."
  },
  {
    "id": 71,
    "factory": "createIceSpell",
    "route": "ice-spell",
    "kind": "material",
    "geometry": "crystal",
    "description": "Raise a faceted crystal from its base, highlight its faces and fade it."
  },
  {
    "id": 72,
    "factory": "createBoltStrike",
    "route": "bolt-strike",
    "kind": "material",
    "geometry": "quad",
    "description": "Draw a jagged vertical strike and branching arcs at the target."
  },
  {
    "id": 73,
    "factory": "createLimitAura",
    "route": "limit-aura",
    "kind": "material",
    "geometry": "quad",
    "description": "Wrap the character in a sharp rising charge aura."
  },
  {
    "id": 74,
    "factory": "createSummonArenaTransition",
    "route": "summon-arena",
    "kind": "transition",
    "geometry": "quad",
    "description": "Split the view into alternating horizontal strips while entering the summon arena."
  },
  {
    "id": 75,
    "factory": "createDrawStream",
    "route": "draw-stream",
    "kind": "particles",
    "geometry": "quad",
    "description": "Curve successive magic stars from source positions toward an editable target."
  },
  {
    "id": 76,
    "factory": "createGunbladeFlash",
    "route": "gunblade-flash",
    "kind": "material",
    "geometry": "quad",
    "description": "Combine a diagonal cross flash and expanding impact ring; the game decides hit timing."
  },
  {
    "id": 77,
    "factory": "createTranceAura",
    "route": "trance-aura",
    "kind": "material",
    "geometry": "quad",
    "description": "Surround the character with broad pink undulations and rising bands."
  },
  {
    "id": 78,
    "factory": "createMistAtmosphere",
    "route": "mist-atmosphere",
    "kind": "material",
    "geometry": "quad",
    "description": "Layer low-lying, height-weighted drifting mist cards through a scene."
  },
  {
    "id": 80,
    "factory": "createAlucardAfterimages",
    "route": "alucard-afterimages",
    "kind": "echo",
    "geometry": "quad",
    "description": "Keep a longer blue-purple history of static or baked-pose character silhouettes."
  },
  {
    "id": 82,
    "factory": "createShieldSpellFlare",
    "route": "shield-spell-flare",
    "kind": "material",
    "geometry": "quad",
    "description": "Burst radial rays and a ring from the shield when its spell triggers."
  },
  {
    "id": 83,
    "factory": "createSaveGeometry",
    "route": "save-geometry",
    "kind": "material",
    "geometry": "quad",
    "description": "Counter-rotate luminous square and diamond outlines around the save point."
  },
  {
    "id": 84,
    "factory": "createSpellbookPages",
    "route": "spellbook-pages",
    "kind": "particles",
    "geometry": "quad",
    "description": "Orbit a bounded set of rectangular lined pages around the casting point."
  },
  {
    "id": 85,
    "factory": "createOpticalCamouflage",
    "route": "optical-camouflage",
    "kind": "material",
    "geometry": "sphere",
    "description": "Refract a scene image captured without the character; the caller supplies that background texture."
  },
  {
    "id": 89,
    "factory": "createSearchlight",
    "route": "searchlight",
    "kind": "material",
    "geometry": "quad",
    "description": "Place a fading cone card over the searched area and rotate it with the lamp; no shadow test is implied."
  },
  {
    "id": 90,
    "factory": "createMaskCompanion",
    "route": "mask-companion",
    "kind": "particles",
    "geometry": "quad",
    "description": "Orbit and bob an original stylized mask card around the supplied player position."
  },
  {
    "id": 92,
    "factory": "createTntDebris",
    "route": "tnt-debris",
    "kind": "particles",
    "geometry": "quad",
    "description": "Throw colored debris cards upward and outward under gravity after an explosion."
  },
  {
    "id": 93,
    "factory": "createPickupFlight",
    "route": "pickup-flight",
    "kind": "particles",
    "geometry": "quad",
    "description": "Curve collectible-colored cards toward a target; project HUD targets into the chosen effect plane in the game."
  },
  {
    "id": 94,
    "factory": "createFlameBreath",
    "route": "flame-breath",
    "kind": "material",
    "geometry": "quad",
    "description": "Extend a noisy widening horizontal flame from the mouth along local +X."
  },
  {
    "id": 95,
    "factory": "createGemSparkle",
    "route": "gem-sparkle",
    "kind": "material",
    "geometry": "quad",
    "description": "Pulse and rotate a small star glint at a gem's position."
  },
  {
    "id": 97,
    "factory": "createColoredBackdrop",
    "route": "colored-backdrop",
    "kind": "material",
    "geometry": "quad",
    "description": "Blend colored horizon bands behind distant terrain and match the scene's fog color."
  },
  {
    "id": 99,
    "factory": "createSpectralMorph",
    "route": "spectral-morph",
    "kind": "material",
    "geometry": "morph",
    "description": "Deform subdivided scenery and tint it toward a spectral palette; authored world variants remain external."
  },
  {
    "id": 100,
    "factory": "createFlareIllumination",
    "route": "flare-illumination",
    "kind": "material",
    "geometry": "quad",
    "description": "Attach a flickering core and finite-range point light to the flare; surrounding objects need lit materials."
  }
] as const;
export type CompletionRoute = typeof completionDemos[number]["route"];
