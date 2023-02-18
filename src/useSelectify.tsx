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

/* -------------------------------------------------------------------------------------------------
 * Select Box Component
 * -----------------------------------------------------------------------------------------------*/

const SELECT_BOX_NAME = "SelectBoxOutlet";
const DEFAULT_SCREEN_READER_LABEL = "Drag Selection";

export type Theme = "default" | "outline";

interface SelectifyComponentProps extends React.ComponentPropsWithoutRef<"div"> {
    selectionBox: BoxBoundingPosition | null;
    isDragging: boolean;
    overlappedElementsCount: number;
    label: string | undefined;
    theme: Theme | undefined;
    forceMount: boolean;
}

const SELECT_BOX_IDENTIFIER = "selectify-selection-box-wrapper";

const SelectBox = React.forwardRef<HTMLDivElement, SelectifyComponentProps>(
    (props: SelectifyComponentProps, forwardedRef) => {
        const {
            style,
            label,
            theme = "default",
            selectionBox,
            isDragging,
            overlappedElementsCount,
            forceMount,
            id: _,
            ...selectBoxProps
        } = props;

        const wasDragActive = React.useRef(false);
        const selectionBoxTheme = `selectify_selection-box_${theme}-theme`;

        const screenReaderLabel = label ?? DEFAULT_SCREEN_READER_LABEL;
        const [liveText, setLiveText] = React.useState("");

        React.useEffect(() => {
            React.startTransition(() => {
                // Handle label
                if (wasDragActive.current) {
                    setLiveText("Drag Selection Off");
                    return;
                }

                setLiveText(`${screenReaderLabel}: ${overlappedElementsCount} elements selected`);
                wasDragActive.current = true;
            });

            return () => {
                wasDragActive.current = false;
            };
        }, [overlappedElementsCount, screenReaderLabel]);

        return isDragging && !forceMount ? (
            <div
                {...selectBoxProps}
                ref={forwardedRef}
                id={SELECT_BOX_IDENTIFIER}
                role="region"
                aria-labelledby="selectify-selection-box"
                className={selectionBoxTheme}
                style={{ position: "absolute", zIndex: "9999", ...selectionBox, ...style }}
            >
                <span
                    id="selectify-selection-box"
                    aria-live={isDragging ? "assertive" : "off"}
                    style={{
                        position: "absolute",
                        width: "1px",
                        height: "1px",
                        padding: "0",
                        margin: "-1px",
                        overflow: "hidden",
                        clip: "rect(0, 0, 0, 0)",
                        whiteSpace: "nowrap",
                        borderWidth: "0",
                    }}
                >
                    {liveText}
                </span>
            </div>
        ) : null;
    }
);

SelectBox.displayName = SELECT_BOX_NAME;

/* -------------------------------------------------------------------------------------------------
 * Selectify Hook
 * -----------------------------------------------------------------------------------------------*/

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
    autoScrollStep: number;
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
    selectCriteria?: string | undefined;
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
    hideOnScroll?: boolean;
    theme?: Theme | undefined;
    disabled?: boolean;
    forceMount?: boolean;
    onSelect?(element: Element): void;
    onUnselect?(unselectedElement: Element): void;
    onDragStart?(e: PointerEvent): void;
    onDragMove?(e: PointerEvent, selectedElements: Element[]): void;
    onDragEnd?(e: PointerEvent, selectedElements: Element[]): void;
    onEscapeKeyDown?(e: KeyboardEvent): void;
}

function useSelectify<T extends HTMLElement>(
    ref: React.RefObject<T | undefined | null>,
    options?: UseSelectProps
) {
    const {
        selectCriteria = "*",
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
        selectionDelay,
        label,
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
    const shouldDelaySelect = selectionDelay && selectionDelay > 0;

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

    const handleSelect = React.useCallback(
        (elementsToSelect: Element[]) => {
            window?.clearTimeout(selectionTimerRef.current);
            select(elementsToSelect);
        },
        [select]
    );

    const handleDelayedSelect = React.useCallback(
        (elementsToSelect: Element[]) => {
            window?.clearTimeout(selectionTimerRef.current);
            selectionTimerRef.current = window?.setTimeout(() => {
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

            const matchingElements = Array.prototype.slice.call(
                scope.querySelectorAll(matchCriteria)
            ) as Element[];

            const selectionBoxCanBeIncluded = matchCriteria === "*" || matchCriteria === "div";
            if (selectionBoxCanBeIncluded) {
                // remove selection box from response
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
        (intersectionBox: Element, elementsToIntersect: readonly Element[]) => {
            return elementsToIntersect.flatMap(
                (item) =>
                    checkIntersection(
                        intersectionBox.getBoundingClientRect(),
                        item.getBoundingClientRect()
                    )
                        ? item
                        : [] // placeholder array, will be removed after .flatMap
            );
        },
        [checkIntersection]
    );

    // ToDo: refactor this
    const handleAutomaticWindowScroll = React.useCallback(
        (event: PointerEvent) => {
            const viewportX = event.clientX;
            const viewportY = event.clientY;
            const viewportWidth = document.documentElement.clientWidth;
            const viewportHeight = document.documentElement.clientHeight;

            const edgeTop = autoScrollEdgeDistance;
            const edgeLeft = autoScrollEdgeDistance;
            const edgeBottom = viewportHeight - autoScrollEdgeDistance;
            const edgeRight = viewportWidth - autoScrollEdgeDistance;
            const isInLeftEdge = viewportX < edgeLeft;
            const isInRightEdge = viewportX > edgeRight;
            const isInTopEdge = viewportY < edgeTop;
            const isInBottomEdge = viewportY > edgeBottom;

            // stop if the mouse is not in the viewport edge
            if (!(isInLeftEdge || isInRightEdge || isInTopEdge || isInBottomEdge)) {
                window?.clearTimeout(scrollTimerRef.current);
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

            const adjustWindowScroll = () => {
                const currentScrollX = window?.pageXOffset;
                const currentScrollY = window?.pageYOffset;
                const canScrollUp = currentScrollY > 0;
                const canScrollDown = currentScrollY < maxScrollY;
                const canScrollLeft = currentScrollX > 0;
                const canScrollRight = currentScrollX < maxScrollX;
                let nextScrollX = currentScrollX;
                let nextScrollY = currentScrollY;
                const maxStep = autoScrollStep;

                if (isInLeftEdge && canScrollLeft) {
                    const intensity = (edgeLeft - viewportX) / autoScrollEdgeDistance;
                    nextScrollX = nextScrollX - maxStep * intensity;
                } else if (isInRightEdge && canScrollRight) {
                    const intensity = (viewportX - edgeRight) / autoScrollEdgeDistance;
                    nextScrollX = nextScrollX + maxStep * intensity;
                }
                if (isInTopEdge && canScrollUp) {
                    const intensity = (edgeTop - viewportY) / autoScrollEdgeDistance;
                    nextScrollY = nextScrollY - maxStep * intensity;
                } else if (isInBottomEdge && canScrollDown) {
                    const intensity = (viewportY - edgeBottom) / autoScrollEdgeDistance;
                    nextScrollY = nextScrollY + maxStep * intensity;
                }

                // Filter invalid maximums
                nextScrollX = Math.max(0, Math.min(maxScrollX, nextScrollX));
                nextScrollY = Math.max(0, Math.min(maxScrollY, nextScrollY));

                if (nextScrollX !== currentScrollX || nextScrollY !== currentScrollY) {
                    window?.scrollTo(nextScrollX, nextScrollY);
                    return true;
                } else {
                    return false;
                }
            };

            (function checkForWindowScroll() {
                clearTimeout(scrollTimerRef.current);

                if (adjustWindowScroll()) {
                    scrollTimerRef.current = window?.setTimeout(checkForWindowScroll, 30);
                }
            })();
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

    const handleDrawRect = React.useCallback(
        (event: PointerEvent) => {
            event.preventDefault();
            const parentNode = ref.current;
            const selectionBoxRef = intersectBoxRef.current;
            if (!parentNode || !selectionBoxRef) {
                return;
            }

            setEndPoint({ x: event.pageX, y: event.pageY });

            // Initiate element selection process
            const matchingElements = findMatchingElements({
                scope: ref.current,
                matchCriteria: selectCriteria,
            });
            if (!canSelectRef.current || !matchingElements || matchingElements.length === 0) {
                return;
            }

            const intersectedElements = getIntersectedElements(selectionBoxRef, matchingElements);

            // Get symetric difference between last intersected elements
            // and latest intersected elements.
            const difference = intersectedElements
                .filter((x) => !lastIntersectedElements.current.includes(x))
                .concat(
                    lastIntersectedElements.current.filter((x) => !intersectedElements.includes(x))
                );

            // Check if there's something to be selected
            if (difference.length > 0) {
                intersectionDifference.current = difference;
                if (!onlySelectOnDragEnd) {
                    if (shouldDelaySelect) handleDelayedSelect(intersectedElements);
                    else handleSelect(intersectedElements);
                }
            }

            if (autoScroll) {
                handleAutomaticWindowScroll(event);
            }

            triggerOnDragMove(event, intersectedElements);
        },
        [
            autoScroll,
            findMatchingElements,
            getIntersectedElements,
            handleAutomaticWindowScroll,
            handleDelayedSelect,
            handleSelect,
            onlySelectOnDragEnd,
            ref,
            selectCriteria,
            shouldDelaySelect,
            triggerOnDragMove,
        ]
    );

    const cancelRectDraw = React.useCallback(() => {
        const parentNode = ref.current;
        if (!parentNode) return;
        parentNode.removeEventListener("pointermove", handleDrawRect);

        // reset defaults
        setStartPoint(NULL_OBJ);
        setEndPoint(NULL_OBJ);
        setIsDragging(false);
    }, [handleDrawRect, ref]);

    const handleEscapeKeyCancel = React.useCallback(
        (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                cancelRectDraw();
                triggerOnEscapeKeyDown(event);
            }
            document.removeEventListener("keydown", handleEscapeKeyCancel);
        },
        [cancelRectDraw, triggerOnEscapeKeyDown]
    );

    const handleDrawRectEnd = React.useCallback(
        (event?: PointerEvent) => {
            const parentNode = ref.current;
            if (disabled || !parentNode) return;

            if (onlySelectOnDragEnd && intersectionDifference.current.length > 0) {
                const selectionBoxRef = intersectBoxRef.current;
                const matchingElements = findMatchingElements({
                    scope: ref.current,
                    matchCriteria: selectCriteria,
                });

                if (!selectionBoxRef || !matchingElements || matchingElements.length === 0) {
                    return;
                }

                const intersectedElements = getIntersectedElements(
                    selectionBoxRef,
                    matchingElements
                );

                if (shouldDelaySelect) handleDelayedSelect(intersectedElements);
                else handleSelect(intersectedElements);
            }

            cancelRectDraw();
            document.removeEventListener("pointerup", handleDrawRectEnd);
            document.removeEventListener("pointerleave", handleDrawRectEnd);
            document.removeEventListener("keydown", handleEscapeKeyCancel);
            window.removeEventListener("scroll", cancelRectDraw);

            if (event) triggerOnDragEnd(event, selectedElements);
        },
        [
            cancelRectDraw,
            disabled,
            findMatchingElements,
            getIntersectedElements,
            handleDelayedSelect,
            handleEscapeKeyCancel,
            handleSelect,
            onlySelectOnDragEnd,
            ref,
            selectCriteria,
            selectedElements,
            shouldDelaySelect,
            triggerOnDragEnd,
        ]
    );

    const handleDrawRectStart = React.useCallback(
        (event: PointerEvent) => {
            const parentNode = ref.current;
            const shouldActivate = event.button === 0 || event.button === 1;
            const isMetaKey = event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;
            const userKeyPressed = activateOnKey?.some((key) => event.getModifierState(key));

            if (disabled || !parentNode || !shouldActivate) {
                return;
            }

            if (!activateOnMetaKey || (activateOnMetaKey && isMetaKey) || userKeyPressed) {
                setStartPoint({ x: event.pageX, y: event.pageY });
                setIsDragging(true);
                triggerOnDragStart(event);

                parentNode.addEventListener("pointermove", handleDrawRect);
                document.addEventListener("keydown", handleEscapeKeyCancel);

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
            handleDrawRect,
            handleEscapeKeyCancel,
            hideOnScroll,
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

        // force selection events
        intersectionDifference.current = allElements;

        handleSelect(allElements);
    }, [findMatchingElements, handleSelect, ref, selectCriteria]);

    const clearSelection = React.useCallback(() => {
        // force unselection events
        lastIntersectedElements.current = selectedElements;
        intersectionDifference.current = selectedElements;
        // wipe selections
        handleSelect([]);
    }, [handleSelect, selectedElements]);

    const mutateSelections = React.useCallback(
        (update: (lastSelected: readonly Element[]) => Element[]) => {
            const newSelection = update(lastIntersectedElements.current);
            intersectionDifference.current = newSelection;
            handleSelect(newSelection);
        },
        [handleSelect]
    );

    React.useEffect(() => {
        // cleanup
        return () => {
            window?.clearTimeout(selectionTimerRef.current);
        };
    }, []);

    useEventListener(ref.current || document, "pointerdown", handleDrawRectStart, true);
    // add listeners to document for better UX
    useEventListener(document, "pointerup", handleDrawRectEnd, false);
    useEventListener(document, "pointerleave", handleDrawRectEnd, false);

    const SelectBoxOutlet = React.memo((props: React.ComponentPropsWithoutRef<"div">) => {
        if (disabled) {
            return null;
        }

        return (
            <SelectBox
                {...props}
                ref={intersectBoxRef}
                selectionBox={selectionBox}
                isDragging={isDragging}
                overlappedElementsCount={selectedElements.length + 1}
                theme={theme}
                label={label}
                forceMount={Boolean(forceMount)}
            />
        );
    });
    SelectBoxOutlet.displayName = SELECT_BOX_NAME;

    return {
        SelectBoxOutlet,
        selectedElements,
        isDragging,
        hasSelected,
        selectionBox,
        selectAll,
        clearSelection,
        mutateSelections,
        cancelSelectionBox: handleDrawRectEnd,
        options,
    };
}

export { SelectBox, useSelectify };
