"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MosMessage_1 = require("../MosMessage");
const XMLBuilder = require("xmlbuilder");
const Parser_1 = require("../Parser");
class MosObjList extends MosMessage_1.MosMessage {
    constructor(options) {
        super();
        this.options = options;
        this.port = 'upper';
    }
    get messageXMLBlocks() {
        const xml = XMLBuilder.create('mosObjList');
        xml.att('username', this.options.username);
        xml.ele('queryID', {}, this.options.queryID);
        xml.ele('listReturnStart', {}, this.options.listReturnStart);
        xml.ele('listReturnEnd', {}, this.options.listReturnEnd);
        xml.ele('listReturnTotal', {}, this.options.listReturnTotal);
        if (this.options.listReturnStatus)
            xml.ele('listReturnStatus', {}, this.options.listReturnStatus);
        if (this.options.list) {
            const listEl = xml.ele('list');
            for (const object of this.options.list) {
                listEl.importDocument(Parser_1.Parser.mosObj2xml(object));
            }
        }
        return xml;
    }
}
exports.MosObjList = MosObjList;
//# sourceMappingURL=mosObjList.js.map