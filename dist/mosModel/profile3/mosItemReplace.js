"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MosMessage_1 = require("../MosMessage");
const XMLBuilder = require("xmlbuilder");
const Parser_1 = require("../Parser");
class MosItemReplace extends MosMessage_1.MosMessage {
    constructor(options) {
        super();
        this.options = options;
        this.port = 'upper';
    }
    get messageXMLBlocks() {
        const item = this.options.item;
        const root = XMLBuilder.create('mosItemReplace');
        root.ele('roID', {}, this.options.roID);
        root.ele('storyID', {}, this.options.storyID);
        root.importDocument(Parser_1.Parser.item2xml(item));
        return root;
    }
}
exports.MosItemReplace = MosItemReplace;
//# sourceMappingURL=mosItemReplace.js.map