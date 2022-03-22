module.exports = {
  name: 'parseLocation',
  parseLocation: (loc) => {
    let row = string.charCodeAt(0);
    if(row < 65 && row > 90 || row < 97 && row > 122) {
      return {
        result: null,
        reason: 'invalid row'
      }
    } 
  
    if(row >= 65 && row <= 90) {
      row = row - 64;
    } else {
      row = row - 96;
    }
  
    if(row > 20) {
      return {
        result: null,
        reason: 'row out of range'
      }
    }
    
    let column = Number.parseInt(string.slice(1));
    if(!column) {
      return {
        result: null,
        reason: 'invalid column'
      }
    }
  
    if(column <= 0 || column > 20) {
      return {
        result: null,
        reason: 'column out of range'
      }
    }
  
    row -= 1;
    column -= 1;
    
    return { x: row, y: column, result: true };
  }
} 