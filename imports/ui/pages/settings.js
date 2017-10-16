import { Template } from 'meteor/templating';

import './settings.html';

Template.settings.onCreated(function settingsOnCreated() {
  this.active = new ReactiveVar('profile');
});

Template.settings.helpers({
  profile() {
    return Template.instance().active.get() === 'profile';
  },
  account() {
    return Template.instance().active.get() === 'account';
  }
});

Template.settings.events({
  'click .profile.item'(event, instance) {
    instance.active.set('profile');
  },
  'click .account.item'(event, instance) {
    instance.active.set('account');
  }
});

Template.profileSettings.events({
  'submit form.user.update'(event) {
    event.preventDefault();
  }
});

Template.accountSettings.events({
  'click .ui.delete.user.button'() {
    Meteor.call('user.selfDelete', (error, result) => {
      if(!error) {
        FlowRouter.go('/');
      }
    });
  }
});
