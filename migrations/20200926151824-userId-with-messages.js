'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('Messages', 'UserId', {
      type: Sequelize.INTEGER(11),
      foreignKey: true,
      references: {model: "Users", key: "id"},
      onDelete: 'CASCADE'
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('Messages', 'UserId');
  }
};