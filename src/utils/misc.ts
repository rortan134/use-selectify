export function isNull(obj: Record<string, unknown>) {
    return Object.values(obj).some((value) => {
        if (value === null) {
            return true;
        }

        return false;
    });
}
