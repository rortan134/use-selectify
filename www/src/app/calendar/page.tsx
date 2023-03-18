"use client";
import * as React from "react";

import { Button } from "../../components/Button";

import useEventListener from "../../utils/useEventListener";
import { useSelectify } from "../../../../src/useSelectify";
import { cn } from "../../utils/cn";

import { ChevronDown, Plus, ChevronRight, ChevronLeft } from "lucide-react";

interface CalendarEvent {
  date: Date;
  label: string;
  time: string;
}

interface CalendarDay {
  date: Date;
  events: CalendarEvent[];
  block: Element | undefined | null;
}

const weekDays = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const scheduledEvents: CalendarEvent[] = [
  {
    date: new Date("March 20 2023"),
    label: "Meeting with Mark",
    time: "14:00 - 15:00",
  },
];

export default function CalendarPage() {
  const selectionContainerRef = React.useRef(null);
  const [selectionCriteria, setSelectionCriteria] =
    React.useState("[data-event]");

  const {
    SelectBoxOutlet,
    hasSelected,
    selectedElements,
    mutateSelections,
    getSelectableElements,
  } = useSelectify(selectionContainerRef, {
    selectCriteria: selectionCriteria,
  });

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.ctrlKey) setSelectionCriteria("[data-calendarday]");
  };

  const handleKeyUp = (event: KeyboardEvent) => {
    if (event.key === "Control") setSelectionCriteria("[data-event]");
  };

  useEventListener(globalThis?.document, "keydown", handleKeyDown);
  useEventListener(globalThis?.document, "keyup", handleKeyUp);

  const [selectedCalendarDays, setSelectedCalendarDays] = React.useState<
    CalendarDay[]
  >([]);

  const selectedDateRange = React.useMemo(() => {
    if (!hasSelected) return [];

    const dates = selectedCalendarDays.map((week) => week.date);
    const sortedDates = dates.sort((a, b) => a.getTime() - b.getTime());
    const startDate = new Date(sortedDates[0] ?? "");
    const endDate = new Date(sortedDates[sortedDates.length - 1] ?? "");

    const range: CalendarDay[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const currentDayBlock: CalendarDay | undefined = selectedCalendarDays.find(
        (calendarDay) => calendarDay.date.getTime() === currentDate.getTime()
      );
      console.log(currentDayBlock);
      if (currentDayBlock) range.push(currentDayBlock);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return range;
  }, [hasSelected, selectedCalendarDays]);

  React.useEffect(() => {
    console.log(selectedDateRange);
  }, [selectedDateRange]);

  /* ---------------------------------------------------------------------------------------------- */

  const currDate = React.useMemo(() => new Date(), []);

  const firstDayOfCurrentMonth = new Date(
    currDate.getFullYear(),
    currDate.getMonth(),
    1
  ).getDay();

  const lastDayOfPreviousMonth = new Date(
    currDate.getFullYear(),
    currDate.getMonth(),
    0
  ).getDate();

  const firstEmptyCells = (firstDayOfCurrentMonth + 7) % 7;
  const lastEmptyCells = (lastDayOfPreviousMonth + 7) % 7;

  const daysInCurrentMonth = React.useMemo(() => {
    const month = currDate.getMonth();
    const year = currDate.getFullYear();

    return Array.from(
      { length: new Date(year, month, 0).getDate() },
      (_, i) => new Date(year, month, i + 1)
    );
  }, [currDate]);

  const daysInPreviousMonth = React.useMemo(() => {
    const month = currDate.getMonth() - 1;
    const year = currDate.getFullYear();

    return Array.from(
      { length: firstEmptyCells },
      (_, i) =>
        new Date(year, month, lastDayOfPreviousMonth - firstEmptyCells + i + 1)
    );
  }, [currDate, firstEmptyCells, lastDayOfPreviousMonth]);

  const daysInFollowingMonth = React.useMemo(() => {
    const month = currDate.getMonth() + 1;
    const year = currDate.getFullYear();

    const allPreviousDays = [...daysInPreviousMonth, ...daysInCurrentMonth];
    const rowsAmount = Math.ceil(allPreviousDays.length / 7);
    const daysInMonth = new Date(year, month, 0).getDate();
    const daysToShow = rowsAmount * 7 - daysInMonth - lastEmptyCells;

    return Array.from(
      { length: daysToShow },
      (_, i) => new Date(year, month, i + 1)
    );
  }, [currDate, daysInCurrentMonth, daysInPreviousMonth, lastEmptyCells]);

  const weekRows: Date[][] = React.useMemo(() => {
    const allDays = [
      ...daysInPreviousMonth,
      ...daysInCurrentMonth,
      ...daysInFollowingMonth,
    ];
    const rowsAmount = Math.ceil(allDays.length / 7);

    return Array.from({ length: rowsAmount }, (_, i) =>
      allDays.slice(i * 7, i * 7 + 7)
    );
  }, [daysInCurrentMonth, daysInFollowingMonth, daysInPreviousMonth]);

  return (
    <div className="container mx-auto py-16 px-2 md:px-8">
      <div className="mb-16 space-y-3 md:px-12">
        <h1 className="text-4xl font-semibold text-slate-900 dark:text-white">
          Calendar
        </h1>
        <p className="text-lg text-slate-900 dark:text-slate-300">
          A calendar with date range selection handled by use-selectify.
        </p>
        <p className="text-base text-slate-900 dark:text-zinc-500">
          Drag to select events, ctrl + drag to select days.
        </p>
      </div>
      <div className="w-full rounded-lg bg-neutral-900 p-4 shadow">
        <div className="flex items-center justify-between rounded-t-lg bg-neutral-900 py-4 px-8">
          <h4 className="text-2xl font-semibold capitalize text-slate-50">
            {currDate.toLocaleDateString([], { month: "long" })}{" "}
            {currDate.getFullYear()}
          </h4>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Button variant="ghost" size="sm">
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm">
                Today
              </Button>
              <Button variant="ghost" size="sm">
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
            <Button
              variant="ghost"
              className="border border-neutral-700"
              size="sm"
            >
              <Plus className="mr-2 h-4 w-4" />
              View
              <ChevronDown className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="relative h-full w-full">
          <table
            ref={selectionContainerRef}
            className="w-full table-fixed border-collapse select-none rounded-lg bg-neutral-800"
          >
            <TableHeader />
            <tbody>
              {weekRows.map((weekDays, i) => (
                <tr key={i} className="h-20 text-center">
                  {weekDays.map((weekDay, j) => (
                    <DayBlock
                      key={j}
                      calendarDay={{
                        date: weekDay,
                        events: [],
                        block: null,
                      }}
                      selectedElements={selectedElements}
                      setSelectedCalendarDays={setSelectedCalendarDays}
                    />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <SelectBoxOutlet
            className={cn("bg-slate-50/20", {
              "opacity-0": selectionCriteria === "[data-calendarday]",
            })}
          />
        </div>
      </div>
    </div>
  );
}

const TableHeader = () => {
  const dayDate = new Date().getDay();
  const currDay = weekDays[dayDate];

  return (
    <thead>
      <tr>
        {weekDays.map((day, i) => (
          <th
            key={i}
            className={cn(
              "lg:w-30 md:w-30 h-10 w-10 py-4 px-2 text-xs font-medium text-zinc-400 sm:w-20 xl:text-sm"
            )}
          >
            <span
              className={cn({
                "rounded-lg bg-slate-50 px-3 py-1.5 font-semibold text-slate-900":
                  day === currDay,
              })}
            >
              {day.slice(0, 3)}
            </span>
          </th>
        ))}
      </tr>
    </thead>
  );
};

const DayBlock = ({
  calendarDay,
  selectedElements,
  setSelectedCalendarDays,
}: {
  calendarDay: CalendarDay;
  selectedElements: Element[];
  setSelectedCalendarDays: React.Dispatch<React.SetStateAction<CalendarDay[]>>;
}) => {
  const dayRef = React.useRef(null);
  const eventRef = React.useRef(null);
  const currDate = React.useMemo(() => new Date(), []);
  const dayNumber = Number(
    calendarDay.date.toLocaleDateString([], { day: "numeric" })
  );

  const isCurrentMonth = React.useMemo(
    () =>
      currDate.getMonth() === calendarDay.date.getMonth() &&
      currDate.getFullYear() === calendarDay.date.getFullYear(),
    [calendarDay.date, currDate]
  );

  const isDaySelected = dayRef.current
    ? selectedElements.includes(dayRef.current)
    : false;

  const isEventSelected = eventRef.current
    ? selectedElements.includes(eventRef.current)
    : false;

  React.useEffect(() => {
    if (isDaySelected) {
      setSelectedCalendarDays((prevState) => [
        ...prevState,
        {
          ...calendarDay,
          block: dayRef.current,
        },
      ]);
    }
  }, [isDaySelected, setSelectedCalendarDays]);

  return (
    <td
      data-calendarday
      ref={dayRef}
      className={cn(
        "lg:w-30 md:w-30 ease h-40 w-10 border border-neutral-700/50 p-1 transition hover:z-10 hover:bg-neutral-800 hover:shadow-lg sm:w-20",
        {
          "border-blue-600 bg-blue-600/20 shadow-lg hover:bg-blue-600/25":
            isDaySelected,
          "bg-zinc-900 opacity-50 hover:opacity-100":
            !isCurrentMonth && !isDaySelected,
        }
      )}
    >
      <div className="lg:w-30 md:w-30 mx-auto flex h-40 w-10 flex-col overflow-hidden p-2 sm:w-full">
        <div className="h-30 w-full flex-grow py-1">
          {calendarDay.events.map((event, i) => (
            <div
              data-event
              key={i}
              className={cn(
                "flex cursor-pointer flex-col rounded border border-transparent bg-slate-400/20 px-4 py-2 text-left text-sm shadow transition-colors hover:border-neutral-600 hover:bg-slate-400/30",
                {
                  "bg-slate-400/70": isEventSelected,
                }
              )}
            >
              <span className="font-semibold text-slate-50">{event.label}</span>
              <span className="font-medium text-slate-100">{event.time}</span>
            </div>
          ))}
        </div>
        <div className="flex h-full w-full items-end justify-end">
          <span
            className={cn(
              "aspect-square rounded-full p-2 text-lg font-medium leading-none text-slate-50",
              {
                "bg-slate-50 text-slate-900": dayNumber === currDate.getDate(),
              }
            )}
          >
            {dayNumber}
          </span>
        </div>
      </div>
    </td>
  );
};
