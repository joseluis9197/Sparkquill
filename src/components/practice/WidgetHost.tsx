"use client";

import SolidExplorer from "@/components/widgets/solid-explorer/SolidExplorer";
import type { SolidAttribute, SolidKey } from "@/lib/geometry/solids";
import type { WidgetSpec } from "@/lib/items/types";

/**
 * Renders the manipulative attached to an item.
 *
 * Generators reference widgets by key, and not every key has a component yet.
 * An unimplemented widget renders nothing rather than an error or a broken
 * box: the question still works without it, and a child should never be shown
 * a placeholder apologising for missing software.
 */
export default function WidgetHost({
  widget,
  audio = true,
}: {
  widget: WidgetSpec | undefined;
  audio?: boolean;
}) {
  if (!widget) return null;

  switch (widget.key) {
    case "solid-explorer": {
      const config = widget.config as {
        solid: SolidKey;
        highlight?: SolidAttribute;
        countable?: boolean;
      };
      return (
        <SolidExplorer
          solid={config.solid}
          highlight={config.highlight ?? "faces"}
          countable={config.countable ?? true}
          audio={audio}
          className="mt-5"
        />
      );
    }

    default:
      return null;
  }
}

/** Widget keys that currently have a component behind them. */
export const IMPLEMENTED_WIDGETS = new Set(["solid-explorer"]);
