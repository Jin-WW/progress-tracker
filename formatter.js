const moment = require('moment');

function convertRelativeTimeToTimestamp(relativeTime, format){
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
	return date.format(format);
}

module.exports = {
  convertRelativeTimeToTimestamp
};