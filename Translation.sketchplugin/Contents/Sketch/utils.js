function alert(title, message){
  var app = [NSApplication sharedApplication];
  [app displayDialog:message withTitle:title];
}

function isTextLayer(layer){
    if (layer.class() === MSTextLayer) {
        return true;
    }

    return false;
}


function isNeedTranslate(layer){
  var layerName = layer.name();
  if(layerName.indexOf("o_") == -1)
        return false;
    
  return true;	
}


function isExistFilePath(filePath){
  var fileManager = [NSFileManager defaultManager];
  return [fileManager fileExistsAtPath:filePath];
}

function getTextLayersOfPage(pages) {
  var layers = [pages children];
  textLayers = [];

  for (var i = 0; i < layers.count(); i++) {
      var layer = [layers objectAtIndex:i];
      if (isTextLayer(layer) && isNeedTranslate(layer)) {
        textLayers.push(layer);
      }
  }

  return textLayers;
}

function getTextLayersOfSelections(selections) {
    var textLayers = [];

    for (var i = 0; i < selections.count(); i++) {
        var layer = [selections objectAtIndex:i];

        if (isTextLayer(layer) && isNeedTranslate(layer)) {
            textLayers.push(layer);
        }
    }

    return textLayers;
}

function getAllSymbolChildrenOfPage(selections, symbolLayers) {

    for (var i = 0; i < selections.count(); i++) {
        var children = [page children];
        for (var j = 0; j < children.count(); j++) {
            var child = [children objectAtIndex:j];
            if (child.class == MSSymbolInstance) {
                symbolLayers.push(child);
            }
        }
    }

    return symbolLayers;
}

function getSymbolLayersOfSelections(selections) {
    var symbolOutputs = {};
    var symbolLayers = [];

    for (var i = 0; i < selections.count(); i++) {
        var layer = [selections objectAtIndex:i];
        if (layer.class == MSSymbolInstance) {
            const existingOverrides = layer.overrides() || NSDictionary.dictionary();
            const overrides = NSMutableDictionary.dictionaryWithDictionary(existingOverrides);

            const symbolMaster = layer.symbolMaster();
            const children = symbolMaster.children();
            for (var i = 0; i < children.count(); i++) {
                var child = [children objectAtIndex:i];
                if (isTextLayer(child) && isNeedTranslate(child)) {
                    symbolOutputs[layer.objectID() + "++++" + child.name()] = overrides[child.objectID()];
                }
            }

        }
    }

    return symbolOutputs;
}