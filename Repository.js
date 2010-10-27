
/*!
* Aloha Editor
* Author & Copyright (c) 2010 Gentics Software GmbH
* aloha-sales@gentics.com
* Licensed unter the terms of http://www.aloha-editor.com/license.html
*/

/**
 * Create the Repositories object. Namespace for Repositories
 * @hide
 */
if ( !GENTICS.Aloha.Repositories ) GENTICS.Aloha.Repositories = {};

/**
 * register the plugin with unique name
 */
GENTICS.Aloha.Repositories.KaraCos = new GENTICS.Aloha.Repository('org.karacos.aloha.Repository');

/**
 * configure data as array with following format:
 * 
 * [{ id: 1, name: 'Aloha Editor - The HTML5 Editor', url:'http://aloha-editor.com', objectType:'website' }];	

 * @property
 * @cfg
 */
GENTICS.Aloha.Repositories.KaraCos.settings.data = [
	{ id: 1, name: 'KaraCos Domain', url:'/', objectType:'website' }
];

/**
 * Internal folder structur.
 * @hide
 */
GENTICS.Aloha.Repositories.KaraCos.folder =[];

/**
 * initalize LinkList, parse all links, build folder structure and add 
 * additional properties to the items
 */
GENTICS.Aloha.Repositories.KaraCos.init = function() {
	var that = this;
	url_href = "/w_browse_types"
	var root = this.addFolder('org.karacos.aloha.Repository', 'Domain');
	console.log(this.folder);//['/'].parentId = 'org.karacos.aloha.Repository';
	
	jQuery.ajax({ url: url_href,
		dataType: "json",
		context: document.body,
		async: false, // plugin init should wait for success b4 continuing
	    success: function(data) {
			jQuery.each(data,function(k,v){
				
				path = '/' + k;
				path = that.addFolder(root, k);
				that.settings.data.push({ id: that.settings.data.length, name: k,
					url:k, objectType:'website', parentId: root });
			});
		}
	});
	this.settings.data[0].parentId = '/';
    this.repositoryName = 'KaraCos';
}

GENTICS.Aloha.Repositories.KaraCos.addFolder = function (path, name) {
	if (path != '/') {
		p = path + '/' + name;		
	} else {
		p = '/' + name;
	}
	
	if ( name && !this.folder[p] ) {
		this.folder[p] = {
				id: p,
				displayName: (name)?name:path,
				parentId: path,
				objectType: 'folder',
				repositoryId: this.repositoryId
		};
		
		console.log('added element');
		console.log(this.folder[p]);
	}
	return p;
}

/**
 * Searches a repository for object items matching query if objectTypeFilter.
 * If none found it returns null.
 */
GENTICS.Aloha.Repositories.KaraCos.query = function( p, callback) {
	// Not supported; filter, orderBy, maxItems, skipcount, renditionFilter
	// 
	//console.log("query");
	var d = this.settings.data.filter(function(e, i, a) {
		//var r = new RegExp(queryString, 'i'); 
		var ret = false;
		return ( !p.inFolderId || p.inFolderId == e.parentId );
		/* (
			( !queryString || e.displayName.match(r) || e.url.match(r) ) && 
			( !objectTypeFilter || jQuery.inArray(e.objectType, objectTypeFilter) > -1) &&
			( !inFolderId || inFolderId == e.parentId ) 
		);*/
	});
	console.log(d);
	callback.call( this, d);
};

/**
 * returns the folder structure as parsed at init.
 */
GENTICS.Aloha.Repositories.KaraCos.getChildren = function( p, callback) {
	var d = [];
	console.log("getChildren");
	console.log(p.inFolderId);
	for ( e in this.folder ) {
		var l = this.folder[e].parentId;
		if ( typeof this.folder[e] != 'function' && ( // extjs prevention
			this.folder[e].parentId == p.inFolderId || // all subfolders
			(!this.folder[e].parentId && p.inFolderId == this.repositoryId) // the hostname 
		)) {
			d.push(this.folder[e]);
		}
	}
	callback.call( this, d);
};
