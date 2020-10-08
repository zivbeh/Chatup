'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Messages', [
      { message: 'hello', UserId: '1', ChatRoomId: 1, createdAt: new Date(), updatedAt: new Date() },
      { message: 'nice to meet you', UserId: '1', ChatRoomId: 1, createdAt: new Date(), updatedAt: new Date() },
      { message: 'i am here', UserId: '2', ChatRoomId: 1, createdAt: new Date(), updatedAt: new Date() },
    ], {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Messages', null, {});
  }
};

//{ message: 'text3', UserId: 3, ChatRoomId: 3, createdAt: new Date(), updatedAt: new Date() },