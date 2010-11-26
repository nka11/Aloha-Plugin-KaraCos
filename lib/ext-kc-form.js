Ext.namespace("KaraCos");

KaraCos.type_of = function(v) {
	  if (typeof(v) == "object") {
			if (v === null) return "null";
			if (v.constructor == (new Array).constructor) return "array";
			if (v.constructor == (new Date).constructor) return "date";
			if (v.constructor == (new RegExp).constructor) return "regex";
			return "object";
		  }
		  return typeof(v);
		};

KaraCos.Action = function(config) {
	action = config.action;
	if (action.label){
		config.title = action.label;
	}
	if (KaraCos.type_of(action.form) == "object") {
		config.items = new KaraCos.Form({'form': action.form,
			'url':action.acturl,
			'action':action.action,
			'autoScroll':true,
			'win': this})
	}
	if (KaraCos.type_of(action.form) == "array") {
		config.items = [];
		var arLen=action.form.length;
		for ( var i=0, len=arLen; i<len; ++i ) {
			config.items.push(new KaraCos.Form({'form': action['form'][i],
				'url':action.acturl,
				'action':action.action,
				autoScroll:true,
				'win': this}));
		}
	}
	KaraCos.Action.superclass.constructor.call(this, config);
};
Ext.extend(KaraCos.Action,Ext.Window, {
	messageAlert:function(error) {
		try {
			this.formAlertMsgText = error.message;
			this.formAlertMsg = Ext.MessageBox.show({
				title:'Error ' + error.code + ' origin ' + error.origin,
				msg: this.formAlertMsgText,
				buttons: Ext.Msg.OK,
				modal:true,
				icon: Ext.MessageBox.ERROR
			});			
		} catch(error) {
			this.formAlertMsgText = "unexpected error";
			this.formAlertMsg = Ext.MessageBox.show({
				title:'Error',
				msg: this.formAlertMsgText,
				buttons: Ext.Msg.OK,
				modal:true,
				icon: Ext.MessageBox.ERROR
			});
		}
	}
});

KaraCos.Form = function(config) {
	form = config.form;
	config.frame = true;
	if (form.title) {
		config['title'] = form.title;
	}
	if (form.fields) {
		this.items = [];
		var arLen=form.fields.length;
		for ( var i=0, len=arLen; i<len; ++i ) {
			field = this.getField(form.fields[i]);
			if (field != undefined)
				this.items.push(field);
		}
	}
	KaraCos.Form.superclass.constructor.call(this, config);
	this.win = config.win;
	var that = this;
	submit = "";
	if (form.submit) {
		submit = form.submit;
	} else {
		submit = config.action;
	}
	this.addButton({
		'text':submit,
		handler: function(){
			//
			that.getForm().doAction('kc_jsonsubmit',{
					'kc_method': config.action,
					'success': function(form,action) {
						this.formSuccessMsg = Ext.MessageBox.show({
							title:'Action success',
							msg: action.result.message,
							buttons: Ext.Msg.OK,
							modal:true,
							icon: Ext.MessageBox.OK,
							fn: function() {
								this.destroy();
							},
							scope: this
						});
						return;
					},
					'failure' : function(form,action) {
						if (action.result) {
							if (action.result.error) {
								this.messageAlert(action.result.error);
								return;
							}
						}
						if (action.result.status == 'success') {
							this.formSuccessMsg = Ext.MessageBox.show({
								title:'Action success',
								msg: action.result.message,
								buttons: Ext.Msg.OK,
								modal:true,
								icon: Ext.MessageBox.OK,
								fn: function() {
									this.destroy();
								},
								scope: this
							});
							return;
						}
						if (action.result.status == 'error'|| action.result.status == 'failure') {
							msgObj = {'code':0,'origin':0};
							msgObj['message'] = action.result.message;
							if (action.result.trace) {
								tracelen = action.result.trace.length;
								for (var i=0 ; i<tracelen; ++i) {
									msgObj['message'] += '<br/>';
									msgObj['message'] += action.result.trace[i];
								}
							}
							this.messageAlert(msgObj);
							return;
						}
						this.messageAlert({'code': 0,'origin':0,'message':'Unreadable error'});
					},
					'scope': that.win,
				});
			}
		});
};

Ext.extend(KaraCos.Form,Ext.form.FormPanel, {
	/**
	 * Returns a field object
	 */
	getField: function(field) {
		field_label = "";
		field_value = undefined;
		if (field.title) {
			field_label = field.title;
		} else {
			field_label = field.name;
		}
		if (field.value) {
			field_value = field.value;
		}
		if (field.formType) {
			if (field.formType.toLowerCase() == 'select') {
				var combodata = [];
				if (field.values) {
					jQuery.each(field.values, function(k,v) {
						//						store.loadData([v]);
						combodata.push(v);						
					});
				}
				var store = new Ext.data.JsonStore({
					id: 0,
					fields: ['value'],
					data: combodata
				});
				return new Ext.form.ComboBox({
					store: combodata,
					fieldLabel:field_label,
					name:field.name,
					displayField:'value',
					valueField:'value',
					//typeAhead: true,
					//triggerAction: 'all',
					mode: 'local',
					value: field_value,
					disableKeyFilter: true,
					//editable:false,
					//forceSelection: true,
					//TODO i18n
				    emptyText:'Select value...'
				    //selectOnFocus:true
				});
				
			}
			if (field.formType.toLowerCase() == 'wysiwyg') {
				return new Ext.form.HtmlEditor({
				    //renderTo: Ext.getBody(),
					fieldLabel:field_label,
					name:field.name,
					value: field_value,
				    width: 400,
				    height: 150
				});
			}
			if (field.formType.toLowerCase() == 'textarea') {
				return new Ext.form.TextArea({
				    //renderTo: Ext.getBody(),
					fieldLabel:field_label,
					name:field.name,
					value: field_value,
				    width: 400,
				    height: 150
				});
			}
		} else {
			if (field.dataType.toLowerCase() == 'text') {
				return new Ext.form.TextField({
					fieldLabel:field_label,
					name: field.name,
					value: field_value
				});
			}
			if (field.dataType.toLowerCase() == 'hidden') {
				return new Ext.form.Hidden({
					name: field.name,
					value: field_value
				});
			}
		}
		}
	});