import { MosMessage } from '../MosMessage';
import * as XMLBuilder from 'xmlbuilder';
import { IMOSSearchableSchema } from '../../api';
export declare class MosListSearchableSchema extends MosMessage {
    private options;
    constructor(options: IMOSSearchableSchema);
    readonly messageXMLBlocks: XMLBuilder.XMLElementOrXMLNode;
}
