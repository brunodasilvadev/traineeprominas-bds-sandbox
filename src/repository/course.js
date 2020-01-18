var repository = require('./repository');

/* search a student that has a course
input: idcourse
return: a course collection
*/
function findCourseInStudent(courseId, callback) {
    global.connection.collection('student').findOne({ 'course.id': courseId }, callback);
}

module.exports = { repository, findCourseInStudent }