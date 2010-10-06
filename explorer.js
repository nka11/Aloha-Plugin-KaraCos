/**
 * KaraCos integrated plugin for Aloha
 * Copyright 2010 Nicolas Karageuzian
 * Domain explorer
 * 
 *
 */
KaraCos.Explorer = {};

KaraCos.Explorer.TreeLoader = function(config) {
	Ext.apply(this, config);
	KaraCos.Explorer.TreeLoader.superclass.constructor.call(this);
};

Ext.extend( KaraCos.Explorer.TreeLoader, Ext.tree.TreeLoader, {
	
	directFn : function(node, callback, scope) {
	var url_href = "/w_browse_types";
	if (node != '/') {
		url_href = node + "/w_browse_types";
	}
	var response = {
			status: true,
			argument: {callback: callback, node: node}
	};
	var items = [];
	jQuery.ajax({ url: url_href,
    	dataType: "json",
    	context: document.body,
    	async: false, // plugin init should wait for success b4 continuing
        success: function(data) {
			jQuery.each(data,function(k,v){
				id = "/";
				if (node != '/') {
					id = node + '/' + k;
				} else {
					id = '/' + k;
				}
				item = {id:id,text: k};
				item.cls = 'karacos_explorer_' + v.webType;
				items.push(item);
			});
		},
	}); // $.ajax for get_user_actions_forms
	if (node != '/') {
		url_href = node + "/_att";
		jQuery.ajax({ url: url_href,
	    	dataType: "json",
	    	context: document.body,
	    	async: false, // plugin init should wait for success b4 continuing
	        success: function(data) {
				jQuery.each(data.form.fields[0].values, function(id,value) {
					item = {text: value.label,leaf:true};
					var reg = /.*\.(jpg)|(gif)|(jpeg)|(png)$/;
					var match = value.value.toLowerCase().match(reg);
					if ( match != null) {
						item.cls = 'karacos_file_image';
					}
					items.push(item);
				});
			}, //success
			failure: function(data) {}, // do nothing
		
		}); //ajax
	} // note != /
	callback(items,response);
	} // directFn
}); // TreeLoader

KaraCos.Explorer.DomainTree = new Ext.tree.TreePanel({
	title: 'Navigation',
    region: 'west',
    animate:true, 
    autoScroll:true,
    loader: new KaraCos.Explorer.TreeLoader({dataUrl:'/'}),//KaraCos.Explorer.TreeLoader({dataUrl:'/'}),
    enableDD:true,
    containerScroll: true,
    border: false,
    width: 250,
    height: 300,
    dropConfig: {appendOnly:true}
});

KaraCos.Explorer.DomainRoot = new Ext.tree.AsyncTreeNode({
    text: '/', 
    draggable:true, // disable root node dragging
    id:'/',
    cls: 'karacos_file_domain',
});
KaraCos.Explorer.DomainTree.setRootNode(KaraCos.Explorer.DomainRoot);


KaraCos.Explorer.ItemPanel = new Ext.TabPanel({
    region: 'center',
    margins:'3 3 3 0', 
    activeTab: 0,
    defaults:{autoScroll:true},

    items:[{
        title: 'Bogus Tab',
        html: ''
    },{
        title: 'Another Tab',
        html: ''
    },{
        title: 'Closable Tab',
        html: '',
        closable:true
    }]
});

KaraCos.Explorer.DomainExplorer = new Ext.Window({
    title: 'Explorer',
    width:600,
    height:350,
    //border:false,
    plain:true,
    layout: 'border',
    closeAction: 'hide',
    items: [KaraCos.Explorer.DomainTree, KaraCos.Explorer.ItemPanel]
});



