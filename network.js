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
					'cookie': this.cookie,
					'accept-language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7,zh-TW;q=0.6',
					'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36',
					'accept': '*/*',
					'cache-control': 'no-cache',
					'authority': 'leetcode.com',
					'x-requested-with': 'XMLHttpRequest',
					'referer': 'https://leetcode.com/submissions/',
					'pragma': 'no-cache',
          'accept-encoding': 'gzip, deflate, br'
        },
				params: {offset, limit, lastKey}
			})
      .then(res => {
      	return res.data
      })
  }
}

Network.REQUIRED_COOKIE_TOKENS = config.TOKEN_NAMES;

module.exports = Network;