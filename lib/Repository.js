
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
    this.repositoryName = 'KaraCos';
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
	var req_url = p.inFolderId.split("org.karacos.aloha.Repository")[0];
	callback.call( this, this.getObjectsAtUrl(req_url));
};


GENTICS.Aloha.Repositories.KaraCos.getObjectsAtUrl = function(url_href) {
	var result =    [];
	var that = this;
	jQuery.ajax({ url: url_href + "/w_browse_types",
		dataType: "json",
		context: document.body,
		async: false, // plugin init should wait for success b4 continuing
	    success: function(data) {
	    	
			jQuery.each(data,function(k,v){
				result.push(new that.Folder({
					'id': url_href + '/' + k, 
					'name': k,
					'url': url_href + '/' + k, 
					'objectType': 'folder',
					'type': 'folder',
					'repositoryId': "org.karacos.aloha.Repository",
					'parentId': url_href
						}));
			});
		}
	}); // jQuery.ajax for folders
	jQuery.ajax({ url: url_href + "/_att",
		dataType: "json",
		context: document.body,
		async: false, // plugin init should wait for success b4 continuing
	    success: function(data) {
	    	
			jQuery.each(data.form.fields[0].values,function(k,v){
				result.push(new that.Document({
					'id': url_href + '/' + v.label, 
					'name': v.label,
					'url': v.value, 
					'objectType': 'document',
					'type': 'document',
					'repositoryId': "org.karacos.aloha.Repository",
					'parentId': url_href
						}));
			});
		}
	}); // jQuery.ajax for folders
	return result
};

GENTICS.Aloha.Repositories.KaraCos.Folder = function (data) {
	//GENTICS.Utils.applyProperties(this,data);
	GENTICS.Aloha.Repositories.KaraCos.Folder.superclass.constructor.call(this,data);
};

Ext.extend(GENTICS.Aloha.Repositories.KaraCos.Folder, GENTICS.Aloha.Repository.Folder, {
	
});

GENTICS.Aloha.Repositories.KaraCos.Document = function (data) {
	//GENTICS.Utils.applyProperties(this,data);
	GENTICS.Aloha.Repositories.KaraCos.Document.superclass.constructor.call(this,data);
};

Ext.extend(GENTICS.Aloha.Repositories.KaraCos.Document, GENTICS.Aloha.Repository.Document, {
	
});