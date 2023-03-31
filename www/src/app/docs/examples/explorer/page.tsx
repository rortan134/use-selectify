"use client";
import {
  ChevronRight,
  FileImage,
} from "lucide-react";
import * as React from "react";
import { useSelectify } from "use-selectify";

import { Container } from "../../../../components/Container";

export default function Explorer() {
  const selectionContainerRef = React.useRef(null);
  const { SelectBoxOutlet, selectedElements } = useSelectify(
    selectionContainerRef,
    {
      selectCriteria: "[data-file]",
      onSelect: (element) => {
        element.setAttribute("data-selected", "true");
      },
      onUnselect: (element) => {
        element.removeAttribute("data-selected");
      },
    }
  );

  return (
    <Container ref={selectionContainerRef}>
      <div data-exclude className="mb-14 space-y-3 md:px-16">
        <h1 className="text-4xl font-semibold text-slate-900 dark:text-slate-50">
          File explorer
        </h1>
        <p className="text-lg text-slate-900 dark:text-neutral-400">
          A file explorer with drag-selection integrated for easier bulk
          actions.
        </p>
      </div>
      <div className="mb-4 flex items-center text-neutral-400 flex-nowrap overflow-x-auto space-x-2">
        <button>User</button>
        <ChevronRight className="w-4 h-4" />
        <button>Documents</button>
        <ChevronRight className="w-4 h-4" />
        <button>Pictures</button>
      </div>
      <div className="mb-6 flex items-center gap-2 flex-wrap w-full">
        <File fileName="file.jpg" />
        <File fileName="file.jpg" />
        <File fileName="file.pdf" />
        <File fileName="file.jpg" />
        <File fileName="file.png" />
        <File fileName="file.mp4" />
        <File fileName="file.jpg" />
        <File fileName="file.docx" />
        <File fileName="file.jpg" />
        <File fileName="file.jpg" />
        <File fileName="file.jpg" />
      </div>
      {selectedElements.length > 0 && (
        <span className="text-neutral-400">
          {selectedElements.length} Elements selected
        </span>
      )}
      <SelectBoxOutlet className="border border-slate-50/50 bg-white/25" />
    </Container>
  );
}

function File({ fileName }: { fileName: string }) {
  return (
    <button
      data-file
      className="flex flex-col h-44 w-36 rounded-md overflow-hidden border-transparent border-2 data-[selected=true]:border-slate-50"
    >
      <div className="w-full h-full bg-neutral-800 flex items-center justify-center text-neutral-600">
        <FileImage className="w-6 h-6" />
      </div>
      <div className="w-full bg-neutral-700 flex justify-center items-center py-2">
        <span className="text-neutral-200 text-base">{fileName}</span>
      </div>
    </button>
  );
}
