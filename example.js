const { v4: uuidv4 } = require('uuid');
const prompt = require('prompt');
var shopeeApi = require('./api/ads_shopee.js');
//Example Shopee
(async()=>{

    //Khởi tạo thông tin đăng nhập
    const UserAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4503.5 Safari/537.36';
    const SPC_CDS = uuidv4();
    var username = 'lozita.official'; //Tên người dùng
    var password = 'Longgiang96137'; //Mật khẩu
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
        //placement_list
        //8: Quảng cáo khám phá: Tự động
        //1: Quảng cáo khám phá: Sản phẩm tương tự
        //2: Quảng cáo khám phá: Gợi ý hôm nay
        //5: Quảng cáo khám phá: Có thể bạn cũng thích

        //0: Quảng cáo đấu thầu từ khóa: Thủ công
        //4: Quảng cáo đấu thầu từ khóa: Tự động
        
        //3: Quảng cáo ads shop
        
        //#region Lấy giá thầu gợi ý
        /*
        var data = {
            placement_list: [1,2,5], //Loại quảng cáo
            itemids: [4160893371] //Mã sản phẩm
        }

        result = await shopeeApi.api_get_suggest_price(SPC_CDS, UserAgent, cookie, data);
        console.log(JSON.stringify(result)); 
        */
        //#endregion Lấy giá thầu gợi ý
        
        //#region Quảng cáo đấu thầu từ khóa: Thêm/Sửa quảng cáo  
        /*
        //Khởi tạo danh sách mã sản phẩm
        var item_id_list = {
            item_id_list: [6760786744]
        }; 

        //Lấy danh sách quảng cáo của sản phẩm
        result = await shopeeApi.api_get_item_status(SPC_CDS, UserAgent, cookie, item_id_list);

        if(result.status == 200) {
            
            for(var i = 0; i < result.data.data.length; i++) {

                var ads_list = result.data.data[i].ads_list.filter (function (d) {                       
                    return d.placement === 4 || d.placement === 0; //Lọc quảng cáo đấu thầu từ khóa (4: Tự động, 0: Thủ công)
                });
                
                //Kiểm tra sản phẩm này đã tồn tại quảng cáo đấu thầu từ khóa
                if(ads_list.length > 0) { //Đã tồn quảng cáo đấu thầu từ khóa cho sản phẩm này => Cập nhật                  

                    //Lấy mã quảng cáo đấu thầu từ khóa
                    var campaignid = ads_list[0].campaignid;

                    //Lấy thông tin quảng cáo đấu đầu từ khóa theo mã
                    result_get = await shopeeApi.api_get_marketing_campaign(SPC_CDS, UserAgent, cookie, campaignid);
                    if(result_get.status == 200) {

                        //Khởi tạo đối tượng quảng cáo
                        var campaign_ads_list = {
                            campaign_ads_list: [
                                {
                                    advertisements: result_get.data.data.advertisements,
                                    campaign: result_get.data.data.campaign
                                }
                            ]
                        };                        
                        campaign_ads_list.ads_audit_event = 6;
                        
                        //Bật & Tắt quảng cáo đấu thầu từ khóa tự động
                        var ads_auto = campaign_ads_list.campaign_ads_list[0].advertisements.filter (function (d) {                       
                            return d.placement === 4; //Lọc quảng cáo đấu thầu tự động
                        });
                        
                        //Kiểm tra sản phẩm này đã tồn tại quảng cáo đấu thầu từ khóa tự động chưa
                        if(ads_auto.length > 0) { //Đã tồn tại quảng cáo đấu thầu từ khóa tự động => Cập nhật
                            ads_auto[0].status = 2; //1: Bật quảng cáo tự động, 2: Tắt quảng cáo tự động
                        } else { //Chưa tồn tại quảng cáo đấu thầu từ khóa tự động => Thêm mới
                            campaign_ads_list.campaign_ads_list[0].advertisements.push({
                                itemid: item_id_list.item_id_list[0],
                                status: 2, //1: Bật quảng cáo tự động, 2: Tắt quảng cáo tự động
                                placement: 4,
                                campaignid: campaign_ads_list.campaign_ads_list[0].campaign.campaignid
                            });
                        }

                        //Thêm & Tắt quảng cáo đấu thầu từ khóa thủ công
                        var ads_manual = campaign_ads_list.campaign_ads_list[0].advertisements.filter (function (d) {                       
                            return d.placement === 0; //Lọc quảng cáo đấu thầu từ khóa thủ công
                        });

                        //Kiểm tra sản phẩm này đã tồn tại quảng cáo đấu thầu từ khóa thủ công chưa
                        if(ads_manual.length > 0) { //Đã tồn tại quảng cáo đấu thầu từ khóa thủ công => Cập nhật

                            var ads_key =  ads_manual[0].extinfo.keywords.filter (function (d) {                       
                                return d.keyword === "từ khóa tìm kiếm 2"; //Lọc từ khóa
                            });

                            //Kiểm tra từ khóa tồn tại chưa
                            if(ads_key.length > 0) { //Đã tồn tại từ khóa => Cập nhật
                                ads_key[0].match_type = 1; //Loại từ khóa (0: Từ khóa chính xác, 1: Từ khóa mở rộng)
                                ads_key[0].status = 1; //Trạng thái (0: Đã xóa, 1: Đang hoạt động)
                                ads_key[0].price = 500.00; //Giá đấu thầu
                                ads_key[0].keyword = "từ khóa tìm kiếm 2"; //Từ khóa
                            } else { //Chưa tồn tại từ khóa => Thêm mới
                                ads_manual[0].extinfo.keywords.push({
                                    match_type: 1, //Loại từ khóa (0: Từ khóa chính xác, 1: Từ khóa mở rộng)
                                    status: 1, //Trạng thái (0: Đã xóa, 1: Đang hoạt động)
                                    price: 500.00, //Giá đấu thầu
                                    keyword: "từ khóa tìm kiếm 2", //Từ khóa
                                    algorithm: "kwrcmdv2" //Giá trị mặc định
                                });
                            }
                        } else { //Chưa tồn tại quảng cáo đấu thầu từ khóa thủ công => Thêm mới
                            campaign_ads_list.campaign_ads_list[0].advertisements.push({
                                itemid: item_id_list.item_id_list[0],
                                status: 1, //Trạng thái quảng cáo (0: Đã xóa, 1: Hoạt động, 2: Tạm dừng, 3: Kết thúc)
                                placement: 0, //Loại quảng cáo đấu thầu từ khóa thủ công
                                campaignid: campaign_ads_list.campaign_ads_list[0].campaign.campaignid, //Mã quảng cáo đấu thầu từ khóa
                                extinfo: {
                                    target_roi: 0,
                                    keywords: [ //Danh sách từ khóa
                                      {
                                        match_type: 1, //Loại từ khóa (0: Từ khóa chính xác, 1: Từ khóa mở rộng)
                                        status: 1, //Trạng thái (0: Đã xóa, 1: Đang hoạt động)
                                        price: 480.00, //Giá đấu thầu
                                        keyword: "từ khóa tìm kiếm 2", //Từ khóa
                                        algorithm: "kwrcmdv2" //Giá trị mặc định
                                      }
                                    ],
                                    target: {},
                                    shop_customisation: {}
                                }
                            });
                        }

                        campaign_ads_list.campaign_ads_list[0].start_time = 1620752400; //Thời gian bắt đầu (format Unix Timestamp)
                        campaign_ads_list.campaign_ads_list[0].end_time = 0; //Thời gian kết thúc (format Unix Timestamp) (0: Không giới hạn thời gian)
                        campaign_ads_list.campaign_ads_list[0].daily_quota = 0; //Ngân sách hàng ngày (0: Không giới hạn)
                        campaign_ads_list.campaign_ads_list[0].total_quota = 0; //Tổng ngân sách (0: Không giới hạn)
                        campaign_ads_list.campaign_ads_list[0].campaign.status = 2; //Trạng thái (0: Đã xóa, 1: Hoạt động, 2: Tạm dừng, 3: Kết thúc)

                        //Cập nhật quảng cáo
                        var result_update = await shopeeApi.api_put_marketing_campaign(SPC_CDS, UserAgent, cookie, campaign_ads_list);
                        console.log(JSON.stringify(result_update));
                    }
                    else {
                        console.log(JSON.stringify(result_get));
                    }
                } else { //Chưa có quảng cáo đấu thầu từ khóa cho sản phẩm này => Thêm mới
                    //Khởi tạo đối tượng quảng cáo
                    var campaign_ads_list = {
                            campaign_ads_list: [
                              {
                                campaign: {
                                  campaignid: null, //ID để trống
                                  start_time: 1620752400, //Thời gian bắt đầu (format Unix Timestamp)
                                  end_time: 0, //Thời gian kết thúc (format Unix Timestamp) (0: Không giới hạn thời gian)
                                  daily_quota: 0, //Ngân sách hàng ngày (0: Không giới hạn)
                                  total_quota: 0, //Tổng ngân sách (0: Không giới hạn)
                                  status: 1 //Trạng thái (0: Đã xóa, 1: Hoạt động, 2: Tạm dừng, 3: Kết thúc)
                                },
                                advertisements: [
                                  {
                                    itemid: item_id_list.item_id_list[0], //Mã sản phẩm
                                    status: 1, //1: Bật quảng cáog, 2: Tắt quảng cáo
                                    placement: 4, //Phạm vị từ khóa (4: Tự động, 0: Thủ công)
                                    extinfo: {
                                      target_roi: 0, //Bỏ object này trường hợp quảng cáo đấu thầu từ khóa thủ công (placement = 4)
                                      //keywords: [ //DBỏ object này trường hợp quảng cáo đấu thầu từ khóa tự động (placement = 0)
                                      //  {
                                      //    match_type: 1, //Loại từ khóa (0: Từ khóa chính xác, 1: Từ khóa mở rộng)
                                      //    status: 1, //Trạng thái (0: Đã xóa, 1: Đang hoạt động)
                                      //    price: 480.00, //Giá đấu thầu
                                      //    keyword: "Quần lót ren", //Từ khóa
                                      //    algorithm: "kwrcmdv2" //Giá trị mặc định
                                      //  }
                                      //],
                                      //target: {}, //DBỏ object này trường hợp quảng cáo đấu thầu từ khóa tự động (placement = 0)
                                      //shop_customisation: {} //DBỏ object này trường hợp quảng cáo đấu thầu từ khóa tự động (placement = 0)
                                    }
                                  }
                                ]
                              }
                            ],
                            ads_audit_event: 4 //Giá trị mặc định                        
                    };
                    //Thêm quảng cáo
                    var result_create = await shopeeApi.api_post_marketing_campaign(SPC_CDS, UserAgent, cookie, campaign_ads_list)
                    console.log(JSON.stringify(result_create));
                }
            }
        }
        else {
            console.log(JSON.stringify(result));
        }
        */
        //#endregion Quảng cáo đấu thầu từ khóa: Thêm/Sửa quảng cáo 

        //#region Quảng cáo đấu thầu từ khóa: Lấy số liệu thống kê chung
        /*
        var start_time = 1618246800; //Thời gian bắt đầu (format Unix Timestamp)
        var end_time = 1620838799; //Thời gian kết thúc (format Unix Timestamp)
        var placement_list = [0,4]; //Loại quảng cáo
        var agg_interval = 96; //Giá trị mặc định
        result = await shopeeApi.api_get_shop_report_by_time(SPC_CDS, UserAgent, cookie, start_time, end_time, placement_list, agg_interval);
        console.log(JSON.stringify(result));
        */
        //#endregion Quảng cáo đấu thầu từ khóa: Lấy số liệu thống kê chung

        //#region Quảng cáo đấu thầu từ khóa: Lấy số liệu thống kê chi tiết
        /*
        var campaign_type = 'keyword'; //Loại quảng cáo
        var filter_content = 'all'; //all: Tất cả, scheduled: Chưa chạy, ongoing: Đang chạy, paused: Tạm dừng, ended: Kết thúc

        var sort_key = 'impression';        
        //mtime: Ngân sách, impression: Số lượt xem, click: Số lượt click, ctr: Tỷ lệ click, broad_order: Số đơn hàng
        //direct_order: Đơn hàng trực tiếp, broad_order_amount: Sản phẩm đã bán, direct_order_amount: Sản phẩm đã bán trực tiếp
        //broad_gmv: GMV, direct_gmv: GMV trực tiếp, cost: Chi phí, broad_roi: ROI, direct_roi: ROI trực tiếp
        //broad_cir: CIR, direct_cir: CIR trực tiếp

        var sort_direction = 1; //1: Sắp xếp giảm dần, 2: Sắp xếp tăng dần
        var search_content = ''; //Từ khóa tìm kiếm
        var start_time = 1618246800; //Thời gian bắt đầu (format Unix Timestamp)
        var end_time = 1620838799; //Thời gian kết thúc (format Unix Timestamp)
        var offset = 0; //Bắt đầu sản phẩm thứ n (Phân trang)
        var limit = 50; //Giới hạn số lượng dòng (Phân trang)
        result = await shopeeApi.api_get_campaign_statistics(SPC_CDS, UserAgent, cookie, campaign_type, filter_content, sort_key, sort_direction, search_content, start_time, end_time, offset, limit)
        console.log(JSON.stringify(result));
        */
        //#endregion Quảng cáo đấu thầu từ khóa: Lấy số liệu thống kê chi tiết

        //#region Quảng cáo đấu thầu từ khóa: Lấy số liệu thống kê theo mã sản phẩm
        /*
        var start_time = 1618246800; //Thời gian bắt đầu (format Unix Timestamp)
        var end_time = 1620838799; //Thời gian kết thúc (format Unix Timestamp)
        var placement_list = [0,4]; //Loại quảng cáo
        var agg_interval = 12; //Giá trị mặc định
        var itemid = 5161299530; //Mã sản phẩm

        result = await shopeeApi.api_get_detail_report_by_time(SPC_CDS, UserAgent, cookie, start_time, end_time, placement_list, agg_interval, itemid, null);
        console.log(JSON.stringify(result));  

        placement_list = [0]; //Loại quảng cáo
        agg_interval = 576; //Giá trị mặc định
        var need_detail = 0; //Giá trị mặc định

        result = await shopeeApi.api_get_detail_report_by_keyword(SPC_CDS, UserAgent, cookie, start_time, end_time, placement_list, agg_interval, need_detail, itemid, null);
        console.log(JSON.stringify(result));  
        */
        //#endregion Quảng cáo đấu thầu từ khóa: Lấy số liệu thống kê theo mã sản phẩm

        //#region Quảng cáo ads shop: Thêm/Sửa quảng cáo

        //Thêm quảng cáo
        /*
        var campaign_ads_list = {
            campaign_ads_list: [
              {
                campaign: {
                  start_time: 1620752400, //Thời gian bắt đầu (format Unix Timestamp)
                  end_time: 0, //Thời gian kết thúc (format Unix Timestamp) (0: Không giới hạn thời gian)
                  daily_quota: 0, //Ngân sách hàng ngày (0: Không giới hạn)
                  total_quota: 0, //Tổng ngân sách (0: Không giới hạn)
                  status: 1, //Trạng thái (0: Đã xóa, 1: Hoạt động, 2: Tạm dừng, 3: Kết thúc)
                  name: 'Tên quảng cáo 7' //Tên quảng không được trùng tên
                },
                advertisements: [
                  {
                    status: 1, //1: Bật quảng cáog, 2: Tắt quảng cáo
                    placement: 3, //Phạm vị từ khóa
                    extinfo: {
                      keywords: [
                        {
                          match_type: 1, //Loại từ khóa (0: Từ khóa chính xác, 1: Từ khóa mở rộng)
                          keyword: 'quần lót nữ cotton', //Từ khóa
                          price: 710, //Giá đấu thầu
                          status: 1 //Trạng thái (0: Đã xóa, 1: Đang hoạt động)
                        }
                      ],
                      shop_customisation: {
                        display_title: 'Khẩu hiệu quảng cáo', //Khẩu hiệu quảng cáo
                        collection_id: 0, //0: Trang chủ shop mặc định (Hoặc mã danh mục của shop)
                      }
                    }
                  }
                ]
              }
            ],
            "ads_audit_event": 11
        };
        var result_create = await shopeeApi.api_post_marketing_campaign(SPC_CDS, UserAgent, cookie, campaign_ads_list)
        console.log(JSON.stringify(result_create));
        */

        //Sửa quảng cáo
        /*
        var campaignid = 7514050;
        
        //Lấy thông tin quảng cáo đấu đầu từ khóa theo mã
        var result_get = await shopeeApi.api_get_marketing_campaign(SPC_CDS, UserAgent, cookie, campaignid);
        if(result_get.status == 200) {

            //Khởi tạo đối tượng quảng cáo
            var campaign_ads_list = {
                campaign_ads_list: [
                    {
                        advertisements: result_get.data.data.advertisements,
                        campaign: result_get.data.data.campaign
                    }
                ]
            };                        
            campaign_ads_list.ads_audit_event = 12;

            campaign_ads_list.campaign_ads_list[0].start_time = 1620752400; //Thời gian bắt đầu (format Unix Timestamp)
            campaign_ads_list.campaign_ads_list[0].end_time = 0; //Thời gian kết thúc (format Unix Timestamp) (0: Không giới hạn thời gian)
            campaign_ads_list.campaign_ads_list[0].daily_quota = 0; //Ngân sách hàng ngày (0: Không giới hạn)
            campaign_ads_list.campaign_ads_list[0].total_quota = 0; //Tổng ngân sách (0: Không giới hạn)
            campaign_ads_list.campaign_ads_list[0].campaign.status = 2; //Trạng thái (0: Đã xóa, 1: Hoạt động, 2: Tạm dừng, 3: Kết thúc)
            var result_update = await shopeeApi.api_put_marketing_campaign(SPC_CDS, UserAgent, cookie, campaign_ads_list)
            console.log(JSON.stringify(result_update));
        }
        else {
            console.log(JSON.stringify(result_get));
        }
        */
        //#endregion Quảng cáo ads shop: Thêm/Sửa quảng cáo

        //#region Quảng cáo ads shop: Lấy số liệu thống kê chung
        /*
        var start_time = 1618246800; //Thời gian bắt đầu (format Unix Timestamp)
        var end_time = 1620838799; //Thời gian kết thúc (format Unix Timestamp)
        var placement_list = [3]; //Loại quảng cáo
        var agg_interval = 96; //Giá trị mặc định
        result = await shopeeApi.api_get_shop_report_by_time(SPC_CDS, UserAgent, cookie, start_time, end_time, placement_list, agg_interval);
        console.log(JSON.stringify(result));
        */
        //#endregion Quảng cáo ads shop: Lấy số liệu thống kê chung

        //#region Quảng cáo ads shop: Lấy số liệu thống kê chi tiết
        /*
        var campaign_type = 'shop'; //Loại quảng cáo
        var filter_content = 'all'; //all: Tất cả, scheduled: Chưa chạy, ongoing: Đang chạy, paused: Tạm dừng, ended: Kết thúc

        var sort_key = 'impression';        
        //mtime: Ngân sách, impression: Số lượt xem, click: Số lượt click, ctr: Tỷ lệ click, broad_order: Số đơn hàng
        //direct_order: Đơn hàng trực tiếp, broad_order_amount: Sản phẩm đã bán, direct_order_amount: Sản phẩm đã bán trực tiếp
        //broad_gmv: GMV, direct_gmv: GMV trực tiếp, cost: Chi phí, broad_roi: ROI, direct_roi: ROI trực tiếp
        //broad_cir: CIR, direct_cir: CIR trực tiếp
        
        var sort_direction = 1; //1: Sắp xếp giảm dần, 2: Sắp xếp tăng dần
        var search_content = ''; //Từ khóa tìm kiếm
        var start_time = 1618246800; //Thời gian bắt đầu (format Unix Timestamp)
        var end_time = 1620838799; //Thời gian kết thúc (format Unix Timestamp)
        var offset = 0; //Bắt đầu sản phẩm thứ n (Phân trang)
        var limit = 50; //Giới hạn số lượng dòng (Phân trang)
        result = await shopeeApi.api_get_campaign_statistics(SPC_CDS, UserAgent, cookie, campaign_type, filter_content, sort_key, sort_direction, search_content, start_time, end_time, offset, limit)
        console.log(JSON.stringify(result));
        */
        //#endregion Quảng cáo ads shop: Lấy số liệu thống kê chi tiết

        //#region Quảng cáo ads shop: Lấy số liệu thống kê theo quảng cáo
        /*
        var start_time = 1620838800; //Thời gian bắt đầu (format Unix Timestamp)
        var end_time = 1620925199; //Thời gian kết thúc (format Unix Timestamp)
        var placement_list = [3]; //Loại quảng cáo
        var agg_interval = 1; //Giá trị mặc định
        var adsid = 13667061; //Mã quảng cáo

        result = await shopeeApi.api_get_detail_report_by_time(SPC_CDS, UserAgent, cookie, start_time, end_time, placement_list, agg_interval, null, adsid);
        //console.log(JSON.stringify(result));  

        placement_list = [3]; //Loại quảng cáo
        agg_interval = 96; //Giá trị mặc định
        var need_detail = 0; //Giá trị mặc định

        result = await shopeeApi.api_get_detail_report_by_keyword(SPC_CDS, UserAgent, cookie, start_time, end_time, placement_list, agg_interval, need_detail, null, adsid);
        console.log(JSON.stringify(result));  
        */
        //#endregion Quảng cáo ads shop: Lấy số liệu thống kê theo quảng cáo


        //#region Quảng cáo khám phá: Thêm/Sửa quảng cáo  
        /*
        //Khởi tạo danh sách mã sản phẩm
        var item_id_list = {
            item_id_list: [6260862101]
        }; 

        //Lấy danh sách quảng cáo của sản phẩm
        result = await shopeeApi.api_get_item_status(SPC_CDS, UserAgent, cookie, item_id_list);

        if(result.status == 200) {
            
            for(var i = 0; i < result.data.data.length; i++) {

                var ads_list = result.data.data[i].ads_list.filter (function (d) {                       
                    return d.placement === 1 || d.placement === 2 || d.placement === 5 || d.placement === 8;
                    //Lọc quảng cáo khám phá (1: Sản phẩm tương tự, 2: Gợi ý hôm nay, 5: Có thể bạn cũng thích, 8: Tự động)
                });
                
                //Kiểm tra sản phẩm này đã tồn tại quảng cáo khám phá
                if(ads_list.length > 0) { //Đã tồn khám phá cho sản phẩm này => Cập nhật                  

                    //Lấy mã quảng cáo khám phá
                    var campaignid = ads_list[0].campaignid;

                    //Lấy thông tin quảng cáo khám phá theo mã
                    result_get = await shopeeApi.api_get_marketing_campaign(SPC_CDS, UserAgent, cookie, campaignid);
                    if(result_get.status == 200) {

                        //Khởi tạo đối tượng quảng cáo
                        var campaign_ads_list = {
                            campaign_ads_list: [
                                {
                                    advertisements: result_get.data.data.advertisements,
                                    campaign: result_get.data.data.campaign
                                }
                            ]
                        };                        
                        campaign_ads_list.ads_audit_event = 6;
                        
                        //Bật & Tắt quảng cáo khám phá
                        var ads_info = campaign_ads_list.campaign_ads_list[0].advertisements.filter (function (d) {                       
                            return d.placement === 1; //Lọc quảng cáo khám phá (1: Sản phẩm tương tự, 2: Gợi ý hôm nay, 5: Có thể bạn cũng thích, 8: Tự động)
                        });

                        //Lưu ý:
                        //- Khi bật quảng cáo tự động phải duyệt dữ liệu tắt hết các loại quảng cáo còn lại
                        //- Khi bật quảng cáo còn lại phải tắt quảng cáo tự động

                        //Kiểm tra sản phẩm này đã tồn tại quảng cáo khám phá sản phẩm tương tự chưa
                        if(ads_info.length > 0) { //Đã tồn tại quảng cáo khám phá sản phẩm tương tự => Cập nhật
                            ads_info[0].status = 1; //1: Bật quảng cáo, 2: Tắt quảng cáo
                            //ads_info[0].extinfo.target.premium_rate = 50; //Tỉ lệ % giá thầu (Không dùng cho quảng cáo khám phá tự động)
                            //ads_info[0].extinfo.target.base_price = 500; //Giá thầu căn cứ (Không dùng cho quảng cáo khám phá tự động)
                            //ads_info[0].extinfo.target.price = 750; //Giá thầu theo tỉ lệ tăng (Không dùng cho quảng cáo khám phá tự động)
                        } else { //Chưa tồn tại quảng cáo khám phá sản phẩm tương tự => Thêm mới
                            campaign_ads_list.campaign_ads_list[0].advertisements.push({
                                itemid: item_id_list.item_id_list[0],
                                status: 1, //Trạng thái quảng cáo (0: Đã xóa, 1: Hoạt động, 2: Tạm dừng, 3: Kết thúc)
                                placement: 1, //Loại quảng cáo khám phá (1: Sản phẩm tương tự, 2: Gợi ý hôm nay, 5: Có thể bạn cũng thích, 8: Tự động)
                                campaignid: campaign_ads_list.campaign_ads_list[0].campaign.campaignid, //Mã quảng cáo đấu thầu từ khóa
                                extinfo: {  //(Bỏ object này nếu là quảng cáo khám phá tự động)
                                    target: {
                                        premium_rate: 50, //Tỉ lệ % giá thầu
                                        base_price: 500, //Giá thầu căn cứ
                                        price: 750 //Giá thầu theo tỉ lệ tăng  
                                    }
                                }
                            });
                        }

                        campaign_ads_list.campaign_ads_list[0].start_time = 1620752400; //Thời gian bắt đầu (format Unix Timestamp)
                        campaign_ads_list.campaign_ads_list[0].end_time = 0; //Thời gian kết thúc (format Unix Timestamp) (0: Không giới hạn thời gian)
                        campaign_ads_list.campaign_ads_list[0].daily_quota = 0; //Ngân sách hàng ngày (0: Không giới hạn)
                        campaign_ads_list.campaign_ads_list[0].total_quota = 0; //Tổng ngân sách (0: Không giới hạn)
                        campaign_ads_list.campaign_ads_list[0].campaign.status = 2; //Trạng thái (0: Đã xóa, 1: Hoạt động, 2: Tạm dừng, 3: Kết thúc)

                        //Cập nhật quảng cáo
                        var result_update = await shopeeApi.api_put_marketing_campaign(SPC_CDS, UserAgent, cookie, campaign_ads_list);
                        console.log(JSON.stringify(result_update));
                    }
                    else {
                        console.log(JSON.stringify(result_get));
                    }
                } else { //Chưa có quảng cáo khám phá cho sản phẩm này => Thêm mới
                    //Khởi tạo đối tượng quảng cáo
                    var campaign_ads_list = {
                            campaign_ads_list: [
                              {
                                campaign: {
                                  campaignid: null, //ID để trống
                                  start_time: 1620752400, //Thời gian bắt đầu (format Unix Timestamp)
                                  end_time: 0, //Thời gian kết thúc (format Unix Timestamp) (0: Không giới hạn thời gian)
                                  daily_quota: 0, //Ngân sách hàng ngày (0: Không giới hạn)
                                  total_quota: 0, //Tổng ngân sách (0: Không giới hạn)
                                  status: 1 //Trạng thái (0: Đã xóa, 1: Hoạt động, 2: Tạm dừng, 3: Kết thúc)
                                },
                                advertisements: [
                                  {
                                    itemid: item_id_list.item_id_list[0], //Mã sản phẩm
                                    status: 1, //1: Bật quảng cáo, 2: Tắt quảng cáo
                                    placement: 8, //Loại quảng cáo (1: Sản phẩm tương tự, 2: Gợi ý hôm nay, 5: Có thể bạn cũng thích, 8: Tự động)
                                    //extinfo: {  //(Bỏ object này nếu là quảng cáo khám phá tự động)
                                    //    target: {
                                    //        premium_rate: 20, //Tỉ lệ % giá thầu
                                    //        base_price: 0, //Giá thầu căn cứ
                                    //        price: 0 //Giá thầu theo tỉ lệ tăng  
                                    //    }
                                    //}
                                  }
                                ]
                              }
                            ],
                            ads_audit_event: 4 //Giá trị mặc định                        
                    };
                    //Thêm quảng cáo
                    var result_create = await shopeeApi.api_post_marketing_campaign(SPC_CDS, UserAgent, cookie, campaign_ads_list)
                    console.log(JSON.stringify(result_create));
                }
            }
        }
        else {
            console.log(JSON.stringify(result));
        }
        */
        //#endregion Quảng cáo khám phá: Thêm/Sửa quảng cáo 

        //#region Quảng cáo khám phá: Lấy số liệu thống kê chung
        /*
        var start_time = 1618246800; //Thời gian bắt đầu (format Unix Timestamp)
        var end_time = 1620838799; //Thời gian kết thúc (format Unix Timestamp)
        var placement_list = [1,2,5,8]; //Loại quảng cáo
        var agg_interval = 96; //Giá trị mặc định
        result = await shopeeApi.api_get_shop_report_by_time(SPC_CDS, UserAgent, cookie, start_time, end_time, placement_list, agg_interval);
        console.log(JSON.stringify(result));
        */
        //#endregion Quảng cáo khám phá: Lấy số liệu thống kê chung

        //#region Quảng cáo khám phá: Lấy số liệu thống kê chi tiết
        /*
        var campaign_type = 'targeting'; //Loại quảng cáo
        var filter_content = 'all'; //all: Tất cả, scheduled: Chưa chạy, ongoing: Đang chạy, paused: Tạm dừng, ended: Kết thúc

        var sort_key = 'impression';        
        //mtime: Ngân sách, impression: Số lượt xem, click: Số lượt click, ctr: Tỷ lệ click, broad_order: Số đơn hàng
        //direct_order: Đơn hàng trực tiếp, broad_order_amount: Sản phẩm đã bán, direct_order_amount: Sản phẩm đã bán trực tiếp
        //broad_gmv: GMV, direct_gmv: GMV trực tiếp, cost: Chi phí, broad_roi: ROI, direct_roi: ROI trực tiếp
        //broad_cir: CIR, direct_cir: CIR trực tiếp

        var sort_direction = 1; //1: Sắp xếp giảm dần, 2: Sắp xếp tăng dần
        var search_content = ''; //Từ khóa tìm kiếm
        var start_time = 1618246800; //Thời gian bắt đầu (format Unix Timestamp)
        var end_time = 1620838799; //Thời gian kết thúc (format Unix Timestamp)
        var offset = 0; //Bắt đầu sản phẩm thứ n (Phân trang)
        var limit = 50; //Giới hạn số lượng dòng (Phân trang)
        result = await shopeeApi.api_get_campaign_statistics(SPC_CDS, UserAgent, cookie, campaign_type, filter_content, sort_key, sort_direction, search_content, start_time, end_time, offset, limit)
        console.log(JSON.stringify(result));
        */
        //#endregion Quảng cáo khám phá: Lấy số liệu thống kê chi tiết

        //#region Quảng cáo khám phá: Lấy số liệu thống kê theo mã sản phẩm
        /*
        var start_time = 1618246800; //Thời gian bắt đầu (format Unix Timestamp)
        var end_time = 1620838799; //Thời gian kết thúc (format Unix Timestamp)
        var placement_list = [1,2,5,8]; //Loại quảng cáo
        var agg_interval = 96; //Giá trị mặc định
        var itemid = 5161299530; //Mã sản phẩm

        result = await shopeeApi.api_get_item_report_by_time(SPC_CDS, UserAgent, cookie, start_time, end_time, placement_list, agg_interval, itemid);
        //console.log(JSON.stringify(result));  

        result = await shopeeApi.api_get_item_report_by_placement(SPC_CDS, UserAgent, cookie, start_time, end_time, placement_list, itemid);
        console.log(JSON.stringify(result));  
        */
        //#endregion Quảng cáo khám phá: Lấy số liệu thống kê theo mã sản phẩm

        //#region Lấy danh sách quảng cáo
        /*
        var placement_list = [3]; //Loại quảng cáo
        result = await shopeeApi.api_get_campaign_list(SPC_CDS, UserAgent, cookie, placement_list);
        console.log(JSON.stringify(result));
        */
        //#endregion Lấy danh sách nhóm shop đang sử dụng

        //#region Quảng cáo: Từ khóa gợi ý theo mã loại quảng cáo
        /*
        var keyword = 'quần lót ren'; //Từ khóa tìm kiếm
        var count = 20; //Số lượng dòng hiển thị
        var placement = 3; //Loại quảng cáo
        var itemid = null;
        result = await shopeeApi.api_get_suggest_keyword(SPC_CDS, UserAgent, cookie, keyword, count, placement, itemid);
        console.log(JSON.stringify(result));
        */
        //#endregion Quảng cáo: Từ khóa gợi ý theo mã loại quảng cáo
        
        //#region Lấy thông tin của 1 quảng cáo
        /*
        var campaignid = 4243550;
        result = await shopeeApi.api_get_marketing_campaign(SPC_CDS, UserAgent, cookie, 4243550);
        console.log(JSON.stringify(result));   
        */
        //#endregion Lấy thông tin của 1 quảng cáo
        
        //#region Lấy danh mục của shopee
        /*
        result = await shopeeApi.api_get_all_category_list(SPC_CDS, UserAgent, cookie);
        console.log(JSON.stringify(result));    
        */
        //#endregion Lấy danh mục của shopee

        //#region Lấy danh mục cấp độ 2 của shopee
        /*
        result = await shopeeApi.api_get_second_category_list(SPC_CDS, UserAgent, cookie);
        console.log(JSON.stringify(result));
        */
        //#endregion Lấy danh mục cấp độ 2 của shopee

        //#region Lấy danh sách nhóm shop đang sử dụng
        /*
        var page_number = 1; //Trang số (Phân trang)
        var page_size = 100; //Giới hạn số lượng dòng (Phân trang)
        result = await shopeeApi.api_get_shopcategory(SPC_CDS, UserAgent, cookie, page_number, page_size);
        console.log(JSON.stringify(result));
        */
        //#endregion Lấy danh sách nhóm shop đang sử dụng

        //#region Lấy danh sách sản phẩm
        /*
        var offset = 0; //Bắt đầu sản phẩm thứ n (Phân trang)
        var limit = 50; //Giới hạn số lượng dòng (Phân trang)
        var is_ads = 1; //Giá trị mặc định 1
        var need_brand = 0; //Giá trị mặc định 0
        var need_item_model = 0; //Giá trị mặc định 0
        var search_type = null; //0: Tìm theo tên, 1: Tìm theo mã
        var search_content = null; //Từ khóa tìm kiếm
        result = await shopeeApi.api_get_product_selector(SPC_CDS, UserAgent, cookie, offset, limit, is_ads, need_brand, need_item_model, search_type, search_content);
        console.log(JSON.stringify(result));
        */
        //#endregion Lấy danh sách sản phẩm
    }
    else {
        console.log(JSON.stringify(result));
    }

 })();
