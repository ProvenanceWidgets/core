export type ProvenanceMode = "interaction" | "time";

export type ProvenanceView = "default" | "aggregate" | "temporal";

export type ProvenanceKey = string | number | symbol;

export type ProvenanceChangeSource =
  | "initial"
  | "user"
  | "history"
  | "external"
  | "time";

export type ProvenanceRecordKind = "baseline" | "interaction" | "sample";

export interface ProvenanceInsertOptions {
  caller?: string | number;
  time?: Date;
  kind?: ProvenanceRecordKind;
  source?: ProvenanceChangeSource;
}

export interface ProvenanceStrategy<TValue = any> extends EventTarget {
  insert?(value: TValue, options?: ProvenanceInsertOptions): unknown;
}

export type ProvenanceWidgetType =
  | "single-slider"
  | "range-slider"
  | "input-text"
  | "dropdown"
  | "multiselect"
  | "radio-group"
  | "checkbox-group";

export interface SerializedProvenanceRecord<V> {
  value: V;
  timestamp: string;
  source: ProvenanceChangeSource;
  kind: ProvenanceRecordKind;
  caller?: string | number;
}

export interface SerializedProvenance<V> {
  schemaVersion: 2;
  widgetId: string;
  widgetType: ProvenanceWidgetType;
  mode: ProvenanceMode;
  sampleIntervalMs: number;
  data: SerializedProvenanceRecord<V>[];
}

export interface LegacyProvenanceRecord<V> {
  value: V;
  timestamp: Date | string | number;
}

export type LegacySerializedProvenance<V> =
  | {
      data: LegacyProvenanceRecord<V>[];
      revalidate?: boolean;
    }
  | {
      selections: LegacyProvenanceRecord<V>[];
      revalidate?: boolean;
    };

export interface ProvenanceChangeMeta<V> {
  source: ProvenanceChangeSource;
  record: SerializedProvenanceRecord<V>;
}

export interface WidgetRegistration<V = unknown> {
  id: string;
  type: ProvenanceWidgetType;
  provenance: unknown;
  getProvenance?: () => SerializedProvenance<V>;
  getValue: () => V;
  setValue: (
    value: V,
    source: ProvenanceChangeSource
  ) => boolean | void;
  focus?: () => void;
  element?: HTMLElement | null;
  elementRef?: { current: HTMLElement | null };
}
