import type {
  LegacySerializedProvenance,
  ProvenanceChangeMeta,
  ProvenanceChangeSource,
  ProvenanceMode,
  ProvenanceStrategy,
  ProvenanceView,
  ProvenanceWidgetType,
  SerializedProvenance,
  SerializedProvenanceRecord,
} from "../types/provenance";

export type InteractionSource = Extract<
  ProvenanceChangeSource,
  "user" | "history" | "external"
>;

export interface ProvenanceScheduler<THandle = unknown> {
  setInterval(callback: () => void, intervalMs: number): THandle;
  clearInterval(intervalId: THandle): void;
}

export interface ProvenanceInteractionOptions {
  source?: InteractionSource;
  caller?: string | number;
  time?: Date;
}

export interface ProvenanceControllerOptions<
  TValue,
  THandle = unknown,
  TStrategy extends ProvenanceStrategy = ProvenanceStrategy,
> {
  id: string;
  widgetType: ProvenanceWidgetType;
  value: TValue;
  provenance?:
    | SerializedProvenance<TValue>
    | LegacySerializedProvenance<TValue>;
  mode?: ProvenanceMode;
  sampleIntervalMs?: number;
  freeze?: boolean;
  visualize?: boolean;
  onProvenanceChange?: (
    provenance: SerializedProvenance<TValue>,
    meta: ProvenanceChangeMeta<TValue>
  ) => void;
  strategy?: TStrategy;
  strategyFactory?: () => TStrategy;
  now?: () => Date;
  scheduler?: ProvenanceScheduler<THandle>;
  valuesEqual?: (
    left: TValue | undefined,
    right: TValue
  ) => boolean;
  autoStart?: boolean;
}

export interface ProvenanceControllerSnapshot<
  TValue,
  TStrategy extends ProvenanceStrategy = ProvenanceStrategy,
> {
  id: string;
  widgetType: ProvenanceWidgetType;
  mode: ProvenanceMode;
  sampleIntervalMs: number;
  freeze: boolean;
  visualize: boolean;
  view: ProvenanceView;
  currentValue: TValue | undefined;
  hasProvenance: boolean;
  provenance: SerializedProvenance<TValue>;
  strategy: TStrategy | undefined;
}

export interface ProvenanceControllerSetOptions<TValue> {
  mode?: ProvenanceMode;
  sampleIntervalMs?: number;
  freeze?: boolean;
  visualize?: boolean;
  onProvenanceChange?: (
    provenance: SerializedProvenance<TValue>,
    meta: ProvenanceChangeMeta<TValue>
  ) => void;
}

export default class ProvenanceController<
  TValue = unknown,
  THandle = unknown,
  TStrategy extends ProvenanceStrategy = ProvenanceStrategy,
> {
  constructor(
    options: ProvenanceControllerOptions<TValue, THandle, TStrategy>
  );

  readonly id: string;
  readonly widgetType: ProvenanceWidgetType;
  mode: ProvenanceMode;
  sampleIntervalMs: number;
  freeze: boolean;
  visualize: boolean;
  view: ProvenanceView;
  onProvenanceChange?: (
    provenance: SerializedProvenance<TValue>,
    meta: ProvenanceChangeMeta<TValue>
  ) => void;
  currentValue: TValue | undefined;
  strategy: TStrategy | undefined;
  history: SerializedProvenanceRecord<TValue>[];
  active: boolean;
  disposed: boolean;

  hasInteractions(): boolean;
  getSnapshot(): ProvenanceControllerSnapshot<TValue, TStrategy>;
  exportProvenance(): SerializedProvenance<TValue>;
  subscribe(listener: () => void): () => boolean;
  setCurrentValue(value: TValue): boolean;
  recordInteraction(
    value: TValue,
    options?: ProvenanceInteractionOptions
  ): boolean;
  recordExternalChange(
    value: TValue,
    options?: Omit<ProvenanceInteractionOptions, "source">
  ): boolean;
  restoreValue(
    value: TValue,
    options?: Omit<ProvenanceInteractionOptions, "source">
  ): boolean;
  replaceProvenance(
    provenance:
      | SerializedProvenance<TValue>
      | LegacySerializedProvenance<TValue>,
    options?: { emit?: boolean }
  ): SerializedProvenance<TValue>;
  setOptions(options?: ProvenanceControllerSetOptions<TValue>): void;
  toggleView(): ProvenanceView;
  start(): void;
  stop(): void;
  dispose(): void;
}
