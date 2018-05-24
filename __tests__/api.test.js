'use strict';

const fetch = require('node-fetch');
const cp = require('child_process');
const tft = require('.././tools/tools-for-testing.js');

const localhost = 'http://localhost:8080/api/';
const cohort = '1997PJE40';
const studentId = 1001;
const markerEmail = 'axel@fake.example.org';

describe('Testing the API', () => {
  // We'll have to make a loop that goes through all the routes

  // TESTING WITH CORRECT FAKE EMAIL

  describe('GET /api/:cohort/:studentId/:markerEmail', () => {
    test('GET on /api/'+ cohort +'/'+ studentId +'/'+ markerEmail +' is OK.', async () => {
      const restoreData = cp.spawn('node', ['../sums2017/tests/generate-simple-test-data.js', '-f', '--overwrite', '-n', 'restricted-tests-2', '--erase']);  // eslint-disable-line max-len
      console.log('Restoration of datas.');
      restoreData.on('close', () => {
        console.log('Restoration of datas complete.');
      });
      tft.wait(5000);

      const url = localhost + cohort +'/'+ studentId +'/'+ markerEmail;
      const fetchOptionsGET = {
        method: 'GET',
        headers: {
          Authorization: tft.findStaffWithEmail(markerEmail),
        },
      };
      const response = await fetch(url, fetchOptionsGET);

      expect(response.ok).toBeTruthy();
    });

    test('The data received is correct.', async () => {
      const url = localhost + cohort +'/'+ studentId +'/'+ markerEmail;
      const marker = tft.findStaffWithEmail(markerEmail);
      const fetchOptionsGET = {
        method: 'GET',
        headers: {
          Authorization: marker,
        },
      };
      let response = await fetch(url, fetchOptionsGET);

      /*
      * Here we create the whole data with which we are going to compare the data
      * received from the API.
      */

      const data = await response.json();

      // Creating default marks.

      const marking = tft.createEmptyMarking(data.project.cohort.markingForm, data.version);

      // First POST to get version number.

      const fetchOptionsPOST = {
        method: 'POST',
        body: JSON.stringify(marking),
        headers: {
          'Content-type': 'application/json',
          Authorization: marker,
        },
      };

      const versionReturned = await fetch(url, fetchOptionsPOST);
      const dataVersion = await versionReturned.json();

      marking.role = data.role;
      marking.email = markerEmail;
      marking.name = marker;
      marking.version = dataVersion.version;
      marking.project = {
        student: '' + studentId,
        studentName: data.project.studentName,
        title: data.project.title,
      };
      marking.project.cohort = tft.findCohortWithId(cohort);

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

  describe('POST /api/:cohort/:studentId/:markerEmail', () => {
    test('POST on /api/' + cohort +'/'+ studentId +'/'+ markerEmail + ' is OK.', async () => {
      const url = localhost + cohort +'/'+ studentId +'/'+ markerEmail;
      const marker = tft.findStaffWithEmail(markerEmail);
      let fetchOptions = {
        method: 'GET',
        headers: {
          Authorization: marker,
        },
      };
      let response = await fetch(url, fetchOptions);
      const data = await response.json();

      fetchOptions = {
        method: 'POST',
        body: JSON.stringify(tft.createEmptyMarking(data.project.cohort.markingForm, data.version)),
        headers: {
          'Content-type': 'application/json',
          Authorization: marker,
        },
      };
      response = await fetch(url, fetchOptions);

      expect(response.ok).toBeTruthy();
    });

    test('POST on /api/' + cohort +'/'+ studentId +'/'+ markerEmail + ' with wrong data raises a `Bad request` exception', async () => { // eslint-disable-line max-len
      const url = localhost + cohort +'/'+ studentId +'/'+ markerEmail;
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
          Authorization: tft.findStaffWithEmail(markerEmail),
        },
      };
      const response = await fetch(url, fetchOptions);

      expect(response.ok).toBeFalsy();
      expect(response.status).toBe(400);
      expect(response.statusText).toBe('Bad Request');
    });

    test('POST on /api/' + cohort +'/'+ studentId +'/'+ markerEmail + ' with a wrong token raises a `Forbidden` exception', async () => { // eslint-disable-line max-len
      const url = localhost + cohort +'/'+ studentId +'/'+ markerEmail;
      let fetchOptions = {
        method: 'GET',
        headers: {
          Authorization: tft.findStaffWithEmail(markerEmail),
        },
      };
      let response = await fetch(url, fetchOptions);
      const data = await response.json();

      fetchOptions = {
        method: 'POST',
        body: JSON.stringify(tft.createEmptyMarking(data.project.cohort.markingForm, data.version)),
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

    test('POST on /api/'+ cohort +'/'+ studentId +'/'+ markerEmail +' is OK with a really big string as note.', async () => { // eslint-disable-line max-len
      const marker = tft.findStaffWithEmail(markerEmail);
      const url = localhost + cohort +'/'+ studentId +'/'+ markerEmail;
      let fetchOptions = {
        method: 'GET',
        headers: {
          Authorization: marker,
        },
      };
      let response = await fetch(url, fetchOptions);
      const data = await response.json();
      const marking = tft.createEmptyMarking(data.project.cohort.markingForm, data.version);
      marking.generalComments = tft.reallyBigString();

      fetchOptions = {
        method: 'POST',
        body: JSON.stringify(marking),
        headers: {
          'Content-type': 'application/json',
          Authorization: marker,
        },
      };
      response = await fetch(url, fetchOptions);

      expect(response.ok).toBeTruthy();
    });
  });

  describe('Test of fake authentication', () => {
    test('GET on /api/ongoing-cohort is not OK without auth and raises an `Unauthorized` exception.', async () => {
      const url = localhost + 'ongoing-cohorts';
      const response = await fetch(url);

      expect(response.ok).toBeFalsy();
      expect(response.status).toBe(401);
      expect(response.statusText).toBe('Unauthorized');
    });

    test('GET on /api/ongoing-cohort is OK with fake auth.', async () => {
      const url = localhost + 'ongoing-cohorts';
      const fetchOptions = {
        method: 'GET',
        headers: { Authorization: 'Fake jack' },
      };
      const response = await fetch(url, fetchOptions);

      expect(response.ok).toBeTruthy();
    });
  });

  describe('Test of the version number', () => {
    test('GET on /api/1997PJS40/1002/axel@fake.example.org is OK.', async () => {
      const url = localhost + '1997PJS40/1002/axel@fake.example.org';
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
      const url = localhost + '1997PJS40/1002/axel@fake.example.org';
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
        body: JSON.stringify(tft.createEmptyMarking(data.project.cohort.markingForm, data.version)),
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
      const url = localhost + '1997PJS40/1002/axel@fake.example.org';
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
        body: JSON.stringify(tft.createEmptyMarking(data.project.cohort.markingForm, data.version)),
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

    test('POST on /api/1997PJS40/1002/axel@fake.example.org is not OK with a wrong version number and raises a `Conflict` exception.', async () => { // eslint-disable-line max-len
      const url = localhost + '1997PJS40/1002/axel@fake.example.org';
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
        body: JSON.stringify(tft.createEmptyMarking(data.project.cohort.markingForm, data.version-1)),
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

  // describe('GET /api/ongoing-cohorts', () => {
  //   test('');
  // });

  describe('POST on /api/:cohort/:studentId/reconciliation', () => {
    test('POST on /api/1997PJE40/1005/reconciliation', async () => {
      await tft.markOnBothSidesForReconciliation();

      const url = localhost + '1997PJE40/1005/reconciliation';
      const marker = tft.findStaffWithEmail('axel@fake.example.org');
      const reconcileData = {
        type: 'reconcile',
        finalMark: 45,
        reconciliationComment: 'some comments some comments some comments some comments some comments some comments some comments some comments ', // eslint-disable-line max-len
      };
      const fetchOptions = {
        method: 'POST',
        body: JSON.stringify(reconcileData),
        headers: {
          'Content-type': 'application/json',
          Authorization: marker,
        },
      };

      const response = await fetch(url, fetchOptions);
      expect(response.ok).toBeTruthy();
      expect(response.status).toBe(204);
      expect(response.statusText).toBe('No Content');
    });
  });

  describe('POST on /api/:cohort/:studentId/feedback', () => {
    test('POST on /api/1997PJS40/1004/feedback', async () => {
      // First we have to finalize the markings of a project

      await tft.finalizeMarkOnBothSides('1997PJS40', '1004', ['axel@fake.example.org', 'jack@fake.example.org']);

      const url = localhost + '1997PJS40/1004/feedback';
      const marker = tft.findStaffWithEmail('axel@fake.example.org');
      const feedbackData = {
        type: 'moderateFeedback',
        feedbackForStudent: 'some comments some comments some comments some comments some comments some comments some comments some comments ', // eslint-disable-line max-len
      };
      const fetchOptions = {
        method: 'POST',
        body: JSON.stringify(feedbackData),
        headers: {
          'Content-type': 'application/json',
          Authorization: marker,
        },
      };

      const response = await fetch(url, fetchOptions);
      expect(response.ok).toBeTruthy();
      expect(response.status).toBe(204);
      expect(response.statusText).toBe('No Content');
    });
  });
});
