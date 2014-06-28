Template.premade_editor.helpers({

	userName: function() {
		return Meteor.user().services.google.name;
	},
	graph: function() {
		return Graphs.findOne({_id: Session.get("currentGraphID")});
	},
	/*RESULT LOADING STATE*/
	fetchingResults : function() {
		if(Session.get("fetchingResults") == true) {
			return true;
		}
	},
	passedValues: function() {
		return Session.get("premadeValue") || Graphs.findOne({_id: Session.get("currentGraphID")}).premade_values;
	},

	/*Premade Graph Settings*/
	premade: function() {
		return Session.get("premade") || false;
	},
	premadeValue: function() {
		return Session.get("premadeValue") || false;
	}

});


Template.premade_editor.rendered = function() {

	/*
	GRAPH SPECIFIC
	*/
	if(_editorUI == null) new EditorUi();
	converter = null;


    if(Session.get("currentGraph") != undefined) 
    {
		var graph = mxUtils.parseXml(Session.get("currentGraph"));
		var decoder = new mxCodec(graph);
		var node = graph.documentElement;
		decoder.decode(node, _editor.graph.getModel());
		var xml = mxUtils.getPrettyXml(node);
		sparqlQueryEndpointChecker(xml);
    }

  	_editor.graph.isCellEditable = function(mxCell) {
        if(mxCell.getAttribute("isPremade") != null && mxCell.getAttribute("isPremade") == "true")
          return true;
        else return false;
    }
  	_editor.graph.isCellDeletable = function(mxCell) {
        return false;
    }
  	_editor.graph.isCellMovable = function(mxCell) {
        return false;
    }
    _editor.graph.setConnectable(false);

	/*
	GUI SPECIFIC
	*/
	//categories
	$("#select-category").select2();
	if(Graphs.findOne({_id: Session.get("currentGraphID")}).categories != undefined) {
		$("#select-category").select2("val", Graphs.findOne({_id: Session.get("currentGraphID")}).categories);
	}

	$("#tooltip-toolbar").popover();
	$("#tooltip-limit").popover();

	/*marking nodes as template and/or results*/
	var allCells = _editor.graph.getChildVertices(_editor.graph.getDefaultParent());
	for (var i = 0; i < allCells.length; i++) {
		var cell = allCells[i];
		if(cell.getAttribute("isResult") == "true") {
			resultOverlay(cell, _editor, true, false);
		}
		if(cell.getAttribute("isPremade") == "true") {
			templateOverlay(cell, _editor, false, false);
		}
	}


	/*
	Disabling UI
	*/
	$("#delete").remove();
	$("#save").remove();
	$("#select-category").select2("enable", false);
	$("#name").prop('disabled', true);
	$("#description").prop('disabled', true);
	
	var allCells = _editor.graph.getChildVertices(_editor.graph.getDefaultParent());

}



Template.premade_editor.events({


'click #delete': function(e) {
    e.preventDefault();

	currentGraphID = Session.get("currentGraphID");

    bootbox.confirm("Are you sure?", function(result) {
  		// console.log("clicked " + result);
  		if(result) {
  			Graphs.remove(currentGraphID, function(e) {
  				if(e) {

  				}
  				else {
  					Meteor.Router.to("/templates");
			      	$.pnotify({
						title: 'Deleted graph with ID:' + currentGraphID,
						text: 'Check me out! I\'m a notice.',
						type: 'error',
		    			opacity: .8
					});
  				}
  			});

  		}
	}); 
},

'click #legend': function(e,t) {
	if($("#legend-container").css("display") == "none")
		$("#legend-container").fadeIn();
	else 
		$("#legend-container").fadeOut();

},

'click #run': function(e) {

	//disable the button
	$('#run').prop('disabled', true);

	//Show a loading spinner on the GUI
	var target = document.getElementById('spinner');
	spinner = new Spinner().spin(target);

	//Create the mxGraph XML from the Graph
	var encoder = new mxCodec();
	var node = encoder.encode(_editor.graph.getModel());
	var xml = mxUtils.getPrettyXml(node);

	//get the SPARQL Query LIMIT and OFFSET from the GUI
	var limit = $("#sparql-limit").val();
	var offset = $("#sparql-offset").val();
	//run the converter - converts the XML into a SPARQL Query
	converter = new Converter(xml, limit, offset);
	
},
'click #btn-arbor-legend': function(e) {
	$("#arbor_legend").toggle();
},
'click #zoomIn': function(e) {
	_editor.graph.zoomIn();
},
'click #zoomOut': function(e) {
	_editor.graph.zoomOut();
},
'click #intro': function(e, t) {
	startIntroTemplate();
},
'change #check-labels': function(e) {

	//reinitialize the arbor graph, this time hiding the labels!
	if($(e.target).attr('checked')){
		converter.abor = AborSetup(true);
	}
	//reinitialize the arbor graph, this time showing the labels!
	else {
		converter.abor = AborSetup(false);
	}

	$('html, body').animate({
        scrollTop: $("#arbor_results").offset().top
    }, 20);
},
'click #download-json': function(e, t) {

	var uri = 'data:application/json;charset=utf-8,' + JSON.stringify(result);
    //this trick will generate a temp <a /> tag
    var link = document.createElement("a");
    link.href = uri;
    
    //set the visibility hidden so it will not effect on your web-layout
    link.style = "visibility:hidden";
    link.download = "result.json";
    
    //this part will append the anchor tag and remove it after automatic click
    document.body.appendChild(link);
    link.click();
},
'click #download-csv': function(e, t) {

	JSONToCSVConvertor(result.results.bindings, $("#name").val(), true);
},
'change #check-associations': function(e) {

	//reinitialize the arbor graph, this time hiding the labels!
	if($(e.target).attr('checked')){
		converter.hideAssociations = true;
		converter.sparqlCallback();
	}
	//reinitialize the arbor graph, this time showing the labels!
	else {
		converter.hideAssociations = false;
		converter.sparqlCallback();
	}

	$('html, body').animate({
        scrollTop: $("#arbor_results").offset().top
    }, 20);
}

});
