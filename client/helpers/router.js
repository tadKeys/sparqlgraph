Meteor.Router.add({
	'/': { to: 'home',
      and: function() { 
        Session.set("activeLink", Meteor.Router.page()); 
      }
    },

   '/graphs': {
      to: 'graphs',
      and: function() { 
        Meteor.subscribe("userGraphs", function() {
          Session.set("userGraphsReady", true);
        });

        Session.set("activeLink", Meteor.Router.page()); 
        Session.set("filter", ""); 
        Session.set("type", ""); 
        _editorUI = null; //reset editor, if the user comes from a graph page
        $('html,body').scrollTop(0);
        }
    },
    '/explore': {
      to: 'explore',
      and: function() { 
        Meteor.subscribe("sharedGraphs", function() {
          Session.set("sharedGraphsReady", true);
          Session.set("loadingGraphs", false);
        });
        
        Session.set("activeLink", Meteor.Router.page());
        Session.set("filter", ""); 
        _editorUI = null; //reset editor, if the user comes from a graph page 
        $('html,body').scrollTop(0);
      }
    }, 

   '/templates': {
      to: 'templates',
      and: function() {

        Meteor.subscribe("templateGraphs", function() {
          Session.set("templateGraphsReady", true);
          Session.set("loadingGraphs", false);
        });

        Session.set("activeLink", Meteor.Router.page()); 
        Session.set("filter", ""); 
        _editorUI = null; //reset editor, if the user comes from a graph page
        $('html,body').scrollTop(0);
      }
    }, 
    '/premade/:_id': { to: 'premade_editor', and: function(id) {
        $('html,body').scrollTop(0);
        Session.set("currentGraphID", id);
        Session.set("premadeMode", "true" );
        Meteor.subscribe("singleGraph", id, function() {
        Session.set("graphReady", true);
        });
    }},

    '/graph/:_id': { to: 'editor', and: function(id) {
      $('html,body').scrollTop(0);
      Session.set("currentGraphID", id);
      Session.set("premadeMode", "false" );
      Meteor.subscribe("singleGraph", id, function() {
        Session.set("graphReady", true);
      });

   }},

  '/docs': {
      to: 'docs',
      and: function() { 
        Session.set("activeLink", Meteor.Router.page()); 
        $('html,body').scrollTop(0);
      }
    },
  '/contact': {
      to: 'contact',
      and: function() { 
        Session.set("activeLink", Meteor.Router.page()); 
        $('html,body').scrollTop(0);
      }
    },


});

Meteor.Router.beforeRouting = function() {

}

Meteor.Router.filters({
'checkLoggedIn': function(page) {
    if (Meteor.loggingIn()) {
      return 'loading';
    } else if (Meteor.user()) {
      return page;
    } else {
    }
  },
'graphReady': function(page) {
    if(Session.get("graphReady") == true) {
      var graphDocument = Graphs.findOne(Session.get("currentGraphID"));
      Session.set("currentGraph", graphDocument.graph );
      Session.set("graphDocument", graphDocument );
      Session.set("mxApp", "0");
      return page;
    }
    else return 'spinner';

  },
'sharedGraphsReady': function(page) {
    if(Session.get("sharedGraphsReady") == true) {
      return page;
    }
    else return 'spinner';
  },
'templateGraphsReady': function(page) {

    if(Session.get("templateGraphsReady") == true) {
      return page;
    }
    else return 'spinner';
  },
'userGraphsReady': function(page) {

    if(Session.get("userGraphsReady") == true) {
      return page;
    }
    else return 'spinner';
  }

});

Meteor.Router.filter('graphReady', {only: ['editor', 'premade_editor']});
Meteor.Router.filter('sharedGraphsReady', {only: ['explore']});
Meteor.Router.filter('templateGraphsReady', {only: ['templates']});
Meteor.Router.filter('userGraphsReady', {only: ['graphs']});