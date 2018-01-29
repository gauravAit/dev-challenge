let subscriptionId;
const currencyData = {};
let sortedCurrencies = [];
const currencyProps = ["name", "bestBid", "bestAsk", "openBid", "openAsk", "lastChangeAsk", "lastChangeBid"];

// map for adding increased/decreased class colors to values
const upDownMap = {
  openBid: "lastChangeBid",
  openAsk: "lastChangeAsk"
};

const sparklineOpts = {
  lineColor: "#666",
  startColor: "orange",
  endColor: "blue",
  maxColor: "red",
  minColor: "green",
  dotRadius: 3,
  width: 300,
  tooltip: function (val, index, arr) {
    return val;
  }
};


const connectCallback = client => {
  subscriptionId = client.subscribe("/fx/prices", data => {
    let currency = JSON.parse(data.body);
    currency.name = `${currency.name.substring(0, 3).toUpperCase()} / ${currency.name.substring(3, 6).toUpperCase()}`;

    currency = getModifiedCurrency(currency);
    updateCurrenciesData(currency);
    updateTable();
  });
}


const getModifiedCurrency = currency => {
    // Shorten numbers to 4 decimal places
    Object.keys(currency).forEach(key => {
      currency[key] = (typeof currency[key] == "number")? parseFloat(currency[key].toFixed(4)) : currency[key];
    });
  
    // generate mid. value for graph and currency Graph Data
    let midVal = {
      val: (currency.bestBid + currency.bestAsk)/2,
      time: Date.now()
    };
    currency.graphData = currencyData[currency.name] ? currencyData[currency.name].graphData : [];
    currency.graphData.push(midVal);
    return currency;
}


const updateCurrenciesData = currency => {
  currencyData[currency.name] = currency;

  // Filter out data values from graph which are older than 30 seconds
  sortedCurrencies.forEach(currency => {
    currency.graphData = currency.graphData.filter(data => {
      return (Date.now() - data.time) <= 30000;
    });
  });

  //Sort currencies for table on the basis of lastChangeBid and Update table
  sortedCurrencies = Object.keys(currencyData).map(key => currencyData[key]).sort((a, b) => {
    return Math.abs(a.lastChangeBid) - Math.abs(b.lastChangeBid);
  });
  return sortedCurrencies;
}

const updateTable = () => {
  let parent = document.createDocumentFragment();
  sortedCurrencies.forEach(currency => {
    // prepare html row for each currency
    let row = generateCurrencyRow(currency);
    parent.appendChild(row);
  });

  // replace DOM table with new table
  document.getElementById('currencies-body').innerHTML = "";
  document.getElementById('currencies-body').appendChild(parent);
}



const generateCurrencyRow = currency => {
  let row = document.createElement('tr');

  // For each table head generate td for row
  currencyProps.forEach(prop => {
    let td = document.createElement('td');
    if (upDownMap[prop]) {
      let color = (currency[upDownMap[prop]] > 0)? "increased" : "decreased";// class for inc./dec. val.
      td.classList.add(color);
    }
    td.innerHTML = currency[prop];
    row.appendChild(td);
  });

  let graphTd = document.createElement('td');
  row.appendChild(graphTd);

  // make graph using sparkline and currency graphData
  let graph = new Sparkline(graphTd, sparklineOpts);
  graph.draw(currency.graphData.map(obj => obj.val));
  return row
}



//export default connectCallback
module.exports = {connectCallback, updateCurrenciesData, getModifiedCurrency, sortedCurrencies};