const NAME_COLLATOR = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: "base",
});

export function compareNames(
  a: string | null | undefined,
  b: string | null | undefined
): number {
  return NAME_COLLATOR.compare(a ?? "", b ?? "");
}

export function sortByName<T>(
  items: readonly T[],
  getName: (item: T) => string | null | undefined
): T[] {
  return [...items].sort((left, right) =>
    compareNames(getName(left), getName(right))
  );
}
