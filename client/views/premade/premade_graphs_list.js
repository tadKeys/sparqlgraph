_filters = null;
Template.templates.rendered = function() {

  Session.set("premade", true);
  Session.set("premadeValue", "");

}


Template.templates.helpers({
  loadingGraphs: function() {
    return Session.get("loadingGraphs");
  },  
  hasGraphs: function() {
    var query = Graphs.find(),
        count = query.count();        
    return count > 0 && Session.get("templateGraphsReady") ? true : false; 
  },
  graphs: function() {
    var userId = Meteor.userId();
    //fetch() used to get array, which is the used to sort the graphs by name
    //session filter is used to filter by categories..
    var graphs = Graphs.find({categories: { $regex: Session.get('filter'), $options: 'i' }, premade: true}/*, {reactive: false}*/).fetch();

    $("#singleFilters li").removeClass("active");
    $("#singleFilters li[data-filter=" + Session.get('filter') + "]").addClass("active");

    return _.sortBy(graphs, function(graph) { return graph.date || null;}).reverse();
  },
  categories_list: function() {
    return this.categories;
  }

});

Template.templates.subGraphs = function(category, options) {
    var graphs = Graphs.find({categories: { $regex: category, $options: 'i' }, premade: true}).fetch();
    return _.sortBy(graphs, function(graph) { return graph;});
}

Template.templates.categories = function(){

  var categories = _.map(this.categories, function(cat) {return cat.charAt(0).toUpperCase() + cat.slice(1)});

  return categories;
};

Template.templates.events({

  'click .run-premade': function(e, t) {
    //build premade values array
    Session.set("premadeValue", null);
    var premade_values = new Array();
    $(e.target).parent().prev().find("input").each(function() {
      premade_values.push($(this).val());
    });
    Session.set("premadeValue", premade_values);
    Session.set("premadeRun", true);
  },
  'click .show-premade': function(e, t) {
    //build premade values array
    var premade_values = new Array();
    $(e.target).parent().prev().find("input").each(function() {
      premade_values.push($(this).val());
    });
    Session.set("premadeValue", premade_values);
    Session.set("premadeRun", false);
  },

  'click #singleFilters li a': function(e,t) {
    var category = $(e.target).parent().attr("data-filter") || "";
    Session.set("filter", category);
  },

});


Template.premadeGraph.categories_li = function(){

  var categories = _.map(this.categories, function(cat) {
    var category = cat.charAt(0).toUpperCase() + cat.slice(1);
    var label = '<li>' + category + '</li>';
    return label;
  });

  return categories;
};

Template.premadeGraph.categories_list = function(){

  var categories = "";
  _.each(this.categories, function(cat) {
    categories += " " + cat;
  });
  return categories;
};


Template.premadeGraph.creator = function(){

  return Meteor.users.find(this.owner).username;

};

Template.premadeGraph.date_pretty = function(graph) {
    return moment(graph.date).format('MMMM Do YYYY, h:mm:ss a');
  }
