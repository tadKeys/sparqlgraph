/**
 * $Id: EditorUi.js,v 1.28 2013/06/20 14:04:15 gaudenz Exp $
 * Copyright (c) 2006-2012, JGraph Ltd
 */
/**
 * Constructs a new graph editor
 */
var _editor;
var _json;
var _editorUI = null;
EditorUi = function(editor, container)
{

    this.init();
    _editorUI = this;

}

EditorUi.prototype.init = function() {

      this.node = mxUtils.load("http://localhost:3000/editor.xml").getDocumentElement();
      this.editor = new mxEditor(this.node);
      this.graph = this.editor.graph;
      _editor = this.editor;


    //helper variables
    this.editor.checkedEndpoints = new Array();  

    // Shows the application
    this.hideSplash();

    //attach events
    this.events();

    this.connectConfig();

    this.toolbarStyle();

    this.addActions();

    this.toolTipStyle();

  /************************************
  ON INIT FUNCTION
  ************************************/
  // Enables rotation handle
    // mxVertexHandler.prototype.rotationEnabled = true;

    // Enables guides
    mxGraphHandler.prototype.guidesEnabled = true;

  // Alt disables guides
  mxGuide.prototype.isEnabledForEvent = function(evt)
  {
    return !mxEvent.isAltDown(evt);
  };

  // Enables snapping waypoints to terminals
  mxEdgeHandler.prototype.snapToTerminals = true;

  // Defines an icon for creating new connections in the connection handler.
  // This will automatically disable the highlighting of the source vertex.
  mxConnectionHandler.prototype.connectImage = new mxImage('http://sparqlgraph.i-med.ac.at/images/connector.gif', 16, 16);

  // Enables connections in the graph and disables
  // reset of zoom and translate on root change
  // (ie. switch between XML and graphical mode).
  this.editor.graph.setConnectable(true);
  this.editor.graph.setAllowDanglingEdges(false);
  // Clones the source if new connection has no target
  this.editor.graph.connectionHandler.setCreateTarget(false);

  this.editor.graph.isEdgeLabelsMovable = false; 
  this.editor.graph.setHtmlLabels(true); 

}

//http://jgraph.github.io/mxgraph/docs/js-api/files/view/mxGraph-js.html#mxGraph.getTooltipForCell
EditorUi.prototype.toolTipStyle = function() {

  this.graph.getTooltipForCell = function(cell)
    {
      console.log(cell);
      //if this cell is a NODE
      if(cell.vertex) {

        //default tooltip
        var tooltip = '<strong>TYPE</strong>: '+ cell.getAttribute("defaultLabel") + '<br>' +
                      '<strong>RDF</strong>:  '+ cell.getAttribute("type") + '<br>'+
                      '<strong>SERVICE</strong>:  '+ cell.getAttribute("service") + '<br>';
        if(cell.getAttribute("belongsTo") != null)
        tooltip += '<strong>Allowed Source</strong>:  '+ cell.getAttribute("belongsTo") + '<br><hr>';
        else tooltip += "<hr>";

        //if this node is a property, display if the filter has to be exact or whatever
        if(cell.value.nodeName == "Property" && cell.getAttribute("exact") != null && cell.getAttribute("exact") == "true") {
          tooltip += '<strong style="color:red;font-size: 20px;">Exact Match required!</strong><br>If you edit this node, the value has to be an <strong>exact</strong> match!';
        }
        else if(cell.value.nodeName == "Property" && cell.getAttribute("numericFilter") != null && cell.getAttribute("numericFilter") == "true") {
          tooltip += '<strong style="color:red;font-size: 20px;">Numeric Filter</strong><br>If you edit this node, enter a number like "4", or something like "> 0.01" .';
        }
        else if(cell.value.nodeName == "Property" && cell.getAttribute("urlFilter") != null && cell.getAttribute("urlFilter") == "true") {
          tooltip += '<strong style="color:red;font-size: 20px;">Exact Match required!</strong><br>If you edit this node, the value has to be an <strong>exact</strong> match!';
        }
        else if(cell.value.nodeName == "Property" && cell.getAttribute("special") == null) {
          tooltip += '<strong style="color:red;font-size: 20px;">Regular Expression Filter</strong><br>If you edit this node, the value can be a substring of what you are searching for.';
        }
        else if(cell.value.nodeName == "Property" && cell.getAttribute("special") == "true") {
          tooltip += '<strong style="color:red;font-size: 20px;">Special Node</strong><br>This node is handled differently. Please refer to the documentation for more info.';
        }


        //if this node is a entity, also display possible targets!!
        if(cell.value.nodeName == "Entity") {
          var cellName = cell.getAttribute("shortName");
          var connectionString = "";
          for (var i = 0; i < permissions[cellName].length; i++) {
            connectionString += cell.getAttribute("defaultLabel") + " -> " + permissions[cellName][i] + "<br>";
          };
          tooltip += '<strong>Allowed Connection Targets:</strong>:<br>' + connectionString ;
        }


        return tooltip;
      }

      return "";
    }

}

EditorUi.prototype.addActions = function() {

    //mark as premade action
    this.editor.addAction('setPremade', function(editor, cell)
    {
      if(Session.get("premadeMode") == "true") {
        templateOverlay(cell, editor, false, true);
      }
      else {
        templateOverlay(cell, editor, true, true);
      }
    });

    //set variable as result variable
    this.editor.addAction('addToResults', function(editor, cell)
    {
      if(Session.get("premadeMode") == "true") {
        resultOverlay(cell, editor, true, true);
      }
      else {
        resultOverlay(cell, editor, true, true);
      }
    });

    //used on connectors, to allow any relation to from source to target, like: ?s ?any ?o 
    this.editor.addAction('anyRelation', function(editor, cell)
    {
         var type = cell.value.nodeName || null;
         var isAnyRelation = cell.getAttribute('isAnyRelation');

         if(cell.value.nodeName == "Connector") {
            
            if(cell.getAttribute("isAnyRelation") == "false" || cell.getAttribute("isAnyRelation") == undefined) {
                console.log("Allowing any Relation between Nodes!");

                cell.setAttribute("isAnyRelation", true);
                editor.graph.setCellStyles("fontColor", "red");
                editor.graph.cellLabelChanged(cell, "Any Relation between", false);
            }
            else {
                console.log("Disallowing any Relation between Nodes!");

                cell.setAttribute("isAnyRelation", false);
                editor.graph.setCellStyles("fontColor", "#36393D");
                editor.graph.cellLabelChanged(cell, "has " + cell.target.getAttribute("defaultLabel"), false);
            }

         }

    });

}


EditorUi.prototype.hideSplash = function() {
	// Fades-out the splash screen
	var splash = document.getElementById('splash');

	if (splash != null)
	{
		try
		{
		  mxEvent.release(splash);
		  mxEffects.fadeOut(splash, 100, true);
		}
		catch (e)
		{
		  splash.parentNode.removeChild(splash);
		}
	}
}


EditorUi.prototype.events = function () {

	var graph = this.editor.graph;
	var editor = this.editor;

    editor.graph.getModel().addListener(mxEvent.CHANGE, function(sender, evt)
    {
        var enc = new mxCodec();
        var node = enc.encode(graph.getModel());        
        Session.set("currentGraph",mxUtils.getPrettyXml(node) );

        var json = $.xmlToJSON(Session.get("currentGraph"));
        _json = json;

        if(evt.getProperty("changes")[0]["child"] != null){
            //change was not afterAddVertex
            if(evt.getProperty("changes")[0]["child"].isVertex()) {
            }
            if(evt.getProperty("changes")[0]["child"].isEdge()) {
            }
        }
    });

    editor.addListener(mxEvent.AFTER_ADD_VERTEX, function(sender, evt)
    {

        var logo_base = "../images/database_logos/";

        if(evt.getName() == "afterAddVertex") {
          if(evt.properties["vertex"].value.localName == "Entity") {

            var logo = database_logos[evt.properties["vertex"].getAttribute("service")][0];
            var width = database_logos[evt.properties["vertex"].getAttribute("service")][1];
            var height = database_logos[evt.properties["vertex"].getAttribute("service")][2];
            editor.graph.setCellStyles("image", logo_base + logo);
            editor.graph.setCellStyles("imageWidth", width);
            editor.graph.setCellStyles("imageHeight", height);

            //check endpoint availability
            var endpoint = evt.properties["vertex"].getAttribute("service"); 
            if(!_.contains(editor.checkedEndpoints, endpoint)) {
              console.log("Now checking " + endpoint + " for availability...");
              $(".endpoints span[data-service='" + endpoint + "'] i").css("color", "orange").parent().show();
              $(".endpoints span[data-service='" + endpoint + "'] .status").text("checking...");
              editor.checkedEndpoints.push(endpoint);
              sparqlEndpointAvailability(evt.properties["vertex"]);
            }
          
          } 
        }

    });

    var graphCellLabelChanged = graph.cellLabelChanged;
    graph.cellLabelChanged = function(cell, newValue, autoSize)
    {

      // Cloned for correct undo/redo
      var elt = cell.value.cloneNode(true);
      elt.setAttribute('label', newValue);

      newValue = elt;
      graphCellLabelChanged.apply(this, arguments);

      //adding a filter attribute to the parent node. used for SERVICE ordering in the sparql query
      if(cell.edges && cell.edges[0].source != undefined) {

        if(elt.getAttribute("defaultLabel") != elt.getAttribute("label")) {
          if(cell.edges[0].source.getAttribute("hasFilter")) {
            cell.edges[0].source.setAttribute("hasFilter", true);
          }
        }
        else {
          cell.edges[0].source.setAttribute("hasFilter", false);
        }

      }

    };

    //print graph
    if(document.getElementById("print") != null)
    {
      mxEvent.addListener(document.getElementById("print"), 'click', function(evt)
        {
          var preview = new mxPrintPreview(graph, 1);
          preview.open();
      });
    }
}



EditorUi.prototype.addChild = function (graph, source_cell)
{
  var editor = this.editor;
  var graph = editor.graph;
  var model = graph.getModel();
  var parent = graph.getDefaultParent();
  var vertex;

  model.beginUpdate();
  try
  {

    var template = editor.templates['embl_atlas_efo'];
    var clone = editor.graph.model.cloneCell(template);
    clone.style = "rounded_rectangle_torquise";
    graph.addCell(clone);
    graph.setSelectionCell(clone);

    var edge = graph.insertEdge(parent, null, '', source_cell, clone);

  }
  finally
  {
    model.endUpdate();
  }

};


EditorUi.prototype.connectConfig = function () {
	var editor = this.editor;
	var graph = editor.graph;


	graph.connectionHandler.addListener(mxEvent.CONNECT, function(sender, evt)
	{
    // console.log("connecting nodes")
	  var edge = evt.getProperty('cell');
	  var source = graph.getModel().getTerminal(edge, true);
	  var target = graph.getModel().getTerminal(edge, false);

	  var style = graph.getCellStyle(edge);
	  var sourcePortId = style[mxConstants.STYLE_SOURCE_PORT];
	  var targetPortId = style[mxConstants.STYLE_TARGET_PORT];


    //set connection label.
    var url = "";
    var special_connection = source.getAttribute("shortName") + "_TO_" + target.getAttribute("shortName") || null;

    //check if this requires a special connection label
    if(special_connection_labels[special_connection]) {
      url = special_connection_labels[special_connection];
    }
    else if(target.getAttribute("type") && target.getAttribute("service").indexOf("bio2rdf") < 0) {
      url = target.getAttribute("type").substr(target.getAttribute("type").lastIndexOf('/') + 1).split("#");
      url = url[url.length-1];    
    }
    else {
      url = target.getAttribute("defaultLabel");
    }
	  edge.setAttribute("label",/*source.getAttribute("defaultLabel") + */"has " + url);

    //check if this connection is between special entities
    if(special_connection_entities[special_connection]) {
      var specialFunc = special_connection_entities[special_connection];
      specialFunc(source, target);
    }

      //add attribute multiTarget to the target, if this target cell is already a target of ANOTHER connector. (gene/gene - function example)
      if(target.getEdgeCount() > 1) {
        target.setAttribute("multiTarget", true);
      }

      //source is a connecting node, like: Gene Disease Association
      if(source.getAttribute("connector") == "1") {
        if(target["style"].indexOf("hexagon") >= 0) { // this means the target is ALSO a entity  == ugly 
            if(source.getAttribute("from") == "0") {
                source.setAttribute("from", target["id"]);
            }
            else if (source.getAttribute("from") != "0" && source.getAttribute("to") == "0") {
                source.setAttribute("to", target["id"]);
            }
            console.log("connecting");
            console.log(source);
            console.log(target);
        }
      }

      //CASE: Gene to GO Term, like GO Function. Special Case, because of different namespaces
      if(target.getAttribute("namespace") == "bioportal") {
        if(target["style"].indexOf("hexagon") >= 0) { // this means the target is ALSO a entity  == ugly 
            target.setAttribute("from", source["id"]);
        }
      }

	});

  var sourceNode = null; //used in the following two events, to store the connecting source node
  //fired when a connection is started
  graph.connectionHandler.addListener(mxEvent.START, function(sender, evt)
  {
    sourceNode = evt.properties.state.cell;
    /*while connecting, mark allowed connection nodes with a shadow*/
    var allCells = graph.getChildVertices(graph.getDefaultParent());
    for (var i = 0; i < allCells.length; i++) {
      var cell = allCells[i];
      var validNeighbors = permissions[sourceNode.getAttribute("shortName")];
      if(_.contains(validNeighbors, cell.getAttribute("shortName"))) {

        graph.getModel().beginUpdate();
        try
        {
          graph.setCellStyle("rounded_rectangle_grey_connectable", [cell]);
        }
        finally
        {
           // Updates the display
           graph.getModel().endUpdate();
        }
      }
      else {
        graph.getModel().beginUpdate();
        try
        {
          graph.setCellStyle("rounded_rectangle_grey_non_connectable", [cell]);
        }
        finally
        {
           // Updates the display
           graph.getModel().endUpdate();
        }
      }
    }
  });


  //fired when a connection is dropped
  graph.connectionHandler.addListener(mxEvent.RESET, function(sender, evt)
  {
    // console.log("reset fired");
    if(sourceNode != null) {
      var allCells = graph.getChildVertices(graph.getDefaultParent());
      for (var i = 0; i < allCells.length; i++) {
        var cell = allCells[i];
        if(cell.value.nodeName == "Property") {
          graph.setCellStyle("rounded_rectangle_grey", [cell]);

        }
        else if(cell.value.nodeName == "Entity") {
          graph.getModel().beginUpdate();
          try
          {
            graph.setCellStyle("rounded_rectangle_torquise", [cell]);

            var logo = database_logos[cell.getAttribute("service")][0];
            var width = database_logos[cell.getAttribute("service")][1];
            var height = database_logos[cell.getAttribute("service")][2];
            graph.setCellStyles("image", "../images/database_logos/" + logo, [cell]);
            graph.setCellStyles("imageWidth", width, [cell]);
            graph.setCellStyles("imageHeight", height, [cell]);
          }
          finally
          {
             // Updates the display
             graph.getModel().endUpdate();
          }
        }
      }
      sourceNode = null; //reset the source node
    }
  });


  special_connection_labels = {

    "embl_chembl_compound_TO_embl_chembl_protein" : "Protein Target",
    "embl_chembl_target_component_TO_embl_uniprot_protein" : "Cross Reference",

  };

  special_connection_entities = {

    "embl_atlas_expression_decreased_value_TO_embl_atlas_factor" : function(fromNode, toNode) {
      // console.log("embl_atlas_expression_decreased_value_TO_embl_atlas_factor");
      toNode.setAttribute("noType", true);
    },
    "embl_atlas_expression_increased_value_TO_embl_atlas_factor" : function(fromNode, toNode) {
      // console.log("embl_atlas_expression_increased_value_TO_embl_atlas_factor");
      toNode.setAttribute("noType", true);
    },

  };

    // 0 connections between gene nodes  nor between geneProperties
    //validation.html
    //http://jgraph.github.io/mxgraph/docs/js-api/files/view/mxMultiplicity-js.html#mxMultiplicity
    //
    
    permissions = {

    /*******************************************************************************
    *******************************************************************************
    
    EMBL
    
    *******************************************************************************
    *******************************************************************************/

    /*Atlas*/
    "embl_atlas_experiment" : ["embl_atlas_experiment_description", "embl_atlas_experiment_id", "embl_atlas_experiment_pubmed_id", "embl_atlas_experiment_url", "embl_atlas_organism","embl_atlas_assay","embl_atlas_differential_expression_analysis"],
    "embl_atlas_organism" : ["embl_atlas_organism_label", "embl_atlas_organism_id"],
    "embl_atlas_assay" : ["embl_atlas_sample"],
    "embl_atlas_sample" : ["embl_atlas_factor", "embl_atlas_organism"],
    "embl_atlas_efo" : ["embl_atlas_efo_label", "embl_atlas_efo_definition", "embl_atlas_efo_id", "embl_atlas_efo"],
    "embl_atlas_factor" : ["embl_atlas_factor_label", "embl_atlas_factor_type", "embl_atlas_factor_value", "embl_atlas_factor_efo_type", "embl_atlas_organism", "embl_atlas_efo"],
    "embl_atlas_differential_expression_analysis" : ["embl_atlas_differential_expression_analysis_label", "embl_atlas_expression_decreased_value", "embl_atlas_expression_increased_value", "embl_atlas_design_platform"],
    "embl_atlas_expression_decreased_value" : ["embl_atlas_expression_value_pvalue", "embl_atlas_expression_value_tstatistic", "embl_atlas_expression_value_label", "embl_atlas_design_element", "embl_atlas_factor", "embl_atlas_expression_value_factor_type", "embl_atlas_expression_value_factor_value"],
    "embl_atlas_expression_increased_value" : ["embl_atlas_expression_value_pvalue", "embl_atlas_expression_value_tstatistic", "embl_atlas_expression_value_label", "embl_atlas_design_element", "embl_atlas_factor", "embl_atlas_expression_value_factor_type", "embl_atlas_expression_value_factor_value"],
    "embl_atlas_design_platform" : ["embl_atlas_design_platform_id", "embl_atlas_design_platform_manufacturer", "embl_atlas_organism"],
    "embl_atlas_design_element" : ["embl_atlas_design_element_id", "embl_atlas_design_platform", "embl_atlas_reference_uniprot", "embl_atlas_reference_entrez", "embl_atlas_reference_ensembl", "embl_uniprot_protein"],
    "embl_atlas_reference_entrez" : ["embl_atlas_reference_id", "embl_atlas_reference_label"],
    "embl_atlas_reference_ensembl" : ["embl_atlas_reference_id", "embl_atlas_reference_label"],
    "embl_atlas_reference_uniprot" : ["embl_atlas_reference_id", "embl_atlas_reference_label"],
    /*Chembl*/
    "embl_chembl_compound" : ["embl_chembl_compound_label", "embl_chembl_compound_atc", "embl_chembl_compound_phase", "embl_chembl_document", "embl_chembl_activity", "embl_chembl_protein"],
    "embl_chembl_document" : ["embl_chembl_document_label", "embl_chembl_compound", "embl_chembl_assay", "embl_chembl_activity"],
    "embl_chembl_assay" : ["embl_chembl_assay_type", "embl_chembl_assay_id", "embl_chembl_assay_description", "embl_chembl_assay_target_conf_score", "embl_chembl_assay_cell_type", "embl_chembl_document", "embl_chembl_activity", "embl_chembl_protein", "embl_chembl_protein_family"],
    "embl_chembl_activity" : ["embl_chembl_activity_standard_type", "embl_chembl_activity_standard_units", "embl_chembl_activity_standard_value", "embl_chembl_assay", "embl_chembl_compound", "embl_chembl_document"],
    "embl_chembl_protein" : ["embl_chembl_protein_label", "embl_chembl_protein_type", "embl_chembl_protein_organism_id", "embl_chembl_assay", "embl_chembl_protein_class", "embl_chembl_target_component"],
    "embl_chembl_protein_class" : ["embl_chembl_protein_class_label", "embl_chembl_protein", "embl_chembl_protein_family", "embl_chembl_target_component"],
    "embl_chembl_protein_family" : ["embl_chembl_protein_family_label", "embl_chembl_protein_family_organism_id", "embl_chembl_assay", "embl_chembl_protein_class", "embl_chembl_target_component"],
    "embl_chembl_target_component" : ["embl_chembl_target_component_description", "embl_chembl_target_component_organism_id","embl_chembl_protein", "embl_chembl_protein_family", "embl_chembl_protein_class", "embl_uniprot_protein"],
    /*Uniprot*/
    "embl_uniprot_protein" : ["embl_uniprot_protein_id", "embl_uniprot_protein_label","embl_uniprot_protein_mnemonic","embl_uniprot_protein_review","embl_uniprot_protein_altName", "embl_uniprot_keyword", "embl_uniprot_taxonomy", "embl_uniprot_go_term", "embl_uniprot_citation", "embl_uniprot_gene", "embl_uniprot_disease"],
    "embl_uniprot_keyword" : ["embl_uniprot_keyword_label", "embl_uniprot_keyword_comment"],
    "embl_uniprot_go_term" : ["embl_uniprot_go_term_label", "embl_uniprot_go_term_comment", "embl_uniprot_go_term_id"],
    "embl_uniprot_taxonomy" : ["embl_uniprot_taxonomy_id", "embl_uniprot_taxonomy_mnemonic", "embl_uniprot_taxonomy_scientific_name"],
    "embl_uniprot_citation" : ["embl_uniprot_citation_title", "embl_uniprot_citation_comment", "embl_uniprot_citation_author", "embl_uniprot_citation_pubmed_id"],
    "embl_uniprot_gene" : ["embl_uniprot_gene_label"],
    "embl_uniprot_disease" : ["embl_uniprot_disease_label", "embl_uniprot_disease_comment", "embl_uniprot_disease_omim_id"],
    /*reactome*/
    "embl_reactome_pathway" : ["embl_reactome_pathway", "embl_reactome_pathway_name", "embl_reactome_pathway_comment", "embl_reactome_taxonomy", "embl_reactome_reaction"],
    "embl_reactome_taxonomy" : ["embl_reactome_taxonomy_name"],
    "embl_reactome_reaction" : ["embl_reactome_reaction_name", "embl_reactome_reaction_comment", "embl_reactome_reaction_xref", "embl_reactome_protein", "embl_reactome_molecule", "embl_reactome_complex"],
    "embl_reactome_protein" : ["embl_reactome_protein_name", "embl_reactome_protein_go_name", "embl_reactome_protein_go_id", "embl_uniprot_protein", "embl_reactome_reaction"],
    "embl_reactome_complex" : ["embl_reactome_complex", "embl_reactome_protein", "embl_reactome_molecule", "embl_reactome_reaction", "embl_reactome_complex_name", "embl_reactome_complex_go_id", "embl_reactome_complex_go_name"],
    "embl_reactome_molecule" : ["embl_reactome_reaction", "embl_reactome_molecule_name", "embl_reactome_molecule_label", "embl_reactome_molecule_go_id" ],
    
    /*******************************************************************************
    *******************************************************************************
    
    Bio2RDF
    
    *******************************************************************************
    *******************************************************************************/
    /*ncbi gene*/
    "gene" : ["gene_symbol", "gene_xref", "gene_pubmed", "gene_taxonomy", "gene_ensembl_protein","gene_ensembl_gene","gene_chromosome", "gene_go_process", "gene_go_process_pubmed", "gene_go_process_evidence"],

    /*drugbank*/
    "drug" : ["drug_label", "drug_description", "drug_pharmacology", "drug_toxicity", "drug_category","drug_indication", "drug_halflife", "drug_mechanism_action", "drug_target"],
    "drug_target" : ["drug_target_name", "drug_target_gene_name", "drug_target_general_function", "drug_target_specific_function", "drug_target_synonym","drug_target_pubmed"],
    "drug_target_interaction" : ["drug_target_interaction_action", "drug_target_interaction_pubmed", "drug_target_interaction_label", "drug", "drug_target"],

    /*pharmgkb*/
    "pharmgkb_drug" : ["pharmgkb_drug_trade_name", "pharmgkb_drug_class", "pharmgkb_drug_label", "pharmgkb_drug_generic_name", "pharmgkb_chemical", "drug"],
    "pharmgkb_disease" : ["pharmgkb_disease_label", "pharmgkb_disease_name", "pharmgkb_disease_synonym"],
    "pharmgkb_gene" : ["pharmgkb_gene_label"],
    "pharmgkb_dga" : ["pharmgkb_dga_pubmed", "pharmgkb_gene", "pharmgkb_disease"],
    "pharmgkb_drga" : ["pharmgkb_drga_pubmed", "pharmgkb_drug", "pharmgkb_gene", "gene"],
    "pharmgkb_drdra" : ["pharmgkb_drdra_label", "pharmgkb_drug", "pharmgkb_drug"],
    "pharmgkb_chemical" : ["pharmgkb_chemical_label"],
    "pharmgkb_event" : ["pharmgkb_event_label"],
    "pharmgkb_sideeffect" : ["pharmgkb_sideeffect_label", "pharmgkb_chemical", "pharmgkb_event"],

    /*kegg*/
    "kegg_pathway" : ["kegg_pathway_label", "kegg_pathway_taxonomy", "kegg_pathway_id", "kegg_pathway_url", "kegg_relation", "kegg_reaction"],
    "kegg_relation" : ["kegg_relation_subtype"],
    "kegg_reaction" : ["kegg_reaction_label", "kegg_reaction_id", "kegg_reaction_equation", "kegg_reaction_url", "kegg_substrate", "kegg_product", "kegg_enzyme"],
    "kegg_substrate" : ["kegg_substrate_label", "kegg_substrate_url"],
    "kegg_product" : ["kegg_product_label", "kegg_product_url"],
    "kegg_enzyme" : ["kegg_enzyme_label", "kegg_enzyme_id", "kegg_enzyme_url"/*, "kegg_substrate", "kegg_product"*/],


    };








    editor.graph.multiplicities.push(
    new mxMultiplicity(
          true, 'Property', null, null, 0, 0, null,
          'Connection not allowed. Properties can not connect to other nodes. They are only allowed as targets!',
          null));
    /*************************************************************************************************************************
    *************************************************************************************************************************
        ATLAS
    *************************************************************************************************************************
    *************************************************************************************************************************/
    /*Experiment*/
    editor.graph.multiplicities.push(
    new mxMultiplicity(
          true, 'Entity', 'shortName', 'embl_atlas_experiment', 0, 7, permissions["embl_atlas_experiment"],
          'Connection not allowed. Hover the Source to see allowed connections.',
          null));
    editor.graph.multiplicities.push(
    new mxMultiplicity(
          false, 'Entity', 'shortName', 'embl_atlas_experiment', 0, 0, null,
          'Connection not allowed. Hover the Source to see allowed connections.',
          null));

    /*Organism*/
    editor.graph.multiplicities.push(
    new mxMultiplicity(
          true, 'Entity', 'shortName', 'embl_atlas_organism', 0, 2, permissions["embl_atlas_organism"],
          'Connection not allowed. Hover the Source to see allowed connections.',
          null));
    /*Assay*/
    editor.graph.multiplicities.push(
    new mxMultiplicity(
          true, 'Entity', 'shortName', 'embl_atlas_assay', 0, 1, permissions["embl_atlas_assay"],
          'Connection not allowed. Hover the Source to see allowed connections.',
          null));
    /*Sample*/
    editor.graph.multiplicities.push(
    new mxMultiplicity(
          true, 'Entity', 'shortName', 'embl_atlas_sample', 0, 2, permissions["embl_atlas_sample"],
          'Connection not allowed. Hover the Source to see allowed connections.',
          null));
    /*EFO*/
    editor.graph.multiplicities.push(
    new mxMultiplicity(
          true, 'Entity', 'shortName', 'embl_atlas_efo', 0, 4, permissions["embl_atlas_efo"],
          'Connection not allowed. Hover the Source to see allowed connections.',
          null));
    /*Factor*/
    editor.graph.multiplicities.push(
    new mxMultiplicity(
          true, 'Entity', 'shortName', 'embl_atlas_factor', 0, permissions["embl_atlas_factor"].length, permissions["embl_atlas_factor"],
          'Connection not allowed. Hover the Source to see allowed connections.',
          null));
    /*differential_expression_analysis*/
    editor.graph.multiplicities.push(
    new mxMultiplicity(
          true, 'Entity', 'shortName', 'embl_atlas_differential_expression_analysis', 0, 4, permissions["embl_atlas_differential_expression_analysis"],
          'Connection not allowed. Hover the Source to see allowed connections.',
          null));
    /*decreased expression value*/
    editor.graph.multiplicities.push(
    new mxMultiplicity(
          true, 'Entity', 'shortName', 'embl_atlas_expression_decreased_value', 0, 5, permissions["embl_atlas_expression_decreased_value"],
          'Connection not allowed. Hover the Source to see allowed connections.',
          null));
    /*increased expression value*/
    editor.graph.multiplicities.push(
    new mxMultiplicity(
          true, 'Entity', 'shortName', 'embl_atlas_expression_increased_value', 0, 5, permissions["embl_atlas_expression_increased_value"],
          'Connection not allowed. Hover the Source to see allowed connections.',
          null));
    /*design platform*/
    editor.graph.multiplicities.push(
    new mxMultiplicity(
          true, 'Entity', 'shortName', 'embl_atlas_design_platform', 0, 3, permissions["embl_atlas_design_platform"],
          'Connection not allowed. Hover the Source to see allowed connections.',
          null));
    /*design element*/
    editor.graph.multiplicities.push(
    new mxMultiplicity(
          true, 'Entity', 'shortName', 'embl_atlas_design_element', 0, 6, permissions["embl_atlas_design_element"],
          'Connection not allowed. Hover the Source to see allowed connections.',
          null));
    /*references*/
    editor.graph.multiplicities.push(
    new mxMultiplicity(
          true, 'Entity', 'shortName', 'embl_atlas_reference_entrez', 0, permissions["embl_atlas_reference_entrez"].length, permissions["embl_atlas_reference_entrez"],
          'Connection not allowed. Hover the Source to see allowed connections.',
          null));
    editor.graph.multiplicities.push(
    new mxMultiplicity(
          true, 'Entity', 'shortName', 'embl_atlas_reference_ensembl', 0, permissions["embl_atlas_reference_ensembl"].length, permissions["embl_atlas_reference_ensembl"],
          'Connection not allowed. Hover the Source to see allowed connections.',
          null));
    editor.graph.multiplicities.push(
    new mxMultiplicity(
          true, 'Entity', 'shortName', 'embl_atlas_reference_uniprot', 0, permissions["embl_atlas_reference_uniprot"].length, permissions["embl_atlas_reference_uniprot"],
          'Connection not allowed. Hover the Source to see allowed connections.',
          null));

    /*************************************************************************************************************************
    *************************************************************************************************************************
    CHEMBL
    *************************************************************************************************************************
    *************************************************************************************************************************/
    /*compound*/
    editor.graph.multiplicities.push(
    new mxMultiplicity(
          true, 'Entity', 'shortName', 'embl_chembl_compound', 0, permissions["embl_chembl_compound"].length, permissions["embl_chembl_compound"],
          'Connection not allowed. Hover the Source to see allowed connections.',
          null));
    /*document*/
    editor.graph.multiplicities.push(
    new mxMultiplicity(
          true, 'Entity', 'shortName', 'embl_chembl_document', 0, permissions["embl_chembl_document"].length, permissions["embl_chembl_document"],
          'Connection not allowed. Hover the Source to see allowed connections.',
          null));
    /*activity*/
    editor.graph.multiplicities.push(
    new mxMultiplicity(
          true, 'Entity', 'shortName', 'embl_chembl_activity', 0, permissions["embl_chembl_activity"].length, permissions["embl_chembl_activity"],
          'Connection not allowed. Hover the Source to see allowed connections.',
          null));
    /*assay*/
    editor.graph.multiplicities.push(
    new mxMultiplicity(
          true, 'Entity', 'shortName', 'embl_chembl_assay', 0, permissions["embl_chembl_assay"].length, permissions["embl_chembl_assay"],
          'Connection not allowed. Hover the Source to see allowed connections.',
          null));
    /*protein = target*/
    editor.graph.multiplicities.push(
    new mxMultiplicity(
          true, 'Entity', 'shortName', 'embl_chembl_protein', 0, permissions["embl_chembl_protein"].length, permissions["embl_chembl_protein"],
          'Connection not allowed. Hover the Source to see allowed connections.',
          null));
    /*protein class*/
    editor.graph.multiplicities.push(
    new mxMultiplicity(
          true, 'Entity', 'shortName', 'embl_chembl_protein_class', 0, permissions["embl_chembl_protein_class"].length, permissions["embl_chembl_protein_class"],
          'Connection not allowed. Hover the Source to see allowed connections.',
          null));
    /*protein family = target*/
    editor.graph.multiplicities.push(
    new mxMultiplicity(
          true, 'Entity', 'shortName', 'embl_chembl_protein_family', 0, permissions["embl_chembl_protein_family"].length, permissions["embl_chembl_protein_family"],
          'Connection not allowed. Hover the Source to see allowed connections.',
          null));
    /*protein target component*/
    editor.graph.multiplicities.push(
    new mxMultiplicity(
          true, 'Entity', 'shortName', 'embl_chembl_target_component', 0, permissions["embl_chembl_target_component"].length, permissions["embl_chembl_target_component"],
          'Connection not allowed. Hover the Source to see allowed connections.',
          null));


    /*************************************************************************************************************************
    *************************************************************************************************************************
    UNIPROT
    *************************************************************************************************************************
    *************************************************************************************************************************/
    /*protein*/
    editor.graph.multiplicities.push(
    new mxMultiplicity(
          true, 'Entity', 'shortName', 'embl_uniprot_protein', 0, permissions["embl_uniprot_protein"].length, permissions["embl_uniprot_protein"],
          'Connection not allowed. Hover the Source to see allowed connections.',
          null));
    /*keyword*/
    editor.graph.multiplicities.push(
    new mxMultiplicity(
          true, 'Entity', 'shortName', 'embl_uniprot_keyword', 0, permissions["embl_uniprot_keyword"].length, permissions["embl_uniprot_keyword"],
          'Connection not allowed. Hover the Source to see allowed connections.',
          null));
    /*go term*/
    editor.graph.multiplicities.push(
    new mxMultiplicity(
          true, 'Entity', 'shortName', 'embl_uniprot_go_term', 0, permissions["embl_uniprot_go_term"].length, permissions["embl_uniprot_go_term"],
          'Connection not allowed. Hover the Source to see allowed connections.',
          null));
    /*taxonomy*/
    editor.graph.multiplicities.push(
    new mxMultiplicity(
          true, 'Entity', 'shortName', 'embl_uniprot_taxonomy', 0, permissions["embl_uniprot_taxonomy"].length, permissions["embl_uniprot_taxonomy"],
          'Connection not allowed. Hover the Source to see allowed connections.',
          null));
    /*citation*/
    editor.graph.multiplicities.push(
    new mxMultiplicity(
          true, 'Entity', 'shortName', 'embl_uniprot_citation', 0, permissions["embl_uniprot_citation"].length+3, permissions["embl_uniprot_citation"],
          'Connection not allowed. Hover the Source to see allowed connections.',
          null));
    /*gene*/
    editor.graph.multiplicities.push(
    new mxMultiplicity(
          true, 'Entity', 'shortName', 'embl_uniprot_gene', 0, permissions["embl_uniprot_gene"].length, permissions["embl_uniprot_gene"],
          'Connection not allowed. Hover the Source to see allowed connections.',
          null));
    editor.graph.multiplicities.push(
    new mxMultiplicity(
          true, 'Entity', 'shortName', 'embl_uniprot_disease', 0, permissions["embl_uniprot_disease"].length, permissions["embl_uniprot_disease"],
          'Connection not allowed. Hover the Source to see allowed connections.',
          null));

    /*************************************************************************************************************************
    *************************************************************************************************************************
    REACTOME
    *************************************************************************************************************************
    *************************************************************************************************************************/
    /*pathway*/
    editor.graph.multiplicities.push(
    new mxMultiplicity(
          true, 'Entity', 'shortName', 'embl_reactome_pathway', 0, permissions["embl_reactome_pathway"].length, permissions["embl_reactome_pathway"],
          'Connection not allowed. Hover the Source to see allowed connections.',
          null));
    /*taxonomy*/
    editor.graph.multiplicities.push(
    new mxMultiplicity(
          true, 'Entity', 'shortName', 'embl_reactome_taxonomy', 0, permissions["embl_reactome_taxonomy"].length, permissions["embl_reactome_taxonomy"],
          'Connection not allowed. Hover the Source to see allowed connections.',
          null));
    /*reaction*/
    editor.graph.multiplicities.push(
    new mxMultiplicity(
          true, 'Entity', 'shortName', 'embl_reactome_reaction', 0, permissions["embl_reactome_reaction"].length, permissions["embl_reactome_reaction"],
          'Connection not allowed. Hover the Source to see allowed connections.',
          null));
    /*protein*/
    editor.graph.multiplicities.push(
    new mxMultiplicity(
          true, 'Entity', 'shortName', 'embl_reactome_protein', 0, permissions["embl_reactome_protein"].length, permissions["embl_reactome_protein"],
          'Connection not allowed. Hover the Source to see allowed connections.',
          null));
    /*complex*/
    editor.graph.multiplicities.push(
    new mxMultiplicity(
          true, 'Entity', 'shortName', 'embl_reactome_complex', 0, permissions["embl_reactome_complex"].length, permissions["embl_reactome_complex"],
          'Connection not allowed. Hover the Source to see allowed connections.',
          null));
    /*molecule*/
    editor.graph.multiplicities.push(
    new mxMultiplicity(
          true, 'Entity', 'shortName', 'embl_reactome_molecule', 0, permissions["embl_reactome_molecule"].length, permissions["embl_reactome_molecule"],
          'Connection not allowed. Hover the Source to see allowed connections.',
          null));


    /*******************************************************************************
    *******************************************************************************
    
    Bio2RDF
    
    *******************************************************************************
    *******************************************************************************/

    /*************************************************************************************************************************
    *************************************************************************************************************************
    NCBI Gene
    *************************************************************************************************************************
    *************************************************************************************************************************/
    
    /*gene*/
    editor.graph.multiplicities.push(
    new mxMultiplicity(
          true, 'Entity', 'shortName', 'gene', 0, permissions["gene"].length, permissions["gene"],
          'Connection not allowed. Hover the Source to see allowed connections.',
          null));

    /*************************************************************************************************************************
    *************************************************************************************************************************
    DRUGBANK
    *************************************************************************************************************************
    *************************************************************************************************************************/
    
    /*drug*/
    editor.graph.multiplicities.push(
    new mxMultiplicity(
          true, 'Entity', 'shortName', 'drug', 0, permissions["drug"].length, permissions["drug"],
          'Connection not allowed. Hover the Source to see allowed connections.',
          null));
    /*drug_target*/
    editor.graph.multiplicities.push(
    new mxMultiplicity(
          true, 'Entity', 'shortName', 'drug_target', 0, permissions["drug_target"].length, permissions["drug_target"],
          'Connection not allowed. Hover the Source to see allowed connections.',
          null));
    /*drug_target_interaction*/
    editor.graph.multiplicities.push(
    new mxMultiplicity(
          true, 'Entity', 'shortName', 'drug_target_interaction', 0, permissions["drug_target_interaction"].length, permissions["drug_target_interaction"],
          'Connection not allowed. Hover the Source to see allowed connections.',
          null));

    /*************************************************************************************************************************
    *************************************************************************************************************************
    PHARMGKB
    *************************************************************************************************************************
    *************************************************************************************************************************/
    
    /*pharmgkb_drug*/
    editor.graph.multiplicities.push(
    new mxMultiplicity(
          true, 'Entity', 'shortName', 'pharmgkb_drug', 0, permissions["pharmgkb_drug"].length, permissions["pharmgkb_drug"],
          'Connection not allowed. Hover the Source to see allowed connections.',
          null));
    /*pharmgkb_disease*/
    editor.graph.multiplicities.push(
    new mxMultiplicity(
          true, 'Entity', 'shortName', 'pharmgkb_disease', 0, permissions["pharmgkb_disease"].length, permissions["pharmgkb_disease"],
          'Connection not allowed. Hover the Source to see allowed connections.',
          null));
    /*pharmgkb_gene*/
    editor.graph.multiplicities.push(
    new mxMultiplicity(
          true, 'Entity', 'shortName', 'pharmgkb_gene', 0, permissions["pharmgkb_gene"].length, permissions["pharmgkb_gene"],
          'Connection not allowed. Hover the Source to see allowed connections.',
          null));
    /*pharmgkb_dga*/
    editor.graph.multiplicities.push(
    new mxMultiplicity(
          true, 'Entity', 'shortName', 'pharmgkb_dga', 0, permissions["pharmgkb_dga"].length, permissions["pharmgkb_dga"],
          'Connection not allowed. Hover the Source to see allowed connections.',
          null));
    /*pharmgkb_drga*/
    editor.graph.multiplicities.push(
    new mxMultiplicity(
          true, 'Entity', 'shortName', 'pharmgkb_drga', 0, permissions["pharmgkb_drga"].length, permissions["pharmgkb_drga"],
          'Connection not allowed. Hover the Source to see allowed connections.',
          null));
    /*pharmgkb_drdra*/
    editor.graph.multiplicities.push(
    new mxMultiplicity(
          true, 'Entity', 'shortName', 'pharmgkb_drdra', 0, permissions["pharmgkb_drdra"].length, permissions["pharmgkb_drdra"],
          'Connection not allowed. Hover the Source to see allowed connections.',
          null));
    /*pharmgkb_chemical*/
    editor.graph.multiplicities.push(
    new mxMultiplicity(
          true, 'Entity', 'shortName', 'pharmgkb_chemical', 0, permissions["pharmgkb_chemical"].length, permissions["pharmgkb_chemical"],
          'Connection not allowed. Hover the Source to see allowed connections.',
          null));
    /*pharmgkb_event*/
    editor.graph.multiplicities.push(
    new mxMultiplicity(
          true, 'Entity', 'shortName', 'pharmgkb_event', 0, permissions["pharmgkb_event"].length, permissions["pharmgkb_event"],
          'Connection not allowed. Hover the Source to see allowed connections.',
          null));
    /*pharmgkb_sideeffect*/
    editor.graph.multiplicities.push(
    new mxMultiplicity(
          true, 'Entity', 'shortName', 'pharmgkb_sideeffect', 0, permissions["pharmgkb_sideeffect"].length, permissions["pharmgkb_sideeffect"],
          'Connection not allowed. Hover the Source to see allowed connections.',
          null));

    /*************************************************************************************************************************
    *************************************************************************************************************************
    KEGG
    *************************************************************************************************************************
    *************************************************************************************************************************/
    
    /*kegg_pathway*/
    editor.graph.multiplicities.push(
    new mxMultiplicity(
          true, 'Entity', 'shortName', 'kegg_pathway', 0, permissions["kegg_pathway"].length, permissions["kegg_pathway"],
          'Connection not allowed. Hover the Source to see allowed connections.',
          null));
    /*kegg_relation*/
    editor.graph.multiplicities.push(
    new mxMultiplicity(
          true, 'Entity', 'shortName', 'kegg_relation', 0, permissions["kegg_relation"].length, permissions["kegg_relation"],
          'Connection not allowed. Hover the Source to see allowed connections.',
          null));
    /*kegg_reaction*/
    editor.graph.multiplicities.push(
    new mxMultiplicity(
          true, 'Entity', 'shortName', 'kegg_reaction', 0, permissions["kegg_reaction"].length, permissions["kegg_reaction"],
          'Connection not allowed. Hover the Source to see allowed connections.',
          null));
    /*kegg_substrate*/
    editor.graph.multiplicities.push(
    new mxMultiplicity(
          true, 'Entity', 'shortName', 'kegg_substrate', 0, permissions["kegg_substrate"].length, permissions["kegg_substrate"],
          'Connection not allowed. Hover the Source to see allowed connections.',
          null));
    /*kegg_product*/
    editor.graph.multiplicities.push(
    new mxMultiplicity(
          true, 'Entity', 'shortName', 'kegg_product', 0, permissions["kegg_product"].length, permissions["kegg_product"],
          'Connection not allowed. Hover the Source to see allowed connections.',
          null));
    /*kegg_enzyme*/
    editor.graph.multiplicities.push(
    new mxMultiplicity(
          true, 'Entity', 'shortName', 'kegg_enzyme', 0, permissions["kegg_enzyme"].length, permissions["kegg_enzyme"],
          'Connection not allowed. Hover the Source to see allowed connections.',
          null));


}


/*
Toolbar tabs creation
*/
EditorUi.prototype.toolbarStyle = function(test) {
    //hide connector image
    jQuery("img[title='connect']").css("opacity",0);

    if(jQuery("#toolbar .accordion").length == 0) {
      console.log("adding toolbar");

      //create accordion
      jQuery("#toolbar").children().wrapAll('<div class="accordion" id="accordion2" />')
      
      //gene tab
      jQuery("img[type='gene']").wrapAll('<div class="accordion-group gene" />');
      jQuery(".accordion-group.gene").prepend('<div class="accordion-heading gene"><a class="accordion-toggle" data-toggle="collapse" data-parent="#accordion2" href="#collapseOne">Entrez Gene</a></div>');
      jQuery("img[type^='gene']").wrapAll('<div id="collapseOne" class="accordion-body collapse" />'); 
      jQuery("img[type^='gene']").wrapAll('<div class="accordion-inner" />');   
      jQuery("img[type='gene_process']").first().before("<hr>");
      jQuery("img[type='gene_function']").first().before("<hr>");
      jQuery("img[type='gene_component']").first().before("<hr>");

      //affymetrix tab
      jQuery("img[type='affymetrix']").wrapAll('<div class="accordion-group affymetrix" />');
      jQuery(".accordion-group.affymetrix").prepend('<div class="accordion-heading affymetrix"><a class="accordion-toggle" data-toggle="collapse" data-parent="#accordion2" href="#collapseTwo">Affymetrix Probeset</a></div>');
      jQuery("img[type='affymetrix']").wrapAll('<div id="collapseTwo" class="accordion-body collapse" />');
      jQuery("img[type='affymetrix']").wrapAll('<div class="accordion-inner" />');   

      //drugbank tab
      jQuery("img[type*='drugbank']").wrapAll('<div class="accordion-group drugbank" />');
      jQuery(".accordion-group.drugbank").prepend('<div class="accordion-heading drugbank"><a class="accordion-toggle" data-toggle="collapse" data-parent="#accordion2" href="#collapseThree">Drugbank</a></div>');
      jQuery("img[type*='drugbank']").wrapAll('<div id="collapseThree" class="accordion-body collapse" />');
      jQuery("img[type*='drugbank']").wrapAll('<div class="accordion-inner" />');   
      jQuery("img[type='drugbank_target']").first().before("<hr>");
      jQuery("img[type='drugbank_dti']").first().before("<hr>");

      //pharmgkb tab
      jQuery("img[type*='pharmgkb']").wrapAll('<div class="accordion-group pharmgkb" />');
      jQuery(".accordion-group.pharmgkb").prepend('<div class="accordion-heading pharmgkb"><a class="accordion-toggle" data-toggle="collapse" data-parent="#accordion2" href="#collapseFour">PharmgKB</a></div>');
      jQuery("img[type*='pharmgkb']").wrapAll('<div id="collapseFour" class="accordion-body collapse" />');
      jQuery("img[type*='pharmgkb']").wrapAll('<div class="accordion-inner" />');   
      jQuery("img[type='pharmgkb_disease']").first().before("<hr>");
      jQuery("img[type='pharmgkb_gene']").first().before("<hr>");
      jQuery("img[type='pharmgkb_dga']").first().before("<hr>");
      jQuery("img[type='pharmgkb_drga']").first().before("<hr>");
      jQuery("img[type='pharmgkb_drdra']").first().before("<hr>");
      jQuery("img[type='pharmgkb_event']").first().before("<hr>");
      jQuery("img[type='pharmgkb_chemcial']").first().before("<hr>");
      jQuery("img[type='pharmgkb_sideeffect']").first().before("<hr>");

      //bioportal/GO tab 
      jQuery("img[type^='bioportal']").wrapAll('<div class="accordion-group bioportal" />');
      jQuery(".accordion-group.bioportal").prepend('<div class="accordion-heading bioportal"><a class="accordion-toggle" data-toggle="collapse" data-parent="#accordion2" href="#collapseFive">Gene Ontology</a></div>');
      jQuery("img[type^='bioportal']").wrapAll('<div id="collapseFive" class="accordion-body collapse" />');
      jQuery("img[type^='bioportal']").wrapAll('<div class="accordion-inner" />');    
      jQuery("img[type='bioportal_component']").first().before("<hr>"); 
      jQuery("img[type='bioportal_process']").first().before("<hr>"); 

      //KEGG tab 
      jQuery("img[type^='kegg']").wrapAll('<div class="accordion-group kegg" />');
      jQuery(".accordion-group.kegg").prepend('<div class="accordion-heading kegg"><a class="accordion-toggle" data-toggle="collapse" data-parent="#accordion2" href="#collapseSix">KEGG</a></div>');
      jQuery("img[type^='kegg']").wrapAll('<div id="collapseSix" class="accordion-body collapse" />');
      jQuery("img[type^='kegg']").wrapAll('<div class="accordion-inner" />');    
      jQuery("img[type='kegg_pathway']").first().before("<hr>"); 
      jQuery("img[type='kegg_relation']").first().before("<hr>"); 
      jQuery("img[type='kegg_reaction']").first().before("<hr>"); 
      jQuery("img[type='kegg_substrate']").first().before("<hr>"); 
      jQuery("img[type='kegg_product']").first().before("<hr>"); 
      jQuery("img[type='kegg_enzyme']").first().before("<hr>"); 

      //SGD
      jQuery("img[type^='sgd']").wrapAll('<div class="accordion-group sgd" />');
      jQuery(".accordion-group.sgd").prepend('<div class="accordion-heading sgd"><a class="accordion-toggle" data-toggle="collapse" data-parent="#accordion2" href="#collapseSeven">SGD</a></div>');
      jQuery("img[type^='sgd']").wrapAll('<div id="collapseSeven" class="accordion-body collapse" />');
      jQuery("img[type^='sgd']").wrapAll('<div class="accordion-inner" />');    
      jQuery("img[type='sgd_gene']").first().before("<hr>"); 
      jQuery("img[type='sgd_protein']").first().before("<hr>"); 
      jQuery("img[type='sgd_interaction']").first().before("<hr>"); 

      //CTD
      jQuery("img[type^='ctd']").wrapAll('<div class="accordion-group ctd" />');
      jQuery(".accordion-group.ctd").prepend('<div class="accordion-heading ctd"><a class="accordion-toggle" data-toggle="collapse" data-parent="#accordion2" href="#collapseEight">CTD</a></div>');
      jQuery("img[type^='ctd']").wrapAll('<div id="collapseEight" class="accordion-body collapse" />');
      jQuery("img[type^='ctd']").wrapAll('<div class="accordion-inner" />');    
      jQuery("img[type='ctd_chemical']").first().before("<hr>"); 
      jQuery("img[type='ctd_disease']").first().before("<hr>"); 
      jQuery("img[type='ctd_dga']").first().before("<hr>"); 
      jQuery("img[type='ctd_cda']").first().before("<hr>"); 
      jQuery("img[type='ctd_cga']").first().before("<hr>"); 


      /*******************************************************************************
      *******************************************************************************
      
      EMBL
      
      *******************************************************************************
      *******************************************************************************/

      // REACTOME
      jQuery("img[type^='embl_reactome']").wrapAll('<div class="accordion-group embl_reactome" />');
      jQuery(".accordion-group.embl_reactome").prepend('<div class="accordion-heading embl_reactome"><a class="accordion-toggle" data-toggle="collapse" data-parent="#accordion2" href="#collapseTwelve">EMBL - REACTOME</a></div>');
      jQuery("img[type^='embl_reactome']").wrapAll('<div id="collapseTwelve" class="accordion-body collapse in" />');
      jQuery("img[type^='embl_reactome']").wrapAll('<div class="accordion-inner" />');
      jQuery("img[type='embl_reactome_pathway']").first();
      jQuery("img[type='embl_reactome_taxonomy']").first().before("<hr>");
      jQuery("img[type='embl_reactome_reaction']").first().before("<hr>");
      jQuery("img[type='embl_reactome_protein']").first().before("<hr>");
      jQuery("img[type='embl_reactome_complex']").first().before("<hr>");
      jQuery("img[type='embl_reactome_molecule']").first().before("<hr>");

      // UNIPROT
      jQuery("img[type^='embl_uniprot']").wrapAll('<div class="accordion-group embl_uniprot" />');
      jQuery(".accordion-group.embl_uniprot").prepend('<div class="accordion-heading embl_uniprot"><a class="accordion-toggle" data-toggle="collapse" data-parent="#accordion2" href="#collapseEleven">EMBL - UNIPROT</a></div>');
      jQuery("img[type^='embl_uniprot']").wrapAll('<div id="collapseEleven" class="accordion-body collapse" />');
      jQuery("img[type^='embl_uniprot']").wrapAll('<div class="accordion-inner" />');
      jQuery("img[type='embl_uniprot_protein']").first();
      jQuery("img[type='embl_uniprot_keyword']").first().before("<hr>");
      jQuery("img[type='embl_uniprot_go']").first().before("<hr>");
      jQuery("img[type='embl_uniprot_taxonomy']").first().before("<hr>");
      jQuery("img[type='embl_uniprot_citation']").first().before("<hr>");
      jQuery("img[type='embl_uniprot_gene']").first().before("<hr>");
      jQuery("img[type='embl_uniprot_disease']").first().before("<hr>");

      // CHEMBL
      jQuery("img[type^='embl_chembl']").wrapAll('<div class="accordion-group embl_chembl" />');
      jQuery(".accordion-group.embl_chembl").prepend('<div class="accordion-heading embl_chembl"><a class="accordion-toggle" data-toggle="collapse" data-parent="#accordion2" href="#collapseTen">EMBL - CHEMBL</a></div>');
      jQuery("img[type^='embl_chembl']").wrapAll('<div id="collapseTen" class="accordion-body collapse" />');
      jQuery("img[type^='embl_chembl']").wrapAll('<div class="accordion-inner" />');    
      // jQuery("img[type='embl_atlas_experiment']").first().before("<hr>"); 
      jQuery("img[type='embl_chembl_compound']").first(); 
      jQuery("img[type='embl_chembl_document']").first().before("<hr>"); 
      jQuery("img[type='embl_chembl_activity']").first().before("<hr>"); 
      jQuery("img[type='embl_chembl_assay']").first().before("<hr>"); 
      jQuery("img[type='embl_chembl_protein']").first().before("<hr>"); 
      jQuery("img[type='embl_chembl_protein_class']").first().before("<hr>"); 
      jQuery("img[type='embl_chembl_protein_family']").first().before("<hr>"); 
      jQuery("img[type='embl_chembl_target_component']").first().before("<hr>"); 


      // ATLAS
      jQuery("img[type^='embl_atlas']").wrapAll('<div class="accordion-group embl_atlas" />');
      jQuery(".accordion-group.embl_atlas").prepend('<div class="accordion-heading embl_atlas"><a class="accordion-toggle" data-toggle="collapse" data-parent="#accordion2" href="#collapseNine">EMBL - Gene Expression Atlas</a></div>');
      jQuery("img[type^='embl_atlas']").wrapAll('<div id="collapseNine" class="accordion-body collapse" />');
      jQuery("img[type^='embl_atlas']").wrapAll('<div class="accordion-inner" />');    
      // jQuery("img[type='embl_atlas_experiment']").first().before("<hr>"); 
      jQuery("img[type='embl_atlas_organism']").first().before("<hr>"); 
      jQuery("img[type='embl_atlas_efo']").first().before("<hr>"); 
      jQuery("img[type='embl_atlas_assay']").first().before("<hr>"); 
      // jQuery("img[type='embl_atlas_sample']").first().before("<hr>"); 
      jQuery("img[type='embl_atlas_factor']").first().before("<hr>"); 
      jQuery("img[type='embl_atlas_expr_analysis']").first().before("<hr>"); 
      jQuery("img[type='embl_atlas_expr_value']").first().before("<br>"); 
      jQuery("img[type='embl_atlas_design_platform']").first().before("<br>"); 
      jQuery("img[type='embl_atlas_design_element']").first().before("<br>"); 
      jQuery("img[type='embl_atlas_reference']").first().before("<hr>"); 


      $(".affymetrix, .bioportal, .sgd, .ctd").hide();


  }


database_logos = {

  "http://www.ebi.ac.uk/rdf/services/chembl/sparql" : ["Chembl_logo.png", 48, 24],
  "http://www.ebi.ac.uk/rdf/services/reactome/sparql" : ["reactome.png", 24, 24],
  "http://www.ebi.ac.uk/rdf/services/atlas/sparql"  : ["ExpressionAtlas_logo_web.png", 24, 24],
  "http://beta.sparql.uniprot.org/"  : ["uniprot.gif", 48, 24],
  "http://cu.gene.bio2rdf.org/sparql"  : ["ncbigene.png", 48, 24],
  "http://cu.drugbank.bio2rdf.org/sparql"  : ["Drugbank_logo.png", 48, 24],
  "http://cu.pharmgkb.bio2rdf.org/sparql"  : ["pharmgkb.png", 48, 24],
  "http://cu.kegg.bio2rdf.org/sparql"  : ["kegg128.gif", 24, 24],

};


}