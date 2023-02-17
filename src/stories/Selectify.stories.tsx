import "./story.css";

import { ComponentMeta, ComponentStory } from "@storybook/react";
import * as React from "react";

import { useSelectify, UseSelectProps } from "../useSelectify";
import SelectedCheckIcon from "./assets/check.svg";

const Template = (args: UseSelectProps) => {
    const containerRef = React.useRef(null);

    const { SelectBoxOutlet, clearSelection, hasSelected, selectAll } = useSelectify(containerRef, {
        ...args,
    });

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

                <div className="table-list">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="table-item">
                            <div className="table-item-icon">
                                <img src={SelectedCheckIcon} />
                            </div>
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
    autoScroll: false,
    onSelect: (el: Element) => {
        el.classList.add("table-item-active");
    },
    onUnselect: (el: Element) => {
        el.classList.remove("table-item-active");
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

export const AutoScroll = Template.bind({}) as ComponentStory<any>;
AutoScroll.args = {
    selectCriteria: `.table-item`,
    autoScroll: true,
    onSelect: (el: Element) => {
        el.classList.add("table-item-active");
    },
    onUnselect: (el: Element) => {
        el.classList.remove("table-item-active");
    },
};

export const onlySelectOnDragEnd = Template.bind({}) as ComponentStory<any>;
onlySelectOnDragEnd.args = {
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
