"use client";

import InteractiveClock from "@/components/widgets/InteractiveClock";
import BaseTenBlocks from "@/components/widgets/BaseTenBlocks";
import NumberLine from "@/components/widgets/NumberLine";
import PlaceValueChart from "@/components/widgets/PlaceValueChart";
import FractionBar from "@/components/widgets/FractionBar";
import ArrayBuilder from "@/components/widgets/ArrayBuilder";
import DataGraph, { BoxPlot } from "@/components/widgets/DataGraph";
import CoordinateGrid from "@/components/widgets/CoordinateGrid";
import AngleViewer from "@/components/widgets/AngleViewer";
import VolumeCubes from "@/components/widgets/VolumeCubes";
import MoneyCounter from "@/components/widgets/MoneyCounter";
import BalanceScale from "@/components/widgets/BalanceScale";

function Section({
  title,
  benchmark,
  note,
  children,
}: {
  title: string;
  benchmark: string;
  note: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10">
      <h2 className="text-xl">{title}</h2>
      <p className="mt-1 font-mono text-xs text-[var(--text-muted)]">
        {benchmark}
      </p>
      <p className="mt-2 text-sm text-[var(--text-muted)]">{note}</p>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function WidgetGallery() {
  return (
    <div>
      <Section
        title="Interactive Clock — reading"
        benchmark="MA.2.M.2.1"
        note="How it appears on a question: hands fixed, no digital readout to give it away."
      >
        <InteractiveClock hour={3} minute={45} interactive={false} showDigital={false} />
      </Section>

      <Section
        title="Interactive Clock — exploring"
        benchmark="MA.2.M.2.1"
        note="Drag the minute hand, or use the buttons. The hour hand moves with it, so at 3:45 the short hand sits nearly on the 4."
      >
        <InteractiveClock hour={3} minute={45} interactive showDigital />
      </Section>

      <Section
        title="Base-Ten Blocks"
        benchmark="MA.2.NSO.2.3"
        note="Two separate piles until the child combines them. 47 + 25 needs a trade; the widget never says the total."
      >
        <BaseTenBlocks a={47} b={25} operation="add" />
      </Section>

      <Section
        title="Number Line — rounding"
        benchmark="MA.2.NSO.1.4"
        note="The two neighbouring tens and the midpoint. The child reads which end is nearer."
      >
        <NumberLine value={47} place={10} />
      </Section>

      <Section
        title="Number Line — comparing"
        benchmark="MA.2.NSO.1.3"
        note="Two numbers placed to scale."
      >
        <NumberLine marks={[312, 348]} />
      </Section>

      <Section
        title="Place Value Chart"
        benchmark="MA.2.NSO.1.2"
        note="Each digit next to what it is worth. A zero says it holds the place, which is what stops 305 being written as 35."
      >
        <PlaceValueChart value={305} />
      </Section>

      <Section
        title="Fraction Bar"
        benchmark="MA.3.FR.1.1"
        note="Tap the pieces to shade them. The count is stated; the fraction is not, because naming it is the question."
      >
        <FractionBar denominator={6} shaded={2} />
      </Section>

      <Section
        title="Fraction Comparison"
        benchmark="MA.3.FR.2.1"
        note="Two bars of the same length. This is the picture that settles whether 1/3 beats 1/5, without an argument about which digit is bigger."
      >
        <FractionBar compare={[{ n: 1, d: 3 }, { n: 1, d: 5 }]} />
      </Section>

      <Section
        title="Fraction Circle"
        benchmark="MA.2.FR.1.1"
        note="The same idea on a round whole, which is how halves and fourths are usually first met."
      >
        <FractionBar denominator={4} shaded={3} shape="circle" />
      </Section>

      <Section
        title="Array"
        benchmark="MA.3.NSO.2.2"
        note="Multiplication as equal groups. The total stays hidden until asked for, because the total is the answer."
      >
        <ArrayBuilder rows={4} cols={6} />
      </Section>

      <Section
        title="Array, split"
        benchmark="MA.3.AR.1.1"
        note="The distributive property made visible. 7 x 13 is hard; 7 x 10 and 7 x 3 are two facts already known."
      >
        <ArrayBuilder rows={7} cols={13} split={10} mode="area" />
      </Section>

      <Section
        title="Scaled Pictograph"
        benchmark="MA.3.DP.1.1"
        note="Each symbol is worth five. A child who counts symbols and ignores the key gets a wrong answer that looks careful, so the key sits right under the rows."
      >
        <DataGraph kind="pictograph" categories={["Ash", "Birch", "Cedar"]} counts={[20, 35, 15]} scale={5} />
      </Section>

      <Section
        title="Line Graph"
        benchmark="MA.5.DP.1.1"
        note="For questions about change between points rather than the points themselves. The steepest segment is the biggest rise."
      >
        <DataGraph kind="line" categories={["Jan", "Feb", "Mar", "Apr", "May"]} counts={[20, 34, 30, 62, 71]} />
      </Section>

      <Section
        title="Box Plot"
        benchmark="MA.6.DP.1.3"
        note="Derived from the data rather than from stated quartiles, so the picture can never disagree with the numbers the question used."
      >
        <BoxPlot values={[8, 12, 15, 22, 28, 31, 44, 52, 70]} />
      </Section>

      <Section
        title="Coordinate Grid"
        benchmark="MA.5.GR.4.1"
        note="Quadrant I only, because negative numbers are a grade 6 idea and drawing all four would introduce them a year early."
      >
        <CoordinateGrid points={[{ x: 3, y: 7 }]} max={10} />
      </Section>

      <Section
        title="Four Quadrants"
        benchmark="MA.6.GR.1.1"
        note="The same grid with the axes through the middle, for signed coordinates."
      >
        <CoordinateGrid points={[{ x: -4, y: 6 }, { x: 5, y: -3 }]} min={-10} max={10} />
      </Section>

      <Section
        title="Angle Viewer"
        benchmark="MA.4.GR.1.1"
        note="A right angle is drawn faintly behind every angle, because that is the comparison a student would otherwise have to imagine. The measurement stays hidden until asked for."
      >
        <AngleViewer degrees={128} />
      </Section>

      <Section
        title="Angle, split"
        benchmark="MA.4.GR.1.2"
        note="Angle measure is additive. The two parts are drawn as parts, not as two separate angles."
      >
        <AngleViewer degrees={110} split={40} />
      </Section>

      <Section
        title="Volume Cubes"
        benchmark="MA.5.GR.3.1"
        note="Built one layer at a time. Volume stops being three numbers multiplied and becomes the cubes in one layer, repeated."
      >
        <VolumeCubes l={5} w={3} h={4} />
      </Section>

      <Section
        title="Money Counter"
        benchmark="MA.1.M.2.3"
        note="Drawn to real relative size. A dime is smaller than a nickel and worth twice as much, which contradicts everything a six-year-old has been told about bigger meaning more."
      >
        <MoneyCounter coins={[{ value: 25, count: 2 }, { value: 10, count: 1 }, { value: 5, count: 3 }]} />
      </Section>

      <Section
        title="Balance Scale"
        benchmark="MA.2.AR.2.1"
        note="The equals sign means the pans weigh the same. With an unknown on one side the beam stays level, because tipping it would tell the child which way the answer goes."
      >
        <BalanceScale leftLabel="8 + ?" rightLabel="15" />
      </Section>
    </div>
  );
}
