function collectionCleaner(database,collection,datekey,time,chunksize,datekeyformat)
{
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
