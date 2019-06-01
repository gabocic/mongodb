
function massiveupdate(database,collection,searchcond,chunksize,delay_between_chunks,delay_between_docs)
{

    function updatedoc(doc)
    {
        doc.cuisine = 'American'
        colobj.save(doc)
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
            updatedoc(doc);
            sleep(delay_between_docs)
        })
        print('Chunk '+j+': '+docstoupdcnt)
        j=j+1        
    	docstoupd = colobj.find(searchcond).limit(chunksize)
		docstoupdcnt = docstoupd.count(true)
        sleep(delay_betwee_chunks)
    }
    print('Process completed')
}
