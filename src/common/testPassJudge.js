import PGN from './pgn';
import Message from './message';

class TestPassJudge {
  messageArray = [];
  currentTestID;
  startTime;
  constructor() {
    this.message = null;
    this.currentTestID = null;
  }
  startPassJudge = (currentTestID, startTime) => {
    this.startTime = startTime;
  }
  addMessage = (currentTestID, message) => {
    if (currentTestID != this.currentTestID) {
        return false;
    }
  }
  passJudge = (currentTestID) => {
      switch(currentTestID) {
					case 1: // DP1001
						return dp1001Judge();
          	break;
          default:
          	break;
      }

	}
	dp1001Judge = () => {
		// 5s内没有收到CHM报文
		var that = this;
		if (that.messageArray == []) {
			return false;
		}
		// 报文正确性判断
		let currentTime = null;
		let errorPrecision = 250 * 0.1;
		if (that.messageArray[0].code == 0x26 && that.messageArray[0].id == 0x1826F456) {
			currentTime = that.messageArray[0].time.valueOf();
		} else {
			return false;
		}
		for (let i = 0; i < that.messageArray.length; i++) {
			// 报文正确性判断
			if (that.messageArray[i].code == 0x26 && that.messageArray[i].id == 0x1826F456) {
				if (Math.abs(that.messageArray[i].time.valueOf() - currentTime) < errorPrecision) {
					// 报文周期正确性判断
					currentTime = that.messageArray[i].time.valueOf();
				} else {
					return false;
				}
			} else {
				return false;
			}
		}

	}

}

export default TestPassJudge;