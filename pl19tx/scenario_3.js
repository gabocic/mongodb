function dropDatabasesLowImpact(dropdelay)
{
    function dropCollandDB(database)
    {

        // Instantiate database object
        var dbobj = new Mongo().getDB(database);

        // Retrieve all collections for the database
        l_cols = dbobj.getCollectionNames()

		// Drop collections, one at a time
        for (var i=0; i < l_cols.length; i++)
        {
                var colobj = dbobj.getCollection(l_cols[i]);
                print('Dropping collection '+l_cols[i])
                colobj.drop()
                sleep(dropdelay);
        }

        // Drop databasa
        print('Dropping database '+database+'...')
        dbobj.dropDatabase();
     }


    // ## MAIN ##
    
	// Retrieve databases to drop from auxiliary collection
    dbids = db.auxcol.find({completedTime:null,proceed:"yes"},{_id:1})

    for (var j = 0; j < dbids.length(); j++)
    {
        var database = dbids[j]
        dropec = dropCollandDB(database)
    }
}
