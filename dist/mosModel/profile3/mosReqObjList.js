"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MosMessage_1 = require("../MosMessage");
const XMLBuilder = require("xmlbuilder");
class MosReqObjList extends MosMessage_1.MosMessage {
    constructor(options) {
        super();
        this.options = options;
        this.port = 'query';
    }
    get messageXMLBlocks() {
        const xml = XMLBuilder.create('mosReqObjList');
        xml.att('username', this.options.username);
        xml.ele('username', {}, this.options.username);
        xml.ele('queryID', {}, this.options.queryID);
        xml.ele('listReturnStart', {}, this.options.listReturnStart);
        xml.ele('listReturnEnd', {}, this.options.listReturnEnd);
        xml.ele('generalSearch', {}, this.options.generalSearch);
        xml.ele('mosSchema', {}, this.options.mosSchema);
        for (const searchGroup of this.options.searchGroups) {
            const groupEle = xml.ele('searchGroup');
            for (const searchField of searchGroup.searchFields) {
                groupEle.ele('searchField', searchField);
            }
        }
        return xml;
    }
}
exports.MosReqObjList = MosReqObjList;
//# sourceMappingURL=mosReqObjList.js.map