require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const { BigQuery } = require("@google-cloud/bigquery");

const accountSid = process.env.TWILIO_ID;
const authToken = process.env.TWILIO_TOKEN;
const twilioClient = require("twilio")(accountSid, authToken);

let app = express();
const bigqueryClient = new BigQuery();

app.use(cors());
app.use(express.json());

app.all('/', async (req, res) => {

  const getCityName = async (cityId) => {
    const data = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/municipios/${cityId}`)
    const json = await data.json();
    return json.nome;
  }

  const getData = async (id) => {
    let locations = [];
    const sqlQuery = `SELECT *
                      FROM \`basedosdados.br_ms_vacinacao_covid19.microdados_estabelecimento\`
                      WHERE id_municipio = \'${id}\'
                      LIMIT 4`;
    const options = { query: sqlQuery };
    try {
      const [rows] = await bigqueryClient.query(options);
    
      rows.forEach((row) => {
        locations.push(row);
      });
    
      return locations;
    } catch (error) {
      console.log(error);
    }
  };
  
  const sendMessage = async (cityId, cityName) => {
    try {
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
    
      return {
        "message": `Esses são os pontos de vacinação em ${cidade}: ${locations}`
      }
    } catch (error) {
      console.log(error);
    }
  }

  const cityId = req.body.cityId;
  const cityName = await getCityName(cityId);

  res.status(200).json(await sendMessage(cityId, cityName));
});

exports.sendCovidInfo = app;


