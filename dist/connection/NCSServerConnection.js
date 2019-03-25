"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mosSocketClient_1 = require("../connection/mosSocketClient");
const mosModel_1 = require("../mosModel");
const events_1 = require("events");
// Namnförslag: NCSServer
// Vi ansluter från oss till NCS
/** */
class NCSServerConnection extends events_1.EventEmitter {
    constructor(id, host, mosID, timeout, debug) {
        super();
        this._debug = false;
        this._disposed = false;
        this._clients = {};
        this._id = id;
        this._host = host;
        this._timeout = timeout || 5000;
        this._heartBeatsDelay = this._timeout / 2;
        this._mosID = mosID;
        this._connected = false;
        if (debug)
            this._debug = debug;
    }
    createClient(clientID, port, clientDescription) {
        let client = new mosSocketClient_1.MosSocketClient(this._host, port, clientDescription, this._timeout, this._debug);
        if (this._debug)
            console.log('registerOutgoingConnection', clientID);
        this._clients[clientID] = {
            heartbeatConnected: false,
            client: client,
            clientDescription: clientDescription
        };
        client.on('rawMessage', (type, message) => {
            this.emit('rawMessage', type, message);
        });
        client.on('warning', (str) => {
            this.emit('warning', 'MosSocketClient: ' + str);
        });
        client.on('error', (str) => {
            this.emit('error', 'MosSocketClient: ' + str);
        });
    }
    /** */
    removeClient(clientID) {
        this._clients[clientID].client.dispose();
        delete this._clients[clientID];
    }
    connect() {
        for (let i in this._clients) {
            // Connect client
            if (this._debug)
                console.log(`Connect client ${i} on ${this._clients[i].clientDescription} on host ${this._host}`);
            this._clients[i].client.connect();
        }
        this._connected = true;
        // Send heartbeat and check connection
        this._sendHeartBeats();
        // Emit to _callbackOnConnectionChange
        // if (this._callbackOnConnectionChange) this._callbackOnConnectionChange()
    }
    executeCommand(message) {
        // Fill with clients
        let clients;
        // Set mosID and ncsID
        message.mosID = this._mosID;
        message.ncsID = this._id;
        // Example: Port based on message type
        if (message.port === 'lower') {
            clients = this.lowerPortClients;
        }
        else if (message.port === 'upper') {
            clients = this.upperPortClients;
        }
        else if (message.port === 'query') {
            clients = this.queryPortClients;
        }
        else {
            throw Error('Unknown port name: "' + message.port + '"');
        }
        return new Promise((resolve, reject) => {
            if (clients && clients.length) {
                clients[0].queueCommand(message, (err, data) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(data);
                    }
                });
            }
            else {
                reject('executeCommand: No clients found for ' + message.port);
            }
        });
    }
    onConnectionChange(cb) {
        this._callbackOnConnectionChange = cb;
    }
    setDebug(debug) {
        this._debug = debug;
        Object.keys(this._clients).forEach((clientID) => {
            let cd = this._clients[clientID];
            if (cd) {
                cd.client.setDebug(debug);
            }
        });
    }
    get connected() {
        if (!this._connected)
            return false;
        let connected = true;
        Object.keys(this._clients).forEach(key => {
            let client = this._clients[key];
            if (!client.heartbeatConnected) {
                connected = false;
            }
        });
        return connected;
    }
    /** */
    get lowerPortClients() {
        let clients = [];
        for (let i in this._clients) {
            if (this._clients[i].clientDescription === 'lower') {
                clients.push(this._clients[i].client);
            }
        }
        return clients;
    }
    /** */
    get upperPortClients() {
        let clients = [];
        for (let i in this._clients) {
            if (this._clients[i].clientDescription === 'upper') {
                clients.push(this._clients[i].client);
            }
        }
        return clients;
    }
    /** */
    get queryPortClients() {
        let clients = [];
        for (let i in this._clients) {
            if (this._clients[i].clientDescription === 'query') {
                clients.push(this._clients[i].client);
            }
        }
        return clients;
    }
    get host() {
        return this._host;
    }
    get id() {
        return this._id;
    }
    handOverQueue(otherConnection) {
        const cmds = {};
        // this._clients.forEach((client, id) => {
        // 	// cmds[id] = client.client.handOverQueue()
        // })
        if (this._debug)
            console.log(this.id + ' ' + this.host + ' handOverQueue');
        for (const id in this._clients) {
            cmds[id] = this._clients[id].client.handOverQueue();
        }
        otherConnection.receiveQueue(cmds);
    }
    receiveQueue(queue) {
        // @todo: keep order
        // @todo: prevent callback-promise horror...
        for (const clientId of Object.keys(queue)) {
            for (const msg of queue[clientId].messages) {
                this.executeCommand(msg.msg).then((data) => {
                    const cb = queue[clientId].callbacks[msg.msg.messageID];
                    if (cb) {
                        cb(null, data);
                    }
                }, (err) => {
                    const cb = queue[clientId].callbacks[msg.msg.messageID];
                    if (cb) {
                        cb(null, err);
                    }
                });
            }
        }
    }
    dispose() {
        this._disposed = true;
        return new Promise((resolveDispose) => {
            for (let key in this._clients) {
                this.removeClient(key);
            }
            global.clearTimeout(this._heartBeatsTimer);
            this._connected = false;
            if (this._callbackOnConnectionChange)
                this._callbackOnConnectionChange();
            resolveDispose();
        });
    }
    _sendHeartBeats() {
        if (this._heartBeatsTimer)
            clearTimeout(this._heartBeatsTimer);
        if (this._disposed)
            return;
        let triggerNextHeartBeat = () => {
            this._heartBeatsTimer = global.setTimeout(() => {
                if (!this._disposed) {
                    this._sendHeartBeats();
                }
            }, this._heartBeatsDelay);
        };
        let connected = this.connected;
        Promise.all(Object.keys(this._clients).map((key) => {
            let client = this._clients[key];
            let heartbeat = new mosModel_1.HeartBeat();
            heartbeat.port = this._clients[key].clientDescription;
            return this.executeCommand(heartbeat)
                .then(() => {
                client.heartbeatConnected = true;
                if (this._debug)
                    console.log(`Heartbeat on ${this._clients[key].clientDescription} received.`);
            })
                .catch((e) => {
                // probably a timeout
                client.heartbeatConnected = false;
                if (this._debug)
                    console.log(`Heartbeat on ${this._clients[key].clientDescription}: ${e.toString()}`);
            });
        }))
            .then(() => {
            if (connected !== this.connected) {
                if (this._callbackOnConnectionChange)
                    this._callbackOnConnectionChange();
            }
            triggerNextHeartBeat();
        })
            .catch((e) => {
            if (connected !== this.connected) {
                if (this._callbackOnConnectionChange)
                    this._callbackOnConnectionChange();
            }
            triggerNextHeartBeat();
            this.emit('error', e);
        });
    }
}
exports.NCSServerConnection = NCSServerConnection;
//# sourceMappingURL=NCSServerConnection.js.map