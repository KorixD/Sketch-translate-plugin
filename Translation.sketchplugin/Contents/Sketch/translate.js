@import 'utils.js'
function translateFile(context, filePath){
	var currentString = NSString.stringWithContentsOfFile_encoding_error(filePath, NSUTF8StringEncoding, null);
	var currentJsonObject = JSON.parse(currentString.toString());
	var keys = currentJsonObject["keys"];

    var comboBoxContainer = [[NSView alloc] initWithFrame:NSMakeRect(0,0,200,25)];
    var comboxBox = [[NSComboBox alloc] initWithFrame:NSMakeRect(0,0,200,25)];
    [comboxBox addItemsWithObjectValues:keys];
    [comboxBox selectItemAtIndex:0];
    [comboBoxContainer addSubview:comboxBox];

    var languageDialog = [[NSAlert alloc] init];
    [languageDialog setMessageText:"Select language to translate"];
    [languageDialog addButtonWithTitle:'OK']
    [languageDialog addButtonWithTitle:'Cancel']
    [languageDialog setAccessoryView:comboBoxContainer]

    if ([languageDialog runModal] == NSAlertFirstButtonReturn) {
		var keyIndex = [comboxBox indexOfSelectedItem];
		var currentPage = context.document.currentPage();
		translatePage(currentPage,currentJsonObject,keys[keyIndex]);
		alert("Translate","Completed!");
	}
}

function isSymbolLayer(layer) {
    if (layer.class() === MSSymbolInstance) {
        return true;
    }

    return false;
}

function translatePage(page, jsonObject, languageKey) {
    var textLayers = getTextLayersOfPage(page);

        for (var i = 0; i < textLayers.length; i++) {
            var textLayer = textLayers[i];
            var stringValue = unescape(textLayer.name());
            if(jsonObject[stringValue]){
                var localeObject = jsonObject[stringValue];
                textLayer.setStringValue(localeObject[languageKey]);
                textLayer.fontSize = localeObject[languageKey + "_size"]
                [textLayer adjustFrameToFit];
            }
        }


    /////

    var layers = [page children];

    for (var i = 0; i < layers.count(); i++) {

        var layer = [layers objectAtIndex: i];

        if (isSymbolLayer(layer)) {
            const existingOverrides = layer.overrides() || NSDictionary.dictionary();
            const overrides = NSMutableDictionary.dictionaryWithDictionary(existingOverrides);
            const symbolMaster = layer.symbolMaster();
            const children = symbolMaster.children();

            for (var j = 0; j < children.count(); j++) {
                var child = [children objectAtIndex:j];
                var stringValue = layer.objectID() + "++++" + child.name();
                console.error(stringValue)
                if (jsonObject[stringValue]) {
                    var localeObject = jsonObject[stringValue];
                    overrides[child.objectID()] = localeObject[languageKey];

                    //textLayer.setStringValue(localeObject[languageKey]);
                    //textLayer.fontSize = localeObject[languageKey + "_size"]

                }
            }
            layer.overrides = overrides;
        }
    }

    //////
}