
function massiveremove(database,collection,searchcond,chunksize,delay_between_chunks,delay_between_docs)
{

    function removedoc(doc)
    {
        colobj.remove({"_id":doc._id})
    }

    // ===== MAIN ======

	// Instantiate database and collection objects
    var dbobj = new Mongo().getDB(database);
    var colobj = dbobj.getCollection(collection);
    var j = 1

    // Retrieve the first round of documents to be deleted
    var docstoupd = colobj.find(searchcond).limit(chunksize)
	var docstoupdcnt = docstoupd.count(true)

    // retrieve chunks until there are no more documents left
    while(docstoupdcnt > 0)
    {
	    // Update operation
        docstoupd.forEach(function(doc){
            removedoc(doc);
            sleep(delay2)
        })
        print('Chunk '+j+': '+docstoupdcnt)
        j=j+1       
        sleep(delay1) 
    	docstoupd = colobj.find(searchcond).limit(chunksize)
		docstoupdcnt = docstoupd.count(true)
    }
    print('Process completed')
}
