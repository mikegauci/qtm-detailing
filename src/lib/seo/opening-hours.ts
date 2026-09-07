type OpeningHoursSpec = {
  "@type": "OpeningHoursSpecification";
  dayOfWeek: string | string[];
  opens: string;
  closes: string;
};

const DAY_NAMES = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

const DAY_NAME_SET = new Set<string>(DAY_NAMES);

function expandDayLabel(dayLabel: string): string[] {
  const normalized = dayLabel.trim().toLowerCase();

  if (normalized.includes("–") || normalized.includes("-")) {
    const [startRaw, endRaw] = normalized.split(/[–-]/).map((part) => part.trim());
    const startIndex = DAY_NAMES.findIndex((day) =>
      day.toLowerCase().startsWith(startRaw.slice(0, 3)),
    );
    const endIndex = DAY_NAMES.findIndex((day) =>
      day.toLowerCase().startsWith(endRaw.slice(0, 3)),
    );

    if (startIndex >= 0 && endIndex >= startIndex) {
      return [...DAY_NAMES.slice(startIndex, endIndex + 1)];
    }
  }

  const single = DAY_NAMES.find((day) =>
    normalized.startsWith(day.toLowerCase().slice(0, 3)),
  );

  return single ? [single] : [];
}

function parseTimeRange(hours: string): { opens: string; closes: string } | null {
  if (hours.trim().toLowerCase() === "closed") {
    return null;
  }

  const match = hours.match(/(\d{1,2}:\d{2})\s*[–-]\s*(\d{1,2}:\d{2})/);
  if (!match) {
    return null;
  }

  return { opens: match[1]!, closes: match[2]! };
}

function isValidDayOfWeek(value: string | string[]): boolean {
  if (Array.isArray(value)) {
    return value.length > 0 && value.every((day) => DAY_NAME_SET.has(day));
  }

  return DAY_NAME_SET.has(value);
}

export function buildOpeningHoursSpecification(
  hours: { day: string; hours: string }[],
): OpeningHoursSpec[] {
  const specs: OpeningHoursSpec[] = [];

  for (const entry of hours) {
    const timeRange = parseTimeRange(entry.hours);
    if (!timeRange) {
      continue;
    }

    const dayOfWeek = expandDayLabel(entry.day);
    if (dayOfWeek.length === 0) {
      continue;
    }

    const spec: OpeningHoursSpec = {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: dayOfWeek.length === 1 ? dayOfWeek[0]! : dayOfWeek,
      opens: timeRange.opens,
      closes: timeRange.closes,
    };

    if (isValidDayOfWeek(spec.dayOfWeek)) {
      specs.push(spec);
    }
  }

  if (specs.length === 0) {
    return [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "19:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Saturday",
        opens: "09:00",
        closes: "13:00",
      },
    ];
  }

  return specs;
}
