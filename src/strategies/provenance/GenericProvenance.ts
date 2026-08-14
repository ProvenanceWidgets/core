import { PROVENANCE_INSERT_EVENT } from "../../shared/constants";
import type { Optional } from "../../shared/typeUtils";
import type { ProvenanceKey } from "../../types/provenance";
import Provenance, { TemporalRecord, TemporalValueRecord } from "./Provenance";

export interface AggregateGenericRecord extends TemporalRecord {
  count: number;
}

export default class GenericProvenance<T extends ProvenanceKey> extends Provenance<
  AggregateGenericRecord,
  TemporalValueRecord<T>,
  T,
  number
> {
  constructor(temporalData: Optional<TemporalValueRecord<T>, "index">[] = []) {
    super();
    this.domain.set("count", [0, 0]);
    temporalData.forEach(({ value, time }) => this.insert(value, { time }));
  }

  insert(
    value: T,
    options: {
      caller?: ProvenanceKey;
      time?: Date;
      kind?: TemporalRecord["kind"];
      source?: TemporalRecord["source"];
    } = {}
  ) {
    const time = this.updateTime(options.time);
    const index = this.domain.get("index")![1] + 1;

    this.detailedData.set(index, {
      value,
      time,
      index,
      ...(options.kind ? { kind: options.kind } : {}),
      ...(options.source ? { source: options.source } : {}),
    });

    const count = (this.aggregateData.get(value)?.count ?? 0) + 1;
    this.aggregateData.set(value, { time, count, index });

    const maxCount = this.domain.get("count")![1];
    this.domain.set("count", [0, Math.max(maxCount, count)]);
    this.domain.set("index", [0, index]);

    const { caller, kind, source } = options;
    this.dispatchEvent(
      new CustomEvent(PROVENANCE_INSERT_EVENT, {
        detail: { ...this, caller, kind, source },
      })
    );
    return this;
  }
}
