const server = require('../api/server.js');
const { address } = require('../config.json');
const http = require('http');
const axios = require('axios').default;
const { promiseStatus, PromiseStatuses } = require('promise-status-async');
const { parse, stringify } = require('flatted');
const Player = require('../tanktactics/player.js');
const Tank = require('../tanktactics/tank.js');
const { Player: PlayerModel, Game: GameModel } = require('../api/models');
const _ = require('underscore');
const mongoose = require('mongoose');
const waitFor = require('../helpers').awaitPromise.wait;

const hostname = process.env.NODE_ENV === 'production' ? address : 'http://localhost';
const port = process.env.PORT || 3000;

module.exports = {
  player: {
    read: async (id) => {
      console.log('reading');
      await waitFor(server);
      return new Promise((resolve, reject) => {
        axios.get(`${hostname}:${port}/player${id ? `/${id}` : ''}`)
          .then((response) => {
            console.log(response.status);
            if(!response.status === 200) resolve(undefined);
            let data = response.data;
              
            if(_.isArray(data)) {
              data = data.map(p => {
                p.object = parse(p.object);
                p.object._id = p._id;
                p.object.tank = new Tank(p.object.tank);
                const player = new Player(p.object);
                player.tank.player = player;
                return player;
              });
            } else {
              data.object = parse(data.object);
              data.object._id = data._id;
              data.object.tank = new Tank(data.object.tank);
              const player = new Player(data.object);
              player.tank.player = player;
              data = player;
            }

            resolve(data);
          }).catch(err => { 
            console.log(err);
            resolve(undefined); 
          });
      })
    },
    async create(player) {
      await waitFor(server);
      let players = await this.read();
      players = players.filter(p => p.author.id === player.author.id);
      if(players.length) {
        return this.update(player);
      } else {
        const data = {
          user: player.author.id,
          emoji: player.emoji,
          object: stringify(player),
        }
        return new Promise((resolve, reject) => {
          axios.post(`${hostname}:${port}/player`, data).then(response => {
            let { _id, object } = response.data;
            object = parse(object);
            object._id = _id;
            resolve(new Player(object));
          }).catch(reject);
        })
      }
    },
    async update(player) {
      await waitFor(server);
      
      const data = {
        user: player.author.id,
        emoji: player.emoji,
        object: stringify(player),
      }
      return new Promise((resolve, reject) => {
        axios.put(`${hostname}:${port}/player/${player._id}`, data)
        .then(res => {
          let { _id, object } = res.data;
          object = parse(object);
          object._id = _id;
          resolve(new Player(object));
        });
      })
    },
    delete: async(playerId) => {
      await waitFor(server);
      return new Promise((resolve, reject) => {
        axios.delete(`${hostname}:${port}/player/${playerId}`)
          .then(res => {
            resolve(res.data);
          }).catch(err => {
            reject(err);
          });
      })
    }
  },
  game: {
    read: async (id) => {
      await waitFor(server);
      return new Promise((resolve, reject) => {
        axios.get(`${hostname}:${port}/game${id ? `/${id}` : ''}`)
          .then((response) => {
            console.log(response.status);
            if(!response.status === 200) resolve(undefined);
            let data = response.data;
              
            if(_.isArray(data)) {
              data = data.map(p => {
                p.object = parse(p.object);
                p.object._id = p._id;
                return p.object;
              });
            } else {
              data.object = parse(data.object);
              data.object._id = data._id;
              data = data.object;
            }

            resolve(data);
          }).catch(_ => resolve(undefined));
      })
    },
    async create(game) {
      await waitFor(server);
      let data = {
        object: stringify(game),
      }
      return new Promise((resolve, reject) => {
        axios.post(`${hostname}:${port}/game`, data).then(response => {
          let { _id, object } = response.data;
          object = parse(object);
          object._id = _id;
          resolve(object);
        }).catch(reject);
      })
    },
    async update(game) {
      await waitFor(server);
      
      const data = {
        object: stringify(game),
      }
      
      return new Promise((resolve, reject) => {
        axios.put(`${hostname}:${port}/game/${game._id}`, data)
        .then(res => {
          let { _id, object } = res.data;
          object = parse(object);
          object._id = _id;
          resolve(object);
        });
      })
    },
    delete: async(gameId) => {
      await waitFor(server);
      return new Promise((resolve, reject) => {
        axios.delete(`${hostname}:${port}/game/${gameId}`)
          .then(res => {
            resolve(res.data);
          }).catch(err => {
            reject(err);
          });
      })
    }
  },
  formatSave: async(api) => {
    await waitFor(server);
    return new Promise((resolve, reject) => {
      const saveObj = {
        admin: api.admin,
        unlockables: api.unlockables,
        board: {
          length: api.board.data.length,
          grid: api.board.data.grid,
          channel: api.board.channel,
          messages: api.board.messages,
        },
        logging: api.logging,
        dailyAP: api.dailyAP,
        dayStart: api.dayStart,
        election: api.election,
      };

      return saveObj;
    });
  },
}