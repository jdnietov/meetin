import { check } from 'meteor/check';
import { UserSchema } from '/imports/api/schemas.js';
import { Notifications } from '/imports/api/notifications.js';
import { Workshops } from '/imports/api/workshops.js';

const validateEmail = function(email) {
  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

/**** VALIDATION ****/
Accounts.validateNewUser((user) => {
  UserSchema.validate(user);

  return true;
});

/**** HOOKS ****/
Meteor.users.before.remove((id, user) => {
  const userId = user._id;
  // remove owned workshops
  Workshops.remove({owner: userId});

  // remove participation from workshops
  const participating = Workshops.find({participants: userId});
  participating.forEach((workshop) => {
    Meteor.call('workshops.pullParticipant', workshop._id );
  });

  // remove sent notifications
  const notifications = Notifications.remove({sender: userId});
});

/**** METHODS ****/
Meteor.methods({
  'users.insert'( userDraft ) {
    if (!userDraft.password || userDraft.password.length < 4) {
      throw new Meteor.Error(403, 'Password must be longer than 3 ');
    }

    if (!validateEmail(userDraft.email)) {
      throw new Meteor.Error(403, 'Email is not validated');
    }
    if (!userDraft.profile.name) {
      throw new Meteor.Error(403, 'Name may not be empty')
    }

    Accounts.createUser( userDraft );
  },

  'users.pushAttendsTo'( userId, workId ) {
    // push only if it's not already in
    if(Meteor.users.findOne(userId).profile.attendsTo.indexOf(workId) === -1) {
      Meteor.users.update(userId, {
        $push: { 'profile.attendsTo': workId }
      });
    } else {
      throw new Meteor.Error(403, 'User is already participating');
    }
  },

  'users.pullAttendsTo'( userId, workId ) {
    if(Meteor.users.findOne(userId).profile.attendsTo.indexOf(workId) !== -1) {
      Meteor.users.update(this.userId, {
        $pull: { 'profile.attendsTo': workId }
      });
    } else {
      throw new Meteor.Error(403, 'User is not participating');
    }
  },

  'user.selfDelete'() {
    if (!Meteor.isServer) return;

    try {
      Meteor.users.remove(this.userId);
    } catch (e) {
      throw new Meteor.Error('self-delete', e.message);
    }
  },

  'user.pushNotification'( receiverId, notifId ) {
    check(receiverId, String);
    check(notifId, String);
    try {
      Meteor.users.update(receiverId, {
        $push: { 'profile.notifications': notifId }
      });
    } catch (e) {
      throw new Meteor.Error('push-notif', e.message);
    }
  },

  'user.pullNotification'( receiverId, notifId ) {
    check(receiverId, String);
    check(notifId, String);
    try {
      Meteor.users.update(receiverId, {
        $pull: { 'profile.notifications': notifId }
      });
    } catch (e) {
      throw new Meteor.Error('pull-notif', e.message);
    }
  }
})

// TODO actually do this thing
Meteor.publish('users', function() {
  return Meteor.users.find();
});
