const { Translate } = require('@google-cloud/translate').v2;
const dotenv = require('dotenv');

dotenv.config();

const translate = new Translate();

async function testTranslation() {
  try {
    const [translation] = await translate.translate('Hello, world!', 'es');
    console.log(`Translation: ${translation}`);
  } catch (error) {
    console.error('Error:', error);
  }
}

testTranslation();
