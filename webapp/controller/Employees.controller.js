sap.ui.define([
    "sap/ui/core/mvc/Controller"
], (Controller) => {
    "use strict";

        return Controller.extend("com.xtendhr.tilesexercise.tilesexercise.controller.Employees", {
        onInit() {
            var oModel = new sap.ui.model.json.JSONModel()
            oModel.loadData("localdata/Employees.json")
            this.getView().setModel(oModel, "Employees")

            oModel.attachRequestCompleted(()=>{
                this.employeesOriginalData = structuredClone(oModel.getData())
            })

            this._dialogMode = null
        },
        goBack(){
			this.getOwnerComponent().getRouter().navTo("RouteHome");
        },formatImage: function (photo) {
            var sTrimmed;
            if (typeof photo === "string") {
                sTrimmed = photo.substring(104);
                return "data:image/bmp;base64," + sTrimmed;
            } else if(!photo)
                return "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png"
        },dateFormatter: function (date){
            return date.substring(8,10) + "/" + date.substring(5,7) + "/" + date.substring(0,4)
        },formatDateToForm: function (date){
            if (!date) return null;
                return date.split("T")[0]
        },birthdateChange: function (e) {
            var date = e.getParameter("value")
            var oModel = this._oDialog.getModel("dialogModel")
            oModel.setProperty("/BirthDate", date)
        },hiredateChange: function (e){
            var date = e.getParameter("value")
            var oModel = this._oDialog.getModel("dialogModel")
            oModel.setProperty("/HireDate", date)
        },openDialog: function(oData, sMode) {
            var oView = this.getView()
            this._oDialogOriginal = (oData && sMode == "edit" ? structuredClone(oData) : null)
            var oDialogModel = new sap.ui.model.json.JSONModel(oData ? structuredClone(oData) : {})
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
        },onClose: function (e) {
            var oDialogModel = this._oDialog.getModel("dialogModel")

            if (this._oDialogOriginal) {
                oDialogModel.setData(structuredClone(this._oDialogOriginal))
            }
            this._oDialogOriginal = null
            this._oDialog.close()
        },onSave: function (e) {
            var oDialogModel = this._oDialog.getModel("dialogModel")
            var oStateModel = this._oDialog.getModel("stateModel")
            var oData = oDialogModel.getData()
            var sMode = oStateModel.getProperty("/mode")

            if (sMode === "new") 
                this.newEmployee(oData)
            else if (sMode === "edit")
                this.editEmployee(oData)

            this._oDialogOriginal = null
            this._oDialog.close()
        },editEmployee: function (oData) {
            var oModel = this.getView().getModel("Employees")
            var oEmployees = oModel.getData()
            var i = oEmployees.value.findIndex(function(employee) {
                return employee.EmployeeID === oData.EmployeeID;
            })
            oEmployees.value[i] = oData
            oModel.setData(oEmployees)

            this.employeesOriginalData = structuredClone(oModel.getData())
            oModel.refresh()
        },newEmployee: function (oData) {
            var oModel = this.getView().getModel("Employees")
            var oEmployees = oModel.getData()

            oData.EmployeeID = oEmployees.value.length+1
            oEmployees.value.push(oData)
            
            oModel.setData(oEmployees)

            this.employeesOriginalData = structuredClone(oModel.getData())
            oModel.refresh()
        },onFilterTextChange(event){
            var changedText = event.getParameter("newValue")
            var oFilteredData = structuredClone(this.employeesOriginalData)

            if(!changedText)
                oFilteredData.value = this.employeesOriginalData.value
            else{
                oFilteredData.value = oFilteredData.value.filter((item)=>{
                    var fullname = item.FirstName + " " + item.LastName
                    return fullname.toLowerCase().includes(changedText.toLowerCase())
                })
            }
            
            var oEmployeesModel = this.getView().getModel("Employees")
            oEmployeesModel.setData(oFilteredData)
            oEmployeesModel.updateBindings(true)
        },clearFilter(event){
            var searchInput = this.getView().byId("searchEmployeeNameId")
            searchInput.setValue("")

            var oEmployeesModel = this.getView().getModel("Employees")
            oEmployeesModel.setData(structuredClone(this.employeesOriginalData))
            oEmployeesModel.updateBindings(true)
        }
    })
})