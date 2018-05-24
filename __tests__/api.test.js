'use strict';

const fetch = require('node-fetch');
const ds = require('.././tools/data-samples');
const cp = require('child_process');

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
  markings.generalComments = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'; // eslint-disable-line max-len
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

function wait(ms) {
  const start = new Date().getTime();
  let end = start;
  while (end < start + ms) {
    end = new Date().getTime();
  }
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

  describe('GET /api/:cohort/:studentId/', async () => {
    test('GET /api/1997PJS40/6 is OK for the moderator.', async () => {
      // Execute the shell command to restore datas.

      const command = cp.spawn('node', ['/var/www/html/projets/sums2017/tests/generate-simple-test-data.js', '-f', '--overwrite', '-n', 'restricted-tests-2']); // eslint-disable-line max-len

      // Uncomment the following function to see what do this command.
      /*
      command.stdout.on('data', (data) => {
        console.log('Message: ' + data);
      });
      */

      console.log('Restoration of datas.');
      command.on('close', () => {
        console.log('Restoration of datas complete.');
      });
      wait(15000); // Reset datas take a little too much time. If we don't do that, datas cannot be complete.

      const url = localhost + 'api/1997PJE40/6';

      // Here, we will see if access to this route is possible for someone who's not working on the project,
      // and check if everything is normal for the others.
      const fetchOptions = {
        method: 'GET',
        headers: {
          Authorization: 'Fake adrien',
        },
      };
      const response = await fetch(url, fetchOptions);

      expect(response.ok).toBeTruthy();
    });

    test('GET /api/1997PJS40/6 is OK for the supervisor.', async () => {
      const url = localhost + 'api/1997PJE40/6';

      const fetchOptions = {
        method: 'GET',
        headers: {
          Authorization: 'Fake axel',
        },
      };
      const response = await fetch(url, fetchOptions);

      expect(response.ok).toBeTruthy();
    });

    test('GET /api/1997PJS40/6 is not OK for someone else.', async () => {
      const url = localhost + 'api/1997PJE40/6';

      const fetchOptions = {
        method: 'GET',
        headers: {
          Authorization: 'Fake jack',
        },
      };
      const response = await fetch(url, fetchOptions);

      expect(response.ok).toBeFalsy();
    });

    test('Datas are correct for marker Adrien.', async () => {
      const url = localhost + 'api/1997PJE40/6';

      const fetchOptions = {
        method: 'GET',
        headers: {
          Authorization: 'Fake adrien',
        },
      };
      const response = await fetch(url, fetchOptions);

      const dataAdrien = await response.json();

      expect(dataAdrien).toEqual({
        student: '6',
        studentName: 'Shepler, Anibal',
        cohortId: '1997PJE40',
        title: 'fake-testing project',
        submitted: 'late',
        cohort: {
          year: 1997,
          unit: 'PJE40',
          closed: false,
          coordinators: [
            'adrien@fake.example.org',
          ],
        },
        markings: [
          {
            role: 'supervisor',
            email: 'axel@fake.example.org',
            name: 'Fake axel',
            finalizedMark: null,
          },
          {
            role: 'moderator',
            email: 'adrien@fake.example.org',
            version: 12,
            name: 'Fake adrien',
          },
        ],
      });
    });

    test('Datas are correct for marker Axel.', async () => {
      const url = localhost + 'api/1997PJE40/6';

      const fetchOptions = {
        method: 'GET',
        headers: {
          Authorization: 'Fake axel',
        },
      };
      const response = await fetch(url, fetchOptions);

      const dataAxel = await response.json();

      expect(dataAxel).toEqual({
        student: '6',
        studentName: 'Shepler, Anibal',
        cohortId: '1997PJE40',
        title: 'fake-testing project',
        submitted: 'late',
        cohort: {
          year: 1997,
          unit: 'PJE40',
          closed: false,
          coordinators: [
            'adrien@fake.example.org',
          ],
        },
        markings: [
          {
            role: 'supervisor',
            email: 'axel@fake.example.org',
            version: 11,
            name: 'Fake axel',
          },
          {
            role: 'moderator',
            email: 'adrien@fake.example.org',
            name: 'Fake adrien',
            finalizedMark: null,
          },
        ],
      });
    });

    test('`finalizedMark` for Adrien has been correctly created.', async () => {
      // Here, we will omplete marks for a project.

      const url = localhost + 'api/1997PJE40/6/adrien@fake.example.org';
      const fetchOptionsGET = {
        method: 'GET',
        headers: {
          Authorization: 'Fake adrien',
        },
      };
      let responseAdrien = await fetch(url, fetchOptionsGET);

      expect(responseAdrien.ok).toBeTruthy();

      let dataAdrien = await responseAdrien.json();
      let marking = createEmptyMarking(dataAdrien.project.cohort.markingForm, dataAdrien.version);
      let fetchOptionsPOST = {
        method: 'POST',
        body: JSON.stringify(marking),
        headers: {
          'Content-type': 'application/json',
          Authorization: 'Fake adrien',
        },
      };
      responseAdrien = await fetch(url, fetchOptionsPOST);

      expect(responseAdrien.ok).toBeTruthy();
      expect(responseAdrien.status).toBe(200);

      responseAdrien = await fetch(url, fetchOptionsGET);
      const mark = 80;
      dataAdrien = await responseAdrien.json();
      marking = createMarkingsFinalized(dataAdrien.project.cohort.markingForm, dataAdrien.version, mark);
      fetchOptionsPOST = {
        method: 'POST',
        body: JSON.stringify(marking),
        headers: {
          'Content-type': 'application/json',
          Authorization: 'Fake adrien',
        },
      };
      responseAdrien = await fetch(url, fetchOptionsPOST);

      expect(responseAdrien.ok).toBeTruthy();
      expect(responseAdrien.status).toBe(200);

      responseAdrien = await fetch(url, fetchOptionsGET);
      dataAdrien = await responseAdrien.json();

      marking.version = dataAdrien.version;
      dataAdrien.finalizedMark = mark;
      fetchOptionsPOST.body = JSON.stringify(dataAdrien);

      await fetch(url, fetchOptionsPOST);

      expect(responseAdrien.ok).toBeTruthy();
      expect(responseAdrien.status).toBe(200);

      responseAdrien = await fetch(url, fetchOptionsGET);
      dataAdrien = await responseAdrien.json();
    });

    test('New datas are correct for marker Adrien.', async () => {
      // Here, we will check if new informations given by the routes are correct.

      const url = localhost + 'api/1997PJE40/6';

      const fetchOptionsGET = {
        method: 'GET',
        headers: {
          Authorization: 'Fake adrien',
        },
      };
      const responseAdrien = await fetch(url, fetchOptionsGET);

      expect(responseAdrien.ok).toBeTruthy();
      expect(responseAdrien.status).toBe(200);

      const dataAdrien = await responseAdrien.json();
      delete dataAdrien.markings[1].version;

      expect(dataAdrien).toEqual({
        student: '6',
        studentName: 'Shepler, Anibal',
        cohortId: '1997PJE40',
        title: 'fake-testing project',
        submitted: 'late',
        cohort: {
          year: 1997,
          unit: 'PJE40',
          closed: false,
          coordinators: [
            'adrien@fake.example.org',
          ],
        },
        markings: [
          {
            role: 'supervisor',
            email: 'axel@fake.example.org',
            name: 'Fake axel',
            finalizedMark: null,
          },
          {
            prizeJustification: '',
            plagiarismConcern: false,
            generalComments: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', // eslint-disable-line max-len
            marks: {
              'Evaluation against requirements': {
                note: '',
                mark: 80,
              },
              'Discussion of verification and validation': {
                mark: 80,
                note: '',
              },
              'Evidence of project planning and management': {
                note: '',
                mark: 80,
              },
              'Attributes of the solution': {
                note: '',
                mark: 80,
              },
              'Discussion of implementation': {
                note: '',
                mark: 80,
              },
              'Methodological approach': {
                note: '',
                mark: 80,
              },
              'Critical review of relevant literature': {
                note: '',
                mark: 80,
              },
              'Analysis and discussion of the IT design': {
                note: '',
                mark: 80,
              },
              'Structure and presentation': {
                mark: 80,
                note: '',
              },
              'Overall understanding and reflection': {
                note: '',
                mark: 80,
              },
              'Summary, conclusions and recommendations': {
                note: '',
                mark: 80,
              },
              'Statement of project’s context, aims and objectives': {
                note: '',
                mark: 80,
              },
              'Specification and discussion of the requirements': {
                note: '',
                mark: 80,
              },
            },
            misconductConcern: false,
            unfairnessComment: '',
            role: 'moderator',
            adjustment: 0,
            email: 'adrien@fake.example.org',
            finalizedMark: 80,
            prizeNominations: [],
            name: 'Fake adrien',
          },
        ],
      });
    });

    test('New datas are correct for marker Axel.', async () => {
      const url = localhost + 'api/1997PJE40/6';

      const fetchOptionsGET = {
        method: 'GET',
        headers: {
          Authorization: 'Fake axel',
        },
      };
      const responseAxel = await fetch(url, fetchOptionsGET);
      expect(responseAxel.ok).toBeTruthy();
      const dataAxel = await responseAxel.json();
      expect(dataAxel).toEqual({
        student: '6',
        studentName: 'Shepler, Anibal',
        cohortId: '1997PJE40',
        title: 'fake-testing project',
        submitted: 'late',
        cohort: {
          year: 1997,
          unit: 'PJE40',
          closed: false,
          coordinators: [
            'adrien@fake.example.org',
          ],
        },
        markings: [
          {
            version: 11,
            role: 'supervisor',
            email: 'axel@fake.example.org',
            name: 'Fake axel',
          },
          {
            role: 'moderator',
            email: 'adrien@fake.example.org',
            name: 'Fake adrien',
            finalizedMark: true,
          },
        ],
      });
    });

    test('`finalizedMark` for Axel has been correctly created.', async () => {
      // Here, we will create marks for the second marker.
      const url = localhost + 'api/1997PJE40/6/axel@fake.example.org';
      const fetchOptionsGET = {
        method: 'GET',
        headers: {
          Authorization: 'Fake axel',
        },
      };
      let responseAxel = await fetch(url, fetchOptionsGET);

      expect(responseAxel.ok).toBeTruthy();

      let dataAxel = await responseAxel.json();
      let marking = createEmptyMarking(dataAxel.project.cohort.markingForm, dataAxel.version);
      let fetchOptionsPOST = {
        method: 'POST',
        body: JSON.stringify(marking),
        headers: {
          'Content-type': 'application/json',
          Authorization: 'Fake axel',
        },
      };
      await fetch(url, fetchOptionsPOST);
      responseAxel = await fetch(url, fetchOptionsGET);
      const mark = 60;
      dataAxel = await responseAxel.json();
      marking = createMarkingsFinalized(dataAxel.project.cohort.markingForm, dataAxel.version, mark);

      fetchOptionsPOST = {
        method: 'POST',
        body: JSON.stringify(marking),
        headers: {
          'Content-type': 'application/json',
          Authorization: 'Fake axel',
        },
      };
      responseAxel = await fetch(url, fetchOptionsPOST);
      expect(responseAxel.status).toBe(200);
      expect(responseAxel.ok).toBeTruthy();
      responseAxel = await fetch(url, fetchOptionsGET);
      dataAxel = await responseAxel.json();

      marking.version = dataAxel.version;
      dataAxel.finalizedMark = mark;
      fetchOptionsPOST.body = JSON.stringify(dataAxel);

      await fetch(url, fetchOptionsPOST);
      expect(responseAxel.ok).toBeTruthy();
      expect(responseAxel.status).toBe(200);
      responseAxel = await fetch(url, fetchOptionsGET);
      dataAxel = await responseAxel.json();
    });

    test('Final datas are correct for marker Adrien', async () => {
      // Here, we will check again if new informations given by the routes are correct.
      const url = localhost + 'api/1997PJE40/6';

      const fetchOptionsGET = {
        method: 'GET',
        headers: {
          Authorization: 'Fake adrien',
        },
      };
      const responseAdrien = await fetch(url, fetchOptionsGET);
      expect(responseAdrien.ok).toBeTruthy();

      const dataAdrien = await responseAdrien.json();
      delete dataAdrien.markings[1].version;
      delete dataAdrien.markings[0].version;

      expect(dataAdrien).toEqual({
        student: '6',
        studentName: 'Shepler, Anibal',
        cohortId: '1997PJE40',
        title: 'fake-testing project',
        submitted: 'late',
        cohort: {
          year: 1997,
          unit: 'PJE40',
          closed: false,
          coordinators: [
            'adrien@fake.example.org',
          ],
        },
        markings: [
          {
            adjustment: 0,
            email: 'axel@fake.example.org',
            finalizedMark: 60,
            prizeNominations: [],
            prizeJustification: '',
            plagiarismConcern: false,
            generalComments: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', // eslint-disable-line max-len
            marks: {
              'Structure and presentation': {
                mark: 60,
                note: '',
              },
              'Overall understanding and reflection': {
                note: '',
                mark: 60,
              },
              'Summary, conclusions and recommendations': {
                note: '',
                mark: 60,
              },
              'Statement of project’s context, aims and objectives': {
                note: '',
                mark: 60,
              },
              'Specification and discussion of the requirements': {
                mark: 60,
                note: '',
              },
              'Evaluation against requirements': {
                mark: 60,
                note: '',
              },
              'Discussion of verification and validation': {
                note: '',
                mark: 60,
              },
              'Evidence of project planning and management': {
                note: '',
                mark: 60,
              },
              'Attributes of the solution': {
                note: '',
                mark: 60,
              },
              'Discussion of implementation': {
                note: '',
                mark: 60,
              },
              'Methodological approach': {
                mark: 60,
                note: '',
              },
              'Critical review of relevant literature': {
                mark: 60,
                note: '',
              },
              'Analysis and discussion of the IT design': {
                note: '',
                mark: 60,
              },
            },
            misconductConcern: false,
            unfairnessComment: '',
            role: 'supervisor',
            name: 'Fake axel',
          },
          {
            plagiarismConcern: false,
            generalComments: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', // eslint-disable-line
            marks: {
              'Structure and presentation': {
                mark: 80,
                note: '',
              },
              'Overall understanding and reflection': {
                note: '',
                mark: 80,
              },
              'Summary, conclusions and recommendations': {
                note: '',
                mark: 80,
              },
              'Statement of project’s context, aims and objectives': {
                mark: 80,
                note: '',
              },
              'Specification and discussion of the requirements': {
                mark: 80,
                note: '',
              },
              'Evaluation against requirements': {
                mark: 80,
                note: '',
              },
              'Discussion of verification and validation': {
                mark: 80,
                note: '',
              },
              'Evidence of project planning and management': {
                note: '',
                mark: 80,
              },
              'Attributes of the solution': {
                mark: 80,
                note: '',
              },
              'Discussion of implementation': {
                note: '',
                mark: 80,
              },
              'Methodological approach': {
                note: '',
                mark: 80,
              },
              'Critical review of relevant literature': {
                note: '',
                mark: 80,
              },
              'Analysis and discussion of the IT design': {
                mark: 80,
                note: '',
              },
            },
            misconductConcern: false,
            unfairnessComment: '',
            role: 'moderator',
            adjustment: 0,
            email: 'adrien@fake.example.org',
            finalizedMark: 80,
            prizeNominations: [],
            prizeJustification: '',
            name: 'Fake adrien',
          },
        ],
      });
    });

    test('Final datas are correct for marker Axel', async () => {
      const url = localhost + 'api/1997PJE40/6';

      const fetchOptionsGET = {
        method: 'GET',
        headers: {
          Authorization: 'Fake axel',
        },
      };

      const responseAxel = await fetch(url, fetchOptionsGET);
      expect(responseAxel.ok).toBeTruthy();
      const dataAxel = await responseAxel.json();
      delete dataAxel.markings[1].version;
      delete dataAxel.markings[0].version;

      expect(dataAxel).toEqual({
        student: '6',
        studentName: 'Shepler, Anibal',
        cohortId: '1997PJE40',
        title: 'fake-testing project',
        submitted: 'late',
        cohort: {
          year: 1997,
          unit: 'PJE40',
          closed: false,
          coordinators: [
            'adrien@fake.example.org',
          ],
        },
        markings: [
          {
            adjustment: 0,
            email: 'axel@fake.example.org',
            finalizedMark: 60,
            prizeNominations: [],
            prizeJustification: '',
            plagiarismConcern: false,
            generalComments: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', // eslint-disable-line
            marks: {
              'Critical review of relevant literature': {
                mark: 60,
                note: '',
              },
              'Analysis and discussion of the IT design': {
                mark: 60,
                note: '',
              },
              'Structure and presentation': {
                note: '',
                mark: 60,
              },
              'Overall understanding and reflection': {
                note: '',
                mark: 60,
              },
              'Summary, conclusions and recommendations': {
                note: '',
                mark: 60,
              },
              'Statement of project’s context, aims and objectives': {
                note: '',
                mark: 60,
              },
              'Specification and discussion of the requirements': {
                note: '',
                mark: 60,
              },
              'Evaluation against requirements': {
                note: '',
                mark: 60,
              },
              'Discussion of verification and validation': {
                note: '',
                mark: 60,
              },
              'Evidence of project planning and management': {
                mark: 60,
                note: '',
              },
              'Attributes of the solution': {
                note: '',
                mark: 60,
              },
              'Discussion of implementation': {
                mark: 60,
                note: '',
              },
              'Methodological approach': {
                note: '',
                mark: 60,
              },
            },
            misconductConcern: false,
            unfairnessComment: '',
            role: 'supervisor',
            name: 'Fake axel',
          },
          {
            email: 'adrien@fake.example.org',
            finalizedMark: 80,
            prizeNominations: [],
            prizeJustification: '',
            plagiarismConcern: false,
            generalComments: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', // eslint-disable-line
            marks: {
              'Discussion of verification and validation': {
                note: '',
                mark: 80,
              },
              'Evidence of project planning and management': {
                note: '',
                mark: 80,
              },
              'Attributes of the solution': {
                note: '',
                mark: 80,
              },
              'Discussion of implementation': {
                note: '',
                mark: 80,
              },
              'Methodological approach': {
                note: '',
                mark: 80,
              },
              'Critical review of relevant literature': {
                note: '',
                mark: 80,
              },
              'Analysis and discussion of the IT design': {
                note: '',
                mark: 80,
              },
              'Structure and presentation': {
                note: '',
                mark: 80,
              },
              'Overall understanding and reflection': {
                note: '',
                mark: 80,
              },
              'Summary, conclusions and recommendations': {
                note: '',
                mark: 80,
              },
              'Statement of project’s context, aims and objectives': {
                note: '',
                mark: 80,
              },
              'Specification and discussion of the requirements': {
                note: '',
                mark: 80,
              },
              'Evaluation against requirements': {
                note: '',
                mark: 80,
              },
            },
            misconductConcern: false,
            unfairnessComment: '',
            role: 'moderator',
            adjustment: 0,
            name: 'Fake adrien',
          },
        ],
      });
    });
  });
});
