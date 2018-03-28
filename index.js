const submissionService = require('./submissionService');

submissionService.getAndUpdateLatestSubmissions()
  .then(submissionService.createSubmissionByDate)
  .then(submissionService.getDatesCounts.bind(this, 14))
  .then(submissionService.renderDates);






