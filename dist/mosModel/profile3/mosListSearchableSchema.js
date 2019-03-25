"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MosMessage_1 = require("../MosMessage");
const XMLBuilder = require("xmlbuilder");
class MosListSearchableSchema extends MosMessage_1.MosMessage {
    constructor(options) {
        super();
        this.options = options;
        this.port = 'query';
    }
    get messageXMLBlocks() {
        const xml = XMLBuilder.create('mosListSearchableSchema');
        xml.att('username', this.options.username);
        xml.ele('mosSchema', {}, this.options.mosSchema);
        return xml;
    }
}
exports.MosListSearchableSchema = MosListSearchableSchema;
//# sourceMappingURL=mosListSearchableSchema.js.map