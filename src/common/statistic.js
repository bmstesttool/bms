import PGN from './pgn';

class Statistic {
  statisticInfos;

  constructor() {
    this.statisticInfos = null;
  }

  statistic = (message) => {
    if (message.messageLabel === null) {
      return null;
    }
    for (let i = 0; i < this.statisticInfos.length; i += 1) {
      if (message.messageLabel === this.statisticInfos[i].messageLabel) {
        if (this.statisticInfos[i].messageCount === 1) {
          this.statisticInfos[i].currentDuration = message.timestamp - this.statisticInfos[i].lastTimestamp;
          this.statisticInfos[i].minDuration = message.timestamp - this.statisticInfos[i].lastTimestamp;
          this.statisticInfos[i].maxDuration = message.timestamp - this.statisticInfos[i].lastTimestamp;
        } else if (this.statisticInfos[i].messageCount > 1) {
          this.statisticInfos[i].currentDuration = message.timestamp - this.statisticInfos[i].lastTimestamp;
          if (this.statisticInfos[i].minDuration > this.statisticInfos[i].currentDuration) {
            this.statisticInfos[i].minDuration = this.statisticInfos[i].currentDuration;
          }
          if (this.statisticInfos[i].maxDuration < this.statisticInfos[i].currentDuration) {
            this.statisticInfos[i].maxDuration = this.statisticInfos[i].currentDuration;
          }
        }
        this.statisticInfos[i].messageCount += 1;
        this.statisticInfos[i].lastTimestamp = message.timestamp;
        this.statisticInfos[i].totalDuration += this.statisticInfos[i].currentDuration;
        if (this.statisticInfos[i].messageCount > 1) {
          this.statisticInfos[i].averageDuration = (this.statisticInfos[i].totalDuration / (this.statisticInfos[i].messageCount - 1)).toFixed(1);
        }
      }
    }
    return this.statisticInfos;
  }

  reset = () => {
    this.statisticInfos = [];
    // for (const label in PGN) {
    //   const statisticInfo = {
    //     messageLabel: label,
    //     lastTimestamp: 0,
    //     messageCount: 0,
    //     currentDuration: 0,
    //     totalDuration: 0,
    //     minDuration: 0,
    //     maxDuration: 0,
    //     averageDuration: 0,
    //   };
    //   this.statisticInfos.push(statisticInfo);
    // }
    Object.keys(PGN).forEach((label) => {
      const statisticInfo = {
        messageLabel: label,
        lastTimestamp: 0,
        messageCount: 0,
        currentDuration: 0,
        totalDuration: 0,
        minDuration: 0,
        maxDuration: 0,
        averageDuration: 0,
      };
      this.statisticInfos.push(statisticInfo);
    });
  }
}

export default Statistic;
