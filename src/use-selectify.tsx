import "./style.css";

import * as React from "react";

import { useComposedRefs } from "./utils/composeRefs";
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

const IS_BROWSER = typeof window !== "undefined";
const useIsomorphicLayoutEffect = IS_BROWSER ? React.useLayoutEffect : React.useEffect;

function hasNullProps(obj: Record<string, unknown>) {
    return Object.values(obj).some((value) => {
        if (value === null) {
            return true;
        }
        return false;
    });
}

/* -------------------------------------------------------------------------------------------------
 * SelectionLabel
 * -----------------------------------------------------------------------------------------------*/

const SELECTION_LABEL_NAME = "SelectionBoxLabel";
const DEFAULT_SCREEN_READER_LABEL = "Drag selection";

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

interface SelectionLabelProps extends React.ComponentPropsWithoutRef<"span"> {
    id: string;
    label: string | undefined;
    children: React.ReactNode;
}

const SelectionLabel = ({ id, label, children, ...props }: SelectionLabelProps) => {
    const screenReaderLabel = label ?? DEFAULT_SCREEN_READER_LABEL;
    return (
        <span {...props} id={id} aria-live="assertive" style={srOnlyStyles}>
            {screenReaderLabel}: {children}
        </span>
    );
};

SelectionLabel.displayName = SELECTION_LABEL_NAME;

/* -------------------------------------------------------------------------------------------------
 * SelectionBox
 * -----------------------------------------------------------------------------------------------*/

const SELECTION_BOX_NAME = "SelectionBoxOutlet";

const DEFAULT_THEME = "selectify_selection-box_default-theme";

type SelectionComponentElement = React.ComponentPropsWithoutRef<"div">;

export interface SelectionComponentProps extends SelectionComponentElement {
    parentRef: React.RefObject<HTMLElement | null | undefined>;
    selectionBox: BoxBoundingPosition | null;
    isDragging: boolean;
    overlappedElementsCount: number;
    label: string | undefined;
    forceMount?: true;
}

const SelectionBox = React.forwardRef<React.ElementRef<"div">, SelectionComponentProps>(
    (props: SelectionComponentProps, forwardedRef) => {
        const {
            parentRef,
            selectionBox,
            isDragging,
            overlappedElementsCount,
            forceMount,
            ...selectBoxProps
        } = props;
        const boxId = React.useId();
        const [liveText, setLiveText] = React.useState("");
        const wasDragActiveRef = React.useRef(false);

        React.useEffect(() => {
            React.startTransition(() => {
                // Handle label
                if (wasDragActiveRef.current) {
                    setLiveText("Selection off");
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
            if (parentRef.current) {
                setContentZIndex(window.getComputedStyle(parentRef.current).zIndex);
            }
        }, [parentRef]);

        if (!selectionBox) {
            return null;
        }

        return isDragging && !forceMount ? (
            <div
                {...selectBoxProps}
                ref={forwardedRef}
                role="region"
                tabIndex={-1}
                aria-labelledby={boxId}
                className={props.className || DEFAULT_THEME}
                style={{
                    // Ensure border-box for floating-ui calculations
                    boxSizing: "border-box",
                    position: "absolute",
                    pointerEvents: "none",
                    zIndex: contentZIndex,
                    ...selectionBox,
                    ...props.style,
                }}
                selectify-container="">
                <SelectionLabel id={boxId} label={props.label}>
                    {liveText}
                </SelectionLabel>
            </div>
        ) : null;
    }
);

SelectionBox.displayName = SELECTION_BOX_NAME;

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
    lazyLoad?: boolean;
    scrollContext?: HTMLElement | Window;
    disabled?: boolean;
    forceMount?: true;
    onSelect?(element: Element): void;
    onUnselect?(unselectedElement: Element): void;
    onDragStart?(e: PointerEvent): void | (() => void);
    onDragMove?(e: PointerEvent, selectedElements: Element[]): void;
    onDragEnd?(e?: PointerEvent, selectedElements?: Element[]): void;
    onEscapeKeyDown?(e: KeyboardEvent): void;
}

function getSymmetricDifference(arrA: Element[], arrB: Element[]) {
    return arrA.filter((x) => !arrB.includes(x)).concat(arrB.filter((x) => !arrA.includes(x)));
}

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

let originalElementTouchAction: string;
let originalBodyUserSelect: string;

function useSelectify<T extends HTMLElement>(
    ref: React.RefObject<T | undefined | null>,
    config?: UseSelectProps
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
        selectionTolerance = 0,
        onSelect = () => {},
        onUnselect = () => {},
        onDragStart = () => {},
        onDragMove = () => {},
        onDragEnd = () => {},
        onEscapeKeyDown = () => {},
        disabled,
        forceMount,
    } = config ?? {};
    const ownerDocument = globalThis?.document;

    const boxStartingPointRef = React.useRef<PositionPoint>(NULL_OBJ);
    const [boxEndingPoint, setBoxEndingPoint] = React.useState<PositionPoint>(NULL_OBJ);
    const [isActive, setIsActive] = React.useState(false);
    const [selectedElements, setSelectedElements] = React.useState<Element[]>([]);

    // Caching rect to not force reflows with getBoundingClientRect calls
    const parentNodeRectRef = React.useRef<DOMRect>();
    const lastIntersectedElementsRef = React.useRef<Element[]>([]);
    const intersectBoxRef = React.useRef<HTMLDivElement>(null);
    const selectionTimerRef = React.useRef(0);
    const hasDraggedOnceRef = React.useRef(false);
    const intersectionDifferenceRef = React.useRef<Element[]>([]);

    const hasSelected = selectedElements.length > 0;
    const shouldDelaySelect = selectionDelay !== undefined && selectionDelay > 0;

    const triggerSelectEvent = useCallbackRef(onSelect);
    const triggerUnselectEvent = useCallbackRef(onUnselect);
    const triggerOnDragStart = useCallbackRef(onDragStart);
    const triggerOnDragMove = useCallbackRef(onDragMove);
    const triggerOnDragEnd = useCallbackRef(onDragEnd);
    const triggerOnEscapeKeyDown = useCallbackRef(onEscapeKeyDown);

    // Refs to keep stable config and values
    const configRef = React.useRef(config);

    const select = React.useCallback(
        (elementsToSelect: Element[]) => {
            const difference = intersectionDifferenceRef.current;
            const hasSelected = elementsToSelect.length > lastIntersectedElementsRef.current.length;
            const hasUnselected =
                elementsToSelect.length < lastIntersectedElementsRef.current.length;

            if (difference.length === 0 || (hasUnselected && disableUnselection)) {
                return; // nothing to be selected
            }

            setSelectedElements(elementsToSelect);

            if (hasSelected) {
                difference.forEach((element) => triggerSelectEvent(element));
            } else if (hasUnselected) {
                difference.forEach((element) => triggerUnselectEvent(element));
            }

            lastIntersectedElementsRef.current = elementsToSelect;
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
            const filteredMatchingElements = matchingElements.filter((el) =>
                el.hasAttribute("selectify-container")
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
            IS_BROWSER
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
        (elements: readonly Element[]) => {
            const capturedRects = new Promise((resolve) => {
                elements.forEach((element) => observer?.observe(element));
                resolve(observedRectsRef.current);
            }) as Promise<DOMRectReadOnly[]>;
            capturedRects.then(() => elements.forEach((element) => observer?.unobserve(element)));
            return capturedRects;
        },
        [observer]
    );

    const getIntersectedElements = React.useCallback(
        async (intersectionBoxRect: DOMRect, elementsToIntersect: readonly Element[]) => {
            const elementsBoundingRects = await getBoundingClientRectsAsync(elementsToIntersect);
            return elementsToIntersect.filter((elementToCheckIntersection, i) => {
                return (
                    elementToCheckIntersection &&
                    checkIntersection(
                        intersectionBoxRect,
                        elementsBoundingRects[i] ??
                            elementToCheckIntersection.getBoundingClientRect() // fallback to regular synchronous getBoundingClientRect
                    )
                );
            });
        },
        [checkIntersection, getBoundingClientRectsAsync]
    );

    const canSelectRef = React.useRef(false);

    const calculateSelectionBox = React.useCallback(
        (startPoint: PositionPoint, endPoint: PositionPoint) => {
            const parentNode = ref.current;
            if (!parentNode || hasNullProps(startPoint) || hasNullProps(endPoint)) {
                canSelectRef.current = false;
                return null;
            }

            canSelectRef.current = true;

            const { x: aX, y: aY } = startPoint as RequiredProperty<PositionPoint>;
            const { x: bX, y: bY } = endPoint as RequiredProperty<PositionPoint>;

            return {
                left: Math.min(aX, bX) - parentNode.offsetLeft,
                top: Math.min(aY, bY) - parentNode.offsetTop,
                width: Math.abs(aX - bX),
                height: Math.abs(aY - bY),
            };
        },
        [ref]
    );

    const selectionBox: BoxBoundingPosition | null = React.useMemo(
        () => calculateSelectionBox(boxStartingPointRef.current, boxEndingPoint),
        [boxEndingPoint, calculateSelectionBox]
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
        intersectionDifferenceRef.current = getSymmetricDifference(
            intersectedElements,
            lastIntersectedElementsRef.current
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

            const viewportX = event.screenX;
            const viewportY = event.screenY;
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
                x: event.screenX - parentNodeRectRef.current.left,
                y: event.screenY - parentNodeRectRef.current.top,
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

            triggerOnDragMove(event, lastIntersectedElementsRef.current);
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
        boxStartingPointRef.current = NULL_OBJ;
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

    const calculateParentNodeRect = React.useCallback(() => {
        const parentNode = ref.current;
        if (!parentNode) return new DOMRect(); // Placeholder Rect

        const parentNodeComputedStyle = window.getComputedStyle(ref.current);
        const currParentNodeRect = parentNode.getBoundingClientRect();
        return {
            ...currParentNodeRect,
            left:
                currParentNodeRect.left -
                parseInt(parentNodeComputedStyle.getPropertyValue("margin-left")),
            top:
                currParentNodeRect.top -
                parseInt(parentNodeComputedStyle.getPropertyValue("margin-top")),
        } as DOMRect;
    }, [ref]);

    const handleScroll = React.useCallback(() => {
        if (hideOnScroll) {
            if (autoScroll) {
                console.error("use-selectify: hideOnScroll & autoScroll are not compatible.");
            }
            cancelRectDraw();
        }
        // Recalculate new screenY position
        parentNodeRectRef.current = calculateParentNodeRect();
    }, [autoScroll, calculateParentNodeRect, cancelRectDraw, hideOnScroll]);

    const handleDrawRectEnd = React.useCallback(
        (event: PointerEvent) => {
            const parentNode = ref.current;
            if (disabled || !parentNode || !IS_BROWSER) {
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
            const elementsIntersectingExclusionZone = await getIntersectedElements(
                new DOMRect(pointer.x, pointer.y, 1, 1), // Check intersection with a 1x1 artificial rect
                elementsToBeExcluded
            );
            return elementsIntersectingExclusionZone.length > 0;
        },
        [exclusionZone, findMatchingElements, getIntersectedElements, ref]
    );

    const handleDrawRectStart = React.useCallback(
        async (event: PointerEvent) => {
            if (disabled || !IS_BROWSER) return;

            const parentNode = ref.current;
            const shouldActivate = event.button === 0 || event.button === 1 || event.isPrimary;
            const isModifierKey = event.altKey || event.ctrlKey || event.shiftKey || event.metaKey;
            const userKeyPressed = activateOnKey?.some((key) => event.getModifierState(key));

            if (!parentNode || !shouldActivate || isMultitouchActive) {
                return;
            }

            if (!activateOnMetaKey || (activateOnMetaKey && isModifierKey) || userKeyPressed) {
                parentNodeRectRef.current = calculateParentNodeRect();
                const eventStartingPoint = {
                    x: event.screenX - parentNodeRectRef.current.left,
                    y: event.screenY - parentNodeRectRef.current.top,
                };

                if (await isInExclusionZone(eventStartingPoint)) {
                    return;
                }
                hasDraggedOnceRef.current = true;

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

                const consumerCallback = triggerOnDragStart(event);
                consumerCallback?.();

                if (event.defaultPrevented) {
                    console.log("use-selectify: Event prevented, stopping execution.");
                    return;
                }

                boxStartingPointRef.current = eventStartingPoint;

                parentNode.addEventListener("pointermove", handleDrawRectUpdate, {
                    passive: true,
                });
                ownerDocument.addEventListener("keydown", handleEscapeKeyCancel, {
                    capture: true,
                    once: true,
                });
                globalThis?.window.addEventListener("scroll", handleScroll);

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
        intersectionDifferenceRef.current = allElements;
        handleSelectionEvent(allElements);
    }, [findMatchingElements, handleSelectionEvent, ref, selectCriteria]);

    const clearSelection = React.useCallback(() => {
        // Force unselection events
        intersectionDifferenceRef.current = getSymmetricDifference(
            [],
            lastIntersectedElementsRef.current
        );
        lastIntersectedElementsRef.current = selectedElements;
        handleSelectionEvent([]);
    }, [handleSelectionEvent, selectedElements]);

    const mutateSelections = React.useCallback(
        (update: ((lastSelected: readonly Element[]) => Element[]) | Element[]) => {
            const newSelection = update instanceof Function ? update(selectedElements) : update;
            intersectionDifferenceRef.current = getSymmetricDifference(
                newSelection,
                lastIntersectedElementsRef.current
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
    useEventListener(ownerDocument, "blur", cancelRectDraw);
    useEventListener(ownerDocument, "contextmenu", cancelRectDraw);
    useEventListener(ownerDocument, "pointercancel", cancelRectDraw);
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

    const SelectBoxOutlet = React.forwardRef<HTMLDivElement, SelectionComponentElement>(
        (props: SelectionComponentElement, forwardedRef) => {
            if (process.env.NODE_ENV === "development" && ref.current) {
                if (ref.current.scrollWidth > ref.current.clientWidth && !autoScroll) {
                    console.warn(
                        `use-selectify: <${ref.current.tagName}> can scroll but autoScroll is disabled. Users might not be able to scroll and select at the same time. 
                        Consider enabling autoScroll.`
                    );
                }
            }

            const composedRefs = useComposedRefs(forwardedRef, intersectBoxRef);

            if (disabled) {
                return null;
            }

            const selectionBoxProps = {
                ...props,
                ref: composedRefs,
                parentRef: ref,
                selectionBox: selectionBox,
                isDragging: isActive,
                overlappedElementsCount: selectedElements.length,
                label: label,
                forceMount: forceMount,
                suppressHydrationWarning: true,
            };

            return lazyLoad ? (
                hasDraggedOnceRef.current ? (
                    <React.Suspense>
                        <LazySelectionBox {...selectionBoxProps} />
                    </React.Suspense>
                ) : null
            ) : (
                <SelectionBox {...selectionBoxProps} />
            );
        }
    );

    SelectBoxOutlet.displayName = SELECTION_BOX_NAME;

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
        options: configRef.current,
    };
}

export { SelectionBox, useSelectify };
