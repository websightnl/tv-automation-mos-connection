/// <reference types="node" />
import { ConnectionType } from './socketConnection';
import { MosSocketClient, CallBackFunction, QueueMessage } from '../connection/mosSocketClient';
import { MosMessage } from '../mosModel/MosMessage';
import { EventEmitter } from 'events';
export interface ClientDescription {
    heartbeatConnected: boolean;
    client: MosSocketClient;
    clientDescription: string;
}
export interface INCSServerConnection {
    on(event: 'rawMessage', listener: (type: string, message: string) => void): this;
}
export interface HandedOverQueue {
    messages: QueueMessage[];
    callbacks: {
        [messageId: string]: CallBackFunction;
    };
}
/** */
export declare class NCSServerConnection extends EventEmitter implements INCSServerConnection {
    private _connected;
    private _id;
    private _host;
    private _timeout;
    private _mosID;
    private _debug;
    private _disposed;
    private _clients;
    private _callbackOnConnectionChange;
    private _heartBeatsTimer;
    private _heartBeatsDelay;
    constructor(id: string, host: string, mosID: string, timeout?: number, debug?: boolean);
    createClient(clientID: string, port: number, clientDescription: ConnectionType): void;
    /** */
    removeClient(clientID: string): void;
    connect(): void;
    executeCommand(message: MosMessage): Promise<any>;
    onConnectionChange(cb: () => void): void;
    setDebug(debug: boolean): void;
    readonly connected: boolean;
    /** */
    readonly lowerPortClients: MosSocketClient[];
    /** */
    readonly upperPortClients: MosSocketClient[];
    /** */
    readonly queryPortClients: MosSocketClient[];
    readonly host: string;
    readonly id: string;
    handOverQueue(otherConnection: NCSServerConnection): void;
    receiveQueue(queue: {
        [clientId: string]: HandedOverQueue;
    }): void;
    dispose(): Promise<void>;
    private _sendHeartBeats;
}
