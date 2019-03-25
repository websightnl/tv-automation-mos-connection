import { IMOSObject } from '../../api';
import { MosMessage } from '../MosMessage';
import * as XMLBuilder from 'xmlbuilder';
export interface MosReqObjActionOptions {
    object: IMOSObject;
    action: 'NEW' | 'UPDATE' | 'DELETE';
}
export declare class MosReqObjAction extends MosMessage {
    private options;
    constructor(options: MosReqObjActionOptions);
    readonly messageXMLBlocks: XMLBuilder.XMLElementOrXMLNode;
}
