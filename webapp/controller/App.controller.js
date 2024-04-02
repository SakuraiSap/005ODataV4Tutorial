/// <reference types="@openui5/ts-types" /> #
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/model/Sorter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/FilterType"
], 
/**
* @param {typeof sap.ui.core.mvc.Controller} Controller
* @param {typeof sap.ui.model.json.JSONModel} JSONModel
* @param {typeof sap.m.MessageToast} MessageToast
* @param {typeof sap.m.MessageBox} MessageBox
* @param {typeof sap.ui.model.Sorter} Sorter
* @param {typeof sap.ui.model.Filter} Filter
* @param {typeof sap.ui.model.FilterOperator} FilterOperator
* @param {typeof sap.ui.model.FilterType} FilterType
*/
function (Controller, JSONModel, MessageToast, MessageBox, Sorter, Filter, FilterOperator, FilterType) {
	"use strict";
	
	return Controller.extend("sap.ui.core.tutorial.odatav4.controller.App", {

		/**
		 *  Hook for initializing the controller
		 */
		onInit : function () {
			var oJSONData = {
					busy : false,
					order: 0
				},
				oModel = new JSONModel(oJSONData);

			this.getView().setModel(oModel, "appView");
			
		},
		onRefresh(){
			const oBinding = this.byId("peopleList").getBinding("items");
			if(oBinding.hasPendingChanges()){
				MessageBox.error(this._getText("refreshNotPossibleMessage"));
				return;				
			}
			oBinding.refresh();
			MessageToast.show(this._getText("refreshSuccessMessage"));
			
			
		},
		_getText(sTextId, aArgs){
			return this.getOwnerComponent().getModel("i18n").getResourceBundle().getText(sTextId, aArgs);
		},
		onSearch(){
			const oView = this.getView();
			const sValue = oView.byId("searchField").getValue();
			const oFilter = new Filter({
				path: "LastName",
				operator: FilterOperator.Contains,
				value1: sValue
			});
			oView.byId("peopleList").getBinding("items").filter(oFilter, FilterType.Application);
		},
		onSort(){
			const oView = this.getView();
			const aStates =[undefined, "asc", "desc"];
			const aStatesIds = ["sortNone", "Ascending", "Descending"];
			var iOrder = oView.getModel("appView").getProperty("/order");

			iOrder = (iOrder + 1) % aStates.length;
			const sOrder = aStates[iOrder];
			
			oView.getModel("appView").setProperty("/order", iOrder);
			oView.byId("peopleList").getBinding("items").sort(sOrder && new Sorter({
				path: "LastName",
				descending: sOrder === "desc"
			}));

			const sMessage = this._getText("sortMessage", [this._getText(aStatesIds[iOrder])]);
			MessageToast.show(sMessage);
		}
	});
});
