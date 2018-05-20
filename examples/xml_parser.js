const convert = require('xml-js');
const xml =
`<?xml version="1.0" encoding="ISO-8859-1"?>
<root>
	<item id="1">
		<item id="appid"><![CDATA[1]]></item>
		<item id="type"><![CDATA[OTHER]]></item>
		<item id="name"><![CDATA[测试]]></item>
		<item id="url"><![CDATA[http://127.0.0.1:7001]]></item>
		<item id="tagtemplates">
			<item id="template"><![CDATA[]]></item>
		</item>
		<item id="viewprourl"><![CDATA[]]></item>
		<item id="synlogin"><![CDATA[1]]></item>
	</item>
</root>`;
const result1 = convert.xml2js(xml, {compact: true});
console.log(convert.xml2json(xml, {compact: true}));

function analyzeNode(node) {
    if (node.root) {
        return analyzeNode(node.root);
    } else if (node.item) {
        if (Array.isArray(node.item)) {
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
        } else {
            const data = {};
            data[node.item._attributes.id] = analyzeNode(node.item);
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