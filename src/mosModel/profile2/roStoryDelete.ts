import * as XMLBuilder from 'xmlbuilder'
import { MosMessage } from '../MosMessage'
import { addTextElement } from '../../utils/Utils'
import { MosString128 } from '../../dataTypes/mosString128'

export class ROStoryDelete extends MosMessage {
	constructor (
		private roId: MosString128,
		private storyID: MosString128[]
	) {
		super('upper')
	}
	get messageXMLBlocks (): XMLBuilder.XMLElement {
		let root = XMLBuilder.create('roStoryDelete')
		addTextElement(root, 'roID', this.roId)
		this.storyID.forEach(storyID => addTextElement(root, 'storyID', storyID))
		return root
	}
}
