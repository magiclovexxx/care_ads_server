const { v4: uuidv4 } = require('uuid');
const prompt = require('prompt');
var shopeeApi = require('./api/ads_shopee.js');

(async()=>{
    var SPC_CDS = '76c1582f-dcae-47a2-b653-f5470ad1b152';
    var UserAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4503.5 Safari/537.36';
    var cookie = 'SPC_SC_UD=29630508; SPC_STK="IeH3iJgNITik2eKRY0wd3Odz82kRx9ofeSnYm7HbQv742wIC1oPk3iQg+gYgTw/e6nlopamU5yWwPkSseluBMDKWV6WWT5eqMl0ktNXerUg/cl7Bvu2KE//bubv/U1CqcwKKxxFWSUHDyzuIK1eZJ7VmOINnIaJZE1ZYx8utW9bzQuLiJpBHCZQqP4Hufy1K"; SPC_SC_TK=d1fd86f680bde7ebfbbb86724f43cb30; SC_DFP=r7tepa4H9fmgUoqGzvESv8AXnJ2rkkwD; SPC_EC="G8R9IP058FlBDmugYiOVUL77G12xkaMBv6bxdd+VtQzv9N8OwCKUdIDBzsJ+hLz7aAUSYLMslv8uSY7KTuFpx+j73jbvcuE4GCu+4VCTvbrCEEvbPQ9uTLwTi6fx1ZrCYTBNp3trN69dM1KFwM4DBQ=="';
    var proxy = null;
    var result = await shopeeApi.api_get_login(SPC_CDS, proxy, UserAgent, cookie);
    console.log(result);
})();