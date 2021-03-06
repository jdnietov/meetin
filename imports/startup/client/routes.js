import '/imports/ui/layouts/navbar.js';
import '/imports/ui/layouts/footer.html';

import '/imports/ui/pages/404.js';
import '/imports/ui/pages/home.js';
import '/imports/ui/pages/notifications.js';
import '/imports/ui/pages/search.js';
import '/imports/ui/pages/settings.js';
import '/imports/ui/pages/user.js';
import '/imports/ui/pages/workshop.js';
import '/imports/ui/pages/workshopCreate.js';

// BlazeLayout.setRoot('body');

FlowRouter.route('/', {
  action: function() {
    BlazeLayout.render('applicationLayout', { top: 'navbar', main: 'home' })
  },
  name: 'home'
});

FlowRouter.notFound = {
  action() {
    BlazeLayout.render('applicationLayout', { top: 'navbar', main: '_404' })
  }
}

FlowRouter.route('/404', {
  action: function() {
    BlazeLayout.render('applicationLayout', { top: 'navbar', main: '_404' })    
  }
});

FlowRouter.route('/notifications', {
  action: function( params, queryParams ) {
    BlazeLayout.render('applicationLayout', { top: 'navbar', main: 'notifications', footer: 'footer' });
  },
  name: 'user'
});

FlowRouter.route('/search', {
  action: function( params, queryParams ) {
    BlazeLayout.render('applicationLayout', { top: 'navbar', main: 'search', footer: 'footer' })
  },
  name: 'user'
});

FlowRouter.route('/settings', {
  action: function( params, queryParams ) {
    if(!Meteor.user() && !Meteor.loggingIn()) {
      FlowRouter.go('/');
    } else {
      BlazeLayout.render('applicationLayout', { top: 'navbar', main: 'settings', footer: 'footer' })
    }
  }
});

FlowRouter.route('/workshops/create', {
  action: function( params, queryParams ) {
    BlazeLayout.render('applicationLayout', { top: 'navbar', main: 'workshopCreate', footer: 'footer' })
  },
  name: 'workshop'
});

FlowRouter.route('/workshops/:_id', {
  subscriptions: function( params, queryParams ) {
    var wid = '';
    if(params) wid = params._id;

    this.register('userGroup', Meteor.subscribe('users'));
    this.register('comments', Meteor.subscribe('comments', wid));
    this.register('workshop', Meteor.subscribe('workshopById', wid));
  },
  action: function( params, queryParams ) {
    BlazeLayout.render('applicationLayout', { top: 'navbar', main: 'workshop', footer: 'footer' })
  },
  name: 'workshop'
});

FlowRouter.route('/users/:_id', {
  subscription: function( params, queryParams ) {
    var userId = '';
    if(params)  userId = params._id;

    this.register('user', Meteor.subscribe('user', userId));
    this.register('workshopsByUser', Meteor.subscribe('workshopsByUser', userId));
  },
  action: function( params, queryParams ) {
    BlazeLayout.render('applicationLayout', { top: 'navbar', main: 'user', footer: 'footer' })
  },
  name: 'user'
});
