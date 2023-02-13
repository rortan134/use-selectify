import { ComponentMeta } from "@storybook/react";
import * as React from "react";

import { useSelectify } from "./useSelectify";

export function Preview() {
    const containerRef = React.useRef(null);

    const { selectedElements, SelectBoxOutlet } = useSelectify(containerRef, {
        selectCriteria: `.select-this`,
        onSelect: (el) => {
            console.log("selected");
            el.classList.add("select-active");
        },
        onUnselect: (el) => {
            console.log("unselected");
            el.classList.remove("select-active");
        },
    });

    return (
        <div
            ref={containerRef}
            style={{
                width: "100%",
                minHeight: "100vh",
                position: "relative",
                margin: "2rem",
                padding: "4rem",
                gap: "0.5rem",
                display: "flex",
                userSelect: "none",
            }}
        >
            <div
                className="select-this"
                style={{
                    width: "300px",
                    height: "300px",
                    backgroundColor: "red",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    color: "#fff",
                }}
            >
                Box
            </div>
            <div
                className="select-this"
                style={{
                    width: "300px",
                    height: "300px",
                    backgroundColor: "red",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    color: "#fff",
                }}
            >
                Box
            </div>
            <div
                className="select-this"
                style={{
                    width: "300px",
                    height: "300px",
                    backgroundColor: "red",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    color: "#fff",
                }}
            >
                Box
            </div>
            <SelectBoxOutlet />
        </div>
    );
}

export default {
    title: "Selectify",
    component: Preview,
} as ComponentMeta<typeof Preview>;
