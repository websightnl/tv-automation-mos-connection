/// <reference types="node" />
import { Socket } from 'net';
import { EventEmitter } from 'events';
import { IncomingConnectionType } from './socketConnection';
export declare class MosSocketServer extends EventEmitter {
    private _port;
    private _portDescription;
    private _socketServer;
    private _debug;
    private _connectedSockets;
    /** */
    constructor(port: number, description: IncomingConnectionType, debug?: boolean);
    dispose(sockets: Socket[]): Promise<void[]>;
    /** */
    listen(): Promise<void>;
    setDebug(debug: boolean): void;
    readonly port: number;
    readonly portDescription: IncomingConnectionType;
    /** */
    private _onClientConnection;
    /** */
    private _onServerError;
    /** */
    private _onServerClose;
}
