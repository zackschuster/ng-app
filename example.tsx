/// <reference lib="dom" />
/// <reference lib="es2018" />

function h(name: string, props: { [index: string]: any } = { }, ...childNodes: Node[]) {
	const element = document.createElement(name);

	if (props === null) {
		props = { };
	}

	const properties = Object.entries(props)
		.filter(([_, v]) => v != null && typeof v !== 'object');

	for (const [key, value] of properties) {
		element.setAttribute(key, value.toString());
	}

	for (const node of childNodes) {
		if (node instanceof Node) {
			element.appendChild(node);
		} else if (typeof node === 'string') {
			element.appendChild(document.createTextNode(node));
		}
	}

	return element;
}

const container: HTMLElement =
	<div id='foo' class='some-class' ng-click='$ctrl.foo2($ctrl.ngModel)'>
		Some Text
		<span>Some More Text</span>
	</div>;

const tbody = <tbody></tbody>;

// tslint:disable-next-line: no-magic-numbers
for (let i = 0; i < 10; i++) {
	tbody.appendChild(
		<tr>
			<td>Some Text</td>
		</tr>,
	);
}

container.appendChild(
	<table>
		<thead>
			<th>Row</th>
		</thead>
		{ tbody}
	</table>,
);

document.body.appendChild(container);
