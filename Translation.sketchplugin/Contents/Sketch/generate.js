@import 'utils.js'
function generateLanguageFile(doc){
	var languageKeys = getLanguageKeys();
	generateLanguageString(doc,languageKeys);
}

function generateLanguageString(doc, languageKeys) {
	var textLayers = getTextLayersOfPage([doc currentPage]);
	var saveString = localeStringFromTextLayers(textLayers,languageKeys);
	saveToLanguageFile(saveString,doc);
	alert("Generate language file","Success");
}

function saveToLanguageFile(string, currentDocument) {
    var translationFileURL = [[[currentDocument fileURL] URLByDeletingPathExtension] URLByAppendingPathExtension:@"json"];
    var saveFilePath = [translationFileURL path]; 
	var saveString = NSString.stringWithString(string + "");
	saveString.writeToFile_atomically_encoding_error(saveFilePath,
                                                             true, 
                                                             NSUTF8StringEncoding, 
                                                             null);
}

function localeStringFromTextLayers(textLayers, languageKeys) {
	var localeObject = {};
	var keysArray = [];
	for(var keyIndex = 0; keyIndex < languageKeys.length; keyIndex++) {
        	var key = languageKeys[keyIndex];
			keysArray.push(unescape(key));
    }

	localeObject["keys"] = keysArray;

    for (var i = 0; i < textLayers.length; i++) {
        var textLayer = textLayers[i];
        languageKey = unescape(textLayer.name());

		var contentObject = {};

        for(var keyIndex = 0; keyIndex < languageKeys.length; keyIndex++) {
        	var key = languageKeys[keyIndex];
			contentObject[key] = unescape(textLayer.stringValue());
            var fontSize = textLayer.fontSize();
            contentObject[key + "_size"] = fontSize.toString();
        }
        localeObject[languageKey] = contentObject;
    }

    var localeJsonString = JSON.stringify(localeObject, undefined, 2);
    return localeJsonString;
}

function addToFile(context, filePath){
	var currentString = NSString.stringWithContentsOfFile_encoding_error(filePath, NSUTF8StringEncoding, null);
	var currentJsonObject = JSON.parse(currentString.toString());
	var keys = currentJsonObject["keys"];

	var selections = context.selection;
	if(selections.count() > 0){
		var textLayers = getTextLayersOfSelections(selections);

		//if(textLayers.length > 0){
			var saveString = getNewStringContent(currentJsonObject,keys,textLayers, selections);
			saveToLanguageFile(saveString,context.document);
			alert("Add language","Success");
		// } else {
		// 	alert("Notification","Please choose some layers!");
		// }
	} else {
		alert("Notification","Please choose some layers!");
	}
}

function isSymbolLayer(layer){
    if (layer.class() === MSSymbolInstance) {
        return true;
    }

    return false;
}

function getNewStringContent(currentJsonObject, keys, textLayers, selections) {
	for (var i = 0; i < textLayers.length; i++) {
        var textLayer = textLayers[i];
        languageKey = unescape(textLayer.name());

        if(!currentJsonObject[languageKey]){
        	var contentObject = {};

        	for(var keyIndex = 0; keyIndex < keys.length; keyIndex++) {
        		var key = keys[keyIndex];
				contentObject[key] = unescape(textLayer.stringValue());
                var fontSize = textLayer.fontSize();
                contentObject[key + "_size"] = fontSize.toString();
        	}

            currentJsonObject[languageKey] = contentObject;
       }
    }

	/////

    for (var i = 0; i < selections.count(); i++) {

        var layer = [selections objectAtIndex:i];

        if (isSymbolLayer(layer)) {
            const existingOverrides = layer.overrides() || NSDictionary.dictionary();
            const overrides = NSMutableDictionary.dictionaryWithDictionary(existingOverrides);
            const symbolMaster = layer.symbolMaster();
            const children = symbolMaster.children();

            for (var j = 0; j < children.count(); j++) {
                var child = [children objectAtIndex:j];

                if (isTextLayer(child) && isNeedTranslate(child) && overrides[child.objectID()] != null) {
                    var contentObject = {};

                    for(var keyIndex = 0; keyIndex < keys.length; keyIndex++) {
                        var key = keys[keyIndex];
                        contentObject[key] = unescape(overrides[child.objectID()]);
                        var fontSize = child.fontSize();
                        contentObject[key + "_size"] = fontSize.toString();
					}

					currentJsonObject[layer.objectID() + "++++" + child.name()] = contentObject;
                }
            }

        }
    }

    //////

    var localeJsonString = JSON.stringify(currentJsonObject, undefined, 2);
    return localeJsonString;
}

function generateAndAddToFile(context){
	var languageKeys = getLanguageKeys();

	var selections = context.selection;
	if(selections.count() > 0){
		var textLayers = getTextLayersOfSelections(selections);
		if(textLayers.length > 0){
			var saveString = localeStringFromTextLayers(textLayers,languageKeys);
			saveToLanguageFile(saveString,context.document);
		} else {
			alert("Notification","Please choose some layers!");
		}
	} else {
		alert("Notification","Please choose some layers!");
	}
}

function getLanguageKeys(){
	var inputKeyContainerView = [[NSView alloc] initWithFrame:NSMakeRect(0,0,200,25)];
	var textField = [[NSTextField alloc] initWithFrame:NSMakeRect(0,0,200,25)];

    [inputKeyContainerView addSubview:textField];

	var alertDialog = [[NSAlert alloc] init];
	[alertDialog addButtonWithTitle:"OK"];
	[alertDialog setMessageText:"Enter language keys. Ex: vi,en,us,.."];
	[alertDialog setAlertStyle:NSWarningAlertStyle];
	[alertDialog setAccessoryView:inputKeyContainerView]
	if ([alertDialog runModal] == NSAlertFirstButtonReturn) {
		var languageKeys = [[textField stringValue] componentsSeparatedByString:","];
		return languageKeys;
	}
}