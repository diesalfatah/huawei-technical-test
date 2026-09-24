const createController = require('./usage-create.controller');
const getController = require('./usage-get.controller');
const updateController = require('./usage-update.controller');
const deleteController = require('./usage-delete.controller');

module.exports = {
    ...createController,
    ...getController,
    ...updateController,
    ...deleteController,
};