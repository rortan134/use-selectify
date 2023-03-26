import * as React from "react";
import useEventListener from "../../../../utils/useEventListener";

function between(min: number, max: number, value: number) {
  return Math.min(max, Math.max(min, value));
}

function getPointFromTouch(
  touch: React.Touch,
  ref: React.RefObject<HTMLElement | null>
): { x: number; y: number } | undefined {
  if (!touch || !ref.current) return;
  const rect = ref.current.getBoundingClientRect();

  return {
    x: touch.clientX - rect.left,
    y: touch.clientY - rect.top,
  };
}

export const getDistanceBetweenPoints = (
  pointA: { x: number; y: number },
  pointB: { x: number; y: number }
): number => {
  return Math.sqrt(
    Math.pow(pointA.y - pointB.y, 2) + Math.pow(pointA.x - pointB.x, 2)
  );
};

// TS Type Guard
export const isTouchEvent = (e: any): e is React.TouchEvent => {
  return (e as React.TouchEvent).touches !== undefined;
};

interface ScaleOpts {
  direction: "up" | "down";
  interval: number;
}

const MIN_ZOOM_SCALE = 0.5;
const MAX_ZOOM_SCALE = 4;

export default function useZoom(ref: React.RefObject<HTMLElement | null>) {
  const [scale, setScale] = React.useState(1);
  const [lastDistance, setLastDistance] = React.useState(0);

  const updateScale = React.useCallback(
    ({ direction, interval }: ScaleOpts) => {
      setScale((currentScale) => {
        let scale: number;

        // Adjust up to or down to the maximum or minimum scale levels by `interval`.
        if (direction === "up" && currentScale + interval < MAX_ZOOM_SCALE) {
          scale = currentScale + interval;
        } else if (direction === "up") {
          scale = MAX_ZOOM_SCALE;
        } else if (
          direction === "down" &&
          currentScale - interval > MIN_ZOOM_SCALE
        ) {
          scale = currentScale - interval;
        } else if (direction === "down") {
          scale = MIN_ZOOM_SCALE;
        } else {
          scale = currentScale;
        }

        return scale;
      });
    },
    []
  );

  const handlePinchStart = React.useCallback(
    (e: TouchEvent) => {
      if (!e.touches[0] || !e.touches[1]) return;
      const pointA = getPointFromTouch(e.touches[0], ref);
      const pointB = getPointFromTouch(e.touches[1], ref);

      if (pointA && pointB) {
        setLastDistance(getDistanceBetweenPoints(pointA, pointB));
      }
    },
    [ref]
  );

  const handlePinchMove = React.useCallback(
    (e: TouchEvent) => {
      if (isTouchEvent(e) && e.touches.length == 2) {
        if (!e.touches[0] || !e.touches[1]) return;
        const pointA = getPointFromTouch(e.touches[0], ref);
        const pointB = getPointFromTouch(e.touches[1], ref);

        if (pointA && pointB) {
          const distance = getDistanceBetweenPoints(pointA, pointB);

          setScale((currentScale) =>
            between(
              MIN_ZOOM_SCALE,
              MAX_ZOOM_SCALE,
              currentScale * (distance / lastDistance)
            )
          );
          setLastDistance(distance);
        }
      }
    },
    [lastDistance, ref]
  );

  useEventListener(
    ref.current,
    "wheel",
    (e) => {
      if (e.ctrlKey || e.metaKey) {
        // prevent browser zoom w scroll
        e.preventDefault();
      }

      updateScale({
        direction: between(-1, 1, e.deltaY) > 0 ? "down" : "up",
        interval: 0.1,
      });
    },
    { passive: false }
  );

  useEventListener(ref.current, "keydown", (e: KeyboardEvent) => {
    // 107 Num Key  +
    // 109 Num Key  -
    // 173 Min Key  hyphen/underscore key
    // 61 Plus key  +/= key
    if (
      e.ctrlKey == true &&
      (e.which == 107 || e.which == 173 || e.which == 187 || e.which == 189)
    ) {
      // prevent browzer zoom w +/- keys
      e.preventDefault();
    }

    updateScale({
      direction: e.which === 107 || e.which === 61 ? "up" : "down",
      interval: 0.1,
    });
  });

  useEventListener(ref.current, "touchstart", handlePinchStart, {
    passive: true,
  });
  useEventListener(ref.current, "touchmove", handlePinchMove, {
    passive: true,
  });

  return scale;
}
