var queryString = Math.random();

function getData() {
  
  var Average_buy_prices = true; // Set to true to average coin buy prices with the same name
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  //IMPORTANT: Create a sheet called 'Rates'.  This is where the values will be written
  var ssRates = ss.getSheetByName('Rates');
  // Create a sheet called info, with CMC Name	Quantity	Price Bought	Description
  var ssInfo = ss.getSheetByName('Info');
  range = ssInfo.getDataRange(),
  values = range.getValues();
  
  var data = [];
  var i;
  for (var i=1; i < values.length; i++) 
  {
    var found_coin = false;
    var row = values[i];
    var coin_name = row[0].toString();
    // Check to see if the coin has already been added to the data array
    for ( var j = 0; j < data.length; j++ )
    {
      if ( coin_name == data[j].coin )
      {
        found_coin = true;
        coin_info = data[j];
        coin_info.quantity.push(row[1]);
        coin_info.price_bought.push(row[2]);
      }
    }
    if (!found_coin)
    {
      var coin_info = {"coin" : coin_name,
                   "quantity" : [row[1]],
                   "price_bought" : [row[2]],
                   "description" : row[3].toString(),
                   "value" : [],
                   "current_price": 0.0,
                   "rank" : 0,
                   "oneday" : 0.0,
                   "sevendays" : 0.0};
      data.push(coin_info);
    }
  }
  
  var current_row = 3;
  var total = 0;
  var total_row = 1;
  
  // Cycle through each coin, get the price, and calculate the value
  for (var i = 0; i < data.length; i++) 
  {
    var CMC_call = getRate(data[i].coin);
    if (CMC_call == null)
    {
      //Something couldn't be read from CMC, set the data manually to check it out later
      var CMC_call = {};
      CMC_call['price_usd'] = -1;
      CMC_call['rank'] = -1;
      CMC_call['percent_change_24h'] = -1;
      CMC_call['percent_change_7d'] = -1;
    }
    data[i].current_price = parseFloat(CMC_call['price_usd']);
    data[i].current_price = parseFloat(CMC_call['price_usd']);
    data[i].rank = parseInt(CMC_call['rank']);
    data[i].oneday = CMC_call['percent_change_24h'];
    data[i].sevendays = CMC_call['percent_change_7d'];
      
    if (Average_buy_prices && data[i].quantity.length > 1)
    {
      // Only average the coins that have multiple different buys to average
      var quantities = data[i].quantity;
      var prices_bought = data[i].price_bought; 
      var quantity_sum = 0;
      var total_price = 0;
      
      for (var j = 0; j < quantities.length; j++)
      {
        quantity_sum += quantities[j];
        total_price += quantities[j] * prices_bought[j];
      }
      data[i].price_bought = [total_price / quantity_sum];
      data[i].value = [quantity_sum * data[i].current_price];
      data[i].quantity = [quantity_sum];
    }
    else
    {
      var value = data[i].quantity[0] * data[i].current_price;
      data[i].value = [value];   
    }
    // Remove the arrays now that they've been flattened to 1 element
    data[i].value = data[i].value[0];
    data[i].price_bought = data[i].price_bought[0];
    data[i].quantity = data[i].quantity[0];
    total = total + data[i].value;
      
    }

  ssRates.getRange(total_row, '1').setValue(total);
  data.sort(SortByValue);
  
  //Use a data structure to keep track of column numbers for easy changing/insertion later			
  //Currency	Rank	Price	Bought at (per)	Increase	Value (USD)	%Profile	Profit (USD)	24h change	7d change	Quantity	URL	What it is												
  var col = {"currency": 1,
             "rank": 2,
             "price": 3,
             "bought_at": 4,
             "coin_increase": 5,
             "value": 6,
             "percent_profile": 7,
             "profit": 8,
             "oneday": 9,
             "sevendays" : 10,
             "quantity": 11,  
             "url": 12,
             "description": 13};

              
  
  // Update the spreadsheet for each coin
  for (var i = 0; i < data.length; i++) 
  {
    if (data[i].coin == "tether")
    {
      ssRates.getRange(current_row, col.currency).setValue("USD");
    }
    else 
    {
      ssRates.getRange(current_row, col.currency).setValue(data[i].coin);
    }
    ssRates.getRange(current_row, col.rank).setValue(data[i].rank);
    ssRates.getRange(current_row, col.price).setValue(data[i].current_price);
    ssRates.getRange(current_row, col.quantity).setValue(data[i].quantity);
    ssRates.getRange(current_row, col.value).setValue(data[i].value);
    ssRates.getRange(current_row, col.percent_profile).setValue(data[i].value / total);
    ssRates.getRange(current_row, col.bought_at).setValue(data[i].price_bought);
    var profit = data[i].value - (data[i].price_bought * data[i].quantity);
    ssRates.getRange(current_row, col.profit).setValue(profit);
    var percent_profit = data[i].current_price / data[i].price_bought;
    ssRates.getRange(current_row, col.coin_increase).setValue(percent_profit);
    ssRates.getRange(current_row, col.url).setValue("https://coinmarketcap.com/currencies/" + data[i].coin);  
    ssRates.getRange(current_row, col.oneday).setValue(data[i].oneday);
    ssRates.getRange(current_row, col.sevendays).setValue(data[i].sevendays);
    ssRates.getRange(current_row, col.description).setValue(data[i].description);
    current_row = current_row + 1;
  }
  
  // Add a last updated date
  ssRates.getRange(total_row, '2').setValue(new Date());
 
}

// Sort all of my coins based on total value before printing to spreadsheet
function SortByValue(a, b) {
     if (parseFloat(a.value) === parseFloat(b.value)) {
        return 0;
    }
    else {
        return ((parseFloat(a.value) < parseFloat(b.value)) ? 1 : -1);
    } 
}

function getRate(currencyId) {

  var url = 'https://api.coinmarketcap.com/v1/ticker/' + currencyId + '/';
  var response = UrlFetchApp.fetch(url, {'muteHttpExceptions': true});
  var json = response.getContentText();
  try{
    var data = JSON.parse(json);
  }
  catch (e)
  {
    throw new Error(json);
  }
  return data[0];
}
