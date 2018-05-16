'use strict';

// We should do a loop that goes through all the entities
// Before entering the function, check that the url matches (see splitURL)

function checkCohortStructure(dbCohort) {
  const errors = [];
  const attrAbs = 'attribute absent : ';
  const typeErr = 'incorrect attribute type : ';
  const empty = 'should not be empty : ';
  const dateRegexp = new RegExp(/^\d{4}[-](0?[1-9]|1[012])[-](0?[1-9]|[12][0-9]|3[01])$/);

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

  if (!(typeof (dbCohort.closed) === 'boolean')) {
    errors.push(typeErr + 'closed is not a boolean');
  }

  if (!(typeof (dbCohort.year) === 'number')) {
    errors.push(typeErr + 'year is not a number');
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
  if (dbCohort.unit === '') {
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

      if (level.positives === '' && level.negatives === '') {
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

    if (errors.length === 0) return false;
    return errors;
  }
}
