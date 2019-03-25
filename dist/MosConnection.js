"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const connectionConfig_1 = require("./config/connectionConfig");
const mosSocketServer_1 = require("./connection/mosSocketServer");
const api_1 = require("./api");
const MosDevice_1 = require("./MosDevice");
const socketConnection_1 = require("./connection/socketConnection");
const NCSServerConnection_1 = require("./connection/NCSServerConnection");
const Utils_1 = require("./utils/Utils");
const MosMessage_1 = require("./mosModel/MosMessage");
const mosModel_1 = require("./mosModel");
const mosString128_1 = require("./dataTypes/mosString128");
const events_1 = require("events");
const iconv = require('iconv-lite');
class MosConnection extends events_1.EventEmitter {
    /** */
    constructor(configOptions) {
        super();
        this._debug = false;
        this._incomingSockets = {};
        this._ncsConnections = {};
        this._mosDevices = {};
        this._initialized = false;
        this._isListening = false;
        this._conf = new connectionConfig_1.ConnectionConfig(configOptions);
        if (this._conf.debug) {
            this._debug = this._conf.debug;
        }
    }
    /**
     * Initiate the MosConnection, start accepting connections
     */
    init() {
        this._initialized = true;
        if (this._conf.acceptsConnections) {
            return new Promise((resolve, reject) => {
                this._initiateIncomingConnections()
                    .then(() => {
                    this._isListening = true;
                    resolve(true);
                })
                    .catch((err) => {
                    // this.emit('error', err)
                    reject(err);
                });
            });
        }
        return Promise.resolve(false);
    }
    /**
     * Establish a new connection to a MOS-device (NCS-server). When established, the new MOS-device will be emitted to this.onConnection()
     * @param connectionOptions Connection options
     */
    connect(connectionOptions) {
        if (!this._initialized)
            throw Error('Not initialized, run .init() first!');
        return new Promise((resolve) => {
            // Connect to MOS-device:
            let primary = new NCSServerConnection_1.NCSServerConnection(connectionOptions.primary.id, connectionOptions.primary.host, this._conf.mosID, connectionOptions.primary.timeout, this._debug);
            let secondary = null;
            this._ncsConnections[connectionOptions.primary.host] = primary;
            primary.on('rawMessage', (type, message) => {
                this.emit('rawMessage', 'primary', type, message);
            });
            primary.on('warning', (str) => {
                this.emit('warning', 'primary: ' + str);
            });
            primary.on('error', (str) => {
                this.emit('error', 'primary: ' + str);
            });
            primary.createClient(MosConnection.nextSocketID, MosConnection.CONNECTION_PORT_LOWER, 'lower');
            primary.createClient(MosConnection.nextSocketID, MosConnection.CONNECTION_PORT_UPPER, 'upper');
            if (connectionOptions.secondary) {
                secondary = new NCSServerConnection_1.NCSServerConnection(connectionOptions.secondary.id, connectionOptions.secondary.host, this._conf.mosID, connectionOptions.secondary.timeout, this._debug);
                this._ncsConnections[connectionOptions.secondary.host] = secondary;
                secondary.on('rawMessage', (type, message) => {
                    this.emit('rawMessage', 'secondary', type, message);
                });
                secondary.on('warning', (str) => {
                    this.emit('warning', 'secondary: ' + str);
                });
                secondary.on('error', (str) => {
                    this.emit('error', 'secondary: ' + str);
                });
                secondary.createClient(MosConnection.nextSocketID, MosConnection.CONNECTION_PORT_LOWER, 'lower');
                secondary.createClient(MosConnection.nextSocketID, MosConnection.CONNECTION_PORT_UPPER, 'upper');
            }
            // Initialize mosDevice:
            let mosDevice = this._registerMosDevice(this._conf.mosID, connectionOptions.primary.id, (connectionOptions.secondary ? connectionOptions.secondary.id : null), primary, secondary);
            resolve(mosDevice);
        });
    }
    /** Callback is called when a new connection is established */
    onConnection(cb) {
        this._onconnection = cb;
    }
    /** True if mosConnection is listening for connections */
    get isListening() {
        return this._isListening;
    }
    /** TO BE IMPLEMENTED: True if mosConnection is mos-compliant */
    get isCompliant() {
        return false;
    }
    /** True if mosConnection is configured to accept connections */
    get acceptsConnections() {
        return this._conf.acceptsConnections;
    }
    /** A list of the profiles mosConnection is currently configured to use */
    get profiles() {
        return this._conf.profiles;
    }
    /** Close all connections and clear all data */
    dispose() {
        let sockets = [];
        for (let socketID in this._incomingSockets) {
            let e = this._incomingSockets[socketID];
            if (e) {
                sockets.push(e.socket);
            }
        }
        let disposePromises0 = sockets.map((socket) => {
            return new Promise((resolve) => {
                socket.on('close', resolve);
                socket.end();
                socket.destroy();
            });
        });
        let disposePromises1 = [
            this._lowerSocketServer ? this._lowerSocketServer.dispose([]) : Promise.resolve(),
            this._upperSocketServer ? this._upperSocketServer.dispose([]) : Promise.resolve(),
            this._querySocketServer ? this._querySocketServer.dispose([]) : Promise.resolve()
        ];
        let disposePromises2 = [];
        Object.keys(this._mosDevices).map(deviceId => {
            let device = this._mosDevices[deviceId];
            disposePromises2.push(this.disposeMosDevice(device));
        });
        return Promise.all(disposePromises0)
            .then(() => {
            return Promise.all(disposePromises1);
        })
            .then(() => {
            return Promise.all(disposePromises2);
        })
            .then(() => {
            return;
        });
    }
    /** Return a specific MOS-device */
    getDevice(id) {
        return this._mosDevices[id];
    }
    /** Get a list of all MOS-devices */
    getDevices() {
        return Object.keys(this._mosDevices).map((id) => {
            return this._mosDevices[id];
        });
    }
    disposeMosDevice(myMosIDOrMosDevice, theirMosId0, theirMosId1) {
        let id0;
        let id1;
        if (myMosIDOrMosDevice && myMosIDOrMosDevice instanceof MosDevice_1.MosDevice) {
            // myMosID = myMosIDOrMosDevice
            let mosDevice = myMosIDOrMosDevice;
            id0 = mosDevice.idPrimary;
            id1 = mosDevice.idSecondary;
        }
        else {
            let myMosID = myMosIDOrMosDevice;
            id0 = myMosID + '_' + theirMosId0;
            id1 = (theirMosId1 ? myMosID + '_' + theirMosId1 : null);
        }
        if (this._mosDevices[id0]) {
            return this._mosDevices[id0].dispose()
                .then(() => {
                delete this._mosDevices[id0];
            });
        }
        else if (id1 && this._mosDevices[id1]) {
            return this._mosDevices[id1].dispose()
                .then(() => {
                delete this._mosDevices[id1 || ''];
            });
        }
        else {
            return Promise.reject('Device not found');
        }
    }
    /** TO BE IMPLEMENTED */
    get complianceText() {
        if (this.isCompliant) {
            let profiles = [];
            for (let nextSocketID in this._conf.profiles) {
                if (this._conf.profiles[nextSocketID] === true) {
                    profiles.push(nextSocketID);
                }
            }
            return `MOS Compatible – Profiles ${profiles.join(',')}`;
        }
        return 'Warning: Not MOS compatible';
    }
    setDebug(debug) {
        this._debug = debug;
        this.getDevices().forEach((device) => {
            device.setDebug(debug);
        });
        Object.keys(this._ncsConnections).forEach((host) => {
            let conn = this._ncsConnections[host];
            if (conn) {
                conn.setDebug(debug);
            }
        });
        if (this._lowerSocketServer)
            this._lowerSocketServer.setDebug(debug);
        if (this._upperSocketServer)
            this._upperSocketServer.setDebug(debug);
        if (this._querySocketServer)
            this._querySocketServer.setDebug(debug);
    }
    _registerMosDevice(myMosID, theirMosId0, theirMosId1, primary, secondary) {
        let id0 = myMosID + '_' + theirMosId0;
        let id1 = (theirMosId1 ? myMosID + '_' + theirMosId1 : null);
        let mosDevice = new MosDevice_1.MosDevice(id0, id1, this._conf, primary, secondary, this._conf.offspecFailover);
        mosDevice.setDebug(this._debug);
        // Add mosDevice to register:
        if (this._mosDevices[id0]) {
            throw new Error('Unable to register MosDevice "' + id0 + '": The device already exists!');
        }
        if (id1 && this._mosDevices[id1]) {
            throw new Error('Unable to register MosDevice "' + id1 + '": The device already exists!');
        }
        this._mosDevices[id0] = mosDevice;
        if (id1)
            this._mosDevices[id1] = mosDevice;
        mosDevice.connect();
        // emit to .onConnection:
        if (this._onconnection)
            this._onconnection(mosDevice);
        return mosDevice;
    }
    /** Set up TCP-server */
    _initiateIncomingConnections() {
        if (!this._conf.acceptsConnections) {
            return Promise.reject('Not configured for accepting connections');
        }
        let initSocket = (port, description) => {
            let socketServer = new mosSocketServer_1.MosSocketServer(port, description);
            socketServer.on(socketConnection_1.SocketServerEvent.CLIENT_CONNECTED, (e) => this._registerIncomingClient(e));
            socketServer.on(socketConnection_1.SocketServerEvent.ERROR, (e) => {
                // handle error
                this.emit('error', e);
            });
            return socketServer;
        };
        this._lowerSocketServer = initSocket(MosConnection.CONNECTION_PORT_LOWER, 'lower');
        this._upperSocketServer = initSocket(MosConnection.CONNECTION_PORT_UPPER, 'upper');
        this._querySocketServer = initSocket(MosConnection.CONNECTION_PORT_QUERY, 'query');
        let handleListen = (socketServer) => {
            return socketServer.listen()
                .then(() => {
                this.emit('info', 'Listening on port ' + socketServer.port + ' (' + socketServer.portDescription + ')');
            });
        };
        return Promise.all([
            handleListen(this._lowerSocketServer),
            handleListen(this._upperSocketServer),
            handleListen(this._querySocketServer)
        ]).then(() => {
            // All sockets are open and listening at this point
            return;
        });
    }
    /** */
    _registerIncomingClient(client) {
        let socketID = MosConnection.nextSocketID;
        this.emit('rawMessage', 'incoming_' + socketID, 'newConnection', 'From ' + client.socket.remoteAddress + ':' + client.socket.remotePort);
        // handles socket listeners
        client.socket.on('close', ( /*hadError: boolean*/) => {
            this._disposeIncomingSocket(socketID);
            this.emit('rawMessage', 'incoming_' + socketID, 'closedConnection', '');
        });
        client.socket.on('end', () => {
            if (this._debug)
                console.log('Socket End');
        });
        client.socket.on('drain', () => {
            if (this._debug)
                console.log('Socket Drain');
        });
        client.socket.on('data', (data) => {
            let messageString = iconv.decode(data, 'utf16-be').trim();
            this.emit('rawMessage', 'incoming', 'recieved', messageString);
            if (this._debug)
                console.log(`Socket got data (${socketID}, ${client.socket.remoteAddress}, ${client.portDescription}): ${data}`);
            // Figure out if the message buffer contains a complete MOS-message:
            let parsed = null;
            let firstMatch = '<mos>';
            let first = messageString.substr(0, firstMatch.length);
            let lastMatch = '</mos>';
            let last = messageString.substr(-lastMatch.length);
            if (!client.chunks)
                client.chunks = '';
            try {
                if (first === firstMatch && last === lastMatch) {
                    // Data is ready to be parsed:
                    parsed = Utils_1.xml2js(messageString);
                }
                else if (last === lastMatch) {
                    // Last chunk, ready to parse with saved data:
                    parsed = Utils_1.xml2js(client.chunks + messageString);
                    client.chunks = '';
                }
                else if (first === firstMatch) {
                    // First chunk, save for later:
                    client.chunks = messageString;
                }
                else {
                    // Chunk, save for later:
                    client.chunks += messageString;
                }
                if (parsed !== null) {
                    let mosDevice = (this._mosDevices[parsed.mos.ncsID + '_' + parsed.mos.mosID] ||
                        this._mosDevices[parsed.mos.mosID + '_' + parsed.mos.ncsID]);
                    let mosMessageId = parsed.mos.messageID;
                    let ncsID = parsed.mos.ncsID;
                    let mosID = parsed.mos.mosID;
                    let sendReply = (message) => {
                        message.ncsID = ncsID;
                        message.mosID = mosID;
                        message.prepare(mosMessageId);
                        let messageString = message.toString();
                        let buf = iconv.encode(messageString, 'utf16-be');
                        client.socket.write(buf, 'usc2');
                        this.emit('rawMessage', 'incoming_' + socketID, 'sent', messageString);
                    };
                    if (!mosDevice && this._conf.openRelay) {
                        // No MOS-device found in the register
                        // Register a new mosDevice to use for this connection:
                        if (parsed.mos.ncsID === this._conf.mosID) {
                            mosDevice = this._registerMosDevice(this._conf.mosID, parsed.mos.mosID, null, null, null);
                        }
                        else if (parsed.mos.mosID === this._conf.mosID) {
                            mosDevice = this._registerMosDevice(this._conf.mosID, parsed.mos.ncsID, null, null, null);
                        }
                    }
                    if (mosDevice) {
                        mosDevice.routeData(parsed).then((message) => {
                            sendReply(message);
                        }).catch((err) => {
                            // Something went wrong
                            if (err instanceof MosMessage_1.MosMessage) {
                                sendReply(err);
                            }
                            else {
                                // Unknown / internal error
                                // Log error:
                                console.log(err);
                                // reply with NACK:
                                // TODO: implement ACK
                                // http://mosprotocol.com/wp-content/MOS-Protocol-Documents/MOS_Protocol_Version_2.8.5_Final.htm#mosAck
                                let msg = new mosModel_1.MOSAck();
                                msg.ID = new mosString128_1.MosString128(0);
                                msg.Revision = 0;
                                msg.Description = new mosString128_1.MosString128('Internal Error');
                                msg.Status = api_1.IMOSAckStatus.NACK;
                                sendReply(msg); // TODO: Need tests
                            }
                            // console.log(err)
                        });
                    }
                    else {
                        // No MOS-device found in the register
                        // We can't handle the message, reply with a NACK:
                        let msg = new mosModel_1.MOSAck();
                        msg.ID = new mosString128_1.MosString128(0);
                        msg.Revision = 0;
                        msg.Description = new mosString128_1.MosString128('MosDevice not found');
                        msg.Status = api_1.IMOSAckStatus.NACK;
                        sendReply(msg); // TODO: Need tests
                    }
                }
            }
            catch (e) {
                if (this._debug) {
                    console.log('chunks-------------\n', client.chunks);
                    console.log('messageString---------\n', messageString);
                    console.log('error', e);
                }
                this.emit('error', e);
            }
        });
        client.socket.on('error', (e) => {
            if (this._debug)
                console.log(`Socket had error (${socketID}, ${client.socket.remoteAddress}, ${client.portDescription}): ${e}`);
        });
        // Register this socket:
        this._incomingSockets[socketID + ''] = client;
        if (this._debug)
            console.log('Added socket: ', socketID);
    }
    /** Close socket and clean up */
    _disposeIncomingSocket(socketID) {
        let e = this._incomingSockets[socketID + ''];
        if (e) {
            e.socket.removeAllListeners();
            e.socket.destroy();
        }
        delete this._incomingSockets[socketID + ''];
        if (this._debug)
            console.log('removed: ', socketID, '\n');
    }
    /** Get new unique id */
    static get nextSocketID() {
        return this._nextSocketID++ + '';
    }
}
MosConnection.CONNECTION_PORT_LOWER = 10540;
MosConnection.CONNECTION_PORT_UPPER = 10541;
MosConnection.CONNECTION_PORT_QUERY = 10542;
MosConnection._nextSocketID = 0;
exports.MosConnection = MosConnection;
//# sourceMappingURL=MosConnection.js.map