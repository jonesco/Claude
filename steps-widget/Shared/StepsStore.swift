import Foundation
import WidgetKit

/// Reads and writes the latest step count to the shared App Group container
/// so the widget extension can display it without querying HealthKit itself.
enum StepsStore {
    private static let key = "latestStepsSnapshot"

    private static var defaults: UserDefaults? {
        UserDefaults(suiteName: StepsWidgetConstants.appGroupID)
    }

    static func save(_ snapshot: StepsSnapshot) {
        guard let defaults, let data = try? JSONEncoder().encode(snapshot) else { return }
        defaults.set(data, forKey: key)
        WidgetCenter.shared.reloadTimelines(ofKind: StepsWidgetConstants.widgetKind)
    }

    static func load() -> StepsSnapshot? {
        guard let defaults, let data = defaults.data(forKey: key) else { return nil }
        return try? JSONDecoder().decode(StepsSnapshot.self, from: data)
    }
}
