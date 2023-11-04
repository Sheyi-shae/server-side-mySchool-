module.exports = (sequelize, DataTypes) => {
    const Likes = sequelize.define("Likes", {
      Post: {
        type: DataTypes.TEXT,
        allowNull: false
      },
    });
  
    Likes.associate = (models) => {
      Likes.belongsTo(models.Users, {
        foreignKey: {
          allowNull: false,
          onDelete: "cascade",
        },
      });
  //a foreign will be generated automatically by removing 's' from the model's name
      Likes.belongsTo(models.Topics, {
        foreignKey: {
          allowNull: false,
          onDelete: "cascade",
        },
      });
    };
  
    return Likes;
  };
  