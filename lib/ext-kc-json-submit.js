Ext.namespace("KaraCos");


KaraCos.JsonSubmit = function(form, options) {
	KaraCos.JsonSubmit.superclass.constructor.call(this, form, options);
};

Ext.extend(KaraCos.JsonSubmit, Ext.form.Action.Submit, {
    type: 'kc_jsonsubmit',

    run : function() {
        var o = this.options;
        var method = this.getMethod();
        var isGet = method == 'GET';
        if (o.clientValidation === false || this.form.isValid()) {
            var encodedParams = Ext.encode(this.form.getValues());

            Ext.Ajax.request(Ext.apply(this.createCallback(o), {
                url:this.getUrl(isGet),
                method: method,
                waitMsg: "Please wait while saving",
                waitTitle: "Please wait",
                headers: {'Content-Type': 'application/json','Accept': 'application/json'},
                params: String.format('{"id": 1,"method": "{0}", "params": {1}}', o.kc_method, Ext.encode(this.form.getFieldValues())),
                isUpload: false
            }));
        } else if (o.clientValidation !== false) { // client validation failed
            this.failureType = Ext.form.Action.CLIENT_INVALID;
            this.form.afterAction(this, false);
        }
    }
});

/**
 * We register the new action type...
 */
Ext.apply(Ext.form.Action.ACTION_TYPES, {
    'kc_jsonsubmit' : KaraCos.JsonSubmit
});