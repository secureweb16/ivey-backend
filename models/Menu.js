const mongoose = require('mongoose');

const MenusSchema = new mongoose.Schema({
    menuData: {
        type: Array,
        default: []
    }
    // subMenus: {
    //     type: Array,
    //     default: []
    // }
}, {timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }});

module.exports = mongoose.model('menus', MenusSchema);
