/*
generic find all
input: collection name
return: all collections
*/
function findAll(collection, callback) {
    global.connection.collection(collection).find({}).toArray(callback);
}

/* generic search of max id of a collection
input: collection name
return: the greather id
*/
function findMaxId(collection, callback) {
    global.connection.collection(collection).find({}, { projection: { _id: 0, id: 1 } }).sort({ id: -1 }).limit(1)
        .toArray((err, maxId) => {
            if (err) return callback(err, null);
            callback(err, maxId[0]);
        });
}

/* generic search by status equal 1
input: collection name
return: all collections that has status equal 1
*/
function findByStatusOne(collection, callback) {
    global.connection.collection(collection).find({ status: 1 }).toArray(callback);
}

/* generic search by id
input: collection name, parameter id
return: a collection
*/
function findById(collection, id, callback) {
    global.connection.collection(collection).findOne({ id: id }, callback);
}

/* generic search by id and status equal 1
input: collection name, parameter id
return: a collection
*/
function findByIdAndStatus(collection, id, callback) {
    global.connection.collection(collection).findOne({ id: id, status: 1 }, callback);
}

/* generic insert
input: collection name, document
return: document inserted
*/
function insert(collection, body, callback) {
    global.connection.collection(collection).insertOne(body, callback);
}

/* generic update by id
input: collection name, parameter id, document
return: document updated
*/
function update(collection, id, body, callback) {
    global.connection.collection(collection).updateOne({ id: id }, { $set: body }, callback);
}

/* generic update status to 0
input: collection name, parameter id
return: document updated
*/
function updateStatus(collection, id, callback) {
    global.connection.collection(collection).updateOne({ id: id, status: 1 }, { $set: { status: 0 } }, callback);
}

/* generic update status to 0
input: collection name, parameter id
return: document updated
*/
function updateStatusAll(collection, callback) {
    global.connection.collection(collection).updateMany({ status: 1 }, { $set: { status: 0 } }, callback);
}

/* generic update by id and status equal 1
input: collection name, parameter id, document
return: document updated
*/
function updateByStatus(collection, id, body, callback) {
    global.connection.collection(collection).updateOne({ id: id, status: 1 }, { $set: body }, callback);
}

/* generic delete all
input: collection name
*/
function deleteAll(collection, callback) {
    global.connection.collection(collection).deleteMany({}, callback);
}

/* generic delete by id
input: collection name, parameter id
*/
function deleteById(collection, id, callback) {
    global.connection.collection(collection).deleteOne({ id: id }, callback);
}

module.exports = {
    findAll, findByStatusOne, findMaxId, findById, findByIdAndStatus,
    insert,
    update, updateStatus, updateByStatus, updateStatusAll,
    deleteAll, deleteById
}