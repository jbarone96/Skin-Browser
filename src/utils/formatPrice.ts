export function formatPrice(price: number | null): string {
  if (price === null) {
    return "N/A";
  }

  return `$${price.toFixed(2)}`;
}
