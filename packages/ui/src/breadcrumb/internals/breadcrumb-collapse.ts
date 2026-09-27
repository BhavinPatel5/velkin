export type BreadcrumbCollapseInput = {
  itemCount: number;
  itemsBefore: number;
  itemsAfter: number;
  max: number;
  expanded: boolean;
  measuring: boolean;
  responsive: boolean;
  responsiveCollapse: boolean;
};

export function breadcrumbLeadingKeep(input: BreadcrumbCollapseInput): number {
  return Math.min(Math.max(input.itemsBefore, 0), input.itemCount);
}

export function breadcrumbTrailingKeep(input: BreadcrumbCollapseInput): number {
  const lead = breadcrumbLeadingKeep(input);
  return Math.min(Math.max(input.itemsAfter, 0), Math.max(input.itemCount - lead, 0));
}

export function breadcrumbIsCollapsed(input: BreadcrumbCollapseInput): boolean {
  if (input.expanded || input.measuring) return false;
  const visible = breadcrumbLeadingKeep(input) + breadcrumbTrailingKeep(input);
  if (input.itemCount <= visible) return false;
  const byMax = input.max > 0 && input.itemCount > input.max;
  const byWidth = input.responsive && input.responsiveCollapse;
  return byMax || byWidth;
}

export function breadcrumbLeadingVisible(input: BreadcrumbCollapseInput): number {
  return breadcrumbIsCollapsed(input) ? breadcrumbLeadingKeep(input) : input.itemCount;
}

export function breadcrumbTrailingVisible(input: BreadcrumbCollapseInput): number {
  return breadcrumbIsCollapsed(input) ? breadcrumbTrailingKeep(input) : 0;
}

export function breadcrumbHiddenCount(input: BreadcrumbCollapseInput): number {
  if (!breadcrumbIsCollapsed(input)) return 0;
  return input.itemCount - breadcrumbLeadingVisible(input) - breadcrumbTrailingVisible(input);
}

export function breadcrumbHiddenItems<T extends HTMLElement>(
  items: T[],
  input: BreadcrumbCollapseInput,
): T[] {
  if (!breadcrumbIsCollapsed(input)) return [];
  const lead = breadcrumbLeadingVisible(input);
  const trail = breadcrumbTrailingVisible(input);
  return items.slice(lead, items.length - trail);
}

export function breadcrumbCollapseInput(
  host: {
    itemsBefore: number;
    itemsAfter: number;
    max: number;
    expanded: boolean;
    responsive: boolean;
  },
  itemCount: number,
  measuring: boolean,
  responsiveCollapse: boolean,
): BreadcrumbCollapseInput {
  return {
    itemCount,
    itemsBefore: host.itemsBefore,
    itemsAfter: host.itemsAfter,
    max: host.max,
    expanded: host.expanded,
    measuring,
    responsive: host.responsive,
    responsiveCollapse,
  };
}
