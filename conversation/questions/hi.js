module.exports = {
  question: ['hi', 'hello', 'hey', 'sup', 'hii', 'heyy', 'hola', 'konnichiwa', 'こんにちは', 'marhaba', 'سلام', 'salam', 'مرحبا', 'السلام عليكم ', 'assalamu alaikum', 'alsalam ealaykum',
            'Բարեւ', 'barev', 'namaskar', 'salam',  'kaixo', 'добры дзень', 'dobry dzien', 'dobry dzień', 'হ্যালো', 'hyālō', 'hyalo', 'zdravo', 'Здравейте', 'zdraveite', 'Zdraveĭte',
            'kumusta', 'moni', '你好', 'ni hao', 'nǐ hǎo', 'bonghjornu', 'ahoj', 'hej', 'hallo', 'saluton', 'tere', 'kamusta', 'hei', 'bonjour', 'hoi', 'ola', 'გამარჯობა',
            'gamarjoba', 'γεια', 'geia', 'નમસ્તે', 'namaste', 'namastē', 'bonjou', 'barka dai', 'aloha', 'שלום', 'नमस्ते', 'nyob zoo', 'szia', 'halló', 'nnoo', 'nnọọ', 'halo',
            'dia dhuit', 'ciao', 'ಹಲೋ', 'Сәлеметсіз бе', 'sälemetsiz be', 'salemetsiz be', 'សួស្តី', 'suostei', 'mwaramutse', '안녕하세요', 'annyeonghaseyo' ],
  answer(message) {
    let response = this.question[Math.floor(Math.random() * this.question.length)];
    response.replace(response.charAt(0), response.charAt(0).toUpperCase());
    message.channel.send(response + '!');
  }

}