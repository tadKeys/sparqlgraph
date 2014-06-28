Template.graphs.helpers({
  loadingProjects: function() {
    return Session.get("timelines_loading");
  },  
  hasGraphs: function() {
    var          userId = Meteor.userId(),
                 query = Graphs.find({owner: userId}/*, {reactive: false}*/),
                 count = query.count();      

    return count > 0 ? true : false; 
  },
  
  graphs: function() {
    var userId = Meteor.userId();

    /*
    Get Graphs
    Depends on database filter and type (shared, private, template)    
     */

    //fetch() used to get array, which is the used to sort the graphs by name
    //session filter is used to filter by categories..
    
    if(Session.get("type")) {
      var graphs = Graphs.find({owner: userId, visibility: Session.get("type"),categories: { $regex: Session.get('filter'), $options: 'i' }}/*, {reactive: false}*/).fetch();
    }
    else {
      var graphs = Graphs.find({owner: userId,categories: { $regex: Session.get('filter'), $options: 'i' }}/*, {reactive: false}*/).fetch();
    }

    //marking the filter and type with active class
    $("#singleFilters li").removeClass("active");
    $("#singleFilters li[data-filter=" + Session.get('filter') + "]").addClass("active");
    $("#typeFilters li").removeClass("active");
    $("#typeFilters li[data-filter=" + Session.get('type') + "]").addClass("active");


    return _.sortBy(graphs, function(graph) { return graph.date || null;}).reverse();
  },
  categories_list: function() {
    return this.categories;
  },
  absoluteUrl: function() {
    return Meteor.absoluteUrl();
  }
    
});

_filters = null;
Template.graphs.rendered = function() {


  /*DISQUS*/

    /* * * CONFIGURATION VARIABLES: EDIT BEFORE PASTING INTO YOUR WEBPAGE * * */
    var disqus_shortname = ''; // required: replace example with your forum shortname

    /* * * DON'T EDIT BELOW THIS LINE * * */
    (function () {
        var s = document.createElement('script'); s.async = true;
        s.type = 'text/javascript';
        s.src = '//' + disqus_shortname + '.disqus.com/count.js';
        (document.getElementsByTagName('HEAD')[0] || document.getElementsByTagName('BODY')[0]).appendChild(s);
    }());

};

Template.graphs.events({
  
  'click .create-new': function(e, t) {
      e.preventDefault();    

      console.log("Template.projectsList.events: create blankGraph");
      var blankGraph = {
        name: "New Graph",
        desc: "",
        graph: null,
        visibility: "private",
        owner: Meteor.userId(),
        categories: ["uncategorized"],
        premade: false,
        date: new Date(),
        lastEdit: new Date()
      }

      Graphs.insert(blankGraph, function(error, id){
        
        if (error) {
          console.log(error.reason);
        } else {
          Meteor.Router.to("/graph/" + id);    
        } // end if (error)
        
      });

      Session.set("Route", "editor-overview");
      console.log("Route: editor-overview");
  },


  'click #singleFilters li a': function(e,t) {
    e.preventDefault();
    //only do the filtering if another NON active database is chosen
    var category = $(e.target).parent().attr("data-filter") || "";
    //setting the filter, updates the graph list reactively
    Session.set("filter", category);
  },
  'click #typeFilters li a': function(e,t) {
    e.preventDefault();
    //only do the filtering if another NON active type is chosen
    if(!$(e.target).parent().hasClass("active")) {
      var type = $(e.target).parent().attr("data-filter") || "";
      //setting the filter, updates the graph list reactively
      Session.set("type", type);
    }
    //else remove the type filter
    else {
      Session.set("type", "");
    }
  }

});



Template.graphsItem.events({

  'click .item-link': function(e,t) {
    Session.set("Route", "editor-overview");
    console.log("Route: editor-overview");
  }

});


Template.graphsItem.categories_li = function(){

  var categories = _.map(this.categories, function(cat) {
    var category = cat.charAt(0).toUpperCase() + cat.slice(1);
    var label = '<li>' + category + '</li>';
    return label;
  });

  return categories;
};

Template.graphsItem.categories_list = function(){

  var categories = "";
  _.each(this.categories, function(cat) {
    categories += " " + cat;
  });
  return categories;
};

Template.graphsItem.creator = function(){

  return Meteor.users.find(this.owner).username;

};

Template.graphsItem.date_pretty = function(graph) {
    return moment(graph.date).format('MMMM Do YYYY, h:mm:ss a');
  }
Template.graphsItem.edit_pretty = function(graph) {
  if(graph.lastEdit)
    return moment(graph.lastEdit).format('MMMM Do YYYY, h:mm:ss a');
  else return "";
  }