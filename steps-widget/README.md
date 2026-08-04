# Steps Widget

A small iOS app that connects to HealthKit and shows today's step count in a
Home Screen widget — no Apple Watch required. The main app requests
HealthKit read access, listens for new step data in the background, and
writes the latest count to an App Group container that the widget extension
reads.

## Project layout

- `project.yml` — [XcodeGen](https://github.com/yonaskolb/XcodeGen) project
  spec. This is the source of truth; the generated `.xcodeproj` is not
  committed (see `.gitignore`).
- `StepsWidgetApp/` — the iOS app (SwiftUI). Requests HealthKit
  authorization, reads today's step count, and refreshes it via
  `HKObserverQuery` + background delivery whenever Health records new steps.
- `StepsWidgetExtension/` — the WidgetKit extension. Renders small/medium
  widgets from the last value written to the shared App Group container.
- `Shared/` — code used by both targets: the App Group read/write helper
  and the snapshot model.

## Why the widget doesn't query HealthKit directly

Widgets get a very small background execution budget, so instead of having
the widget itself hit HealthKit on a timer, the app does the work: it
observes step changes via `HKObserverQuery` with background delivery
enabled, writes the new total to `UserDefaults(suiteName:)` in the shared
App Group, and calls `WidgetCenter.shared.reloadTimelines(ofKind:)`. The
widget's `TimelineProvider` just reads that shared value. This is the
standard, reliable pattern for HealthKit-backed widgets.

## Setup

1. Install XcodeGen if you don't have it: `brew install xcodegen`
2. From this directory, generate the Xcode project:
   ```
   xcodegen generate
   ```
3. Open `StepsWidget.xcodeproj` in Xcode.
4. Select both targets (`StepsWidgetApp` and `StepsWidgetExtension`) in
   Signing & Capabilities and set your Apple Developer Team. Xcode should
   pick up the `group.com.jonesco.stepswidget` App Group from the
   entitlements automatically; if not, add the App Groups capability and
   create/select that group for both targets.
5. If you want a different bundle ID prefix or App Group identifier, update
   `com.jonesco.stepswidget` throughout `project.yml` and
   `Shared/StepsWidgetConstants.swift`, then re-run `xcodegen generate`.
6. Build and run `StepsWidgetApp` **on a real device** — HealthKit isn't
   available in the iOS Simulator. Grant Health access when prompted.
7. Long-press the Home Screen, add a widget, and pick "Steps" (small or
   medium) into a widget stack.

## Notes / possible follow-ups

- Lock Screen accessory widgets (`.accessoryCircular` / `.accessoryRectangular`)
  would be a natural next step and reuse the same `StepsStore` data.
- A daily step goal / progress ring could be added to `ContentView` and the
  widget views without touching the HealthKit or App Group plumbing.
