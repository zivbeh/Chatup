'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('ChatRooms', [
      { roomName: 'Hisory', createdAt: new Date(), updatedAt: new Date() },
      { roomName: 'Climbing', createdAt: new Date(), updatedAt: new Date() },
      { roomName: 'Food', createdAt: new Date(), updatedAt: new Date() },
      { roomName: 'Toys', createdAt: new Date(), updatedAt: new Date() },
    ], {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('ChatRooms', null, {});
  }
};
