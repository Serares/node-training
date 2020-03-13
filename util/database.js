const Sequelize = require('sequelize');

const sequelize = new Sequelize('node_training', 'root', 'parola', {dialect:'mysql', host:'localhost'});

module.exports = sequelize;
