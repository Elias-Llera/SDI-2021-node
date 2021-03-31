module.exports = { mongo : null, app : null,
    init : function(app, mongo) {
        this.mongo = mongo;
        this.app = app; },
    insertarCancion : function(cancion, funcionCallback) { this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
        if (err) {
            funcionCallback(null);
        } else {
            let collection = db.collection('canciones');
            collection.insertOne(cancion, function(err, result) {
                if (err) {
                    funcionCallback(null);
                } else {
                    funcionCallback(result.ops[0]._id);
                }
                db.close();
            });
        }
    });
    }
};