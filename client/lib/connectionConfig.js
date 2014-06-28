connectionConfig = {};


connectionConfig.special = {

	/*************************************************************************************************************************************
	**************************************************************************************************************************************
	**************************************************************************************************************************************
	Bio2RDF
	**************************************************************************************************************************************
	**************************************************************************************************************************************
	*************************************************************************************************************************************/


	/********************************
	AFFYMETRIX
	********************************/
	affy_TO_gene: function(where, affy, gene) {
		where.statement_begin();
    	where.statement("?" + affy.shortName + affy.id, "<" + "http://bio2rdf.org/affymetrix_vocabulary:x-geneid" + ">", "?" + gene.shortName + gene.id); 
        where.end();
	},
	/********************************
	DRUGBANK
	********************************/
	drug_TO_drug_target: function(where, drug, drug_target) {
		// ~ DUMMY FUNCTION, actually, a default where clause
		where.statement_begin();
    	where.statement("?" + drug.shortName + "_ID" +  drug.id, "<" + "http://bio2rdf.org/drugbank_vocabulary:target" + ">", "?" + drug_target.shortName + "_ID" +  drug_target.id); 
        where.end();
	},
	drug_target_interaction_TO_drug: function(where, drug_target_interaction, drug) {
		where.statement_begin();
    	where.statement("?" + drug_target_interaction.shortName + "_ID" + drug_target_interaction.id + "_from_" + drug_target_interaction.from + "_to_" + drug_target_interaction.to , "<http://bio2rdf.org/drugbank_vocabulary:drug>", "?" + drug.shortName + "_ID" +  drug.id); 
        where.end();
	},
	drug_target_interaction_TO_drug_target: function(where, drug_target_interaction, drug_target) {
		where.statement_begin();
    	where.statement("?" + drug_target_interaction.shortName + "_ID" + drug_target_interaction.id + "_from_" + drug_target_interaction.from + "_to_" + drug_target_interaction.to, "<http://bio2rdf.org/drugbank_vocabulary:target>", "?" + drug_target.shortName + "_ID" + drug_target.id); 
        where.end();
	},
	//only working with gene label!
	drug_target_TO_gene: function(where, drug, gene, services) {
		where.statement_begin();
		where.statement("?" + drug.shortName + "_ID"+ drug.id, "<http://bio2rdf.org/drugbank_vocabulary:xref>", "?hgnc_from_" + gene.id + "_to_" + drug.id);
        where.end();

 
       	//EXTRA HGNC SERVICE
		services["http://cu.hgnc.bio2rdf.org/sparql"] = new Object();
		services["http://cu.hgnc.bio2rdf.org/sparql"].where = squel.expr();
		services["http://cu.hgnc.bio2rdf.org/sparql"].where.service_begin().service_endpoint("<http://cu.hgnc.bio2rdf.org/sparql>");
		 	services["http://cu.hgnc.bio2rdf.org/sparql"].where.statement_begin();
	    		services["http://cu.hgnc.bio2rdf.org/sparql"].where.statement("?hgnc_from_" + gene.id + "_to_" + drug.id, "<http://bio2rdf.org/hgnc_vocabulary:x-geneid>", "?gene_ID" + gene.id); 
	       	services["http://cu.hgnc.bio2rdf.org/sparql"].where.end();
	},

	/********************************
	GENE
	********************************/
	gene_tax: function(where, tax, gene) {
	 	where.statement_begin();
    	where.statement("?" + gene.shortName + "_ID" + gene.id, "<" + tax.type + ">", "?" + tax.shortName + "_ID" +gene.id); //or rdfs:label
        if(tax.label != tax.defaultLabel && tax.label != "") {
            where.filter_regex("?" + tax.shortName +  "_ID" + gene.id, tax.label);
        }
       	where.end();
	},
	//http://bio2rdf.org/geneid_vocabulary:has_nomenclature_authority
	//has to be a exact match! performance problems
	gene_symbol: function(where, symbol, gene) {
	 	where.statement_begin();
        if(symbol.label != symbol.defaultLabel && symbol.label != "") {
            where.statement("?" + gene.shortName + "_ID" + gene.id, "<" + symbol.type + ">", "'" + symbol.label + "'");
        } else {
            where.statement("?" + gene.shortName + "_ID" + gene.id, "<" + symbol.type + ">", "?" + symbol.shortName + gene.id);
        }
       	where.end();
	},

	//gene to GO Function from Bioportal namespace
	gene_TO_go_function: function(where, gene, go_function) {
	 	where.statement_begin();
    	where.statement("?" + gene.shortName + "_ID" + gene.id, "<http://bio2rdf.org/geneid_vocabulary:function>", "?" + go_function.shortName + "_ID" + go_function.id + "_source_" + gene.id); 
       	where.end();
	},
	//gene to GO Component from Bioportal namespace
	gene_TO_go_component: function(where, gene, go_component) {
	 	where.statement_begin();
    	where.statement("?" + gene.shortName + "_ID" + gene.id, "<http://bio2rdf.org/geneid_vocabulary:component>", "?" + go_component.shortName + "_ID" + go_component.id + "_source_" + gene.id); 
       	where.end();
	},
	//gene to GO Process from Bioportal namespace
	gene_TO_go_process: function(where, gene, go_process) {
	 	where.statement_begin();
    	where.statement("?" + gene.shortName + "_ID" + gene.id, "<http://bio2rdf.org/geneid_vocabulary:process>", "?" + go_process.shortName + "_ID" + go_process.id + "_source_" + gene.id); 
       	where.end();
	},
	//gene process association to gene
	gene_go_process_TO_gene: function(where, gene_go_process, gene) {
	 	where.statement_begin();
    	where.statement("?" + gene_go_process.shortName + "_ID" + gene_go_process.id + "_from_" + gene_go_process.from + "_to_" + gene_go_process.to, "<http://bio2rdf.org/geneid_vocabulary:gene>", "?" + gene.shortName + "_ID" + gene.id); 
       	where.end();
	},
	//gene process association to process
	gene_go_process_TO_go_process: function(where, gene_go_process, process) {
	 	where.statement_begin();
    	where.statement("?" + gene_go_process.shortName + "_ID" + gene_go_process.id + "_from_" + gene_go_process.from + "_to_" + gene_go_process.to, "<http://bio2rdf.org/geneid_vocabulary:go_term>", "?" + process.shortName + "_ID" + process.id + "_source_" + gene_go_process.id); 
       	where.end();
	},
	
	//go function association to gene
	gene_go_function_TO_gene: function(where, gene_go_function, gene) {
	 	where.statement_begin();
    	where.statement("?" + gene_go_function.shortName + "_ID" + gene_go_function.id + "_from_" + gene_go_function.from + "_to_" + gene_go_function.to, "<http://bio2rdf.org/geneid_vocabulary:gene>", "?" + gene.shortName + "_ID" + gene.id); 
       	where.end();
	},
	//gene function association to go function
	gene_go_function_TO_go_function: function(where, gene_go_function, go_function) {
	 	where.statement_begin();
    	where.statement("?" + gene_go_function.shortName + "_ID" + gene_go_function.id + "_from_" + gene_go_function.from + "_to_" + gene_go_function.to, "<http://bio2rdf.org/geneid_vocabulary:go_term>", "?" + go_function.shortName + "_ID" + go_function.id + "_source_" + gene_go_function.id); 
       	where.end();
	},
	//go component association to gene
	gene_go_component_TO_gene: function(where, gene_go_component, gene) {
	 	where.statement_begin();
    	where.statement("?" + gene_go_component.shortName + "_ID" + gene_go_component.id + "_from_" + gene_go_component.from + "_to_" + gene_go_component.to, "<http://bio2rdf.org/geneid_vocabulary:gene>", "?" + gene.shortName + "_ID" + gene.id); 
       	where.end();
	},
	//gene component association to go component
	gene_go_component_TO_go_component: function(where, gene_go_component, go_component) {
	 	where.statement_begin();
    	where.statement("?" + gene_go_component.shortName + "_ID" + gene_go_component.id + "_from_" + gene_go_component.from + "_to_" + gene_go_component.to, "<http://bio2rdf.org/geneid_vocabulary:go_term>", "?" + go_component.shortName + "_ID" + go_component.id + "_source_" + gene_go_component.id); 
       	where.end();
	},
	/********************************
	GO
	********************************/

	/********************************
	PHARMGKB
	********************************/
	/*disease gene associations*/
	//dga to ncbi gene
	pharmgkb_dga_TO_gene: function(where, pharmgkb_dga, gene) {
	 	where.statement_begin();
    	where.statement("?" + pharmgkb_dga.shortName + "_ID" + pharmgkb_dga.id + "_from_" + pharmgkb_dga.from + "_to_" + pharmgkb_dga.to, "<http://bio2rdf.org/pharmgkb_vocabulary:gene>", "?i_" + pharmgkb_dga.shortName + "_ID" + pharmgkb_dga.id + "_gene_ID" + gene.id); 
        where.statement("?i_" + pharmgkb_dga.shortName + "_ID" + pharmgkb_dga.id + "_gene_ID" + gene.id, "owl:sameAs", "?" + gene.shortName +  "_ID" + gene.id);
       	where.end();
	},
	//dga to pharmgkb disease
	pharmgkb_dga_TO_pharmgkb_disease: function(where, pharmgkb_dga, disease) {
	 	where.statement_begin();
    	where.statement("?" + pharmgkb_dga.shortName + "_ID" + pharmgkb_dga.id + "_from_" + pharmgkb_dga.from + "_to_" + pharmgkb_dga.to, "<http://bio2rdf.org/pharmgkb_vocabulary:disease>", "?" + disease.shortName + "_ID" + disease.id); 
       	where.end();
	},
	//dga to pharmgkb gene
	pharmgkb_dga_TO_pharmgkb_gene: function(where, pharmgkb_dga, gene) {
	 	where.statement_begin();
    	where.statement("?" + pharmgkb_dga.shortName + "_ID" + pharmgkb_dga.id + "_from_" + pharmgkb_dga.from + "_to_" + pharmgkb_dga.to, "<http://bio2rdf.org/pharmgkb_vocabulary:gene>", "?" + gene.shortName + "_ID" + gene.id); 
       	where.end();
	},

	/*Drug gene associations*/
	//drga to pharmgkb gene
	pharmgkb_drga_TO_pharmgkb_gene: function(where, pharmgkb_drga, gene) {
	 	where.statement_begin();
    	where.statement("?" + pharmgkb_drga.shortName + "_ID" + pharmgkb_drga.id + "_from_" + pharmgkb_drga.from + "_to_" + pharmgkb_drga.to, "<http://bio2rdf.org/pharmgkb_vocabulary:gene>", "?" + gene.shortName + "_ID" + gene.id); 
       	where.end();
	},
	//drga to pharmgkb drug
	pharmgkb_drga_TO_pharmgkb_drug: function(where, pharmgkb_drga, drug) {
	 	where.statement_begin();
    	where.statement("?" + pharmgkb_drga.shortName + "_ID" + pharmgkb_drga.id + "_from_" + pharmgkb_drga.from + "_to_" + pharmgkb_drga.to, "<http://bio2rdf.org/pharmgkb_vocabulary:drug>", "?" + drug.shortName + "_ID" + drug.id); 
       	where.end();
	},
	//drga to drugbank drug
	pharmgkb_drga_TO_drug: function(where, pharmgkb_drga, drug) {
	 	where.statement_begin();
    	where.statement("?" + pharmgkb_drga.shortName + "_ID" + pharmgkb_drga.id + "_from_" + pharmgkb_drga.from + "_to_" + pharmgkb_drga.to, "<http://bio2rdf.org/pharmgkb_vocabulary:drug>", "?i_" + pharmgkb_drga.shortName + "_" + pharmgkb_drga.id + "_drug_" + drug.id); 
        where.statement("?i_" + pharmgkb_drga.shortName + "_" + pharmgkb_drga.id + "_drug_" + drug.id, "<http://bio2rdf.org/pharmgkb_vocabulary:xref>", "?" + drug.shortName +  "_ID" + drug.id);
       	where.end();
	},
	//drga to ncbi gene
	pharmgkb_drga_TO_gene: function(where, pharmgkb_drga, gene) {
	 	where.statement_begin();
    	where.statement("?" + pharmgkb_drga.shortName + "_ID" + pharmgkb_drga.id + "_from_" + pharmgkb_drga.from + "_to_" + pharmgkb_drga.to, "<http://bio2rdf.org/pharmgkb_vocabulary:gene>", "?i_" + pharmgkb_drga.shortName + "_" + pharmgkb_drga.id + "_gene_" + gene.id); 
        where.statement("?i_" + pharmgkb_drga.shortName + "_" + pharmgkb_drga.id + "_gene_" + gene.id, "owl:sameAs", "?" + gene.shortName +  "_ID" + gene.id);
       	where.end();
	},
	//pharmgkb drug-drug association to pharmgkb drug
	pharmgkb_drdra_TO_pharmgkb_drug: function(where, pharmgkb_drdra, drug) {
	 	where.statement_begin();
    	where.statement("?" + pharmgkb_drdra.shortName + "_ID" + pharmgkb_drdra.id + "_from_" + pharmgkb_drdra.from + "_to_" + pharmgkb_drdra.to, "<http://bio2rdf.org/pharmgkb_vocabulary:drug>", "?" + drug.shortName + "_ID" + drug.id); 
       	where.end();
	},
	//pharmgkb drug to pharmgkb chemical
	pharmgkb_drug_TO_pharmgkb_chemical: function(where, pharmgkb_drug, chemical) {
	 	where.statement_begin();
    	where.statement("?" + pharmgkb_drug.shortName + "_ID" + pharmgkb_drug.id, "<http://bio2rdf.org/pharmgkb_vocabulary:xref>", "?" + chemical.shortName + "_ID" + chemical.id); 
       	where.end();
	},
	//pharmgkb drug to drugbank drug
	pharmgkb_drug_TO_drug: function(where, pharmgkb_drug, drug) {
	 	where.statement_begin();
    	where.statement("?" + pharmgkb_drug.shortName + "_ID" + pharmgkb_drug.id, "<http://bio2rdf.org/pharmgkb_vocabulary:xref>", "?" + drug.shortName + "_ID" + drug.id); 
       	where.end();
	},
	//pharmgkb side effect to pharmgkb chemical
	pharmgkb_sideeffect_TO_pharmgkb_chemical: function(where, pharmgkb_sideeffect, chemical) {
	 	where.statement_begin();
    	where.statement("?" + pharmgkb_sideeffect.shortName + "_ID" + pharmgkb_sideeffect.id + "_from_" + pharmgkb_sideeffect.from + "_to_" + pharmgkb_sideeffect.to, "<http://bio2rdf.org/pharmgkb_vocabulary:chemical>", "?" + chemical.shortName + "_ID" + chemical.id); 
       	where.end();
	}, 
	//pharmgkb side effect to pharmgkb event
	pharmgkb_sideeffect_TO_pharmgkb_event: function(where, pharmgkb_sideeffect, pharmgkb_event) {
	 	where.statement_begin();
    	where.statement("?" + pharmgkb_sideeffect.shortName + "_ID" + pharmgkb_sideeffect.id + "_from_" + pharmgkb_sideeffect.from + "_to_" + pharmgkb_sideeffect.to, "<http://bio2rdf.org/pharmgkb_vocabulary:event>", "?" + pharmgkb_event.shortName + "_ID" + pharmgkb_event.id); 
       	where.end();
	}, 
	/********************************
	KEGG
	********************************/
	kegg_pathway_TO_kegg_relation : function(where, path, relation) {
		// ~ DUMMY FUNCTION, actually, a default where clause
		where.statement_begin();
    	where.statement("?" + path.shortName + "_ID" +  path.id, "<http://bio2rdf.org/kegg_vocabulary:xRelation>", "?" + relation.shortName + "_ID" +  relation.id); 
        where.end();
	},
	kegg_pathway_TO_kegg_reaction : function(where, path, reaction) {
		// ~ DUMMY FUNCTION, actually, a default where clause
		where.statement_begin();
    	where.statement("?" + path.shortName + "_ID" +  path.id, "<http://bio2rdf.org/kegg_vocabulary:xReaction>", "?" + reaction.shortName + "_ID" +  reaction.id); 
        where.end();
	},
	kegg_reaction_TO_kegg_substrate : function(where, reaction, substrate) {
		where.statement_begin();
    	where.statement("?" + reaction.shortName + "_ID" +  reaction.id, "<http://bio2rdf.org/kegg_vocabulary:xSubstrate>", "?i_" + substrate.shortName + "_ID" +  substrate.id); 
    	where.statement("?"   + substrate.shortName + "_ID" +  substrate.id, "<http://www.w3.org/2002/07/owl#sameAs>", "?i_" + substrate.shortName + "_ID" +  substrate.id); 
        where.end();
	},
	kegg_reaction_TO_kegg_product : function(where, reaction, product) {
		where.statement_begin();
    	where.statement("?" + reaction.shortName + "_ID" +  reaction.id, "<http://bio2rdf.org/kegg_vocabulary:xProduct>", "?i_" + product.shortName + "_ID" +  product.id); 
    	where.statement("?"   + product.shortName + "_ID" +  product.id, "<http://www.w3.org/2002/07/owl#sameAs>", "?i_" + product.shortName + "_ID" +  product.id); 
        where.end();
	},
	kegg_reaction_TO_kegg_enzyme : function(where, reaction, enzyme) {
		where.statement_begin();
    	where.statement("?" + reaction.shortName + "_ID" +  reaction.id, "<http://bio2rdf.org/kegg_vocabulary:xEnzyme>", "?" + enzyme.shortName + "_ID" +  enzyme.id); 
        where.end();
	},

	/********************************
	SGD
	********************************/	
  	//gene to GO Component from Bioportal namespace
	sgd_protein_TO_go_component: function(where, protein, go_component) {
	 	where.statement_begin();
    	where.statement("?" + protein.shortName + "_ID" + protein.id, "<http://bio2rdf.org/sgd_vocabulary:is-located-in>", "?" + go_component.shortName + "_ID" + go_component.id + "_source_" + protein.id); 
       	where.end();
	},	
	//gene to GO Function from Bioportal namespace
	sgd_protein_TO_go_function: function(where, protein, go_function) {
	 	where.statement_begin();
    	where.statement("?" + protein.shortName + "_ID" + protein.id, "<http://bio2rdf.org/sgd_vocabulary:has-function>", "?" + go_function.shortName + "_ID" + go_function.id + "_source_" + protein.id); 
       	where.end();
	},	
  	//gene to GO Process from Bioportal namespace
	sgd_protein_TO_go_process: function(where, protein, go_process) {
	 	where.statement_begin();
    	where.statement("?" + protein.shortName + "_ID" + protein.id, "<http://bio2rdf.org/sgd_vocabulary:is-participant-in>", "?" + go_process.shortName + "_ID" + go_process.id + "_source_" + protein.id); 
       	where.end();
	},	
	sgd_gene_TO_sgd_protein: function(where, gene, protein) {
	 	where.statement_begin();
    	where.statement("?" + gene.shortName + "_ID" + gene.id, "<http://bio2rdf.org/sgd_vocabulary:encodes>", "?" + protein.shortName + "_ID" + protein.id); 
    	where.filter_regex("?" + protein.shortName +  "_ID" + protein.id, "sgd_resource");
       	where.end();
	},
	sgd_interaction_TO_sgd_protein: function(where, interaction, protein) {
		var protein_id = protein.id;
		var interaction_from_id = interaction.from;

 		where.statement_begin();
		//interaction is from the main protein entry: http://bio2rdf.org/sgd_vocabulary:bait
		if(protein_id == interaction_from_id) {
    		where.statement("?" + interaction.shortName + "_ID" + interaction.id + "_from_" + interaction.from + "_to_" + interaction.to, "<http://bio2rdf.org/sgd_vocabulary:bait>", "?" + protein.shortName + "_ID" + protein.id); 
		}
		else {
    		where.statement("?" + interaction.shortName + "_ID" + interaction.id + "_from_" + interaction.from + "_to_" + interaction.to, "<http://bio2rdf.org/sgd_vocabulary:hit>", "?" + protein.shortName + "_ID" + protein.id); 
		}
       	where.end();
	},

	/********************************
	CTD
	********************************/	
	
	/*disease gene associations*/
	//dga to ncbi gene
	ctd_dga_TO_gene: function(where, ctd_dga, gene) {
	 	where.statement_begin();
    	where.statement("?" + ctd_dga.shortName + "_ID" + ctd_dga.id + "_from_" + ctd_dga.from + "_to_" + ctd_dga.to, "<http://bio2rdf.org/ctd_vocabulary:gene>", "?" + gene.shortName +  "_ID" + gene.id);
       	where.end();
	},
	//dga to ctd disease
	ctd_dga_TO_ctd_disease: function(where, ctd_dga, ctd_disease) {
	 	where.statement_begin();
    	where.statement("?" + ctd_dga.shortName + "_ID" + ctd_dga.id + "_from_" + ctd_dga.from + "_to_" + ctd_dga.to, "<http://bio2rdf.org/ctd_vocabulary:disease>", "?" + ctd_disease.shortName +  "_ID" + ctd_disease.id);
       	where.end();
	},
	/*chemical disease associations*/
	//cda to ctd chemical
	ctd_cda_TO_ctd_chemical: function(where, ctd_cda, ctd_chemical) {
	 	where.statement_begin();
    	where.statement("?" + ctd_cda.shortName + "_ID" + ctd_cda.id + "_from_" + ctd_cda.from + "_to_" + ctd_cda.to, "<http://bio2rdf.org/ctd_vocabulary:chemical>", "?" + ctd_chemical.shortName +  "_ID" + ctd_chemical.id);
       	where.end();
	},
	//cda to ctd disease
	ctd_cda_TO_ctd_disease: function(where, ctd_cda, ctd_disease) {
	 	where.statement_begin();
    	where.statement("?" + ctd_cda.shortName + "_ID" + ctd_cda.id + "_from_" + ctd_cda.from + "_to_" + ctd_cda.to, "<http://bio2rdf.org/ctd_vocabulary:disease>", "?" + ctd_disease.shortName +  "_ID" + ctd_disease.id);
       	where.end();
	},
	/*chemical gene associations*/
	//cga to ctd chemical
	ctd_cga_TO_ctd_chemical: function(where, ctd_cga, ctd_chemical) {
	 	where.statement_begin();
    	where.statement("?" + ctd_cga.shortName + "_ID" + ctd_cga.id + "_from_" + ctd_cga.from + "_to_" + ctd_cga.to, "<http://bio2rdf.org/ctd_vocabulary:chemical>", "?" + ctd_chemical.shortName +  "_ID" + ctd_chemical.id);
       	where.end();
	},
	//cda to ncbi gene
	ctd_cga_TO_gene: function(where, ctd_cga, gene) {
	 	where.statement_begin();
    	where.statement("?" + ctd_cga.shortName + "_ID" + ctd_cga.id + "_from_" + ctd_cga.from + "_to_" + ctd_cga.to, "<http://bio2rdf.org/ctd_vocabulary:gene>", "?" + gene.shortName +  "_ID" + gene.id);
       	where.end();
	},

	/*************************************************************************************************************************************
	**************************************************************************************************************************************
	**************************************************************************************************************************************
	EMBL - EBI
	**************************************************************************************************************************************
	**************************************************************************************************************************************
	*************************************************************************************************************************************/

	/*************************************************************************************************************************************
	**************************************************************************************************************************************
	ATLAS
	**************************************************************************************************************************************
	*************************************************************************************************************************************/

	embl_atlas_experiment_TO_embl_atlas_organism: function(where, experiment, organism) {
	 	where.statement_begin();
    	where.statement("?" + experiment.shortName + "_ID" + experiment.id , "<http://rdf.ebi.ac.uk/terms/atlas/isAbout>", "?" + organism.shortName +  "_ID" + organism.id);
       	where.end();
	},
	embl_atlas_experiment_TO_embl_atlas_assay: function(where, experiment, assay) {
	 	where.statement_begin();
    	where.statement("?" + experiment.shortName + "_ID" + experiment.id , "<http://rdf.ebi.ac.uk/terms/atlas/hasAssay>", "?" + assay.shortName +  "_ID" + assay.id);
       	where.end();
	},
	embl_atlas_assay_TO_embl_atlas_sample: function(where, assay, sample) {
	 	where.statement_begin();
    	where.statement("?" + assay.shortName + "_ID" + assay.id , "<http://rdf.ebi.ac.uk/terms/atlas/hasSample>", "?" + sample.shortName +  "_ID" + sample.id);
       	where.end();
	},
	embl_atlas_sample_TO_embl_atlas_factor: function(where, sample, factor) {
	 	where.statement_begin();
    	where.statement("?" + sample.shortName + "_ID" + sample.id , "<http://rdf.ebi.ac.uk/terms/atlas/hasSampleCharacteristic>", "?" + factor.shortName +  "_ID" + factor.id);
       	where.end();
	},
	embl_atlas_sample_TO_embl_atlas_organism: function(where, sample, organism) {
	 	where.statement_begin();
    	where.statement("?" + sample.shortName + "_ID" + sample.id , "<http://semanticscience.org/resource/SIO_000244>", "?" + organism.shortName +  "_ID" + organism.id);
       	where.end();
	},
	embl_atlas_factor_TO_embl_atlas_organism: function(where, factor, organism) {
	 	where.statement_begin();
    	where.statement("?" + factor.shortName + "_ID" + factor.id , "<http://www.w3.org/1999/02/22-rdf-syntax-ns#type>", "?" + organism.shortName +  "_ID" + organism.id);
       	where.end();
	},	
	embl_atlas_factor_TO_embl_atlas_efo: function(where, factor, efo) {
	 	where.statement_begin();
    	where.statement("?" + factor.shortName + "_ID" + factor.id , "<http://www.w3.org/1999/02/22-rdf-syntax-ns#type>", "?" + efo.shortName +  "_ID" + efo.id);
       	where.end();
	},
	embl_atlas_experiment_TO_embl_atlas_differential_expression_analysis: function(where, experiment, dea) {
	 	where.statement_begin();
    	where.statement("?" + experiment.shortName + "_ID" + experiment.id , "<http://rdf.ebi.ac.uk/terms/atlas/hasAnalysis>", "?" + dea.shortName +  "_ID" + dea.id);
       	where.end();
	}, 
	embl_atlas_differential_expression_analysis_TO_embl_atlas_expression_decreased_value: function(where, dea, value) {
	 	where.statement_begin();
    	where.statement("?" + dea.shortName + "_ID" + dea.id , "<http://rdf.ebi.ac.uk/terms/atlas/hasExpressionValue>", "?" + value.shortName +  "_ID" + value.id);
       	where.end();
	},
	embl_atlas_differential_expression_analysis_TO_embl_atlas_expression_increased_value: function(where, dea, value) {
	 	where.statement_begin();
    	where.statement("?" + dea.shortName + "_ID" + dea.id , "<http://rdf.ebi.ac.uk/terms/atlas/hasExpressionValue>", "?" + value.shortName +  "_ID" + value.id);
       	where.end();
	},
	embl_atlas_expression_increased_value_TO_embl_atlas_factor: function(where, increased_value, factor) {
	 	where.statement_begin();
    	where.statement("?" + increased_value.shortName + "_ID" + increased_value.id , "<http://rdf.ebi.ac.uk/terms/atlas/hasFactorValue>", "?" + factor.shortName +  "_ID" + factor.id);
       	where.end();
	},
	embl_atlas_expression_value_factor_type: function(where, factor_type, increased_value) {
	 	where.statement_begin();
    	where.statement("?" + increased_value.shortName + "_ID" + increased_value.id , "<http://rdf.ebi.ac.uk/terms/atlas/hasFactorValue>", "?i_factor_" + increased_value.shortName +  "_ID" + increased_value.id);
    	where.statement("?i_factor_" + increased_value.shortName +  "_ID" + increased_value.id , "<http://rdf.ebi.ac.uk/terms/atlas/propertyType>", "?" + factor_type.shortName +  "_ID" + factor_type.id);
       	if(factor_type.label!="Exp. Factor Type") where.filter_regex("?" + factor_type.shortName +  "_ID" + factor_type.id, factor_type.label);
       	where.end();
	},
	embl_atlas_expression_value_factor_value: function(where, factor_value, increased_value) {
	 	where.statement_begin();
    	where.statement("?" + increased_value.shortName + "_ID" + increased_value.id , "<http://rdf.ebi.ac.uk/terms/atlas/hasFactorValue>", "?i_factor_" + increased_value.shortName +  "_ID" + increased_value.id);
    	where.statement("?i_factor_" + increased_value.shortName +  "_ID" + increased_value.id , "<http://rdf.ebi.ac.uk/terms/atlas/propertyValue>", "?" + factor_value.shortName +  "_ID" + factor_value.id);
       	if(factor_value.label!="Exp. Factor Value") where.filter_regex("?" + factor_value.shortName +  "_ID" + factor_value.id, factor_value.label);
       	where.end();
	},
	embl_atlas_expression_decreased_value_TO_embl_atlas_factor: function(where, decreased_value, factor) {
	 	where.statement_begin();
    	where.statement("?" + decreased_value.shortName + "_ID" + decreased_value.id , "<http://rdf.ebi.ac.uk/terms/atlas/hasFactorValue>", "?" + factor.shortName +  "_ID" + factor.id);
       	where.end();
	},
	embl_atlas_differential_expression_analysis_TO_embl_atlas_design_platform: function(where, dea, platform) {
	 	where.statement_begin();
    	where.statement("?" + dea.shortName + "_ID" + dea.id , "<http://rdf.ebi.ac.uk/terms/atlas/hasAssociatedPlatfrom>", "?" + platform.shortName +  "_ID" + platform.id);
       	where.end();
	},
	embl_atlas_design_platform_TO_embl_atlas_organism: function(where, platform, organism) {
	 	where.statement_begin();
    	where.statement("?" + platform.shortName + "_ID" + platform.id , "<http://rdf.ebi.ac.uk/terms/atlas/taxon>", "?" + organism.shortName +  "_ID" + organism.id);
       	where.end();
	},
 	embl_atlas_design_element_TO_embl_atlas_design_platform: function(where, design_element, platform) {
	 	where.statement_begin();
    	where.statement("?" + design_element.shortName + "_ID" + design_element.id , "<http://rdf.ebi.ac.uk/terms/atlas/partOfPlatform>", "?" + platform.shortName +  "_ID" + platform.id);
       	where.end();
	},
 	embl_atlas_expression_decreased_value_TO_embl_atlas_design_element: function(where, decreased_value, design_element) {
	 	where.statement_begin();
    	where.statement("?" + decreased_value.shortName + "_ID" + decreased_value.id , "<http://rdf.ebi.ac.uk/terms/atlas/isMeasurementOf>", "?" + design_element.shortName +  "_ID" + design_element.id);
       	where.end();
	},
 	embl_atlas_expression_increased_value_TO_embl_atlas_design_element: function(where, increased_value, design_element) {
	 	where.statement_begin();
    	where.statement("?" + increased_value.shortName + "_ID" + increased_value.id , "<http://rdf.ebi.ac.uk/terms/atlas/isMeasurementOf>", "?" + design_element.shortName +  "_ID" + design_element.id);
       	where.end();
	},
	embl_atlas_design_element_TO_embl_atlas_reference_uniprot: function(where, design_element, uniprot) {
	 	where.statement_begin();
    	where.statement("?" + design_element.shortName + "_ID" + design_element.id , "<http://rdf.ebi.ac.uk/terms/atlas/dbXref>", "?" + uniprot.shortName +  "_ID" + uniprot.id);
       	where.filter_regex("?" + uniprot.shortName +  "_ID" + uniprot.id, "uniprot");
       	where.end();
	},
	embl_atlas_design_element_TO_embl_atlas_reference_entrez: function(where, design_element, entrez) {
	 	where.statement_begin();
    	where.statement("?" + design_element.shortName + "_ID" + design_element.id , "<http://rdf.ebi.ac.uk/terms/atlas/dbXref>", "?" + entrez.shortName +  "_ID" + entrez.id);
       	where.filter_regex("?" + entrez.shortName +  "_ID" + entrez.id, "ncbigene");
       	where.end();
	},
	embl_atlas_design_element_TO_embl_atlas_reference_ensembl: function(where, design_element, ensembl) {
	 	where.statement_begin();
    	where.statement("?" + design_element.shortName + "_ID" + design_element.id , "<http://rdf.ebi.ac.uk/terms/atlas/dbXref>", "?" + ensembl.shortName +  "_ID" + ensembl.id);
       	// where.filter_regex("?" + ensembl.shortName +  "_ID" + ensembl.id, "ensembl");
       	where.end();
	},
	embl_atlas_efo_TO_embl_atlas_efo: function(where, efo_subclass, efo_parent) {
	 	where.statement_begin();
    	where.statement("?" + efo_subclass.shortName + "_ID" + efo_subclass.id , "<http://www.w3.org/2000/01/rdf-schema#subClassOf>+", "?" + efo_parent.shortName +  "_ID" + efo_parent.id);
       	where.end();
	},
	embl_atlas_efo_id: function(where, efo_id, efo) {
	 	where.statement_begin();
    	where.statement("?" + efo.shortName + "_ID" + efo.id , "a", "<http://www.ebi.ac.uk/efo/" + efo_id.label+ ">");
       	where.end();
	},
	embl_atlas_design_element_TO_embl_uniprot_protein: function(where, design_element, uniprot_protein) {
	 	where.statement_begin();
    	where.statement("?" + design_element.shortName + "_ID" + design_element.id , "<http://rdf.ebi.ac.uk/terms/atlas/dbXref>", "?" + uniprot_protein.shortName +  "_ID" + uniprot_protein.id);
       	// where.filter_regex("?" + uniprot_protein.shortName +  "_ID" + uniprot_protein.id, "uniprot");
       	where.end();
	},


	embl_chembl_compound_TO_embl_chembl_document: function(where, compound, document) {
	 	where.statement_begin();
    	where.statement("?" + compound.shortName + "_ID" + compound.id , "<http://rdf.ebi.ac.uk/terms/chembl#hasDocument>", "?" + document.shortName +  "_ID" + document.id);
       	where.end();
	},
	embl_chembl_compound_TO_embl_chembl_protein: function(where, compound, protein) {
	 	where.statement_begin();
	 	where.statement("?" + compound.shortName + "_ID" + compound.id , "<http://rdf.ebi.ac.uk/terms/chembl#hasActivity>", "?i_activity_ID" + compound.id);
	 	where.statement("?i_activity_ID" + compound.id , "<http://rdf.ebi.ac.uk/terms/chembl#hasAssay>", "?i_assay_ID" + compound.id);
	 	where.statement("?i_assay_ID" + compound.id , "<http://rdf.ebi.ac.uk/terms/chembl#hasTarget>", "?" + protein.shortName +  "_ID" + protein.id);
       	where.end();
	},
	embl_chembl_compound_TO_embl_chembl_activity: function(where, document, activity) {
	 	where.statement_begin();
    	where.statement("?" + document.shortName + "_ID" + document.id , "<http://rdf.ebi.ac.uk/terms/chembl#hasActivity>", "?" + activity.shortName +  "_ID" + activity.id);
       	where.end();
	},
	embl_chembl_document_TO_embl_chembl_compound: function(where, document, compound) {
	 	where.statement_begin();
    	where.statement("?" + document.shortName + "_ID" + document.id , "<http://rdf.ebi.ac.uk/terms/chembl#hasMolecule>", "?" + compound.shortName +  "_ID" + compound.id);
       	where.end();
	},
	embl_chembl_document_TO_embl_chembl_assay: function(where, document, assay) {
	 	where.statement_begin();
    	where.statement("?" + document.shortName + "_ID" + document.id , "<http://rdf.ebi.ac.uk/terms/chembl#hasAssay>", "?" + assay.shortName +  "_ID" + assay.id);
       	where.end();
	},
	embl_chembl_document_TO_embl_chembl_activity: function(where, document, activity) {
	 	where.statement_begin();
    	where.statement("?" + document.shortName + "_ID" + document.id , "<http://rdf.ebi.ac.uk/terms/chembl#hasActivity>", "?" + activity.shortName +  "_ID" + activity.id);
       	where.end();
	},
	embl_chembl_activity_TO_embl_chembl_assay: function(where, activity, assay) {
	 	where.statement_begin();
    	where.statement("?" + activity.shortName + "_ID" + activity.id , "<http://rdf.ebi.ac.uk/terms/chembl#hasAssay>", "?" + assay.shortName +  "_ID" + assay.id);
       	where.end();
	},
	embl_chembl_activity_TO_embl_chembl_compound: function(where, activity, compound) {
	 	where.statement_begin();
    	where.statement("?" + activity.shortName + "_ID" + activity.id , "<http://rdf.ebi.ac.uk/terms/chembl#hasMolecule>", "?" + compound.shortName +  "_ID" + compound.id);
       	where.end();
	},
	embl_chembl_activity_TO_embl_chembl_document: function(where, activity, document) {
	 	where.statement_begin();
    	where.statement("?" + activity.shortName + "_ID" + activity.id , "<http://rdf.ebi.ac.uk/terms/chembl#hasDocument>", "?" + document.shortName +  "_ID" + document.id);
       	where.end();
	},
	embl_chembl_assay_TO_embl_chembl_document: function(where, assay, document) {
	 	where.statement_begin();
    	where.statement("?" + assay.shortName + "_ID" + assay.id , "<http://rdf.ebi.ac.uk/terms/chembl#hasDocument>", "?" + document.shortName +  "_ID" + document.id);
       	where.end();
	},
	embl_chembl_assay_TO_embl_chembl_activity: function(where, assay, activity) {
	 	where.statement_begin();
    	where.statement("?" + assay.shortName + "_ID" + assay.id , "<http://rdf.ebi.ac.uk/terms/chembl#hasActivity>", "?" + activity.shortName +  "_ID" + activity.id);
       	where.end();
	},
	embl_chembl_assay_TO_embl_chembl_protein: function(where, assay, protein) {
	 	where.statement_begin();
    	where.statement("?" + assay.shortName + "_ID" + assay.id , "<http://rdf.ebi.ac.uk/terms/chembl#hasTarget>", "?" + protein.shortName +  "_ID" + protein.id);
       	where.end();
	},
	embl_chembl_assay_TO_embl_chembl_protein_family: function(where, assay, protein_family) {
	 	where.statement_begin();
    	where.statement("?" + assay.shortName + "_ID" + assay.id , "<http://rdf.ebi.ac.uk/terms/chembl#hasTarget>", "?" + protein_family.shortName +  "_ID" + protein_family.id);
       	where.end();
	},
	embl_chembl_protein_TO_embl_chembl_assay: function(where, protein, assay) {
	 	where.statement_begin();
    	where.statement("?" + protein.shortName + "_ID" + protein.id , "<http://rdf.ebi.ac.uk/terms/chembl#hasAssay>", "?" + assay.shortName +  "_ID" + assay.id);
       	where.end();
	},
	embl_chembl_protein_TO_embl_chembl_protein_class: function(where, protein, protein_class) {
	 	where.statement_begin();
    	where.statement("?" + protein.shortName + "_ID" + protein.id , "<http://rdf.ebi.ac.uk/terms/chembl#hasProteinClassification>", "?" + protein_class.shortName +  "_ID" + protein_class.id);
       	where.end();
	},
 	embl_chembl_protein_TO_embl_chembl_target_component: function(where, protein, target_component) {
	 	where.statement_begin();
    	where.statement("?" + protein.shortName + "_ID" + protein.id , "<http://rdf.ebi.ac.uk/terms/chembl#hasTargetComponent>", "?" + target_component.shortName +  "_ID" + target_component.id);
       	where.end();
	},
	embl_chembl_protein_family_TO_embl_chembl_assay: function(where, protein_family, assay) {
	 	where.statement_begin();
    	where.statement("?" + protein_family.shortName + "_ID" + protein_family.id , "<http://rdf.ebi.ac.uk/terms/chembl#hasAssay>", "?" + assay.shortName +  "_ID" + assay.id);
       	where.end();
	},
	embl_chembl_protein_family_TO_embl_chembl_protein_class: function(where, protein_family, protein_class) {
	 	where.statement_begin();
    	where.statement("?" + protein_family.shortName + "_ID" + protein_family.id , "<http://rdf.ebi.ac.uk/terms/chembl#hasProteinClassification>", "?" + protein_class.shortName +  "_ID" + protein_class.id);
       	where.end();
	},
 	embl_chembl_protein_family_TO_embl_chembl_target_component: function(where, protein_family, target_component) {
	 	where.statement_begin();
    	where.statement("?" + protein_family.shortName + "_ID" + protein_family.id , "<http://rdf.ebi.ac.uk/terms/chembl#hasTargetComponent>", "?" + target_component.shortName +  "_ID" + target_component.id);
       	where.end();
	},
	embl_chembl_protein_class_TO_embl_chembl_protein: function(where, protein_class, protein) {
	 	where.statement_begin();
    	where.statement("?" + protein_class.shortName + "_ID" + protein_class.id , "<http://rdf.ebi.ac.uk/terms/chembl#hasTargetDescendant>", "?" + protein.shortName +  "_ID" + protein.id);
       	where.end();
	},
	 embl_chembl_protein_class_TO_embl_chembl_protein_family: function(where, protein_class, protein_family) {
	 	where.statement_begin();
    	where.statement("?" + protein_class.shortName + "_ID" + protein_class.id , "<http://rdf.ebi.ac.uk/terms/chembl#hasTargetDescendant>", "?" + protein_family.shortName +  "_ID" + protein_family.id);
       	where.end();
	},
	embl_chembl_protein_class_TO_embl_chembl_target_component: function(where, protein_class, target_component) {
	 	where.statement_begin();
    	where.statement("?" + protein_class.shortName + "_ID" + protein_class.id , "<http://rdf.ebi.ac.uk/terms/chembl#hasTargetComponentDescendant>", "?" + target_component.shortName +  "_ID" + target_component.id);
       	where.end();
	},
 	embl_chembl_target_component_TO_embl_chembl_protein: function(where, target_component, protein) {
	 	where.statement_begin();
    	where.statement("?" + target_component.shortName + "_ID" + target_component.id , "<http://rdf.ebi.ac.uk/terms/chembl#hasTarget>", "?" + protein.shortName +  "_ID" + protein.id);
       	where.end();
	},
 	embl_chembl_target_component_TO_embl_chembl_protein_family: function(where, target_component, protein_family) {
	 	where.statement_begin();
    	where.statement("?" + target_component.shortName + "_ID" + target_component.id , "<http://rdf.ebi.ac.uk/terms/chembl#hasTarget>", "?" + protein_family.shortName +  "_ID" + protein_family.id);
       	where.end();
	},
 	embl_chembl_target_component_TO_embl_chembl_protein_class: function(where, target_component, protein_class) {
	 	where.statement_begin();
    	where.statement("?" + target_component.shortName + "_ID" + target_component.id , "<http://rdf.ebi.ac.uk/terms/chembl#hasProteinClassification>", "?" + protein_class.shortName +  "_ID" + protein_class.id);
       	where.end();
	},
	embl_chembl_target_component_TO_embl_uniprot_protein: function(where, target_component, uniprot_protein) {
	 	where.statement_begin();
    	where.statement("?" + target_component.shortName + "_ID" + target_component.id , "<http://www.w3.org/2004/02/skos/core#exactMatch>", "?" + uniprot_protein.shortName +  "_ID" + uniprot_protein.id);
       	where.end();
	},


	embl_uniprot_protein_id: function(where, id, protein) {
		where.statement_begin();
       	where.filter_regex_equals("?" + protein.shortName +  "_ID" + protein.id, "http://purl.uniprot.org/uniprot/" + id.label);
       	where.end();
	},
	embl_uniprot_protein_review: function(where, review, protein) {
		var bool = (review.label=="yes" || review.label=="true" || review.label=="1") ? true : false;
		where.statement_begin();
    	where.statement("?" + protein.shortName + "_ID" + protein.id , "<http://purl.uniprot.org/core/reviewed>", "?" + review.shortName +  "_ID" + review.id);
       	if(review.label!="Protein reviewed?") where.filter_regex_bool("?" + review.shortName +  "_ID" + review.id, bool);
       	where.end();
	},
	embl_uniprot_protein_altName: function(where, altName, protein) {
		where.statement_begin();
    	where.statement("?" + protein.shortName + "_ID" + protein.id , "<http://purl.uniprot.org/core/alternativeName>", "?i_" + altName.shortName +  "_ID" + altName.id);
    	where.statement("?i_" + altName.shortName + "_ID" + altName.id , "<http://purl.uniprot.org/core/fullName>", "?" + altName.shortName +  "_ID" + altName.id);
       	if(altName.label != altName.defaultLabel && altName.label != "") {
            where.filter_regex("?" + altName.shortName +  "_ID" + altName.id, altName.label);
        }
      	where.end();
	},
	embl_uniprot_protein_TO_embl_uniprot_keyword: function(where, protein, keyword) {
	 	where.statement_begin();
    	where.statement("?" + protein.shortName + "_ID" + protein.id , "<http://purl.uniprot.org/core/classifiedWith>", "?" + keyword.shortName +  "_ID" + keyword.id);
       	where.end();
	},
	embl_uniprot_protein_TO_embl_uniprot_go_term: function(where, protein, go_term) {
	 	where.statement_begin();
    	where.statement("?" + protein.shortName + "_ID" + protein.id , "<http://purl.uniprot.org/core/classifiedWith>", "?" + go_term.shortName +  "_ID" + go_term.id);
       	where.end();
	},
	embl_uniprot_protein_TO_embl_uniprot_taxonomy: function(where, protein, taxonomy) {
	 	where.statement_begin();
    	where.statement("?" + protein.shortName + "_ID" + protein.id , "<http://purl.uniprot.org/core/organism>", "?" + taxonomy.shortName +  "_ID" + taxonomy.id);
       	where.end();
	},
	embl_uniprot_protein_TO_embl_uniprot_citation: function(where, protein, citation) {
	 	where.statement_begin();
    	where.statement("?" + protein.shortName + "_ID" + protein.id , "<http://purl.uniprot.org/core/citation>", "?" + citation.shortName +  "_ID" + citation.id);
       	where.end();
	},
	embl_uniprot_protein_TO_embl_uniprot_gene: function(where, protein, uniprot_gene) {
	 	where.statement_begin();
    	where.statement("?" + protein.shortName + "_ID" + protein.id , "<http://purl.uniprot.org/core/encodedBy>", "?" + uniprot_gene.shortName +  "_ID" + uniprot_gene.id);
       	where.end();
	},
	embl_uniprot_protein_TO_embl_uniprot_disease: function(where, protein, uniprot_disease) {
	 	where.statement_begin();
    	where.statement("?" + protein.shortName + "_ID" + protein.id , "<http://purl.uniprot.org/core/annotation>", "?i_annotation_" + uniprot_disease.shortName +  "_ID" + uniprot_disease.id);
    	where.statement("?i_annotation_" + uniprot_disease.shortName +  "_ID" + uniprot_disease.id , "a", "<http://purl.uniprot.org/core/Disease_Annotation>");
    	where.statement("?i_annotation_" + uniprot_disease.shortName +  "_ID" + uniprot_disease.id , "<http://www.w3.org/2000/01/rdf-schema#comment>", "?disease_annotation_note");
    	where.statement("?i_annotation_" + uniprot_disease.shortName +  "_ID" + uniprot_disease.id , "<http://purl.uniprot.org/core/disease>", "?" + uniprot_disease.shortName +  "_ID" + uniprot_disease.id);
       	where.end();
	},
	
	embl_uniprot_go_term_id: function(where, id, go_term) {
		where.statement_begin();
       	where.filter_regex_equals("?" + go_term.shortName +  "_ID" + go_term.id, "http://purl.uniprot.org/go/" + id.label);
       	where.end();
	},
	embl_uniprot_taxonomy_id: function(where, id, taxonomy) {
		if(id.label != "Taxonomy ID") {
			where.statement_begin();
       		where.filter_regex_equals("?" + taxonomy.shortName +  "_ID" + taxonomy.id, "http://purl.uniprot.org/taxonomy/" + id.label);
       		where.end();
		}
	},


	embl_reactome_pathway_TO_embl_reactome_taxonomy: function(where, pathway, taxonomy) {
	 	where.statement_begin();
    	where.statement("?" + pathway.shortName + "_ID" + pathway.id , "<http://www.biopax.org/release/biopax-level3.owl#organism>", "?" + taxonomy.shortName +  "_ID" + taxonomy.id);
       	where.end();
	},
	embl_reactome_pathway_TO_embl_reactome_pathway: function(where, reactome_pathway_from, reactome_pathway_to) {
	 	where.statement_begin();
    	where.statement("?" + reactome_pathway_from.shortName + "_ID" + reactome_pathway_from.id , "<http://www.biopax.org/release/biopax-level3.owl#pathwayComponent>", "?" + reactome_pathway_to.shortName +  "_ID" + reactome_pathway_to.id);
       	where.end();
	},
	embl_reactome_pathway_TO_embl_reactome_reaction: function(where, pathway, reaction) {
	 	where.statement_begin();
    	where.statement("?" + pathway.shortName + "_ID" + pathway.id , "<http://www.biopax.org/release/biopax-level3.owl#pathwayComponent>", "?" + reaction.shortName +  "_ID" + reaction.id);
       	where.end();
	},

	embl_reactome_protein_go_name: function(where, go_name, protein) {
		where.statement_begin();
    	where.statement("?" + protein.shortName + "_ID" + protein.id , "<http://www.biopax.org/release/biopax-level3.owl#cellularLocation>", "?i_" + go_name.shortName +  "_ID" + go_name.id);
    	where.statement("?i_" + go_name.shortName + "_ID" + go_name.id , "<http://www.biopax.org/release/biopax-level3.owl#term>", "?" + go_name.shortName +  "_ID" + go_name.id);
       	if(go_name.label != go_name.defaultLabel && go_name.label != "") {
            where.filter_regex("?" + go_name.shortName +  "_ID" + go_name.id, go_name.label);
        }
       	where.end();
	},
	embl_reactome_reaction_TO_embl_reactome_protein: function(where, reaction, protein) {
	 	where.statement_begin();
    	where.statement("?" + reaction.shortName + "_ID" + reaction.id , "<http://www.biopax.org/release/biopax-level3.owl#right>", "?" + protein.shortName +  "_ID" + protein.id);
       	where.end();
	},
	embl_reactome_reaction_TO_embl_reactome_molecule: function(where, reaction, reactome_molecule) {
	 	where.statement_begin();
    	where.statement("?" + reaction.shortName + "_ID" + reaction.id , "<http://www.biopax.org/release/biopax-level3.owl#right>", "?" + reactome_molecule.shortName +  "_ID" + reactome_molecule.id);
       	where.end();
	},
	embl_reactome_reaction_TO_embl_reactome_complex: function(where, reaction, reactome_complex) {
	 	where.statement_begin();
    	where.statement("?" + reaction.shortName + "_ID" + reaction.id , "<http://www.biopax.org/release/biopax-level3.owl#right>", "?" + reactome_complex.shortName +  "_ID" + reactome_complex.id);
       	where.end();
	},
	embl_reactome_protein_TO_embl_uniprot_protein: function(where, reactome_protein, uniprot_protein) {
	 	where.statement_begin();
    	where.statement("?" + reactome_protein.shortName + "_ID" + reactome_protein.id , "<http://www.biopax.org/release/biopax-level3.owl#entityReference>", "?" + uniprot_protein.shortName +  "_ID" + uniprot_protein.id);
       	where.end();
	},
	embl_reactome_protein_TO_embl_reactome_reaction: function(where, reactome_protein, reactome_reaction) {
	 	where.statement_begin();
    	where.statement("?" + reactome_reaction.shortName + "_ID" + reactome_reaction.id , "<http://www.biopax.org/release/biopax-level3.owl#left>", "?" + reactome_protein.shortName +  "_ID" + reactome_protein.id);
       	where.end();
	},
	embl_reactome_complex_TO_embl_reactome_protein: function(where, reactome_complex, reactome_protein) {
	 	where.statement_begin();
    	where.statement("?" + reactome_complex.shortName + "_ID" + reactome_complex.id , "<http://www.biopax.org/release/biopax-level3.owl#component>", "?" + reactome_protein.shortName +  "_ID" + reactome_protein.id);
       	where.end();
	},
	embl_reactome_complex_TO_embl_reactome_complex: function(where, reactome_complex_from, reactome_complex_to) {
	 	where.statement_begin();
    	where.statement("?" + reactome_complex_from.shortName + "_ID" + reactome_complex_from.id , "<http://www.biopax.org/release/biopax-level3.owl#component>", "?" + reactome_complex_to.shortName +  "_ID" + reactome_complex_to.id);
       	where.end();
	},
	embl_reactome_complex_TO_embl_reactome_molecule: function(where, reactome_complex, reactome_molecule) {
	 	where.statement_begin();
    	where.statement("?" + reactome_complex.shortName + "_ID" + reactome_complex.id , "<http://www.biopax.org/release/biopax-level3.owl#component>", "?" + reactome_molecule.shortName +  "_ID" + reactome_molecule.id);
       	where.end();
	},
	embl_reactome_complex_TO_embl_reactome_reaction: function(where, reactome_complex, reactome_reaction) {
	 	where.statement_begin();
    	where.statement("?" + reactome_reaction.shortName + "_ID" + reactome_reaction.id , "<http://www.biopax.org/release/biopax-level3.owl#left>", "?" + reactome_complex.shortName +  "_ID" + reactome_complex.id);
       	where.end();
	},
	embl_reactome_complex_go_name: function(where, go_name, complex) {
		where.statement_begin();
    	where.statement("?" + complex.shortName + "_ID" + complex.id , "<http://www.biopax.org/release/biopax-level3.owl#cellularLocation>", "?i_" + go_name.shortName +  "_ID" + go_name.id);
    	where.statement("?i_" + go_name.shortName + "_ID" + go_name.id , "<http://www.biopax.org/release/biopax-level3.owl#term>", "?" + go_name.shortName +  "_ID" + go_name.id);
       	if(go_name.label != go_name.defaultLabel && go_name.label != "") {
            where.filter_regex("?" + go_name.shortName +  "_ID" + go_name.id, go_name.label);
        }
       	where.end();
	},
	embl_reactome_molecule_TO_embl_reactome_reaction: function(where, reactome_molecule, reactome_reaction) {
	 	where.statement_begin();
    	where.statement("?" + reactome_reaction.shortName + "_ID" + reactome_reaction.id , "<http://www.biopax.org/release/biopax-level3.owl#left>", "?" + reactome_molecule.shortName +  "_ID" + reactome_molecule.id);
       	where.end();
	},

	/*************************************************************************************************************************************
	**************************************************************************************************************************************
	**************************************************************************************************************************************
	EMBL  <-> Bio2RDF
	**************************************************************************************************************************************
	**************************************************************************************************************************************
	*************************************************************************************************************************************/

	// embl_chembl_compound_TO_drug: function(where, compound, drug) {
	//  	where.statement_begin();
 //    	where.statement("?" + compound.shortName + "_ID" + compound.id , "<http://rdf.ebi.ac.uk/terms/chembl#hasDocument>", "?" + document.shortName +  "_ID" + document.id);
 //       	where.end();
	// },

};


_result = new Object();
connectionLabels = {};



/**********************/
/**********************

ABOR JS LABELING CONFIG

***********************/
/**********************/

arborLabelConfig = {};


arborLabelConfig.convert = {

	//PharmgKB
	//example: http://bio2rdf.org/drugbank_vocabulary:Drug-Target-Interaction
	"Disease Gene Association" 	: "DGA",
	"Drug Gene Association"		: "DrGA",

	//Drugbank
	//example: http://bio2rdf.org/drugbank_resource:DB00530_844
	"Drug-Target-Interaction"		: "DrTI"

}
