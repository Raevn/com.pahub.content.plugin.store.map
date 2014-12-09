/*
	Plugin "Map Store"
	==================
	(Store) Manage installed Maps, which can be used with the System Sharing Mod by cptconundrum
	
	content_id: com.pahub.content.plugin.store.map
	store_id: com.pahub.content.plugin.store.plugin
	author: Raevn
*/

function load_map_store_plugin(data, folder) {
	model.content["maps"] = {
		folder: folder,
		
		writeMaplist: function () {
			if (pahub.api.content.contentStoreExists("com.pahub.content.plugin.store.map") == true) {
				var store = pahub.api.content.getContentStore("com.pahub.content.plugin.store.map");
				var maps = store.local_content_items();
				var enabled_maps = [];
				for (var i = 0; i < maps.length; i++) {
					enabled_maps.push("\"coui://ui/mods/com.pa.pahub.mods.maps/systems/" + maps[i].data.file + ".pas\"");
				}
				var mapListJS = "cShareSystems.load_pas(\"Offline Systems\", [\n" + enabled_maps.join(",\n") + "]);";
				writeToFile(path.join(constant.PAHUB_CLIENT_MODS_DIR, "com.pa.pahub.mods.maps", "ui", "mods", "com.pa.pahub.mods.maps", "maplist.js"), mapListJS);
			} else {
				pahub.api.log.addLogMessage("error", "Failed to find content store 'com.pahub.content.plugin.store.plugin'");
			}
		}
	}
	
	setConstant("PAHUB_CLIENT_MODS_DIR", path.join(constant.PA_DATA_DIR, "mods"));
	
	//create the folder structure for the mod
	if (fs.existsSync(path.join(constant.PAHUB_CLIENT_MODS_DIR, "com.pa.pahub.mods.maps", "ui", "mods", "com.pa.pahub.mods.maps", "systems")) == false) {
		mkdirp.sync(path.join(constant.PAHUB_CLIENT_MODS_DIR, "com.pa.pahub.mods.maps", "ui", "mods", "com.pa.pahub.mods.maps", "systems"));
	}
	//create the modinfo.json file
	if (fs.existsSync(path.join(constant.PAHUB_CLIENT_MODS_DIR, "com.pa.pahub.mods.maps", "modinfo.json")) == false) {
		var modinfoJSON = {
			"identifier": "com.pa.pahub.mods.maps",
			"content_id": "com.pa.pahub.mods.maps",
			"store_id": "com.pahub.content.plugin.store.mod.client",
			"context": "client",
			"display_name": "Offline Maps",
			"description": " ",
			"author": "pahub",
			"version": "1.0.0",
			"signature": "not yet implemented",
			"priority": 500,
			"enabled": true,
			"category": [
				"ui"
			],
			"scenes": {
				"load_planet": [
					"coui://ui/mods/com.pa.pahub.mods.maps/maplist.js"
				]
			},
			"dependencies": [
				"com.pa.conundrum.cShareSystems"
			]
		};
		writeJSONtoFile(path.join(constant.PAHUB_CLIENT_MODS_DIR, "com.pa.pahub.mods.maps", "modinfo.json"), modinfoJSON);
	}
	
	pahub.api.content.addContentStore(data.content_id, data.display_name, data);
	
	var group_func_map_planets = function (content) {
		if (content.store_id != "com.pahub.content.plugin.store.map") {
			return "Not applicable";
		} else {
			return content.data.map_data.planets.length + " planet" + (content.data.map_data.planets.length > 1 ? "s" : "");
		}
	}
	
	var group_func_map_server = function (content) {
		if (content.store_id != "com.pahub.content.plugin.store.map") {
			return "Not applicable";
		} else {
			return content.data.map_data.server;
		}
	}
	
	var sort_non_maps = function(left, right) {
		if (pahub.api.content.getSortAscending(true) == true ) {
			if (left.store_id != "com.pahub.content.plugin.store.map") { return 1; }
			if (right.store_id != "com.pahub.content.plugin.store.map") { return -1; }
		} else {
			if (left.store_id != "com.pahub.content.plugin.store.map") { return -1; }
			if (right.store_id != "com.pahub.content.plugin.store.map") { return 1;	}
		}
		return false;
	}
	
	pahub.api.content.addSortMethod(true, "Map Server", function(left, right) {
		if (left.data.hasOwnProperty("map_data") == true && right.data.hasOwnProperty("map_data") == true) {
			var sortValue = left.data.map_data.server == right.data.map_data.server ? 0 : (left.data.map_data.server < right.data.map_data.server ? -1 : 1);
			if (pahub.api.content.getSortAscending(true) == false ) {
				sortValue = 0 - sortValue;
			}
		}
		return sort_non_maps(left, right) || sortValue;
	}, group_func_map_server);
	
	pahub.api.content.addSortMethod(false, "Map Server", function(left, right) {
		if (left.data.hasOwnProperty("map_data") == true && right.data.hasOwnProperty("map_data") == true) {
			sortValue = left.data.map_data.server == right.data.map_data.server ? 0 : (left.data.map_data.server < right.data.map_data.server ? -1 : 1);
			if (pahub.api.content.getSortAscending(false) == false ) {
				sortValue = 0 - sortValue;
			}
		}
		return sort_non_maps(left, right) || sortValue;
	}, group_func_map_server);
	
	pahub.api.content.addSortMethod(true, "Planets", function(left, right) {
		if (left.data.hasOwnProperty("map_data") == true && right.data.hasOwnProperty("map_data") == true) {
			var sortValue = left.data.map_data.planets.length == right.data.map_data.planets.length ? 0 : (left.data.map_data.planets.length < right.data.map_data.planets.length ? -1 : 1);
			if (pahub.api.content.getSortAscending(true) == false ) {
				sortValue = 0 - sortValue;
			}
		}
		return sort_non_maps(left, right) || sortValue;
	}, group_func_map_planets);
	
	pahub.api.content.addSortMethod(false, "Planets", function(left, right) {
		if (left.data.hasOwnProperty("map_data") == true && right.data.hasOwnProperty("map_data") == true) {
			var sortValue = left.data.map_data.planets.length == right.data.map_data.planets.length ? 0 : (left.data.map_data.planets.length < right.data.map_data.planets.length ? -1 : 1);
			if (pahub.api.content.getSortAscending(false) == false ) {
				sortValue = 0 - sortValue;
			}
		}
		return sort_non_maps(left, right) || sortValue;
	}, group_func_map_planets);
}

function unload_map_store_plugin(data) {	
	//TODO: remove sort methods once API to do so is available
	unsetConstant("PAHUB_CLIENT_MODS_DIR");
	delete model.content["maps"];
}

function map_store_write_content(content) {
	var data = content.data.map_data;
	writeJSONtoFile(path.normalize(content.url), data);
	model.content.maps.writeMaplist();
}

function map_store_install_content(content_id, update) {
	if (pahub.api.content.contentItemExists(false, content_id) == true) {
		var content = pahub.api.content.getContentItem(false, content_id);
		var data = $.extend({}, content.data.map_data);
		writeJSONtoFile(path.join(constant.PA_DATA_DIR, content.store.data.local_content_path, content.data.file + ".pas"), data);
		model.content.maps.writeMaplist();
	} else {
		pahub.api.log.addLogMessage("error", "Failed to install map '" + content_id + "': Map data not found");
	}
}

function map_store_uninstall_content(content_id) {
	if (pahub.api.content.contentItemExists(true, content_id) == true) {
		var content = pahub.api.content.getContentItem(true, content_id);
		pahub.api.content.removeContentItem(true, content_id);
		try {
			fs.unlinkSync(path.join(constant.PA_DATA_DIR, content.store.data.local_content_path, content.data.file + ".pas"));
		} catch (err) {
			pahub.api.log.addLogMessage("error", "Error removing map '" + content.data.file + ".pas': " + err);
		}
	} else {
		pahub.api.log.addLogMessage("error", "Failed to uninstall map '" + content_id + "': Map is not installed");
	}

}

function map_store_find_online_content(store_id, catalogJSON) {
	/*
		catalogJSON format:
		{
			"servers" : [
				{
					"name" : "Default Server",
					"save_url" : "http://1-dot-winged-will-482.appspot.com/save",
					"search_url" : "http://1-dot-winged-will-482.appspot.com/search"
				},
				...
			]
		}
	*/
	if (pahub.api.content.contentStoreExists(store_id) == true) {
		var store = pahub.api.content.getContentStore(store_id);
		if (catalogJSON.hasOwnProperty("servers") == true) {
			var serverList = catalogJSON.servers;
			for (var i = 0; i < serverList.length; i++) {
			
				//TODO: hard-coded limit will eventually be a problem.
				var params = "?start=0&limit=150&name=&creator=&minPlanets=1&maxPlanets=16&sort_field=system_id&sort_direction=DESC";
				(function(servername, i) {
					pahub.api.resource.loadResource(serverList[i].search_url + params, "get", {
						name: "map information (" + serverList[i].name + ")",
						mode: "async",
						success: function(resource) {
							try {
								var serverMapsJSON = JSON.parse(resource.data);
							} catch (err) {
								pahub.api.log.addLogMessage("error", "Failed to parse system data from server '" + serverList[i].name + "'");
								return;
							}
							if (serverMapsJSON.hasOwnProperty("systems") == true) {
								var systemList = serverMapsJSON.systems;
								for (var j = 0; j < systemList.length; j++) {
									systemList[j]["server"] = servername;
									if (systemList[j].hasOwnProperty("name") == true) {
										var planetNames = ""
										if (systemList[j].hasOwnProperty("planets") == true) {
											var planetCount = systemList[j].planets.length
											for (var k = 0; k < planetCount; k++) {
												if (k > 0) {
													planetNames += ", ";
												}
												planetNames += systemList[j].planets[k]["name"] || "Unnamed Planet";
											}
											
											var file_name = systemList[j].name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
											var system_content_id = "com.pahub.content.map." + file_name;
											
											var systemInfo = {
												"content_id": system_content_id,
												"file": file_name,
												"store_id": "com.pahub.content.plugin.store.map",
												"display_name": systemList[j].name,
												"description": (systemList[j]["description"] ? systemList[j]["description"] + "\n" : "") + planetCount + " planet system. Planets: " + planetNames,
												"author": systemList[j]["creator"] || "",
												"version": systemList[j]["version"] || "1.0.0",
												"date": systemList[j]["date"] || "2014/11/05",
												"icon": path.join(model.content.maps.folder, "system" + planetCount + ".png"),
												"enabled": true,
												"map_data": systemList[j]
											}
											pahub.api.content.addContentItem(false, store_id, system_content_id, systemInfo.display_name, "", systemInfo);
										} else {
											pahub.api.log.addLogMessage("warn", "No planets defined for system '" + systemList[j].name + "'");
										}
									} else {
										pahub.api.log.addLogMessage("warn", "A system with no name is defined for server '" + serverList[i].name + "'");
									}
								}
							} else {
								pahub.api.log.addLogMessage("warn", "No systems are defined for server '" + serverList[i].name + "'");
							}
						},
						fail: function(resource) {
							pahub.api.log.addLogMessage("error", "Failed to download system list for server '" + serverList[i].name + "'");
						}
					});
				})(serverList[i].name, i);
			}
		} else {
			pahub.api.log.addLogMessage("error", "No map servers are defined");
		}
	} else {
		pahub.api.log.addLogMessage("error", "Failed to find content store '" + store_id + "'");
	}
}

function map_store_find_local_content(store_id) {
	var content_queue = [];
	
	if (pahub.api.content.contentStoreExists(store_id) == true) {
		var store = pahub.api.content.getContentStore(store_id);
		
		var files = [];
		var mapsFolder = path.join(constant.PAHUB_CLIENT_MODS_DIR, "com.pa.pahub.mods.maps", "ui", "mods", "com.pa.pahub.mods.maps", "systems");
		if(fs.existsSync(mapsFolder) == true ) {
		
			try {
				files = fs.readdirSync(mapsFolder);
			} catch (err) {
				pahub.api.log.addLogMessage("error", "Failed reading map directory");
				pahub.api.log.addLogMessage("error", "Error " + err.number + ": " + err.description);
				return [];
			}
			
			files.forEach(function(file, index) {
				if (path.extname(file) == ".pas") {
					var pasJSON = readJSONfromFile(path.join(mapsFolder,file));
					if (pasJSON != false) {
						var planetNames = ""
						if (pasJSON.hasOwnProperty("planets") == true) {
							var planetCount = pasJSON.planets.length
							
							for (var k = 0; k < pasJSON.planets.length; k++) {
								if (k > 0) {
									planetNames += ", ";
								}
								planetNames += pasJSON.planets[k].name;
							}
							
							var systemInfo = {
								"content_id": "com.pahub.content.map." + path.basename(file, ".pas"),
								"file": path.basename(file, ".pas"),
								"store_id": "com.pahub.content.plugin.store.map",
								"display_name": pasJSON["name"] || "Unknown System",
								"description": (pasJSON["description"] ? pasJSON["description"] + "\n" : "") + planetCount + " planet system. Planets: " + planetNames,
								"author": pasJSON["creator"] || "",
								"version": pasJSON["version"] || "1.0.0",
								"date": pasJSON["date"] || "2014/11/05",
								"icon": path.join(model.content.maps.folder, "system" + planetCount + ".png"),
								"enabled": true,
								"required": {
									"com.pa.pahub.mods.maps" : "*", 
									"com.pa.conundrum.cShareSystems" : "*"
								},
								"map_data": pasJSON
							}
							
							content_queue.push({
								content_id: systemInfo.content_id,
								store_id: systemInfo.store_id,
								url: path.join(path.join(constant.PAHUB_CLIENT_MODS_DIR, "com.pa.pahub.mods.maps", "ui", "mods", "com.pa.pahub.mods.maps", "systems", file)),
								data: systemInfo
							});
						} else {
							pahub.api.log.addLogMessage("warn", "No planets defined for system '" + pasJSON["name"] + "'");
						}
					} else {
						pahub.api.log.addLogMessage("error", "Failed loading map '" + path.join(mapsFolder,file) + "'");
					}
				}
			});
		} else {
			pahub.api.log.addLogMessage("error", "Failed loading maps: folder does not exist");
		}
	} else {
		pahub.api.log.addLogMessage("error", "Failed to find content store '" + store_id + "'");
	}
	return content_queue;
}