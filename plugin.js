/*
* Karacos plugin for aloha
*/
if(typeof KaraCos=="undefined"||!KaraCos)
    {
	alert('KaraCos must be loaded');
    }
KaraCos.Plugin=new GENTICS.Aloha.Plugin("org.karacos.aloha.Plugin");
/*if (typeof KaraCos_mode != "undefined" ||KaraCos_mode) {
	if (KaraCos_mode != 'karacos_prod') {
		eu.iksproject.LoaderPlugin.loadAsset('org.karacos.aloha.Plugin', 'explorer', 'js');
	}
}*/
eu.iksproject.LoaderPlugin.loadAsset('org.karacos.aloha.Plugin', 'style', 'css');
KaraCos.Plugin.languages=["en","fr"];
KaraCos.Plugin.config = ['img'];
/*
 * Initalize plugin
 */
KaraCos.Plugin.init=function(){
	
	this.pagedata = {}
    var that=this;
	that.add_attachment = null;
	// get user action forms and initialize actions for user
	if (that.settings['instance_url'] == undefined) {
		that.settings['instance_url'] = '';
	}
	
	/*GENTICS.Aloha.Ribbon.addButton(
			new GENTICS.Aloha.ui.Button({
				'iconClass': 'GENTICS_button karacos_explorer_icon',
				id: 'show-btn',
				})
		); */
	GENTICS.Aloha.Ribbon.addButton(
		new GENTICS.Aloha.ui.Button({
			'iconClass': 'GENTICS_button karacos_explorer_icon',
			onclick:function(){
			if (this.isPressed()) {
    			KaraCos.Explorer.domainExplorer.hide();
    		} else {
    			KaraCos.Explorer.domainExplorer.show(this);
    		}
		}})
	);
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
			},// success on get_user_actions_forms
	}); // $.ajax for get_user_actions_forms
	if (that.rsdata) {
		len = that.rsdata.actions.length;
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
				/* 
				 * if (that.rsdata.actions[i].label) {
					var actionButton=new GENTICS.Aloha.ui.Button({label:that.rsdata.actions[i].label,
						onclick:function(){ // When a button is clicked :
						if (this.actiondata.form && this.actiondata.action != 'register') {
							$.kc_write_kc_action(this.actiondata,$('#dialog_window'));
							$('#dialog_window').dialog('open');	
						} else {
							document.location = this.instance_url + '/' + this.actiondata.action;
						}
					}}); // actionbutton
					actionButton.actiondata = that.rsdata.actions[i];
					actionButton.instance_url = that.settings['instance_url'];
					GENTICS.Aloha.Log.info(that,"processing action button creation " + that.rsdata.actions[i].label );
					GENTICS.Aloha.Ribbon.addButton(actionButton);
					// actionButton.show();
				} 
				*/
			}
			// GENTICS.Aloha.Ribbon.toolbar.render();
			// GENTICS.Aloha.Ribbon.toolbar.show();
		} // for
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
				var editMore=new GENTICS.Aloha.ui.Button({label:that.i18n("editMore"),
					onclick:function(){that.editMore()}});
				GENTICS.Aloha.Ribbon.addButton(editMore);
				// editMore.show();
				// GENTICS.Aloha.Ribbon.toolbar.render();
				// GENTICS.Aloha.Ribbon.toolbar.show();
				var saveButton=new GENTICS.Aloha.ui.Button({label:that.i18n("save"),
					onclick:function(){that.save()}});
				GENTICS.Aloha.Ribbon.addButton(saveButton);
				// saveButton.show();
				// GENTICS.Aloha.Ribbon.toolbar.render();
				// GENTICS.Aloha.Ribbon.toolbar.show();
			} // if edit_page 
		} // if data.status == "success"
	GENTICS.Aloha.Log.info(that,that);
	//console.log(that);
	// $.ajax 
	that.initImage();
	that.bindInteractions();
	that.subscribeEvents();
   }; // END INIT

KaraCos.Plugin.resourceObjectTypes = [];

KaraCos.Plugin.initImage = function() {
	var that = this;
	
	if (that.add_attachment != null) {
	    that.imgUploadButton = new GENTICS.Aloha.ui.Button({
	    	'label' : that.i18n('button.uploadimg.label'),
	    	'size' : 'small',
	    	'onclick' : function () { 
	    		GENTICS.Aloha.FloatingMenu.obj.hide();
	    		$.kc_write_kc_action(this.add_attachment,$('#dialog_window'));
	    		$('#dialog_window input.field').fileUploader({
	    			imageLoader: '',
	    			buttonUpload: '#dialog_window input.button',
	    			buttonClear: '#pxClear',
	    			successOutput: 'File Uploaded',
	    			errorOutput: 'Failed',
	    			inputName: 'att_file',
	    			inputSize: 30,
	    			allowedExtension: 'jpg|jpeg|png|gif',
	    			callback: function(data) {
	    			$('#dialog_window').dialog('close');
	    			//console.log(that.imgUploadButton.targetImg);
	    			//console.log(data);
	    			that.targetImg.src = data.data;
	    			GENTICS.Aloha.FloatingMenu.obj.show();
	    		}
	    			});
	    		$('#dialog_window').dialog('open');
	    		
	    },
	    	'tooltip' : that.i18n('button.uploadimg.tooltip'),
	    	'toggle' : false
	    });
	    that.imgUploadButton.add_attachment = that.add_attachment;
	    //this.imgUploadButton.setResourceObjectTypes(KaraCos.Plugin.resourceObjectTypes);
	    GENTICS.Aloha.FloatingMenu.addButton(
	    		KaraCos.Img.getUID('img'),
	    		this.imgUploadButton,
	    		this.i18n('floatingmenu.tab.img'),
	    		3
	    );
	    that.explorerButton = new GENTICS.Aloha.ui.Button({
	    	'iconClass': 'GENTICS_button karacos_explorer_icon',
	    	'size' : 'small',
	    	'onclick' : function () { 
		    	KaraCos.Explorer.domainExplorer.show(this);
		    },
	    	'tooltip' : that.i18n('button.choose.tooltip'),
	    	'toggle' : true
	    });
	    GENTICS.Aloha.FloatingMenu.addButton(
	    		KaraCos.Img.getUID('img'),
	    		this.explorerButton,
	    		this.i18n('floatingmenu.tab.img'),
	    		3
	    );
	}
};

KaraCos.Plugin.bindInteractions = function () {
    var that = this;
    
    KaraCos.Explorer.sinkBodyEvents();
    
    // Block call pasted from http://source.sphene.net/wsvn/sphene/aloha/trunk/aloha-imageplugin/src/at.tapo.aloha.plugins.Image/plugin.js
    // to bind drop event....
    GENTICS.Aloha.EventRegistry.subscribe(GENTICS.Aloha, 'editableCreated', function(event, editable) {
        editable.obj[0].addEventListener('drop', function(event){
    		var e = event;
            event.sink = true;
            var files = e.dataTransfer.files;
            var count = files.length;
            // if no files where dropped, use default handler
            if (count < 1) {
            	event.sink = false;
                return true;
            }
            var len = files.length;
            while(--len >= 0) {
            	
                //alert("testing " + files[i].name);
                var reader = new FileReader();
                reader.onloadend = function(readEvent) {
                    var img = jQuery('<img src="" alt="xyz" />');
                    img.attr('src', readEvent.target.result);
                    //GENTICS.Aloha.Selection.changeMarkupOnSelection(img);
                    GENTICS.Utils.Dom.insertIntoDOM(
                        img,
                        GENTICS.Aloha.Selection.getRangeObject(),
                        GENTICS.Aloha.activeEditable.obj);
                };
                reader.readAsDataURL(files[i]);
            } //while

            return false;
        }, false);
    });

}

KaraCos.Plugin.subscribeEvents = function () {
	var that = this;
	
    // add the event handler for selection change
    GENTICS.Aloha.EventRegistry.subscribe(GENTICS.Aloha, 'selectionChanged', function(event, rangeObject) {
    	if (that.add_attachment != null) {
	    	var foundImgMarkup = KaraCos.Img.findImgMarkup( rangeObject );
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
	    		'params' : that.pagedata,
	    	}),
	    	context: document.body,
	    	type: "POST",
	        success: function(data) {
			GENTICS.Aloha.Log.info(that,data);
	    },});
		GENTICS.Aloha.Log.info(that,that);
	} catch(error) {
		console.log(error);
		GENTICS.Aloha.Log.error(error);
	}
  };
