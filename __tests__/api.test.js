'use strict';

const fetch = require('node-fetch');
const ds = require('.././tools/data-samples');

const localhost = 'http://localhost:8080/';

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
 *  createMarkingsFinalized creates a finalized marking, it uses the parameters
 *  to create each marking category with the same value `finalMark`.
 */
function createMarkingsFinalized(markingForm, version, finalMark) {
  const markings = {};

  markings.adjustment = 0;
  markings.generalComments = 'some comments '*50;
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

const cohort = '1997PJE40';
const studentId = 1001;
const markerEmail = 'axel@fake.example.org';

describe('Testing the API', () => {
  // We'll have to make a loop that goes through all the routes

  // TESTING WITH CORRECT FAKE EMAIL

  describe('GET /api/:cohort/:studentId/:markerEmail', async () => {
    test('GET on /api/'+ cohort +'/'+ studentId +'/'+ markerEmail +' is OK.', async () => {
      const emailParts = markerEmail.split('@');
      const url = localhost + 'api/'+ cohort +'/'+ studentId +'/'+ markerEmail;
      const fetchOptionsGET = {
        method: 'GET',
        headers: {
          Authorization: 'Fake '+ emailParts[0],
        },
      };
      const response = await fetch(url, fetchOptionsGET);

      expect(response.ok).toBeTruthy();
    });

    test('The data received is correct.', async () => {
      const emailParts = markerEmail.split('@');
      const url = localhost + 'api/'+ cohort +'/'+ studentId +'/'+ markerEmail;
      const fetchOptionsGET = {
        method: 'GET',
        headers: {
          Authorization: 'Fake '+ emailParts[0],
        },
      };
      let response = await fetch(url, fetchOptionsGET);

      /*
      * Here we create the whole data with which we are going to compare the data
      * received from the API.
      */

      const data = await response.json();

      // Creating default marks.

      const marking = createEmptyMarking(data.project.cohort.markingForm, data.version);

      // First POST to get version number.

      const fetchOptionsPOST = {
        method: 'POST',
        body: JSON.stringify(marking),
        headers: {
          'Content-type': 'application/json',
          Authorization: 'Fake '+ emailParts[0],
        },
      };

      const versionReturned = await fetch(url, fetchOptionsPOST);
      const dataVersion = await versionReturned.json();

      marking.role = data.role;
      marking.email = markerEmail;
      marking.name = 'Fake '+ emailParts[0];
      marking.version = dataVersion.version;
      marking.project = {
        student: '' + studentId,
        studentName: data.project.studentName,
        title: data.project.title,
      };
      marking.project.cohort = findCohortWithId(cohort);

      // Deleting useless attributes.

      delete marking.project.cohort.projectSubmissionDeadline;
      delete marking.project.cohort.markingSoftDeadline;
      delete marking.project.cohort.boardDate;
      delete marking.project.cohort.id;
      delete marking.project.cohort.projects;

      // End of creation.

      response = await fetch(url, fetchOptionsGET);

      expect(await response.json()).toEqual(marking);
    });
  });

  describe('POST /api/:cohort/:studentId/:markerEmail', async () => {
    test('POST on /api/' + cohort +'/'+ studentId +'/'+ markerEmail + ' is OK.', async () => {
      const emailParts = markerEmail.split('@');
      const url = localhost + 'api/'+ cohort +'/'+ studentId +'/'+ markerEmail;
      let fetchOptions = {
        method: 'GET',
        headers: {
          Authorization: 'Fake '+ emailParts[0],
        },
      };

      let response = await fetch(url, fetchOptions);
      const data = await response.json();

      fetchOptions = {
        method: 'POST',
        body: JSON.stringify(createEmptyMarking(data.project.cohort.markingForm, data.version)),
        headers: {
          'Content-type': 'application/json',
          Authorization: 'Fake ' + emailParts[0],
        },
      };
      response = await fetch(url, fetchOptions);

      expect(response.ok).toBeTruthy();
    });

    test('POST on /api/' + cohort +'/'+ studentId +'/'+ markerEmail + ' with wrong data raises a `Bad request` exception', async () => { // eslint-disable-line max-len
      const emailParts = markerEmail.split('@');
      const url = localhost + 'api/'+ cohort +'/'+ studentId +'/'+ markerEmail;
      /* fetchOptions = {
        method: 'GET',
        headers: {
          Authorization: 'Fake ' + emailParts[0],
        },
      };
      response = await fetch(url, fetchOptions);
      data = await response.json();
      let marking = createEmptyMarking(data.project.cohort.markingForm, data.version);
      marking.role = 'wrong_role'; */

      const fetchOptions = {
        method: 'POST',
        body: JSON.stringify(),
        headers: {
          'Content-type': 'application/json',
          Authorization: 'Fake ' + emailParts[0],
        },
      };
      const response = await fetch(url, fetchOptions);

      expect(response.ok).toBeFalsy();
      expect(response.status).toBe(400);
      expect(response.statusText).toBe('Bad Request');
    });

    test('POST on /api/' + cohort +'/'+ studentId +'/'+ markerEmail + ' with a wrong token raises a `Forbidden` exception', async () => { // eslint-disable-line max-len
      const emailParts = markerEmail.split('@');
      const url = localhost + 'api/'+ cohort +'/'+ studentId +'/'+ markerEmail;
      let fetchOptions = {
        method: 'GET',
        headers: {
          Authorization: 'Fake ' + emailParts[0],
        },
      };
      let response = await fetch(url, fetchOptions);
      const data = await response.json();

      fetchOptions = {
        method: 'POST',
        body: JSON.stringify(createEmptyMarking(data.project.cohort.markingForm, data.version)),
        headers: {
          'Content-type': 'application/json',
          Authorization: 'Fake people',
        },
      };
      response = await fetch(url, fetchOptions);

      expect(response.ok).toBeFalsy();
      expect(response.status).toBe(403);
      expect(response.statusText).toBe('Forbidden');
    });

    test('POST on /api/1997PJS40/3/axel@fake.example.org is OK with a really big string as note.', async () => {
      const emailParts = markerEmail.split('@');
      const url = localhost + 'api/'+ cohort +'/'+ studentId +'/'+ markerEmail;
      let fetchOptions = {
        method: 'GET',
        headers: {
          Authorization: 'Fake ' + emailParts[0],
        },
      };
      let response = await fetch(url, fetchOptions);
      const data = await response.json();
      const marking = createEmptyMarking(data.project.cohort.markingForm, data.version);
      marking.generalComments = reallyBigString();

      fetchOptions = {
        method: 'POST',
        body: JSON.stringify(marking),
        headers: {
          'Content-type': 'application/json',
          Authorization: 'Fake ' + emailParts[0],
        },
      };
      response = await fetch(url, fetchOptions);

      expect(response.ok).toBeTruthy();
    });
  });

  describe('Test of fake authentication', () => {
    test('GET on /api/ongoing-cohort is not OK without auth and raises an `Unauthorized` exception.', async () => {
      const url = localhost + 'api/ongoing-cohorts';
      const response = await fetch(url);

      expect(response.ok).toBeFalsy();
      expect(response.status).toBe(401);
      expect(response.statusText).toBe('Unauthorized');
    });

    test('GET on /api/ongoing-cohort is OK with fake auth.', async () => {
      const url = localhost + 'api/ongoing-cohorts';
      const fetchOptions = {
        method: 'GET',
        headers: { Authorization: 'Fake user' },
      };
      const response = await fetch(url, fetchOptions);

      expect(response.ok).toBeTruthy();
    });
  });

  describe('Test of the version number', async () => {
    test('GET on /api/1997PJS40/3/axel@fake.example.org is OK.', async () => {
      const url = localhost + 'api/1997PJS40/3/axel@fake.example.org';
      const fetchOptions = {
        method: 'GET',
        headers: {
          Authorization: 'Fake axel',
        },
      };
      const response = await fetch(url, fetchOptions);

      expect(response.ok).toBeTruthy();
    });

    test('The new version number is superior to the old version number.', async () => {
      const url = localhost + 'api/1997PJS40/3/axel@fake.example.org';
      let fetchOptions = {
        method: 'GET',
        headers: {
          Authorization: 'Fake axel',
        },
      };
      let response = await fetch(url, fetchOptions);
      const data = await response.json();

      fetchOptions = {
        method: 'POST',
        body: JSON.stringify(createEmptyMarking(data.project.cohort.markingForm, data.version)),
        headers: {
          'Content-type': 'application/json',
          Authorization: 'Fake axel',
        },
      };
      response = await fetch(url, fetchOptions);
      const postReturn = await response.json();

      expect(data.version).toBeLessThan(postReturn.version);
    });

    test('The version number changed and is correct.', async () => {
      const url = localhost + 'api/1997PJS40/3/axel@fake.example.org';
      let fetchOptions = {
        method: 'GET',
        headers: {
          Authorization: 'Fake axel',
        },
      };
      let response = await fetch(url, fetchOptions);
      let data = await response.json();

      fetchOptions = {
        method: 'POST',
        body: JSON.stringify(createEmptyMarking(data.project.cohort.markingForm, data.version)),
        headers: {
          'Content-type': 'application/json',
          Authorization: 'Fake axel',
        },
      };
      response = await fetch(url, fetchOptions);
      const postReturn = await response.json();

      fetchOptions = {
        method: 'GET',
        headers: {
          Authorization: 'Fake axel',
        },
      };
      response = await fetch(url, fetchOptions);
      data = await response.json();

      expect(data.version).toBe(postReturn.version);
    });

    test('POST on /api/1997PJS40/3/axel@fake.example.org is not OK with a wrong version number and raises a `Conflict` exception.', async () => { // eslint-disable-line max-len
      const url = localhost + 'api/1997PJS40/3/axel@fake.example.org';
      let fetchOptions = {
        method: 'GET',
        headers: {
          Authorization: 'Fake axel',
        },
      };
      let response = await fetch(url, fetchOptions);
      const data = await response.json();

      fetchOptions = {
        method: 'POST',
        body: JSON.stringify(createEmptyMarking(data.project.cohort.markingForm, data.version-1)),
        headers: {
          'Content-type': 'application/json',
          Authorization: 'Fake axel',
        },
      };
      response = await fetch(url, fetchOptions);

      expect(response.ok).toBeFalsy();
      expect(response.status).toBe(409);
      expect(response.statusText).toBe('Conflict');
    });
  });
});
