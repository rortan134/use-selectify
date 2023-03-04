import { ComponentMeta, ComponentStory } from "@storybook/react";
import * as React from "react";

import { useSelectify, UseSelectProps } from "../useSelectify";
import SelectedCheckIcon from "./assets/check.svg";

const Template = (args: UseSelectProps) => {
    const containerRef = React.useRef(null);
    const exclusionZoneRef = React.useRef(null);
    const {
        SelectBoxOutlet,
        clearSelection,
        hasSelected,
        selectAll,
        selectedElements,
        mutateSelections,
    } = useSelectify(containerRef, {
        ...args,
        exclusionZone: exclusionZoneRef.current,
    });

    function toggleItemSelection(elementToSelect: HTMLElement | null | undefined) {
        if (!elementToSelect) return;

        // check if it isn't alredy selected
        if (!selectedElements.includes(elementToSelect)) {
            mutateSelections((prevSelections) => [...prevSelections, elementToSelect]);
        } else {
            // unselect
            mutateSelections((prevSelections) =>
                prevSelections.filter((element) => element !== elementToSelect)
            );
        }
    }

    return (
        <div ref={containerRef} className="table-container">
            <div className="table-content">
                <header className="table-header">
                    <div className="table-header-button">
                        <button
                            onClick={hasSelected ? clearSelection : selectAll}
                            data-active={!hasSelected}
                        >
                            -
                        </button>
                    </div>
                    <span>Type</span>
                    <span>Group</span>
                    <span>Serial.</span>
                    <span>Code</span>
                </header>

                <div className="table-list" ref={exclusionZoneRef}>
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="table-item">
                            <button
                                className="table-item-icon"
                                onClick={(e) =>
                                    toggleItemSelection(
                                        e.currentTarget.parentElement // here we're getting the .table-item element to select
                                    )
                                }
                            >
                                <img src={SelectedCheckIcon} />
                            </button>
                            <span>Articulated</span>
                            <span>Virtual Factory</span>
                            <span>KR-{i + 1 * 1234}</span>
                            <span>{(i + 200 * 4321).toFixed(0)}</span>
                        </div>
                    ))}
                </div>
            </div>
            <SelectBoxOutlet />
        </div>
    );
};

export const Basic = Template.bind({}) as ComponentStory<any>;
Basic.args = {
    selectCriteria: `.table-item`,
    onSelect: (el: Element) => {
        el.classList.add("table-item-active");
    },
    onUnselect: (el: Element) => {
        el.classList.remove("table-item-active");
    },
    onDragStart: () => {
        document.body.style.userSelect = "none";
    },
    onDragEnd: () => {
        document.body.style.userSelect = "auto";
    },
};

export const SecondTheme = Template.bind({}) as ComponentStory<any>;
SecondTheme.args = {
    selectCriteria: `.table-item`,
    theme: "outline",
    autoScroll: false,
    onSelect: (el: Element) => {
        el.classList.add("table-item-active");
    },
    onUnselect: (el: Element) => {
        el.classList.remove("table-item-active");
    },
};

export const FullInsersectionOnly = Template.bind({}) as ComponentStory<any>;
FullInsersectionOnly.args = {
    selectCriteria: `.table-item`,
    onlySelectOnFullOverlap: true,
    autoScroll: false,
    onSelect: (el: Element) => {
        el.classList.add("table-item-active");
    },
    onUnselect: (el: Element) => {
        el.classList.remove("table-item-active");
    },
};

export const OnMetaKeyOnly = Template.bind({}) as ComponentStory<any>;
OnMetaKeyOnly.args = {
    selectCriteria: `.table-item`,
    activateOnMetaKey: true,
    autoScroll: false,
    onSelect: (el: Element) => {
        el.classList.add("table-item-active");
    },
    onUnselect: (el: Element) => {
        el.classList.remove("table-item-active");
    },
};

export const OnlySelectOnDragEnd = Template.bind({}) as ComponentStory<any>;
OnlySelectOnDragEnd.args = {
    selectCriteria: `.table-item`,
    onlySelectOnDragEnd: true,
    onSelect: (el: Element) => {
        el.classList.add("table-item-active");
    },
    onUnselect: (el: Element) => {
        el.classList.remove("table-item-active");
    },
};

export const WithDelay = Template.bind({}) as ComponentStory<any>;
WithDelay.args = {
    selectCriteria: `.table-item`,
    selectionDelay: 1000,
    onSelect: (el: Element) => {
        el.classList.add("table-item-active");
    },
    onUnselect: (el: Element) => {
        el.classList.remove("table-item-active");
    },
};

export default {
    title: "Selectify",
    component: Template,
} as ComponentMeta<typeof Template>;
