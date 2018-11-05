// ######## This process needs to be run first (Before the collection data pruning)
    
function dropDatabasesLowImpact(dryrun,dropdelay)
{
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

    // Check if the halt flag exists
    var colcheck = db.params.findOne({_id:'halt'},{_id:0,value:1})
    if (colcheck == null)
    {
        print('halt document on auxiliarydb.params was not created or the collection does not exist');
        return false
    }


    function dropCollandDB(database)
    {

        // Retrieve all collections for the <id> database
        print('')
        print('')
        print('#################################')
        print('## Database: '+database+' ##')
        print('#################################')
        var dbobj = new Mongo().getDB(database);

        // Retrieve all collections for the <id> database
        l_cols = dbobj.getCollectionNames()
        for (var i=0; i < l_cols.length; i++)
        {
                var colobj = dbobj.getCollection(l_cols[i]);
                if (dryrun == false)
                {
                    if (checkhaltflag()){
                        exitcode = -1
                        break;
                    }
                    else
                    {
                        print('Dropping collection '+l_cols[i])
                        colobj.drop()
                        sleep(dropdelay);
                    }
                }
                else
                {
                    print('DryRun: Not dropping collection '+l_cols[i])
                }

        }

        // Drop database <id>
        if (dryrun == false)
        {
            if (checkhaltflag()){
               exitcode = -1
            }
            else
            {
                print('Dropping database '+database+'...')
                dbobj.dropDatabase();
            }
        }
        else
        {
            print('DryRun: Not dropping database '+database)
        }
        return exitcode
     }


    // ## MAIN ##
    
    var exitcode = 0
    dbids = db.auxcol.find({completedTime:null,proceed:"yes"},{_id:1})

    for (var j = 0; j < dbids.length(); j++)
    {
        var dbid = dbids[j]
        var dropec = 0
        var database = "mydb_"+dbid._id
        dropec = dropCollandDB(database)
        if (dropec == -1){
           break;
        }

        // Update the auxiliary collection
        if (dryrun == false)
        {
            db.auxcol.update( {_id: dbid._id}, { $currentDate: {"completedTime": { $type: "date" } } })
        }

    }
}

// Parameter1: dryrun(true or false), Parameter2: Delay between collection drops in milliseconds
// dropDatabasesLowImpact(false,500)
