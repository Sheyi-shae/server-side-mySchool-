module.exports = (sequelize, DataTypes) => {
    const Views = sequelize.define("Views", {
      Views: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
    });
  
    Views.associate = (models) => {
      Views.belongsTo(models.Users, {
        foreignKey: {
          allowNull: false,
          onDelete: "cascade",
        },
      });
  //a foreign will be generated automatically by removing 's' from the model's name
      Views.belongsTo(models.Topics, {
        foreignKey: {
          allowNull: false,
          onDelete: "cascade",
        },
      });
    };
  
    return Views;
  };
  