"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MosMessage_1 = require("../MosMessage");
const XMLBuilder = require("xmlbuilder");
const Parser_1 = require("../Parser");
class MosReqObjAction extends MosMessage_1.MosMessage {
    constructor(options) {
        super();
        this.options = options;
        this.port = 'lower';
    }
    get messageXMLBlocks() {
        const xml = XMLBuilder.create('mosReqObjAction');
        xml.att('operation', this.options.action);
        if (this.options.action !== 'NEW')
            xml.att('objID', this.options.object.ID);
        Parser_1.Parser.attachMosObj2xml(this.options.object, xml);
        return xml;
    }
}
exports.MosReqObjAction = MosReqObjAction;
//# sourceMappingURL=mosReqObjAction.js.map