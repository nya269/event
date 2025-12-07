const fs = require(' fs ');
const path = require(' path ')
const { pool } = require (' ../src/config/db ' );

async function runMigrations (){

    console.log(' Début des migrations ...');

    try{
    const migrationsPath = path.join(__dirname,'../src/migrations/001_create_tables.sql');
    const sql = fs.readFileSync( migrationPath, 'utf8');

    const queries =sql 
    .split(';')
    .filter ( query => query.trim().length > 0);


    for (const query of queries) {
        console.log ('Execution de la requête...');
        await pool.execute(query) ;

    }
console.log(' Migrations termiinées avec succès !');
    } catch (error){
    console.error(' erreur lors des migrations :', error ) ;
    } finally {
     await pool.end();
    }

}
 

if (require.main ===module ){
    runMigrations();

}

module.exports = { runMigrations };


