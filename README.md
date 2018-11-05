# CoinTracker
Use Google Sheets to keep track of your portfolio anywhere.

![Sample Portfolio](/Sample.png)

In order to use this sheet for your own crypto asset tracking follow one of two ways:
Copy the [existing reference sheet](https://docs.google.com/spreadsheets/d/15k4x3z6tYkptfNcjVg024vtmEK2xNISiIt1wqT0KXto/edit?usp=sharing) into your own drive, and modify the 'Info' tab with your own cryptocurrencies.
Click the green button in the top right to update, or add a 'Trigger' to update automatically (see steps below)

To set up 'triggers' so your sheet updates automatically:
1. In the tools -> code editor top menu select edit -> Current Project's Triggers
1. Select "Add Trigger" with the values: 'getData', 'Time-Driven', 'Minutes Timer', 'Every 15 minutes'  
NOTE: Do not update any sooner than 15 minutes, or coinmarketcap might block your IP from accessing their data

Create the sheet from scratch:
1. Create a new blank [Google Drive Sheet](https://docs.google.com/spreadsheets)
1. At the bottom left, rename the first sheet to "Rates"
1. On row #2, create the following column names: Crypto	Rank,	Price	Bought at,	Increase,	Value (USD),	%Profile,	Profit (USD),	24h,	7d,	Quantity,	URL,	What it is
1. On the bottom left, create a new tab called "Info"
1. On row #1, create the following column names: Coin,	Quantity,	Price Bought,	Description
1. Fill out the info table with the cryptocurrencies you own, with 'Coin' being the name at the end of the coinmarketcap.com URL (For example, [Ethereum](https://coinmarketcap.com/currencies/ethereum/) would need to be entered as ethereum
1. Go to Tools -> Script Editor and paste the contents of [script.js](/script.js) there
1. Now you can run the sheet manually to update values in the code editor, or add a trigger (see above)
