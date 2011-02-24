/*
* Karacos plugin for aloha
*/
Ext.namespace("KaraCos");

KaraCos.Plugin=new GENTICS.Aloha.Plugin("org.karacos.aloha.Plugin");
/*if (typeof KaraCos_mode != "undefined" ||KaraCos_mode) {
	if (KaraCos_mode != 'karacos_prod') {
		eu.iksproject.LoaderPlugin.loadAsset('org.karacos.aloha.Plugin', 'explorer', 'js');
	}
}*/
KaraCos.Plugin.languages=["en","fr"];
KaraCos.Plugin.config = ['img'];
/*
 * Initalize plugin
 */
KaraCos.Plugin.init=function(){
	stylePath = GENTICS_Aloha_base + '/plugins/org.karacos.aloha.Plugin/style.css';
	jQuery('head').append(jQuery('<link rel="stylesheet" />').attr('href', stylePath));

	this.pagedata = {}
    var that=this;
	that.add_attachment = null;
	// get user action forms and initialize actions for user
	if (that.settings['instance_url'] == undefined) {
		that.settings['instance_url'] = '';
	}
	this.browser = new GENTICS.Aloha.ui.Browser();

	this.explorer_button = new GENTICS.Aloha.ui.Button({
		'iconClass': 'GENTICS_button karacos_explorer_icon',
		'toggle' : false,
		onclick:function(){
			that.browser.show();
	}});
	GENTICS.Aloha.Ribbon.addButton(this.explorer_button);
	// When explorer is hidden, make the button clickable
	url_href = that.settings['instance_url'] + "/get_user_actions_forms";
	$.ajax({ url: url_href,
    	dataType: "json",
    	context: document.body,
    	async: false, // plugin init should wait for success b4 continuing
        success: function(data) {
			GENTICS.Aloha.Log.info(that,data);
			that.user_actions = [];
			that.edit_page = false;
			if (data['status'] == "success") {
				GENTICS.Aloha.Log.info(that,"successful result");
				that.rsdata = data['data'];
				}
			}// success on get_user_actions_forms
	}); // $.ajax for get_user_actions_forms
	url_href = "/get_user_actions_forms";
	$.ajax({ url: url_href,
		dataType: "json",
		context: document.body,
		async: false, // plugin init should wait for success b4 continuing
		success: function(data) {
			GENTICS.Aloha.Log.info(that,data);
			that.user_actions = [];
			that.edit_page = false;
			if (data['status'] == "success") {
				GENTICS.Aloha.Log.info(that,"successful result");
				that.domainMenuData = data['data'];
			}
		}// success on get_user_actions_forms
	}); // $.ajax for get_user_actions_forms
	this.drawDomainMenu();
	this.drawInstanceMenu();
	GENTICS.Aloha.Log.info(that,that);
	that.bindInteractions();
	that.subscribeEvents();
   }; // END INIT

KaraCos.Plugin.objectTypeFilter = [];


KaraCos.Plugin.bindInteractions = function () {
    var that = this;
    

};

KaraCos.Plugin.drawDomainMenu = function() {
	var that = this;
	if (that.domainMenuData) {
		len = that.domainMenuData.actions.length;
		menu = new Ext.menu.Menu({
			id: 'domainMenu'
		});
		for (var i=0 ; i<len; ++i) {
			var menu_items = ['<b class="menu-title">Choose a Theme</b>',];
			//that.domain_actions[i] = that.domainMenuData.actions[i].action;
			 if (that.domainMenuData.actions[i].action == "set_user_theme" ||
					 that.domainMenuData.actions[i].action == 'set_theme') {
				var field = that.domainMenuData.actions[i].form.fields[0];
				var fieldvalue = undefined;
				if (field.value){
					fieldvalue = field.value;
				}
				action_name = that.domainMenuData.actions[i].action;
				if (that.domainMenuData.actions[i].label) {
					action_name = that.domainMenuData.actions[i].label;
				}
				if (field.values) {
					jQuery.each(field.values, function(k,v) {
						var ischecked = false;
						if (v == fieldvalue) {
							ischecked = true;
						} else {
							ischecked = false;
						}
						menuitem = {text:v,
								group: that.domainMenuData.actions[i].action,
								checkHandler: that.onUserThemeClick,
								checked: ischecked};
						
						menu_items.push(menuitem)
					});
				}
				var themeSelectorItem = new Ext.menu.Item({
					text:action_name,
					menu: {items:menu_items}
				});
			 menu.addItem(themeSelectorItem);
			 } // if set_user_theme || set_theme
			 
		} //for
		GENTICS.Aloha.Ribbon.toolbar.insert(GENTICS.Aloha.Ribbon.toolbar.items.getCount() - 3,
				{
					text:'Domain Actions',
					iconcls: 'bmenu',
					menu:menu
				}
		);
		GENTICS.Aloha.Ribbon.toolbar.doLayout();
	} // if domain menu data
}

KaraCos.Plugin.onUserThemeClick = function(data) {
	$.ajax({ url: '/',
    	dataType: "json",
    	contentType: 'application/json',
    	type: "POST",
    	data: $.toJSON({
    		'method' : data.group,
    		'id' : 1,
    		'params' : {'theme':data.text}
    	}),
    	context: document.body,
    	async: false, // plugin init should wait for success b4 continuing
        success: function(data) {
        	if (data['status'] == "success") {
        	document.location = document.URL;
        	}
			}// success on set_user_theme
	}); // $.ajax for get_user_actions_forms
}

KaraCos.Plugin.drawInstanceMenu = function() {
	var that = this;
	if (that.rsdata) {
		len = that.rsdata.actions.length;
		menu = new Ext.menu.Menu({
			id: 'mainMenu'
		});
		for (var i=0 ; i<len; ++i) {
			that.user_actions[i] = that.rsdata.actions[i].action;
			if (that.rsdata.actions[i].action == that.settings['edit_content_action']) {
				that.edit_page = true;
				that.edit_page_action = that.rsdata.actions[i];
			} else {
				if (that.rsdata.actions[i].action == "add_attachment") {
					that.add_attachment = that.rsdata.actions[i];
				}
				if (that.rsdata.actions[i].action == "_att") {
					that._att = that.rsdata.actions[i];
				}
				if (that.rsdata.actions[i].label) {
					var actionMenuItem=new Ext.menu.Item(
						{text:that.rsdata.actions[i].label,
						actiondata: that.rsdata.actions[i],
						}); 
					actionMenuItem.on('click', function(){ // When a button is clicked :
						if (this.actiondata.form && this.actiondata.action != 'register') {
							new KaraCos.Action({'action': this.actiondata,
								title : this.actiondata.action,
								instance_url: that.settings['instance_url'],
								layout : 'vbox',
								layoutConfig: {
								    align : 'stretch',
								    pack  : 'start',
								},
								width : 800,
								height : 300,
								modal:true,
								'autoScroll':true,
								closeAction : 'destroy'}).show();
							
							
						} else {
							document.location = this.instance_url + '/' + this.actiondata.action;
						}
					});
					//); // actionbutton
					actionMenuItem.actiondata = that.rsdata.actions[i];
					actionMenuItem.instance_url = that.settings['instance_url'];
					menu.addItem(actionMenuItem);
//					menu.items.push(actionButton);
					GENTICS.Aloha.Log.info(that,"processing action button creation " + that.rsdata.actions[i].label );
					//GENTICS.Aloha.Ribbon.addButton(actionButton);
					// actionButton.show();
				} else {
					
				}
			}
		} // for
		menuButton = new Ext.Button({
			menu:menu,
			text:'KaraCos Menu'
		});
		GENTICS.Aloha.Ribbon.toolbar.insert(GENTICS.Aloha.Ribbon.toolbar.items.getCount() - 3,
				{
					text:'Current Node Menu',
					menu:menu
				}
		);
//		GENTICS.Aloha.Ribbon.toolbar.render();
//		GENTICS.Aloha.Ribbon.toolbar.show();
		
		if (that.edit_page) {
			GENTICS.Aloha.Log.info(that,that.edit_page_action);
				len = that.edit_page_action.form.fields.length;
				for (var i=0 ; i<len; ++i) {
					field = that.edit_page_action.form.fields[i];
					fieldvalue = "";
					if (field.value) {
						fieldvalue = field.value;
					}
					that.pagedata[field.name] = fieldvalue;
				}
				var editMore=new GENTICS.Aloha.ui.Button({
					label:that.i18n("editMore"),
					onclick:function(){that.editMore()}});
				GENTICS.Aloha.Ribbon.addButton(editMore);
				// editMore.show();
				// GENTICS.Aloha.Ribbon.toolbar.render();
				// GENTICS.Aloha.Ribbon.toolbar.show();
				var saveButton=new GENTICS.Aloha.ui.Button({
					label:that.i18n("save"),
					onclick:function(){that.save()}});
				GENTICS.Aloha.Ribbon.addButton(saveButton);
				// saveButton.show();
				// GENTICS.Aloha.Ribbon.toolbar.render();
				// GENTICS.Aloha.Ribbon.toolbar.show();
			} // if edit_page 
		} // if that.rsdata
	GENTICS.Aloha.Ribbon.toolbar.doLayout();
}

KaraCos.Plugin.subscribeEvents = function () {
	var that = this;
    GENTICS.Aloha.EventRegistry.subscribe(GENTICS.Aloha, 'selectionChanged', function(event, rangeObject) {
    	//console.log(rangeObject);
    	if (that.add_attachment != null) {
	    	var foundImgMarkup = GENTICS.Aloha.Image.findImgMarkup( rangeObject );
	        if ( foundImgMarkup != null ) {
	        	//img found
	            that.targetImg = foundImgMarkup;
	        } else {
//	        	that.targetImg = null;
	        }
	        
	    	// TODO this should not be necessary here!
	        GENTICS.Aloha.FloatingMenu.doLayout();
	        GENTICS.Aloha.FloatingMenu.obj.show();
    	}
    	
    });
    	
	
}


KaraCos.Plugin.srcChange = function () {
	// For now hard coded attribute handling with regex.
	//this.imgField.setAttribute('target', this.target, this.targetregex, this.hrefField.getQueryValue());
	//this.imgField.setAttribute('class', this.cssclass, this.cssclassregex, this.hrefField.getQueryValue());
}

/**
 * Edit more (window with additional info (which cannont be edited on page)
 */
KaraCos.Plugin.editMore=function(){
	simplified_action = this.edit_page_action;
	if (this.edit_page_action.form.fields) {
		this.items = [];
		var arLen=this.edit_page_action.form.fields.length;
		new KaraCos.Action({'action': this.edit_page_action,
			title : this.edit_page_action.action,
			instance_url: this.settings['instance_url'],
			layout : 'vbox',
			//layoutConfig: {
//			    align : 'stretch',
//			    pack  : 'start',
//			},
			width : 800,
			height : 300,
			modal:true,
			autoScroll:true,
			closeAction : 'destroy'}).show();
	}
   }; // END EDIT MORE

/**
 * save page content
 */
KaraCos.Plugin.save=function(){
	try {
		GENTICS.Aloha.Log.info("Starting KaraCos Save function");
		config = this.settings['idfieldsref'];
	    var content="";
	    var that = this;
		jQuery.each(GENTICS.Aloha.editables,
		            function(index,editable){
						that.pagedata[config[editable.getId()]] = editable.getContents();
				        content=content+"Editable ID: "+config[editable.getId()]+"\nHTML code: "+editable.getContents()+"\n\n";
			        });
		url = that.settings['instance_url'];
		if (url == "") {
			url = "/";
		}
		$.ajax({ url: url,
	    	dataType: "json",
	    	contentType: 'application/json',
	    	data: $.toJSON({
	    		'method' : that.settings['edit_content_action'],
	    		'id' : 1,
	    		'params' : that.pagedata
	    	}),
	    	context: document.body,
	    	type: "POST",
	        success: function(data) {
				GENTICS.Aloha.Log.info(that,data);
	    	}});
		GENTICS.Aloha.Log.info(that,that);
	} catch(error) {
		GENTICS.Aloha.Log.error(error);
	}
  };
