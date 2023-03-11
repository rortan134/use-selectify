"use client"; // nextjs13 client declaration

import "./styles/index.css";

import * as React from "react";

import { fastFilter, isNull } from "./utils/misc";
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
 * Select Box Component
 * -----------------------------------------------------------------------------------------------*/

const SELECT_BOX_NAME = "SelectBoxOutlet";
const SELECT_LABEL_NAME = "SelectBoxLabel";
const DEFAULT_SCREEN_READER_LABEL = "Drag Selection";

export type Theme = "default" | "outline";

interface SelectifyComponentProps extends React.ComponentPropsWithoutRef<"div"> {
    parentRef: React.RefObject<HTMLElement | null | undefined>;
    selectionBox: BoxBoundingPosition | null;
    isDragging: boolean;
    overlappedElementsCount: number;
    label: string | undefined;
    theme: Theme | undefined;
    forceMount: boolean;
}

const SELECT_BOX_IDENTIFIER = "selectify-selection-box-wrapper";

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

const Label = React.memo(({ id, children }: { id: string; children: React.ReactNode }) => (
    <span id={id} aria-live="assertive" style={srOnlyStyles}>
        {children}
    </span>
));

Label.displayName = SELECT_LABEL_NAME;

const SelectBox = React.forwardRef<HTMLDivElement, SelectifyComponentProps>(
    (props: SelectifyComponentProps, forwardedRef) => {
        const {
            parentRef,
            selectionBox,
            isDragging,
            overlappedElementsCount,
            label,
            theme = "default",
            forceMount,
            id: _,
            ...selectBoxProps
        } = props;

        const boxId = React.useId();
        const wasDragActiveRef = React.useRef(false);
        const selectionBoxTheme = `selectify_selection-box_${theme}-theme`;

        const screenReaderLabel = label ?? DEFAULT_SCREEN_READER_LABEL;
        const [liveText, setLiveText] = React.useState("");

        React.useEffect(() => {
            React.startTransition(() => {
                // Handle label
                if (wasDragActiveRef.current) {
                    setLiveText("Drag Selection Off");
                    return;
                }

                setLiveText(`${screenReaderLabel}: ${overlappedElementsCount} elements selected`);
                wasDragActiveRef.current = true;
            });

            return () => {
                wasDragActiveRef.current = false;
            };
        }, [overlappedElementsCount, screenReaderLabel]);

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
                className={props.className || selectionBoxTheme}
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
                <Label id={boxId}>{liveText}</Label>
            </div>
        ) : null;
    }
);

SelectBox.displayName = SELECT_BOX_NAME;

function promiseWrapper(promise: { default: React.ComponentType<any> }): Promise<{
    default: React.ComponentType<any>;
}> {
    return new Promise((resolve) => {
        resolve(promise);
    });
}

const LazySelectBox = React.lazy(() => promiseWrapper({ default: SelectBox }));

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
     * @defaultValue 40
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
    exclusionZone?: Element | Element[] | null;
    hideOnScroll?: boolean;
    theme?: Theme;
    lazyLoad?: boolean;
    disabled?: boolean;
    forceMount?: boolean;
    onSelect?(element: Element): void;
    onUnselect?(unselectedElement: Element): void;
    onDragStart?(e: PointerEvent): void | (() => void);
    onDragMove?(e: PointerEvent, selectedElements: Element[]): void;
    onDragEnd?(e?: PointerEvent, selectedElements?: Element[]): void;
    onEscapeKeyDown?(e: KeyboardEvent): void;
}

function useSelectify<T extends HTMLElement>(
    ref: React.RefObject<T | undefined | null>,
    options?: UseSelectProps
) {
    const {
        selectCriteria = DEFAULT_SELECT_CRITERIA,
        maxSelections = false,
        autoScroll = true,
        autoScrollEdgeDistance = 100,
        autoScrollStep = 40,
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

    const [startPoint, setStartPoint] = React.useState<PositionPoint>(NULL_OBJ);
    const [endPoint, setEndPoint] = React.useState<PositionPoint>(NULL_OBJ);
    const [isDragging, setIsDragging] = React.useState(false);
    const [selectedElements, setSelectedElements] = React.useState<Element[]>([]);
    const lastIntersectedElements = React.useRef<Element[]>([]);
    const intersectBoxRef = React.useRef<HTMLDivElement>(null);
    const selectionTimerRef = React.useRef(0);
    const scrollTimerRef = React.useRef(0);
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
            const lastElements = lastIntersectedElements.current;
            const difference = intersectionDifference.current;
            if (disableUnselection && elementsToSelect.length < lastElements.length) {
                return;
            }

            setSelectedElements(elementsToSelect);

            if (!lastElements || !difference) return;
            const hasSelected = elementsToSelect.length > lastElements.length;
            const hasUnselected = elementsToSelect.length < lastElements.length;

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
            matchCriteria: string;
        }) => {
            if (!scope) return;

            // Convert NodeList to Element[]
            // .slice() has more performance at scale
            const matchingElements = Array.prototype.slice.call(
                scope.querySelectorAll(matchCriteria)
            ) as Element[];

            const selectionBoxCanBeIncluded = matchCriteria === "*" || matchCriteria === "div";
            if (selectionBoxCanBeIncluded) {
                // Remove selection box from response
                return fastFilter((el) => el.id !== SELECT_BOX_IDENTIFIER, matchingElements);
            }

            return !maxSelections ? matchingElements : matchingElements.slice(0, maxSelections);
        },
        [maxSelections]
    );

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

    const getIntersectedElements = React.useCallback(
        (intersectionBox: Element | DOMRect, elementsToIntersect: readonly Element[]) => {
            const intersectionBoxRect =
                intersectionBox instanceof DOMRect
                    ? intersectionBox
                    : intersectionBox.getBoundingClientRect();
            const intersectedElements: Element[] = [];

            for (let i = elementsToIntersect.length - 1; i >= 0; i--) {
                const itemRect = elementsToIntersect[i].getBoundingClientRect();
                if (checkIntersection(intersectionBoxRect, itemRect)) {
                    intersectedElements.push(elementsToIntersect[i]);
                }
            }
            return intersectedElements;
        },
        [checkIntersection]
    );

    const handleAutomaticWindowScroll = React.useCallback(
        (event: PointerEvent) => {
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

            function adjustWindowScroll() {
                window.clearTimeout(scrollTimerRef.current);
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
                const currentScrollX = window.pageXOffset;
                const currentScrollY = window.pageYOffset;
                const canScrollUp = currentScrollY > 0;
                const canScrollDown = currentScrollY < maxScrollY;
                const canScrollLeft = currentScrollX > 0;
                const canScrollRight = currentScrollX < maxScrollX;
                let nextScrollX = currentScrollX;
                let nextScrollY = currentScrollY;
                const maxStep = autoScrollStep;

                // Check left and right
                if (isInLeftEdge && canScrollLeft) {
                    const intensity = (autoScrollEdgeDistance - viewportX) / autoScrollEdgeDistance;
                    nextScrollX = nextScrollX - maxStep * intensity;
                } else if (isInRightEdge && canScrollRight) {
                    const intensity = (viewportX - edgeRight) / autoScrollEdgeDistance;
                    nextScrollX = nextScrollX + maxStep * intensity;
                }

                // Check up and down
                if (isInTopEdge && canScrollUp) {
                    const intensity = (autoScrollEdgeDistance - viewportY) / autoScrollEdgeDistance;
                    nextScrollY = nextScrollY - maxStep * intensity;
                } else if (isInBottomEdge && canScrollDown) {
                    const intensity = (viewportY - edgeBottom) / autoScrollEdgeDistance;
                    nextScrollY = nextScrollY + maxStep * intensity;
                }

                // Filter invalid maximums
                nextScrollX = Math.max(0, Math.min(maxScrollX, nextScrollX));
                nextScrollY = Math.max(0, Math.min(maxScrollY, nextScrollY));

                if (nextScrollX !== currentScrollX || nextScrollY !== currentScrollY) {
                    window.scrollTo(nextScrollX, nextScrollY);
                    scrollTimerRef.current = window.setTimeout(adjustWindowScroll, 30);
                }
            }
            adjustWindowScroll();
        },
        [autoScrollEdgeDistance, autoScrollStep]
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
        () => calculateSelectionBox(startPoint, endPoint),
        [calculateSelectionBox, endPoint, startPoint]
    );

    const getIntersectionsDifference = React.useCallback((intersectedElements: Element[]) => {
        // Get symetric difference between last intersected elements
        // and latest intersected elements.
        return intersectedElements
            .filter((x) => !lastIntersectedElements.current.includes(x))
            .concat(
                lastIntersectedElements.current.filter((x) => !intersectedElements.includes(x))
            );
    }, []);

    const checkSelectionBoxIntersect = React.useCallback(() => {
        const parentNode = ref.current;
        const selectionBoxRef = intersectBoxRef.current;
        if (!parentNode || !selectionBoxRef || disabled) {
            return;
        }

        const matchingElements = findMatchingElements({
            scope: parentNode,
            matchCriteria: selectCriteria,
        });
        if (!matchingElements || matchingElements.length === 0) {
            return;
        }

        // Check intersection against every selectable element
        const intersectedElements = getIntersectedElements(selectionBoxRef, matchingElements);
        const difference = getIntersectionsDifference(intersectedElements);

        // Check if there's something to be selected and if so, select it
        if (difference.length > 0) {
            intersectionDifference.current = difference;
            if (shouldDelaySelect) handleDelayedSelectionEvent(intersectedElements);
            else handleSelectionEvent(intersectedElements);
        }
    }, [
        disabled,
        findMatchingElements,
        getIntersectionsDifference,
        getIntersectedElements,
        handleDelayedSelectionEvent,
        handleSelectionEvent,
        ref,
        selectCriteria,
        shouldDelaySelect,
    ]);

    const eventsCacheRef = React.useRef<PointerEvent[]>([]);
    const throttledRequestAnimationFrame = useCallbackRef(
        throttle(globalThis?.window?.requestAnimationFrame)
    );
    const isMultitouch = eventsCacheRef.current.length >= 2;

    const handleDrawRectUpdate = React.useCallback(
        (event: PointerEvent) => {
            // Disable on multitouch for pinch and other gestures
            if (disabled || isMultitouch) {
                return;
            }

            // Update last cache to current one
            const eventIndex = eventsCacheRef.current.findIndex(
                (cachedEv) => cachedEv.pointerId === event.pointerId
            );
            eventsCacheRef.current[eventIndex] = event;

            // Start drawing box
            setEndPoint({ x: event.pageX, y: event.pageY });

            if (!canSelectRef.current) {
                return;
            }

            if (!onlySelectOnDragEnd) {
                // Only throttle selection and not drawing to keep it fluid
                throttledRequestAnimationFrame(checkSelectionBoxIntersect);
            }

            if (autoScroll) {
                handleAutomaticWindowScroll(event);
            }

            triggerOnDragMove(event, lastIntersectedElements.current);
        },
        [
            autoScroll,
            checkSelectionBoxIntersect,
            disabled,
            handleAutomaticWindowScroll,
            isMultitouch,
            onlySelectOnDragEnd,
            throttledRequestAnimationFrame,
            triggerOnDragMove,
        ]
    );

    const cancelRectDraw = React.useCallback(() => {
        const parentNode = ref.current;
        if (!parentNode) return;
        parentNode.removeEventListener("pointermove", handleDrawRectUpdate, false);
        window.removeEventListener("scroll", cancelRectDraw);

        // Reset defaults
        setStartPoint(NULL_OBJ);
        setEndPoint(NULL_OBJ);
        setIsDragging(false);
        triggerOnDragEnd();
    }, [handleDrawRectUpdate, ref, triggerOnDragEnd]);

    const handleEscapeKeyCancel = React.useCallback(
        (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                cancelRectDraw();
                triggerOnEscapeKeyDown(event);
            }
            ownerDocument.removeEventListener("keydown", handleEscapeKeyCancel);
        },
        [cancelRectDraw, ownerDocument, triggerOnEscapeKeyDown]
    );

    const handleDrawRectEnd = React.useCallback(
        (event: PointerEvent) => {
            const parentNode = ref.current;
            if (disabled || !parentNode || IS_SERVER) {
                return;
            }

            if (onlySelectOnDragEnd && intersectionDifference.current.length > 0 && !isMultitouch) {
                checkSelectionBoxIntersect();
            }

            cancelRectDraw();
            ownerDocument.removeEventListener("keydown", handleEscapeKeyCancel);

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
            isMultitouch,
            onlySelectOnDragEnd,
            ownerDocument,
            ref,
            selectedElements,
            triggerOnDragEnd,
        ]
    );

    const handleDrawRectStart = React.useCallback(
        (event: PointerEvent) => {
            if (disabled || IS_SERVER) {
                return;
            }

            const parentNode = ref.current;
            const shouldActivate = event.button === 0 || event.button === 1 || event.isPrimary;
            const isModifierKey = event.altKey || event.ctrlKey || event.shiftKey || event.metaKey;
            const userKeyPressed = activateOnKey?.some((key) => event.getModifierState(key));

            if (!parentNode || !shouldActivate || isMultitouch) {
                return;
            }

            if (!activateOnMetaKey || (activateOnMetaKey && isModifierKey) || userKeyPressed) {
                // Prevent implicit pointer capture
                // https://www.w3.org/TR/pointerevents3/#implicit-pointer-capture
                const target = event.target as HTMLElement;
                if (target.hasPointerCapture(event.pointerId)) {
                    target.releasePointerCapture(event.pointerId);
                }

                const eventStartingPoint = { x: event.pageX, y: event.pageY };

                if (exclusionZone) {
                    const elements = getIntersectedElements(
                        new DOMRect(eventStartingPoint.x, eventStartingPoint.y, 1, 1),
                        [exclusionZone].flat()
                    );
                    if (elements.length > 0) return;
                }

                const userCallback = triggerOnDragStart(event);
                userCallback?.();

                if (event.defaultPrevented) {
                    console.warn("use-selectify: Event prevented, stopping execution.");
                    return;
                }

                setStartPoint(eventStartingPoint);
                setIsDragging(true);

                parentNode.addEventListener("pointermove", handleDrawRectUpdate, false);
                ownerDocument.addEventListener("keydown", handleEscapeKeyCancel);

                // Add event to cache
                eventsCacheRef.current.push(event);

                if (hideOnScroll) {
                    if (autoScroll) {
                        throw new Error(
                            "use-selectify: hideOnScroll & autoScroll are not compatible"
                        );
                    }

                    window.addEventListener("scroll", cancelRectDraw);
                }
            }
        },
        [
            activateOnKey,
            activateOnMetaKey,
            autoScroll,
            cancelRectDraw,
            disabled,
            exclusionZone,
            getIntersectedElements,
            handleDrawRectUpdate,
            handleEscapeKeyCancel,
            hideOnScroll,
            isMultitouch,
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
        intersectionDifference.current = getIntersectionsDifference([]);
        lastIntersectedElements.current = selectedElements;
        handleSelectionEvent([]);
    }, [getIntersectionsDifference, handleSelectionEvent, selectedElements]);

    const mutateSelections = React.useCallback(
        (update: ((lastSelected: readonly Element[]) => Element[]) | Element[]) => {
            const newSelection = update instanceof Function ? update(selectedElements) : update;
            intersectionDifference.current = getIntersectionsDifference(newSelection);
            handleSelectionEvent(newSelection);
        },
        [getIntersectionsDifference, handleSelectionEvent, selectedElements]
    );

    const getSelectableElements = React.useCallback(
        () => findMatchingElements({ scope: ref.current, matchCriteria: selectCriteria }),
        [findMatchingElements, ref, selectCriteria]
    );

    const resetEventsCache = useCallbackRef(() => (eventsCacheRef.current = []));

    useEventListener(ref.current, "pointerdown", handleDrawRectStart, true);
    useEventListener(ownerDocument, "pointercancel", cancelRectDraw, false);
    useEventListener(ownerDocument, "blur", cancelRectDraw, false);
    useEventListener(ownerDocument, "pointerup", handleDrawRectEnd, false);
    useEventListener(ownerDocument, "pointerleave", handleDrawRectEnd, false);
    useEventListener(globalThis?.window, "resize", resetEventsCache, false);

    useIsomorphicLayoutEffect(() => {
        // Prevent browser from trying to claim the pointermove event for panning on mobile
        // without this the selection box does not work properly when scroll is present
        function cancelBrowserTouchActionClaim() {
            const parentNode = ref.current;
            if (!parentNode || disabled) return;
            const lastStyle = parentNode.style.touchAction;
            parentNode.style.touchAction = "none";
            return () => {
                parentNode.style.touchAction = lastStyle;
            };
        }

        const revert = cancelBrowserTouchActionClaim();
        if (disabled) revert?.();

        return () => {
            revert?.();
        };
    }, [disabled, ref]);

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
        return () => forceRerender(0);
    }, [currRender]);

    const SelectBoxOutlet = React.memo((props: React.ComponentPropsWithoutRef<"div">) => {
        if (process.env.NODE_ENV === "development" && ref.current) {
            // In development we check that the outlet is an actual children of the ref container
            if (
                Array.isArray(ref.current.children) &&
                ref.current.children.some((el: Element) => el.id === SELECT_BOX_IDENTIFIER)
            ) {
                console.warn(`<SelectBoxOutlet> should be a direct children of your container ref <${ref.current.tagName}>.
                    Try moving it inside of the selection container.
                    `);
            }

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

        const selectBoxProps = {
            ...props,
            ref: intersectBoxRef,
            parentRef: ref,
            selectionBox: selectionBox,
            isDragging: isDragging,
            overlappedElementsCount: selectedElements.length + 1,
            theme: theme,
            label: label,
            forceMount: Boolean(forceMount),
            suppressHydrationWarning: true,
        };

        return lazyLoad ? (
            <React.Suspense>
                <LazySelectBox {...selectBoxProps} />
            </React.Suspense>
        ) : (
            <SelectBox {...selectBoxProps} />
        );
    });
    SelectBoxOutlet.displayName = SELECT_BOX_NAME;

    return {
        SelectBoxOutlet,
        selectedElements,
        isDragging,
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

export { SelectBox, useSelectify };
