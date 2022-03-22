const listeners = new Map();
let changed = false;

function execute(e) {
    if(listeners.has(e.id)) {
        listeners.get(e.id)(e);
    } else {
        console.log(`Requested non existant key: ${e.id}`);
        e.channel.send('Woops, I don\'t actually know how to respond to that action.');
    }
}

module.exports.call = execute;
module.exports.add = (id, callback) =>{ listeners.set(id, callback); changed = true; }
module.exports.remove = (id) => listeners.delete(id);
module.exports.has = (id) => listeners.has(id);
module.exports.get = (id) => listeners.get(id);
module.exports.name = 'btnHandler';