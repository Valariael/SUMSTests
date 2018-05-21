'use strict';

const commandLineArgs = require('command-line-args');
const path = require('path');
const randomName = require('node-random-name');
const config = require('./server/config');
const tools = require('./server/tools');
const Datastore = require('@google-cloud/datastore');

const optionDefinitions = [
  { name: 'help', alias: 'h', type: Boolean },
  {
    name: 'namespace',
    alias: 'n',
    type: String,
    defaultValue: config.datastore.namespace,
  },
  {
    name: 'testing',
    alias: 't',
    type: Boolean,
  },
  {
    name: 'fake',
    alias: 'f',
    type: Boolean,
  },
  {
    name: 'overwrite',
    type: Boolean,
  },
  {
    name: 'erase',
    type: Boolean,
  },
];

function usage() {
  console.log(`Usage: node generate-simple-test-data

Options:

  -h, --help               Show this help

  -t
  --testing                Generate testing projects for Jack/Matt/Rich
                           at various stages of marking
  -f
  --fake                   Generate testing data for fake-authentication users.

  -n ns
  --namespace=ns           Set the datastore namespace to 'ns'

  --overwrite              Allow overwriting of existing entities in the datastore.
                           By default, will skip entities that are already there.

  --erase                  Erase all known entity kinds from the given namespace (DANGEROUS)
`.trim());
}

const options = commandLineArgs(optionDefinitions);

if (options.help) {
  usage();
  process.exit(0);
}

const pje40markingForm = require('./marking-criteria-2017-pje40');
const pjs40markingForm = require('./marking-criteria-2017-pjs40');
const pje40prizes = require('./prize-list-2017-pje40');
const pjs40prizes = require('./prize-list-2017-pjs40');
// const pje60markingForm = require('../documentation/test-data/marking-criteria-2017-pje60');
// const pjs60markingForm = require('../documentation/test-data/marking-criteria-2017-pjs60');
// const mscPrizes = require('../documentation/test-data/prize-list-2017-msc');

/* eslint-disable max-len */

/* initial data
 *
 *
 *   # #    # # ##### #   ##   #         #####    ##   #####   ##
 *   # ##   # #   #   #  #  #  #         #    #  #  #    #    #  #
 *   # # #  # #   #   # #    # #         #    # #    #   #   #    #
 *   # #  # # #   #   # ###### #         #    # ######   #   ######
 *   # #   ## #   #   # #    # #         #    # #    #   #   #    #
 *   # #    # #   #   # #    # ######    #####  #    #   #   #    #
 *
 *
 */

const staff = [];

staff.push({ email:'jacek.kopecky@port.ac.uk', name:'Jacek Kopecky' });
staff.push({ email:'matthew.dennis@port.ac.uk', name:'Matt Dennis' });
staff.push({ email:'rich.boakes@port.ac.uk', name:'Rich Boakes' });

const J = staff[0];
const M = staff[1];
const R = staff[2];

staff.push({ email:'aledermann4@gmail.com', name:'Axel Ledermann' });
staff.push({ email:'steel6869@gmail.com', name:'Adrien Muck' });

const students = [];

const cohorts = [
  {
    id: '1999PJE40',
    year: 1999,
    unit: 'PJE40',
    projectSubmissionDeadline: '2018-04-25',
    markingSoftDeadline: '2018-05-20',
    boardDate: '2018-06-01',
    coordinators: ['claudia.iacob@port.ac.uk', 'jacek.kopecky@port.ac.uk', 'matthew.dennis@port.ac.uk'],
    projects: [],
    closed: false,
    markingForm: {
      categories: pje40markingForm,
      prizes: pje40prizes,
    },
  },
  {
    id: '1999PJS40',
    year: 1999,
    unit: 'PJS40',
    projectSubmissionDeadline: '2018-04-25',
    markingSoftDeadline: '2018-05-20',
    boardDate: '2018-06-01',
    coordinators: ['claudia.iacob@port.ac.uk', 'jacek.kopecky@port.ac.uk', 'matthew.dennis@port.ac.uk'],
    projects: [],
    closed: false,
    markingForm: {
      categories: pjs40markingForm,
      prizes: pjs40prizes,
    },
  },
];

const cohortsForWriting = [].concat(cohorts);

/* generating
 *
 *
 *    ####  ###### #    # ###### #####    ##   ##### # #    #  ####
 *   #    # #      ##   # #      #    #  #  #    #   # ##   # #    #
 *   #      #####  # #  # #####  #    # #    #   #   # # #  # #
 *   #  ### #      #  # # #      #####  ######   #   # #  # # #  ###
 *   #    # #      #   ## #      #   #  #    #   #   # #   ## #    #
 *    ####  ###### #    # ###### #    # #    #   #   # #    #  ####
 *
 *
 */

// just generate valid data for now
// todo check that we have projects with every different status (home and project-overview have different statuses)

//    generate these (except we DO NOT generate those prefixed with --- yet)
//    staff predefined list of 3 ppl
//    students as a function makeStudent()
//    two cohorts, used in alternation
//      --- proj not submitted no markers
//      --- proj not submitted only supervisor (each of us)
//    proj not submitted supervisor + moderator (J+R, M+R)
//    following all submitted: late and not late (in alternation)
//    following both with J+M
//    following all that have marking done also have feedback to student
//    only supervisor marking done (with/out pConcern or mConcern, if so with comment)
//    only moderator marking done (with/out pConcern or mConcern, if so with comment)
//    following all J+R or M+J in alternation
// x  both done (with/out pConcern or mConcern, if so with comments)
//      both under 40, similar
// x    both under 40, wide (R) means should require reconciliation
// x      --- both under 40, similar ending at *9
// x    around 40, similar (R)
// x    around 40, wide (R)
// x    around 40, similar ending at 39 (R)
// x    both between 40 and 68, similar
// x    both between 40 and 68, wide (R)
// x    both between 40 and 68, similar ending at *9 (R)
// x    both between 40 and 68, wide ending at *9 (R)
// x    around 70, similar (R)
// x    around 70, wide (R)
// x    around 70, similar ending at 68.5 (R)
// x    both above 70, similar
// x    both above 70, wide (R)
// x    both above 70, wide ending at *9 (R)
// x      --- both above 70, similar ending at *9
// x  those above marked (R) reconciled in the middle with comment
// x  those above marked (R) with request for additional marker (A)
// x  the following with addl marker not having marked, or having marked (with/out concerns) (R2)
// x  those above marked (A) with one addl marker who isn't us
// x  those above marked (A) with one addl marker switched with supervisor
// x  the above marked with (R2), reconciled in the middle
// x  the above marked with (R2), with request for addl marker (A2)
// x  the following with addl2 marker not having marked, or having marked (with/out concerns) (R3)
// x  those above marked (A2) with one addl marker who isn't us
// x  those above marked (A2) with one addl marker switched with supervisor if that's one of us
// x  the above marked with (R3), reconciled in the middle
// x  one of the above marked with (R3) with request for addl marker (A3)
// x  several of the above that have a final mark with manual mark override
// x  one or two with two manual mark overrides
// x  several of the above that have a final mark with some feedbackForStudent
// x  several of the above with some feedbackForStudent with feedbackSent
// x  and then some with unfinished markings

const [createRandomStudent, createStudent, bumpStudent] = (() => { // eslint-disable-line no-unused-vars, // because of createStudent
  let lastStudentId = 0;

  function doCreateRandomStudent() {
    lastStudentId += 1;
    return doCreateStudent(
      '' + lastStudentId,
      randomName({ last: true, seed: lastStudentId }) +
      ', ' +
      randomName({ first: true, seed: lastStudentId }),
      `up${lastStudentId}@myport.example`,
    );
  }

  function doCreateStudent(id, name, email) {
    if (!id || !name || !email) throw new Error('missing id or name or email');
    const student = {
      id: '' + id,
      name,
      email,
    };
    students.push(student);
    return student;
  }

  function doBumpStudent(minID) {
    if (minID-1 > lastStudentId) {
      lastStudentId = minID-1;
    }
  }

  return [doCreateRandomStudent, doCreateStudent, doBumpStudent];
})();


const [nextCohort, setCohort] = (() => {
  let lastCohort = Infinity;
  let theCohort = null;
  return [
    function () {
      if (theCohort) {
        // requested cohort
        const tmp = theCohort;
        theCohort = null;
        return tmp;
      }

      if (lastCohort >= cohorts.length - 1) {
        lastCohort = 0;
      } else {
        lastCohort += 1;
      }

      return cohorts[lastCohort];
    },
    function (c) {
      theCohort = c;
    },
  ];
})();

const [nextLate, setLate] = (() => {
  let lastLate = true;
  let theLate = null;
  return [
    function () {
      if (theLate) {
        const tmp = theLate.value;
        theLate = null;
        return tmp;
      }

      lastLate = !lastLate;
      return lastLate;
    },
    function (l) {
      theLate = { value: l };
    },
  ];
})();

function createProject(
  title, markers, markings = [], finalMark, requestAdditionalMarker,
  markOverrideComments, feedbackForStudent, feedbackSent,
) {
  const cohort = nextCohort();
  const student = createRandomStudent();
  const late = nextLate();

  return createProjectFull(
    cohort, student, late,
    title, markers, markings, finalMark, requestAdditionalMarker,
    markOverrideComments, feedbackForStudent, feedbackSent,
  );
}

function createProjectFull(
  cohort, student, late,
  title, markers, markings = [], finalMark, requestAdditionalMarker,
  markOverrideComments, feedbackForStudent, feedbackSent,
) {
  let submitted;
  if (late != null) submitted = late ? 'late' : 'yes';

  const project = {
    student: student.id,
    title,
    submitted,
    finalMark,
    markOverrideComments,
    feedbackForStudent,
    feedbackSent,
    requestAdditionalMarker,
    markings: [],
  };

  for (let i = 0; i < markers.length; i += 1) {
    const marker = markers[i];
    let marking = Object.assign({
      role: ['supervisor', 'moderator'][i] || 'additional',
      email: marker.email,
      version: generateVersion(),
    }, markings[i] || {});
    if (marking.finalizedMark != null && marking.marks == null) {
      marking = genPartMarks(marking, cohort.markingForm);
    }

    project.markings.push(marking);
  }

  cohort.projects.push(project);
  return project;
}

let lastVersion = 0;
function generateVersion() {
  lastVersion += 1;
  return lastVersion;
}

/*
 * generates override comments
 * genOverride(true)  -> generates one automatic reconciliation override comment
 * genOverride(true, [42])  -> generates one automatic reconciliation comment and one manual override comment
 * genOverride(false, [42])  -> generates one manual override comment, previous mark 42
 * genOverride(false, [42, 52])  -> generates two manual override comments, previous marks 42 and then 52
 */
function genOverride(auto = true, arrManual = []) {
  const retval = [];
  if (auto) {
    retval.push({
      comment: 'we agreed',
      automatic: 'reconcilliation',
    });
  }

  for (const manual of arrManual) {
    retval.push({
      comment: `override from ${manual}`,
      previousFinalMark: manual,
    });
  }

  return retval;
}

function genMK(finalizedMark, plagiarismComment, unfairnessComment) {
  return {
    finalizedMark,
    generalComments: finalizedMark == null ? undefined : `some
      l kjewoi ngoin bfdso nbfsdoi nbfsdoi lknbdfoi nklbsfdong enough
      eiowt oigren brehui nbfdhionkjbdf oilkdfb jiolkdfbohi mments`,
    plagiarismConcern: !!plagiarismComment || undefined,
    misconductConcern: !!unfairnessComment || undefined,
    unfairnessComment: unfairnessComment || plagiarismComment,
    prizeNominations: [],
  };
}

function genPartMarks(marking, markingForm, targetMark) {
  if (targetMark == null) targetMark = marking.finalizedMark;
  const retval = Object.assign({}, marking);

  const assignedMark = Math.round(targetMark / 5) * 5;
  const adjustment = targetMark - assignedMark;

  retval.marks = {};

  for (const cat of markingForm.categories) {
    retval.marks[cat.name] = {
      mark: assignedMark,
    };
  }

  retval.adjustment = adjustment;

  return retval;
}

const mks = (() => {
  let lastMarkers = [M, J];
  return function () { // next markers
    lastMarkers = [lastMarkers[1], lastMarkers[0]];
    return lastMarkers;
  };
})();

function generateData() {
  /* eslint-disable no-unused-vars */
  const mk10 = genMK(10);
  const mk20 = genMK(20);
  const mk26 = genMK(26);
  const mk32 = genMK(32);
  const mk37 = genMK(37);
  const mk40 = genMK(40);
  const mk41 = genMK(41);
  const mk50 = genMK(50);
  const mk57 = genMK(57);
  const mk65 = genMK(65);
  const mk70 = genMK(70);
  const mk71 = genMK(71);
  const mk73 = genMK(73);
  const mk80 = genMK(80);
  const mk99 = genMK(99);
  const mk43p = genMK(43, 'did something bad');
  const mk45m = genMK(45, undefined, 'did something bad');

  // part-done marks for cohort 0
  setCohort(0);
  const cohort = nextCohort();
  const mk65cohort0partDone = genPartMarks(mk65, cohort.markingForm);
  mk65cohort0partDone.finalizedMark = null;

  // find compulsory marking criterion
  const compulsoryCriterion = pje40markingForm.find((c) => c.compulsory);

  // failed because of compulsory criterion
  const mk38cohort0failedCompulsory = genPartMarks(mk50, cohort.markingForm);
  mk38cohort0failedCompulsory.marks[compulsoryCriterion.name].mark = 35;
  mk38cohort0failedCompulsory.finalizedMark = 38;
  mk38cohort0failedCompulsory.finalizedMarkIfNoCategoryWasCompulsory = 45;
  /* eslint-enable no-unused-vars */

  if (options.testing) {
    bumpStudent(100000);
    setLate(undefined);
    createProject('proj not submitted, supervisor + moderator (J+R)', [J, R]);
    setLate(undefined);
    createProject('proj not submitted, supervisor + moderator (M+R)', [M, R]);

    createProject('only sup done', [J, M], [mk50]);
    createProject('only mod done', [J, M], [null, mk50]);
    createProject('only sup done', [M, J], [mk50]);
    createProject('only mod done', [M, J], [null, mk50]);
    createProject('only sup done', [M, R], [mk50]);
    createProject('only mod done', [R, J], [null, mk50]);

    setCohort(0);
    createProject('only sup done, the other almost-done', [J, M], [mk57, mk65cohort0partDone]);
    setCohort(0);
    createProject('only mod done, the other almost-done', [J, M], [mk65cohort0partDone, mk57]);
    setCohort(0);
    createProject('only sup done, the other almost-done', [M, J], [mk57, mk65cohort0partDone]);
    setCohort(0);
    createProject('only mod done, the other almost-done', [M, J], [mk65cohort0partDone, mk57]);

    setCohort(0);
    createProject('both done, one failed due to compulsory', [M, J], [mk38cohort0failedCompulsory, mk57]);
    setCohort(0);
    createProject('both done, one failed due to compulsory', [J, M], [mk38cohort0failedCompulsory, mk57]);

    setCohort(0);
    createProject('both done, both failed due to compulsory', [M, J], [mk38cohort0failedCompulsory, mk38cohort0failedCompulsory]);
    setCohort(0);
    createProject('both done, both failed due to compulsory', [J, M], [mk38cohort0failedCompulsory, mk38cohort0failedCompulsory]);

    createProject('only sup done (plagiarism)', [J, M], [mk43p]);
    createProject('only mod done (plagiarism)', [J, M], [null, mk43p]);
    createProject('only sup done (plagiarism)', [M, J], [mk43p]);
    createProject('only mod done (plagiarism)', [M, J], [null, mk43p]);

    createProject('only sup done (misconduct)', [J, M], [mk45m]);
    createProject('only mod done (misconduct)', [J, M], [null, mk45m]);
    createProject('only sup done (misconduct)', [M, J], [mk45m]);
    createProject('only mod done (misconduct)', [M, J], [null, mk45m]);

    // projects with both markers done

    createProject('both under 40, similar', mks(), [mk37, mk32], 35);
    createProject('both under 40, wide (R)', mks(), [mk37, mk20]);
    createProject('both under 40, wide (R35)', mks(), [mk37, mk20], 35, false, genOverride());
    createProject('both under 40, wide (Radd)', mks(), [mk37, mk20], undefined, true);

    createProject('both under 40, similar end at *9 (R)', mks(), [mk32, mk26]);
    createProject('both under 40, similar end at *9 (R28)', mks(), [mk32, mk26], 28, false, genOverride());
    createProject('both under 40, similar end at *9 (Radd)', mks(), [mk32, mk26], undefined, true);

    createProject('around 40, similar (R)', mks(), [mk37, mk40]);
    createProject('around 40, similar (R37)', mks(), [mk37, mk40], 37, false, genOverride());
    createProject('around 40, similar (Radd)', mks(), [mk37, mk40], undefined, true);

    createProject('around 40, wide (R)', mks(), [mk37, mk50]);
    createProject('around 40, wide (R40)', mks(), [mk37, mk50], 40, false, genOverride());
    createProject('around 40, wide (Radd)', mks(), [mk37, mk50], undefined, true);

    createProject('around 40, similar end at 39 (R)', mks(), [mk37, mk41]);
    createProject('around 40, similar end at 39 (R38)', mks(), [mk37, mk41], 38, false, genOverride());
    createProject('around 40, similar end at 39 (Radd)', mks(), [mk37, mk41], undefined, true);

    createProject('between 40 and 68, similar', mks(), [mk57, mk65], 61);

    createProject('marked, not Jack', [M, R], [mk57, mk65], 61);
    createProject('marked, not Matt', [J, R], [mk57, mk65], 61);

    createProject('third marker, third not marked', [J, M, R], [mk41, mk57, null]);
    createProject('third marker, third not marked', [M, R, J], [mk41, mk57, null]);
    createProject('third marker, third not marked', [R, J, M], [mk41, mk57, null]);

    createProject('third marker, all marked, not rec', [J, M, R], [mk41, mk57, mk50]);
    createProject('third marker, all marked, not rec', [M, R, J], [mk41, mk57, mk50]);
    createProject('third marker, all marked, not rec', [R, J, M], [mk41, mk57, mk50]);
  }

  if (options.fake) {
    bumpStudent(1000);
    cohorts.length = 0;
    cohorts.push({
      id: '1997PJE40',
      year: 1997,
      unit: 'PJE40',
      projectSubmissionDeadline: '1998-04-25',
      markingSoftDeadline: '1998-05-20',
      boardDate: '1998-06-01',
      coordinators: ['adrien@fake.example.org'],
      projects: [],
      closed: false,
      markingForm: {
        categories: pje40markingForm,
        prizes: pje40prizes,
      },
    });
    cohorts.push({
      id: '1997PJS40',
      year: 1997,
      unit: 'PJS40',
      projectSubmissionDeadline: '1998-04-25',
      markingSoftDeadline: '1998-05-20',
      boardDate: '1998-06-01',
      coordinators: ['axel@fake.example.org'],
      projects: [],
      closed: false,
      markingForm: {
        categories: pjs40markingForm,
        prizes: pjs40prizes,
      },
    });

    cohortsForWriting.length = 0;
    cohortsForWriting[0] = cohorts[0];
    cohortsForWriting[1] = cohorts[1];

    staff.length = 0;
    staff.push({ email:'jack@fake.example.org', name:'Fake jack' });
    staff.push({ email:'adrien@fake.example.org', name:'Fake adrien' });
    staff.push({ email:'axel@fake.example.org', name:'Fake axel' });

    const s = (i) => staff[i % staff.length];
    for (let i=0; i<staff.length; i+=1) {
      for (let j=0; j<2; j+=1) {
        createProject('fake-testing project', [s(i), s(i+j+1)]);
      }
    }
  }
}

// x  following all that have marking done also have feedback to students
// x  following all J+R or M+J in alternation
// x  both done (--- with/out pConcern or mConcern, if so with comments)
//      both between 40 and 68, similar
// x      the above with concerns
// x    both between 40 and 68, wide (R)
// x    both between 40 and 68, similar ending at *9 (R)
// x    both between 40 and 68, wide ending at *9 (R)
// x    around 70, similar (R)
// x    around 70, wide (R)
// x    around 70, similar ending at 68.5 (R)
// x    both above 70, similar
// x    both above 70, wide (R)
// x    both above 70, wide ending at *9 (R)
// x      --- both above 70, similar ending at *9
// x  those above marked (R) reconciled in the middle with comment
// x  those above marked (R) with request for additional marker (A)
// x  the following with addl marker not having marked, or having marked (with/out concerns) (R2)
// x  those above marked (A) with one addl marker who isn't us
// x  those above marked (A) with one addl marker switched with supervisor
// x  the above marked with (R2), reconciled in the middle
// x  the above marked with (R2), with request for addl marker (A2)
// x  the following with addl2 marker not having marked, or having marked (with/out concerns) (R3)
// x  those above marked (A2) with one addl marker who isn't us
// x  those above marked (A2) with one addl marker switched with supervisor if that's one of us
// x  the above marked with (R3), reconciled in the middle
// x  one of the above marked with (R3) with request for addl marker (A3)
// x  several of the above that have a final mark with manual mark override
// x  one or two with two manual mark overrides
// x  several of the above that have a final mark with some feedbackForStudent
// x  several of the above with some feedbackForStudent with feedbackSent
// x  and then some with unfinished markings

/* write out
 *
 *
 *   #    # #####  # ##### ######     ####  #    # #####
 *   #    # #    # #   #   #         #    # #    #   #
 *   #    # #    # #   #   #####     #    # #    #   #
 *   # ## # #####  #   #   #         #    # #    #   #
 *   ##  ## #   #  #   #   #         #    # #    #   #
 *   #    # #    # #   #   ######     ####   ####    #
 *
 *
 */

async function deleteFromDatastore() {
  console.log(`ERASING THE NAMESPACE ${options.namespace}`);
  const query = datastore.createQuery()
    .select('__key__');
  const results = await datastore.runQuery(query);
  const keys = results[0].map(e => e[datastore.KEY]).filter(key => config.datastore.includedIndexes[key.kind] != null);
  console.log(`deleting ${keys.length} entities`);
  await datastore.delete(keys);
  console.log('deletion done');
}

/* eslint-disable no-await-in-loop */
async function writeIntoDatastore() {
  for (const s of staff) await datastoreWrite(s, 'Staff', s.email);
  for (const s of students) await datastoreWrite(s, 'Student', s.id);

  for (const c of cohortsForWriting) {
    const cohortToStore = Object.assign({}, c);
    delete cohortToStore.projects;
    delete cohortToStore.id;
    await datastoreWrite(cohortToStore, 'Cohort', c.id);

    for (const p of c.projects) {
      const projToStore = Object.assign({}, p);
      delete projToStore.markings;
      delete projToStore.id;
      projToStore.cohortId = c.id;
      projToStore.markers = p.markings.map((m) => m.email);
      const projKey = await datastoreWrite(projToStore, 'Project', `${c.id}/${p.student}`);

      for (const m of (p.markings || [])) {
        const markToStore = Object.assign({}, m);
        await datastoreWrite(markToStore, 'Marking', `${c.id}/${p.student}/${m.email}`, projKey);
      }
    }
  }
}
/* eslint-enable no-await-in-loop */


/* helpers
 *
 *
 *   #    # ###### #      #####  ###### #####   ####
 *   #    # #      #      #    # #      #    # #
 *   ###### #####  #      #    # #####  #    #  ####
 *   #    # #      #      #####  #      #####       #
 *   #    # #      #      #      #      #   #  #    #
 *   #    # ###### ###### #      ###### #    #  ####
 *
 *
 */


process.env.GOOGLE_APPLICATION_CREDENTIALS =
  path.resolve(__dirname, './../server', config.datastore.serviceAccountKeyFile);

const datastore = new Datastore({
  projectId: config.datastore.projectId,
  namespace: options.namespace,
});

async function datastoreWrite(data, kind, id, ancestor = []) {
  const keyPath = ancestor.concat([kind, id]);
  const key = datastore.key(keyPath);
  const excludeFromIndexes = tools.generateExcludeFromIndexes(data, config.datastore.includedIndexes[kind]);
  const e = {
    key,
    excludeFromIndexes,
    data,
  };
  console.log(`saving ${kind} ${id}`);
  if (options.overwrite) {
    await datastore.save(e);
  } else {
    try {
      await datastore.insert(e);
    } catch (err) {
      console.log('already exists, not overwriting');
    }
  }
  return keyPath;
}

process.on('uncaughtException', (e) => {
  // console.error('ERROR:', e.message || e);
  console.error('ERROR:', e);
  process.exit(1);
});


/* run
 *
 *
 *   #####  #    # #    #
 *   #    # #    # ##   #
 *   #    # #    # # #  #
 *   #####  #    # #  # #
 *   #   #  #    # #   ##
 *   #    #  ####  #    #
 *
 *
 */


console.log('generating');
generateData();

console.log(`saving in datastore in namespace ${options.namespace}`);
console.time('datastore save done');

async function main() {
  try {
    if (options.erase) {
      await deleteFromDatastore();
    }
    await writeIntoDatastore();
    console.timeEnd('datastore save done');
  } catch (e) {
    console.error('something failed', e);
  }
}

main();
