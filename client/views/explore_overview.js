Template.explore.helpers({

  loadingGraphs: function() {
    return Session.get("loadingGraphs");
  },  
  hasGraphs: function() {
    var query = Graphs.find(),
        count = query.count();  
    return count > 0 ? true : false; 
  },
  
  graphs: function() {
    //fetch() used to get array, which is the used to sort the graphs by name
    //session filter is used to filter by categories..
    var graphs = Graphs.find({visibility: "public", categories: { $regex: Session.get('filter'), $options: 'i' }}).fetch();

    $("#singleFilters li").removeClass("active");
    $("#singleFilters li[data-filter=" + Session.get('filter') + "]").addClass("active");


    return _.sortBy(graphs, function(graph) { return graph.date || null;}).reverse();
  },
  categories_list: function() {
    return this.categories;
  },
  absoluteUrl: function() {
    return Meteor.absoluteUrl();
  }
    
});


Template.explore.events({

  'click #singleFilters li a': function(e,t) {
    var category = $(e.target).parent().attr("data-filter") || "";
    //setting the filter, updates the graph list reactively
    Session.set("filter", category);
  }

});

Template.exploreItem.events({

  'click .item-link': function(e,t) {
    Session.set("Route", "explore-overview");
  }

});

Template.exploreItem.categories_li = function(){

  var categories = _.map(this.categories, function(cat) {
    var category = cat.charAt(0).toUpperCase() + cat.slice(1);
    var label = '<li>' + category + '</li>';
    return label;
  });

  return categories;
};

Template.exploreItem.categories_list = function(){

  var categories = "";
  _.each(this.categories, function(cat) {
    categories += " " + cat;
  });
  return categories;
};

Template.exploreItem.creator = function(){

  return Meteor.users.find(this.owner).username;

};