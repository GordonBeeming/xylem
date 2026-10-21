---
title: "MacReactions"
fetchedAt: 2026-10-21
sourceRepo: "GordonBeeming/mac-reactions"
sourceBranch: "main"
visibility: public
---

# MacReactions

FaceTime-style reaction effects for any macOS app. Apple's camera Reactions (confetti, balloons, fireworks, rain, lasers, hearts, thumbs up/down) only exist inside the camera pipeline, so there's no API to play them over your own UI. This package recreates all 8 as overlay effects you can trigger from code, tuned frame-by-frame against recordings of the real thing.

```swift
import MacReactions

// Over the whole screen — every display, above other apps. Works from a
// menu bar app with no windows at all:
ReactionCenter.shared.play(.confetti, on: .screen)

// Or inside your own window: attach an overlay once at the root view,
ContentView()
    .reactionOverlay()
// then play from anywhere:
ReactionCenter.shared.play(.confetti)
```

Both surfaces are click-through, created lazily on the first play, and torn down when idle, so they cost nothing while no effect is running. If you'd rather pay the screen windows' setup cost at launch instead of on the first celebration, call `ReactionCenter.shared.prepareScreenOverlay()` once.

## Effects

| Reaction | Feel |
|---|---|
| `.confetti` | A short, dense curtain of tumbling paper from the top edge |
| `.balloons` | A flock of glossy balloons with trailing strings rising past |
| `.fireworks` | Rocket volleys bursting into dense spark spheres |
| `.rain` | Heavy grey curtains of rain that pass through |
| `.lasers` | A white-hot core, hue-cycling fog, and sweeping beams |
| `.hearts` | Soft glowing red hearts floating up |
| `.thumbsUp` | A glowing 👍 in a soap bubble, spring pop-in |
| `.thumbsDown` | Its deflating 👎 sibling |

## Requirements

- macOS 14+
- Swift 6 toolchain

## Install

```swift
dependencies: [
    .package(url: "https://github.com/gordonbeeming/mac-reactions", from: "0.1.0")
]
```

## Options

```swift
let token = ReactionCenter.shared.play(
    .fireworks,
    configuration: .init(
        intensity: 1.5,        // 0.25...2.0 — scales particle counts and rates
        duration: 10,          // seconds; nil = the effect's Apple-matched default
        reduceMotion: .system, // .system / .alwaysReduce / .ignore
        seed: 42               // deterministic replays; nil = random
    )
) {
    print("all fireworks finished")
}

ReactionCenter.shared.stop(token)  // graceful wind-down, not an abrupt removal
ReactionCenter.shared.stopAll()
```

Plays are additive: `play(.confetti)` twice gives you two independent confetti runs, and different effects stack freely.

- **Reduce Motion**: every effect ships a calm variant (fewer elements, gentle motion or crossfades). The default `.system` policy follows the user's accessibility setting.
- **Scope**: `.reactionOverlay(scope: .view)` clips effects to one view instead of covering the window.
- **Multi-window**: create your own `ReactionCenter` instance per window and pass it to both the modifier and your `play` calls; `.shared` covers the single-window case.
- **Custom effects**: conform to `ReactionEffect` and register it: `ReactionRegistry.shared.register(MyEffect.self, for: Reaction(id: "my-effect"))`.

## Demo app

```
swift run ReactionsDemo
```

The demo puts a 🎉 in your menu bar, and each menu item fires that effect over the whole screen. The window has a button grid per effect (with a full-screen toggle) plus intensity, playback-speed, seed, background, and Reduce Motion controls. It doubles as the QA harness used to tune the effects against reference recordings:

```
swift run ReactionsDemo --effect confetti --seed 42 --pause-at 1.0,2.5 --background dark --capture QA/captures
```

That plays an effect deterministically, freezes at each timestamp, and writes PNG snapshots without needing the screen-recording permission. `--effect confetti,fireworks,rain` runs several at once; `--reduce-motion` captures the calm variants.

## How it works

One transparent SpriteKit scene hosts every play. Effects are plain classes that add nodes to a container and get a per-frame `update` tick; the tunable motion math lives in pure value types with unit tests, and all randomness flows through a seedable generator so a given seed reproduces a run exactly. Textures are drawn at runtime with Core Graphics. The package ships no image assets, and nothing in it comes from Apple's own effect resources.

## License

MIT — see [LICENSE](https://github.com/GordonBeeming/mac-reactions/blob/main/LICENSE).
