import { MosMessage } from '../MosMessage';
import * as XMLBuilder from 'xmlbuilder';
export declare class MosReqSearchableSchema extends MosMessage {
    private options;
    constructor(options: {
        username: string;
    });
    readonly messageXMLBlocks: XMLBuilder.XMLElementOrXMLNode;
}
