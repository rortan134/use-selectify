"use client";

import "./styles/index.css";

import * as React from "react";

import { isNull } from "./utils/misc";
import { useCallbackRef } from "./utils/useCallbackRef";
import useEventListener from "./utils/useEventListener";

type RequiredProperty<T> = { [P in keyof T]: Required<NonNullable<T[P]>> };

export type PositionPoint = {
    x: number | null;
    y: number | null;
};

export type BoxBoundingPosition = {
    top: number;
    left: number;
    width: number;
    height: number;
};

const NULL_OBJ: PositionPoint = Object.freeze({ x: null, y: null });

const IS_SERVER = typeof window === "undefined";
const useIsomorphicLayoutEffect = IS_SERVER ? React.useEffect : React.useLayoutEffect;

/* -------------------------------------------------------------------------------------------------
 * SelectionLabel
 * -----------------------------------------------------------------------------------------------*/

const SELECT_LABEL_NAME = "SelectionBoxLabel";
const DEFAULT_SCREEN_READER_LABEL = "Drag Selection";

const srOnlyStyles = {
    position: "absolute",
    width: "1px",
    height: "1px",
    padding: "0",
    margin: "-1px",
    overflow: "hidden",
    clip: "rect(0, 0, 0, 0)",
    whiteSpace: "nowrap",
    borderWidth: "0",
} as const;

interface SelectionLabelProps extends React.ComponentPropsWithoutRef<"div"> {
    id: string;
    label: string | undefined;
    children: React.ReactNode;
}

const SelectionLabel = React.memo(({ id, label, children }: SelectionLabelProps) => {
    const screenReaderLabel = label ?? DEFAULT_SCREEN_READER_LABEL;
    return (
        <span id={id} aria-live="assertive" style={srOnlyStyles}>
            {screenReaderLabel}: {children}
        </span>
    );
});

SelectionLabel.displayName = SELECT_LABEL_NAME;

/* -------------------------------------------------------------------------------------------------
 * SelectionBox
 * -----------------------------------------------------------------------------------------------*/

const SELECT_BOX_NAME = "SelectionBoxOutlet";
const SELECT_BOX_IDENTIFIER = "selectify-selection-box-wrapper";

export type Theme = "default";

interface SelectionComponentProps extends React.ComponentPropsWithoutRef<"div"> {
    parentRef: React.RefObject<HTMLElement | null | undefined>;
    selectionBox: BoxBoundingPosition | null;
    isDragging: boolean;
    overlappedElementsCount: number;
    label: string | undefined;
    theme: Theme | undefined;
    forceMount: boolean | undefined;
}

const SelectionBox = React.forwardRef<HTMLDivElement, SelectionComponentProps>(
    (props: SelectionComponentProps, forwardedRef) => {
        const {
            parentRef,
            selectionBox,
            isDragging,
            overlappedElementsCount,
            theme = "default",
            forceMount,
            ...selectBoxProps
        } = props;
        const boxId = React.useId();
        const [liveText, setLiveText] = React.useState("");
        const wasDragActiveRef = React.useRef(false);
        const defaultTheme = `selectify_selection-box_${theme}-theme`;

        React.useEffect(() => {
            React.startTransition(() => {
                // Handle label
                if (wasDragActiveRef.current) {
                    setLiveText("Off");
                    return;
                }
                setLiveText(`${overlappedElementsCount} elements selected`);
                wasDragActiveRef.current = true;
            });

            return () => {
                wasDragActiveRef.current = false;
            };
        }, [overlappedElementsCount]);

        // copy z-index from content to wrapper
        const [contentZIndex, setContentZIndex] = React.useState<string>();
        useIsomorphicLayoutEffect(() => {
            if (parentRef.current)
                setContentZIndex(window.getComputedStyle(parentRef.current).zIndex);
        }, [parentRef]);

        return isDragging && !forceMount ? (
            <div
                {...selectBoxProps}
                ref={forwardedRef}
                id={SELECT_BOX_IDENTIFIER}
                role="region"
                tabIndex={-1}
                aria-labelledby={boxId}
                className={props.className || defaultTheme}
                style={{
                    // Ensure border-box for floating-ui calculations
                    boxSizing: "border-box",
                    position: "absolute",
                    pointerEvents: "none",
                    zIndex: contentZIndex,
                    ...selectionBox,
                    ...props.style,
                }}
            >
                <SelectionLabel id={boxId} label={props.label}>
                    {liveText}
                </SelectionLabel>
            </div>
        ) : null;
    }
);

SelectionBox.displayName = SELECT_BOX_NAME;

function promiseWrapper(promise: { default: React.ComponentType<any> }): Promise<{
    default: React.ComponentType<any>;
}> {
    return new Promise((resolve) => {
        resolve(promise);
    });
}

const LazySelectionBox = React.lazy(() => promiseWrapper({ default: SelectionBox }));

/* -------------------------------------------------------------------------------------------------
 * Selectify Hook
 * -----------------------------------------------------------------------------------------------*/

const DEFAULT_SELECT_CRITERIA = "*";

function throttle(timer?: (frame: FrameRequestCallback) => number) {
    if (!timer) return;
    let queuedCallback: (() => void) | null;
    return (callback: () => void) => {
        if (!queuedCallback) {
            timer(() => {
                const cb = queuedCallback;
                queuedCallback = null;
                cb?.();
            });
        }
        queuedCallback = callback;
    };
}

export interface UseSelectProps {
    /**
     * Maximum number of elements that can be selected.
     * Will stop selecting after reaching that number and keep already selected elements.
     * false = Infinite
     */
    maxSelections?: number | false;
    /**
     * Automatically try to scroll the window when the pointer approaches the viewport edge while dragging.
     * @defaultValue true
     */
    autoScroll?: boolean;
    /**
     * Distance in px from the viewport's edges from which the box will try scrolling the window when the pointer approaches the viewport edge while dragging.
     * @defaultValue 100
     */
    autoScrollEdgeDistance?: number;
    /**
     * Auto scroll speed.
     * @defaultValue 30
     */
    autoScrollStep?: number;
    /**
     * Will keep every item selected after selection.
     * Can be cleared with clearSelection()
     */
    disableUnselection?: boolean;
    /**
     * The specific CSS Selector criteria to match for selecting elements
     * Ex: `[data-selectify="true"]`
     *
     * @defaultValue "*"
     */
    selectCriteria?: string;
    /**
     * Will only select the element if the full rect intersects
     */
    onlySelectOnFullOverlap?: boolean;
    /**
     * Will only select elements after user has stopped dragging or cursor has left the screen
     * @defaultValue false
     */
    onlySelectOnDragEnd?: boolean;
    /**
     * Specify a delay in miliseconds before elements are selected, to prevent accidental selection
     * @defaultValue 0
     */
    selectionDelay?: number;
    /**
     * Accessible label for screen readers
     * @defaultValue "Drag Selection"
     */
    label?: string;
    /**
     * Distance in px from which elements can be selected even if selection box is not visually intersecting
     * @defaultValue 0
     */
    selectionTolerance?: number;
    /**
     * Only enables the selection box if the user was pressing a meta key while initiating the drag.
     * Included meta keys are: Shift, Ctrl, Cmd and Alt.
     */
    activateOnMetaKey?: boolean;
    /**
     * Only enables the selection box if the user was pressing a specified key while initiating the drag.
     */
    activateOnKey?: string[];
    /**
     * Won't enable the selection box if the user tries initiating the drag from the specified element.
     */
    exclusionZone?: Element | Element[] | string | null;
    hideOnScroll?: boolean;
    theme?: Theme;
    lazyLoad?: boolean;
    scrollContext?: HTMLElement | Window;
    disabled?: boolean;
    forceMount?: boolean;
    onSelect?(element: Element): void;
    onUnselect?(unselectedElement: Element): void;
    onDragStart?(e: PointerEvent): void | (() => void);
    onDragMove?(e: PointerEvent, selectedElements: Element[]): void;
    onDragEnd?(e?: PointerEvent, selectedElements?: Element[]): void;
    onEscapeKeyDown?(e: KeyboardEvent): void;
}

function getSymetricDifference(arrA: Element[], arrB: Element[]) {
    return arrA.filter((x) => !arrB.includes(x)).concat(arrB.filter((x) => !arrA.includes(x)));
}

let originalElementTouchAction: string;
let originalBodyUserSelect: string;

function useSelectify<T extends HTMLElement>(
    ref: React.RefObject<T | undefined | null>,
    options?: UseSelectProps
) {
    const {
        selectCriteria = DEFAULT_SELECT_CRITERIA,
        maxSelections,
        autoScroll = true,
        autoScrollEdgeDistance = 100,
        autoScrollStep = 30,
        hideOnScroll,
        disableUnselection,
        activateOnMetaKey,
        activateOnKey,
        onlySelectOnFullOverlap,
        onlySelectOnDragEnd,
        exclusionZone,
        selectionDelay,
        label,
        lazyLoad,
        scrollContext = globalThis?.window,
        theme,
        selectionTolerance = 0,
        onSelect = () => {},
        onUnselect = () => {},
        onDragStart = () => {},
        onDragMove = () => {},
        onDragEnd = () => {},
        onEscapeKeyDown = () => {},
        disabled,
        forceMount,
    } = options || {};
    const ownerDocument = globalThis?.document;

    const [boxStartingPoint, setBoxStartingPoint] = React.useState<PositionPoint>(NULL_OBJ);
    const [boxEndingPoint, setBoxEndingPoint] = React.useState<PositionPoint>(NULL_OBJ);
    const [isActive, setIsActive] = React.useState(false);
    const [selectedElements, setSelectedElements] = React.useState<Element[]>([]);

    // Caching rect to not force reflows with getBoundingClientRect calls
    const parentNodeRectRef = React.useRef<DOMRect>();
    const lastIntersectedElements = React.useRef<Element[]>([]);
    const intersectBoxRef = React.useRef<HTMLDivElement>(null);
    const selectionTimerRef = React.useRef(0);
    const intersectionDifference = React.useRef<Element[]>([]);
    const hasSelected = selectedElements.length > 0;
    const shouldDelaySelect = selectionDelay !== undefined && selectionDelay > 0;

    const triggerSelectEvent = useCallbackRef(onSelect);
    const triggerUnselectEvent = useCallbackRef(onUnselect);
    const triggerOnDragStart = useCallbackRef(onDragStart);
    const triggerOnDragMove = useCallbackRef(onDragMove);
    const triggerOnDragEnd = useCallbackRef(onDragEnd);
    const triggerOnEscapeKeyDown = useCallbackRef(onEscapeKeyDown);

    const select = React.useCallback(
        (elementsToSelect: Element[]) => {
            const difference = intersectionDifference.current;
            const hasSelected = elementsToSelect.length > lastIntersectedElements.current.length;
            const hasUnselected = elementsToSelect.length < lastIntersectedElements.current.length;

            if (difference.length === 0 || (disableUnselection && hasUnselected)) {
                return; // nothing to be selected
            }

            setSelectedElements(elementsToSelect);

            if (hasSelected) {
                difference.forEach((element) => triggerSelectEvent(element));
            } else if (hasUnselected) {
                difference.forEach((element) => triggerUnselectEvent(element));
            }

            lastIntersectedElements.current = elementsToSelect;
        },
        [disableUnselection, triggerSelectEvent, triggerUnselectEvent]
    );

    const handleSelectionEvent = React.useCallback(
        (elementsToSelect: Element[]) => {
            window.clearTimeout(selectionTimerRef.current);
            select(elementsToSelect);
        },
        [select]
    );

    const handleDelayedSelectionEvent = React.useCallback(
        (elementsToSelect: Element[]) => {
            window.clearTimeout(selectionTimerRef.current);
            selectionTimerRef.current = window.setTimeout(() => {
                select(elementsToSelect);
            }, selectionDelay);
        },
        [select, selectionDelay]
    );

    const findMatchingElements = React.useCallback(
        ({
            scope,
            matchCriteria,
        }: {
            scope: HTMLElement | undefined | null;
            matchCriteria: string; // CSS Selector
        }) => {
            if (!scope) return;

            // Convert NodeList to Element[]
            // .slice() has more performance at scale
            const matchingElements = Array.prototype.slice.call(
                scope.querySelectorAll(matchCriteria)
            ) as Element[];

            // Filter out the selection box element to not include it in the response
            const filteredMatchingElements = matchingElements.filter(
                (el) => el.id !== SELECT_BOX_IDENTIFIER
            );

            return maxSelections
                ? filteredMatchingElements.slice(0, maxSelections)
                : filteredMatchingElements;
        },
        [maxSelections]
    );

    // Check if two boxes overlap
    const checkIntersection = React.useCallback(
        (boxA: BoxBoundingPosition, boxB: BoxBoundingPosition) => {
            const { left: aLeft, top: aTop, width: aWidth, height: aHeight } = boxA;
            const { left: bLeft, top: bTop, width: bWidth, height: bHeight } = boxB;

            if (onlySelectOnFullOverlap) {
                const isFullOverlap =
                    aLeft - selectionTolerance <= bLeft &&
                    aLeft + aWidth + selectionTolerance >= bLeft + bWidth &&
                    aTop - selectionTolerance <= bTop &&
                    aTop + aHeight + selectionTolerance >= bTop + bHeight;

                return isFullOverlap;
            }

            const isPartialOverlap =
                aLeft - selectionTolerance <= bLeft + bWidth + selectionTolerance &&
                aLeft + aWidth + selectionTolerance >= bLeft &&
                aTop - selectionTolerance <= bTop + bHeight + selectionTolerance &&
                aTop + aHeight + selectionTolerance >= bTop;

            return isPartialOverlap;
        },
        [onlySelectOnFullOverlap, selectionTolerance]
    );

    const observedRectsRef = React.useRef<DOMRectReadOnly[]>([]);
    const observer = React.useMemo(
        () =>
            !IS_SERVER
                ? new IntersectionObserver(
                      (entries, ob) => {
                          ob.disconnect();
                          observedRectsRef.current = entries.map(
                              (entry) => entry.boundingClientRect
                          );
                      },
                      { root: ref.current }
                  )
                : null,
        [ref]
    );

    const getBoundingClientRectsAsync = React.useCallback(
        (elements: readonly Element[]): Promise<BoxBoundingPosition[]> =>
            new Promise((resolve) => {
                resolve(observedRectsRef.current);
                elements.forEach((element) => observer?.observe(element));
            }),
        [observer]
    );

    const getIntersectedElements = React.useCallback(
        async (intersectionBoxRect: DOMRect, elementsToIntersect: readonly Element[]) => {
            const intersectedElements: Element[] = [];
            const elementsBoundingRects = await getBoundingClientRectsAsync(elementsToIntersect);
            for (let i = elementsToIntersect.length - 1; i >= 0; i--) {
                if (
                    checkIntersection(
                        intersectionBoxRect,
                        elementsBoundingRects[i] ?? elementsToIntersect[i].getBoundingClientRect() // fallback to regular synchronous getBoundingClientRect
                    )
                ) {
                    intersectedElements.push(elementsToIntersect[i]);
                }
            }
            return intersectedElements;
        },
        [checkIntersection, getBoundingClientRectsAsync]
    );

    const canSelectRef = React.useRef(false);

    const calculateSelectionBox = React.useCallback(
        (startPoint: PositionPoint, endPoint: PositionPoint) => {
            const parentNode = ref.current;
            if (!parentNode || isNull(startPoint) || isNull(endPoint)) {
                canSelectRef.current = false;
                return null;
            }

            canSelectRef.current = true;

            const { x: aX, y: aY } = startPoint as RequiredProperty<PositionPoint>;
            const { x: bX, y: bY } = endPoint as RequiredProperty<PositionPoint>;

            const left = Math.min(aX, bX) - parentNode.offsetLeft;
            const top = Math.min(aY, bY) - parentNode.offsetTop;
            const width = Math.abs(aX - bX);
            const height = Math.abs(aY - bY);

            return {
                left: left,
                top: top,
                width: width,
                height: height,
            };
        },
        [ref]
    );

    const selectionBox: BoxBoundingPosition | null = React.useMemo(
        () => calculateSelectionBox(boxStartingPoint, boxEndingPoint),
        [calculateSelectionBox, boxEndingPoint, boxStartingPoint]
    );

    const matchingElementsRef = React.useRef<Element[] | undefined>([]);

    const checkSelectionBoxIntersect = React.useCallback(async () => {
        const selectionBoxRef = intersectBoxRef.current;
        if (!selectionBoxRef || disabled || !matchingElementsRef.current) {
            return;
        }
        // Check intersection against every selectable element
        const intersectedElements = await getIntersectedElements(
            selectionBoxRef.getBoundingClientRect(),
            matchingElementsRef.current
        );
        intersectionDifference.current = getSymetricDifference(
            intersectedElements,
            lastIntersectedElements.current
        );

        if (shouldDelaySelect) handleDelayedSelectionEvent(intersectedElements);
        else handleSelectionEvent(intersectedElements);
    }, [
        disabled,
        getIntersectedElements,
        handleDelayedSelectionEvent,
        handleSelectionEvent,
        shouldDelaySelect,
    ]);

    const scrollTimerRef = React.useRef(0);

    const handleAutomaticWindowScroll = React.useCallback(
        (event: PointerEvent, { cancelLast }: { cancelLast?: boolean } = {}) => {
            if (cancelLast) {
                // Cancel last static-pointer auto-scroll schedule
                window.clearTimeout(scrollTimerRef.current);
            }

            const viewportX = event.clientX;
            const viewportY = event.clientY;
            const viewportWidth = document.documentElement.clientWidth;
            const viewportHeight = document.documentElement.clientHeight;

            const edgeBottom = viewportHeight - autoScrollEdgeDistance;
            const edgeRight = viewportWidth - autoScrollEdgeDistance;
            const isInLeftEdge = viewportX < autoScrollEdgeDistance;
            const isInRightEdge = viewportX > edgeRight;
            const isInTopEdge = viewportY < autoScrollEdgeDistance;
            const isInBottomEdge = viewportY > edgeBottom;

            // Stop if the pointer isn't at the edge
            if (!(isInLeftEdge || isInRightEdge || isInTopEdge || isInBottomEdge)) {
                window.clearTimeout(scrollTimerRef.current);
                return;
            }

            const documentWidth = Math.max(
                document.body.scrollWidth,
                document.body.offsetWidth,
                document.body.clientWidth,
                document.documentElement.scrollWidth,
                document.documentElement.offsetWidth,
                document.documentElement.clientWidth
            );
            const documentHeight = Math.max(
                document.body.scrollHeight,
                document.body.offsetHeight,
                document.body.clientHeight,
                document.documentElement.scrollHeight,
                document.documentElement.offsetHeight,
                document.documentElement.clientHeight
            );
            const maxScrollX = documentWidth - viewportWidth;
            const maxScrollY = documentHeight - viewportHeight;
            const currentScrollX =
                scrollContext instanceof Window ? scrollContext.scrollX : scrollContext.scrollLeft;
            const currentScrollY =
                scrollContext instanceof Window ? scrollContext.scrollY : scrollContext.scrollTop;
            const canScrollUp = currentScrollY > 0;
            const canScrollDown = currentScrollY < maxScrollY;
            const canScrollLeft = currentScrollX > 0;
            const canScrollRight = currentScrollX < maxScrollX;
            let nextScrollX = currentScrollX;
            let nextScrollY = currentScrollY;

            // Check left and right
            if (isInLeftEdge && canScrollLeft) {
                const intensity = (autoScrollEdgeDistance - viewportX) / autoScrollEdgeDistance;
                nextScrollX = nextScrollX - autoScrollStep * intensity;
            } else if (isInRightEdge && canScrollRight) {
                const intensity = (viewportX - edgeRight) / autoScrollEdgeDistance;
                nextScrollX = nextScrollX + autoScrollStep * intensity;
            }

            // Check up and down
            if (isInTopEdge && canScrollUp) {
                const intensity = (autoScrollEdgeDistance - viewportY) / autoScrollEdgeDistance;
                nextScrollY = nextScrollY - autoScrollStep * intensity;
            } else if (isInBottomEdge && canScrollDown) {
                const intensity = (viewportY - edgeBottom) / autoScrollEdgeDistance;
                nextScrollY = nextScrollY + autoScrollStep * intensity;
            }

            // Filter invalid maximums
            nextScrollX = Math.max(0, Math.min(maxScrollX, nextScrollX));
            nextScrollY = Math.max(0, Math.min(maxScrollY, nextScrollY));

            // Adjust window scroll
            if (nextScrollX !== currentScrollX || nextScrollY !== currentScrollY) {
                scrollContext.scrollTo(nextScrollX, nextScrollY);
                // ToDo: handle static-pointer selections
                // Currently only selects on pointermove

                // Schedule static-pointer auto-scroll with current event
                // Can be cancelled
                scrollTimerRef.current = window.setTimeout(
                    () => handleAutomaticWindowScroll(event),
                    30
                );
            }
        },
        [autoScrollEdgeDistance, autoScrollStep, scrollContext]
    );

    const eventsCacheRef = React.useRef<PointerEvent[]>([]);
    const throttledRequestAnimationFrame = useCallbackRef(
        throttle(globalThis?.window?.requestAnimationFrame)
    );
    const isMultitouchActive = eventsCacheRef.current.length >= 2;

    const handleDrawRectUpdate = React.useCallback(
        (event: PointerEvent) => {
            // Disable on multitouch for pinch and other gestures
            if (disabled || isMultitouchActive) {
                return;
            }

            // Update last event cache to current one
            const eventIndex = eventsCacheRef.current.findIndex(
                (cachedEv) => cachedEv.pointerId === event.pointerId
            );
            eventsCacheRef.current[eventIndex] = event;

            if (!parentNodeRectRef.current) return;
            // Start drawing box
            setBoxEndingPoint({
                x: event.clientX - parentNodeRectRef.current.left,
                y: event.clientY - parentNodeRectRef.current.top,
            });
            setIsActive(true);

            if (!canSelectRef.current) {
                return;
            }

            if (!onlySelectOnDragEnd) {
                // Only throttle selection to keep drawing fluid
                throttledRequestAnimationFrame(() => {
                    checkSelectionBoxIntersect();
                    if (autoScroll) {
                        handleAutomaticWindowScroll(event, { cancelLast: true });
                    }
                });
            }

            triggerOnDragMove(event, lastIntersectedElements.current);
        },
        [
            autoScroll,
            checkSelectionBoxIntersect,
            disabled,
            handleAutomaticWindowScroll,
            isMultitouchActive,
            onlySelectOnDragEnd,
            throttledRequestAnimationFrame,
            triggerOnDragMove,
        ]
    );

    const cancelRectDraw = React.useCallback(() => {
        const parentNode = ref.current;
        if (!parentNode) return;
        window.clearTimeout(scrollTimerRef.current);
        parentNode.removeEventListener("pointermove", handleDrawRectUpdate);
        window.removeEventListener("scroll", cancelRectDraw);

        // Reset default values
        setBoxStartingPoint(NULL_OBJ);
        setBoxEndingPoint(NULL_OBJ);
        setIsActive(false);
        triggerOnDragEnd();
    }, [handleDrawRectUpdate, ref, triggerOnDragEnd]);

    const handleEscapeKeyCancel = React.useCallback(
        (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                event.preventDefault();
                cancelRectDraw();
                triggerOnEscapeKeyDown(event);
                ownerDocument.removeEventListener("keydown", handleEscapeKeyCancel, {
                    capture: true,
                });
            }
        },
        [cancelRectDraw, ownerDocument, triggerOnEscapeKeyDown]
    );
    [];

    const calculateParentNodeRect = React.useCallback(() => {
        const parentNode = ref.current;
        if (!parentNode) return new DOMRect(); // Placeholder Rect

        const parentNodeComputedStyle = window.getComputedStyle(ref.current);
        const currParentNodeRect = parentNode.getBoundingClientRect();
        const newParentNodeRect = {
            ...currParentNodeRect,
            left:
                currParentNodeRect.left -
                parseInt(parentNodeComputedStyle.getPropertyValue("margin-left")),
            top:
                currParentNodeRect.top -
                parseInt(parentNodeComputedStyle.getPropertyValue("margin-top")),
        };

        return newParentNodeRect as DOMRect;
    }, [ref]);

    const handleScroll = React.useCallback(() => {
        if (hideOnScroll) {
            if (autoScroll) {
                throw new Error("use-selectify: hideOnScroll & autoScroll are not compatible");
            }
            cancelRectDraw();
        }
        // Recalculate new clientY position
        parentNodeRectRef.current = calculateParentNodeRect();
    }, [autoScroll, calculateParentNodeRect, cancelRectDraw, hideOnScroll]);

    const handleDrawRectEnd = React.useCallback(
        (event: PointerEvent) => {
            const parentNode = ref.current;
            if (disabled || !parentNode || IS_SERVER) {
                return;
            }

            if (onlySelectOnDragEnd && !isMultitouchActive) {
                checkSelectionBoxIntersect();
            }

            cancelRectDraw();
            ownerDocument.removeEventListener("keydown", handleEscapeKeyCancel, { capture: true });
            document.body.style.webkitUserSelect = originalBodyUserSelect;

            // Remove current event from the cache
            const eventIndex = eventsCacheRef.current.findIndex(
                (cachedEv) => cachedEv.pointerId === event.pointerId
            );
            eventsCacheRef.current.splice(eventIndex, 1);

            triggerOnDragEnd(event, selectedElements);
        },
        [
            cancelRectDraw,
            checkSelectionBoxIntersect,
            disabled,
            handleEscapeKeyCancel,
            isMultitouchActive,
            onlySelectOnDragEnd,
            ownerDocument,
            ref,
            selectedElements,
            triggerOnDragEnd,
        ]
    );

    const isInExclusionZone = React.useCallback(
        async (pointer: RequiredProperty<PositionPoint>) => {
            if (!exclusionZone) return false;
            const elementsToBeExcluded =
                typeof exclusionZone === "string" // handle CSS Selectors
                    ? findMatchingElements({
                          scope: ref.current,
                          matchCriteria: exclusionZone,
                      })
                    : [exclusionZone].flat(); // Make sure exclusionZone will be an array

            if (!elementsToBeExcluded) return false;
            const intersectsExclusionZone = await getIntersectedElements(
                new DOMRect(pointer.x, pointer.y, 1, 1), // Check intersection with a 1x1 artificial rect
                elementsToBeExcluded
            );
            return intersectsExclusionZone.length > 0;
        },
        [exclusionZone, findMatchingElements, getIntersectedElements, ref]
    );

    const handleDrawRectStart = React.useCallback(
        async (event: PointerEvent) => {
            if (disabled || IS_SERVER) {
                return;
            }

            const parentNode = ref.current;
            const shouldActivate = event.button === 0 || event.button === 1 || event.isPrimary;
            const isModifierKey = event.altKey || event.ctrlKey || event.shiftKey || event.metaKey;
            const userKeyPressed = activateOnKey?.some((key) => event.getModifierState(key));

            if (!parentNode || !shouldActivate || isMultitouchActive) {
                return;
            }

            if (!activateOnMetaKey || (activateOnMetaKey && isModifierKey) || userKeyPressed) {
                // Prevent implicit pointer capture
                // https://www.w3.org/TR/pointerevents3/#implicit-pointer-capture
                const target = event.target as HTMLElement;
                if (target.hasPointerCapture(event.pointerId)) {
                    target.releasePointerCapture(event.pointerId);
                }
                // Pointer capture doesn't prevent text selection in Safari
                // so we remove text selection manually
                originalBodyUserSelect = document.body.style.webkitUserSelect;
                document.body.style.webkitUserSelect = "none";

                parentNodeRectRef.current = calculateParentNodeRect();
                const eventStartingPoint = {
                    x: event.clientX - parentNodeRectRef.current.left,
                    y: event.clientY - parentNodeRectRef.current.top,
                };

                if (await isInExclusionZone(eventStartingPoint)) {
                    return;
                }

                const userCallback = triggerOnDragStart(event);
                userCallback?.();

                if (event.defaultPrevented) {
                    console.warn("use-selectify: Event prevented, stopping execution.");
                    return;
                }

                setBoxStartingPoint(eventStartingPoint);

                parentNode.addEventListener("pointermove", handleDrawRectUpdate, {
                    passive: true,
                });
                ownerDocument.addEventListener("keydown", handleEscapeKeyCancel, {
                    capture: true,
                    once: true,
                });
                window.addEventListener("scroll", handleScroll);

                // Add event to cache
                eventsCacheRef.current.push(event);
            }
        },
        [
            activateOnKey,
            activateOnMetaKey,
            calculateParentNodeRect,
            disabled,
            handleDrawRectUpdate,
            handleEscapeKeyCancel,
            handleScroll,
            isInExclusionZone,
            isMultitouchActive,
            ownerDocument,
            ref,
            triggerOnDragStart,
        ]
    );

    const selectAll = React.useCallback(() => {
        const allElements = findMatchingElements({
            scope: ref.current,
            matchCriteria: selectCriteria,
        });
        if (!allElements) return;

        // Force selection events
        intersectionDifference.current = allElements;
        handleSelectionEvent(allElements);
    }, [findMatchingElements, handleSelectionEvent, ref, selectCriteria]);

    const clearSelection = React.useCallback(() => {
        // Force unselection events
        intersectionDifference.current = getSymetricDifference([], lastIntersectedElements.current);
        lastIntersectedElements.current = selectedElements;
        handleSelectionEvent([]);
    }, [handleSelectionEvent, selectedElements]);

    const mutateSelections = React.useCallback(
        (update: ((lastSelected: readonly Element[]) => Element[]) | Element[]) => {
            const newSelection = update instanceof Function ? update(selectedElements) : update;
            intersectionDifference.current = getSymetricDifference(
                newSelection,
                lastIntersectedElements.current
            );
            handleSelectionEvent(newSelection);
        },
        [handleSelectionEvent, selectedElements]
    );

    const getSelectableElements = React.useCallback(
        () => findMatchingElements({ scope: ref.current, matchCriteria: selectCriteria }),
        [findMatchingElements, ref, selectCriteria]
    );

    const resetEventsCache = useCallbackRef(() => (eventsCacheRef.current = []));

    useEventListener(ref.current, "pointerdown", handleDrawRectStart, {
        passive: false,
    });
    useEventListener(ownerDocument, "pointercancel", cancelRectDraw);
    useEventListener(ownerDocument, "blur", cancelRectDraw);
    useEventListener(ownerDocument, "pointerup", handleDrawRectEnd);
    useEventListener(ownerDocument, "pointerleave", handleDrawRectEnd);
    useEventListener(globalThis?.window, "resize", resetEventsCache);

    useIsomorphicLayoutEffect(() => {
        // Prevent browser from trying to claim the pointermove event for panning on mobile
        // without this the selection box does not work properly when scroll is present
        function cancelBrowserTouchActionClaim() {
            const parentNode = ref.current;
            if (!parentNode || disabled) return;
            originalElementTouchAction = parentNode.style.touchAction;
            parentNode.style.touchAction = "none";
            return () => {
                parentNode.style.touchAction = originalElementTouchAction;
            };
        }

        const revert = cancelBrowserTouchActionClaim();
        if (disabled) revert?.();

        return () => {
            revert?.();
        };
    }, [disabled, ref]);

    React.useEffect(() => {
        // Listen for `selectCriteria` changes to instantly pass updates
        matchingElementsRef.current = findMatchingElements({
            scope: ref.current,
            matchCriteria: selectCriteria,
        });
    }, [findMatchingElements, ref, selectCriteria]);

    React.useEffect(() => {
        return () => {
            // cleanup
            window.clearTimeout(selectionTimerRef.current);
            cancelRectDraw();
            ownerDocument.removeEventListener("keydown", handleEscapeKeyCancel);
        };
    }, [cancelRectDraw, handleEscapeKeyCancel, ownerDocument]);

    // Initial undefined `ref.current` workaround
    const [currRender, forceRerender] = React.useState(0);
    React.useEffect(() => {
        if (currRender > 0) return;
        forceRerender((prev) => prev + 1);
    }, [currRender]);

    /* ---------------------------------------------------------------------------------------------- */

    const SelectBoxOutlet = (props: React.ComponentPropsWithoutRef<"div">) => {
        if (process.env.NODE_ENV === "development" && ref.current) {
            if (ref.current.scrollWidth > ref.current.clientWidth && !autoScroll) {
                console.warn(
                    `use-selectify: <${ref.current.tagName}> can scroll but autoScroll is disabled. Users might not be able to scroll and select at the same time. 
                        Consider enabling autoScroll.`
                );
            }
        }

        if (disabled) {
            return null;
        }

        const selectionBoxProps = {
            ...props,
            ref: intersectBoxRef,
            parentRef: ref,
            selectionBox: selectionBox,
            isDragging: isActive,
            overlappedElementsCount: selectedElements.length + 1,
            theme: theme,
            label: label,
            forceMount: forceMount,
            suppressHydrationWarning: true,
        };

        return lazyLoad ? (
            <React.Suspense>
                <LazySelectionBox {...selectionBoxProps} />
            </React.Suspense>
        ) : (
            <SelectionBox {...selectionBoxProps} />
        );
    };

    SelectBoxOutlet.displayName = SELECT_BOX_NAME;

    return {
        SelectBoxOutlet,
        selectedElements,
        isDragging: isActive,
        hasSelected,
        selectionBox,
        getSelectableElements,
        selectAll,
        clearSelection,
        mutateSelections,
        cancelSelectionBox: cancelRectDraw,
        selectionBoxRef: intersectBoxRef,
        options,
    };
}

export { SelectionBox, useSelectify };
