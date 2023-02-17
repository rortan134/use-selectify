[useSelectify](/.github/assets/use-selectify-banner.png)

<h1 align="center">use-selectify</h1>

<p align="center">The ultimate drag-to-select solution for React. Designed to be fast; Built to be accessible.</p>
<p align="center">
  <a href="https://www.npmjs.com/package/use-selectify">
    <img alt="NPM Version" src="https://badgen.net/npm/v/use-selectify" />
  </a>
  <a href="https://www.npmjs.com/package/use-selectify">
    <img alt="Types Included" src="https://badgen.net/npm/types/use-selectify" />
  </a>
  <a href="https://bundlephobia.com/result?p=use-selectify">
    <img alt="Minizipped Size" src="https://img.shields.io/bundlephobia/minzip/use-selectify" />
  </a>
  <a href="https://github.com/rortan134/use-selectify/blob/main/LICENSE">
    <img alt="Apache-2.0 License" src="https://badgen.net/github/license/rortan134/use-selectify" />
  </a>
  <a href="https://www.npmjs.com/package/use-selectify">
    <img alt="NPM Downloads" src="https://badgen.net/npm/dm/use-selectify" />
  </a>
  <a href="https://twitter.com/meetgilberto">
    <img alt="Follow @meetgilberto on Twitter" src="https://img.shields.io/twitter/follow/meetgilberto.svg?style=social&label=Follow" />
  </a>
</p>

<br />

## Introduction

Drag interactions are one of the most challenging aspects of the web. Having full control of the exact behavior of those interactions is essential, yet most available libraries out there feel like they are still not up to the task.

Created out of need, `use-selectify` is a robust React element selection library that aims to address those issues and provide a powerful starting point for drag interactions while still being an accessible approach to managing both visual and logical selection of elements in a React application with a hook.

## Features

✅ Automatic AutoScroll

✅ Lightweight and Flexible

✅ Accessible by Default

✅ Fine-Grained Control: 100% Customizable

✅ Simple to Style

✅ Mobile Friendly

✅ SSR Support

## Demo

🚧 Work in progress.

You can check our [Storybook](https://github.com/rortan134/use-selectify/#development) in the meantime.

## Installation

```sh
$ npm i use-selectify
or
$ yarn add use-selectify
```

## Getting Started

```tsx
import * as React from "react";
import { useSelectify } from "use-selectify";

export default function App() {
    const selectionContainerRef = React.useRef(null);
    const { SelectBoxOutlet } = useSelectify(selectionContainerRef, {
        onSelect: (element) => {
            console.log(`selected ${element}`);
            element.innerHTML = "Foo bar";
        },
    });

    return (
        <div ref={selectionContainerRef} style={{ position: "relative" }}>
            <div>I can be selected!</div>
            <SelectBoxOutlet />
        </div>
    );
}
```

By default every element inside the `selectionContainerRef` is a selectable element. To modify this behavior simply specify a selection criteria using [CSS Selectors](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors):

```tsx
import * as React from "react";
import { useSelectify } from "use-selectify";

export default function App() {
    const selectionContainerRef = React.useRef(null);
    const { SelectBoxOutlet } = useSelectify(selectionContainerRef, {
        selectCriteria: ".select-this", // will only select elements with the "select-this" class
        onSelect: (element) => {
            console.log(`selected ${element}`);
            element.innerHTML = "Foo bar";
        },
    });

    return (
        <div ref={selectionContainerRef} style={{ position: "relative" }}>
            <div class="select-this">Hello World</div>
            <div>I won't be selected</div>
            <SelectBoxOutlet />
        </div>
    );
}
```

<details>
<summary>Readability Tip</summary>

You can specify the callback function outside of the hook for further customization:

```tsx
const handleSelection = (el: Element) => {
    console.log(`selected ${element}`);
    element.innerHTML = "Bar";
    // ...
};

const handleUnselection = (el: Element) => {
    console.log(`unselected ${element}`);
    element.innerHTML = "Foo";
    // ...
};

const { SelectBoxOutlet } = useSelectify(selectionContainerRef, {
    selectCriteria: ".select-this",
    onSelect: handleSelection,
    onUnselect: handleUnselection,
});
```

</details>

### Styling

By default the selection box comes with some styling. You can override the className prop and specify how you want your selection box to look through the Outlet Component.

TailwindCSS and [cva](https://github.com/joe-bell/cva) is a powerful combination for reactive styling.

> For the absolute positioning to work properly on the selection box, the parent element of the outlet should always be relative: `position: relative;`

```tsx
<div ref={selectionContainerRef} style={{ position: "relative" }}>
    // ...
    <SelectBoxOutlet className="foo-bar" />
</div>
```

Available default themes: `default` | `outline`

## Advanced usage

### Mapping reactive components without a callback

```tsx
import * as React from "react";
import { useSelectify } from "use-selectify";

const users = [
    {
        id: 1,
        name: "foo",
        role: "admin",
    },
    {
        id: 1,
        name: "bar",
        role: "editor",
    },
    {
        id: 1,
        name: "foo-bar",
        role: "author",
    },
    {
        id: 1,
        name: "bar-foo",
        role: "author",
    },
];

const ListItem = ({
    username,
    selectedElements,
}: {
    username: string;
    selectedElements: Element[];
}) => {
    const itemRef = React.useRef(null);
    const isSelected = selectedElements.includes(itemRef.current);

    return (
        <li ref={itemRef} className={isSelected ? "list-item-active" : ""}>
            {user}
        </li>
    );
};

export const List = ({ children }: { children: React.ReactNode }) => {
    const containerRef = React.useRef(null);
    const { selectedElements, SelectBoxOutlet } = useSelectify(selectionContainerRef);

    return (
        <div ref={containerRef} className="container">
            <ul className="list">
                {users.map((user) => (
                    <ListItem username={user.name} selectedElements={selectedElements} />
                ))}
            </ul>
            <SelectBoxOutlet />
        </div>
    );
};
```

<details>
<summary>
Handle unselecting elements on click
</summary>

Work in progress...

</details>

<details>
<summary>
Disabling mobile selection
</summary>

Work in progress...

</details>

<details>
<summary>
Drawing your own selection box
</summary>

<!-- Styled Components, Stitches, etc. -->

Work in progress...

</details>

<details>
<summary>
Combining drag selection with pan & zoom
</summary>

Work in progress...

</details>

## Options

| Prop                    | Type                                                   | Default          | Description                                                                                                                                             |
| ----------------------- | ------------------------------------------------------ | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| maxSelections           | number \| false                                        | -                | Maximum number of elements that can be selected. Will stop selecting after reaching that number and keep already selected elements.                     |
| autoScroll              | boolean                                                | true             | Automatically try to scroll the window when the pointer approaches the viewport edge while dragging.                                                    |
| autoScrollEdgeDistance  | number                                                 | 100              | Distance in px from the viewport's edges from which the box will try scrolling the window when the pointer approaches the viewport edge while dragging. |
| autoScrollStep          | number                                                 | 40               | Auto scroll speed.                                                                                                                                      |
| disableUnselection      | boolean                                                | false            | Will keep every item selected after selection. Can be cleared with clearSelection().                                                                    |
| selectCriteria          | string \| undefined                                    | "\*"             | The specific CSS Selector criteria to match for selecting elements.                                                                                     |
| onlySelectOnFullOverlap | boolean                                                | false            | Will only select the element if the full rect intersects.                                                                                               |
| onlySelectOnDragEnd     | boolean                                                | false            | Will only select elements after user has stopped dragging or cursor has left the screen.                                                                |
| selectionDelay          | number                                                 | 0                | Specify a delay in miliseconds before elements are selected, to prevent accidental selection.                                                           |
| label                   | string                                                 | "Drag Selection" | Accessible label for screen readers.                                                                                                                    |
| selectionTolerance      | number                                                 | 0                | Distance in px from which elements can be selected even if selection box is not visually intersecting.                                                  |
| activateOnMetaKey       | boolean                                                | false            | Only enables the selection box if the user was pressing a meta key while initiating the drag. Included Meta keys are: Shift, Ctrl, Cmd and Alt.         |
| activateOnKey           | string[]                                               | []               | Only enables the selection box if the user was pressing a specified key while initiating the drag.                                                      |
| theme                   | Theme \| undefined                                     | -                | Theme options for the selection box appearance.                                                                                                         |
| disabled                | boolean                                                | false            | Disables the selection box interaction & dragging.                                                                                                      |
| forceMount              | boolean                                                | false            | Forces the mounting of the selection box on initialization.                                                                                             |
| onSelect                | (element: Element) => void                             | -                | Callback function when an element is selected.                                                                                                          |
| onUnselect              | (unselectedElement: Element) => void                   | -                | Callback function when an element is unselected.                                                                                                        |
| onDragStart             | (e: PointerEvent) => void                              | -                | Callback function when drag starts.                                                                                                                     |
| onDragMove              | (e: PointerEvent, selectedElements: Element[]) => void | -                | Callback function when dragging.                                                                                                                        |
| onDragEnd               | (e: PointerEvent, selectedElements: Element[]) => void | -                | Callback function when drag ends.                                                                                                                       |
| onEscapeKeyDown         | (e: KeyboardEvent) => void                             | -                | Callback function when escape key is pressed.                                                                                                           |

## Accessibility (optional)

To ensure that drag interactions are accessible, we must consider the following aspects:

1. Add ARIA attributes: To indicate to assistive technology users that the elements are available for selection, we can use an aria-label to each selectable element. This label should be descriptive and informative, indicating either the purpose of selecting that element or how to select it for screen readers. Additionally, we can use the aria-selected attribute to indicate when elements are selected:

```tsx
const { SelectBoxOutlet } = useSelectify(selectionContainerRef, {
    onSelect: (el) => {
        el.setAttribute("aria-selected", "true");
    },
});
// ...
```

2. Make elements focusable: To ensure that keyboard-only users can access and select the elements, ensure that every selectable element is also focusable. This means either adding a tabindex attribute to the element and setting it to 0 or using an element that is focusable by default.

3. Arrow navigation: Make sure every selectable element can also be selected using the arrow keys.

> Tip: By default, user-select is enabled for all elements, which means the user can select text or elements by dragging the cursor over them, to prevent accidental text selection, Disable user-select on the parent container of the selection box

```css
-webkit-user-select: none; /* Safari */
-ms-user-select: none; /* IE 10+ */
user-select: none;
```

## Development

1. Clone the repo into a public GitHub repository (or fork <https://github.com/rortan134/use-selectify/fork>).

    ```sh
    git clone https://github.com/rortan134/use-selectify.git
    ```

2. Go to the project folder

    ```sh
    cd use-selectify
    ```

3. Install packages with yarn

    ```sh
    yarn
    ```

4. Start the Storybook preview

    ```sh
    yarn storybook
    ```

## License

Distributed under the MIT License. See LICENSE for more information.
