// src/utils/formatFloat.ts

export function formatFloatRangePrecise(
  minFloat: number | null,
  maxFloat: number | null,
) {
  if (minFloat === null || maxFloat === null) return "N/A";
  return `${minFloat.toFixed(12)} - ${maxFloat.toFixed(12)}`;
}

export function formatFloatRangeCompact(
  minFloat: number | null,
  maxFloat: number | null,
) {
  if (minFloat === null || maxFloat === null) return "N/A";

  const format = (value: number) => {
    return value.toFixed(2).replace(/\.00$/, "");
  };

  return `${format(minFloat)} - ${format(maxFloat)}`;
}
