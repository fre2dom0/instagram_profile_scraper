export const giveLocalTime = (): string => {
    return new Date().toLocaleString('sv-SE', {
        timeZone: 'Europe/Istanbul',
    });
};

export const convertTimestampToLocale = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString('sv-SE', {
        timeZone: 'Europe/Istanbul',
    });
};
