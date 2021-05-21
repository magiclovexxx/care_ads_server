const { v4: uuidv4 } = require('uuid');
const prompt = require('prompt');
var shopeeApi = require('./api/ads_shopee.js');


//Example Shopee
(async()=>{


    const UserAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4503.5 Safari/537.36';
    const SPC_CDS = uuidv4();
    var cookie = 'SPC_EC="FUhPAfPLP/WG+gGOQ95FXdpWdSOkV4GNWss2ufRDDRk7ayDnE3KsUviWDf0lIBffslhAnsu7WCyqi4cxA3MF1thtf2T13as5WKNZSNJo73PlXHFFEjqUnhUGH5+v2ZCIEzx8tAeT0P+UVUVpR4AE5cE/3DAtVLNSvEOdsNZ7DWs="';
      
    var result = await shopeeApi.api_get_login(SPC_CDS, UserAgent, cookie);
    console.log(result);

    console.log(result.cookie);

   /* var cookie = 'SPC_EC="owuwQM2IZn3bZaM7ev02a+I7wv/uAfoG6YgnkXvCLPIIxzV19n6ovNzxcVm21h/YcGE7MuNUA1mKkyQTWE5sdqB53HeYYL+ifo5ZLAP3NdKD71rLj2rJaI1l66Bcn/JKx+C8pEVF92R04VqDjEFWnIJ/MqNipR8EwHbM/NVlbME="; SPC_SC_UD=328813267; SPC_STK="R9iTbG6RZq8aBip7XS8lSKcxpJnSFFSkhZBhqkSBj4h9sE+cb+1M8duczTll0xvVXCPPmDwGMRfhKvJDUQd1un/YEo+F6k/B90sbkVKfWWPJLo1OX2bIEpXs0iE8FhxCaFdyVet/W5FN1uxDFNtUmvt5JJyCtkNE7OkteQow0E7e/55PL2ixXbLXbW2g1SSI"; SPC_SC_TK=01a8d3f1ee9434bf3d7b3c9ab97105c8; SC_DFP=qo63mveUw4LhQcakzY7msJr7wfGcVzbW'; 
    var page_number = 1; //Trang số (Phân trang)
        var page_size = 100; //Giới hạn số lượng dòng (Phân trang)
        var result = await shopeeApi.api_get_shopcategory(SPC_CDS, UserAgent, cookie, page_number, page_size);
        console.log(result);
    /*
    var username = 'lozita.official'; //Tên người dùng
    bar password = 'Longgiang96137'; //Mật khẩu
    //Đăng nhập
    var result = await shopeeApi.api_post_login(SPC_CDS, UserAgent, username, password, null);       
    //Kiểm tra yêu cầu OTP
    if(result.status == 481) {
        //Nhập OTP
        const { OTP } = await prompt.get(['OTP']);
        //Đăng nhập với OTP
        result = await shopeeApi.api_post_login(SPC_CDS, UserAgent, username, password, OTP);
    }
    
    if(result.status == 200) {
        //Đăng nhập thành công lấy cookie
        var cookie = result.cookie;
        var cookie = 'SPC_SC_UD=328813267; SC_SSO_U=-; SPC_SC_SA_UD=; SPC_STK="Gd3COIxAHtP6mxZjXMNyTI9EQuzzE3LfKGIsd8f9tUSzBARh3IWZRHwfoprU9kqmWB26pEuSxjX7kJQ/1ANttFCagOtsguHBaMR2aTrivK/vKsLj5okJCWIVrdukCrTfdDnnHtkEO1pYe1EVMJYSiP1PKCd6kf7LlpGgJ5xai/mpuqfikvAf0AUC96NJVUy4"; SPC_U=328813267; SPC_SC_SA_TK=; SPC_F=9ExbXfn3mWDGzrQkRSJjjK0ZfYZ1ItXL; SPC_EC="owuwQM2IZn3bZaM7ev02a+I7wv/uAfoG6YgnkXvCLPIIxzV19n6ovNzxcVm21h/YcGE7MuNUA1mKkyQTWE5sdqB53HeYYL+ifo5ZLAP3NdKD71rLj2rJaI1l66Bcn/JKx+C8pEVF92R04VqDjEFWnIJ/MqNipR8EwHbM/NVlbME="; SC_SSO=-; SPC_SC_TK=4c27ab634cbaaa3469de4cc0c31aa81b; SPC_WST="owuwQM2IZn3bZaM7ev02a+I7wv/uAfoG6YgnkXvCLPIIxzV19n6ovNzxcVm21h/YcGE7MuNUA1mKkyQTWE5sdqB53HeYYL+ifo5ZLAP3NdKD71rLj2rJaI1l66Bcn/JKx+C8pEVF92R04VqDjEFWnIJ/MqNipR8EwHbM/NVlbME="; SC_DFP=z8t4bHlBC5LR309x3q5GRHUtTFm5TDHu';
        var page_number = 1; //Trang số (Phân trang)
        var page_size = 100; //Giới hạn số lượng dòng (Phân trang)
        result = await shopeeApi.api_get_shopcategory(SPC_CDS, UserAgent, cookie, page_number, page_size);
        console.log(cookie);
        

    }
*/
    /*
    //Khởi tạo thông tin đăng nhập
    const UserAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4503.5 Safari/537.36';

    //0962986537
    const SPC_CDS1 = '76c1582f-dcae-47a2-b653-f5470ad1b152';
    var cookie1 = 'SPC_SC_UD=29630508; SC_SSO_U=-; SPC_SC_SA_UD=; SPC_STK="Mc0rzRll5iXk79rKZ8yicrI0FC2FgE87qG4T31tut/G6NW6U2xo/Hhp+EhOMXSwpCO7TPMYdPU5G4j9+gQm5ibS0aOwhyhaBfCzfFj4trghbdcx9lfAUoHWhhGfNyCGMdBafCT5yt4USRNeliBn10uDtPyyOvSzWh6SEUkdLkA/RvyQu9i5p7vCd7OagQK3l"; SPC_U=29630508; SPC_SC_SA_TK=; SPC_F=ztr32J2DAx0JLgL1LnlBLAh0PY16omi3; SPC_EC="G8R9IP058FlBDmugYiOVUL77G12xkaMBv6bxdd+VtQzv9N8OwCKUdIDBzsJ+hLz7aAUSYLMslv8uSY7KTuFpx+j73jbvcuE4GCu+4VCTvbrCEEvbPQ9uTLwTi6fx1ZrCYTBNp3trN69dM1KFwM4DBQ=="; SC_SSO=-; SPC_SC_TK=5e8a431c5fff420ee735e90805d16b81; SPC_WST="G8R9IP058FlBDmugYiOVUL77G12xkaMBv6bxdd+VtQzv9N8OwCKUdIDBzsJ+hLz7aAUSYLMslv8uSY7KTuFpx+j73jbvcuE4GCu+4VCTvbrCEEvbPQ9uTLwTi6fx1ZrCYTBNp3trN69dM1KFwM4DBQ=="; SC_DFP=7fglOYGonsztt1hnjFSgy1hjRKdYatsP';

    //quangnguyen7616
    const SPC_CDS2 = 'd42bc8f7-90c8-4a6f-90fa-64155b592586';
    var cookie2 = 'SPC_SC_UD=444407250; SC_SSO_U=-; SPC_SC_SA_UD=; SPC_STK="SI5Nf9ziXIKBjE99PnukJuC4RtopB3cM5NK6/t+V4jcihz56ZljehhldxKClUU5Gg80lMfYykCYQwDC9UcjSb2C1UoHBlkX/4L6Mj1ktbGWaakTfCW/ivdVeu+/hX3zjAM0F5zdMyhvSFVYeo2MCallZLqO447S/zSSKgk/m8Hfrq1R9f10dyNJkLW0oPAqe"; SPC_U=444407250; SPC_SC_SA_TK=; SPC_F=iQqeprOPJB9A3OHkweOpAbWnBNZZR14O; SPC_EC="UdvTDO0v4ztmOeAmpotz/c4QPqvn0wQ22ncu4Ctqo4R2Ovb3+pwZ0GhA2VicN0U3fAWFy+O/jXRtubKQdzyrIDgL3XJ0l80/bOqq34HoHLurYUsK6YMGx6N1r1mAaVd44LneuoOhF3GkNd/zDkxudif3x/ZEK4Z/F7oJIGkvXCA="; SC_SSO=-; SPC_SC_TK=fefb1a0cb81ec51a43c3c47a5aae02c2; SPC_WST="UdvTDO0v4ztmOeAmpotz/c4QPqvn0wQ22ncu4Ctqo4R2Ovb3+pwZ0GhA2VicN0U3fAWFy+O/jXRtubKQdzyrIDgL3XJ0l80/bOqq34HoHLurYUsK6YMGx6N1r1mAaVd44LneuoOhF3GkNd/zDkxudif3x/ZEK4Z/F7oJIGkvXCA="; SC_DFP=yqb6m4Bf7y0av4icAFnuZ1I2ePoeKXVg';



    setInterval(function(SPC_CDS, cookie, name) {
        var page_number = 1; //Trang số (Phân trang)
        var page_size = 100; //Giới hạn số lượng dòng (Phân trang)
        shopeeApi.api_get_shopcategory_async(name, SPC_CDS, UserAgent, cookie, page_number, page_size);
    }, 1000, SPC_CDS1, cookie1, '0962986537');

    setInterval(async function(SPC_CDS, cookie, name) {
        var page_number = 1; //Trang số (Phân trang)
        var page_size = 100; //Giới hạn số lượng dòng (Phân trang)
        shopeeApi.api_get_shopcategory_async(name, SPC_CDS, UserAgent, cookie, page_number, page_size);
    }, 1000, SPC_CDS2, cookie2, 'quangnguyen7616');
    */  

 })();