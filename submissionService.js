const _ = require('lodash');

const Network = require('./network');
const formatter = require('./formatter');
const storage = require('./storage');

const csrftoken = storage.get('csrftoken');
const LEETCODE_SESSION = storage.get('LEETCODE_SESSION');
const credentials = {csrftoken, LEETCODE_SESSION};
const network = new Network(credentials);

function getAndUpdateLatestSubmissions(){
  const submissions = storage.get('submissions');

  let getSubmissions;
  if(!submissions){
    //get all submissions
    getSubmissions = network.getAllSubmissions();
  }
  else{
    //get submission only when needed
    const lastSubmission = submissions[0];
    getSubmissions = network.getAllSubmissions(function(response){
      const foundIndex = _.findIndex(response.submissions_dump, sub => sub.url == lastSubmission.url);
      if(foundIndex !== -1){
        return {
          stop: true,
          result: response.submissions_dump.slice(0, foundIndex)
        }
      }
      else{
        return { stop: false };
      }
    })
      .then(newSubmissions => {
        return newSubmissions.concat(submissions);
      })
  }

  getSubmissions
    .then(submissions => {
      storage.set('submissions', submissions)
      return submissions;
    })
    .then(submissions => {

    });
}

function createSubmissionByDate(submission){

}

module.exports = {
  getAndUpdateLatestSubmissions,
  createSubmissionByDate
};