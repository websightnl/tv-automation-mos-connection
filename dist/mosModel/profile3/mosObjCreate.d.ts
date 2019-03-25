import { IMOSObject } from '../../api';
import { MosMessage } from '../MosMessage';
import * as XMLBuilder from 'xmlbuilder';
export declare class MosObjCreatee extends MosMessage {
    private object;
    constructor(object: IMOSObject);
    readonly messageXMLBlocks: XMLBuilder.XMLElementOrXMLNode;
}
