import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import { styleDate, styleShortDate, formatTime, formatPrice } from '/imports/lib/stylish.js';
import { isToday } from '/imports/lib/clock.js';

import { Files } from '/imports/lib/core.js';
import { Comments } from '/imports/api/comments.js';
import { Workshops } from '/imports/api/workshops.js';
import { Email } from 'meteor/email';

import '../components/accountsModal.js';
import '../components/workshopInfoEdit.js';

import './workshop.html';

const pLimit = 6;

Template.workshop.onCreated(function workshopOnCreated() {
  this.isEditing = new ReactiveVar(false);
  this.isEditingName = new ReactiveVar(false);
  this.isEditingDesc = new ReactiveVar(false);
  this.isEditingTag = new ReactiveVar(false);
  this.isEditingItems = new ReactiveVar(false);

  this.workshop = new ReactiveVar({});

  this.getParam = () => FlowRouter.getParam('_id');

  this.autorun(() => {
    if(FlowRouter.subsReady()) {
      var param = this.getParam();
      var workshop = Workshops.findOne(param);

      if(!workshop) {
        FlowRouter.go('/404');
      } else {
        this.workshop.set(Workshops.findOne(param));
      }
    }
  })
});

Template.workshop.onRendered(function workshopOnRendered() {
  // initialize SemanticUI components
  $('.ui.accordion').accordion();
  $('#initDate').calendar();
  $('#endDate').calendar();
  $('.ui.named.avatar.image').popup();

  $('.ui.email.form').hide();

  window.scrollTo(0, 0);
});

Template.workshop.helpers({
  about(userId) {
    const user = Meteor.users.findOne(userId);
    if(userId && user) {
      return user.profile.desc;
    }
  },
  available(d) {
    return Template.instance().workshop.get().days.indexOf(d) === -1 ? "disabled" : "blue";
  },
  isUserAttending() {
    if(!Meteor.user()) {
      return;
    }
    return Meteor.user().profile.attendsTo.indexOf(FlowRouter.getParam('_id')) > -1;
  },
  getUserName(ownerId) {
    const owner = Meteor.users.findOne(ownerId);
    if(owner) {
      return owner.profile.name;
    }
  },
  lengthOf(array) {
    return array.length;
  },
  remain(participants) {
    return participants.length > pLimit;
  },
  firstParticipants(participants) {
    if(participants.length > pLimit) {
      return participants.slice(0, pLimit);
    } else {
      return participants;
    }
  },
  profilePicSrc(userId) {
    if(userId) {
      const user = Meteor.users.findOne(userId);
      if(user) {
        return user.profile.photo || '/userDefault.gif';
      }
    }
    return '/userDefault.gif';
  },
  getImageLink() {
    let workshop = Template.instance().workshop.get();
    if(workshop.pics && workshop.pics.length > 0){
      return workshop.pics[0];
    }else {
      return '/default.png';
    }
    /*const workshopId = FlowRouter.getParam('_id');
    let pic;
    Meteor.call('workshops.getPic', workshopId, 0, function(error, data){
      if(error) {
        console.error("at imports/ui/pages/workshop.js row:95",error);
        return '/default.png';
      }else if(data){
        pic = btoa(data);
        $('.masthead').css('background-image','url("data:image/jpeg;base64,'+ pic+'")')
      }else {
        return '/default.png';
      }
    });
    return pic;*/


    // console.log(pics);
    // var path;
    // if(pics){
    //   path = pics[0]
    // }else {
    //   return '/default.png';
    // }

  },
  getUserName( id ) {
    let user = Meteor.users.findOne(id);
    if(user) {
      return user.profile.name;
    }
  },
  comments() {
    return Comments.find().fetch();
  },
  info() {
    var workshop = Template.instance().workshop.get();
    if(workshop) {
      return workshop.items.length !== 0
    }
  },
  isEditing() {
    return Template.instance().isEditing.get();
  },
  isCurrentUserOwner() {
    return Template.instance().workshop.get().owner === Meteor.userId();
  },
  isEditingName() {
    return Template.instance().isEditingName.get();
  },
  isEditingDesc() {
    return Template.instance().isEditingDesc.get();
  },
  isEditingTag() {
    return Template.instance().isEditingTag.get();
  },
  isEditingItems() {
    return Template.instance().isEditingItems.get();
  },
  styleDate(date) {
    if(date) return styleDate(date);
  },
  styleShortDate(date) {
    if(date) return styleShortDate(date);
  },
  stylePrice(price) {
    if(price) return formatPrice(price);
  },
  formatTime(time) {
    if(time) return formatTime(time);
  },
  datetime(date) {
    var day = '';
    if(date && isToday(date)) {
      day = 'Hoy';
    } else {
      day = styleShortDate(date);
    }
    return day + " a las " + formatTime(date);
  },
  workshop() {
    return Template.instance().workshop.get();
  },
  remainingPlaces() {
    let workshop = Template.instance().workshop.get();
    if(workshop) {
      return workshop.capacity - workshop.participants.length;
    }
  },
  capacityAvailable() {
    let workshop = Template.instance().workshop.get();
    if(workshop)
      return workshop.capacity - workshop.participants.length > 0;
  },
  isCurrentUser(user) {
    return user === Meteor.userId();
  }
});

Template.workshop.events({
  'click .ui.top.attached.button'(event, instance) {
    instance.isEditing.set(!instance.isEditing.get());
  },
  'click .edit.name.icon'(event, instance) {
    instance.isEditingName.set(true);
  },

  'click .ui.save.name.button'(event, instance) {
    const newName = $('input[name=wedit-name]').val();
    const workshopId = FlowRouter.getParam('_id');
    Meteor.call('workshops.update', workshopId, {name:newName});
    instance.isEditingName.set(false);
  },

  /* --- description --- */
  'click .edit.desc.icon'(event, instance) {
    instance.isEditingDesc.set(true);
  },

  'click .ui.save.desc.button'(event, instance) {
    const newDesc = $('textarea[name=wedit-desc]').val();
    const workshopId = FlowRouter.getParam('_id');
    Meteor.call('workshops.update', workshopId, {desc: newDesc});

    instance.isEditingDesc.set(false);
  },

  /* --- tags --- */
  'click .create.tag.icon'(event, instance) {
    instance.isEditingTag.set(true);
  },

  'click .ui.save.tag.button'(event, instance) {
    const tag = $('input[name=wedit-tag]').val();
    if(tag){
      const workshopId = FlowRouter.getParam('_id');
      Meteor.call('workshops.createTag', workshopId, tag);
    }
    instance.isEditingTag.set(false);
  },

  'click .delete.tag.icon'(event) {
    const workshopId = FlowRouter.getParam('_id');
    const target = event.currentTarget;
    Meteor.call('workshops.deleteTag', workshopId, $(target.parentNode).data('idx'));
  },
  /* --- items list --- */

  'click .edit.items.icon'(event, instance) {
    instance.isEditingItems.set(true);
  },

  'click .ui.add.item.button'(event, instance) {
    const item = $('input[name=wedit-item]').val();
    if(item.trim().length !== 0) {
      const workshopId = FlowRouter.getParam('_id');
      Meteor.call('workshops.createItem', workshopId, item);
    }
    $('input[name=wedit-item]').val("");
    $('input[name=wedit-item]').focus();
  },

  'click .item.delete.icon'(event, instance) {
    const target = event.currentTarget.parentNode.parentNode.parentNode;
    let idx = $(target).data("idx");
    const workshopId = FlowRouter.getParam('_id');
    Meteor.call('workshops.deleteItem', workshopId, $(target).data("idx"));
  },

  'click .ui.save.items.button'(event, instance) {
    instance.isEditingItems.set(false);
  },

  'click .ui.join.workshop.button'(event, instance) {
    if(Meteor.user()) {
      let workshops = Meteor.user().profile.attendsTo;
      const workId = FlowRouter.getParam('_id');
      const isUserAttending = Meteor.user().profile.attendsTo.indexOf(FlowRouter.getParam('_id')) > -1;

      if(workshops.indexOf(workId) !== -1) {
        Meteor.call('workshops.pullParticipant', workId, (error, result) => {
          if(error) {
            alert(error.message);
          }
        });
      } else {
        Meteor.call('workshops.pushParticipant', workId, (error, result) => {
          if(error) {
            alert(error.message);
          }
        });

        const workshop = Workshops.findOne(FlowRouter.getParam('_id'));
        workshop.initDate = styleDate(workshop.initDate);
        workshop.initTime = formatTime(workshop.initTime);
        const owner = Meteor.users.findOne(workshop.owner)
        const message = {
          ownerName: owner.profile.name,
          attendantEmail: Meteor.user().emails[0].address,
          attendantName: Meteor.user().profile.name,
          attendantPhoto: Meteor.user().profile.photo,
          workshop: workshop
        }

        Meteor.call('email.notifyAttendant', message, (error, result) => {
          if(error) {
            console.log(error.message);
          } else {
            console.log('Mensaje enviado');
          }
        });
      }
    } else {
      $("#loginModal").modal('show');
    }
  },


  /* === DELETE === */
  'click a.delete.event'() {
    $('#confirmDeleteModal').modal('show');
  },

  'click .watch.participants'() {
    $('#participantsModal').modal('show');
  },

  // toggle email message field
  'click .ui.email.organizer.button'() {
    $('.ui.email.form').transition('slide down');
  },

  // send email to workshop organizer
  'click .ui.send.email.button'(e, instance) {
    const message = $('#emailToOwner').val();
    if(Meteor.user()) {
      Meteor.call('email.toWorkshopOrganizer', instance.workshop.get(), message, (error, result) => {
        if(error) {
          alert(error.message);
        } else {
          $('.ui.form').transition('slide down');
          $('.ui.success.message').transition('slide down');
        }
      });
    }
  },

  'click .ui.submit.button'(e, instance) {
    var content = $('textarea[name=new-comment]').val();
    // TODO shouldn't post an empty comment (client)

    if(Meteor.user()) {
      Meteor.call('comments.insert', content, instance.workshop.get()._id, (error, result) => {
        if(error) {
          alert(error.message);
        } else {
          $('textarea[name=new-comment]').val('');
          instance.subscribe('comments', 7);
        }
      });
    } else {
      Session.set('accountsModal', 'login');
      $('#accountsModal').modal('show');
    }
  },

  'click i.remove.del-comment.icon'(event, instance) {
    let cid = $(event.currentTarget).data('id');
    Meteor.call('comments.remove', cid);
  }
});

Template.confirmDeleteModal.onRendered(function cdModalOnRendered() {
  $("#confirmDeleteModal").modal({
    onDeny: function(){
      $("#confirmDeleteModal").modal('hide');
      return false;
    },
    onApprove: function() {
      const id = FlowRouter.getParam('_id');

      // TODO smoothen page refreshing when event is deleted
      Meteor.call('workshops.delete', id, (error, result) => {
        if(error) {
          alert(error.message);
        } else {
          FlowRouter.go('/');
          $("#confirmDeleteModal").modal('hide');
        }
      });
    }
  });
});

Template.participantsModal.onDestroyed(function() {
  $('#participantsModal').modal('hide');
})

Template.participantsModal.helpers({
  getUserName( id ) {
    let user = Meteor.users.findOne(id);
    if(user) {
      return user.profile.name;
    }
  },
  profilePicSrc(userId) {
    if(userId) {
      const user = Meteor.users.findOne(userId);
      if(user) {
        const image = Files.Images.findOne(user.profile.photo);
        if(image) {
          return image.link();
        }
      }
    }
    return 'userDefault.gif';
  },
});
