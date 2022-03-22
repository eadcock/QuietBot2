const { v4: uuidv4 } = require('uuid');

class Bill {
  constructor(options) {
    this.id = options.id;
    this.votes = 0;
    this.voters = [];
    this.passed = null;
    this.color = options?.color ?? '#ffffff';
    this.name = options?.name ?? options.id;
    this.description = options?.description;
    this.fields = options?.fields ?? [];
    this.fields.push({
      name: 'Status: Pending...',
      value: '',
    })
  }
}

class Election {
  constructor(onEnd, ...bills) {
    this.id = uuidv4();
    this.currentBills = new Map();
    bills.forEach(b => {
      this.currentBills.set(b.id, b);
    });
    this.state = 'ongoing';
    this.totalVotes = 0;
    this.onEnd = onEnd;
  }

  castVote(slip) {
    if(this.state === 'ongoing') {
      let result = { success: false, reason: 'invalid bill id' }
      if(bills.has(slip.id)) {
        bills.get(slip.id).votes += slip.worth;
        bills.get(slip.id).voters.push(slip.player);
        result = { success: true, bill: bills.get(slip.id) }
      }
      this.totalVotes += slip.worth;
      return result;
    }
    return { success: false, reason: 'election concluded' };
  }

  tallyResults() {
    let passed = [];
    for(bill of this.currentBills) {
      if(bill.votes / this.totalVotes > 0.4) {
        bill.passed = true;
        passed.push(bill);
      }
      bill.fields.push({
        name: 'Status: ' + bill.passed,
        value: `Total votes: ${bill.votes}`,
      })
    }
    return {
      passed,
      totalvotes: this.totalVotes, 
    }
  }

  toString() {
    let string = '';
    if(this.state === 'ongoing') {
      string += 'This election is currently active. The bills are ';
    } else {
      string += 'This election has concluded. The bills were ';
    }
    let passed = [];
    for(bill of this.currentBills) {
      string += `"${bill.id}" `;
      if(bill.passed) {
        passed.push(bill);
      }
    }
    string += ". "
    if(passed.length > 0) {
      string += "The bills that passed are ";
      passed.forEach(b => {
        string += `"${b.id}" `;
      });
    };
    return string;
  }
}

module.exports = Election;