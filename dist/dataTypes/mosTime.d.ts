export declare class MosTime {
    static _defaultTimezone: string;
    private _time;
    private _timezone;
    private _timezoneZuluIndicator;
    private _timezoneDeclaration;
    /** */
    constructor(timestamp?: Date | number | string);
    /** */
    toString(): string;
    /** */
    getTime(): number;
    /** */
    private _parseTimeOffset;
    /** */
    private _parseMosCustomFormat;
}
