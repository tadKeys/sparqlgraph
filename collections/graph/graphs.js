Graphs = new Meteor.Collection("graphs");

Graphs.allow({
  insert: function(userId, doc) {
    return userId == doc.owner;
  },
  update: function(userId, doc) {
    return userId == doc.owner;
  },
  remove: function(userId, doc) {
    return userId == doc.owner;
  }
});

Graphs.deny({
  insert: function(userId, doc) {
    return (!userId || userId != doc.owner);
  },
  update: function(userId, doc) {
    return (!userId || userId != doc.owner);
  },
  remove: function(userId, doc) {
    return (!userId || userId != doc.owner);
  }
});