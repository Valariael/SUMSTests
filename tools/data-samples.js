const cohorts = [];
const staff = [];

const pje40markingForm = require('./marking-criteria-2017-pje40');
const pjs40markingForm = require('./marking-criteria-2017-pjs40');
const pje40prizes = require('./prize-list-2017-pje40');
const pjs40prizes = require('./prize-list-2017-pjs40');

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

staff.length = 0;
staff.push({ email:'jack@fake.example.org', name:'Fake jack' });
staff.push({ email:'adrien@fake.example.org', name:'Fake adrien' });
staff.push({ email:'axel@fake.example.org', name:'Fake axel' });

module.exports = {
  staff,
  cohorts,
};
