
function massiveupdate(database,collection,searchcond,chunksize,delay_between_chunks,delay_between_docs)
{

    function updatedoc(lowerlimit,upperlimit)
    {
    	// Build $and clause combining to include _id bounds
    	var andclause = []
    	andclause.push(searchcond)
    	andclause.push({_id:{$gte:lowerlimit, $lt:upperlimit}})
		var value = colobj.find({$and:andclause},{_id:1}).forEach(function(doc){
    		colobj.update({_id: doc._id},{$set:{cuisine : 'American'}});
            sleep(delay_between_docs)
        })
    }


    // ===== MAIN ======

	// Instantiate database and collection objects
    var dbobj = new Mongo().getDB(database);
    var colobj = dbobj.getCollection(collection);
    var j = 1

    // Retrieve the first round of documents to be deleted
    var docstoupd = colobj.find(searchcond).limit(chunksize)
	var docstoupdcnt = docstoupd.count(true)

    
    // Find lower bound
    var upper_id = colobj.find({},{_id:1}).sort({_id:-1}).limit(1)[0]._id


    // Find upper bound
    var lower_id = colobj.find({},{_id:1}).sort({_id:1}).limit(1)[0]._id


    // Just initializing lastDoc_id to something
    var lastDoc_id = lower_id

    
    // Determine the amount of documents to be processed

	var totaldocs = colobj.find().count()
	print("Total docs to be scanned: "+totaldocs)

	// Calculate the amount of chunks
	var chunks = Math.floor(totaldocs/chunksize)
	print("Full chunks: "+chunks)
	
    // Calculate partial chunk size
	var remainder = totaldocs - (chunks * chunksize)

	// Obtain chunks boundaries
	var limits = []
	var upperlimit
	var lowerlimit = lower_id
	for (var i = 0; i < chunks; i++)
	{
			upperlimit = colobj.find({_id: {$gt:lowerlimit}},{_id:1}).limit(chunksize)[chunksize-1]
			limits.push(upperlimit._id)
			lowerlimit = upperlimit._id
	}


	// Execute operation for each chunk
	lowerlimit = lower_id
	limits.forEach(function(upperlimit){
        //print(upperlimit)
		updatedoc(lowerlimit,upperlimit)
        lowerlimit = upperlimit
        sleep(delay1)
        print('Chunk '+j)
        j = j+1
	})

    // Execute operation for last partial chunk
    updatedoc(lowerlimit,upper_id)
    print('Process completed')
}
