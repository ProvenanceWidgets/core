const toDate = value => {
    if (!value) return null;
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
};

const compareHistoryRecords = (left, right) => {
    const leftTime = toDate(left.time)?.getTime() ?? -Infinity;
    const rightTime = toDate(right.time)?.getTime() ?? -Infinity;
    if (leftTime !== rightTime) return leftTime - rightTime;
    return (left.index ?? -1) - (right.index ?? -1);
};

export const getRegisteredWidgetValueAtTime = (
    registration,
    targetTime
) => {
    const detailedData = registration?.provenance?.detailedData;
    const target = toDate(targetTime);
    if (!(detailedData instanceof Map) || !target) {
        return { found: false, value: undefined };
    }

    const entries = Array.from(detailedData.entries());
    const genericRecords = entries
        .map(([, record]) => record)
        .filter(record => (
            record &&
            !Array.isArray(record) &&
            "value" in record &&
            toDate(record.time) &&
            toDate(record.time) <= target
        ))
        .sort(compareHistoryRecords);

    if (genericRecords.length > 0) {
        return {
            found: true,
            value: genericRecords.at(-1).value,
        };
    }

    const selectedValues = [];
    let foundSelectionHistory = false;
    for (const [value, records] of entries) {
        if (!Array.isArray(records)) continue;
        const valueHistory = [];
        records.forEach(record => {
            const selectedAt = toDate(record?.select?.time);
            const unselectedAt = toDate(record?.unselect?.time);
            if (selectedAt && selectedAt <= target) {
                valueHistory.push({
                    ...record.select,
                    action: "select",
                });
                foundSelectionHistory = true;
            }
            if (unselectedAt && unselectedAt <= target) {
                valueHistory.push({
                    ...record.unselect,
                    action: "unselect",
                });
                foundSelectionHistory = true;
            }
        });
        valueHistory.sort(compareHistoryRecords);
        if (valueHistory.at(-1)?.action === "select") {
            selectedValues.push(value);
        }
    }

    if (!foundSelectionHistory) {
        return { found: false, value: undefined };
    }
    if (
        registration.type === "dropdown" ||
        registration.type === "radio-group"
    ) {
        return {
            found: true,
            value: selectedValues.at(-1) ?? null,
        };
    }
    return { found: true, value: selectedValues };
};

export const restoreRegisteredWidgetsAtTime = ({
    registrations,
    widgetIds,
    targetTime,
    source = "history",
}) => {
    if (!(registrations instanceof Map)) return [];

    const restored = [];
    for (const widgetId of widgetIds ?? registrations.keys()) {
        const registration = registrations.get(widgetId);
        if (!registration) continue;
        const result = getRegisteredWidgetValueAtTime(
            registration,
            targetTime
        );
        if (!result.found) continue;
        registration.setValue(result.value, source);
        restored.push({ widgetId, value: result.value });
    }
    return restored;
};
