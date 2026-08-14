import { EPOCH } from "../../shared/constants";
import type {
  ProvenanceChangeSource,
  ProvenanceKey,
  ProvenanceRecordKind,
} from "../../types/provenance";

export interface TemporalRecord {
  time: Date;
  index: number;
  kind?: ProvenanceRecordKind;
  source?: ProvenanceChangeSource;
}

export interface TemporalValueRecord<V> extends TemporalRecord {
  value: V;
}

export default abstract class Provenance<
  AV extends TemporalRecord,
  TV,
  AK = ProvenanceKey,
  TK extends ProvenanceKey = ProvenanceKey,
> extends EventTarget {
  domain: Map<keyof AV | keyof TV, number[]>;
  aggregateData: Map<AK, AV>;
  detailedData: Map<TK, TV>;

  constructor() {
    super();
    this.domain = new Map();
    this.aggregateData = new Map();
    this.detailedData = new Map();
    this.domain.set("time", [
      EPOCH.getTime(),
      EPOCH.getTime(),
      EPOCH.getTime(),
    ]);
    this.domain.set("index", [0, 0]);
  }

  protected updateTime(time = new Date()) {
    let [minTime, _, newMaxTime] = this.domain.get("time")!;
    if (minTime === EPOCH.getTime()) minTime = time.getTime();
    if (newMaxTime === EPOCH.getTime()) newMaxTime = time.getTime();
    this.domain.set("time", [minTime, newMaxTime, time.getTime()]);
    return time;
  }

  abstract insert(
    value: AK | Iterable<AK>,
    options: { caller?: ProvenanceKey } & Partial<AV>
  ): this;
}
