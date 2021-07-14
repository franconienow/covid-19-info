// fetch('https://us-central1-covid19-info-317601.cloudfunctions.net/sendCovidInfo')
//   .then(response => response.json())
//   .then(data => console.log(data.message));

const getStates = async () => {
  const data = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados')
  const json = await data.json();
  return json;
}

const getCities = async (stateId) => {
  const data = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${stateId}/municipios`)
  const json = await data.json();
  return json;
}

const appendStates = async (statesList) => {
  const states = await getStates();
  states.forEach(uf => {
    const option = document.createElement("option");
    option.text = uf.sigla;
    option.value = uf.id;
    statesList.add(option);
  });
}

const appendCities = async (stateId, citiesList) => {
  citiesList.innerHTML = '';
  const cities = await getCities(stateId);
  cities.forEach(city => {
    const option = document.createElement("option");
    option.text = city.nome;
    option.value = city.id;
    citiesList.add(option);
  });
}

const handleSubmit = async (event) => {
  event.preventDefault();
  const data = new FormData(event.target);
  const fields = {};
  data.forEach((value, key) => {
    if (key === 'city-select') {
      fields['cityId'] = value
    }
  })
  console.log(JSON.stringify(fields));
  const res = await fetch('https://us-central1-covid19-info-317601.cloudfunctions.net/sendCovidInfo', {
    method: 'POST',
    body: JSON.stringify(fields)
  });
  const json = await res.json();
  console.log(json)
}

const main = async () => {
  const form = document.querySelector('#get-covid-info');
  const statesList = document.querySelector('#uf-select');
  appendStates(statesList);
  const citeisList = document.querySelector('#city-select');

  // Listener para append das cidades
  statesList.addEventListener('change', (event) => {
    appendCities(event.target.value, citeisList);
  })

  // Listener para submit do formulário
  form.addEventListener('submit', handleSubmit);
}

main();