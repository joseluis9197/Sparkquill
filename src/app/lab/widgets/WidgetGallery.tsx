"use client";

import InteractiveClock from "@/components/widgets/InteractiveClock";
import BaseTenBlocks from "@/components/widgets/BaseTenBlocks";
import NumberLine from "@/components/widgets/NumberLine";
import PlaceValueChart from "@/components/widgets/PlaceValueChart";

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
    </div>
  );
}
