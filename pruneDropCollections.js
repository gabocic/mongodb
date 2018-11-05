/*
 * ******************
 * README!
 * ******************
 *
 * (1) Create the auxiliarydb.auxcoldbs collection with the following format. WARNING: any collections with "drop:yes" WILL be Dropped
 *
 * {"_id":"databasename","datekey":"datekeyname","drop":<yes" | "no">,"completedTime" : null, "proceed" : "no","datekeyformat":<"timestamp" | "YYYYMMDD">}
 *
 *
 * (2) Create the params auxcoldbs.collection inside auxiliarydb
 *
 * mongo> db.params.insert({_id:'halt',value:0})
 *
 *
 * (3) Update the auxiliary collection to determine which databases will be processed
 * 
 * To enable a single collection
 * mongo> db.auxcolcols.update({_id:mycoll1},{$set:{proceed:"yes"}})
 *
 * To enable them all
 * mongo> db.auxcolcols.update({},{$set:{proceed:"yes"}},{multi:true})
 *
 *
 * (4) Perform a dry run to make sure the script will drop/prune what is expected. 
 *      -Parameter 1: indicates if it is a DryRun, 
 *      -Parameter 2: the amount of ms to wait between collection drop / chunks prune, 
 *      -Parameter 3: the target date (all documents with an older date will be removed) 
 *      -Parameter 4: indicates the chuksize (amount of documents deleted on a single pass)
 *
 *      mongo> pruneDropCollections(true,1000,'2018-05-01 00:00:00',2000)
 */


function pruneDropCollections(dryrun,dropdelay,time,chunksize)
{

    function collectionCleaner(database,collection,datekey,time,chunksize,datekeyformat)
    {
        function changeDateFormat(time)
        {
            splitdate={}
            var tardate = ISODate(time)
            splitdate['year'] = tardate.getFullYear().toString().substr(-2);
            splitdate['month'] = ("0" + (tardate.getMonth() + 1)).slice(-2)
            splitdate['day'] = ("0" + tardate.getDate()).slice(-2)
            splitdate['hours'] = tardate.getHours()
            return splitdate
        }

        var j = 1
        // Specify chunk size - It is negative so the cursor is closed after docs are retrieved
        var chunksize = -1*chunksize
        
        // Define the filter clause depending on the time key format of each collection
        var filter = {}
        if (datekeyformat == 'timestamp')
        {
            var formtime = ISODate(time)
            var filter1 = {$lt:formtime}
        }
        else if (datekeyformat == 'YYMMDDHH')
        {
            splitdate = changeDateFormat(time)
            var formtime = parseInt(splitdate['year']+splitdate['month']+splitdate['day']+splitdate['hours'])
            var filter1 = {$lt:formtime}
        }
        else
        {
            splitdate = changeDateFormat(time)
            var formtime = parseInt(splitdate['year']+splitdate['month']+splitdate['day'])
            var filter1 = {$lt:formtime}
        }
        filter[datekey] = filter1
	    
        print('Removing documents where '+datekey+' is lower than '+formtime+' for collection '+collection)

        // Instantiate database and collection objects
        var dbobj = new Mongo().getDB(database);
        var colobj = dbobj.getCollection(collection);

        // Retrieve the first round of documents to be deleted
        doctodel = colobj.find(filter).limit(chunksize)
		doctodelcnt = doctodel.count(true)
        // Continue to retrieve chunks until there are no more documents left
        while(doctodelcnt > 0)
        {
            // Delete the documents for this chunk
            doctodel.forEach(function(doc){
                colobj.remove({_id:doc._id})
            })
            print('Chunk '+j+': '+doctodelcnt)
			sleep(dropdelay);
            j=j+1        
            doctodel = colobj.find(filter).limit(chunksize)
			doctodelcnt = doctodel.count(true)
        }

    }


	function checkhaltflag()
    {
        var haltjs = db.params.findOne({_id:'halt'},{_id:0,value:1})
        if (haltjs['value'] == 1)
        {
            print('Process halted')
            var returnval = true;
        }
        else
        {
            var returnval = false;
        }
        return returnval
    }

    // #### MAIN ####

	// Check if the halt flag exists
    var colcheck = db.params.findOne({_id:'halt'},{_id:0,value:1})
    if (colcheck == null)
    {
        print('halt document on auxiliarydb.params was not created or the collection does not exist');
        return false
    }

    // # Retrieve affected databases and collections
    var exitcode = 0
    databases = db.auxcoldbs.find({completedTime:null,proceed:"yes"},{_id:1})
    colstodrop = db.auxcolcols.find({proceed:"yes",drop:"yes"},{_id:1})
    colstoprune = db.auxcolcols.find({proceed:"yes",drop:"no"},{_id:1,datekey:1,datekeyformat:1})


    // # For each database, prune and drop the correspondent collections

    //for database in databases query
    for (var j = 0; j < databases.length(); j++)
    {
		print('')
        print('')
        print('#################################')
        print('## Database: '+databases[j]._id+' ##')
        print('#################################')


        // For each collection to be dropped
        for (var i = 0; i < colstodrop.length(); i++)
        {
            var dbobj = new Mongo().getDB(databases[j]._id);
            var colobj = dbobj.getCollection(colstodrop[i]._id);
			if (dryrun == false)
			{
				if (checkhaltflag()){
					exitcode = -1
					break;
				}
				else
				{
					print('Dropping collection '+colstodrop[i]._id)
					print('')
					colobj.drop()
					sleep(dropdelay);
				}
			}
			else
			{
				print('DryRun: Not dropping collection '+colstodrop[i]._id)
			}


        }

        // For each collection to be pruned 
        for (var i = 0; i < colstoprune.length(); i++)
        {
			if (dryrun == false)
			{
				if (checkhaltflag()){
					exitcode = -1
					break;
				}
				else
				{
                    collectionCleaner(databases[j]._id,colstoprune[i]._id,colstoprune[i].datekey,time,chunksize,colstoprune[i].datekeyformat)
					print('')
					sleep(dropdelay);
				}
			}
			else
			{
				print('DryRun: *NOT* pruning collection '+colstoprune[i]._id)
			}

        }

		// # Update aux collection
		if (dryrun == false)
        {
            db.auxcoldbs.update( {_id: databases[j]._id}, { $currentDate: {"completedTime": { $type: "date" } } })
        }

    }
}
