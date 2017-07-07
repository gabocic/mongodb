function operation(lowerlimit,upperlimit)
{
    //print(lowerlimit)
    //print(upperlimit)
    var value = db.mycollection.find({$and: [{"IDkey":applicationid}, {"push": { $exists: true }}, {"push.opened": {$exists: false }},{_id:{$gte:lowerlimit, $lt:upperlimit}}]},{_id: 1}).forEach(function(doc){
    	db.mycollection.update( {_id: doc._id}, { $unset: { push: ""} });
    	print("Document changed [_id : " + doc._id + "]");
    	j++
    });
    if (k != j)
    {
    	print("Documents updated: "+k)
        k = j
    }
}
var j,k = 0
// Specify chunk size
var chunksize = 10000 -1

// Specify IDkey
var applicationid = 104486
print("##########################")
print("## IDkey: "+applicationid)
print("##########################")
// Determine collection max and min _id

var maxid = db.mycollection.find({"IDkey":applicationid},{_id:1}).sort({_id:-1}).limit(1)[0]
var minid = db.mycollection.find({"IDkey":applicationid},{_id:1}).sort({_id:1}).limit(1)[0]
print("Min document _id: "+minid._id)
print("Max document _id: "+maxid._id)


// Determine the amount of documents to be processed
var totaldocs = db.mycollection.find({"IDkey":applicationid}).count()
print("Total docs to be scanned: "+totaldocs)

// Calculate the amount of chunks
var chunks = Math.floor(totaldocs/chunksize)
print("Full chunks: "+chunks)
print("")
print("***********************************************")
print("")
// Calculate partial chunk size
var remainder = totaldocs - (chunks * chunksize)

// Obtain chunks boundaries
var limits = []
var upperlimit
var lowerlimit = minid._id
for (var i = 0; i < chunks; i++)
{
        upperlimit = db.mycollection.find({_id: {$gt:lowerlimit}},{_id:1}).skip(chunksize).limit(1)[0]
        limits.push(upperlimit._id)
        lowerlimit = upperlimit._id
}

// Execute operation for each chunk
lowerlimit = minid._id
limits.forEach(function(upperlimit){
	operation(lowerlimit,upperlimit)
        lowerlimit = upperlimit
})

// Execute operation for last partial chunk
operation(lowerlimit,maxid._id)
print("Total documents updated: "+k)

