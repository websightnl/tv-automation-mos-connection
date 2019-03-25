"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MosMessage_1 = require("../MosMessage");
const XMLBuilder = require("xmlbuilder");
const Parser_1 = require("../Parser");
class MosObjCreatee extends MosMessage_1.MosMessage {
    constructor(object) {
        super();
        this.object = object;
        this.port = 'lower';
    }
    get messageXMLBlocks() {
        let xml = XMLBuilder.create('mosObjCreate');
        Parser_1.Parser.attachMosObj2xml(this.object, xml);
        return xml;
    }
}
exports.MosObjCreatee = MosObjCreatee;
//# sourceMappingURL=mosObjCreate.js.map