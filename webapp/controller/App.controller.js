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
			const oJSONData = {
					busy : false,
					order: 0,
					hasUIChanges:false,
					usernameEmpty: true
				};
			const oModel = new JSONModel(oJSONData);
			
			const oMessageManager = sap.ui.getCore().getMessageManager();
			const oMessageModel = oMessageManager.getMessageModel();
			const oMessageManagerBinding = oMessageModel.bindList("/",undefined,[],
				new Filter("technical",FilterOperator.EQ,true));
			
			this.getView().setModel(oMessageModel, "message");
			this.getView().setModel(oModel, "appView");

			oMessageManagerBinding.attachChange(this._onMessageChange, this);
			this._bTechnicalErrors = false;
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
		},
		onCreate(){
			const oList = this.byId("peopleList");
			const oBinding = oList.getBinding("items");
			const oContext = oBinding.create({
				"UserName": "",
				"FirstName": "",
				"LastName": "",
				"Age": 36
			});
			this._setUIChange(true);
			this.getView().getModel("appView").setProperty("/usernameEmpty", true);

			oList.getItems().some(function(oItem){
				if(oItem.getBindingContext() === oContext){
					oItem.focus();
					oItem.setSelected(true);
					return true;
				}
			});
		},
		onInputChange(oEvent){
			if(oEvent.getParameter("escPressed")){
				this._setUIChange();
			}else{
				this._setUIChange(true);
				if(oEvent.getSource().getParent().getBindingContext().getProperty("UserName")){
					this.getView().getModel("appView").setProperty("/usernameEmpty", false);
				}
			}
		},
		onDelete(){
			const oSelect = this.byId("peopleList").getSelectedItem();
			if(oSelect){
				const oContext = oSelect.getBindingContext();
				const sUserName = oContext.getProperty("UserName");
				oContext.delete().then(
					function(){
						MessageToast.show(this._getText("deleteSuccessMessage", sUserName));
					}.bind(this),
					function(oError){
						this._setUIChange();
						if (oContext === oPeopleList.getSelectedItem().getBindingContext()) {
							this._setDetailArea(oContext);
						}
						if(oError.cancelled){
							MessageToast.show(this._getText("deletionRestoredMessage", sUserName));
						}
						MessageBox.error(oError.message + ":" + sUserName);
					}.bind(this)
				);
				this._setDetailArea();
				this._setUIChange(true);
			}
		},
		onSave(){
			let fnSucess = function(){
				this._setBusy(false);
				MessageToast.show(this._getText("changesSentMessage"));
				this._setUIChange(false);
			}.bind(this);

			let fnError = function(oError){
				this._setBusy(false);
				this._setUIChange(false);
				MessageBox.error(oError.message);
			}.bind(this);

			this._setBusy(true);
			this.getView().getModel().submitBatch("peopleGroup").then(fnSucess, fnError);
			this._bTechnicalErrors = false;


		},
		onResetChanges(){
			this.byId("peopleList").getBinding("items").resetChanges();
			this._setUIChange();
			this._bTechnicalErrors = false;
		},
		onResetDataSource(){
			const oModel = this.getView().getModel();
			const oPeration = oModel.bindContext("/ResetDataSource(...)");

			oPeration.execute().then(
				function(){
				oModel.refresh();
				MessageToast.show(this._getText("sourceResetSuccessMessage"));
				}.bind(this),
				function(oError){
					MessageBox.error(oError.message);
				}
			);
		},
		/**
		 * A description of the entire function.
		 *
		 * @param {typeof sap.ui.base.Event} oEvent - description of parameter
		 */
		onSelectionChange(oEvent){
			this._setDetailArea(oEvent.getParameter("listItem").getBindingContext());
		},

		/**
		 * Toggles the visibility of the detail area
		 *
		 * @param {typeof object} oUserContext - the current user context
		 */
		_setDetailArea(oUserContext){
			const oDetailArea = this.byId("detailArea");
			const olayout = this.byId("defaultLayout");
			const oSearchField = this.byId("searchField");

			oDetailArea.setBindingContext(oUserContext || null);
			oDetailArea.setBindingContext(oUserContext || null);
			oDetailArea.setVisible(!!oUserContext);
			olayout.setSize(oDetailArea ? "60%" : "100%");
			olayout.setResizable(!!oUserContext);
			oSearchField.setWidth(oUserContext ? "40%" : "20%");
		},

		_onMessageChange(oEvent){
			const aContexts = oEvent.getSource().getContexts();
			let bMessageOpen = false;

			if(bMessageOpen || !aContexts.length){
				return;
			}

			const aMessages = aContexts.map(function(oContext){
				return oContext.getObject();
			});
			sap.ui.getCore().getMessageManager().removeMessages(aMessages);

			this._setUIChange(true);
			this._bTechnicalErrors = true;
			MessageBox.error(aMessages[0].message, {
				id: "serviceErrorMessageBox",
				onClose: function(){
					bMessageOpen = false;
				}.bind(this)
			});

			bMessageOpen = true;

		},
		_setUIChange(bHasUIChanges){
			if(this._bTechnicalErrors){
				// If there is currently a technical error, then force 'true'.
				bHasUIChanges = true;				
			}else if(bHasUIChanges === undefined){
				bHasUIChanges = this.getView().getModel().hasPendingChanges();
			}
			const oModel = this.getView().getModel("appView");
			oModel.setProperty("/hasUIChanges", bHasUIChanges);
		},
		_getText(sTextId, aArgs){
			return this.getOwnerComponent().getModel("i18n").getResourceBundle().getText(sTextId, aArgs);
		},
		_setBusy(bIsBusy) {
			var oModel = this.getView().getModel("appView");
			oModel.setProperty("/busy", bIsBusy);
		}
	});
});
