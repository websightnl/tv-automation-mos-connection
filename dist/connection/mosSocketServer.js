"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const net_1 = require("net");
const events_1 = require("events");
const socketConnection_1 = require("./socketConnection");
class MosSocketServer extends events_1.EventEmitter {
    /** */
    constructor(port, description, debug) {
        super();
        this._debug = false;
        this._connectedSockets = [];
        this._port = port;
        this._portDescription = description;
        if (debug)
            this._debug = debug;
        this._socketServer = new net_1.Server();
        this._socketServer.on('connection', (socket) => this._onClientConnection(socket));
        this._socketServer.on('close', () => this._onServerClose());
        this._socketServer.on('error', (error) => this._onServerError(error));
    }
    dispose(sockets) {
        let closePromises = [];
        // close clients
        sockets.forEach(socket => {
            closePromises.push(new Promise((resolve) => {
                socket.on('close', resolve);
                socket.end();
                socket.destroy();
            }));
        });
        // close server
        closePromises.push(new Promise((resolve) => {
            // this._socketServer.on('close', resolve)
            this._socketServer.close(() => {
                resolve();
            });
        }));
        // close any server connections:
        this._connectedSockets.forEach((socket) => {
            socket.destroy();
        });
        return Promise.all(closePromises);
    }
    /** */
    listen() {
        if (this._debug)
            console.log('listen', this._portDescription, this._port);
        return new Promise((resolve, reject) => {
            try {
                if (this._debug)
                    console.log('inside promise', this._portDescription, this._port);
                // already listening
                if (this._socketServer.listening) {
                    if (this._debug)
                        console.log('already listening', this._portDescription, this._port);
                    resolve();
                    return;
                }
                // Listens and handles error and events
                this._socketServer.once('error', (e) => {
                    reject(e);
                });
                this._socketServer.once('close', () => {
                    reject(Error('Socket was closed'));
                });
                this._socketServer.once('listening', () => {
                    resolve();
                    this._socketServer.on('error', (e) => {
                        this.emit(socketConnection_1.SocketServerEvent.ERROR, e);
                    });
                    this._socketServer.on('close', () => {
                        this.emit(socketConnection_1.SocketServerEvent.CLOSE);
                    });
                });
                this._socketServer.listen(this._port);
            }
            catch (e) {
                reject(e);
            }
        });
    }
    setDebug(debug) {
        this._debug = debug;
    }
    get port() {
        return this._port;
    }
    get portDescription() {
        return this._portDescription;
    }
    /** */
    _onClientConnection(socket) {
        this._connectedSockets.push(socket);
        socket.on('close', () => {
            let i = this._connectedSockets.indexOf(socket);
            if (i !== -1) {
                this._connectedSockets.splice(i, 1);
            }
        });
        this.emit(socketConnection_1.SocketServerEvent.CLIENT_CONNECTED, {
            socket: socket,
            portDescription: this._portDescription
        });
    }
    /** */
    _onServerError(error) {
        // @todo: implement
        if (this._debug)
            console.log('Server error:', error);
    }
    /** */
    _onServerClose() {
        // @todo: implement
        if (this._debug)
            console.log(`Server closed: on port ${this._port}`);
    }
}
exports.MosSocketServer = MosSocketServer;
//# sourceMappingURL=mosSocketServer.js.map