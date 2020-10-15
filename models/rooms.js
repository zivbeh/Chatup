'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class rooms extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.hasMany(models.Message, {
        onDelete: "cascade"
      });
      this.belongsToMany(models.Users, { through: 'User_Rooms' }, {
        onDelete: "cascade"
      });
    }
  };
  rooms.init({
    roomName: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'ChatRoom',
  });
  rooms.byName = async function (name) {
    const [room, _] = await this.findOrCreate({ where: { name: name } });
    return room;
  }
  return rooms;
};