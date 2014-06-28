Meteor.publish("graphs", function(){
  return Graphs.find();
  this.ready();
});
Meteor.publish("sharedGraphs", function(){
  return Graphs.find({ visibility: "public"});
  this.ready();
});
Meteor.publish("templateGraphs", function(){
  return Graphs.find({ premade: true});
  this.ready();
});
Meteor.publish("userGraphs", function(){
  return Graphs.find({ owner: this.userId});
  this.ready();
});

Meteor.publish("singleGraph", function(id){
    return Graphs.find(id);
  	this.ready();
});