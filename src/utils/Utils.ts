import { xml2js as xmlParser, Element, Attributes } from 'xml-js'

/** */
export function pad (n: string, width: number, z?: string): string {
	z = z || '0'
	n = n + ''
	return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n
}

type XMLElement = XMLElementSimplified | XMLElementFull | string
interface XMLElementSimplified {
	[key: string]: XMLElement
}
interface XMLElementFull {
	$type: 'text' | 'element' | string
	$name: string
	elements?: XMLElement[]
	text?: string
}
export function xml2js (messageString: string): XMLElement {
	let object = xmlParser(messageString, {
		compact: false,
		trim: true,
		nativeType: true
	}) as Element
	// common tags we typically want to know the order of the contents of:
	const orderedTags = new Set([ 'storyBody', 'mosAbstract', 'description', 'p', 'em', 'span', 'h1', 'h2', 'i', 'b' ])

	const addAttributes = (element: Element, target: any) => {
		if (element.attributes) {
			for (const key in element.attributes) {
				target['@' + key] = element.attributes[key]
			}
		}
	}
	/**
	 * Make the objectified tree as compact as possible, without losing ordering
	 */
	const compactXmlElement = (element0: Element, dontOverSimplify?: boolean): XMLElement => {

		let element: Element = element0
		// Special case: unwrap simple text nodes
		if (
			element.type === 'element' &&
			element.elements &&
			element.elements.length === 1 &&
			element.elements[0].type === 'text' &&
			!element.elements[0].name
		) {
			let child = compactXmlElement(element.elements[0])
			if (typeof child === 'string') {
				element = {
					type: 'text',
					name: element.name,
					attributes: element.attributes,
					text: child
				}
			}
		}

		if (element.type === 'text') {
			if (element.attributes || dontOverSimplify) {
				let el: XMLElementFull = {
					$type: 'text',
					$name: element.name + '',
					text: element.text + ''
				}
				addAttributes(element, el)
				return el
			} else {
				return element.text + ''
			}
		} else if (element.elements) {

			if (!element.elements || !element.elements.length) {
				return {}
			} else {
				if (element.elements.length === 1) {
					let el: XMLElementSimplified = {}
					let firstEl = element.elements[0]

					el[firstEl.name + ''] = compactXmlElement(firstEl)

					return el
				} else {
					// has several children
					let names: Array<string> = element.elements.map((obj: { name?: string, type?: string }) => obj.name || obj.type || 'unknownElement')
					let namesSet = new Set(names) // stores only the unique values

					if (names.length === namesSet.size) {
						// all element names are unique
						let el: any = {}
						for (const childEl of element.elements) {
							if (childEl.name) el[childEl.name] = compactXmlElement(childEl)
						}
						addAttributes(element, el)
						if (dontOverSimplify) {
							el.$type = element.type
							el.$name = element.name
						}
						return el
					} else {
						// elements are non-unique
						let el: XMLElementFull = {
							$type: element.type + '',
							$name: element.name + '',
							elements: []
						}
						for (const childEl of element.elements) {
							if (el.elements) el.elements.push(compactXmlElement(childEl, true))
						}
						addAttributes(element, el)
						return el
					}
				}
			}
		} else {
			return {
				$type: element.type + '',
				$name: element.name + '',
			}
		}
	}
	return compactXmlElement(object)

	// return object
}
