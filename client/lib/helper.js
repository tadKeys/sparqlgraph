var _editor;
$(document).ready(function() {
  
});

/**
* Author: Mark Wallace
*
* This function asynchronously issues a SPARQL query to a
* SPARQL endpoint, and invokes the callback function with the JSON 
* Format [1] results.
*
* Refs:
* [1] http://www.w3.org/TR/sparql11-results-json/
*/
sparqlQueryJson = function(queryStr, project, callback, gene, isDebug, limit, offset) {


  var querypart = "query=" + escape(queryStr);
  var endpoint = "";

  if(project == "bio2rdf") {
    
    endpoint = "http://cu.gene.bio2rdf.org/sparql";
    $.getJSON(endpoint + "?" + querypart ,
      //SUCCESS CALLBACK
      function(data) {
        callback(data); 
    });

  }
  else {

    endpoint = "http://www.ebi.ac.uk/rdf/services/atlas/sparql";
    if (window.XDomainRequest) {

      sparqlQueryIE(queryStr, endpoint, function(str) {
          var jsonObj = eval('(' + str + ')');
          callback(jsonObj); 
      }, false);
    }
    else {
      $.getJSON(endpoint + "?" + querypart , {
        format: "JSON",
        limit: 25,
        // format: "XML",
        // inference: "false",
        offset: offset,
        },
        //SUCCESS CALLBACK
        function(data) {
          callback(data); 
        });
    }
  }

}

//SPARQL Query Request for IE
  sparqlQueryIE = function (queryStr, endpoint, callback, isDebug) {
      var querypart = "query=" + escape(queryStr);
    
      // Get our HTTP request object.
      var xmlhttp = null;
      if(window.XMLHttpRequest) {
        xmlhttp = new XMLHttpRequest();
     } else if(window.ActiveXObject) {
       // Code for older versions of IE, like IE6 and before.
       xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
     } else {
       alert('Perhaps your browser does not support XMLHttpRequests?');
     }
    
     // Set up a POST with JSON result format.
     xmlhttp.open('POST', endpoint, true); // GET can have caching probs, so POST
     xmlhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
     xmlhttp.setRequestHeader("Accept", "application/sparql-results+json");
    
     // Set up callback to get the response asynchronously.
     xmlhttp.onreadystatechange = function() {
       if(xmlhttp.readyState == 4) {
         if(xmlhttp.status == 200) {
           // Do something with the results
           if(isDebug) alert(xmlhttp.responseText);
           // console.log(xmlhttp.responseText);
           callback(xmlhttp.responseText);
         } else {
           // Some kind of error occurred.
           alert("Sparql query error: " + xmlhttp.status + " "
               + xmlhttp.responseText);
         }
       }
     };
     // Send the query to the endpoint.
     xmlhttp.send(querypart);
    
     // Done; now just wait for the callback to be called.
    };


//convert SPARQL Query Variable Names into human readable Headings for the results table
convertHeading = function(label) {

  /*
  GENE
  */
  if(label.startsWith("gene_ID")) {
    return "Gene";
  }
  else if(label.startsWith("gene_symbol")) {
    return "Gene Symbol";
  }
  else if(label.startsWith("gene_chromosome")) {
    return "Gene Chromosome";
  }
  else if(label.startsWith("gene_ensembl_protein")) {
    return "Gene Ensembl Protein ID";
  }
  else if(label.startsWith("gene_ensembl_gene")) {
    return "Gene Ensembl ID";
  }
  else if(label.startsWith("gene_xref")) {
    return "Gene Cross-References";
  }
  else if(label.startsWith("gene_tax")) {
    return "Gene Taxonomy";
  }
  else if(label.startsWith("gene_pubmed")) {
    return "Gene Pubmed Articles";
  }

  /*
  PHARMGKB
  */
  else if(label.startsWith("pharmgkb_disease_ID")) {
    return "Disease (PharmgKB)";
  }
  else if(label.startsWith("pharmgkb_disease_name")) {
    return "Disease Name (PharmgKB)";
  }
  else if(label.startsWith("pharmgkb_disease_synonym")) {
    return "Disease Synonym (PharmgKB)";
  }
  else if(label.startsWith("pharmgkb_disease_label")) {
    return "Disease Label (PharmgKB)";
  }
  else if(label.startsWith("pharmgkb_dga_ID")) {
    return "Disease-Gene Association (PharmgKB)";
  }  
  else if(label.startsWith("pharmgkb_dga_pubmed")) {
    return "Disease-Gene Assoc. Pubmed Article (PharmgKB)";
  } 
  else if(label.startsWith("pharmgkb_drga_ID")) {
    return "Drug-Gene Association (PharmgKB)";
  }  
  else if(label.startsWith("pharmgkb_drga_pubmed")) {
    return "Drug-Gene Assoc. Pubmed Article (PharmgKB)";
  } 
  else if(label.startsWith("pharmgkb_gene_ID")) {
    return "Gene (PharmgKB)";
  }  
  else if(label.startsWith("pharmgkb_gene_label_ID")) {
    return "Gene Label (PharmgKB)";
  }  
  if(label.startsWith("pharmgkb_drug_ID")) {
    return "Drug (PharmgKB)";
  }  
  else if(label.startsWith("pharmgkb_drug_label_ID")) {
    return "Drug Label (PharmgKB)";
  }  
  else if(label.startsWith("pharmgkb_drug_generic_name_ID")) {
    return "Drug Generic Name (PharmgKB)";
  }  
  else if(label.startsWith("pharmgkb_drug_trade_name_ID")) {
    return "Drug Trade Name (PharmgKB)";
  }  
  else if(label.startsWith("pharmgkb_drug_class_ID")) {
    return "Drug Class (PharmgKB)";
  }  
  if(label.startsWith("pharmgkb_drdra_ID")) {
    return "Drug-Drug Association (PharmgKB)";
  } 
  /*
  PHARMGKB
  */
  if(label.startsWith("kegg_substrate_ID")) {
    return "Substrate (KEGG)";
  } 
  else if(label.startsWith("kegg_substrate_label_ID")) {
    return "Substrate Label (KEGG)";
  }  
  else if(label.startsWith("kegg_substrate_url_ID")) {
    return "Substrate URL (KEGG)";
  }  
  if(label.startsWith("kegg_product_ID")) {
    return "Product (KEGG)";
  } 
  else if(label.startsWith("kegg_product_label_ID")) {
    return "Product Label (KEGG)";
  }  
  else if(label.startsWith("kegg_product_url_ID")) {
    return "Product URL (KEGG)";
  }  
  if(label.startsWith("kegg_reaction_ID")) {
    return "Reaction (KEGG)";
  } 
  else if(label.startsWith("kegg_reaction_label_ID")) {
    return "Reaction Label (KEGG)";
  }  
  else if(label.startsWith("kegg_reaction_id_ID")) {
    return "Reaction ID (KEGG)";
  }  
  else if(label.startsWith("kegg_reaction_equation_ID")) {
    return "Reaction Equation (KEGG)";
  }  
  else if(label.startsWith("kegg_reaction_url_ID")) {
    return "Reaction URL (KEGG)";
  }  
  if(label.startsWith("kegg_pathway_ID")) {
    return "Pathway (KEGG)";
  } 
  else if(label.startsWith("kegg_pathway_label_ID")) {
    return "Pathway Label (KEGG)";
  }  
  else if(label.startsWith("kegg_pathway_url_ID")) {
    return "Pathway URL (KEGG)";
  }  
  else if(label.startsWith("kegg_pathway_id_ID")) {
    return "Pathway ID (KEGG)";
  }  
  else if(label.startsWith("kegg_pathway_taxonomy_ID")) {
    return "Pathway Taxonomy (KEGG)";
  }  
  if(label.startsWith("kegg_enzyme_ID")) {
    return "Enzyme (KEGG)";
  } 
  else if(label.startsWith("kegg_enzyme_label_ID")) {
    return "Enzyme Label (KEGG)";
  }  
  else if(label.startsWith("kegg_enzyme_url_ID")) {
    return "Enzyme URL (KEGG)";
  }  
  else if(label.startsWith("kegg_enzyme_id_ID")) {
    return "Enzyme ID (KEGG)";
  }  

 /**
  *
  * EBML EBI
  *
  */

  /*  ATLAS  */
  if(label.startsWith("embl_atlas_experiment_ID")) {
    return "Atlas Experiment (RDF)";
  }
  else if(label.startsWith("embl_atlas_experiment_id")) {
    return "Atlas Experiment ID";
  }
  else if(label.startsWith("embl_atlas_experiment_description")) {
    return "Atlas Experiment Description";
  }
  else if(label.startsWith("embl_atlas_experiment_url")) {
    return "Atlas Experiment URL";
  }
  if(label.startsWith("embl_atlas_organsim_ID")) {
    return "Atlas Organism (RDF)";
  }
  else if(label.startsWith("embl_atlas_organsim_label_ID")) {
    return "Atlas Organism ID";
  }
  if(label.startsWith("embl_atlas_factor_ID")) {
    return "Atlas Factor (RDF)";
  }
  else if(label.startsWith("embl_atlas_factor_label_ID")) {
    return "Atlas Factor Label";
  }
  else if(label.startsWith("embl_atlas_sample_characteristic_type_ID")) {
    return "Atlas Factor Type";
  }
  else if(label.startsWith("embl_atlas_sample_characteristic_value_ID")) {
    return "Atlas Factor Value";
  }
  else if(label.startsWith("embl_atlas_factor_type_ID")) {
    return "Atlas Factor Type";
  }
  else if(label.startsWith("embl_atlas_factor_value_ID")) {
    return "Atlas Factor Value";
  }
  else if(label.startsWith("embl_atlas_factor_label_ID")) {
    return "Atlas Factor Label";
  }
  else if(label.startsWith("embl_atlas_factor_efo_type_ID")) {
    return "Atlas Factor EFO Type";
  }
  if(label.startsWith("embl_atlas_expression_increased_value_ID")) {
    return "Atlas Gene UP (RDF)";
  }
  if(label.startsWith("embl_atlas_expression_decreased_value_ID")) {
    return "Atlas Gene DOWN (RDF)";
  }
  else if(label.startsWith("embl_atlas_expression_value_pvalue_ID")) {
    return "Atlas p-Value";
  }
  else if(label.startsWith("embl_atlas_expression_value_label_ID")) {
    return "Atlas Expression Label";
  }
  else if(label.startsWith("embl_atlas_expression_value_tstatistic_ID")) {
    return "Atlas t-Statistic";
  }
  if(label.startsWith("embl_atlas_differential_expression_analysis_ID")) {
    return "Atlas Diff. Expression Analysis (RDF)";
  }
  else if(label.startsWith("embl_atlas_differential_expression_analysis_label_ID")) {
    return "Atlas Diff. Expression Analysis Label";
  }
  if(label.startsWith("embl_atlas_efo_ID")) {
    return "Atlas EFO (RDF)";
  }
  else if(label.startsWith("embl_atlas_efo_label_ID")) {
    return "Atlas EFO Label";
  }
  else if(label.startsWith("embl_atlas_efo_definition_ID")) {
    return "Atlas EFO Definition";
  }
  if(label.startsWith("embl_atlas_assay_ID")) {
    return "Atlas Assay (RDF)";
  }
  if(label.startsWith("embl_atlas_sample_ID")) {
    return "Atlas Sample (RDF)";
  }
  if(label.startsWith("embl_atlas_design_element")) {
    return "Atlas Design Element";
  }
  else if(label.startsWith("embl_atlas_design_element_id")) {
    return "Atlas Design Element ID";
  }
  if(label.startsWith("embl_atlas_design_platform")) {
    return "Atlas Design Platform";
  }
  else if(label.startsWith("embl_atlas_design_platform_id")) {
    return "Atlas Design Platform ID";
  }
  else if(label.startsWith("embl_atlas_design_platform_manufacturer")) {
    return "Atlas Design Platform Manufacturer";
  }
  if(label.startsWith("embl_atlas_reference_ensembl")) {
    return "Atlas Reference Ensembl";
  }
  if(label.startsWith("embl_atlas_reference_uniprot")) {
    return "Atlas Reference Uniprot";
  }
  if(label.startsWith("embl_atlas_reference_entrez")) {
    return "Atlas Reference Entrez";
  }
  if(label.startsWith("embl_atlas_reference_label")) {
    return "Atlas Reference Label";
  }
  if(label.startsWith("embl_atlas_reference_id")) {
    return "Atlas Reference ID";
  }
  /*  ChEMBL  */
  if(label.startsWith("embl_chembl_protein_ID")) {
    return "ChEMBL Protein (RDF)";
  }
  else if(label.startsWith("embl_chembl_protein_label_ID")) {
    return "ChEMBL Protein Label";
  }
  else if(label.startsWith("embl_chembl_protein_type_ID")) {
    return "ChEMBL Protein Type";
  }
  else if(label.startsWith("embl_chembl_protein_organism_id")) {
    return "ChEMBL Protein Organism ID";
  }
  if(label.startsWith("embl_chembl_document_ID")) {
    return "ChEMBL Document (RDF)";
  }
  else if(label.startsWith("embl_chembl_document_label_ID")) {
    return "ChEMBL Document Label";
  }
  if(label.startsWith("embl_chembl_activity_ID")) {
    return "ChEMBL Activity (RDF)";
  }
  else if(label.startsWith("embl_chembl_activity_standard_value_ID")) {
    return "ChEMBL Activity Standard Value";
  }
  else if(label.startsWith("embl_chembl_activity_standard_units_ID")) {
    return "ChEMBL Activity Standard Units";
  }
  else if(label.startsWith("embl_chembl_activity_standard_type_ID")) {
    return "ChEMBL Activity Standard Type";
  }
  if(label.startsWith("embl_chembl_assay_ID")) {
    return "ChEMBL Assay (RDF)";
  }
  else if(label.startsWith("embl_chembl_assay_type_ID")) {
    return "ChEMBL Assay Type";
  }
  else if(label.startsWith("embl_chembl_assay_description_ID")) {
    return "ChEMBL Assay Description";
  }
  else if(label.startsWith("embl_chembl_assay_cell_type_ID")) {
    return "ChEMBL Assay Cell Type";
  }
  else if(label.startsWith("embl_chembl_assay_target_conf_score_ID")) {
    return "ChEMBL Assay Target Confidence Score";
  }
  if(label.startsWith("embl_chembl_compound_ID")) {
    return "ChEMBL Compound (RDF)";
  }
  else if(label.startsWith("embl_chembl_compound_label_ID")) {
    return "ChEMBL Compound Label";
  }
  else if(label.startsWith("embl_chembl_compound_atc_ID")) {
    return "ChEMBL Compound ATC Code";
  }
  else if(label.startsWith("embl_chembl_compound_phase_ID")) {
    return "ChEMBL Compound Development Phase";
  }
  if(label.startsWith("embl_chembl_protein_class_ID")) {
    return "ChEMBL Protein Class (RDF)";
  }
  else if(label.startsWith("embl_chembl_protein_class_label_ID")) {
    return "ChEMBL Protein Class Label";
  }
  if(label.startsWith("embl_chembl_target_component_ID")) {
    return "ChEMBL Target Component (RDF)";
  }
  else if(label.startsWith("embl_chembl_target_component_description_ID")) {
    return "ChEMBL Target Component Description";
  }
  else if(label.startsWith("embl_chembl_target_component_organism_id_ID")) {
    return "ChEMBL Target Component Organism ID";
  }
  if(label.startsWith("embl_chembl_protein_family_ID")) {
    return "ChEMBL Protein Family (RDF)";
  }
  else if(label.startsWith("embl_chembl_protein_family_label_ID")) {
    return "ChEMBL Protein Family Label";
  }
  else if(label.startsWith("embl_chembl_protein_family_organism_id_ID")) {
    return "ChEMBL Protein Family Organism ID";
  }



  /* Uniprot */
  if(label.startsWith("embl_uniprot_protein_ID")) {
    return "Uniprot Protein";
  }
  else if(label.startsWith("embl_uniprot_protein_label_ID")) {
    return "Uniprot Protein Label";
  }
  else if(label.startsWith("embl_uniprot_protein_mnemonic_ID")) {
    return "Uniprot Protein Mnemonic";
  }
  else if(label.startsWith("embl_uniprot_protein_altName_ID")) {
    return "Uniprot Protein Alt. Name";
  }
  else if(label.startsWith("embl_uniprot_protein_review_ID")) {
    return "Uniprot Protein Review Status";
  }
  if(label.startsWith("embl_uniprot_keyword_ID")) {
    return "Uniprot Keyword/GO (RDF)";
  }
  else if(label.startsWith("embl_uniprot_keyword_label_ID")) {
    return "Uniprot Keyword/GO Label";
  }
  else if(label.startsWith("embl_uniprot_keyword_comment_ID")) {
    return "Uniprot Keyword/GO Comment";
  }
  if(label.startsWith("embl_uniprot_taxonomy_ID")) {
    return "Uniprot Taxonomy (RDF)";
  }
  else if(label.startsWith("embl_uniprot_taxonomy_mnemonic_ID")) {
    return "Uniprot Taxonomy Mnemonic";
  }
  else if(label.startsWith("embl_uniprot_taxonomy_scientific_name_ID")) {
    return "Uniprot Taxonomy Name";
  }
  if(label.startsWith("embl_uniprot_citation_ID")) {
    return "Uniprot Citation";
  }
  else if(label.startsWith("embl_uniprot_citation_title_ID")) {
    return "Uniprot Citation Title";
  }
  else if(label.startsWith("embl_uniprot_citation_comment_ID")) {
    return "Uniprot Citation Comment";
  }
  else if(label.startsWith("embl_uniprot_citation_author_ID")) {
    return "Uniprot Citation Author";
  }
  else if(label.startsWith("embl_uniprot_citation_pubmed_id_ID")) {
    return "Uniprot Citation Pubmed ID";
  }
  if(label.startsWith("embl_uniprot_gene_ID")) {
    return "Uniprot Gene (RDF, error?)";
  }
  else if(label.startsWith("embl_uniprot_gene_label_ID")) {
    return "Uniprot Gene Label";
  }
  if(label.startsWith("embl_uniprot_disease_ID")) {
    return "Uniprot Disease";
  }
  else if(label.startsWith("embl_uniprot_disease_label_ID")) {
    return "Uniprot Disease Label";
  }
  else if(label.startsWith("embl_uniprot_disease_comment_ID")) {
    return "Uniprot Disease Comment";
  }
  else if(label.startsWith("embl_uniprot_disease_omim_id_ID")) {
    return "Uniprot Disease OMIM ID";
  }


  /* Reactome */
  
  if(label.startsWith("embl_reactome_pathway_ID")) {
    return "Reactome Paythway (RDF)";
  }
  else if(label.startsWith("embl_reactome_pathway_name_ID")) {
    return "Reactome Pathway Name";
  }
  else if(label.startsWith("embl_reactome_pathway_comment_ID")) {
    return "Reactome Pathway Name";
  }
  
  if(label.startsWith("embl_reactome_taxonomy_ID")) {
    return "Reactome Taxonomy (RDF)";
  }
  else if(label.startsWith("embl_reactome_taxonomy_name_ID")) {
    return "Reactome Taxonomy Name";
  }
  if(label.startsWith("embl_reactome_reaction_ID")) {
    return "Reactome Reaction (RDF)";
  }
  else if(label.startsWith("embl_reactome_reaction_name_ID")) {
    return "Reactome Reaction Name";
  }
  else if(label.startsWith("embl_reactome_reaction_comment_ID")) {
    return "Reactome Reaction Comment";
  }
  else if(label.startsWith("embl_reactome_reaction_xref_ID")) {
    return "Reactome Reaction Xref";
  }
  if(label.startsWith("embl_reactome_protein_ID")) {
    return "Reactome Protein (RDF)";
  }
  else if(label.startsWith("embl_reactome_protein_name_ID")) {
    return "Reactome Protein Name";
  }
  else if(label.startsWith("embl_reactome_protein_go_name_ID")) {
    return "Reactome Protein GO Location Name";
  }
  else if(label.startsWith("embl_reactome_protein_go_id")) {
    return "Reactome Protein GO Location ID";
  }
  if(label.startsWith("embl_reactome_complex_ID")) {
    return "Reactome Complex (RDF)";
  }
  else if(label.startsWith("embl_reactome_complex_name_ID")) {
    return "Reactome Complex Name";
  }
  else if(label.startsWith("embl_reactome_complex_go_id")) {
    return "Reactome Complex GO Location ID";
  }
  else if(label.startsWith("embl_reactome_complex_go_name")) {
    return "Reactome Complex GO Location Name";
  }
  if(label.startsWith("embl_reactome_molecule_ID")) {
    return "Reactome Molecule (RDF)";
  }
  else if(label.startsWith("embl_reactome_molecule_label_ID")) {
    return "Reactome Molecule Name";
  }
  else if(label.startsWith("embl_reactome_molecule_go_id")) {
    return "Reactome Molecule GO Location ID";
  }





  return label;

}

if (typeof String.prototype.startsWith != 'function') {
  String.prototype.startsWith = function (str){
    return this.indexOf(str) == 0;
  };
}



/*

Regular Expression for URL matching

 */
expressionURL = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
regexURL = new RegExp(expressionURL);


/*

JSON to CSV Converter

 */
 JSONToCSVConvertor = function (JSONData, ReportTitle, ShowLabel) {
    //If JSONData is not an object then JSON.parse will parse the JSON string in an Object
    var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;
    
    var CSV = '';    
    //Set Report title in first row or line
    
    CSV += ReportTitle + '\r\n\n';

    //This condition will generate the Label/Header
    if (ShowLabel) {
      var row = "";

        //This loop will extract the label from 1st index of on array
        for (var index in arrData[0]) {

            //Now convert each value to string and comma-seprated
            row += index + ',';
          }

          row = row.slice(0, -1);

        //append Label row with line break
        CSV += row + '\r\n';
      }

    //1st loop is to extract each row
    for (var i = 0; i < arrData.length; i++) {
      var row = "";

        //2nd loop will extract each column and convert it in string comma-seprated
        for (var index in arrData[i]) {
          row += '"' + arrData[i][index]["value"] + '",';
        }

        row.slice(0, row.length - 1);
        
        //add a line break after each row
        CSV += row + '\r\n';
      }

      if (CSV == '') {        
        alert("Invalid data");
        return;
      }   

    //Generate a file name
    var fileName = "Results_";
    //this will remove the blank-spaces from the title and replace it with an underscore
    fileName += ReportTitle.replace(/ /g,"_");   
    
    //Initialize file format you want csv or xls
    var uri = 'data:text/csv;charset=utf-8,' + escape(CSV);
    
    // Now the little tricky part.
    // you can use either>> window.open(uri);
    // but this will not work in some browsers
    // or you will not get the correct file extension    
    
    //this trick will generate a temp <a /> tag
    var link = document.createElement("a");
    link.href = uri;
    
    //set the visibility hidden so it will not effect on your web-layout
    link.style = "visibility:hidden";
    link.download = fileName + ".csv";
    
    //this part will append the anchor tag and remove it after automatic click
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  sparqlEndpointAvailability = function(cell) {

    var query = 'SELECT * WHERE{ service <' + cell.getAttribute("service") + '> { ?s ?p ?o . } } LIMIT 1';

    $.getJSON("http://www.ebi.ac.uk/rdf/services/atlas/sparql" + "?query=" + query , {
      format: "JSON",
      limit: 1
      },
      //SUCCESS CALLBACK
      function(data) {
        console.log(cell.getAttribute("service") + " is available.");
        $(".endpoints span[data-service='" + cell.getAttribute("service") + "'] i").css("color", "green");
        $(".endpoints span[data-service='" + cell.getAttribute("service") + "'] .status").text("");
    })
    // .success(function() { alert("second success"); })
    .error(function() { console.log(node["@service"] + " is probably not available at the moment!!"); });
  }

  //JSON Version
  sparqlEndpointAvailabilityJSON = function(node) {

    var query = 'SELECT * WHERE{ service <' + node["@service"] + '> { ?s ?p ?o . } } LIMIT 1';

    $.getJSON("http://www.ebi.ac.uk/rdf/services/atlas/sparql" + "?query=" + query , {
      format: "JSON",
      limit: 1
      },
      //SUCCESS CALLBACK
      function(data) {
        console.log( node["@service"] + " is available.");
        $(".endpoints span[data-service='" + node["@service"] + "'] i").css("color", "green");
        $(".endpoints span[data-service='" + node["@service"] + "'] .status").text("");
    })
    // .success(function() { alert("second success"); })
    .error(function() { console.log(node["@service"] + " is probably not available at the moment!!"); });
  }

  sparqlQueryEndpointChecker = function(xml) {

    var checkedEndpoints = new Array();
    
    if($.xmlToJSON(xml)["root"]) {
      var json = $.xmlToJSON(xml)["root"][0];
    }
    else return;    

    if(json.Entity) {
      for (var i = 0; i < json.Entity.length; i++) {
        var endpoint = json.Entity[i]["@service"];
        if(!_.contains(checkedEndpoints, endpoint)) {
          console.log("Now checking " + endpoint + " for availability...");
          $(".endpoints span[data-service='" + endpoint + "'] i").css("color", "orange").parent().show();
          $(".endpoints span[data-service='" + endpoint + "'] .status").text("checking...");
          checkedEndpoints.push(endpoint);
          sparqlEndpointAvailabilityJSON(json.Entity[i]);
        }
      }
    }

  }


  /*
  Add the template overlay tag to a cell
  cell: the cell to add the overlay to
  editor: current editor..
  editable: boolean, true to allow overlay removal, false to disallow
   */
  resultOverlay = function(cell, editor, editable, notice) {

     var type = cell.value.nodeName || null;
         var isResult = cell.getAttribute('isResult');

         if(cell.value.nodeName == "Property") {
                console.log("Adding Property To Result Set...");
                //http://jgraph.github.io/mxgraph/docs/js-api/files/view/mxCellOverlay-js.html#mxCellOverlay.mxCellOverlay
                // Creates a new overlay with an image and a tooltip
                var overlay = new mxCellOverlay(
                  new mxImage('../images/glyphicons_457_transfer.png', 20, 20),
                  'This Node will be part of the result set. Click this to remove from the result set.', mxConstants.ALIGN_LEFT, mxConstants.ALIGN_TOP);
                // Installs a handler for clicks on the overlay   
                if(editable) {              
                  overlay.addListener(mxEvent.CLICK, function(sender, evt2)
                  {
                    cell.setAttribute("isResult", false);
                    editor.graph.removeCellOverlay(cell, overlay);                
                    console.log("Removing Property From Result Set...");
                    if(notice) $.pnotify({
                      title: 'Node "' + cell.getAttribute("label") + '" was removed from the result set!',
                      text: 'notice',
                      type: 'success',
                        opacity: .9
                    });
                  });
                }
                // Sets the overlay for the cell in the graph
                editor.graph.addCellOverlay(cell, overlay);
                console.log(editor.graph.getCellOverlays(cell));
                
                cell.setAttribute("isResult", true);

                if(notice) $.pnotify({
                  title: 'Node "' + cell.getAttribute("label") + '" is now part of the result set!',
                  text: 'To remove it, click the <img src="../images/glyphicons_457_transfer.png" width="14" height="14"> icon next to it.',
                  type: 'success',
                    opacity: .9
                });


         }

         if(cell.value.nodeName == "Entity") {
                console.log("Adding Entity To Result Set...");
                //http://jgraph.github.io/mxgraph/docs/js-api/files/view/mxCellOverlay-js.html#mxCellOverlay.mxCellOverlay
                // Creates a new overlay with an image and a tooltip
                var overlay = new mxCellOverlay(
                  new mxImage('../images/glyphicons_457_transfer.png', 20, 20),
                  'This Node will be part of the result set. Click this to remove from the result set.', mxConstants.ALIGN_LEFT, mxConstants.ALIGN_TOP);
                // Installs a handler for clicks on the overlay    
                if(editable) {             
                  overlay.addListener(mxEvent.CLICK, function(sender, evt2)
                  {
                    cell.setAttribute("isResult", false);
                    editor.graph.removeCellOverlay(cell, overlay);                
                    console.log("Removing Entity From Result Set...");
                    if(notice) $.pnotify({
                      title: 'Node "' + cell.getAttribute("label") + '" was removed from the result set!',
                      text: 'notice',
                      type: 'success',
                        opacity: .9
                    });
                  });
                }
                // Sets the overlay for the cell in the graph
                editor.graph.addCellOverlay(cell, overlay);
                cell.setAttribute("isResult", true);

                if(notice) $.pnotify({
                  title: 'Node "' + cell.getAttribute("label") + '" is now part of the result set!',
                  text: 'To remove it, click the <img src="../images/glyphicons_457_transfer.png" width="14" height="14"> icon next to it.',
                  type: 'success',
                    opacity: .9
                });

         }

  }

  /*
  Add the template overlay tag to a cell
  cell: the cell to add the overlay to
  editor: current editor..
  editable: boolean, true to allow overlay removal, false to disallow
  notice: boolean, true to display a notice
   */
  templateOverlay = function(cell, editor, editable, notice) {
    var type = cell.value.nodeName || null;
    var isPremade = cell.getAttribute('isPremade');

    if(cell.value.nodeName == "Property") {  
          console.log("Marking Property as Template...");
          //http://jgraph.github.io/mxgraph/docs/js-api/files/view/mxCellOverlay-js.html#mxCellOverlay.mxCellOverlay
          // Creates a new overlay with an image and a tooltip
          var overlay = new mxCellOverlay(
            new mxImage('../images/glyphicons_049_star.png', 20, 20),
            'This node is a template node. Template nodes remain editable. Click the icon to remove it from the templates.', mxConstants.ALIGN_LEFT, mxConstants.ALIGN_BOTTOM);
          // Installs a handler for clicks on the overlay     
          if(editable) {        
            overlay.addListener(mxEvent.CLICK, function(sender, evt2)
            {
              cell.setAttribute("isPremade", false);
              editor.graph.removeCellOverlay(cell, overlay);                
              console.log("Unmarking Property as Template...");
              if(notice) $.pnotify({
                title: 'Node "' + cell.getAttribute("label") + '" is no longer a template node!',
                text: 'notice',
                type: 'success',
                  opacity: .9
              });
            });
          }
          // Sets the overlay for the cell in the graph
          editor.graph.addCellOverlay(cell, overlay);
          console.log(editor.graph.getCellOverlays(cell));
          cell.setAttribute("isPremade", true);

          if(notice) $.pnotify({
            title: 'Node "' + cell.getAttribute("label") + '" is now a template node!',
            text: 'To remove it, click the <img src="../images/glyphicons_049_star.png" width="14" height="14"> icon next to it.',
            type: 'success',
              opacity: .9
          });
    }

    else {
      mxUtils.alert('Can not set this node as premade!');
    }

  }
  



  /*************************************************************************************************************************************
  **************************************************************************************************************************************
  **************************************************************************************************************************************
  GUI RELATED
  VIEWS
  **************************************************************************************************************************************
  **************************************************************************************************************************************
  *************************************************************************************************************************************/

  startIntroEditor = function(){
    var intro = introJs();
      intro.setOptions({
        steps: [
          {
            element: '#name',
            intro: "Start off by adding an informative title for your query. ",
            position: 'right'
          },
          {
            element: '#description',
            intro: "Add some description to it. If you make this query available to everyone, be expressive.",
            position: 'right'
          },
          {
            element: '#s2id_select-category',
            intro: 'Tag your query with one or more categories. Choose them depending on the databases your query uses.',
            position: 'right'
          },
          {
            element: '#private',
            intro: "Visibility: <strong>Private</strong><br>If you set this option, then the query will only be visible to you. ",
            position: 'right'
          },
          {
            element: '#public',
            intro: "Visibility: <strong>Shared</strong><br>If you set this option, then the query will be visible to you and others. The query will be available here, and in the 'Shared Queries' tab. However, <strong>the query will only be editable/changeable by you.</strong>",
            position: 'right'
          },
          {
            element: '#template',
            intro: "Visibility: <strong>Template</strong><br>If you set this option, then the query will be visible to you and others in the 'Template Queries' tab, and is only changeable by you. Template Queries are a kind of boilerplate queries, that have specific fields editable like Gene or Protein. See the Documentation for more information.",
            position: 'right'
          },
          {
            element: '#graph',
            intro: "To build a query, choose elements from the toolbar on the right, and drag them here into the editor area. To connect elements, simply drag from one element to the other.<br> See the documentation for a step-by-step tutorial!",
            position: 'left'
          },
          {
            element: '#toolbar',
            intro: "This toolbar area contains all available databases and elements. Elements with a green border are Objects like Gene, Pathway or Protein, while the smaller elements right to them are properties of the respective Object.",
            position: 'left'
          },
          {
            element: '.embl_reactome_pathway.subject',
            intro: "<strong>Example</strong>: The Object Pathway has two properties: Name and Comment.",
            position: 'left'
          },
          {
            element: 'form.form-inline',
            intro: "<strong>Limit</strong>: Maximum size of the returned result set.<br><strong>Offset</strong>: Causes the solutions generated to start after the specified number of solutions.",
            position: 'left'
          },
          {
            element: '.endpoints-container',
            intro: "Here you can see all SPARQL endpoints and their availability that are part of the query. <br><strong>Green</strong>: Endpoint online.<br><strong>Orange/Red</strong>: Status unknown, or unavailable.<br>If the status does not switch to green in a few seconds, the endpoint might not be available at the moment, which also means your query can not be answered!",
            position: 'top'
          }, 
        ]
      });

      intro.start();
  }

  startIntroTemplate = function(){
    var intro = introJs();
      intro.setOptions({
        steps: [
          {
            element: '.template-meta',
            intro: "Here you can see the author of the query, together with some information. You can not edit these elements. This is only allowed if you are the author of the query, and you view this query from the editor.",
            position: 'right'
          },
          {
            element: '#graph',
            intro: "This is the query graph. You can not edit anything, except these 2:<br><img src='../images/glyphicons_049_star.png' width='14' height='14'>: This is a <strong>Template Node</strong>. It is editable by double clicking.<br><img src='../images/glyphicons_457_transfer.png' width='14' height='14'>: This is a <strong>Result Node</strong>. If you have result nodes in your graph, only these will show up in the result table. Add them by right clicking on a node.",
            position: 'left'
          },
          {
            element: 'form.form-inline',
            intro: "<strong>Limit</strong>: Maximum size of the returned result set.<br><strong>Offset</strong>: Causes the solutions generated to start after the specified number of solutions.",
            position: 'right'
          },
          {
            element: '#disqus_thread',
            intro: "This is the comments section. It is specific to this query.",
            position: 'right'
          },
          {
            element: '.endpoints-container',
            intro: "Here you can see all SPARQL endpoints and their availability that are part of the query. <br><strong>Green</strong>: Endpoint online.<br><strong>Orange/Red</strong>: Status unknown, or unavailable.<br>If the status does not switch to green in a few seconds, the endpoint might not be available at the moment, which also means your query can not be answered!",
            position: 'top'
          },          
        ]
      });

      intro.start();
  }