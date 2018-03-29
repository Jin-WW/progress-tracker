const submissionService = require('./submissionService');

submissionService.checkTokensAndSetupNetwork()
  .then(submissionService.getLatestSubmissions)
  .then(submissionService.setSubmissionsWithTimeStamp)
  .then(submissionService.createSubmissionByDate)
  .then(submissionService.getDatesCounts.bind(this, 15))
  .then(submissionService.renderDates)
  .catch(err => {
    console.log(err);
  });






