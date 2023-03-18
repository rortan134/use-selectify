"use client";
import * as React from "react";
import { renderToString } from "react-dom/server";

import { cva, VariantProps } from "class-variance-authority";
import sanitizeHtml from "sanitize-html";
import ContentEditable, { ContentEditableEvent } from "react-contenteditable";
import { useSelectify } from "../../../../src/useSelectify";

import useEventListener from "../../utils/useEventListener";

const blockVariants = cva(
  "group relative w-full rounded-md px-0.5 py-1 text-[#37352f] caret-[#37352f] flex items-start data-[selected=true]:select-none",
  {
    variants: {
      type: {
        h1: "text-[40px] font-semibold mt-6",
        h2: "text-3xl font-semibold mt-4",
        h3: "text-2xl font-semibold mt-4",
        paragraph: "text-base font-normal mt-2 leading-normal",
      },
      variant: {
        default: "",
        callout: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

type BlockVariants = VariantProps<typeof blockVariants>;

const Block = ({
  type,
  variant,
  children,
}: {
  type: BlockVariants["type"];
  variant: BlockVariants["variant"];
  children: React.ReactNode;
}) => {
  if (!children) return null;
  const [content, setContent] = React.useState(renderToString(<>{children}</>));
  const [isHovering, setIsHovering] = React.useState(false);

  const handleContentChange = React.useCallback(
    (evt: ContentEditableEvent | React.FocusEvent) => {
      const sanitizeConf = {
        allowedTags: ["div", "span", "b", "i", "a", "p", "h1", "h2", "h3"],
        allowedAttributes: {
          div: ["class"],
          a: ["href", "class"],
        },
      };
      const hasContent = evt.currentTarget.innerHTML !== "";
      setContent(
        sanitizeHtml(
          hasContent
            ? evt.currentTarget.innerHTML
            : evt.currentTarget.placeholder,
          sanitizeConf
        )
      );
    },
    []
  );

  return (
    <div
      data-block
      className={blockVariants({ type, variant })}
      onPointerEnter={() => setIsHovering(true)}
      onPointerLeave={() => setIsHovering(false)}
    >
      <ContentEditable
        className="min-h-[16px] w-full max-w-full whitespace-pre-wrap break-words fill-inherit text-inherit outline-none focus:outline-none"
        onChange={handleContentChange}
        onBlur={handleContentChange}
        html={content}
        spellCheck="true"
        placeholder="Heading"
        tabIndex={0}
        suppressContentEditableWarning={true}
      />
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-data-[selected=true]:bg-[#2382e2]/10 group-data-[selected=true]:opacity-100" />
      {isHovering ? (
        <>
          <div className="absolute -left-8 top-2 h-full cursor-grab items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
            <svg
              viewBox="0 0 10 10"
              className="flex w-6 rounded-md fill-slate-800/50 p-1.5 transition-colors hover:bg-slate-100"
            >
              <path d="M3,2 C2.44771525,2 2,1.55228475 2,1 C2,0.44771525 2.44771525,0 3,0 C3.55228475,0 4,0.44771525 4,1 C4,1.55228475 3.55228475,2 3,2 Z M3,6 C2.44771525,6 2,5.55228475 2,5 C2,4.44771525 2.44771525,4 3,4 C3.55228475,4 4,4.44771525 4,5 C4,5.55228475 3.55228475,6 3,6 Z M3,10 C2.44771525,10 2,9.55228475 2,9 C2,8.44771525 2.44771525,8 3,8 C3.55228475,8 4,8.44771525 4,9 C4,9.55228475 3.55228475,10 3,10 Z M7,2 C6.44771525,2 6,1.55228475 6,1 C6,0.44771525 6.44771525,0 7,0 C7.55228475,0 8,0.44771525 8,1 C8,1.55228475 7.55228475,2 7,2 Z M7,6 C6.44771525,6 6,5.55228475 6,5 C6,4.44771525 6.44771525,4 7,4 C7.55228475,4 8,4.44771525 8,5 C8,5.55228475 7.55228475,6 7,6 Z M7,10 C6.44771525,10 6,9.55228475 6,9 C6,8.44771525 6.44771525,8 7,8 C7.55228475,8 8,8.44771525 8,9 C8,9.55228475 7.55228475,10 7,10 Z"></path>
            </svg>
          </div>
          <div className="absolute -left-16 top-2 h-full cursor-pointer items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
            <svg
              viewBox="0 0 16 16"
              className="block w-6 rounded-md fill-slate-800/50 p-1 transition-colors hover:bg-slate-100"
            >
              <path d="M7.977 14.963c.407 0 .747-.324.747-.723V8.72h5.362c.399 0 .74-.34.74-.747a.746.746 0 00-.74-.738H8.724V1.706c0-.398-.34-.722-.747-.722a.732.732 0 00-.739.722v5.529h-5.37a.746.746 0 00-.74.738c0 .407.341.747.74.747h5.37v5.52c0 .399.332.723.739.723z"></path>
            </svg>
          </div>
        </>
      ) : null}
    </div>
  );
};

interface BlockSchema {
  type: BlockVariants["type"];
  content: string;
  variant: BlockVariants["variant"];
}

export default function NotionDemo() {
  const selectionContainerRef = React.useRef<HTMLDivElement>(null);
  const exclusionZoneRef = React.useRef<HTMLDivElement>(null);

  const { SelectBoxOutlet, clearSelection } = useSelectify(
    selectionContainerRef,
    {
      selectCriteria: "[data-block]",
      exclusionZone: exclusionZoneRef.current,
      autoScrollStep: 20,
      onDragStart: () => {
        document.body.style.userSelect = "none";

        (window.getSelection
          ? window.getSelection()
          : // @ts-ignore IE
            document.selection
        ).empty();
      },
      onDragEnd: () => {
        document.body.style.userSelect = "";
      },
      onSelect: (el) => {
        el.setAttribute("data-selected", "true");
      },
      onUnselect: (el) => {
        el.removeAttribute("data-selected");
      },
    }
  );

  const handleKeys = React.useCallback((event: KeyboardEvent) => {
    switch (event.key) {
      case "Backspace": {
        if (
          document.activeElement &&
          document.activeElement?.parentElement?.innerText === "" &&
          exclusionZoneRef?.current?.children &&
          exclusionZoneRef?.current?.children?.length > 1
        ) {
          document.activeElement?.parentElement.remove();
        }
        break;
      }
      case "Escape": {
        clearSelection();
        break;
      }
      default:
        return;
    }
  }, []);

  useEventListener(globalThis?.document, "keydown", handleKeys);

  return (
    <div
      ref={selectionContainerRef}
      className="group relative flex w-full flex-col"
    >
      <header className="flex w-full flex-shrink-0 select-none justify-center">
        <div className="w-full min-w-0 max-w-[900px] pl-24">
          <div className="mt-20 mb-2 flex h-6 flex-wrap text-slate-800/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <button className="mx-1 inline-flex min-w-0 items-center whitespace-nowrap rounded-md p-1.5 text-xs transition-colors hover:bg-slate-100">
              <svg
                viewBox="0 0 14 14"
                className="mr-2 block h-4 w-4 flex-shrink-0 fill-slate-800/50"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M7 0c3.861 0 7 3.139 7 7s-3.139 7-7 7-7-3.139-7-7 3.139-7 7-7zM3.561 5.295a1.027 1.027 0 1 0 2.054 0 1.027 1.027 0 0 0-2.054 0zm5.557 1.027a1.027 1.027 0 1 1 0-2.054 1.027 1.027 0 0 1 0 2.054zm1.211 2.816a.77.77 0 0 0-.124-1.087.786.786 0 0 0-1.098.107c-.273.407-1.16.958-2.254.958-1.093 0-1.981-.55-2.244-.945a.788.788 0 0 0-1.107-.135.786.786 0 0 0-.126 1.101c.55.734 1.81 1.542 3.477 1.542 1.668 0 2.848-.755 3.476-1.541z"
                ></path>
              </svg>
              Add icon
            </button>
            <button className="mx-1 inline-flex min-w-0 items-center whitespace-nowrap rounded-md p-1.5 text-xs transition-colors hover:bg-slate-100">
              <svg
                viewBox="0 0 14 14"
                className="mr-2 block h-4 w-4 flex-shrink-0 fill-slate-800/50"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M2 0a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2zm0 12h10L8.5 5.5l-2 4-2-1.5L2 12z"
                ></path>
              </svg>
              Add cover
            </button>
            <button className="mx-1 inline-flex min-w-0 items-center whitespace-nowrap rounded-md p-1.5 text-xs transition-colors hover:bg-slate-100">
              <svg
                viewBox="0 0 16 16"
                className="mr-2 block h-4 w-4 flex-shrink-0 fill-slate-800/50"
              >
                <path d="M4.095 15.465c.287 0 .499-.137.84-.444l2.523-2.277 4.47.007c2.058 0 3.214-1.19 3.214-3.22V4.22c0-2.03-1.156-3.22-3.213-3.22H3.213C1.163 1 0 2.19 0 4.22V9.53c0 2.037 1.196 3.22 3.165 3.213h.273v1.983c0 .45.24.738.657.738zM3.958 5.156a.454.454 0 01-.444-.45c0-.24.198-.438.444-.438h7.157c.246 0 .445.198.445.437a.45.45 0 01-.445.451H3.958zm0 2.256a.454.454 0 01-.444-.451c0-.24.198-.444.444-.444h7.157a.448.448 0 010 .895H3.958zm0 2.256a.448.448 0 010-.896h4.669c.246 0 .437.206.437.452a.438.438 0 01-.437.444H3.958z"></path>
              </svg>
              Add comment
            </button>
          </div>
          <h1
            className="w-full max-w-full whitespace-pre-wrap break-words p-1 text-4xl font-semibold text-slate-800 caret-slate-900"
            spellCheck="true"
            contentEditable="true"
            placeholder="Untitled"
            suppressContentEditableWarning={true}
          >
            use-selectify notion demo
          </h1>
        </div>
      </header>
      <section className="relative flex min-h-screen w-full flex-shrink-0 justify-center">
        <div className="w-full min-w-0 max-w-[900px] px-24 pb-60 pt-8">
          <div
            ref={exclusionZoneRef}
            className="flex w-full flex-col items-start"
          >
            {data.map((block, i) => (
              <Block type={block.type} variant={block.variant} key={i}>
                {block.content}
              </Block>
            ))}
          </div>
        </div>
      </section>
      <SelectBoxOutlet style={{ backgroundColor: "rgb(191 219 254 / 0.25)" }} />
    </div>
  );
}

const data: BlockSchema[] = [
  {
    type: "paragraph",
    variant: "callout",
    content:
      "Example created only for demonstration purposes. It is not intended to add/remove text or blocks.",
  },
  {
    type: "paragraph",
    variant: "default",
    content:
      "The selection box is completely managed by use-selectify. Try drag-selecting some blocks.",
  },
  {
    type: "h1",
    variant: "default",
    content: "Why use-selectify",
  },
  {
    type: "paragraph",
    variant: "default",
    content:
      "use-selectify is a React selection box library created out of need and designed to be production-ready and blazingly fast. It provides an accessible approach to managing selection of elements in a React application with a useSelectify hook. This hook will return an array of all elements that have been selected by a specified ref, which can be used for further processing or to render the selected elements on the page.",
  },
  {
    type: "h2",
    variant: "default",
    content: "Introduction",
  },
  {
    type: "paragraph",
    variant: "default",
    content:
      "Drag interactions are one of the most challenging aspects of the web. Having full control of the exact behavior of those interactions is essential, yet most available libraries out there feel like they are still not up to the task.",
  },
  {
    type: "paragraph",
    variant: "default",
    content:
      "Recognizing this need, use-selectify is a robust React element selection library that aims to address these issues and provide a powerful starting point for drag interactions while still being an accessible approach to managing both visual and logical selection of elements in a React application with a hook.",
  },
  {
    type: "h2",
    variant: "default",
    content: "Features",
  },
  {
    type: "paragraph",
    variant: "default",
    content: "✅ Automatic Window Scrolling",
  },
  {
    type: "paragraph",
    variant: "default",
    content: "✅ Flexible and Lightweight (3kB gzipped)",
  },
  {
    type: "paragraph",
    variant: "default",
    content: "✅ Accessible by Default",
  },
  {
    type: "paragraph",
    variant: "default",
    content: "✅ Fine-Grained Control",
  },
  {
    type: "paragraph",
    variant: "default",
    content: "✅ Simple to Style",
  },
  {
    type: "paragraph",
    variant: "default",
    content: "✅ Works on mobile",
  },
  {
    type: "paragraph",
    variant: "default",
    content: "✅ SSR Support",
  },
  {
    type: "h2",
    variant: "default",
    content: "Installation",
  },
  {
    type: "paragraph",
    variant: "callout",
    content: "$ npm i use-selectify\nor\n$ yarn add use-selectify",
  },
  {
    type: "paragraph",
    variant: "default",
    content: `<a href="https://github.com/rortan134/use-selectify#readme" className="cursor-pointer text-blue-500 underline-offset-4 hover:underline">Getting Started</a>`,
  },
];
