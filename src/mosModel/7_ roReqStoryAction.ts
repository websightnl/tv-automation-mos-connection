import * as XMLBuilder from 'xmlbuilder'
import { MosMessage } from './MosMessage'
import { MosString128 } from '../dataTypes/mosString128'
// import { IMOSObjectStatus } from '../api'
// import { MosTime } from '../dataTypes/mosTime'

export enum StoryAction {
	NEW = 'NEW',
	UPDATE = 'UPDATE',
	DELETE = 'DELETE',
	MOVE = 'MOVE'
}
export interface RoReqStoryActionOptions {
	operation: StoryAction
	leaseLock?: number
	username?: MosString128
	// roId: MosString128
	// storyId?: MosString128
	// itemId?: MosString128
	// objId?: MosString128
	// itemChannel?: MosString128
	// status: IMOSObjectStatus
}
export class RoReqStoryAction extends MosMessage {
	private options: RoReqStoryActionOptions
	// private time: MosTime
  /** */
	constructor (options: RoReqStoryActionOptions) {
		super()
		this.options = options
		this.port = 'upper'
	}

  /** */
	get messageXMLBlocks (): XMLBuilder.XMLElementOrXMLNode {
		let root = XMLBuilder.create('roElementStat')
		root.ele('roReqStoryAction', {
			operation: this.options.operation,
			leaseLock: this.options.leaseLock,
			username: this.options.username
		})
		// root.attribute('roReqStoryAction', this.options.type.toString())

		// if (this.options.storyId) 		root.ele('storyID', {}, this.options.storyId.toString())
		// if (this.options.itemId) 		root.ele('itemID', {}, this.options.itemId.toString())
		// if (this.options.objId) 		root.ele('objID', {}, this.options.objId.toString())
		// if (this.options.itemChannel) 	root.ele('itemChannel', {}, this.options.itemChannel.toString())
		// root.ele('status', {}, this.options.status.toString())
		// root.ele('time', {}, this.time.toString())
		return root
	}
}
