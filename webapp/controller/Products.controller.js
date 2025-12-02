sap.ui.define([
    "sap/ui/core/mvc/Controller"
], (Controller) => {
    "use strict";

    return Controller.extend("com.xtendhr.tilesexercise.tilesexercise.controller.Products", {
        onInit() {
	        this.oFilterBar = this.getView().byId("filterbarProducts")

            var productsModel = new sap.ui.model.json.JSONModel()
            var categoriesModel = new sap.ui.model.json.JSONModel()
            var suppliersModel = new sap.ui.model.json.JSONModel()

            productsModel.loadData("localdata/Products.json")
            categoriesModel.loadData("localdata/Categories.json")
            suppliersModel.loadData("localdata/Suppliers.json")

            this.getView().setModel(productsModel, "Products")
            this.getView().setModel(categoriesModel, "Categories")
            this.getView().setModel(suppliersModel, "Suppliers")
            
            productsModel.attachRequestCompleted(()=>{
                this.productsOriginalData = structuredClone(productsModel.getData())
            })
            suppliersModel.attachRequestCompleted(() => {
                this.getView().getModel("Products").refresh(true);
            });
            categoriesModel.attachRequestCompleted(() => {
                this.getView().getModel("Products").refresh(true);
            });

            this._dialogMode = null
        },
        goBack(){
			this.getOwnerComponent().getRouter().navTo("RouteHome")
        },formatterSupplier: function(id,typeAction){
            var oView = this.getView()

            var supplierModel = oView.getModel("Suppliers")
            var supplierData = supplierModel.getData()
            
            if(!supplierData.value)
                return ""

            var i = supplierData.value.findIndex(function(supplier) {
                return supplier.SupplierID === id
            })

            if(i >= 0){
                if(typeAction == "company")
                    return supplierData.value[i].CompanyName
                else
                    return supplierData.value[i].ContactName + " - Phone: " + supplierData.value[i].Phone
            } else
                return "Not found"
        },formatterCategoryName: function(id){
            var oView = this.getView()

            var categoryModel = oView.getModel("Categories")
            var categoryData = categoryModel.getData()

            if(!categoryData.value)
                return ""

            var i = categoryData.value.findIndex(function(category) {
                return category.CategoryID === id
            })

            return categoryData.value[i].CategoryName
        },openDialog: function(oData, sMode) {
            var oView = this.getView()

            // var supplierModel = oView.getModel("Suppliers")
            // var supplierData = supplierModel.getData()
            // var i = supplierData.value.findIndex(function(supplier) {
            //     return supplier.SupplierID === oData.SupplierID;
            // })
            // oData.Supplier = supplierData.value[i]

            // var categoryModel = oView.getModel("Categories")
            // var categoryData = categoryModel.getData()
            // var i = categoryData.value.findIndex(function(category) {
            //     return category.CategoryID === oData.CategoryID;
            // })
            // oData.Category = categoryData.value[i]

            this._oDialogOriginal = (oData && sMode == "edit" ? structuredClone(oData) : null)
            var oDialogModel = new sap.ui.model.json.JSONModel(oData ? structuredClone(oData) : {})
            var oStateModel = new sap.ui.model.json.JSONModel({ mode: sMode })
            var sName = (sMode == "edit" || sMode == "new" ? "ProductForm" : "ProductView")

            const setupDialog = () => {
                this._oDialog.setModel(oDialogModel, "dialogModel")
                this._oDialog.setModel(oStateModel, "stateModel")

                if(sMode == "new"){
                    this._oDialog.setTitle("Creating new product")
                } else if (sMode == "view"){
                    this._oDialog.setTitle("Viewing details of product: " + oData.ProductName)
                } else if (sMode == "edit"){
                    this._oDialog.setTitle("Editing details of product: " + oData.ProductName)
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
            var oContext = e.getSource().getBindingContext("Products")
            var oData = oContext.getObject()
            this.openDialog(oData, "view")
        },openEdit: function (e){
            var oContext = e.getSource().getBindingContext("Products")
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
                this.newProduct(oData)
            else if (sMode === "edit")
                this.editProduct(oData)

            this._oDialogOriginal = null
            this._oDialog.close()
        },editProduct: function (oData) {
            var oModel = this.getView().getModel("Products")
            var oProducts = oModel.getData()
            var i = oProducts.value.findIndex(function(product) {
                return product.ProductID === oData.ProductID;
            })
            oProducts.value[i] = oData
            oModel.setData(oProducts)
            this.productsOriginalData = structuredClone(oModel.getData())
            oModel.refresh()
        },newProduct: function (oData) {
            var oModel = this.getView().getModel("Products")
            var oProducts = oModel.getData()

            oData.ProductID = oProducts.value.length+1
            oProducts.value.push(oData)
            
            oModel.setData(oProducts)
            
            this.productsOriginalData = structuredClone(oModel.getData())
            oModel.refresh()
        },onFilterTextChange(event){
            var changedText = event.getParameter("newValue")
            var oFilteredData = structuredClone(this.productsOriginalData)

            if(!changedText)
                oFilteredData.value = this.productsOriginalData.value
            else{
                oFilteredData.value = oFilteredData.value.filter((item)=>{
                    return item.ProductName.toLowerCase().includes(changedText.toLowerCase())
                })
            }
            
            var oProductsModel = this.getView().getModel("Products")
            oProductsModel.setData(oFilteredData)
            oProductsModel.updateBindings(true)
        },clearFilter(event){
            var searchInput = this.getView().byId("searchProductNameId")
            searchInput.setValue("")

            var oProductsModel = this.getView().getModel("Products")
            oProductsModel.setData(structuredClone(this.productsOriginalData))
            oProductsModel.updateBindings(true)
        }
    })
})