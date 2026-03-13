const {mysqleTable, varchar,myqlEnum, timetamp, unique } = require ('drizzle-orm/mysql-core');
const { users } = require ('./userSchema');


/**
 * SCHÉMA DE LA TABLE INSCRIPTIONS
 * 
 * Table de liaison entre users et events
 * Un utilisateur peut s'inscrire à plusieurs événements
 * Un événement peut avoir plusieurs participants
 */

const insciptions = mysqlTable ('inscriptions',{
    id: varchar('id',{ length: 36 }).primaryKey(),

    // RELATIONS : Liens vers users et events

    user_id: varchar ('user_id', { length : 36}).primaryKey(),

    event_id: varchar ('event_id' ,  { length :36 } )
    .references(() => events.id) //| FOREIGN KEY | Clé étrangère |
    .notNull(),

      
  // Montant du paiement (jusqu'à 99999999.99)
  amount: decimal('amount', {precision: 10, scale: 2}).notNull(),

  status: mysqlEnum ('status', [
    'pending',
    'completed',
    'failed',
    'refunded'

  ]).default(('pending')),

  stripe_payement_intent_id: varchar('stripe_payement_intent_id',{ length:255}),

  payement_method: mysqlEnum ('payement_method', [
    'card',
    'bank_transfer',
    'paypal',
    'cash'
    
  ]),

  createAt: timetamp('createAt').defaultNow(),
    updateAt: timetamp('updateAt').defaultNow().onUpdateNow(),

    refunded_at: timestamp('refunded_at'),


});

module.exports={ payements };