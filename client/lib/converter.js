
Converter = function(xml, limit, offset, debug) {

	this.xml = xml;
	this.limit = limit || 25;
	this.offset = offset || 0;
	this.debug = debug || null;
	this.json = (this.getJson()).root[0]; //get root
	this.result = null;
	this.abor = null;
	this.hideAssociations = false;
	this.project = ""; //bio2rdf or embl: this is needed to select the target sparql endpoint, where the query is executed on

	//graph stuff
	this.connections = new Array();
	this.entities = new Array();
	this.properties = new Array();
	this.query = squel.select();
	this.services = new Object();


	//uniprot helper: if the query consists only of an uniprot service, the flag is true, otherwise false. in function Converter.prototype.parseEntity the flag is set to false, if a non uniprot entity is added.
	this.onlyUniprot = true;


	this.resultTable = null;

  	_.bindAll(this, 'sparqlCallback', 'sparqlCallback_pubmed');

  	this.run();


}

Converter.prototype.getJson = function() {
	return $.xmlToJSON(this.xml);
}

//returns the INode with the given id
Converter.prototype.getElement = function (id) {
    //loop connections
    var element;
    element = _(this.json.Connector).find(function(x) {
      return x["@id"] == id;
    });
    //loop entities
    if(element == undefined) element = _(this.json.Entity).find(function(x) {
      return x["@id"] == id;
    });

    return element;
}

//order entities to prevent dependency/var errors
Converter.prototype.orderEntities = function () {

	if(this.entities.length > 0) {
		for (var i = 0; i < this.entities.length; i++) {
			for (var j = 0; j < this.connections.length; j++) {
				if(this.connections[j].targetID == this.entities[i].id)
					this.entities[i].order--;
			};
		};
		this.entities = _.sortBy(this.entities, function(entity){ 
			return entity.order; 
		});

		for (var i = 0; i < this.entities.length; i++) {
			if(this.entities[i].namespace == "bioportal" && this.entities[i].hasFilter == "false") {
				this.entities[i].order += 2;
			}
			if(this.entities[i].hasFilter == "true") {
				this.entities[i].order -= 1;
			}
			for (var j = 0; j < this.connections.length; j++) {
				if(this.connections[j].targetID == this.entities[i].id) {

					var source = _.where(this.entities, {id: this.connections[j].sourceID});
					this.entities[i].order += source[0].order;
				}
			};
		};

		this.entities = _.sortBy(this.entities, function(entity){ 
			return entity.order; 
		});
	}
	else {
		tb.warn("Error ordering entities.", "Converter");
		return null;
	}


}


/***********************************************************************************************************************************************/
/***********************************************************************************************************************************************/
/***********************************************************************************************************************************************

Run the SPARQL Query on the endpoint
When done, run the callback function sparqlCallback() to convert and display the results

***********************************************************************************************************************************************/
/***********************************************************************************************************************************************/
/***********************************************************************************************************************************************/

Converter.prototype.getResult = function() {

	
	if(this.debug) {
		converter = this;
		$("#sparql-query-ta").val(this.query.toString());
		$("#debug-run-btn").click(function() {
			//Show a loading spinner on the GUI
			var target = document.getElementById('spinner');
			spinner = new Spinner().spin(target);
			//get the query from the textarea, and run it
			converter.query = $("#sparql-query-ta").val();
			sparqlQueryJson(converter.query, converter.project, converter.sparqlCallback, null, false, converter.limit, converter.offset);
			$("#debug-modal-hide").click();
		});
	}	
	else
		sparqlQueryJson(this.query, this.project, this.sparqlCallback, null, false, this.limit, this.offset);

}

/***********************************************************************************************************************************************/
/***********************************************************************************************************************************************/
/***********************************************************************************************************************************************

Callback function. is called when the actual SPARQL Query on the remote endpoint sends back its results
jsonObj: result of the query, as a JSON Object
labels: true/false, used to show or hide the labels in the arbor results graph. is passed to the ArborSetup function at the end of the function

1. Create a results table
2. Create a results graph

***********************************************************************************************************************************************/
/***********************************************************************************************************************************************/
/***********************************************************************************************************************************************/
Converter.prototype.sparqlCallback = function(jsonObj, labels) {

	
	Session.get("cancelRun");
	if (Session.get("cancelRun")) {
		//remove the loading results spinner
		spinner.stop();
		//show a modal to inform the user that no results were found
		$('#cancel').hide();
		Session.set("cancelRun", false);
		return;
	}

	var labels = labels || false;

	// console.log(jsonObj);
	// console.dir(jsonObj);
	if(jsonObj) result = jsonObj;

	//running query was successful, now enable the run button again
	$('#run').prop('disabled', false);
	$('#cancel').hide();
	Session.set("cancelRun", false);

	//check if the result is empty
	if(result.results.bindings.length == 0) {
		//remove the loading results spinner
		spinner.stop();
		//show a modal to inform the user that no results were found
		bootbox.alert("No Results found! Please check your Query Graph.", function() {});
		return;
	}



/***********************************************************************************************************************************************	
CREATE TABLE
************************************************************************************************************************************************/

	/********************************
	TABLE HEAD
	********************************/
	//get variables/key/node names
	var nodes = new Array();
	for (binding in result.results.bindings) {
		var currentNodes = Object.keys(result.results.bindings[binding]); 
		nodes = _.union(nodes, currentNodes);
	}
	var tableHead = "";
	//iterate over all nodes, and use them as the tables header
	for(var name in nodes) {
		if( resultSetVariables.length==0 || _.contains(resultSetVariables, "?" + nodes[name])) {
			tableHead += "<th>" + convertHeading(nodes[name]) + "</th>";
		}
	};

	/********************************
	TABLE BODY
	********************************/
	var tableRows = "";
	//iterate each result object
	for (var row in result.results.bindings) {
		tableRows += "<tr>";
		//iterate each value
		for (var key in result.results.bindings[row]) {
		  if (result.results.bindings[row].hasOwnProperty(key) && (resultSetVariables.length==0 || _.contains(resultSetVariables, "?" + key))) {
		    var value = "x";
		    if(result.results.bindings[row][key].value != undefined ) {
		    	val = result.results.bindings[row][key].value;
		    	if(val.match(regexURL)) {
		    		value = '<a href="' + val + '" target="_blank">' + val.substr(val.lastIndexOf('/') + 1) + '</a>';
		    	}
		    	else
		    		value = val;
		    }
		    tableRows += "<td>" + value + "</td>";
		  }
		}	

	  	if(Object.keys(result.results.bindings[row]).length != nodes.length ) {
		  	tableRows += "<td></td>";
	  	}
		tableRows += "</tr>";
	};

	/*******************************
	CREATE RESULTS TABLE
	*******************************/
	//reset the table
	//deleting with api functions not working, so we delete the dom element...

    //delete the old results table, if any
	$("#results_container").children().detach();
	//create unique id
	var id = Math.floor( Math.random()*99999 );
	//append a new table to the DOM
	$("#results_container").append('<table id="result_table' + id + '" cellpadding="0" cellspacing="0" border="0" class="table table-striped table-bordered"><thead><tr></tr></thead><tbody></tbody></table>');

	//append head and body to table
	$('#results_container table thead tr').append(tableHead);
	$('#results_container table tbody').append(tableRows);

	//add the results table
	this.resultTable = $('#results_container table').dataTable({
	    "sDom": "<'row-fluid'<'span6'l><'span6'f>r>t<'row-fluid'<'span6'i><'span6'p>>"
	    , "sPaginationType": "bootstrap"
	    , "oLanguage": {
	        "sLengthMenu": "_MENU_ records per page"
	    }
	});

	console.log("######## JSON OBEJCT #######");
	console.log(result);

/***********************************************************************************************************************************************	
CREATE ABOR JS GRAPH
************************************************************************************************************************************************/
//todo..


/***********************************************************************************************************************************************	
SHOW
************************************************************************************************************************************************/
	//remove the loading results spinner
	spinner.stop();

	$("#results_table").fadeIn(800);
	//scroll to the results table
	$.scrollTo($("#results_table"), 600);
}

//helper functions for the callback
//sometimes, if there is more than 1 pubmed link, they are written in 1 link, like this:
//http://bio2rdf.org/pubmed:20638924;22188361	
//this function separates the id's, and creates multiple links
//return an array of all pubmed links
Converter.prototype.sparqlCallback_pubmed = function(pubmedURL) {
	//get from http://bio2rdf.org/pubmed:20638924;22188361 to ["20638924","22188361"]
	var pubmed_ids_array = pubmedURL.split("/pubmed:")[1].split(";");
	return _.map(pubmed_ids_array, function(id){ return "http://bio2rdf.org/pubmed:" + id; });
}

/***********************************************************************************************************************************************/
/***********************************************************************************************************************************************/
/***********************************************************************************************************************************************

This function creates the SPARQL Query.
Starting from the default SELECT * WHERE, call createService() function to add all needed Service Statements to the Query.

***********************************************************************************************************************************************/
/***********************************************************************************************************************************************/
/***********************************************************************************************************************************************/
Converter.prototype.sparql = function() {

	//reset resultSetVariables
	resultSetVariables = new Array();

    this.query.field("*");
    this.query.from("");
    this.where = squel.expr();  //this.where is a SEPARATE WHERE clause, used to construct the this.query body. it is appended at the end to this.query.where

    //now create the where block. for each entity, create a service if needed. if there is a service already, add it to the corresponding service block
	for (var i = 0; i < this.entities.length; i++) {
		this.createServiceNew(this.entities[i], true);
	};

	//each service has its own where block during creation. this block just connects all service block into one where clause
    query = this.query;


    /*now sorting services, based on how many filters each service got*/
    var service_strings = new Array();
    _.each(this.services, function(value, key, list) {
    	if(value.where != undefined) {
    		value.where.end();
    		service_strings.push(value.where);
    	}
    });

    //these 2 parts are only for debugging!!
	service_strings = _.sortBy(service_strings, function(service){
		var count = 0;
		if(service.toString().match(/> '/g) 	!= null) count += service.toString().match(/> '/g).length;
		if(service.toString().match(/filter/g) 	!= null) count += service.toString().match(/filter/g).length;
		if(service.toString().match(/FILTER/g) 	!= null) count += service.toString().match(/FILTER/g).length;
		if(service.toString().match(/(?:.*)(?:\<http)(?:\:\/\/)(?:www\.)?(?:[^\ ]*)(?:\>\ )(?:\<http)(?:\:\/\/)(?:www\.)?(?:[^\ ]*)(?:\>\.)/gm) 	!= null) count += service.toString().match(/(?:.*)(?:\<http)(?:\:\/\/)(?:www\.)?(?:[^\ ]*)(?:\>\ )(?:\<http)(?:\:\/\/)(?:www\.)?(?:[^\ ]*)(?:\>\.)/gm).length;
		return count;
	}).reverse();
    _.each(service_strings, function(value, key, list) {
    	query.where(value);
    });

    //continue with query building
    this.query = query;

    //set limit and offset to the query
    this.query += "";
    // this.query += " LIMIT " + this.limit + " OFFSET " + this.offset;
    // this.query += "\n &render=JSON&limit=25&offset=0";
    // this.query += "\n &format=JSON&limit=25&offset=0&inference=false";

    // if resultSetVariables are set, replace * with the desired variables!
    if(resultSetVariables.length != 0) {
    	// this.query = this.query.replace("distinct *", "distinct " + _.uniq(resultSetVariables).join(" "));
    }

    console.log("####### SPARQL #######");
    this.query = this.query.replace(/\. /g, ". " + "\n")
    this.query = this.query.replace(/\{/g, "{" + "\n")
    console.log(this.query.toString());

    $.pnotify({
		title: 'Created a SPARQL Query',
		text: 'Syntax/Graph is valid.',
		type: 'success',
		opacity: .8,
		delay: 3000
	});
    $.pnotify({
		title: 'Running SPARQL Query',
		text: 'Now running the query..',
		type: 'success',
		opacity: .8,
		delay: 3000
	});

}


Converter.prototype.isConnected = function(obj1, obj2) {

	var connection = _.find(this.connections, function(conn){
		if(conn.sourceID == obj1.id && conn.targetID == obj2.id) {
			return true;
		}
	});
	return connection;

}

//checks if entity1 is target of entity2 (connection). if entity2 is not set, it will return true if entity1 is target of any other entity
Converter.prototype.isTarget = function(entity1, entity2) {

	if(entity2 != undefined) {
		var connection = _.find(this.connections, function(conn){
			if(conn.sourceID == entity2.id && conn.targetID == entity1.id) {
				return true;
			}
		});
		return connection;
	}
	else {
		var connection = _.find(this.connections, function(conn){
			if(conn.targetID == entity1.id) {
				return true;
			}
		});
		return connection;
	}


}

/***********************************************************************************************************************************************/
/***********************************************************************************************************************************************/
/***********************************************************************************************************************************************

This function creates a SPARQL Service.
It is used as a starting point after the default SELECT * WHERE
and iterates over all other entities and creates other Service Statements if needed

***********************************************************************************************************************************************/
/***********************************************************************************************************************************************/
/***********************************************************************************************************************************************/
Converter.prototype.createServiceNew = function (entity, newService) {

	//means that this entity has already been added to the query!
	if (entity.inQuery) {// tb.verbose("Entity " + entity.label + " already processed, proceeding to others." , "Converter - createService");
		return; 
	}

	
	//if a new service should be added, do this
	if(newService) {
		this.beginService(entity);
	}

	//create the sparql statement for this entity
	this.sparqlEntityStatement(entity);

	//parse all properties that are connected to this entity
	this.sparqlParseProperties(entity);

	//parse all other connections that are connected to this entity
	this.sparqlParseSpecialProperties(entity);

	entity.inQuery = true;

	//if there are other subjects in this service/namespace, parse them too. avoids creation of multtiple services for one namespace
	this.sparqlParseEntitiesInNamespace(entity);


	//as this service is done, create others if needed.
	//this actually contines the creation of the query!!
	for (var i = 0; i < this.entities.length; i++) {
		if(this.entities[i].inQuery) continue;
		if(this.isConnected(entity, this.entities[i])) {
			this.createServiceNew(this.entities[i], true);
		}
	};

}

/***********************************************************************************************************************************************/
/***********************************************************************************************************************************************/
/***********************************************************************************************************************************************

The following functions are parsing the converter intern representations of the graph's connections/properties/entities
and create SPARQL Statements of it.

***********************************************************************************************************************************************/
/***********************************************************************************************************************************************/
/***********************************************************************************************************************************************/

resultSetVariables = new Array();

Converter.prototype.beginService = function(entity) {

	this.services[entity.service] = new Object();
	this.services[entity.service].where = squel.expr();
	if(entity.service=="http://beta.sparql.uniprot.org/" && entity.namespace == "embl_uniprot" && this.onlyUniprot) {
		this.services[entity.service].where.service_sub_select_begin().service_endpoint("<" + entity.service + ">", "uniprot");
	}
	else {
		this.services[entity.service].where.service_begin().service_endpoint("<" + entity.service + ">");
	}
}

Converter.prototype.sparqlEntityStatement = function(entity) {


	//only create a ?entity a rdf:type statement if the entity is not target of another entity
	if(!this.isTarget(entity)) {
		if(entity.connector == null && entity.noType == false && entity.filter == false) { //noType only true if this entity has no rdf:type (for example: GO Function/Process)
			this.services[entity.service].where.statement_begin();
			this.services[entity.service].where.statement("?" + entity.shortName + "_ID" + entity.id, "a", "<" + entity.type + ">"); //example: ?Gene2 a <type:gene>
			this.services[entity.service].where.end();
			if(entity.isResult!=undefined && entity.isResult=="true") resultSetVariables.push("?" + entity.shortName + "_ID" + entity.id);
		}
		else if(entity.connector == "1") { //example: gene-drug-association
			this.services[entity.service].where.statement_begin();
			this.services[entity.service].where.statement("?" + entity.shortName + "_ID" + entity.id + "_from_" + entity.from + "_to_" + entity.to, "a", "<" + entity.type + ">"); //example: ?Gene2 a <type:gene>
			this.services[entity.service].where.end();
			resultSetVariables.push();
		}
		else if( entity.noType) { //get label if no type?
			if(entity.isResult!=undefined && entity.isResult=="true") {
				resultSetVariables.push("?" + entity.shortName + "_ID" + entity.id);
			}
		}
		else if(entity.filter == "true") {
			this.services[entity.service].where.statement_begin();
			this.services[entity.service].where.statement("?" + entity.shortName + "_ID" + entity.id, "a", "<" + entity.type + ">");
			this.services[entity.service].where.filter_regex("str(?" + entity.shortName + "_ID" + entity.id + ")", entity.filterContent); // regex(str(?entity), "needle")
			this.services[entity.service].where.end();
			if(entity.isResult!=undefined && entity.isResult=="true") resultSetVariables.push("?" + entity.shortName + "_ID" + entity.id);
		}
	}

}

Converter.prototype.sparqlParseProperties = function(entity) {


	for (var i = 0; i < this.properties.length; i++) {
		if(this.isConnected(entity, this.properties[i])) {
			var property = this.properties[i]; //readability
	        if(property.special) {
				var func = "connectionConfig.special."+property.shortName;
				eval(func)(this.services[entity.service].where, property, entity);
	        }

	        else if(property.goProperty && property.exact){ //property of an GO entity, like GO Function, AND exact value
			 	this.services[entity.service].where.statement_begin();
	            if(property.label != property.defaultLabel && property.label != "") {
	        		this.services[entity.service].where.statement("?" + entity.shortName + "_ID" + entity.id + "_source_" + entity.from, "<" + property.type + ">", "'" + property.exact_pre + property.label + "'"); //or rdfs:label
	            }
	            else {
	            	this.services[entity.service].where.statement("?" + entity.shortName + "_ID" + entity.id + "_source_" + entity.from, "<" + property.type + ">", "?" + property.shortName + "_ID" + entity.id);
	            }
	            if(property.isResult!=undefined && property.isResult=="true") resultSetVariables.push("?" + entity.shortName + "_ID" + entity.id + "_source_" + entity.from);
	           	this.services[entity.service].where.end();
	       	}
        	//numeric filter if the label is edited, otherwise, default property behaviour
            else if (property.numericFilter && property.optional) {
			 	this.services[entity.service].where.optional_begin();
	            if(property.label != property.defaultLabel && property.label != "") {
	        		this.services[entity.service].where.statement("?" + entity.shortName + "_ID" + entity.id, "<" + property.type + ">", "?" + property.shortName + "_ID" + entity.id);
	        		this.services[entity.service].where.filter_numeric("?" + property.shortName + "_ID" + entity.id, property.label );
	            }
	            else {
	            	this.services[entity.service].where.statement("?" + entity.shortName + "_ID" + entity.id, "<" + property.type + ">", "?" + property.shortName + "_ID" + entity.id);
	            }
           		if(property.isResult!=undefined && property.isResult=="true") resultSetVariables.push("?" + property.shortName + "_ID" + entity.id);
	            this.services[entity.service].where.end();
            }
            //exact string matching, if the label is edited, otherwise, default property behaviour
            else if (property.exact) {
			 	this.services[entity.service].where.statement_begin();
	            if(property.label != property.defaultLabel && property.label != "") {
	            	if(property.exact_literal_type) {
	        			this.services[entity.service].where.statement("?" + entity.shortName + "_ID" + entity.id, "<" + property.type + ">", '"' +  property.label + '"^^<' + property.exact_literal_type + ">"); 
	            	}
	            	else {
	        			this.services[entity.service].where.statement("?" + entity.shortName + "_ID" + entity.id, "<" + property.type + ">", "'" + property.exact_pre + property.label + "'"); 
	            	}
	            }
	            else {
	            	this.services[entity.service].where.statement("?" + entity.shortName + "_ID" + entity.id, "<" + property.type + ">", "?" + property.shortName + "_ID" + entity.id);
	            	if(property.isResult!=undefined && property.isResult=="true") resultSetVariables.push("?" + property.shortName + "_ID" + entity.id);
	            }

	           	this.services[entity.service].where.end();
            }
            //URL matching, if the label is edited, otherwise, default property behaviour
            //AND connector property, for example: pubmed articles for DTI 
            else if (property.urlFilter && property.connectorProperty) {
			 	this.services[entity.service].where.statement_begin();
	            if(property.label != property.defaultLabel && property.label != "") {
	        		this.services[entity.service].where.statement("?" + entity.shortName + "_ID" + entity.id + "_from_" + entity.from + "_to_" + entity.to, "<" + property.type + ">", "<" + property.baseUrl + property.label + ">"); //or rdfs:label
	            }
	            else {
	            	this.services[entity.service].where.statement("?" + entity.shortName + "_ID" + entity.id + "_from_" + entity.from + "_to_" + entity.to, "<" + property.type + ">", "?" + property.shortName + "_ID" + entity.id);
	            }
	            this.services[entity.service].where.end();
            }
            //URL matching, if the label is edited, otherwise, default property behaviour
            else if (property.urlFilter) {
			 	this.services[entity.service].where.statement_begin();
	            if(property.label != property.defaultLabel && property.label != "") {
	        		this.services[entity.service].where.statement("?" + entity.shortName + "_ID" + entity.id, "<" + property.type + ">", "<" + property.baseUrl + property.label + ">"); 	            }
	            else {
	            	this.services[entity.service].where.statement("?" + entity.shortName + "_ID" + entity.id, "<" + property.type + ">", "?" + property.shortName + "_ID" + entity.id);
	            }
	            this.services[entity.service].where.end();
            }
        	//numeric filter if the label is edited, otherwise, default property behaviour
            else if (property.numericFilter) {
			 	this.services[entity.service].where.statement_begin();
	            if(property.label != property.defaultLabel && property.label != "") {
	        		this.services[entity.service].where.statement("?" + entity.shortName + "_ID" + entity.id, "<" + property.type + ">", "?" + property.shortName + "_ID" + entity.id);
	        		if(property.label.indexOf("<") >= 0 || property.label.indexOf(">") >= 0) {
	        			this.services[entity.service].where.filter_numeric("?" + property.shortName + "_ID" + entity.id, property.label );
	        		}
	        		else {
	        			this.services[entity.service].where.filter_numeric("?" + property.shortName + "_ID" + entity.id, "=" + property.label );
	        		}
	            }
	            else {
	            	this.services[entity.service].where.statement("?" + entity.shortName + "_ID" + entity.id, "<" + property.type + ">", "?" + property.shortName + "_ID" + entity.id);
	            }
	            if(property.isResult!=undefined && property.isResult=="true") resultSetVariables.push("?" + property.shortName + "_ID" + entity.id);
	            this.services[entity.service].where.end();
            }
	        else if (property.multiTarget) {
			 	this.services[entity.service].where.statement_begin();
	        	this.services[entity.service].where.statement("?" + entity.shortName + "_ID" + entity.id, "<" + property.type + ">", "?" + property.shortName + "_multi"); 
	            if(property.label != property.defaultLabel && property.label != "") {
	                this.services[entity.service].where.statement("?" + property.shortName + "_multi", "bif:contains", "\"'" + property.label + "'\"");
	            }
	           	this.services[entity.service].where.end();
	        }
	        else if(property.connectorProperty){ //property of an connector entity, like gene-drug-association
			 	this.services[entity.service].where.statement_begin();
	        	this.services[entity.service].where.statement("?" + entity.shortName + "_ID" + entity.id + "_from_" + entity.from + "_to_" + entity.to, "<" + property.type + ">", "?" + property.shortName + "_ID" + entity.id); //or rdfs:label
	            if(property.label != property.defaultLabel && property.label != "") {
	                this.services[entity.service].where.statement("?" + property.shortName + "_ID" + entity.id, "bif:contains", "\"'" + property.label + "'\"");
	            }
	           	this.services[entity.service].where.end();
	       	}
	        else if(property.goProperty){ //property of an GO entity, like GO Function
			 	this.services[entity.service].where.statement_begin();
	        	this.services[entity.service].where.statement("?" + entity.shortName + "_ID" + entity.id + "_source_" + entity.from, "<" + property.type + ">", "?" + property.shortName + "_ID" + entity.id);
	            if(property.label != property.defaultLabel && property.label != "") {
	                this.services[entity.service].where.statement("?" + property.shortName + "_ID" + entity.id, "bif:contains", "\"'" + property.label + "'\"");
	            }
	           	this.services[entity.service].where.end();
	       	}
	        else {//default property
			 	this.services[entity.service].where.statement_begin();
	        	this.services[entity.service].where.statement("?" + entity.shortName + "_ID" + entity.id, "<" + property.type + ">", "?" + property.shortName + "_ID" + entity.id); //or rdfs:label
	            if(property.label != property.defaultLabel && property.label != "") {
	            	if(property.regexFilter){
	                	this.services[entity.service].where.filter_regex("?" + property.shortName + "_ID" + entity.id,  property.label );	
	                }
	                else {
	                	this.services[entity.service].where.statement("?" + property.shortName + "_ID" + entity.id, "bif:contains", "\"'" + property.label + "'\"");
	                }
	            }
	            if(property.isResult!=undefined && property.isResult=="true") resultSetVariables.push("?" + property.shortName + "_ID" + entity.id);
	           	this.services[entity.service].where.end();
	       	}
		}
	};
}

Converter.prototype.sparqlParseSpecialProperties = function(entity) {
	for (var i = 0; i < this.entities.length; i++) {

		if(this.isTarget(this.entities[i], entity)) {
			var connection = this.isTarget(this.entities[i], entity);
			if(connection.anyRelation == "true") {
			 	this.services[entity.service].where.statement_begin();
	        	this.services[entity.service].where.statement("?" + entity.shortName + "_ID" + entity.id, "?anyRelation_" + entity.id + "_" + this.entities[i].id, "?" + this.entities[i].shortName + "_ID" + this.entities[i].id); //or rdfs:label
	           	this.services[entity.service].where.end();
			}
			else {
				var func = "connectionConfig.special."+entity.shortName+"_TO_"+this.entities[i].shortName;
				eval(func)(this.services[entity.service].where, entity, this.entities[i], this.services);
			}
		}

	}	
}

Converter.prototype.sparqlParseEntitiesInNamespace = function(entity) {
	for (var i = 0; i < this.entities.length; i++) {
		if(this.entities[i].inQuery) continue;
		if(entity.service == this.entities[i].service) {
			this.createServiceNew(this.entities[i], false);
		}
	}
}

/***********************************************************************************************************************************************/
/***********************************************************************************************************************************************/
/***********************************************************************************************************************************************

The following parse functions are parsing the XML representation of the graph, and save
them in this converter as properties: connections, properties, entities

***********************************************************************************************************************************************/
/***********************************************************************************************************************************************/
/***********************************************************************************************************************************************/
Converter.prototype.parseEntities = function () {
    if(this.json.Entity != undefined && this.json.Entity.length != 0){

      for (var i = 0; i < this.json.Entity.length; i++) {
          this.parseEntity(this.json.Entity[i]);
      }

    } 
    else {
    	tb.warn("Error parsing entities.", "Converter - parseEntities");
    }
}

//attributes come from XML representation (editor.xml)
Converter.prototype.parseEntity = function (entity) {
    if(entity != undefined)  {
      this.entities.push({
          self: entity,
          id: entity["@id"],
          label: entity["@label"],
          shortName: entity["@shortName"],
          namespace: entity["@namespace"],
          type: entity["@type"],
          noType: entity["@noType"] || false,
          url: entity["@url"],
          service: entity["@service"],
          from: entity["@from"],
          to: entity["@to"],
          connector: entity["@connector"] || null,
          hasFilter: entity["@hasFilter"] || false,
          isResult: entity["@isResult"],
          inQuery: false, //is in sparql query already?
          order: 0, //hierarchy of entities,
          filter: entity["@filter"] || false,
          filterContent: entity["@filterContent"]
      });
    }
    else {
    	tb.warn("Error parsing entity.", "Converter - parseEntity");
    }

    //uniprot checker: setting the onlyUniprot flag to false, if the current entity is not of the uniprot namespace
    if(entity["@service"] != "http://beta.sparql.uniprot.org/") {
    	this.onlyUniprot = false;
    }
}

Converter.prototype.parseProperties = function () {
    if(this.json.Property != undefined && this.json.Property.length != 0){
      for (var i = 0; i < this.json.Property.length; i++) {
          this.parseProperty(this.json.Property[i]);
      }
    } 
}

Converter.prototype.parseProperty = function (property) {
    if(property != undefined)  {
      this.properties.push({
          self: property,
          id: property["@id"],
          label: property["@label"],
          defaultLabel: property["@defaultLabel"],
          shortName: property["@shortName"],
          belongsTo: property["@belongsTo"],
          type: property["@type"],
          service: property["@service"],
          special: property["@special"],
          optional: property["@optional"],
          urlFilter: property["@urlFilter"],
          regexFilter: property["@regexFilter"],
          numericFilter: property["@numericFilter"],
          exact: property["@exact"],
          exact_pre: property["@exact_pre"],
          exact_literal_type: property["@exact_literal_type"],
          baseUrl: property["@baseUrl"],
          multiTarget: property["@multiTarget"] || null,
          connectorProperty: property["@connectorProperty"] || null,
          goProperty: property["@goProperty"] || null,
          isResult: property["@isResult"],
          inQuery: false
      });
    }
    else {
    	tb.warn("Error parsing property.", "Converter - parseProperty");
    }
}

Converter.prototype.parseConnections = function () {
    if(this.json.Connector != undefined && this.json.Connector.length != 0){
      for (var i = 0; i < this.json.Connector.length; i++) {
          this.parseConnection(this.json.Connector[i]);
      }
    }
}

Converter.prototype.parseConnection = function (connection) {
    if(connection != undefined)  {
      this.connections.push({
          self: connection,
          selfID: connection["@id"],
          source: this.getElement(connection.mxCell[0]["@source"]),
          target: this.getElement(connection.mxCell[0]["@target"]),
          sourceID: connection.mxCell[0]["@source"],
          targetID: connection.mxCell[0]["@target"],
          anyRelation: connection["@isAnyRelation"]
      });
      if(connection["@isAnyRelation"]) {
      }
    }

}

Converter.prototype.validateGraph = function() {


	var connections = (this.json.Connector) ? this.json.Connector.length : null;
	var properties 	= (this.json.Property) ? this.json.Property.length : null;
	var entities 	= (this.json.Entity) ? this.json.Entity.length : null;

	if(connections && entities) {
		if(connections <= (properties + entities))
			return true;
	}

	return false;
}

//check which rdf project the query belongs to: embl or bio2rdf
Converter.prototype.rdfProject = function() {

	var service = this.json.Entity[0]["@service"] + "";
	if(service.indexOf('bio2rdf') > -1) {
		this.project = "bio2rdf";
	}
	else {
		this.project = "embl";
	}

}

/***********************************************************************************************************************************************/
/***********************************************************************************************************************************************/
/***********************************************************************************************************************************************

This function does all needed steps to convert the mxGraph represenation of the SPARQL Query 
to a real SPARQL Query.

1.  Parse Connections, Properties and Entities of the mxGraph.
	All are stored in this converter object. 
2.  Order the entities. This is needed because of variable dependencies in the SPARQL Query, and performance optimizations.
3.  Creation of the SPARQL Query. Starting from the first entity, build the query in the right order, and create Service Statements as needed.
4.  Run the SPARQL Query on an remote SPARQL Endpoint. 
5.  After fetching the results, create a results table and a results graph. (callback in getResult() function) 

***********************************************************************************************************************************************/
/***********************************************************************************************************************************************/
/***********************************************************************************************************************************************/

Converter.prototype.run = function () {


    //delete the old results table, if any
	$("#results_container").children().detach();
		
	//check if the graph is valid 
	//very very simple checking atm!!
	var valid = this.validateGraph();

	//check rdf project (embl, bio2rdf) to set the sparql endpoint
	this.rdfProject();
	
	//run the converter if the graph is valid 
	if(valid)
	{
		this.parseConnections();
		this.parseEntities();
		this.parseProperties();
		this.orderEntities();
		this.sparql();
		this.getResult();
	}
	else {
		console.log("Graph is not valid!");
		bootbox.alert("Unfortunatelly the graph does not seem to be valid. Please check it again.");
		spinner.stop();
		$('#run').prop('disabled', false);
	}
}