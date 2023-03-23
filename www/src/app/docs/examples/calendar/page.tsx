/**
 * Proof of concept
 */

"use client";
import * as React from "react";

import { Button } from "../../../../components/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../../components/DropdownMenu";

import useEventListener from "../../../../utils/useEventListener";
import { useSelectify } from "use-selectify";
import { cn } from "../../../../utils/cn";

import { ChevronDown, ChevronRight, ChevronLeft } from "lucide-react";

interface CalendarEvent {
  date: Date;
  label: string;
  time: string;
}

interface CalendarDay {
  date: Date;
  events: CalendarEvent[];
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
    date: new Date(`${new Date().getMonth()} 28 2023`),
    label: "Meeting with Julia",
    time: "11:00 - 11:30",
  },
  {
    date: new Date(`${new Date().getMonth() + 1} 6 2023`),
    label: "Brainstorming",
    time: "10:00 - 11:00",
  },
  {
    date: new Date(`${new Date().getMonth() + 1} 12 2023`),
    label: "Meeting with Mark",
    time: "14:00 - 15:00",
  },
  {
    date: new Date(`${new Date().getMonth() + 1} 16 2023`),
    label: "Project overview",
    time: "9:00 - 11:00",
  },
  {
    date: new Date(`${new Date().getMonth() + 1} 24 2023`),
    label: "Standup #2",
    time: "12:00 - 12:30",
  },
];

export default function CalendarPage() {
  const selectionContainerRef = React.useRef(null);
  const [selectionCriteria, setSelectionCriteria] =
    React.useState("[data-event]");

  const { SelectBoxOutlet, hasSelected, selectedElements } = useSelectify(
    selectionContainerRef,
    {
      selectCriteria: selectionCriteria,
      scrollContext: globalThis?.window,
    }
  );

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

    const range: Date[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      range.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return range;
  }, [hasSelected, selectedCalendarDays]);

  /* -------------------------------------------------------------------------------------------------
   * Calendar Logic
   * -----------------------------------------------------------------------------------------------*/

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

  const weeksWithEvents = React.useMemo(
    () =>
      weekRows.map(
        (week) =>
          week.map((date) => ({
            date,
            events: scheduledEvents.filter(
              (event) => event.date.toDateString() === date.toDateString()
            ),
          })) as CalendarDay[]
      ),
    [weekRows]
  );

  /* ---------------------------------------------------------------------------------------------- */

  return (
    <div className="container mx-auto py-16 px-2 md:px-8">
      <div className="mb-14 space-y-3 md:px-16">
        <h1 className="text-4xl font-semibold text-slate-900 dark:text-slate-50">
          Calendar
        </h1>
        <p className="text-lg text-slate-900 dark:text-neutral-400">
          A calendar with date range selection handled by use-selectify.
        </p>
        <p className="text-base text-slate-900 dark:text-zinc-500">
          Drag to select events, ctrl + drag to select days.
        </p>
      </div>
      <div className="w-full rounded-lg bg-neutral-900 shadow md:p-6">
        <CalendarInteractions />
        <div className="relative h-full w-full overflow-x-auto">
          <table
            ref={selectionContainerRef}
            className="whitespace-no-wrap table-fixed border-collapse select-none rounded-lg bg-neutral-800"
          >
            <TableHeader />
            <tbody>
              {weeksWithEvents.map((weekDays, i) => (
                <tr key={i} className="h-16 text-center">
                  {weekDays.map((weekDay) => (
                    <DayBlock
                      key={weekDay.date.getTime()}
                      calendarDay={weekDay}
                      selectedDateRange={selectedDateRange}
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

/* -------------------------------------------------------------------------------------------------
 * DayBlock
 * -----------------------------------------------------------------------------------------------*/

const DayBlock = ({
  calendarDay,
  selectedElements,
  selectedDateRange,
  setSelectedCalendarDays,
}: {
  calendarDay: CalendarDay;
  selectedElements: Element[];
  selectedDateRange: Date[];
  setSelectedCalendarDays: React.Dispatch<React.SetStateAction<CalendarDay[]>>;
}) => {
  const dayRef = React.useRef(null);
  const eventRef = React.useRef(null);
  const currDate = React.useMemo(() => new Date(), []);
  const dayNumber = Number(
    calendarDay.date.toLocaleDateString([], { day: "numeric" })
  );

  const isInCurrentMonth = React.useMemo(
    () =>
      currDate.getMonth() === calendarDay.date.getMonth() &&
      currDate.getFullYear() === calendarDay.date.getFullYear(),
    [calendarDay.date, currDate]
  );

  const isInSelectedDateRange = React.useMemo(
    () =>
      selectedDateRange
        .map((date) => date.getTime())
        .includes(calendarDay.date.getTime()),
    [calendarDay.date, selectedDateRange]
  );

  const isElementSelected = dayRef.current
    ? selectedElements.includes(dayRef.current)
    : false;

  const isEventSelected = eventRef.current
    ? selectedElements.includes(eventRef.current)
    : false;

  React.useEffect(() => {
    // Pass `Date` data up when the day is selected or deselected
    if (isElementSelected) {
      setSelectedCalendarDays((prevCalendarDays) => [
        ...prevCalendarDays,
        calendarDay,
      ]);
    } else {
      setSelectedCalendarDays((calendarDays) =>
        calendarDays.filter((day) => day !== calendarDay)
      );
    }
  }, [isElementSelected, setSelectedCalendarDays]);

  return (
    <td
      data-calendarday
      ref={dayRef}
      className={cn(
        "ease h-40 w-10 min-w-full overflow-hidden border border-neutral-700/50 p-1 transition hover:z-10 hover:bg-neutral-800 hover:shadow-lg",
        {
          "border-blue-600 bg-blue-600/20 shadow-lg hover:bg-blue-600/25":
            isInSelectedDateRange,
          "bg-zinc-900 opacity-50 hover:opacity-100":
            !isInCurrentMonth && !isEventSelected && !isInSelectedDateRange,
        }
      )}
    >
      <div className="flex h-full w-full flex-col p-2">
        <div className="h-full w-full flex-grow py-1">
          {calendarDay.events.map((event, i) => (
            <div
              key={i}
              ref={eventRef}
              data-event
              className={cn(
                "flex cursor-pointer flex-col rounded border border-transparent bg-slate-400/20 py-1 px-3 text-left text-xs shadow transition-colors hover:border-neutral-600 hover:bg-slate-400/30",
                {
                  "border-blue-600 bg-blue-500/25 hover:border-blue-700 hover:bg-blue-500/40":
                    isEventSelected,
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

const CalendarInteractions = () => {
  const currDate = React.useMemo(() => new Date(), []);

  return (
    <div className="flex items-center justify-between rounded-t-lg bg-neutral-900 p-4 md:px-8">
      <h4 className="text-xl font-semibold capitalize text-slate-50 md:text-2xl">
        {currDate.toLocaleDateString([], { month: "long" })}{" "}
        {currDate.getFullYear()}
      </h4>
      <div className="flex items-center space-x-2 md:space-x-4">
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="border border-neutral-700"
              size="sm"
            >
              <ChevronDown className="mr-1 h-5 w-5" />
              View
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuGroup>
              <DropdownMenuItem>Weekly</DropdownMenuItem>
              <DropdownMenuItem>Monthly</DropdownMenuItem>
              <DropdownMenuItem>Yearly</DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------------------------------
 * TableHeader
 * -----------------------------------------------------------------------------------------------*/

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
              "md:w-30 h-10 w-10 py-4 px-2 text-xs font-medium text-zinc-400 sm:w-20 xl:text-sm"
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
