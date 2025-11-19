sap.ui.define([
    "sap/ui/core/mvc/Controller"
], (Controller) => {
    "use strict";

    return Controller.extend("com.xtendhr.tilesexercise.tilesexercise.controller.Products", {
        onInit() {
            var oModel = new sap.ui.model.json.JSONModel()
            oModel.loadData("localdata/Products.json")
            console.log(oModel)
            this.getView().setModel(oModel, "Products")
        }
    });
});