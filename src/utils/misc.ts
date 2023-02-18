export function isNull(obj: Record<string, unknown>) {
    return Object.values(obj).some((value) => {
        if (value === null) {
            return true;
        }

        return false;
    });
}

export function fastFilter<T>(fn: (obj: T) => boolean, a: T[]) {
    const f = [];
    for (let i = 0; i < a.length; i++) {
        if (fn(a[i])) {
            f.push(a[i]);
        }
    }
    return f;
}
