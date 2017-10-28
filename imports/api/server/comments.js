import { check } from 'meteor/check';

import { Comments } from '/imports/api/comments.js';
import { Workshops } from '/imports/api/workshops.js';

Meteor.publish('comments', function(workshopId) {
  if(workshopId) {
    return Comments.find({event: workshopId});
  }

  return Comments.find();
});

Meteor.methods({
  'comments.insert'( content, workshopId ) {
    check(content, String);
    check(workshopId, String);

    if(content.length == 0) {
      throw new Meteor.Error(403, "Comment can't be empty")
    }

    const workshop = Workshops.findOne(workshopId);

    if(!workshop) {
      throw new Meteor.Error(404, 'Workshop not found');
    }


    const comment = {
      user: this.userId,
      content: content,
      createdAt: new Date(),
      event: workshopId
    };

    Comments.insert(comment);
  }
});