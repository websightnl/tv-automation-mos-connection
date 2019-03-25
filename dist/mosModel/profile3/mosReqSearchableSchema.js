"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MosMessage_1 = require("../MosMessage");
const XMLBuilder = require("xmlbuilder");
class MosReqSearchableSchema extends MosMessage_1.MosMessage {
    constructor(options) {
        super();
        this.options = options;
        this.port = 'query';
    }
    get messageXMLBlocks() {
        const xml = XMLBuilder.create('mosReqSearchableOptions');
        xml.att('username', this.options.username);
        return xml;
    }
}
exports.MosReqSearchableSchema = MosReqSearchableSchema;
//# sourceMappingURL=mosReqSearchableSchema.js.map