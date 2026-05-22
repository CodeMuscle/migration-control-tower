/**
 * OpenTelemetry bootstrap for the validation worker. Imported as a
 * first-import side effect so the SDK starts before @aws-sdk/bullmq/pg are
 * imported (their require-in-the-middle instrumentation needs that).
 */
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { ConsoleSpanExporter } from "@opentelemetry/sdk-trace-base";

function startOtel(): void {
  if (process.env.OTEL_SDK_DISABLED === "true") return;
  const sdk = new NodeSDK({
    serviceName: process.env.OTEL_SERVICE_NAME ?? "worker-validation",
    traceExporter: new ConsoleSpanExporter(),
    instrumentations: [
      getNodeAutoInstrumentations({
        "@opentelemetry/instrumentation-fs": { enabled: false },
      }),
    ],
  });
  try {
    sdk.start();
    process.once("SIGTERM", () => {
      void sdk.shutdown().finally(() => process.exit(0));
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[otel] failed to start", err);
  }
}

startOtel();
