Template.editor.helpers({

	loggedIn: function() {
		if(!Meteor.user()) {
			return false;
		}
	},
	userName: function() {
		return Meteor.user().services.google.name;
	},
	graph: function() {
		return Session.get("graphDocument");
	},
	publicActive: function() {
		return Session.get("graphDocument").visibility == "public" ? "active" : "";
	},
	privateActive: function() {
		return Session.get("graphDocument").visibility == "private" ? "active" : "";
	},
	templateActive: function() {
		return Session.get("graphDocument").visibility == "template" ? "active" : "";
	},
	/*Premade Graph Settings*/
	premade: function() {
		return Session.get("premade") || false;
	},
	premadeValue: function() {
		return Session.get("premadeValue") || false;
	},

});

_premadeValues = new Array();

Template.editor.rendered = function() {

	Session.setDefault("cancelRun", false);

	/*
	GRAPH SPECIFIC
	*/
	if(_editorUI == null) new EditorUi();
	converter = null;

	if(Session.get("graphReady") == true) {
		console.log("now parsing graph");
		var graph = mxUtils.parseXml(Session.get("currentGraph"));
		var decoder = new mxCodec(graph);
		var node = graph.documentElement;
		decoder.decode(node, _editor.graph.getModel());
		var xml = mxUtils.getPrettyXml(node);
		sparqlQueryEndpointChecker(xml);
	}

  	_editor.graph.isCellEditable = function(mxCell) {
  		if(mxCell.value.nodeName == "Entity" || mxCell.edge == 1)
        	return false;
        else
        	return true;
      }
  	_editor.graph.isCellDeletable = function(mxCell) {
        return true;
    }
  	_editor.graph.isCellMovable = function(mxCell) {
        return true;
    }
    _editor.graph.setConnectable(true);


	//reset premade values, otherwise new values will be pushed onto an existing array!
	Session.set("premadeValue", null);

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
			templateOverlay(cell, _editor, true, false);
		}
	}

	/*
	Disabling UI
	*/
	//if current user != owner of the graph
	if(Meteor.user()._id != Graphs.findOne({_id: Session.get("currentGraphID")}).owner && Session.get("currentGraph") != undefined) {
		$("#delete").remove();
		$("#save").remove();
		$("#select-category").select2("enable", false);
		$("#name").prop('disabled', true);
		$("#description").prop('disabled', true);
	}
	//if coming form the explore overview page
	if(Session.get("Route") == "explore-overview")  {
		$(".editor-visibility-container").remove();
		$(".editor-premade-container").remove();
		$("#delete").remove();
		$("#save").remove();
		$("#name").prop('disabled', true);
		$("#description").prop('disabled', true);
		$("#select-category").select2("enable", false);

		$("#editor_sidebar").prepend('<h5>Author</h5><p>' + Graphs.findOne({_id: Session.get("currentGraphID")}).owner + '</p>');
	}

}



Template.editor.events({

'click #save': function(e, t) {

    e.preventDefault();

    var enc = new mxCodec();
	var node = enc.encode(_editor.graph.getModel());		
	var graph = mxUtils.getPrettyXml(node);

	var visibility = "private", premade = false;
	if(jQuery("#public").hasClass("active"))
		visibility = "public";
	else if(jQuery("#template").hasClass("active")) {
		visibility = "template";
		premade = true
	}

	var graph_categories = ($("#select-category").select2("val").length > 0) ? $("#select-category").select2("val") : ["uncategorized"];

	var graphProperties = {
		owner: Meteor.userId(),
		ownerName: Meteor.user().username || Meteor.userId(),
		graph: graph,
		desc: jQuery("#description").val(),
		name: jQuery("#name").val(),
		visibility: visibility,
		categories: graph_categories,
		premade: premade, 
		lastEdit: new Date()
	};

	currentGraphID = Session.get("currentGraphID");
	currentGraph = Session.get("graphDocument");
	//check if name changed. if so, insert a new graph into the db, otherwise just update
	if(currentGraph.name == jQuery("#name").val() || currentGraph.name == "New Graph") {
		Graphs.update(currentGraphID, {$set: graphProperties}, function(error) {
	      if (error) {
  		      	$.pnotify({
				title: 'Could NOT update graph with ID:' + currentGraphID,
				text: 'ERROR: ' + error.reason,
				type: 'error',
    			opacity: .8
			});
	        alert(error.reason);
	      }
	      else {
	      	$.pnotify({
				title: 'Updated Graph with ID:' + currentGraphID,
				text: 'Updated graph successfully.',
				type: 'success',
    			opacity: .8
			});
	      }
	    });
	    return;
	}
	else if(currentGraph.name != jQuery("#name").val()) {
		Graphs.insert(graphProperties, function(error, id){
	      if (error) {
  		      	$.pnotify({
				title: 'Could NOT update graph with ID:' + currentGraphID,
				text: 'ERROR: ' + error.reason,
				type: 'error',
    			opacity: .8
			});
	        alert(error.reason);
	      }
	      else {
	      	$.pnotify({
				title: 'Inserted Graph with ID:' + currentGraphID,
				text: 'New graph created.',
				type: 'success',
    			opacity: .8
			});
	      }
	    });
	    return;
	}

},

'click #private': function(e, t) {
	$("#graph-visibility button").removeClass("active");
	$(e.target).addClass("active");
},
'click #public': function(e, t) {
	$("#graph-visibility button").removeClass("active");
	$(e.target).addClass("active");
},
'click #template': function(e, t) {
	$("#graph-visibility button").removeClass("active");
	$(e.target).addClass("active");
},
'blur #name' : function(e) {
	currentGraphID = Session.get("currentGraphID");
	currentGraph = Graphs.findOne({_id: currentGraphID});
	if(currentGraph.name != $(e.target).val()) {
		$("#nameChange").text("Name changed. On Save, this will add a new graph to your collection.");
		$("#nameChange").css("display", "block");
	}
	else {
		$("#nameChange").text("");
		$("#nameChange").css("display", "block");
	}
	
},

'click #delete': function(e) {
    e.preventDefault();

	currentGraphID = Session.get("currentGraphID");

    bootbox.confirm("Are you sure?", function(result) {
  		if(result) {
  			Graphs.remove(currentGraphID, function(e) {
  				if(e) {

  				}
  				else {
  					Meteor.Router.to("/graphs");
			      	$.pnotify({
						title: 'Deleted graph with ID:' + currentGraphID,
						text: 'Deleted graph successfully.',
						type: 'error',
		    			opacity: .8
					});
  				}
  			});

  		}
	}); 
},
'click #toggle-graph': function(e,t) {
	if($("#overlay").height() == 0)
		$("#overlay, #graph").css("height", 700);
	else 
		$("#overlay, #graph").css("height", 0);

},
'click #run': function(e) {

	//disable the button
	$('#run').prop('disabled', true);
	$("#cancel").show();

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
'click #cancel': function(e) {
  	e.preventDefault();
	//disable the button
	$('#run').prop('disabled', false);
	$('#cancel').hide();
	Session.set("cancelRun", true);

	if (Session.get("cancelRun")) {
		//remove the loading results spinner
		spinner.stop();
		$.pnotify({
			title: 'Stopping query!',
			text: 'The currently running query will be stopped.',
			type: 'error',
			opacity: .8,
			delay: 3000
		});
		console.log("run canceled!");
		$('#cancel').hide();
		return;
	}


},
'click #debug-run': function(e) {

	//disable the button
	$('#run').prop('disabled', true);

	//Create the mxGraph XML from the Graph
	var encoder = new mxCodec();
	var node = encoder.encode(_editor.graph.getModel());
	var xml = mxUtils.getPrettyXml(node);

	//get the SPARQL Query LIMIT and OFFSET from the GUI
	var limit = $("#sparql-limit").val();
	var offset = $("#sparql-offset").val();
	//run the converter - converts the XML into a SPARQL Query
	converter = new Converter(xml, limit, offset, true);

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
'click #legend': function(e,t) {
	if($("#legend-container").css("display") == "none")
		$("#legend-container").fadeIn();
	else 
		$("#legend-container").fadeOut();

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

'click #intro': function(e, t) {
	startIntroEditor();
},


/*hide/show label in the graph*/
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

'change #check-associations': function(e) {

	var hideLabels = false;
	if($("#check-labels").attr('checked')){
		hideLabels = true;
	}

	//reinitialize the arbor graph, this time hiding the labels!
	if($(e.target).attr('checked')){
		converter.hideAssociations = true;
		converter.sparqlCallback(null, hideLabels);
	}
	//reinitialize the arbor graph, this time showing the labels!
	else {
		converter.hideAssociations = false;
		converter.sparqlCallback(null, hideLabels);
	}

	$('html, body').animate({
        scrollTop: $("#arbor_results").offset().top
    }, 20);
},

});



Template.spinner.rendered = function() {
	var opts = {
	  lines: 13, // The number of lines to draw
	  length: 20, // The length of each line
	  width: 10, // The line thickness
	  radius: 30, // The radius of the inner circle
	  corners: 1, // Corner roundness (0..1)
	  rotate: 0, // The rotation offset
	  direction: 1, // 1: clockwise, -1: counterclockwise
	  color: '#000', // #rgb or #rrggbb or array of colors
	  speed: 1, // Rounds per second
	  trail: 60, // Afterglow percentage
	  shadow: false, // Whether to render a shadow
	  hwaccel: false, // Whether to use hardware acceleration
	  className: 'spinner', // The CSS class to assign to the spinner
	  zIndex: 2e9, // The z-index (defaults to 2000000000)
	  top: 'auto', // Top position relative to parent in px
	  left: 'auto' // Left position relative to parent in px
	};
	var target = document.getElementById('spinner');
	spinner = new Spinner(opts).spin(target);	

};