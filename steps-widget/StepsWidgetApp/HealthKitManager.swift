import Foundation
import HealthKit

@MainActor
final class HealthKitManager: ObservableObject {
    static let shared = HealthKitManager()

    private let healthStore = HKHealthStore()
    private let stepType = HKObjectType.quantityType(forIdentifier: .stepCount)!
    private var isObserving = false

    @Published var isAuthorized = false
    @Published var todaySteps: Int = 0
    @Published var lastUpdated: Date?
    @Published var errorMessage: String?

    private init() {}

    var isHealthDataAvailable: Bool {
        HKHealthStore.isHealthDataAvailable()
    }

    func requestAuthorization() async {
        guard isHealthDataAvailable else {
            errorMessage = "Health data isn't available on this device."
            return
        }
        do {
            try await healthStore.requestAuthorization(toShare: [], read: [stepType])
            isAuthorized = true
            errorMessage = nil
            await refreshSteps()
            startObservingStepChanges()
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func refreshSteps() async {
        do {
            let steps = try await fetchTodayStepCount()
            todaySteps = steps
            lastUpdated = Date()
            let snapshot = StepsSnapshot(
                stepCount: steps,
                day: Calendar.current.startOfDay(for: Date()),
                updatedAt: Date()
            )
            StepsStore.save(snapshot)
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    private func fetchTodayStepCount() async throws -> Int {
        let calendar = Calendar.current
        let startOfDay = calendar.startOfDay(for: Date())
        let predicate = HKQuery.predicateForSamples(withStart: startOfDay, end: Date(), options: .strictStartDate)

        return try await withCheckedThrowingContinuation { continuation in
            let query = HKStatisticsQuery(
                quantityType: stepType,
                quantitySamplePredicate: predicate,
                options: .cumulativeSum
            ) { _, statistics, error in
                if let error {
                    continuation.resume(throwing: error)
                    return
                }
                let sum = statistics?.sumQuantity()?.doubleValue(for: .count()) ?? 0
                continuation.resume(returning: Int(sum))
            }
            healthStore.execute(query)
        }
    }

    /// Wakes the app in the background whenever Health records new step
    /// data, so the widget can be refreshed without the user opening the
    /// app or wearing an Apple Watch.
    private func startObservingStepChanges() {
        guard !isObserving else { return }
        isObserving = true

        let query = HKObserverQuery(sampleType: stepType, predicate: nil) { [weak self] _, completionHandler, error in
            guard let self else {
                completionHandler()
                return
            }
            Task { @MainActor in
                await self.refreshSteps()
                completionHandler()
            }
        }
        healthStore.execute(query)

        healthStore.enableBackgroundDelivery(for: stepType, frequency: .immediate) { success, error in
            if let error {
                print("Failed to enable background delivery: \(error.localizedDescription)")
            }
        }
    }
}
