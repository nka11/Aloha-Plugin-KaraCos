/**
 * KaraCos integrated plugin for Aloha
 * Copyright 2010 Nicolas Karageuzian
 * Domain explorer
 * 
 *
 */
KaraCos.Explorer = {};

/**
 * KaraCos async tree node
 */
KaraCos.Explorer.TreeNode = function(config) {
	Ext.apply(this, config);
	KaraCos.Explorer.TreeNode.superclass.constructor.call(this);
};

Ext.extend( KaraCos.Explorer.TreeNode, Ext.tree.AsyncTreeNode, {
	
});

/**
 * 
 */
KaraCos.Explorer.nodeItems = {};
KaraCos.Explorer.getNodeItems = function(url) {
	try {
		return KaraCos.Explorer.nodeItems[url].items;
	} catch(e) {
		var items = [];
		var url_href = "/w_browse_types";
		if (url != '/') {
			url_href = url + "/w_browse_types";
		}
		jQuery.ajax({ url: url_href,
			dataType: "json",
			context: document.body,
			async: false, // plugin init should wait for success b4 continuing
		    success: function(data) {
				jQuery.each(data,function(k,v){
					t_url = "/";
					if (url != '/') {
						t_url = url + '/' + k;
					} else {
						t_url = '/' + k;
					}
					item = {text: k,
							id: t_url,
							cls : 'karacos_explorer_' + v.webType,
					};
					items.push(item);
				});
			},
		}); // $.ajax for browse_childrens
		if (url != '/') {
			url_href = url + "/_att";
			jQuery.ajax({ url: url_href,
		    	dataType: "json",
		    	context: document.body,
		    	async: false, // plugin init should wait for success b4 continuing
		        success: function(data) {
					jQuery.each(data.form.fields[0].values, function(id,value) {
						item = {text: value.label,leaf:true};
						var imgreg = /.*\.(jpg)|(gif)|(jpeg)|(png)$/;
						var match = value.value.toLowerCase().match(imgreg);
						if ( match != null) {
							item.cls = 'karacos_file_image';
						}
						var sndreg = /.*\.(mp3)|(ogg)|(m4a)|(aac)$/;
						var match = value.value.toLowerCase().match(sndreg);
						if ( match != null) {
							item.cls = 'karacos_file_sound';
						}
						items.push(item);
					});
				}, //success
				failure: function(data) {}, // do nothing
			
			}); //ajax
		} //
		KaraCos.Explorer.nodeItems[url] = {items : items};
		return KaraCos.Explorer.nodeItems[url].items;
	} //catch
}
/**
 * Tree Loader
 */
KaraCos.Explorer.TreeLoader = function(config) {
	Ext.apply(this, config);
	KaraCos.Explorer.TreeLoader.superclass.constructor.call(this);
};

Ext.extend( KaraCos.Explorer.TreeLoader, Ext.tree.TreeLoader, {
	directFn : function(url, callback, scope) {
			var response = {
					status: true,
					argument: {callback: callback, node: url}
			};
			items = KaraCos.Explorer.getNodeItems(url);
			
			callback(items,response);
		}, // directFn
}); // TreeLoader

/////////////////// Domain Tree Class

/**
 * KaraCos Domain Tree constructor
 */
KaraCos.Explorer.DomainTree = function(config) {
	Ext.apply(this, config);
	KaraCos.Explorer.DomainTree.superclass.constructor.call(this);
//	domainRoot = new KaraCos.Explorer.TreeNode({
	domainRoot = new Ext.tree.AsyncTreeNode({
	    text: '/', 
	    draggable:true, // disable root node dragging
	    cls: 'karacos_file_domain',
	    id: '\/',
	});
//	domainRoot.url = '/';
	this.setRootNode(domainRoot);
	this.getSelectionModel().on('selectionchange', this.onSelectionChange, this);
	this.addEvents({nodeselected:true});

	this.on('contextmenu', this.onContextMenu, this);
	
};
/**
 * KaraCos domain Tree class
 * 
 */
Ext.extend(KaraCos.Explorer.DomainTree, Ext.tree.TreePanel, {
	onContextMenu : function(node, e){
			var that = this;
			if(this.ctxNode){
		        this.ctxNode.ui.removeClass('x-node-ctx');
		        this.ctxNode = null;
		    }
		    if(!node.isLeaf()){
		        this.ctxNode = node;
		        this.ctxNode.ui.addClass('x-node-ctx');
		        this.getNodeMenu(node).showAt(e.getXY());
		        
		    }
		},
	onSelectionChange: function(sm, node){
			console.log(sm);
			console.log(node);
	        if(node){
	            this.fireEvent('nodeselected', node.attributes);
	        }
    },
	onContextHide : function(){
	    if(this.ctxNode){
		        this.ctxNode.ui.removeClass('x-node-ctx');
		        this.ctxNode = null;
		    }
		},
	
	getNodeMenu: function(node){
			var that = this;
			if(!node.menu){ // create context menu on first right click
				items = [];
			    var url_href = "/get_user_actions_forms";
				if (node.id != '/') {
					url_href = node.id + "/get_user_actions_forms";
				}
				jQuery.ajax({ url: url_href,
			    	dataType: "json",
			    	context: document.body,
			    	async: false, // plugin init should wait for success b4 continuing
			        success: function(data) {
			    		jQuery.each(data.data.actions, function(k,v) {
			    			// Iterate over actions
			    			menuItem = {
			    					id: node.id + '\/' + v.action,
			    					iconCls:'karacos_action_'+ v.action,
			    					scope: this
			    					//  handler: this.showWindow,
			    			};
			    			if (v.label) {
			    				menuItem.text = v.label;
			    			} else {
			    				menuItem.text = v.action;
			    			}
			    			item = new Ext.menu.Item(menuItem);
			    			items.push(item);
			    			item.form = v.form;
						
			    		}); // end iterate
					
					}
				});// ajax get_user_actions_forms
				this.menu = new Ext.menu.Menu({
					id:'feeds-ctx',
					items: items
				});
				this.menu.on('hide', this.onContextHide, this);
			} // if not node menu
		return this.menu;
		}

});

/**
 * 
 * 
 */
KaraCos.Explorer.ItemTabPanel = function(config) {
	Ext.apply(this, config);
	KaraCos.Explorer.ItemTabPanel.superclass.constructor.call(this);
	this.contentElementsStore = new Ext.data.JsonStore({
        fields: ['id','Text']

	});
};
Ext.extend(KaraCos.Explorer.ItemTabPanel, Ext.TabPanel, {
});
/**
 * Main explorer Panel for admin
 * 
 * 
 */
KaraCos.Explorer.DomainExplorer = function(config) {
	Ext.apply(this, config);
	this.tree = new KaraCos.Explorer.DomainTree({
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
	console.log(this);
	
	this.tree.on('nodeselected',this.onTreeSelection, this);
	
	this.tabPanel = new KaraCos.Explorer.ItemTabPanel({
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
	this.items = [this.tree,this.tabPanel];
	KaraCos.Explorer.DomainExplorer.superclass.constructor.call(this);
};

Ext.extend(KaraCos.Explorer.DomainExplorer, Ext.Window, {
	onTreeSelection: function(node) {
		console.log("On selection change");
		console.log(this);
		items = KaraCos.Explorer.getNodeItems(node.id);
		jQuery.each(items, function(k,v) {
			//items[k].parent = node.selNode.id
		})
		console.log(items);
		//this.tabPanel.contentElementsStore.loadData
	},
});
KaraCos.Explorer.domainExplorer = new KaraCos.Explorer.DomainExplorer({
    title: 'Explorer',
    width:600,
    height:350,
    //border:false,
    plain:true,
    layout: 'border',
    closeAction: 'hide',
});



