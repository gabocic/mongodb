print("Gb in cache")
print(db.serverStatus().wiredTiger.cache["bytes currently in the cache"]/1024/1024/1024)

print("Avg Mb read into cache per second")
print((db.serverStatus().wiredTiger.cache["bytes read into cache"]/db.serverStatus().uptime)/1024/1024)

print("Avg Mb written from cache per second")
print((db.serverStatus().wiredTiger.cache["bytes written from cache"]/db.serverStatus().uptime)/1024/1024)

print("Avg Eviction calls per second")
print((db.serverStatus().wiredTiger.cache["eviction calls to get a page"]/db.serverStatus().uptime)/1024/1024)

print("Maximum Gb configured")
print(db.serverStatus().wiredTiger.cache["maximum bytes configured"]/1024/1024/1024)

print("Dirty Gb in the cache")
print(db.serverStatus().wiredTiger.cache["tracked dirty bytes in the cache"]/1024/1024/1024)
