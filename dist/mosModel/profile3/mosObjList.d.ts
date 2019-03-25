import { IMosObjectList } from '../../api';
import { MosMessage } from '../MosMessage';
import * as XMLBuilder from 'xmlbuilder';
export declare class MosObjList extends MosMessage {
    private options;
    constructor(options: IMosObjectList);
    readonly messageXMLBlocks: XMLBuilder.XMLElementOrXMLNode;
}
