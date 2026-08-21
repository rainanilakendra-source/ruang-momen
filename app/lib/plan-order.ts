const PLAN_DISPLAY_ORDER: Record<string, number> = {
  BASIC: 0,
  STANDARD: 1,
  PREMIUM: 2,
  BASIC_PLUS: 3,
  STANDARD_PLUS: 4,
  PREMIUM_PLUS: 5,
};

export function comparePlanDisplayOrder(
  left: { code: string; name: string; price: number },
  right: { code: string; name: string; price: number },
) {
  return (
    (PLAN_DISPLAY_ORDER[left.code.toUpperCase()] ?? Number.MAX_SAFE_INTEGER) -
      (PLAN_DISPLAY_ORDER[right.code.toUpperCase()] ?? Number.MAX_SAFE_INTEGER) ||
    left.price - right.price ||
    left.name.localeCompare(right.name)
  );
}
