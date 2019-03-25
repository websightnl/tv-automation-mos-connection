import { IMosRequestObjectList } from '../../api';
import { MosMessage } from '../MosMessage';
import * as XMLBuilder from 'xmlbuilder';
export declare class MosReqObjList extends MosMessage {
    private options;
    constructor(options: IMosRequestObjectList);
    readonly messageXMLBlocks: XMLBuilder.XMLElementOrXMLNode;
}
