const _ = require('lodash');
const moment = require('moment');
const prompt = require('prompt');
const config = require('./config.json');

const Network = require('./network');
const formatter = require('./formatter');
const storage = require('./storage');

let network;

function checkTokensAndSetupNetwork(){
  const credentials = {};
  try {
    config.TOKEN_NAMES.forEach(token => {
      credentials[token] = storage.get(token);
      if(!credentials[token]){
        throw new Error('no token');
      }
    });
    return Promise.resolve(credentials);
  }
  catch(e){
    return promptNewTokens();
  }
}

function getLatestSubmissions(credentials){
  network = new Network(credentials);
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

  return getSubmissions
    .catch(err => {
      if(err.response.status == '401'){
          return promptNewTokens()
            .then(getLatestSubmissions);
      }
      throw err;
    })
}

function promptNewTokens(){
  console.log('Invalid LeetCode Tokens');
  const schema = {properties: {}};
  config.TOKEN_NAMES.forEach(token => {
    schema.properties[token] = {
      message: `Please paste [${token}] from LeetCode cookies:`,
      required: true
    }
  });
  return new Promise((resolve, reject) => {
    prompt.get(schema, (err, credentials) => {
      if(err){
        return reject(err);
      }
      Object.keys(credentials)
        .forEach(token => {
          storage.set(token, credentials[token]);
        });
      return resolve(credentials);
    })
  });

}

function setSubmissionsWithTimeStamp(submissions){
  submissions.forEach(submission => {
    if(!submission.date){
      submission.date = formatter.convertRelativeTimeToTimestamp(submission.time, 'YYYY-MM-DD');
      submission.timestamp = formatter.convertRelativeTimeToTimestamp(submission.time);
    }
  });
  storage.set('submissions', submissions)
  return submissions;
}

function createSubmissionByDate(submissions){
  submissions = submissions.filter(submission => {
    return submission.status_display == 'Accepted'
  });

  const titles = {};
  const submissionsByDate = {};
  for(let i = submissions.length - 1; i >= 0; i--){
    const submission = submissions[i];
    if(titles[submission.title]){
      continue;
    }

    titles[submission.title] = true;
    if(!submissionsByDate[submission.date]){
      submissionsByDate[submission.date] = [submission];
    }
    else{
      submissionsByDate[submission.date].push(submission);
    }
  }

  return submissionsByDate;
}

function getDatesCounts(days, submissionsByDate){
  let dates = [];
  for(let i = 0; i < days; i++){
    const date = moment().subtract(i, 'day');
    dates.unshift(date);
  }
  return dates.map(date => {
    const submissions = submissionsByDate[date.format('YYYY-MM-DD')];
    let count = 0;
    if(submissions){
      count = submissions.length;
    }
    return {
      date: date.format('YYYY-MM-DD'),
      dayOfWeek: date.format('dddd'),
      count
    }
  });
}

function renderDates(datesObj){
  //find max first
  let max = 0;
  datesObj.forEach(date => {
    max = Math.max(max, date.count);
  });

  max = Math.max(max, 10);

  let days = datesObj.length;
  console.log("$".repeat(days * 3 + 1));

  const counts = datesObj.map(o => o.count);
  for(let j = max; j > 0; j--){
    let row = "║";
    for(let i = 0; i < days; i++){
      const count = datesObj[i].count;
      if(count >= j){
        row += "/\\";
      }
      else{
        if(j == 1 && count  == 0){
          row += "__";
        }
        else{
          row += "  ";
        }

      }
      if(i < days - 1) {
        row += " ";
      }
    }
    row += "║";
    console.log(row);
  }

  // print number row
  let numberRow = "║";
  for(let i = 0; i < days; i++) {
    if (counts[i] < 10) {
      numberRow += ' ';
    }
    numberRow += counts[i];
    if (i < days - 1) {
      numberRow += ' ';
    }
  }
  numberRow += "║";
  console.log(numberRow);

  // print day row
  let dayRows = "║";
  for(let i = 0; i < days; i++) {
    dayRows += datesObj[i].dayOfWeek.slice(0,2);
    if (i < days - 1) {
      dayRows += ' ';
    }
  }
  dayRows += "║";
  console.log(dayRows);


  console.log("#".repeat(days * 3 + 1));
  console.log("Start Date:", datesObj[0].date);
  console.log("End Date:  ", datesObj[datesObj.length - 1].date);
  console.log("#".repeat(days * 3 + 1));
}

module.exports = {
  checkTokensAndSetupNetwork,
  getLatestSubmissions,
  setSubmissionsWithTimeStamp,
  createSubmissionByDate,
  getDatesCounts,
  renderDates
};