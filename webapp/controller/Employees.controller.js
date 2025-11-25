sap.ui.define([
    "sap/ui/core/mvc/Controller"
], (Controller) => {
    "use strict";

        return Controller.extend("com.xtendhr.tilesexercise.tilesexercise.controller.Employees", {
        onInit() {
            var oModel = new sap.ui.model.json.JSONModel()
            oModel.loadData("localdata/Employees.json")
            this.getView().setModel(oModel, "Employees")
            this._dialogMode = null
        },
        goBack(){
			this.getOwnerComponent().getRouter().navTo("RouteHome");
        },formatImage: function (photo) {
            var sTrimmed;
            if (typeof photo === "string") {
                sTrimmed = photo.substring(104);
                return "data:image/bmp;base64," + sTrimmed;
            }
        },dateFormatter: function (date){
            return date.substring(8,10) + "/" + date.substring(5,7) + "/" + date.substring(0,4)
        },formatDateToForm: function (date){
            if (!date) return null;
                return date.split("T")[0]
        },birthdateChange: function (e) {
            console.log(e.getParameters().value)
        },hiredateChange: function (e){

        },
        openDialog: function(oData, sMode) {
            var oView = this.getView()
            var oDialogModel = new sap.ui.model.json.JSONModel(oData)
            var oStateModel = new sap.ui.model.json.JSONModel({ mode: sMode })
            var sName = (sMode == "edit" || sMode == "new" ? "EmployeeForm" : "EmployeeView")

            const setupDialog = () => {
                this._oDialog.setModel(oDialogModel, "dialogModel")
                this._oDialog.setModel(oStateModel, "stateModel")

                if(sMode == "new"){
                    this._oDialog.setTitle("Creating new employee")
                } else if (sMode == "view"){
                    this._oDialog.setTitle("Viewing details of employee: " + oData.FirstName + " " + oData.LastName)
                } else if (sMode == "edit"){
                    this._oDialog.setTitle("Editing details of employee: " + oData.FirstName + " " + oData.LastName)
                }
                
                this._oDialog.attachAfterClose(() => {
                    this._oDialog.destroy()
                    this._oDialog = null
                })
                this._oDialog.open()
            }
            if (!this._oDialog) {
                sap.ui.core.Fragment.load({
                    id: oView.getId(),
                    name: "com.xtendhr.tilesexercise.tilesexercise.view.fragment." + sName,
                    type: "XML",
                    controller: this
                }).then((oDialog) => {
                    this._oDialog = oDialog
                    oView.addDependent(this._oDialog);
                    setupDialog()
                })
            } else {
                setupDialog()
            }
        },
        openDetails: function (e){
            var oContext = e.getSource().getBindingContext("Employees")
            var oData = oContext.getObject()
            this.openDialog(oData, "view")
        },
        openEdit: function (e){
            var oContext = e.getSource().getBindingContext("Employees")
            var oData = oContext.getObject()
            this.openDialog(oData, "edit")
        },openNew: function (e) {
            this.openDialog(null, "new")
        }
    });
});