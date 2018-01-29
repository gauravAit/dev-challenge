var assert = require('assert');
var testData = require('./testData');
var myEs6Module = require('../es6/myEs6code');

const SINGLE_CURRENCY = testData.SINGLE_CURRENCY;
const MULTIPLE_CURRENCIES = testData.MULTIPLE_CURRENCIES;

const getModifiedCurrency = myEs6Module.getModifiedCurrency;
const updateCurrenciesData = myEs6Module.updateCurrenciesData;
//let sortedCurrencies = myEs6Module.sortedCurrencies;

describe('getModifiedCurrency', function() {
    it('should return currency where all number values have 4 places after decimal', function() {
        let currency = getModifiedCurrency(SINGLE_CURRENCY);
        Object.keys(currency).forEach(value => {
            if(typeof currency[value] == 'number') {
                let val = currency[value].toString();
                assert.equal(val.substring(val.indexOf('.')+1, val.length).length, 4);
            }
        });   
    });

    it('should add graphData property to currency whole type is array', function() {
        let currency = getModifiedCurrency(SINGLE_CURRENCY);
        assert.equal(Array.isArray(currency.graphData), true);
    });
});


describe('getModifiedCurrency', function() {
    it('should sort currencies list sortedCurrencies', function() {
        let sortedCurrencies;
        MULTIPLE_CURRENCIES.forEach(currency => {
            currency = getModifiedCurrency(currency);
            sortedCurrencies = updateCurrenciesData(currency);
        });

        let newSortedCurrencies = MULTIPLE_CURRENCIES.map(currency => getModifiedCurrency(currency))        .sort((a, b) => {
                return Math.abs(a.lastChangeBid) - Math.abs(b.lastChangeBid);
            });

        sortedCurrencies.forEach((val, index) => {
            assert.equal(sortedCurrencies[index].name == newSortedCurrencies[index].name, true);
        });
    });
});
