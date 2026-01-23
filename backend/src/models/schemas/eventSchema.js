const {mysqlTable, varchar, text, decimal,timestamp, json} = require('drizzle-orm/mysql-core');
const { user } = require ('./userSchema'); // import du schéma user pour la relier 

/**
 * SCHÉMA DE LA TABLE EVENTS
 * 
 * Gère les événements créés par les organisateurs
 */

const events = mysqleTable('events', {
    id: varchar ('id', {length: 36 }).primaryKey (), //`.primaryKey()` | PRIMARY KEY | Identifiant unique |
    title: varchar ('title', {length : 255}).notNull(), //`.notNull()` | NOT NULL | Titre de l'événement |
    description: text('description'), // | TEXT | Description détaillée de l'événement || NOT NULL | Champ obligatoire |
    location:  varchar('location', {length: 255}),

    event_date: timestamp('event_date'),   // Date de l'événement (peut être NULL)
    
    price: decimal('price',{ precision: 10, scale: 2 }).default(0), // Prix avec 2 décimales (10 chiffres max dont 2 après la virgule)

    organizer_id: varchar('organizer_id', {length: 36})
        .references(()=> user.id) // clé étrangère vers la table users
        .notNull(),    //| NOT NULL | Champ obligatoire |
    
    
    photos: json ('photos'),


    createdAt: timestamp ('createdAt').defaultNow(),
    updateAt: timestamp ('updateAt').defaultNow().onUpdateNow(),

});

// Exporter le schéma pour l'utiliser ailleurs

module.exports = { events };

organizer_id: varchar ('organizer_id', {length: 36})
.references(() => users.id)// clé étrangère vers la table users
.notNull()

photos:json ('photos')

