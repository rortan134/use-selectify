import * as React from "react";

/**
 * Use previous state
 */

export default function useLast<T>(lastValue: T) {
    const [last, setLast] = React.useState(lastValue);

    React.useEffect(() => {
        setLast(lastValue);
    }, [lastValue]);

    return last;
}