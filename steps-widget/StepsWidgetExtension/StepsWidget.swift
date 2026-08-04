import WidgetKit
import SwiftUI

struct StepsEntry: TimelineEntry {
    let date: Date
    let stepCount: Int
    let updatedAt: Date?
}

struct StepsTimelineProvider: TimelineProvider {
    func placeholder(in context: Context) -> StepsEntry {
        StepsEntry(date: .now, stepCount: 4231, updatedAt: nil)
    }

    func getSnapshot(in context: Context, completion: @escaping (StepsEntry) -> Void) {
        completion(currentEntry())
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<StepsEntry>) -> Void) {
        // The widget can't query HealthKit directly on a useful schedule, so
        // it just renders whatever the app last wrote to the shared App
        // Group container. The app calls WidgetCenter.reloadTimelines
        // whenever HealthKit reports new steps, which drives real refreshes;
        // this periodic entry is just a fallback so the widget doesn't go
        // stale if the app hasn't run in a while.
        let entry = currentEntry()
        let timeline = Timeline(entries: [entry], policy: .after(entry.date.addingTimeInterval(30 * 60)))
        completion(timeline)
    }

    private func currentEntry() -> StepsEntry {
        if let snapshot = StepsStore.load(), Calendar.current.isDateInToday(snapshot.day) {
            return StepsEntry(date: .now, stepCount: snapshot.stepCount, updatedAt: snapshot.updatedAt)
        }
        return StepsEntry(date: .now, stepCount: 0, updatedAt: nil)
    }
}

struct StepsWidgetView: View {
    @Environment(\.widgetFamily) private var family
    let entry: StepsEntry

    var body: some View {
        switch family {
        case .systemSmall:
            smallView
        default:
            mediumView
        }
    }

    private var smallView: some View {
        VStack(alignment: .leading, spacing: 8) {
            Image(systemName: "figure.walk")
                .font(.title3)
                .foregroundStyle(.tint)
            Spacer()
            Text("\(entry.stepCount)")
                .font(.system(size: 32, weight: .bold, design: .rounded))
                .minimumScaleFactor(0.6)
                .lineLimit(1)
            Text("steps today")
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .padding()
    }

    private var mediumView: some View {
        HStack(spacing: 16) {
            Image(systemName: "figure.walk.circle.fill")
                .font(.system(size: 44))
                .foregroundStyle(.tint)
            VStack(alignment: .leading, spacing: 4) {
                Text("\(entry.stepCount)")
                    .font(.system(size: 40, weight: .bold, design: .rounded))
                    .minimumScaleFactor(0.6)
                    .lineLimit(1)
                Text("steps today")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                if let updatedAt = entry.updatedAt {
                    Text("Updated \(updatedAt.formatted(date: .omitted, time: .shortened))")
                        .font(.caption2)
                        .foregroundStyle(.tertiary)
                }
            }
            Spacer()
        }
        .padding()
    }
}

struct StepsWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: StepsWidgetConstants.widgetKind, provider: StepsTimelineProvider()) { entry in
            StepsWidgetView(entry: entry)
                .containerBackground(.fill.tertiary, for: .widget)
        }
        .configurationDisplayName("Steps")
        .description("Shows the steps you've taken today, read from Health — no Apple Watch required.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

#Preview(as: .systemSmall) {
    StepsWidget()
} timeline: {
    StepsEntry(date: .now, stepCount: 6789, updatedAt: .now)
}
