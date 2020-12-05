'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('ToDoLists', 'UserId', {
      type: Sequelize.INTEGER(11),
      foreignKey: true,
      references: {model: "Users", key: "id"},
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('ToDoLists', 'UserId');
  }
};