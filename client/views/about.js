Template.about.helpers({
	foo: function () {
		return "foo";
	},
	loggedIn: function() {
		if(!Meteor.user()) {
			return false;
		}
	}
});

