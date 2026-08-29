"use client";

import SolidExplorer from "@/components/widgets/solid-explorer/SolidExplorer";
import InteractiveClock from "@/components/widgets/InteractiveClock";
import BaseTenBlocks from "@/components/widgets/BaseTenBlocks";
import NumberLine from "@/components/widgets/NumberLine";
import PlaceValueChart from "@/components/widgets/PlaceValueChart";
import ShapeViewer from "@/components/widgets/ShapeViewer";
import FractionBar from "@/components/widgets/FractionBar";
import ArrayBuilder from "@/components/widgets/ArrayBuilder";
import DataGraph, { BoxPlot } from "@/components/widgets/DataGraph";
import CoordinateGrid from "@/components/widgets/CoordinateGrid";
import AngleViewer from "@/components/widgets/AngleViewer";
import VolumeCubes from "@/components/widgets/VolumeCubes";
import MoneyCounter from "@/components/widgets/MoneyCounter";
import BalanceScale from "@/components/widgets/BalanceScale";
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

    case "fraction-bar":
      return (
        <FractionBar
          denominator={config.denominator as number | undefined}
          shaded={(config.shaded as number) ?? 0}
          shape={config.shape as "circle" | "rectangle" | "strip" | undefined}
          compare={config.compare as { n: number; d: number }[] | undefined}
          className="mt-5"
        />
      );

    case "array-builder":
      return (
        <ArrayBuilder
          rows={config.rows as number}
          cols={config.cols as number}
          mode={(config.mode as "groups" | "area") ?? "groups"}
          split={config.split as number | undefined}
          revealTotal={(config.revealTotal as boolean) ?? false}
          className="mt-5"
        />
      );

    case "graph-builder":
      return (
        <DataGraph
          kind={(config.kind as "pictograph" | "bar" | "line") ?? "bar"}
          categories={config.categories as string[]}
          counts={config.counts as number[]}
          scale={(config.scale as number) ?? 1}
          className="mt-5"
        />
      );

    case "box-plot":
      return <BoxPlot values={config.values as number[]} className="mt-5" />;

    case "coordinate-grid":
      return (
        <CoordinateGrid
          points={config.points as { x: number; y: number }[]}
          min={(config.min as number) ?? 0}
          max={(config.max as number) ?? 10}
          connect={(config.connect as boolean) ?? false}
          className="mt-5"
        />
      );

    case "angle-viewer":
      return (
        <AngleViewer
          degrees={config.degrees as number}
          split={config.split as number | undefined}
          className="mt-5"
        />
      );

    case "volume-cubes":
      return (
        <VolumeCubes
          l={config.l as number}
          w={config.w as number}
          h={config.h as number}
          className="mt-5"
        />
      );

    case "money-counter":
      return (
        <MoneyCounter
          coins={config.coins as { value: number; count: number }[]}
          className="mt-5"
        />
      );

    case "balance-scale":
      return (
        <BalanceScale
          leftLabel={String(config.leftLabel ?? "")}
          rightLabel={String(config.rightLabel ?? "")}
          left={config.left as number | undefined}
          right={config.right as number | undefined}
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
  "fraction-bar",
  "array-builder",
  "graph-builder",
  "box-plot",
  "coordinate-grid",
  "angle-viewer",
  "volume-cubes",
  "money-counter",
  "balance-scale",
]);
