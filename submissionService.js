const _ = require('lodash');
const moment = require('moment');

const Network = require('./network');
const formatter = require('./formatter');
const storage = require('./storage');

const csrftoken = storage.get('csrftoken');
const LEETCODE_SESSION = storage.get('LEETCODE_SESSION');
const credentials = {csrftoken, LEETCODE_SESSION};
const network = new Network(credentials);

function getLatestSubmissions(){
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
    const date = moment().subtract(i, 'day').format('YYYY-MM-DD');
    dates.unshift(date);
  }
  return dates.map(date => {
    const submissions = submissionsByDate[date];
    let count = 0;
    if(submissions){
      count = submissions.length;
    }
    return {
      date,
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

  let days = datesObj.length;
  console.log("$".repeat(days * 3 + 1));

  const counts = datesObj.map(o => o.count);
  for(let j = max; j >= 0; j--){
    let row = "║";
    for(let i = 0; i < days; i++){
      if(j == 0){
        if(counts[i] < 10){
          row += ' ';
        }
        row += counts[i];
        if(i < days - 1){
          row += ' ';
        }

        continue;
      }
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
  console.log("#".repeat(days * 3 + 1));
  console.log("Start Date:", datesObj[0].date);
  console.log("End Date:  ", datesObj[datesObj.length - 1].date);
  console.log("#".repeat(days * 3 + 1));
}

module.exports = {
  getLatestSubmissions,
  setSubmissionsWithTimeStamp,
  createSubmissionByDate,
  getDatesCounts,
  renderDates
};