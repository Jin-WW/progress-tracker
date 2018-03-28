const submissionService = require('./submissionService');

submissionService.getLatestSubmissions()
  .then(submissionService.setSubmissionsWithTimeStamp)
  .then(submissionService.createSubmissionByDate)
  .then(submissionService.getDatesCounts.bind(this, 15))
  .then(submissionService.renderDates);






