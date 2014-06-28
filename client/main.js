Meteor.startup(function () {

	Accounts.ui.config({
	  passwordSignupFields: 'USERNAME_AND_OPTIONAL_EMAIL'
	});

	Session.setDefault('loadingGraphs', true);

	Hooks.init();

  });


Deps.autorun ( function (){

});

Hooks.onLoggedIn = function () {
    // this runs right after a user logs in, on the client or server
    console.log("just logged in");
}
Hooks.onLoggedOut = function () {
    // this runs right after a user logs out, on the client or server
    console.log("just logged out");
	Meteor.Router.to('/');
}


Template.header.helpers({
      activeRouteClass: function(/* route names */) {
            var args = Array.prototype.slice.call(arguments, 0);
            args.pop();

            // this is only called to trigger reactivity on nav bar item click
            Session.get("activeLink");
            
            var active = _.any(args, function(name) {
              return (location.pathname === Meteor.Router[name + 'Path']());
            });
            
            return active && 'active';
          }
});

Template.main.helpers({

	isHome: function() {
		return Session.get("activeLink") == "home";
	}

});

Template.header.events({

	'click #nav li': function(e, t) {
		Session.set("activeLink", location.pathname);
		$(e.target).addClass("active");
	}

})
