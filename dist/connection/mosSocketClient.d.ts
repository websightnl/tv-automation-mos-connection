/// <reference types="node" />
import { EventEmitter } from 'events';
import { MosMessage } from '../mosModel/MosMessage';
import { HandedOverQueue } from './NCSServerConnection';
export declare type CallBackFunction = (err: any, data: object) => void;
export interface QueueMessage {
    time: number;
    msg: MosMessage;
}
export declare class MosSocketClient extends EventEmitter {
    private _host;
    private _port;
    private _autoReconnect;
    private _reconnectDelay;
    private _reconnectAttempts;
    private _debug;
    private _description;
    private _client;
    private _shouldBeConnected;
    private _connected;
    private _lastConnectionAttempt;
    private _reconnectAttempt;
    private _connectionAttemptTimer;
    private _commandTimeoutTimer;
    private _commandTimeout;
    private _queueCallback;
    private _lingeringCallback;
    private _queueMessages;
    private _sentMessage;
    private _lingeringMessage;
    private processQueueTimeout;
    private _startingUp;
    private dataChunks;
    /** */
    constructor(host: string, port: number, description: string, timeout?: number, debug?: boolean);
    /** */
    autoReconnect: boolean;
    /** */
    autoReconnectInterval: number;
    /** */
    autoReconnectAttempts: number;
    /** */
    connect(): void;
    /** */
    disconnect(): void;
    queueCommand(message: MosMessage, cb: CallBackFunction, time?: number): void;
    processQueue(): void;
    handOverQueue(): HandedOverQueue;
    /** */
    readonly host: string;
    /** */
    readonly port: number;
    /** */
    dispose(): void;
    /**
     * convenience wrapper to expose all logging calls to parent object
     */
    log(args: any): void;
    setDebug(debug: boolean): void;
    /** */
    /** */
    private connected;
    private _sendReply;
    /** */
    private executeCommand;
    /** */
    private _autoReconnectionAttempt;
    /** */
    private _clearConnectionAttemptTimer;
    /** */
    /** */
    private _onConnected;
    /** */
    private _onData;
    /** */
    private _onError;
    /** */
    private _onClose;
    private _triggerQueueCleanup;
}
