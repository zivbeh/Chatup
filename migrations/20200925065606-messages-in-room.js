'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('Messages', 'ChatRoomId', {
      type: Sequelize.INTEGER(11),
      references: {model: "ChatRooms", key: "id"},
      onDelete: 'CASCADE'
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('Messages', 'ChatRoomId');
  }
};