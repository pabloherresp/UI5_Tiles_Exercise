sap.ui.define([
    "sap/ui/core/mvc/Controller"
], (Controller) => {
    "use strict";

    return Controller.extend("com.xtendhr.tilesexercise.tilesexercise.controller.Home", {
        onInit() {
        },
        pressProducts() {
			this.getOwnerComponent().getRouter().navTo("Products");
        },

        pressEmployees() {
			this.getOwnerComponent().getRouter().navTo("Employees");
        }
    });
});