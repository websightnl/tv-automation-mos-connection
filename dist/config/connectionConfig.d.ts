/** Config object for creating a MOS-device */
export interface IConnectionConfig {
    /** The ID of this mos-device */
    mosID: string;
    /** Whether this mosConnection accepts new connections from othe MOS clients */
    acceptsConnections: boolean;
    /** Only accept connections from this whitelist */
    accepsConnectionsFrom?: string[];
    /** A list of which profile this mos device is to support */
    profiles: IProfiles;
    /** Debugging-mode: logs raw mos-messages */
    debug?: boolean;
    /** Automatically create new mos-devices on-the-fly when receiving messages to unregistered MOS-ID:s */
    openRelay?: boolean;
    offspecFailover?: boolean;
}
/** */
export interface IProfiles {
    [key: string]: boolean | undefined;
    '0': boolean;
    '1'?: boolean;
    '2'?: boolean;
    '3'?: boolean;
    '4'?: boolean;
    '5'?: boolean;
    '6'?: boolean;
    '7'?: boolean;
}
export declare class ConnectionConfig implements IConnectionConfig {
    mosID: string;
    acceptsConnections: boolean;
    accepsConnectionsFrom: string[];
    debug: boolean;
    openRelay: boolean;
    offspecFailover: boolean;
    private _profiles;
    constructor(init: IConnectionConfig);
    /** */
    /** */
    profiles: IProfiles;
}
