"use client";
import * as React from "react";

import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
import { Checkbox } from "../../components/Checkbox";

import { cn } from "../../utils/cn";
import { useSelectify } from "use-selectify";

import { Search, ChevronDown, ChevronUp } from "lucide-react";

export default function TablePage() {
  const [expanded, setExpanded] = React.useState(false);
  const selectionContainerRef = React.useRef(null);
  const exclusionZoneRef = React.useRef(null);

  const {
    SelectBoxOutlet,
    selectedElements,
    hasSelected,
    selectAll,
    getSelectableElements,
    clearSelection,
    mutateSelections,
  } = useSelectify(selectionContainerRef, {
    selectCriteria: "[data-item]",
    exclusionZone: exclusionZoneRef.current,
    onDragStart: () => {
      document.body.style.userSelect = "none";

      window.getSelection()?.empty();
    },
    onDragEnd: () => {
      document.body.style.userSelect = "";
    },
  });

  const hasSelectedEverything = React.useMemo(
    () => getSelectableElements()?.length === selectedElements.length,
    [getSelectableElements, selectedElements]
  );

  const toggleItemSelection = (
    elementToSelect: HTMLElement | null | undefined
  ) => {
    if (!elementToSelect) return;

    // check if it isn't alredy selected
    if (!selectedElements.includes(elementToSelect)) {
      mutateSelections((prevSelections) => [
        ...prevSelections,
        elementToSelect,
      ]);
    } else {
      // unselect
      mutateSelections((prevSelections) =>
        prevSelections.filter((element) => element !== elementToSelect)
      );
    }
  };

  return (
    <div
      ref={selectionContainerRef}
      className="relative h-full w-full"
    >
      <div className="container mx-auto py-16 px-2 md:px-8">
        <div className="mb-16 space-y-3 md:px-12">
          <h1 className="text-4xl font-semibold text-slate-900 dark:text-white">
            Datatable
          </h1>
          <p className="text-lg text-slate-900 dark:text-slate-300">
            A table with drag-selection integrated for easier bulk actions.
            <br />
            Built using{" "}
            <Button
              href="https://www.radix-ui.com"
              variant="link"
              className="px-0"
            >
              RadixUI
            </Button>{" "}
            and{" "}
            <Button
              href="https://ui.shadcn.com"
              variant="link"
              className="px-0"
            >
              shadcnUI
            </Button>{" "}
            components.
          </p>
        </div>
        <div className="mb-6 flex items-center justify-between">
          <div className="flex-1 pr-4">
            <div className="relative md:w-1/3">
              <Input type="search" placeholder="Search..." className="pl-10" />
              <div className="absolute top-0 left-0 inline-flex items-center p-2">
                <Search className="h-6 w-6 text-slate-400" />
              </div>
            </div>
          </div>
          <Button variant="destructive" disabled={!hasSelected}>
            Delete
          </Button>
        </div>
        <div
          ref={exclusionZoneRef}
          className={cn(
            "relative overflow-x-auto overflow-y-auto rounded-lg bg-neutral-900 shadow",
            {
              "h-[405px]": !expanded,
            }
          )}
        >
          <table className="whitespace-no-wrap relative w-full table-auto border-collapse">
            <thead>
              <tr className="text-left">
                <th className="sticky top-0 border-b border-neutral-700 bg-neutral-800 py-2 px-3">
                  <label className="inline-flex cursor-pointer items-center justify-between rounded-lg px-2 py-2">
                    <Checkbox
                      checked={hasSelected}
                      halfChecked={hasSelected && !hasSelectedEverything}
                      onCheckedChange={() => {
                        if (hasSelected) {
                          clearSelection();
                        } else {
                          selectAll();
                        }
                      }}
                    />
                  </label>
                </th>
                <th className="sticky top-0 border-b border-neutral-700 bg-neutral-800 px-6 py-2 text-xs font-bold uppercase tracking-wider text-slate-100">
                  User Id
                </th>
                <th className="sticky top-0 border-b border-neutral-700 bg-neutral-800 px-6 py-2 text-xs font-bold uppercase tracking-wider text-slate-100">
                  First Name
                </th>
                <th className="sticky top-0 border-b border-neutral-700 bg-neutral-800 px-6 py-2 text-xs font-bold uppercase tracking-wider text-slate-100">
                  Last Name
                </th>
                <th className="sticky top-0 border-b border-neutral-700 bg-neutral-800 px-6 py-2 text-xs font-bold uppercase tracking-wider text-slate-100">
                  Email
                </th>
                <th className="sticky top-0 border-b border-neutral-700 bg-neutral-800 px-6 py-2 text-xs font-bold uppercase tracking-wider text-slate-100">
                  Gender
                </th>
                <th className="sticky top-0 border-b border-neutral-700 bg-neutral-800 px-6 py-2 text-xs font-bold uppercase tracking-wider text-slate-100">
                  Phone
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((user) => (
                <TableItem
                  key={user.userId}
                  user={user}
                  selectedElements={selectedElements}
                  toggle={toggleItemSelection}
                />
              ))}
            </tbody>
          </table>
          <div className="sticky bottom-0 w-full bg-gradient-to-t from-neutral-900 py-1">
            <div className="flex w-full justify-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpanded((prevState) => !prevState)}
              >
                {!expanded ? (
                  <>
                    <ChevronDown className="mr-2 h-4 w-4" />
                    Expand
                  </>
                ) : (
                  <>
                    <ChevronUp className="mr-2 h-4 w-4" />
                    Collapse
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
      <SelectBoxOutlet className="border border-dashed border-white/50 bg-white/10" />
    </div>
  );
}

interface UserSchema {
  userId: number;
  firstName: string;
  lastName: string;
  emailAddress: string;
  gender: string;
  phoneNumber: string;
}

const TableItem = ({
  user,
  selectedElements,
  toggle,
}: {
  user: UserSchema;
  selectedElements: Element[];
  toggle: (elementToSelect: HTMLElement | null | undefined) => void;
}) => {
  const selectableItemRef = React.useRef(null);
  const isSelected = React.useMemo(
    () =>
      selectableItemRef.current
        ? selectedElements.includes(selectableItemRef.current)
        : false,
    [selectedElements]
  );

  return (
    <tr
      ref={selectableItemRef}
      data-item
      className={cn("hover:shadow-lg", { "bg-zinc-900": isSelected })}
    >
      <td className="border-t border-dashed border-neutral-700 px-3">
        <label className="inline-flex cursor-pointer items-center justify-between rounded-lg px-2 py-2">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => {
              toggle(selectableItemRef.current);
            }}
          />
        </label>
      </td>
      <td className="border-t border-dashed border-neutral-700">
        <span className="flex items-center px-6 py-3 text-slate-50">
          {user.userId}
        </span>
      </td>
      <td className="border-t border-dashed border-neutral-700">
        <span className="flex items-center px-6 py-3 text-slate-50">
          {user.firstName}
        </span>
      </td>
      <td className="border-t border-dashed border-neutral-700">
        <span className="flex items-center px-6 py-3 text-slate-50">
          {user.lastName}
        </span>
      </td>
      <td className="border-t border-dashed border-neutral-700">
        <span className="flex items-center px-6 py-3 text-slate-50">
          {user.emailAddress}
        </span>
      </td>
      <td className="border-t border-dashed border-neutral-700">
        <span className="flex items-center px-6 py-3 text-slate-50">
          {user.gender}
        </span>
      </td>
      <td className="border-t border-dashed border-neutral-700">
        <span className="flex items-center px-6 py-3 text-slate-50">
          {user.phoneNumber}
        </span>
      </td>
    </tr>
  );
};

const data: UserSchema[] = [
  {
    userId: 1,
    firstName: "Cort",
    lastName: "Tosh",
    emailAddress: "ctosh0@github.com",
    gender: "Male",
    phoneNumber: "327-626-5542",
  },
  {
    userId: 2,
    firstName: "Brianne",
    lastName: "Dzeniskevich",
    emailAddress: "bdzeniskevich1@hostgator.com",
    gender: "Female",
    phoneNumber: "144-190-8956",
  },
  {
    userId: 3,
    firstName: "Isadore",
    lastName: "Botler",
    emailAddress: "ibotler2@gmpg.org",
    gender: "Male",
    phoneNumber: "350-937-0792",
  },
  {
    userId: 4,
    firstName: "Janaya",
    lastName: "Klosges",
    emailAddress: "jklosges3@amazon.de",
    gender: "Female",
    phoneNumber: "502-438-7799",
  },
  {
    userId: 5,
    firstName: "Freddi",
    lastName: "Di Claudio",
    emailAddress: "fdiclaudio4@phoca.cz",
    gender: "Female",
    phoneNumber: "265-448-9627",
  },
  {
    userId: 6,
    firstName: "Oliy",
    lastName: "Mairs",
    emailAddress: "omairs5@fda.gov",
    gender: "Female",
    phoneNumber: "221-516-2295",
  },
  {
    userId: 7,
    firstName: "Tabb",
    lastName: "Wiseman",
    emailAddress: "twiseman6@friendfeed.com",
    gender: "Male",
    phoneNumber: "171-817-5020",
  },
  {
    userId: 8,
    firstName: "Joela",
    lastName: "Betteriss",
    emailAddress: "jbetteriss7@msu.edu",
    gender: "Female",
    phoneNumber: "481-100-9345",
  },
  {
    userId: 9,
    firstName: "Alistair",
    lastName: "Vasyagin",
    emailAddress: "avasyagin8@gnu.org",
    gender: "Male",
    phoneNumber: "520-669-8364",
  },
  {
    userId: 10,
    firstName: "Nealon",
    lastName: "Ratray",
    emailAddress: "nratray9@typepad.com",
    gender: "Male",
    phoneNumber: "993-654-9793",
  },
  {
    userId: 11,
    firstName: "Annissa",
    lastName: "Kissick",
    emailAddress: "akissicka@deliciousdays.com",
    gender: "Female",
    phoneNumber: "283-425-2705",
  },
  {
    userId: 12,
    firstName: "Nissie",
    lastName: "Sidnell",
    emailAddress: "nsidnellb@freewebs.com",
    gender: "Female",
    phoneNumber: "754-391-3116",
  },
  {
    userId: 13,
    firstName: "Madalena",
    lastName: "Fouch",
    emailAddress: "mfouchc@mozilla.org",
    gender: "Female",
    phoneNumber: "584-300-9004",
  },
  {
    userId: 14,
    firstName: "Rozina",
    lastName: "Atkins",
    emailAddress: "ratkinsd@japanpost.jp",
    gender: "Female",
    phoneNumber: "792-856-0845",
  },
  {
    userId: 15,
    firstName: "Lorelle",
    lastName: "Sandcroft",
    emailAddress: "lsandcrofte@google.nl",
    gender: "Female",
    phoneNumber: "882-911-7241",
  },
];
