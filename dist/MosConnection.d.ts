/// <reference types="node" />
import { IConnectionConfig, IProfiles } from './config/connectionConfig';
import { IMosConnection, IMOSDeviceConnectionOptions } from './api';
import { MosDevice } from './MosDevice';
import { EventEmitter } from 'events';
export declare class MosConnection extends EventEmitter implements IMosConnection {
    static CONNECTION_PORT_LOWER: number;
    static CONNECTION_PORT_UPPER: number;
    static CONNECTION_PORT_QUERY: number;
    static _nextSocketID: number;
    private _conf;
    private _debug;
    private _lowerSocketServer?;
    private _upperSocketServer?;
    private _querySocketServer?;
    private _incomingSockets;
    private _ncsConnections;
    private _mosDevices;
    private _initialized;
    private _isListening;
    private _onconnection;
    /** */
    constructor(configOptions: IConnectionConfig);
    /**
     * Initiate the MosConnection, start accepting connections
     */
    init(): Promise<boolean>;
    /**
     * Establish a new connection to a MOS-device (NCS-server). When established, the new MOS-device will be emitted to this.onConnection()
     * @param connectionOptions Connection options
     */
    connect(connectionOptions: IMOSDeviceConnectionOptions): Promise<MosDevice>;
    /** Callback is called when a new connection is established */
    onConnection(cb: (mosDevice: MosDevice) => void): void;
    /** True if mosConnection is listening for connections */
    readonly isListening: boolean;
    /** TO BE IMPLEMENTED: True if mosConnection is mos-compliant */
    readonly isCompliant: boolean;
    /** True if mosConnection is configured to accept connections */
    readonly acceptsConnections: boolean;
    /** A list of the profiles mosConnection is currently configured to use */
    readonly profiles: IProfiles;
    /** Close all connections and clear all data */
    dispose(): Promise<void>;
    /** Return a specific MOS-device */
    getDevice(id: string): MosDevice;
    /** Get a list of all MOS-devices */
    getDevices(): Array<MosDevice>;
    disposeMosDevice(mosDevice: MosDevice): Promise<void>;
    disposeMosDevice(myMosID: string, theirMosId0: string, theirMosId1: string | null): Promise<void>;
    /** TO BE IMPLEMENTED */
    readonly complianceText: string;
    setDebug(debug: boolean): void;
    private _registerMosDevice;
    /** Set up TCP-server */
    private _initiateIncomingConnections;
    /** */
    private _registerIncomingClient;
    /** Close socket and clean up */
    private _disposeIncomingSocket;
    /** Get new unique id */
    private static readonly nextSocketID;
}
