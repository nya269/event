const { users} = require ('.schemas/userSchema');
const { events } = require  ('./schemas/eventSchema');
const { inscriptions } = require ('./schemas/inscriptionSchema');
const { payements } = require ('./schemas/paymentSchema');

module.exports = {
    users,
    events,
    inscriptions,
    payements,
};

// Maintenant, dans d'autres fichiers, on peut faire :
// const { users, events } = require('../models');
// Au lieu de :
// const { users } = require('../models/schemas/userSchema');
// const { events } = require('../models/schemas/eventSchema');
