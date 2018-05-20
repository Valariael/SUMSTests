'use strict';


// We should do a loop that goes through all the entities
// Before entering the function, check that the url matches (see splitURL)

const attrAbs = 'attribute absent : ';
const typeErr = 'incorrect attribute type : ';
const empty = 'should not be empty : ';

/*
 * Each one of the functions below tests for one of de four _root entities_ if it is structurally correct.
 * It takes the `root entity` as an object in parameter.
 * The output is false if there is no error, an array of strings describing the errors otherwise.
 */

// COHORT ENTITY
function checkCohortStructure(dbCohort) {
  const errors = [];
  const dateRegexp = new RegExp(/^\d{4}[-](0?[1-9]|1[012])[-](0?[1-9]|[12][0-9]|3[01])$/);
  const attributes = [
    'id',
    'year',
    'closed',
    'coordinators',
    'projectSubmissionDeadline',
    'unit',
    'markingForm',
  ];

  for (let i=0; i<attributes.length; i+=1) {
    if (!Object.prototype.hasOwnProperty.call(dbCohort, attributes[i])) {
      errors.push(attrAbs + attributes[i]);
    }
  }
  if (!Object.prototype.hasOwnProperty.call(dbCohort.markingForm, 'categories')) {
    errors.push(attrAbs + 'markingForm.categories');
  }

  if (!(typeof (dbCohort.id) === 'string')) {
    errors.push(typeErr + 'id is not a string');
  }
  if (dbCohort.id !== dbCohort.cohortId + '/' + dbCohort.student) {
    errors.psuh('the id should be equal to `:cohortId/:student`');
  }

  if (!(typeof (dbCohort.year) === 'number')) {
    errors.push(typeErr + 'year is not a number');
  }

  if (!(typeof (dbCohort.closed) === 'boolean')) {
    errors.push(typeErr + 'closed is not a boolean');
  }

  if (!(Array.isArray(dbCohort.coordinators))) {
    errors.push(typeErr + 'coordinators is not an array');
  }
  if (!(dbCohort.coordinators.length > 0)) {
    errors.push(empty + 'coordinators');
  }
  for (let i = 0; i < dbCohort.coordinators.length; i += 1) {
    if (!(typeof (dbCohort.coordinators[i]) === 'string')) {
      errors.push(typeErr + 'coordinators[' + i + '] is not a string');
    }
  }

  if (!(dateRegexp.test(dbCohort.projectSubmissionDeadline))) {
    errors.push('projectSubmissionDeadline has an incorrect format');
  }

  if (!(typeof (dbCohort.unit) === 'string')) {
    errors.push(typeErr + 'unit is not a string');
  }
  if (dbCohort.unit === '' || dbCohort.unit.length === 0) {
    errors.push(empty + 'unit');
  }

  if (!(Array.isArray(dbCohort.markingForm.categories))) {
    errors.push(typeErr + 'markingForm.categories is not an array');
  }
  if (!(dbCohort.markingForm.categories.length > 0)) {
    errors.push(empty + 'markingForm.categories');
  }

  for (let i = 0; i < dbCohort.markingForm.categories.length; i += 1) {
    const category = dbCohort.markingForm.categories[i];
    const categoryStr = 'markingForm.categories[' + i + '].';

    if (!Object.prototype.hasOwnProperty.call(category, 'compulsory')) {
      errors.push(attrAbs + categoryStr + 'compulsory');
    }
    if (!Object.prototype.hasOwnProperty.call(category, 'description')) {
      errors.push(attrAbs + categoryStr + 'description');
    }
    if (!Object.prototype.hasOwnProperty.call(category, 'name')) {
      errors.push(attrAbs + categoryStr + 'name');
    }
    if (!Object.prototype.hasOwnProperty.call(category, 'weight')) {
      errors.push(attrAbs + categoryStr + 'weight');
    }
    if (!Object.prototype.hasOwnProperty.call(category, 'levels')) {
      errors.push(attrAbs + categoryStr + 'levels');
    }

    if (!(typeof (category.compulsory) === 'boolean')) {
      errors.push(typeErr + categoryStr + 'compulsory is not a boolean');
    }

    if (!(typeof (category.description) === 'string')) {
      errors.push(typeErr + categoryStr + 'description is not a string');
    }

    if (!(typeof (category.name) === 'string')) {
      errors.push(typeErr + categoryStr + 'name is not a string');
    }

    if (!(typeof (category.weight) === 'number')) {
      errors.push(typeErr + categoryStr + 'weight is not a number');
    }
    if (!(category.weight > 0)) {
      errors.push(categoryStr + 'weight is not positive');
    }

    if (!(Array.isArray(category.levels))) {
      errors.push(typeErr + categoryStr + 'levels is not an array');
    }
    if (!(dbCohort.markingForm.categories.length > 0)) {
      errors.push(empty + 'markingForm.categories');
    }

    let previousUpTo = 0;

    for (let j = 0; j < category.levels.length; j += 1) {
      const level = category.levels[j];
      const levelStr = categoryStr + 'levels[' + j + '].';

      if (!(typeof (level.negatives) === 'string')) {
        errors.push(typeErr + levelStr + 'negatives is not a string');
      }

      if (!(typeof (level.positives) === 'string')) {
        errors.push(typeErr + levelStr + 'positives is not a string');
      }

      if ((level.positives === '' || level.positives.length === 0) && (level.negatives === '' || level.negatives.length === 0)) { // eslint-disable-line max-len
        errors.push(levelStr + 'positives and ' + levelStr + 'negatives are empty at the same time');
      }

      if (!(typeof (level.upTo) === 'number')) {
        errors.push(typeErr + levelStr + 'upTo is not a number');
      }

      if (level.upTo < previousUpTo) {
        errors.push(levelStr + 'upTo decreases');
      }
      previousUpTo = level.upTo;

      if (level.upTo > 100) {
        errors.push(levelStr + 'upTo is higher than 100');
      }
    }

    if (category.levels[category.levels.length-1].upTo !== 100) {
      errors.push(categoryStr + 'level[' + (category.levels.length-1) + '].upTo should be 100');
    }
  }
  if (errors.length === 0) return false;
  return errors;
}

// PROJECT ENTITY
function checkProjectStructure(dbProject) {
  const errors = [];
  const attributes = [
    'id',
    'student',
    'cohortId',
    'title',
    'submitted',
    'finalMark',
    'markers',
    'markOverrideComments',
    'unfairnessConcern',
    'unfairnessComment',
    'feedbackForStudent',
    'feedbackSent',
    'requestAdditionalMarker',
  ];

  for (let i=0; i<attributes.length; i+=1) {
    if (!Object.prototype.hasOwnProperty.call(dbProject, attributes[i])) {
      errors.push(attrAbs + attributes[i]);
    }
  }

  if (!(typeof (dbProject.id) === 'string')) {
    errors.push(typeErr + 'id is not a string');
  }
  if (dbProject.id !== dbProject.cohortId + '/' + dbProject.student) {
    errors.push('the id should be equal to `:cohortId/:student`');
  }

  if (!(typeof (dbProject.student) === 'number')) {
    errors.push(typeErr + 'student is not a number');
  }

  if (!(typeof (dbProject.cohortId) === 'string')) {
    errors.push(typeErr + 'cohortId is not a string');
  }
  if (!(dbProject.cohortId.length > 0)) {
    errors.push(empty + 'cohortId');
  }

  if (!(typeof (dbProject.title) === 'string')) {
    errors.push(typeErr + 'title is not a string');
  }
  if (!(dbProject.title.length > 0)) {
    errors.push(empty + 'title');
  }

  if (typeof (dbProject.submitted) === 'string') {
    if ((dbProject.submitted === 'yes') || (dbProject.submitted === 'late')) {
      if (typeof (dbProject.finalMark) === 'object') {
        if (dbProject.finalMark !== null) {
          errors.push('project not marked : finalMark should be null');
        } else {
          if (!((typeof dbProject.unfairnessConcern) !== 'object')) {
            errors.push(typeErr + 'unfairnessConcern is not an object');
          }
          if (dbProject.unfairnessConcern !== null) {
            errors.push('unfairnessConcern should be null');
          }
          if (dbProject.feedbackSent !== false) {
            errors.push('feedbackSent should be false');
          }
        }
      } else if (typeof (dbProject.finalMark) === 'number') {
        if (dbProject.finalMark < 0 || dbProject.finalMark > 100) {
          errors.push('project marked : finalMark should be in [0-100]');
        } else {
          if (!((typeof dbProject.unfairnessConcern) !== 'boolean')) {
            errors.push(typeErr + 'unfairnessConcern is not a boolean');
          }
          if (dbProject.feedbackSent !== true) {
            errors.push('feedbackSent should be true');
          }
        }
        if (!(Array.isArray(dbProject.markOverrideComments))) {
          errors.push(typeErr + 'markOverrideComments is not an array');
        }
        if (dbProject.markOverrideComments.length < 1) {
          errors.push('markOverrideComments should have at least one element');
        }
        // precision needed
      } else {
        errors.push(typeErr + 'finalMark is not an object or a number');
      }
    } else {
      errors.push('when submitted is a string it should be `yes` or `late`');
    }
  } else if (typeof (dbProject.submitted) === 'object') {
    if (dbProject.submitted === null) {
      if (!(typeof (dbProject.finalMark) === 'object')) {
        errors.push(typeErr + 'finalMark is not an object');
      }
      if (dbProject.finalMark !== null) {
        errors.push('project not submitted : finalMark should be null');
      } else {
        if (!((typeof dbProject.unfairnessConcern) !== 'object')) {
          errors.push(typeErr + 'unfairnessConcern is not an object');
        }
        if (dbProject.unfairnessConcern !== null) {
          errors.push('unfairnessConcern should be null');
        }
        if (dbProject.feedbackSent !== false) {
          errors.push('feedbackSent should be false');
        }
      }
      if (!(typeof (dbProject.markOverrideComments) === 'string')) {
        errors.push(typeErr + 'markOverrideComments is not a string');
      }
      if (dbProject.markOverrideComments !== 'project not submitted') {
        errors.push('project not submitted : markOverrideComments should be `project not submitted`');
      }
    } else {
      errors.push('submitted should be null when it is an object');
    }
  } else {
    errors.push(typeErr + 'submitted should be a string or an object');
  }

  if (dbProject.unfairnessConcern) {
    if (!((typeof dbProject.unfairnessComment) === 'string')) {
      errors.push(typeErr + 'unfairnessComment is not a string');
    }
    if (!(dbProject.unfairnessComment.length > 0)) {
      errors.push(empty + 'unfairnessComment');
    }
  } else {
    if (!((typeof dbProject.unfairnessComment) === 'object')) {
      errors.push(typeErr + 'unfairnessComment is not an object');
    }
    if (dbProject.unfairnessComment.length !== null) {
      errors.push('unfairnessComment should be null');
    }
  }

  if (!(typeof (dbProject.feedbackSent) === 'boolean')) {
    errors.push(typeErr + 'finalMark is not a boolean');
  }
  if (dbProject.feedbackSent) {
    if (!((typeof dbProject.feedbackForStudent) === 'string')) {
      errors.push(typeErr + 'feedbackForStudent is not a string');
    }
    if (dbProject.feedbackForStudent.length < 100) {
      errors.push('feedbackForStudent should be at least 100 characters');
    }
  } else {
    if (!((typeof dbProject.feedbackForStudent) === 'object')) {
      errors.push(typeErr + 'feedbackForStudent is not a object');
    }
    if (dbProject.feedbackForStudent.length !== null) {
      errors.push('feedbackForStudent should be null');
    }
  }

  if (!(Array.isArray(dbProject.markers))) {
    errors.push(typeErr + 'markers is not an array');
  }
  if (!(dbProject.markers.length > 1)) {
    errors.push('not enough markers');
  }
  for (let i = 0; i < dbProject.markers.length; i += 1) {
    if (!(typeof (dbProject.markers[i]) === 'string')) {
      errors.push(typeErr + 'markers[' + i + '] is not a string');
    }
    if (!(dbProject.markers[i].length > 0)) {
      errors.push(empty + 'markers[' + i + ']');
    }
  }

  if (!((typeof dbProject.requestAdditionalMarker) === 'boolean')) {
    errors.push(typeErr + 'requestAdditionalMarker is not a boolean');
  }
  if (dbProject.markers.length > 2) {
    if (!dbProject.requestAdditionalMarker) {
      errors.push('requestAdditionalMarker should be true');
    }
  }

  if (errors.length === 0) return false;
  return errors;
}

// STUDENT ENTITY
function checkStudentStructure(dbStudent) {
  const errors = [];
  const idRegexp = new RegExp(/^\d{6}$/);
  const attributes = ['id', 'email', 'name', 'preferences', 'lastActivity'];

  for (let i=0; i<attributes.length; i+=1) {
    if (!Object.prototype.hasOwnProperty.call(dbStudent, attributes[i])) {
      errors.push(attrAbs + attributes[i]);
    }
  }

  if (!(typeof (dbStudent.id) === 'string')) {
    errors.push(typeErr + 'id is not a string');
  }
  if (dbStudent.id.length !== 6) {
    errors.push('id should be 6 characters long');
  }
  if (!(idRegexp.test(dbStudent.id))) {
    errors.push('id has an incorrect format');
  }

  if (!(typeof (dbStudent.email) === 'string')) {
    errors.push(typeErr + 'email is not a string');
  }
  if (!(dbStudent.email.length > 0)) {
    errors.push(empty + 'email');
  }

  if (!(typeof (dbStudent.name) === 'string')) {
    errors.push(typeErr + 'name is not a string');
  }
  if (!(dbStudent.name.length > 0)) {
    errors.push(empty + 'name');
  }

  if (!(typeof (dbStudent.preferences) === 'object')) {
    errors.push(typeErr + 'preferences is not an object');
  }// precisions needed, are the attributes defined ?????

  if (!(typeof (dbStudent.lastActivity) === 'number')) {
    errors.push(typeErr + 'lastActivity is not a string');
  }// undefined possible ?

  if (errors.length === 0) return false;
  return errors;
}

// STAFF ENTITY
function chechStaffStructure(dbStaff) {
  const errors = [];
  const attributes = ['email', 'name', 'canCreateCohortsInUnits', 'roles', 'preferences', 'lastActivity'];

  for (let i=0; i<attributes.length; i+=1) {
    if (!Object.prototype.hasOwnProperty.call(dbStaff, attributes[i])) {
      errors.push(attrAbs + attributes[i]);
    }
  }

  if (!(typeof (dbStaff.email) === 'string')) {
    errors.push(typeErr + 'email is not a string');
  }
  if (!(dbStaff.email.length > 0)) {
    errors.push(empty + 'email');
  }

  if (!(typeof (dbStaff.name) === 'string')) {
    errors.push(typeErr + 'name is not a string');
  }
  if (!(dbStaff.name.length > 0)) {
    errors.push(empty + 'name');
  }

  if (!(Array.isArray(dbStaff.canCreateCohortsInUnits))) {
    errors.push(typeErr + 'canCreateCohortsInUnits is not an array');
  }
  if (!(dbStaff.canCreateCohortsInUnits.length > 1)) {
    errors.push('not enough canCreateCohortsInUnits');
  }
  for (let i = 0; i < dbStaff.canCreateCohortsInUnits.length; i += 1) {
    if (!(typeof (dbStaff.canCreateCohortsInUnits[i]) === 'string')) {
      errors.push(typeErr + 'canCreateCohortsInUnits[' + i + '] is not a string');
    }
    if (!(dbStaff.canCreateCohortsInUnits[i].length > 0)) {
      errors.push(empty + 'canCreateCohortsInUnits[' + i + ']');
    }
  }

  if (!(Array.isArray(dbStaff.roles))) {
    errors.push(typeErr + 'roles is not an array');
  }
  if (!(dbStaff.roles.length > 1)) {
    errors.push('not enough roles');
  }
  for (let i = 0; i < dbStaff.roles.length; i += 1) {
    if (!(typeof (dbStaff.roles[i]) === 'string')) {
      errors.push(typeErr + 'roles[' + i + '] is not a string');
    }
    if (!(dbStaff.roles[i].length > 0)) {
      errors.push(empty + 'roles[' + i + ']');
    }
  }

  if (!(typeof (dbStaff.preferences) === 'object')) {
    errors.push(typeErr + 'preferences is not an object');
  }// precisions needed, are the attributes defined ?????

  if (!(typeof (dbStaff.lastActivity) === 'number')) {
    errors.push(typeErr + 'lastActivity is not a string');
  }// undefined possible ?

  if (errors.length === 0) return false;
  return errors;
}
