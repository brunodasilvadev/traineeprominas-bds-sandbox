var repository = require('./repository');

/* search a student that has a course
input: idteacher
return: a teacher collection
*/
function findTeacherInCourse(teacherId, callback) {
    global.connection.collection('course').findOne({ 'teacher.id': teacherId }, callback);
}

module.exports = { repository, findTeacherInCourse };