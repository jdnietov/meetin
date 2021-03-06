import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import { formatTime, styleDate, formatPrice } from '/imports/lib/stylish.js';
import { Files } from '/imports/lib/core.js';
import { Workshops } from '/imports/api/workshops.js';

import './workshopCard.html';

Template.workshopCard.onCreated(function wsCardOnCreated() {
  this.subscribe('files.images.all');
  this.subscribe('users');
})

Template.workshopCard.onRendered(function wsCardOnRendered() {
  this.autorun(() => {
    var id = this.data.workshop.owner;
    var user = Meteor.users.findOne(id);
    if(user) {
      var item = ".ui.named.avatar.image";
      $(item).popup(user.profile.name);
    }
  });
});

Template.workshopCard.helpers({
  getOwnerName() {
    let ownerId = Template.instance().data.workshop.owner;
    if(Meteor.users.findOne(ownerId)) {
      return Meteor.users.findOne({_id: ownerId}).profile.name;
    }
  },
  getWorkshopDesc() {
    var desc = Template.instance().data.workshop.desc;
    if(desc && desc.length > 140){
        desc = desc.substring(0, 140).concat(" ...");
    }
    return desc;
  },
  getWorkshopAddr() {
    return Template.instance().workshop.get().addr;
  },
  getImageLink() {
    let workshop = Template.instance().data.workshop;
    if(workshop.pics && workshop.pics.length > 0){
      return workshop.pics[0];
    }else {
      return '/default.png';
    }
  },
  getImage(imageId) {
    if(imageId) {
      let image = Files.Images.findOne(imageId);
      if(image) {
        return image;
      }
    }
    return {
      link: '/default.png',
      name: 'Default image'
    };
  },
  formatPrice(price) {
     return formatPrice(price);
  },
  formatDate(date) {
    return styleDate(date);
  },
  formatTime(date) {
    return formatTime(date);
  },
  ownerPicSrc(ownerId) {
    if(ownerId) {
      const user = Meteor.users.findOne(ownerId);
      if(user) {
        return user.profile.photo || '/userDefault.gif';
      }
    }
    return '/userDefault.gif';
  },
  capacityAvailable(workshop) {
    if(typeof workshop.capacity === 'undefined'){
      return true;
    }
    return workshop.capacity - workshop.participants.length > 0;
  }
});
