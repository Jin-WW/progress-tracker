const moment = require('moment');

function convertRelativeTimeToTimestamp(relativeTime){
	const date = moment();
	relativeTime
		.split(',')
		.forEach(timePiece => {
			try {
				timePiece = timePiece.trim();
				var timePieceArr = timePiece.split(/\s/g);
				date.subtract(timePieceArr[0], timePieceArr[1]);
			}
			catch(err) {
				throw err;
			}
		});
	return date.format('YYYY-MM-DD');
}

module.exports = {
  convertRelativeTimeToTimestamp
};