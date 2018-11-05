// Filter example: {"ns":/^customers\./,"op":"insert","secs_running":{$gt:60}} 

db.currentOp(<Filter>).inprog.forEach(
function(d){
var q = {};
print('ConnectionId:'+d.connectionId
+' Operation:'+d.op
+' Namespace:'+d.ns
+' Client:'+d.client
+' Seconds_running:'+d.secs_running
+' NumYields:'+d.numYields
+' Query:'+JSON.stringify(d.command))
}
)



