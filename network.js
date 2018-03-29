const axios = require('axios');
const fs = require('fs');
const config = require('./config.json');

class Network {
	constructor(credentials){
		Network.REQUIRED_COOKIE_TOKENS
			.forEach(token => {
				if(!credentials[token]){
					throw new Error(`cannot find ${token} in credentials for network request`);
				}
			});
		this.cookie = this.constructCookie(credentials);
	}

	constructCookie(credentials){
		return Network.REQUIRED_COOKIE_TOKENS
			.map(token => {
				return `${token}=${credentials[token]}`;
			})
			.join('; ');
	}

	//shouldStop is a function to determine if this recursive request should stop
	getAllSubmissions(shouldStop){
		if(!shouldStop){
			shouldStop = () => ({ stop: false, result: [] });
		}
		let accum = [];
		return this.getAllSubmissionsHelper(0, '', accum, shouldStop)
	}

  getAllSubmissionsHelper(skip, lastKey, accum, shouldStop){
    // limit should be fixed to 20 as it is the max for leetcode
    const limit = 20;
    return this.getSubmissions(skip, limit, lastKey)
			.then(res => {
				// console.log(`done with ${skip} to ${skip + limit}`);
        const stopIndicator = shouldStop(res);
        if(stopIndicator.stop){
          return accum.concat(stopIndicator.result);
        }

				accum = accum.concat(res.submissions_dump);
				if(!res.has_next){
					return accum;
				}
				return this.getAllSubmissionsHelper(skip + limit, res.last_key, accum, shouldStop);
			})
	}

  getSubmissions(offset=0, limit=20, lastKey=''){
    return axios.get(config.SUBMISSION_URL, {
      headers : {
        Cookie: this.cookie
      },
      params: {offset, limit, lastKey}
    })
      .then(res => res.data)
  }
}

Network.REQUIRED_COOKIE_TOKENS = config.TOKEN_NAMES;

module.exports = Network;