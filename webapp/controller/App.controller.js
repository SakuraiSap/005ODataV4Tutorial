/// <reference types="@openui5/ts-types" /> #
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/m/Button"
], 
/**
* @param {typeof sap.ui.core.mvc.Controller} Controller
* @param {typeof sap.ui.model.json.JSONModel} JSONModel
* @param {typeof sap.m.MessageToast} MessageToast
* @param {typeof sap.m.MessageBox} MessageBox
* @param {typeof sap.m.Button} Button
*/
function (Controller, JSONModel, MessageToast, MessageBox, Button) {
	"use strict";
	
	return Controller.extend("sap.ui.core.tutorial.odatav4.controller.App", {

		/**
		 *  Hook for initializing the controller
		 */
		onInit : function () {
			var oJSONData = {
					busy : false
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
		}
	});
});
