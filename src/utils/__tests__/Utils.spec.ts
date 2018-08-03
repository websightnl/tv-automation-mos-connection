import {
	xml2js
} from '../Utils'
test('xml2js', () => {
	let o = xml2js(`
<mos>
	<other>test0</other>
	<other2 attr0="asdf">test1</other2>
	<storyBody>
		<p style="bold">Hello and welcome</p>
		<mosObject>[name sign]</mosObject>
		<p>This is a extra broadcast bla bla</p>
		<mosObject>
		</mosObject>
		<p> </p>
		<p></p>
		<p>Let's look at this video:</p>
		<mosObject id="id0">
			<id>dudesayshi</id>
			<name>Hello!</name>
			<video>
				<path>http://asdf.com</path>
			</video>
			<title style="happy">A long title</title>
		</mosObject>
	</storyBody>
</mos>
	`) as any

	// console.log('-----------------------')
	// console.log('o', o)
	// @ts-ignore

	// console.log('o', JSON.stringify(o, ' ', 2))
	expect(o).toBeTruthy()
	expect(o.mos.other).toEqual('test0')
	expect(o.mos.other2).toMatchObject({
		$type: 'text',
		$name: 'other2',
		text: 'test1',
		'@attr0': 'asdf'
	})
	expect(o.mos.storyBody).toMatchObject({
		$type: 'element',
		$name: 'storyBody',
		elements: [
			{ $type: 'text', $name: 'p', text: 'Hello and welcome', '@style': 'bold' },
			{ $type: 'text', $name: 'mosObject', text: '[name sign]' },
			{ $type: 'text', $name: 'p', text: 'This is a extra broadcast bla bla' },
			{ $type: 'element', $name: 'mosObject' },
			{ $type: 'element', $name: 'p' },
			{ $type: 'element', $name: 'p' },
			{ $type: 'text', $name: 'p', text: 'Let\'s look at this video:' },
			{
				$type: 'element',
				$name: 'mosObject',
				'@id': 'id0',
				id: 'dudesayshi',
				name: 'Hello!',
				video: {
					path: 'http://asdf.com'
				},
				title: {
					$type: 'text',
					$name: 'title',
					text: 'A long title',
					'@style': 'happy'
				}
			}
		]
	})
	// expect(o.mos).toBeTruthy()
})
