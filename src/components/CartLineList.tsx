"use client";

import type { CartLine } from "@/context/CartContext";
import { formatMoney } from "@/lib/money";
import { computeLinePricing } from "@/lib/products";
import { clampLineQuantity } from "@/lib/quantity";
import { TOPPING_OPTIONS, toppingLabels } from "@/lib/toppings";

type ReadOnlyProps = {
  lines: CartLine[];
  compact?: boolean;
  readOnly: true;
};

type EditableProps = {
  lines: CartLine[];
  compact?: boolean;
  readOnly?: false;
  onRemove: (key: string) => void;
  onUpdate: (
    key: string,
    patch: Partial<Pick<CartLine, "toppingIds" | "quantity">>
  ) => void;
};

export function CartLineList(props: ReadOnlyProps | EditableProps) {
  const { lines, compact } = props;
  const readOnly = "readOnly" in props && props.readOnly === true;

  if (lines.length === 0) {
    return (
      <p className="text-sm text-muted">
        Your cart is empty. Add items from the menu.
      </p>
    );
  }

  if (readOnly) {
    return (
      <ul className={compact ? "space-y-3" : "space-y-4"}>
        {lines.map((line) => {
          const priced = computeLinePricing(line.product, line.toppingIds);
          const labels = toppingLabels(line.toppingIds);
          return (
            <li
              key={line.key}
              className="flex flex-col gap-2 rounded-xl border border-line bg-surface px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="font-medium text-ink">{line.product.name}</p>
                <p className="mt-1 text-sm text-muted">
                  {labels.length > 0 ? labels.join(", ") : "Plain"}
                  <span className="text-muted/50"> · </span>
                  Qty {line.quantity}
                </p>
              </div>
              <p className="shrink-0 text-base font-semibold text-brand-burgundy sm:text-right">
                {priced ? formatMoney(priced.unitCents * line.quantity) : "—"}
              </p>
            </li>
          );
        })}
      </ul>
    );
  }

  const { onRemove, onUpdate } = props;

  return (
    <ul className={compact ? "space-y-3" : "space-y-4"}>
      {lines.map((line) => {
        const priced = computeLinePricing(line.product, line.toppingIds);
        return (
          <li
            key={line.key}
            className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-4 sm:flex-row sm:items-end sm:justify-between"
          >
            <div className="min-w-0 flex-1">
              <p className="font-medium text-ink">{line.product.name}</p>
              <p className="mt-1 text-xs text-muted">
                Base {formatMoney(line.product.base_price_cents)} · +{" "}
                {formatMoney(500)} per topping
              </p>
              <fieldset className="mt-3 space-y-2">
                <legend className="text-xs font-medium text-muted">
                  Toppings ({formatMoney(500)} each)
                </legend>
                {TOPPING_OPTIONS.map((t) => {
                  const checked = line.toppingIds.includes(t.id);
                  return (
                    <label
                      key={t.id}
                      className="flex cursor-pointer items-center gap-2 text-sm text-ink"
                    >
                      <input
                        type="checkbox"
                        className="rounded border-line text-brand-burgundy focus:ring-brand-burgundy/30"
                        checked={checked}
                        onChange={() => {
                          const next = checked
                            ? line.toppingIds.filter((x) => x !== t.id)
                            : [...line.toppingIds, t.id];
                          onUpdate(line.key, { toppingIds: next });
                        }}
                      />
                      {t.label}
                    </label>
                  );
                })}
              </fieldset>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <label className="text-xs font-medium text-muted">
                Qty
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="off"
                  className="ml-2 w-20 touch-manipulation rounded-lg border border-line bg-surface-elevated px-2 py-2 text-sm text-ink"
                  value={String(line.quantity)}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, "");
                    if (digits === "") return;
                    onUpdate(line.key, {
                      quantity: clampLineQuantity(Number(digits) || 0),
                    });
                  }}
                  onBlur={(e) => {
                    const digits = e.target.value.replace(/\D/g, "");
                    onUpdate(line.key, {
                      quantity: clampLineQuantity(Number(digits) || 0),
                    });
                  }}
                />
              </label>
              <p className="text-sm font-semibold text-brand-burgundy">
                {priced
                  ? formatMoney(priced.unitCents * line.quantity)
                  : "—"}
              </p>
              <button
                type="button"
                onClick={() => onRemove(line.key)}
                className="text-sm font-medium text-brand-burgundy-deep/80 hover:text-brand-burgundy-deep hover:underline"
              >
                Remove
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
