import { PROVENANCE_INSERT_EVENT } from "../../shared/constants";
import type {
  ProvenanceChangeSource,
  ProvenanceKey,
  ProvenanceWidgetType,
} from "../../types/provenance";
import Provenance, { TemporalRecord } from "./Provenance";

export interface SuperWidgetRegistration {
  id: string;
  type: ProvenanceWidgetType;
  provenance: Provenance<any, any, any, any>;
  getValue: () => unknown;
  setValue: (
    value: unknown,
    source: ProvenanceChangeSource
  ) => boolean | void;
  element?: HTMLElement | null;
  elementRef?: { current: HTMLElement | null };
  focus?: () => void;
}

type RegisteredWidget = SuperWidgetRegistration & {
  listener: EventListener;
};

export default class SuperProvenance extends Provenance<
  TemporalRecord,
  TemporalRecord[],
  string,
  string
> {
  registeredWidgets: Map<string, RegisteredWidget>;

  constructor() {
    super();
    this.registeredWidgets = new Map();
  }

  register(registration: SuperWidgetRegistration) {
    if (!registration?.provenance) {
      throw new TypeError("A super-provenance registration requires provenance");
    }

    const existing = this.registeredWidgets.get(registration.id);
    if (existing?.provenance === registration.provenance) {
      this.registeredWidgets.set(registration.id, {
        ...existing,
        ...registration,
      });
      return this;
    }

    this.unregister(registration.id);

    const listener: EventListener = event => {
      const detail = (event as CustomEvent).detail;
      if (detail?.kind !== undefined && detail.kind !== "interaction") return;
      this.insert(registration.id);
    };

    registration.provenance.addEventListener(
      PROVENANCE_INSERT_EVENT,
      listener
    );
    this.registeredWidgets.set(registration.id, {
      ...registration,
      listener,
    });
    return this;
  }

  unregister(id: string) {
    const registration = this.registeredWidgets.get(id);
    if (!registration) return false;

    registration.provenance.removeEventListener(
      PROVENANCE_INSERT_EVENT,
      registration.listener
    );
    this.registeredWidgets.delete(id);
    this.detailedData.delete(id);
    return true;
  }

  insert(value: string, options: { caller?: ProvenanceKey; time?: Date } = {}) {
    const time = this.updateTime(options.time);
    const index = this.domain.get("index")![1] + 1;

    this.domain.set("index", [0, index]);
    this.detailedData.set(value, this.detailedData.get(value) ?? []);
    this.detailedData.get(value)!.push({
      time,
      index,
      kind: "interaction",
    });

    this.dispatchEvent(
      new CustomEvent(PROVENANCE_INSERT_EVENT, {
        detail: { ...this },
      })
    );

    return this;
  }
}
