require('dotenv').config();
const { BigQuery } = require("@google-cloud/bigquery");

const accountSid = process.env.TWILIO_ID;
const authToken = process.env.TWILIO_TOKEN;
const twilioClient = require("twilio")(accountSid, authToken);

const config = {
  projectId: "covid19-info-317601",
  keyFilename: "/home/franco/.ssh/covid19-info-317601-0c486f524669.json",
};
const bigqueryClient = new BigQuery(config);

const getData = async (id) => {
  let locations = [];
  const sqlQuery = `SELECT *
                    FROM \`basedosdados.br_ms_vacinacao_covid19.microdados_estabelecimento\`
                    WHERE id_municipio = \'${id}\'
                    LIMIT 4`;
  const options = { query: sqlQuery };
  const [rows] = await bigqueryClient.query(options);

  rows.forEach((row) => {
    locations.push(row)
  });

  return locations;
};

const sendMessage = async (cityId, cityName) => {
  let locations = await getData(cityId);

  locations = locations.map(location => `${location.nome_fantasia} - ${location.sigla_uf}`);
  locations = locations.join(', ');

  const cidade = cityName;

  // const message = await twilioClient.messages.create({
  //   body: `Esses são os pontos de vacinação em ${cidade}: ${locations}`,
  //   from: "+15614086456",
  //   to: "+5551993328653",
  // })
  // console.log(await message);

  console.log(`Esses são os pontos de vacinação em ${cidade}: ${locations}`);
}

sendMessage('1200807', 'Porto Acre');

