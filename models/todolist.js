'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ToDoList extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.Users);
    }
  };
  ToDoList.init({
    Json: DataTypes.JSON,
    jsonId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'ToDoList',
  });
  return ToDoList;
};