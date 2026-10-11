# 100 retro game shader and special-effect ideas

A reference list for future Zylem effects: **34 SNES, 33 N64, and 33 PSX entries**.
Each row names an effect, a game reference, and where/how to apply a modern
recreation. The application descriptions are design suggestions, not claims about
the original games' rendering code. These consoles used palettes, sprites,
fixed-function rendering and geometry tricks; “shader” here means a possible
modern implementation. This catalog now has reusable modern components for all 100 entries.

## Implementation progress

**100 of 100 entries have reusable components and showcase demos:**

- [First batch](retro-effects.md): **#1, #2, #12, #17, #20, #35, #36 and #87**.
- [Second batch](retro-effects-batch-2.md): **#3, #7, #16, #38, #55, #62, #86 and #88**.
- [Third batch: 25 effects](retro-effects-batch-3.md): **#6, #14, #19, #21, #22, #23, #24, #27, #30, #31, #33, #39, #42, #43, #44, #48, #60, #65, #66, #68, #79, #81, #91, #96 and #98**.

- [Completion: remaining 59 effects](retro-effects-completion.md): materials, transitions, directional reveal, bounded particle/card systems, afterimages and sword ribbons.

“Implemented” means the documented material/screen component, not a complete
recreation of the game's scripted sequence. Visual review and GPU timing remain
pending. The guides describe each component’s scope and integration requirements.

## SNES (1–34)

| # | Effect / game reference | How it is applied |
| --- | --- | --- |
| 1 | Invincibility color cycling — Super Mario World | Cycle a character's palette through bright colors while a temporary power-up is active; preserve the sprite's shading and silhouette. |
| 2 | Translucent ghost body — Super Mario World | Blend a ghost's body over the level while keeping its eyes and mouth legible; vary opacity with its approach or hiding state. |
| 3 | Circular level-exit wipe — Super Mario World | Close a circular screen mask around the player to transition out of a completed course. |
| 4 | Perspective race track — Super Mario Kart | Project a flat track texture into a receding ground plane and rotate its sampling with the camera's heading. |
| 5 | Item roulette — Super Mario Kart | Rapidly cycle item images inside a fixed HUD window, then decelerate and stop on the selected power-up. |
| 6 | Boost exhaust — F-Zero | Enlarge and brighten engine exhaust behind the vehicle during acceleration boosts; tie its length to boost strength. |
| 7 | Lantern visibility cone — The Legend of Zelda: A Link to the Past | Darken the room with an overlay and reveal a cone in front of Link; rotate the mask with facing direction. |
| 8 | Magic Mirror world warp — A Link to the Past | Distort and brighten the screen around the character as the scene changes between world variants. |
| 9 | Ether lightning burst — A Link to the Past | Strike the caster with a vertical bolt, then spread electrical arcs around the caster's position. |
| 10 | Bombos fire ring — A Link to the Past | Spawn a sequence of flames around the caster and expand the attack outward across nearby enemies. |
| 11 | Quake ground shock — A Link to the Past | Combine short camera offsets with concentric ground disturbances to communicate an area attack. |
| 12 | Expanding Power Bomb — Super Metroid | Grow a bright circular field from the bomb and animate its color and falloff as it fills the view. |
| 13 | Speed Booster afterimages — Super Metroid | Leave a short queue of tinted Samus silhouettes at previous positions while running at full speed. |
| 14 | Charged beam glow — Super Metroid | Accumulate pulsing colored energy around the arm cannon while fire is held, then release it with the shot. |
| 15 | X-Ray Scope reveal — Super Metroid | Reveal hidden terrain details inside a directional scan cone while the rest of the scene retains its normal appearance. |
| 16 | Water-entry ripple — Super Metroid | Place a brief horizontal ripple/splash where the character crosses a water surface. |
| 17 | Fuzzy intoxication warp — Super Mario World 2: Yoshi's Island | Apply animated screen-space wave offsets and skew to the level after touching a Fuzzy; fade the distortion over time. |
| 18 | Giant boss growth — Yoshi's Island | Scale a boss dramatically during its transformation, with timed flashes and particles around the growing silhouette. |
| 19 | Foreground mist — Yoshi's Island | Drift translucent fog layers across the playfield at different speeds while retaining readable character contrast. |
| 20 | Psychedelic battle backdrop — EarthBound | Combine palette cycling, horizontal wave offsets and scrolling patterns behind battle sprites. |
| 21 | PSI attack overlay — EarthBound | Play bold geometric color patterns over the battle view, synchronized with the attack's hit sequence. |
| 22 | Layered rain — Donkey Kong Country | Scroll diagonal rain streaks over the jungle in multiple layers, with independent density and wind direction. |
| 23 | Snowstorm depth layers — Donkey Kong Country | Move several layers of snow at different sizes and speeds so the storm appears to occupy depth around the player. |
| 24 | Sunset silhouettes — Donkey Kong Country | Darken foreground scenery against a warm sky gradient to emphasize the jungle skyline and depth. |
| 25 | Bramble depth parallax — Donkey Kong Country 2 | Scroll background and foreground bramble layers at different rates as the camera tracks the player. |
| 26 | Rotating room — Super Castlevania IV | Rotate the room imagery around the player while maintaining a stable focal point for navigation. |
| 27 | Rotating tunnel — Super Castlevania IV | Rotate a repeating cylindrical-looking background around the corridor axis to suggest travel through a spinning tunnel. |
| 28 | Chained boss explosions — Contra III: The Alien Wars | Scatter short explosion animations over a large defeated boss, staggered before a final flash and disappearance. |
| 29 | Overhead world rotation — Contra III: The Alien Wars | Rotate the overhead terrain and scenery around the player when changing orientation in top-down stages. |
| 30 | Spell emphasis backdrop — Secret of Mana | Temporarily darken or recolor the surrounding battle scene while a spell animation plays over its target. |
| 31 | Enemy defeat dissolve — Final Fantasy VI | Erode or fade a defeated enemy sprite with a short color treatment before removing it from the battle. |
| 32 | Airship world-map perspective — Final Fantasy VI | Tilt and scale the world map beneath the airship to create a low-altitude flight view. |
| 33 | Multi-stage charge aura — Mega Man X | Change the size and color of a pulsing character aura at each weapon charge threshold. |
| 34 | Dash dust and speed echo — Mega Man X | Emit brief dust at the feet and fading sprite echoes behind X during a dash. |

## Nintendo 64 (35–67)

| # | Effect / game reference | How it is applied |
| --- | --- | --- |
| 35 | Painting portal ripple — Super Mario 64 | Displace a painting surface in waves when touched, then transition the camera through it into the course. |
| 36 | Metallic character — Super Mario 64 | Apply a reflective-looking environment pattern to Mario while the Metal Cap is active; move highlights with surface orientation. |
| 37 | Vanish-cap transparency — Super Mario 64 | Render the character as a faint translucent/dithered silhouette during temporary intangibility. |
| 38 | Ground-following blob shadow — Super Mario 64 | Project a soft dark disk beneath a character; adjust size and opacity with its distance above the ground. |
| 39 | Swimming wake — Super Mario 64 | Emit widening ripples behind the swimmer and circular rings at the waterline. |
| 40 | Collectible sparkle burst — Super Mario 64 | Emit a small, short-lived star-shaped particle burst at a collected coin or Power Star. |
| 41 | Din's Fire sphere — The Legend of Zelda: Ocarina of Time | Expand a fiery translucent shell outward from Link, matching the attack's area and duration. |
| 42 | Nayru's Love barrier — Ocarina of Time | Surround Link with a faceted translucent protective shell that pulses while the spell remains active. |
| 43 | Farore's Wind marker — Ocarina of Time | Gather green light around the character and leave a luminous marker at the stored return point. |
| 44 | Lens of Truth reveal — Ocarina of Time | Use a screen-centered lens mask to reveal hidden objects or remove illusory surfaces inside its boundary. |
| 45 | Sword-swing ribbon — Ocarina of Time | Build a short fading ribbon between recent sword-tip and sword-base positions during an attack. |
| 46 | Elemental arrow trail — Ocarina of Time | Attach fire, ice or light particles and a colored glow to the arrow, then burst them at impact. |
| 47 | Morphing water tentacle — Ocarina of Time | Animate a translucent water limb along a curve, with moving surface highlights and a deforming tip. |
| 48 | Twisted corridor — Ocarina of Time | Rotate successive cross-sections of a corridor so the passage visibly twists along its length. |
| 49 | Mask transformation flash — The Legend of Zelda: Majora's Mask | Combine a close character view, bright silhouette treatment and screen overlay during a mask-driven transformation. |
| 50 | Time-reset vortex — Majora's Mask | Pull the scene into a swirling transition with layered imagery when returning to the beginning of the time cycle. |
| 51 | Moon's falling debris — Majora's Mask | Emit descending glowing fragments and dust as the moon approaches, increasing density near the climax. |
| 52 | Drift smoke — Mario Kart 64 | Spawn tire-level smoke puffs during a powerslide, varying their tint and emission with the drift state. |
| 53 | Lightning shrink flash — Mario Kart 64 | Flash affected racers, add a brief electrical overlay and animate their scale down after a lightning attack. |
| 54 | Boo invisibility — Mario Kart 64 | Fade the kart and driver into a translucent ghostlike state for the duration of the Boo item. |
| 55 | Rainbow track colors — Mario Kart 64 | Repeat vivid color bands along the road surface to make Rainbow Road's winding route readable against space. |
| 56 | Arwing thruster flare — Star Fox 64 | Attach a bright camera-facing exhaust flare to each engine and enlarge it when boosting. |
| 57 | Laser impact spark — Star Fox 64 | Spawn a short bright spark where a laser meets a surface or target; orient the burst around the hit normal. |
| 58 | Smart Bomb expansion — Star Fox 64 | Grow a luminous blast volume at the detonation point, followed by a fading halo and secondary particles. |
| 59 | Damage smoke trail — Star Fox 64 | Emit drifting smoke behind a damaged aircraft, using darker/larger puffs as damage worsens. |
| 60 | Shield bubble — Super Smash Bros. | Enclose a fighter in a colored translucent sphere; shrink and dim it as shield strength is consumed. |
| 61 | Knockback smoke trail — Super Smash Bros. | Emit spaced smoke puffs along the airborne fighter's path, with longer trails for stronger hits. |
| 62 | Hit spark and freeze emphasis — Super Smash Bros. | Place a starburst at the contact point and briefly pause motion to make a successful strike readable. |
| 63 | Watercraft wake — Wave Race 64 | Draw widening foam strips behind a moving craft and fade them with age, speed and distance. |
| 64 | Crest spray — Wave Race 64 | Emit spray particles when the craft hits a wave crest or lands, biased by impact direction. |
| 65 | Golden puzzle-piece glint — Banjo-Kazooie | Add moving bright glints to a rotating Jiggy so it remains recognizable against busy scenery. |
| 66 | Muzzle flash — GoldenEye 007 | Show a short camera-facing burst at the weapon muzzle, synchronized with each shot. |
| 67 | Distance fog — Turok: Dinosaur Hunter | Blend distant terrain and enemies into a uniform atmospheric color to control visibility and establish mood. |

## PlayStation / PSX (68–100)

| # | Effect / game reference | How it is applied |
| --- | --- | --- |
| 68 | Battle-entry swirl — Final Fantasy VII | Warp the current field image into a spiral as the view transitions from exploration to battle. |
| 69 | Cure sparkle column — Final Fantasy VII | Raise green luminous particles around the healing target and fade them after the recovery pulse. |
| 70 | Fire spell plume — Final Fantasy VII | Erupt a short fire animation around the selected enemy, with a bright core and upward-moving tongues. |
| 71 | Ice spell crystal — Final Fantasy VII | Grow a translucent ice formation around the target, then fracture it into fading pieces. |
| 72 | Bolt spell strike — Final Fantasy VII | Connect an overhead point to the target with a jagged bright bolt and a brief impact flash. |
| 73 | Limit Break charge aura — Final Fantasy VII | Gather colored light around the acting character before the Limit attack begins. |
| 74 | Summon arena transition — Final Fantasy VII | Fade or replace the normal battle backdrop with a dedicated effect stage for a large summon sequence. |
| 75 | Draw-magic stream — Final Fantasy VIII | Move small luminous particles from the enemy toward the caster along curved paths during Draw. |
| 76 | Gunblade hit flash — Final Fantasy VIII | Add a timed bright burst at sword contact when the trigger input strengthens the attack. |
| 77 | Trance aura — Final Fantasy IX | Surround the character with a pulsing colored glow and upward particles during the Trance state. |
| 78 | Mist atmosphere — Final Fantasy IX | Layer low-contrast fog over distant scenery and around terrain to communicate the world's pervasive Mist. |
| 79 | Holy light pillars — Final Fantasy IX | Raise bright vertical shafts around the selected target, timed to the spell's impact and fade. |
| 80 | Alucard movement afterimages — Castlevania: Symphony of the Night | Leave tinted, quickly fading copies of the character sprite at recent positions during rapid movement. |
| 81 | Mist-form character — Symphony of the Night | Replace the solid sprite with a soft drifting vapor cluster that follows the character's movement. |
| 82 | Shield spell flare — Symphony of the Night | Brighten the shield and overlay a short magical emblem or burst when a shield spell activates. |
| 83 | Save-room geometric effect — Symphony of the Night | Animate rotating geometric shapes and color changes around the save interaction's focal point. |
| 84 | Spellbook page attack — Symphony of the Night | Orbit book/page sprites around the character as a moving damage zone, leaving a short luminous trail. |
| 85 | Optical camouflage — Metal Gear Solid | Render the character as a faintly visible, distorted version of the background while stealth camouflage is active. |
| 86 | Thermal-vision palette — Metal Gear Solid | Remap the scene to a thermal color ramp and make relevant targets stand out from cooler surroundings. |
| 87 | Night-vision green — Metal Gear Solid | Apply a green monochrome treatment and increased scene visibility while the night-vision goggles are equipped. |
| 88 | Chaff interference — Metal Gear Solid | Add noisy disruption to electronic/radar imagery while chaff temporarily disables surveillance systems. |
| 89 | Searchlight cone — Metal Gear Solid | Sweep a visible cone or pool of light across the environment and use its boundary to communicate detection danger. |
| 90 | Floating mask companion — Crash Bandicoot | Animate Aku Aku beside the player with a slight bob and orbit; add a brief burst when protection is consumed. |
| 91 | Spin-attack smear — Crash Bandicoot | Add a circular motion smear around Crash's silhouette during the spin attack. |
| 92 | TNT blast and debris — Crash Bandicoot | Trigger a compact explosion and outward-moving box fragments after the countdown completes. |
| 93 | Wumpa pickup flight — Crash Bandicoot | Animate a collected fruit image toward the HUD counter along a short screen-space arc. |
| 94 | Dragon flame breath — Spyro the Dragon | Emit a short cone of flame particles from the mouth and fade it rapidly beyond attack range. |
| 95 | Gem sparkle — Spyro the Dragon | Place intermittent star-shaped glints on gems to distinguish pickups from similarly colored scenery. |
| 96 | Portal preview surface — Spyro the Dragon | Display a view or representative image of the destination inside a portal boundary as the player approaches. |
| 97 | Colored distance backdrop — Spyro the Dragon | Blend distant scenery into a coordinated sky/fog palette to create depth without losing the landscape's color identity. |
| 98 | Quake weapon wave — WipEout 2097 / XL | Propagate a visible disturbance along the race track ahead of the craft, timed to the traveling attack. |
| 99 | Spectral world morph — Legacy of Kain: Soul Reaver | Interpolate scenery geometry and color grading as the world changes between material and spectral realms. |
| 100 | Flare illumination — Tomb Raider II | Attach a warm flickering light and small flame/spark particles to a held flare, with illumination fading as it expires. |

## Reference scope

The original named games are the visual references. Apply-to descriptions above
are original proposals for recreating the look with Zylem; they do not assert
that the original shipped a particular shader algorithm. Exact fidelity should
be checked against footage from the **original console version**, especially
where later ports or remasters changed the visuals. Game names and original
art remain the property of their respective owners; this catalog includes no
ripped assets.

Useful primary reference starting points:

- [Nintendo's official SNES Classic manual archive](https://www.nintendo.co.jp/clvs/manuals/en_us/index.html) — original manuals for many of the SNES games listed.
- [Nintendo's Super Mario 64 character/power-up reference](https://www.nintendo.com/jp/character/mario/en/history/64/index.html) — Wing, Metal and Vanish forms.
- [Nintendo's original Star Fox 64 site](https://www.nintendo.co.jp/n01/n64/software/nus_p_nfxj/index.html).
- [Nintendo's original Super Smash Bros. site](https://www.nintendo.co.jp/n01/n64/software/nus_p_nalj/index.html).
- [PlayStation's Final Fantasy VII page](https://www.playstation.com/en-us/games/final-fantasy-vii/).
- [Square Enix on Final Fantasy VII summon design](https://blog.playstation.com/?p=332373) — distinguishes the original game's summon presentation from Remake.

These links establish game/power-up context; they are not technical verification
of every row or an exhaustive per-effect bibliography.
