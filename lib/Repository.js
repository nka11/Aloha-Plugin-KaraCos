
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
	var req_str = p.queryString;
	if (req_str != null && p.inFolderId == null)  {
		callback.call( this, this.findInDomain(req_str));
	}
	if (p.inFolderId != null) {
		folderId = p.inFolderId;
		if (folderId.match(new RegExp("org.karacos.aloha.Repository"))) {
			folderId = folderId.split("org.karacos.aloha.Repository")[0];
		}
		callback.call( this, this.getObjectsAtUrl(folderId));
	}
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
	if (url_href == '/LinksFolder') {
		jQuery.ajax({ url: "/",
			dataType: "json",
			contentType:"application/json",
			context: document.body,
			type: 'POST',
			data: '{"method":"view_tracking", "id":1,"params":{}}',
			async: false, // plugin init should wait for success b4 continuing
			
		    success: function(data) {
				jQuery.each(data.data,function(k,v){
					if (!v.description) {v.description = "No name";}
					result.push(new that.Document({
						'id': '/LinksFolder/'+k, 
						'name': v.description,
						'url': v.forward, 
						'objectType': 'link',
						'type': 'document',
						'repositoryId': "org.karacos.aloha.Repository",
							}));
				});
			}
		}); // jQuery.ajax for items
		return result;
	}
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
	if (url_href != "/" && url_href != ""  ) {
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
		}); // jQuery.ajax for files
	} else {
		result.push(new that.Folder({
						'id': '/LinksFolder', 
						'name': 'LinksFolder',
						'url': 'LinksFolder', 
						'objectType': 'folder',
						'type': 'folder',
						'repositoryId': "org.karacos.aloha.Repository",
						'parentId': '/'
							}));
	}
	return result
};

GENTICS.Aloha.Repositories.KaraCos.findInDomain = function(queryString) {
	var result =    [];
	var that = this;
	jQuery.ajax({ url: "/",
		dataType: "json",
		contentType:"application/json",
		context: document.body,
		type: 'POST',
		data: '{"method":"_search_by_name", "id":1,"params":{"name":"'+queryString+'"}}',
		async: false, // plugin init should wait for success b4 continuing
		
	    success: function(data) {
	    	
			jQuery.each(data.data,function(k,v){
				result.push(new that.Folder({
					'id': k, 
					'name': v.name,
					'url': v.url, 
					'objectType': v.objectType,
					'type': v.type,
					'repositoryId': "org.karacos.aloha.Repository",
						}));
			});
		}
	}); // jQuery.ajax for items
	// get links
	jQuery.ajax({ url: "/",
		dataType: "json",
		contentType:"application/json",
		context: document.body,
		type: 'POST',
		data: '{"method":"view_tracking", "id":1,"params":{}}',
		async: false, // plugin init should wait for success b4 continuing
		
	    success: function(data) {
			jQuery.each(data.data,function(k,v){
				re = new RegExp(queryString);
				if (!v.description) {v.description = "No name";}
				if (v.forward.match(re) || v.description.match(re)) {
				result.push(new that.Document({
					'id': '/LinksFolder/'+k, 
					'name': v.description,
					'url': v.forward, 
					'objectType': 'link',
					'type': 'document',
					'repositoryId': "org.karacos.aloha.Repository",
						}));
				}
			});
		}
	}); // jQuery.ajax for links
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