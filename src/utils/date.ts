

function TodayDate() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");

    return `${yyyy}-${mm}-${dd}`
}

function ToWIBISOString(date?: Date) {
    if (!date) return undefined;
    const wibOffset = 7 * 60 * 60 * 1000 // UTC+7
    const local = new Date(date.getTime() + wibOffset)

    const pad = (n: number) => String(n).padStart(2, "0")

    return (
        `${local.getFullYear()}-` +
        `${pad(local.getMonth() + 1)}-` +
        `${pad(local.getDate())}T` +
        `${pad(local.getHours())}:` +
        `${pad(local.getMinutes())}:` +
        `${pad(local.getSeconds())}.` +
        `${local.getMilliseconds()}`
    )
}

export { TodayDate, ToWIBISOString }