"use client";

import SolidExplorer from "@/components/widgets/solid-explorer/SolidExplorer";
import InteractiveClock from "@/components/widgets/InteractiveClock";
import BaseTenBlocks from "@/components/widgets/BaseTenBlocks";
import NumberLine from "@/components/widgets/NumberLine";
import PlaceValueChart from "@/components/widgets/PlaceValueChart";
import ShapeViewer from "@/components/widgets/ShapeViewer";
import type { SolidAttribute, SolidKey } from "@/lib/geometry/solids";
import type { ShapeKey } from "@/lib/geometry/shapes-2d";
import type { WidgetSpec } from "@/lib/items/types";

/**
 * Renders the manipulative attached to an item.
 *
 * Generators reference widgets by key. A key with no component renders
 * nothing rather than an error or a placeholder: the question still works
 * without it, and a child should never be shown a box apologising for missing
 * software.
 */
export default function WidgetHost({
  widget,
  audio = true,
}: {
  widget: WidgetSpec | undefined;
  audio?: boolean;
}) {
  if (!widget) return null;
  const config = widget.config as Record<string, never> as Record<string, unknown>;

  switch (widget.key) {
    case "solid-explorer":
      return (
        <SolidExplorer
          solid={config.solid as SolidKey}
          highlight={(config.highlight as SolidAttribute) ?? "faces"}
          countable={(config.countable as boolean) ?? true}
          audio={audio}
          className="mt-5"
        />
      );

    case "interactive-clock":
      return (
        <InteractiveClock
          hour={config.hour as number}
          minute={config.minute as number}
          // Reading tasks must not let the child move the hands, and must not
          // show the digital time — that would be the answer.
          interactive={(config.interactive as boolean) ?? false}
          showDigital={(config.showDigital as boolean) ?? false}
          audio={audio}
          className="mt-5"
        />
      );

    case "base-ten-blocks":
      return (
        <BaseTenBlocks
          a={config.a as number}
          b={config.b as number | undefined}
          operation={(config.operation as "add" | "subtract" | "show") ?? "show"}
          audio={audio}
          className="mt-5"
        />
      );

    case "number-line-zoom":
      return (
        <NumberLine
          value={config.value as number | undefined}
          marks={config.marks as number[] | undefined}
          place={config.place as number | undefined}
          audio={audio}
          className="mt-5"
        />
      );

    case "place-value-chart":
      return (
        <PlaceValueChart
          value={config.value as number}
          audio={audio}
          className="mt-5"
        />
      );

    case "shape-viewer":
      return (
        <ShapeViewer
          shape={config.shape as ShapeKey}
          highlight={
            (config.highlight as "sides" | "vertices" | "symmetry") ?? "sides"
          }
          className="mt-5"
        />
      );

    default:
      return null;
  }
}

/** Widget keys that currently have a component behind them. */
export const IMPLEMENTED_WIDGETS = new Set([
  "solid-explorer",
  "interactive-clock",
  "base-ten-blocks",
  "number-line-zoom",
  "place-value-chart",
  "shape-viewer",
]);
