import SwiftUI

struct ContentView: View {
    @StateObject private var healthKit = HealthKitManager.shared

    var body: some View {
        VStack(spacing: 24) {
            Image(systemName: "figure.walk")
                .font(.system(size: 48))
                .foregroundStyle(.tint)

            Text("\(healthKit.todaySteps)")
                .font(.system(size: 64, weight: .bold, design: .rounded))
                .contentTransition(.numericText())

            Text("steps today")
                .font(.headline)
                .foregroundStyle(.secondary)

            if let lastUpdated = healthKit.lastUpdated {
                Text("Updated \(lastUpdated.formatted(date: .omitted, time: .shortened))")
                    .font(.caption)
                    .foregroundStyle(.tertiary)
            }

            if let errorMessage = healthKit.errorMessage {
                Text(errorMessage)
                    .font(.caption)
                    .foregroundStyle(.red)
                    .multilineTextAlignment(.center)
            }

            if healthKit.isAuthorized {
                Button("Refresh") {
                    Task { await healthKit.refreshSteps() }
                }
                .buttonStyle(.bordered)
            } else {
                Button("Connect to Health") {
                    Task { await healthKit.requestAuthorization() }
                }
                .buttonStyle(.borderedProminent)
            }

            Text("Add the Steps widget to your Home Screen widget stack to see this without opening the app.")
                .font(.footnote)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal)
        }
        .padding()
        .task {
            await healthKit.requestAuthorization()
        }
    }
}

#Preview {
    ContentView()
}
