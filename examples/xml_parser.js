const convert = require('xml-js');
const xml =
`<?xml version="1.0" encoding="ISO-8859-1"?>
<root>
	<item id="0">
		<item id="uid">0</item>
		<item id="username"><![CDATA[sdcefd423drfx]]></item>
	</item>
	<item id="1">
		<item id="uid"><![CDATA[1]]></item>
		<item id="username"><![CDATA[测试test123]]></item>
	</item>
</root>`;
const result1 = convert.xml2js(xml, {compact: true});

function analyzeNode(node) {
    if (node.root) {
        return analyzeNode(node.root);
    } else if (node.item) {
        if (/^\d+$/g.test(node.item[0]._attributes.id)) {
            return node.item.map(v => {
                return analyzeNode(v);
            });
        } else {
            const data = {};
            node.item.forEach(v => {
                data[v._attributes.id] = analyzeNode(v);
            });
            return data;
        }
    } else if (node._cdata) {
        return node._cdata;
    } else if (node._text) {
        return node._text;
    } else {
        return null;
    }
}

console.log(analyzeNode(result1));