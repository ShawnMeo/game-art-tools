
function main() {
    // 1. Get JSON File
    var jsonFile = File.openDialog("Select trim-sheet-data.json", "*.json");
    if (!jsonFile) return;

    jsonFile.open("r");
    var jsonString = jsonFile.read();
    jsonFile.close();

    var data;
    try {
        data = eval("(" + jsonString + ")");
    } catch (e) {
        alert("Error parsing JSON: " + e);
        return;
    }

    // 2. Setup Document
    var doc;
    if (app.documents.length === 0) {
        doc = app.documents.add(
            UnitValue(data.resolution, "px"),
            UnitValue(data.resolution, "px"),
            72,
            "Trim Sheet Layout",
            NewDocumentMode.RGB,
            DocumentFill.TRANSPARENT
        );
    } else {
        doc = app.activeDocument;
    }

    var originalRulerUnits = app.preferences.rulerUnits;
    app.preferences.rulerUnits = Units.PIXELS;

    try {
        var baseGroup = doc.layerSets.add();
        baseGroup.name = "Trim Grid";

        for (var i = 0; i < data.cells.length; i++) {
            var cell = data.cells[i];

            // Create Group for this strip
            var layerSet = baseGroup.layerSets.add();
            layerSet.name = "Strip " + (i + 1);

            // Use cell ID if available, otherwise index
            // layerSet.name = "Cell " + (cell.id ? cell.id.substr(0,4) : (i+1)); 

            // Make Selection
            var selRegion = [
                [cell.pixel_x, cell.pixel_y],
                [cell.pixel_x + cell.pixel_w, cell.pixel_y],
                [cell.pixel_x + cell.pixel_w, cell.pixel_y + cell.pixel_h],
                [cell.pixel_x, cell.pixel_y + cell.pixel_h]
            ];

            doc.selection.select(selRegion);

            // Mask the Group (LayerSet)
            // Need to ensure the LayerSet is the active layer
            doc.activeLayer = layerSet;
            maskActiveLayer();

            // Create a placeholder layer INSIDE so the group isn't empty
            // (Empty groups with masks are valid but invisible)
            var artLayer = layerSet.artLayers.add();
            artLayer.name = "Placeholder";

            // Fill WHOLE layer with grey? 
            // If we fill only selection, we don't prove the mask works.
            // If we fill the whole canvas, the mask will crop it. This is best proof.

            var greyVal = 50 + (i * 20) % 150;
            var color = new SolidColor();
            color.rgb.red = greyVal;
            color.rgb.green = greyVal;
            color.rgb.blue = greyVal;

            // Select All to fill entire canvas inside the masked group
            doc.selection.selectAll();
            doc.selection.fill(color);
            doc.selection.deselect();
        }

        alert("Import Complete! Created " + data.cells.length + " masked groups.");

    } catch (e) {
        alert("Error: " + e);
    } finally {
        app.preferences.rulerUnits = originalRulerUnits;
    }
}

// Helper to mask the current active layer/group
function maskActiveLayer() {
    var desc = new ActionDescriptor();
    desc.putClass(charIDToTypeID("Nw  "), charIDToTypeID("Chnl"));
    var ref = new ActionReference();
    ref.putEnumerated(charIDToTypeID("Chnl"), charIDToTypeID("Chnl"), charIDToTypeID("Msk "));
    desc.putReference(charIDToTypeID("At  "), ref);
    desc.putEnumerated(charIDToTypeID("Usng"), charIDToTypeID("Usng"), charIDToTypeID("RvlS")); // Reveal Selection
    executeAction(charIDToTypeID("Mk  "), desc, DialogModes.NO);
}

main();
