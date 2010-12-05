Ext.namespace("KaraCos");

KaraCos.Proxy =  function(config) {
	KaraCos.Proxy.superclass.constructor.call(this, config);
};
Ext.extend(KaraCos.Proxy,Ext.data.DataProxy, {
	doRequest : function(action, rs, params, reader, cb, scope, arg) {
		$.ajax({ url: this.url,
	    	dataType: "json",
	    	contentType: 'application/json',
	    	type: "POST",
	    	data: $.toJSON({
	    		'method' : (this.api[action]) ? this.api[action]['method'] : undefined,
	    		'id' : 1,
	    		'params' : params
	    	}),
	    	context: document.body,
	    	async: false, 
	        success: function(data) {
	        	if (data['status'] == "success") {
	        		//calls store.loadRecords
	        		scope.loadData(data);
	        	}
				}
		});
		
		
	}
});