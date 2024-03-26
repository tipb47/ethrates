async function fetchEthereumPrice() {
    const cacheKey = 'ethPriceCache';
    const cacheTimeKey = 'ethPriceCacheTime';
    const cacheDuration = 5 * 60 * 1000; // cache duration in milliseconds, 5 minutes
  
    try {
      const cachedData = localStorage.getItem(cacheKey);
      const cachedTime = localStorage.getItem(cacheTimeKey);
      let ethPrice;
  
      if (cachedData && cachedTime && new Date().getTime() - parseInt(cachedTime, 10) < cacheDuration) { //check if price recently cached
        const { ethPrice: cachedEthPrice, ethChange: cachedChange } = JSON.parse(cachedData);
        ethPrice = cachedEthPrice; // use the cached price
        document.getElementById('ethPrice').textContent = `Ethereum Price: $${ethPrice}`;
        document.getElementById('ethChange').textContent = `24h Change: ${cachedChange.toFixed(2)}%`;
        document.getElementById('ethChange').style.color = cachedChange > 0 ? 'green' : cachedChange < 0 ? 'red' : 'black';
      } else { //else new scrape
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_market_cap=false&include_24hr_vol=false&include_24hr_change=true&include_last_updated_at=false');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        ethPrice = data.ethereum.usd; // directly fetch the new price
        const ethChange = data.ethereum.usd_24h_change;
  
        localStorage.setItem(cacheKey, JSON.stringify({ ethPrice, ethChange }));
        localStorage.setItem(cacheTimeKey, new Date().getTime().toString());
        document.getElementById('ethPrice').textContent = `Ethereum Price: $${ethPrice}`;
        document.getElementById('ethChange').textContent = `24h Change: ${ethChange.toFixed(2)}%`;
        document.getElementById('ethChange').style.color = ethChange > 0 ? 'green' : ethChange < 0 ? 'red' : 'black';
      }
  
      // update prices in ETH after fetching the ETH price
      if (ethPrice !== undefined) {
        updatePricesInETH(ethPrice);
      } else {
        throw new Error('ethPrice is undefined');
      }
    } catch (error) {
      console.error('Failed to fetch Ethereum price:', error);
      document.getElementById('ethPrice').textContent = 'Failed to load Ethereum price.';
      document.getElementById('ethChange').textContent = 'Data unavailable.';
    }
  }
  
  function updatePricesInETH(ethPrice) {
    // define USD prices for items from item 0 -> last
    const pricesInUSD = [500, 1200, 1600, 4000, 11500, 25000];
    
    // find all cells in the table with class 'ethPrice'
    const ethPriceCells = document.querySelectorAll('.ethPrice');
    
    // calculate and update the ETH price for each item
    ethPriceCells.forEach((cell, index) => {
      if (index < pricesInUSD.length) { // check to prevent index out of bounds
        const priceInETH = pricesInUSD[index] / ethPrice;
        cell.textContent = `${priceInETH.toFixed(2)}e`; //print price pretty!
      }
    });
  }
  
  fetchEthereumPrice();
  