const { mysqlTable, varchar,timestamp,mysqlEnum } =require('drizzle-orm/mysql-core');

const user=myTable('users',{
    //colone id pour stocker des uuid//

    id:varchar('id',{length:36}).primaryKey(),

    name : varchar ('name',{length :255 }).notNull(),

    email :varchar ('email',{length:255}).notNull().unique(),
    
    password: varchar('password',{length:255}).notNull (),

 // COLONNE: role
  // Type: ENUM - Valeurs limitées à cette liste
  // Valeur par défaut: 'participant'
    role : mysqlEnum('role', ['participant', 'organizer', 'admin'])
     .default('participant'),

      
  // COLONNE: createdAt
  // Type: TIMESTAMP
  // Valeur par défaut: Date/heure actuelle

createAt : timestamp ('createAt').defaultNow(),

// COLONNE: updatedAt
  // Type: TIMESTAMP
  // Se met à jour automatiquement à chaque modification
udapteAt: timestamp ('updateAt').defaultNow().onUpdateNow(),
});

// exporter le schéma pour l'utiliser ailleurs 

module.exports ={ user };
