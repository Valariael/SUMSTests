'use strict';

// We should do a loop that goes through all the entities
// Before entering the function, check that the url matches (see splitURL)

const attrAbs = 'attribute absent : ';
const typeErr = 'incorrect attribute type : ';
const empty = 'should not be empty : ';

function checkCohortStructure(dbCohort) {
  const errors = [];
  const dateRegexp = new RegExp(/^\d{4}[-](0?[1-9]|1[012])[-](0?[1-9]|[12][0-9]|3[01])$/);

  if (!Object.prototype.hasOwnProperty.call(dbCohort, 'id')) {
    errors.push(attrAbs + 'id');
  }
  if (!Object.prototype.hasOwnProperty.call(dbCohort, 'year')) {
    errors.push(attrAbs + 'year');
  }
  if (!Object.prototype.hasOwnProperty.call(dbCohort, 'closed')) {
    errors.push(attrAbs + 'closed');
  }
  if (!Object.prototype.hasOwnProperty.call(dbCohort, 'coordinators')) {
    errors.push(attrAbs + 'coordinators');
  }
  if (!Object.prototype.hasOwnProperty.call(dbCohort, 'projectSubmissionDeadline')) {
    errors.push(attrAbs + 'projectSubmissionDeadline');
  }
  if (!Object.prototype.hasOwnProperty.call(dbCohort, 'unit')) {
    errors.push(attrAbs + 'unit');
  }
  if (!Object.prototype.hasOwnProperty.call(dbCohort, 'markingForm')) {
    errors.push(attrAbs + 'markingForm');
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

function checkProjectStructure(dbProject) {
  const errors = [];

  if (!Object.prototype.hasOwnProperty.call(dbProject, 'id')) {
    errors.push(attrAbs + 'id');
  }
  if (!Object.prototype.hasOwnProperty.call(dbProject, 'student')) {
    errors.push(attrAbs + 'student');
  }
  if (!Object.prototype.hasOwnProperty.call(dbProject, 'cohortId')) {
    errors.push(attrAbs + 'cohortId');
  }
  if (!Object.prototype.hasOwnProperty.call(dbProject, 'title')) {
    errors.push(attrAbs + 'title');
  }
  if (!Object.prototype.hasOwnProperty.call(dbProject, 'submitted')) {
    errors.push(attrAbs + 'submitted');
  }
  if (!Object.prototype.hasOwnProperty.call(dbProject, 'finalMark')) {
    errors.push(attrAbs + 'finalMark');
  }
  if (!Object.prototype.hasOwnProperty.call(dbProject, 'markers')) {
    errors.push(attrAbs + 'markers');
  }
  if (!Object.prototype.hasOwnProperty.call(dbProject, 'markOverrideComments')) {
    errors.push(attrAbs + 'markOverrideComments');
  }
  if (!Object.prototype.hasOwnProperty.call(dbProject, 'unfairnessConcern')) {
    errors.push(attrAbs + 'unfairnessConcern');
  }
  if (!Object.prototype.hasOwnProperty.call(dbProject, 'unfairnessComment')) {
    errors.push(attrAbs + 'unfairnessComment');
  }
  if (!Object.prototype.hasOwnProperty.call(dbProject, 'feedbackForStudent')) {
    errors.push(attrAbs + 'feedbackForStudent');
  }
  if (!Object.prototype.hasOwnProperty.call(dbProject, 'feedbackSent')) {
    errors.push(attrAbs + 'feedbackSent');
  }
  if (!Object.prototype.hasOwnProperty.call(dbProject, 'requestAdditionalMarker')) {
    errors.push(attrAbs + 'requestAdditionalMarker');
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
}

// const attrAbs = 'attribute absent : ';
// const typeErr = 'incorrect attribute type : ';
// const empty = 'should not be empty : ';
