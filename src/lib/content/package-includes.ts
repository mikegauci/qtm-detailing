const PACKAGE_TO_SERVICE_SLUG: Record<string, string> = {
  "Complete Detail": "complete-detail",
  "Complete Paint Enhancement": "complete-paint-enhancement",
  "Signature Detail": "signature-detail",
  "Signature Detail + Glass": "signature-detail-glass-protection",
};

/**
 * Paint Enhancement includes comprehensive exterior work, so the comparison
 * table should show Exterior Detail as included when Paint Enhancement is.
 */
function applyImplicitIncludes(
  includes: boolean[],
  comparisonFeatures: string[],
): boolean[] {
  const result = [...includes];
  const exteriorIdx = comparisonFeatures.findIndex(
    (label) => label === "Exterior Detail",
  );
  const paintIdx = comparisonFeatures.findIndex(
    (label) => label === "Paint Enhancement",
  );

  if (exteriorIdx >= 0 && paintIdx >= 0 && result[paintIdx]) {
    result[exteriorIdx] = true;
  }

  return result;
}

export function buildIncludesFromIncludedServices(
  includedServices: string[],
  comparisonFeatures: string[],
): boolean[] {
  const normalizedIncludes = includedServices.map((service) =>
    service.toLowerCase(),
  );

  const includes = comparisonFeatures.map((label) =>
    normalizedIncludes.includes(label.toLowerCase()),
  );

  return applyImplicitIncludes(includes, comparisonFeatures);
}

export function getPackageServiceSlug(packageName: string): string | undefined {
  return PACKAGE_TO_SERVICE_SLUG[packageName];
}

export function resolvePackageIncludes(
  packageName: string,
  comparisonFeatures: string[],
  includedServicesBySlug: Map<string, string[]>,
  storedIncludes: boolean[],
): boolean[] {
  const serviceSlug = getPackageServiceSlug(packageName);
  const includedServices = serviceSlug
    ? includedServicesBySlug.get(serviceSlug)
    : undefined;

  if (!includedServices?.length) {
    return applyImplicitIncludes(storedIncludes, comparisonFeatures);
  }

  return buildIncludesFromIncludedServices(
    includedServices,
    comparisonFeatures,
  );
}

function addExteriorDetailWhenPaintIncluded(services: string[]): string[] {
  const hasPaint = services.some(
    (service) => service.toLowerCase() === "paint enhancement",
  );
  const hasExterior = services.some(
    (service) => service.toLowerCase() === "exterior detail",
  );

  if (!hasPaint || hasExterior) {
    return services;
  }

  const paintIndex = services.findIndex(
    (service) => service.toLowerCase() === "paint enhancement",
  );

  return [
    ...services.slice(0, paintIndex + 1),
    "Exterior Detail",
    ...services.slice(paintIndex + 1),
  ];
}

export function resolvePackageFeatures(
  packageName: string,
  includedServicesBySlug: Map<string, string[]>,
  storedFeatures: string[],
): string[] {
  const serviceSlug = getPackageServiceSlug(packageName);
  const includedServices = serviceSlug
    ? includedServicesBySlug.get(serviceSlug)
    : undefined;

  if (!includedServices?.length) {
    return storedFeatures;
  }

  return addExteriorDetailWhenPaintIncluded(includedServices);
}
