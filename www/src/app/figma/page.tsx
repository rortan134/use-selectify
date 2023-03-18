/**
 * Proof of concept
 */

"use client";
import * as React from "react";
import * as Toolbar from "@radix-ui/react-toolbar";

import usePan from "./usePan";
import useZoom from "./useZoom";
import useLast from "./useLast";
import { useSelectify } from "use-selectify";

import addEventListener from "../../utils/useEventListener";
import { cn } from "../../utils/cn";

import { Inspect, Hand } from "lucide-react";

function getDelta(
  pointA: { x: number; y: number },
  pointB: { x: number; y: number }
) {
  return {
    x: pointA.x - pointB.x,
    y: pointA.y - pointB.y,
  };
}

function sum(a: { x: number; y: number }, b: { x: number; y: number }) {
  return { x: a.x + b.x, y: a.y + b.y };
}

function scale(values: { x: number; y: number }, factor: number) {
  return { x: values.x / factor, y: values.y / factor };
}

export default function FigmaDemo() {
  const [canvasMode, setCanvasMode] = React.useState("select-mode");
  const selectionContainerRef = React.useRef(null);
  const canvasRef = React.useRef<HTMLDivElement>(null);

  const { SelectBoxOutlet } = useSelectify(selectionContainerRef, {
    selectCriteria: "[data-selectable]",
    disabled: canvasMode !== "select-mode",
    onSelect: (el) => {
      el.setAttribute("data-selected", "true");
    },
    onUnselect: (el) => {
      el.removeAttribute("data-selected");
    },
  });

  const [buffer, setBuffer] = React.useState({ x: 0, y: 0 });

  const [cameraOffset, startPan] = usePan(canvasRef);
  const currCameraZoom = useZoom(canvasRef);

  const lastOffset = useLast(cameraOffset);
  const lastZoom = useLast(currCameraZoom);

  const delta = getDelta(cameraOffset, lastOffset);
  const adjustedOffset = React.useRef(sum(cameraOffset, delta));
  const cursorPosRef = React.useRef({ x: 0, y: 0 });

  addEventListener(canvasRef.current, "pointermove", (event) => {
    cursorPosRef.current = { x: event.pageX, y: event.pageY };
  });

  React.useLayoutEffect(() => {
    const width = canvasRef.current?.clientWidth ?? 0;
    const height = canvasRef.current?.clientHeight ?? 0;

    setBuffer({
      x: (width - width / currCameraZoom) / 2,
      y: (height - height / currCameraZoom) / 2,
    });
  }, [currCameraZoom]);

  if (lastZoom === currCameraZoom) {
    // zoom hasn't changed, apply delta between the last and new offset
    adjustedOffset.current = sum(
      adjustedOffset.current,
      scale(delta, currCameraZoom)
    );
  } else {
    // zoom changed, adjust the offset relative to the pointer
    const lastMouse = scale(cursorPosRef.current, lastZoom);
    const newMouse = scale(cursorPosRef.current, currCameraZoom);
    const mouseOffset = getDelta(lastMouse, newMouse);
    adjustedOffset.current = sum(adjustedOffset.current, mouseOffset);
  }

  const handleDragActive = React.useCallback(
    (event: React.PointerEvent): void => {
      startPan(event);
    },
    [startPan]
  );

  return (
    <section className="flex h-full w-full flex-col overflow-hidden">
      <Toolbar.Root className="absolute inset-x-0 z-40 flex w-full min-w-max border-b border-[#444444] bg-[#2c2c2c] px-3">
        <Toolbar.ToggleGroup
          onValueChange={setCanvasMode}
          type="single"
          defaultValue="select-mode"
          aria-label="Toolbar"
        >
          <Toolbar.ToggleItem
            className="inline-flex h-full flex-shrink-0 flex-grow-0 basis-auto items-center justify-center p-3 text-sm leading-none text-slate-50 outline-none first:ml-0 hover:bg-neutral-700 focus:shadow-[0_0_0_2px] data-[state=on]:bg-white data-[state=on]:text-slate-900"
            value="select-mode"
            title="Select"
            aria-label="Selection Mode"
          >
            <Inspect className="h-5 w-5" />
          </Toolbar.ToggleItem>
          <Toolbar.ToggleItem
            className="inline-flex h-full flex-shrink-0 flex-grow-0 basis-auto items-center justify-center p-3 text-sm leading-none text-slate-50 outline-none first:ml-0 hover:bg-neutral-700 focus:shadow-[0_0_0_2px] data-[state=on]:bg-white data-[state=on]:text-slate-900"
            value="drag-mode"
            title="Drag"
            aria-label="Drag Mode"
          >
            <Hand className="h-5 w-5" />
          </Toolbar.ToggleItem>
        </Toolbar.ToggleGroup>
      </Toolbar.Root>
      <div className="flex h-full w-full flex-1">
        <div
          ref={selectionContainerRef}
          className="relative h-full w-full flex-1"
        >
          <div
            className={cn(
              "absolute inset-0 block select-none overflow-hidden shadow-inner",
              {
                "cursor-grab touch-pan-x touch-pan-y touch-pinch-zoom active:cursor-grabbing":
                  canvasMode === "drag-mode",
              }
            )}
            role="presentation"
            ref={canvasRef}
            onPointerDown={(event) => {
              if (canvasMode === "drag-mode") {
                handleDragActive(event);
              }
            }}
            style={{
              transform: `scale(${currCameraZoom})`,
              backgroundPosition: `${-cameraOffset.x}px ${-cameraOffset.y}px`,
              bottom: buffer.y,
              left: buffer.x,
              right: buffer.x,
              top: buffer.y,
            }}
          />
          <div
            data-selectable
            className="group absolute top-1/2 left-1/2 aspect-video h-48 -translate-x-1/2 -translate-y-1/2 border border-neutral-700 bg-neutral-800 hover:border-blue-600/50 data-[selected=true]:border-blue-600"
            style={{
              transform: `translate3d(${-cameraOffset.x}px, ${-cameraOffset.y}px, 0) scale(${currCameraZoom})`,
            }}
          >
            <span className="absolute -top-5 select-none text-xs text-neutral-600 group-hover:text-blue-500/75 group-data-[selected=true]:text-blue-500">
              Frame 1
            </span>
          </div>
          <SelectBoxOutlet className="border border-[#0d99ff] bg-[#0d99ff]/20" />
        </div>
        <aside className="z-10 hidden h-full w-64 border-l border-[#444444] bg-[#2c2c2c] sm:block" />
      </div>
    </section>
  );
}
