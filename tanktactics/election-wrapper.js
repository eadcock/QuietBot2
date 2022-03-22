const { MessageEmbed } = require('discord.js');
const { sender } = require('../helpers');
let game;
const Election = require('./election.js');
let listeners = [];
const pastElections = [];
let currentElection = null;

const startElection = (message, ...bills) => {
  game.log('An election has started.', 'election');
  currentElection = new Election(bills);
  giveEveryoneVotes(true, message);
  game.dayStart.events.push({
    once: true,
    invoke: endElection,
  })
}

const giveEveryoneVotes = (notify, message) => {
  game.players.forEach(p => {
    if(p.alive) {
      p.votingSlips.push({ type: 'living', worth: 1, player: p});
    } else {
      p.votingSlips.push({ type: 'dead', worth: 2.5, player: p });
    }

    game.log(`${p} has been given a voting slip!`, 'election');

    if(notify) {
      sender.sendDM(p.author, typeof(message) === typeof(String) ? message : message());
    }
  });
};

const vote = (voteSlip) => {
  return currentElection.castVote(voteSlip);
}

const addListener = (listener, persistant) => {
  listeners.push({
    call: listener,
    persistant,
  });
}

const endElection = () => {
  const results = currentElection.tallyResults();

  for(let i = 0; i < listeners.length; i++) {
    listeners[i].call(global, results);
    if(!listeners[i].persistant) {
      listeners.splice(i, 1);
    }
  }
  
  pastElections.push(currentElection);
  currentElection = null;
}

const getBill = (id, election) => {
  let e = election ?? currentElection;
  if(e) {
    const bill = e.currentBills[id];
    if(bill) {
      return {
        color: bill.color,
        title: bill.name,
        description: bill?.description,
        fields: bill?.fields,
      }
    }
  }

  return null;
}

const getBills = _ => {
  if(currentElection) {
    return getBillsFromElection({ election: currentElection });
  } 
  return { success: false, reason: `There is no ongoing election.`}
}

const getBillsFromElection = options => {
  const bills = [];
  let election = options.id ? getElection(options.id) : options.election;
  for(let [_, bills] of election.currentBills) {
    bills.push(bill);
  }
  return { success: true, value: bills };
}

const getBillEmbeds = _ => {
  return currentElection.currentBills.keys().map(k => getBill(k));
}

const getBillEmbedsFor = election => (_.isString(election) ? getElection(election) : election).currentBills.keys().map(k => getBill(k));

function getElection(id) {
  return _.find(pastElections, e => {
    e.id === id;
  }, this);
}

module.exports = (g) => {
  game = g;
  return {
    startElection,
    listeners,
    addListener,
    giveEveryoneVotes,
    vote,
    endElection,
    currentElection,
    pastElections,
    getBill,
    getBills,
    getBillsFromElection
  }
}

