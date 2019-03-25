import { IMOSItem } from '../../api';
import { MosMessage } from '../MosMessage';
import * as XMLBuilder from 'xmlbuilder';
export interface MosItemReplaceOptions {
    roID: string;
    storyID: string;
    item: IMOSItem;
}
export declare class MosItemReplace extends MosMessage {
    private options;
    constructor(options: MosItemReplaceOptions);
    readonly messageXMLBlocks: XMLBuilder.XMLElementOrXMLNode;
}
