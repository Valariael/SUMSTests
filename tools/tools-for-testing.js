'use strict';

const fetch = require('node-fetch');
const ds = require('.././tools/data-samples');

const localhost = 'http://127.0.0.1:8080/api/';

/*
 *  createEmptyMarking creates the empty marking that is required to add a first mark,
 *  it uses the parameters to create each marking category as if they were empty.
 */
function createEmptyMarking(markingForm, version) {
  const markings = {};

  markings.adjustment = 0;
  markings.generalComments = '';
  markings.marks = {};
  for (let i=0; i<markingForm.categories.length; i+=1) {
    if (Object.hasOwnProperty.call(markingForm.categories[i], 'name')) {
      markings.marks['' + String(markingForm.categories[i].name)] = { note: '' };
    }
  }
  markings.misconductConcern = false;
  markings.plagiarismConcern = false;
  markings.prizeJustification = '';
  markings.prizeNominations = [];
  markings.unfairnessComment = '';
  markings.version = version;

  return markings;
}

/*
 *  createMarkings creates a marking before finalization, it uses the parameters
 *  to create each marking category with the same value `value`.
 */
function createMarkings(markingForm, version, value) {
  const markings = {};

  markings.adjustment = 0;
  markings.generalComments = 'some comments some comments some comments some comments some comments some comments some comments some comments some comments '; // eslint-disable-line max-len
  markings.marks = {};
  for (let i=0; i<markingForm.categories.length; i+=1) {
    if (Object.hasOwnProperty.call(markingForm.categories[i], 'name')) {
      markings.marks['' + String(markingForm.categories[i].name)] = { mark: value, note: '' };
    }
  }
  markings.misconductConcern = false;
  markings.plagiarismConcern = false;
  markings.prizeJustification = '';
  markings.prizeNominations = [];
  markings.unfairnessComment = '';
  markings.version = version;

  return markings;
}

/*
 *  createMarkingsFinalized creates a finalized marking, it uses the parameters
 *  to create each marking category with the same value `finalMark`.
 */
function createMarkingsFinalized(markingForm, version, finalMark) {
  const markings = {};

  markings.adjustment = 0;
  markings.generalComments = 'some comments some comments some comments some comments some comments some comments some comments some comments some comments '; // eslint-disable-line max-len
  markings.marks = {};
  for (let i=0; i<markingForm.categories.length; i+=1) {
    if (Object.hasOwnProperty.call(markingForm.categories[i], 'name')) {
      markings.marks['' + String(markingForm.categories[i].name)] = { mark: finalMark, note: '' };
    }
  }
  markings.misconductConcern = false;
  markings.plagiarismConcern = false;
  markings.prizeJustification = '';
  markings.prizeNominations = [];
  markings.unfairnessComment = '';
  markings.version = version;
  markings.finalizedMark = finalMark;

  return markings;
}

function reallyBigString() {
  let str = '';

  do {
    str += '.';
    if (str.length % 1000 === 0) {
      str += '1000';
    }
  } while (str.length < 15000);

  return str;
}

function findStaffWithEmail(email) {
  for (let i=0; i<ds.staff.length; i+=1) {
    if (ds.staff[i].email === email) return ds.staff[i].name;
  }
  return false;
}

function findCohortWithId(id) {
  for (let i=0; i<ds.cohorts.length; i+=1) {
    if (ds.cohorts[i].id === id) return ds.cohorts[i];
  }
  return false;
}

/*
 *  finalizeMarkOnBothSides marks the project of the student on both sides so that there's no need of
 *  a third marker or reconciliation.
*/
async function finalizeMarkOnBothSides(cohort, studentId, emails) {
  for (let i=0; i<emails.length; i+=1) {
    const url = localhost + cohort +'/'+ studentId +'/'+ emails[i];
    const marker = findStaffWithEmail(emails[i]);
    let fetchOptions = {
      method: 'GET',
      headers: {
        Authorization: marker,
      },
    };
    let response = await fetch(url, fetchOptions); // eslint-disable-line no-await-in-loop
    const data = await response.json(); // eslint-disable-line no-await-in-loop
    fetchOptions = {
      method: 'POST',
      body: JSON.stringify(createMarkings(data.project.cohort.markingForm, data.version, 60)),
      headers: {
        'Content-type': 'application/json',
        Authorization: marker,
      },
    };
    response = await fetch(url, fetchOptions); // eslint-disable-line no-await-in-loop
    const postReturn = await response.json(); // eslint-disable-line no-await-in-loop

    fetchOptions = {
      method: 'POST',
      body: JSON.stringify(createMarkingsFinalized(data.project.cohort.markingForm, postReturn.version, 60)),
      headers: {
        'Content-type': 'application/json',
        Authorization: marker,
      },
    };
    response = await fetch(url, fetchOptions); // eslint-disable-line no-await-in-loop
  }
}

/*
 *  markOnBothSidesForReconciliation marks the project of the student 5 on both so that
 *  a third marker or reconciliation is needed.
*/
async function markOnBothSidesForReconciliation() {
  let url = localhost + '1997PJE40/1005/axel@fake.example.org';
  let marker = findStaffWithEmail('axel@fake.example.org');
  let fetchOptions = {
    method: 'GET',
    headers: {
      Authorization: marker,
    },
  };

  let response = await fetch(url, fetchOptions);
  let data = await response.json();

  fetchOptions = {
    method: 'POST',
    body: JSON.stringify(createMarkings(data.project.cohort.markingForm, data.version, 35)),
    headers: {
      'Content-type': 'application/json',
      Authorization: marker,
    },
  };
  response = await fetch(url, fetchOptions);
  let postReturn = await response.json();

  fetchOptions = {
    method: 'POST',
    body: JSON.stringify(createMarkingsFinalized(data.project.cohort.markingForm, postReturn.version, 35)),
    headers: {
      'Content-type': 'application/json',
      Authorization: marker,
    },
  };
  response = await fetch(url, fetchOptions);

  url = localhost + '1997PJE40/1005/adrien@fake.example.org';
  marker = findStaffWithEmail('adrien@fake.example.org');
  fetchOptions = {
    method: 'GET',
    headers: {
      Authorization: marker,
    },
  };

  response = await fetch(url, fetchOptions);
  data = await response.json();

  fetchOptions = {
    method: 'POST',
    body: JSON.stringify(createMarkings(data.project.cohort.markingForm, data.version, 60)),
    headers: {
      'Content-type': 'application/json',
      Authorization: marker,
    },
  };
  response = await fetch(url, fetchOptions);
  postReturn = await response.json();

  fetchOptions = {
    method: 'POST',
    body: JSON.stringify(createMarkingsFinalized(data.project.cohort.markingForm, postReturn.version, 60)),
    headers: {
      'Content-type': 'application/json',
      Authorization: marker,
    },
  };
  response = await fetch(url, fetchOptions);
}

function wait(ms) {
  const start = new Date().getTime();
  let end = start;
  while (end < start + ms) {
    end = new Date().getTime();
  }
}

function optionsForFetch(type, marker, body) {
  const fetchOptions = {
    method: type,
    headers: {
      Authorization: marker,
    },
  };
  if (type === 'POST') {
    fetchOptions.headers['Content-type'] = 'application/json';
    fetchOptions.body = body;
  }

  return fetchOptions;
}

module.exports = {
  createEmptyMarking,
  createMarkings,
  createMarkingsFinalized,
  finalizeMarkOnBothSides,
  markOnBothSidesForReconciliation,
  findCohortWithId,
  findStaffWithEmail,
  reallyBigString,
  wait,
  optionsForFetch,
};
