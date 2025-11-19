sap.ui.define([
    "sap/ui/core/UIComponent",
    "com/xtendhr/tilesexercise/tilesexercise/model/models"
], (UIComponent, models) => {
    "use strict";

    return UIComponent.extend("com.xtendhr.tilesexercise.tilesexercise.Component", {
        metadata: {
            manifest: "json",
            interfaces: [
                "sap.ui.core.IAsyncContentCreation"
            ]
        },

        init() {
            UIComponent.prototype.init.apply(this, arguments);

            this.setModel(models.createDeviceModel(), "device");

            this.getRouter().initialize();
        }
    });
});