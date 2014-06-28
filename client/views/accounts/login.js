Template.login.events({
	'click #logout': function (event,template) {
        	event.preventDefault();
        	Meteor.logout();
        	Meteor.Router.to('/');
    }
})