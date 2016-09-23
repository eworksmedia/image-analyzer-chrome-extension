var IMAGE_ANALYZER = (function(){
	/**
		Private Vars
	**/
	var extension_manifest = {};
	var context_item_contexts = ['page', 'selection', 'link', 'editable', 'image', 'video', 'audio'];
	var context_item_root = -1;
	var context_menu_items = [];
	var context_menu_items_references = {};
	
	/**
		Private Methods
	**/
	var _init = function() {
		// get the manifest
		extension_manifest = chrome.runtime.getManifest();
		// top-level context menu item
		context_item_root = chrome.contextMenus.create({
			"title": extension_manifest.name,
			"contexts": context_item_contexts
		});
		// context menu items
		context_menu_items = [
			{
				'id': 'IMAGE_ANALYZER_CONTEXT_MENU_ITEM_IMAGE_PROPERTIES',
				'title': 'Analyze selected',
				'parent': context_item_root,
				'context': [
					'image'
				]
			},{
				'id': 'IMAGE_ANALYZER_CONTEXT_MENU_ITEM_IMAGE_BROWSER',
				'title': 'Analyze all',
				'parent': context_item_root,
				'context': context_item_contexts
			}
		];
		// create context menu items
		for(var i = 0; i < context_menu_items.length; i++) {
			context_menu_items_references[context_menu_items[i].id] = chrome.contextMenus.create({
				'id': context_menu_items[i].id,
				'type': context_menu_items[i].type,
				'parentId': context_menu_items[i].parent,
				'title': context_menu_items[i].title,
				'contexts': context_menu_items[i].context,
				'onclick': IMAGE_ANALYZER.onContextItemClick
			});
		};
	};
	
	var _onContextItemClick = function(info, tab) {
		if(tab.id) {
			switch(info.menuItemId) {
				case 'IMAGE_ANALYZER_CONTEXT_MENU_ITEM_IMAGE_PROPERTIES':
					chrome.tabs.sendMessage(tab.id, {
							'action': 'IMAGE_ANALYZER_CONTEXT_MENU_ITEM_IMAGE_PROPERTIES',
							'image': info.srcUrl,
							'link': info.linkUrl
						}
					);
				break;
				case 'IMAGE_ANALYZER_CONTEXT_MENU_ITEM_IMAGE_BROWSER':
					chrome.tabs.sendMessage(tab.id, {
							'action': 'IMAGE_ANALYZER_CONTEXT_MENU_ITEM_IMAGE_PROPERTIES',
							'image': '',
							'link': ''
						}
					);
				break;
			};
		};
	};	
	
	var _onMessage = function(request, sender, callback) {
		switch(request.action) {
			case 'IMAGE_ANALYZER_IMAGE_HISTOGRAM':
				var histogram = {};
				var img = new Image();
				img.src = request.img;
				$(img).on('load', function(e) {
					$(img).pixastic('colorhistogram', {
						color: 'rgb(255, 0, 0)"',
						returnValue: histogram
					});
					callback(JSON.parse($(img).attr('data-histogram')));
				});
				return true;
			break;	
			case 'IMAGE_ANALYZER_IMAGE_HISTOGRAM_AVERAGE':
				var histogram = {};
				var img = new Image();
				img.src = request.img;
				$(img).on('load', function(e) {
					$(img).pixastic('histogram', {
						average: false,
						paint: false,
						color: 'rgb(255, 0, 0)"',
						returnValue: histogram
					});
					callback(JSON.parse($(img).attr('data-histogram')));
				});
				return true;
			break;	
		};
	};
	/**
		Public
	**/
	return {
		init: _init,
		onMessage: _onMessage,
		onContextItemClick: _onContextItemClick
	}
}());
IMAGE_ANALYZER.init();
chrome.runtime.onMessage.addListener(IMAGE_ANALYZER.onMessage);