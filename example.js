const { v4: uuidv4 } = require('uuid');
const prompt = require('prompt');
var shopeeApi = require('./api/ads_shopee.js');
//EXAMPLE
(async()=>{

    const UserAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4503.5 Safari/537.36';
    //Thông tin đăng nhập
    const SPC_CDS = uuidv4();
    var username = 'lozita.official'; //Tên người dùng
    var password = 'Longgiang96137'; //Mật khẩu
//    var username = '0962986537';
//    var password = 'TanQuang@161994';
    //Đăng nhập 
    var result = await shopeeApi.api_post_login(SPC_CDS, UserAgent, username, password, null);       
    //Kiểm tra yêu cầu OTP
    if(result.status == 481) {
        const { OTP } = await prompt.get(['OTP']);
        //Đăng nhập với OTP
        result = await shopeeApi.api_post_login(SPC_CDS, UserAgent, username, password, OTP);
    }
    
    if(result.status == 200) {
        //Đăng nhập thành công lấy cookie
        var cookie = result.cookie;
        
        //Quảng cáo tìm kiếm sản phẩm: Thêm/Sửa quảng cáo
        //Lấy danh sách quảng cáo của sản phẩm
        var item_id_list = {
            item_id_list: [6760786744]
        }; //Danh sách mã sản phẩm
        
        result = await shopeeApi.api_get_item_status(SPC_CDS, UserAgent, cookie, item_id_list);

        if(result.status == 200) {
            for(var i = 0; i < result.data.data.length; i++) {
                //Kiểm tra sản phẩm đã tồn tại quảng cáo tìm kiếm sản phẩm
                var ads_list = result.data.data[i].ads_list.filter (function (d) {                       
                    return d.placement === 4 || d.placement === 0;
                });

                if(ads_list.length > 0) {
                    //Đã có quảng cáo tìm kiếm cho sản phẩm này
                    var campaignid = ads_list[0].campaignid;                    
                    //Lấy thông tin quảng cáo
                    result_get = await shopeeApi.api_get_marketing_campaign(SPC_CDS, UserAgent, cookie, campaignid);
                    if(result_get.status == 200) {
                        
                        var campaign_ads_list = {
                            campaign_ads_list: [
                                {
                                    advertisements: result_get.data.data.advertisements,
                                    campaign: result_get.data.data.campaign
                                }
                            ]
                        };                        
                        campaign_ads_list.ads_audit_event = 6; //Giá trị mặc định
                        
                        //Bật & Tắt quảng cáo tự động
                        var ads_auto = campaign_ads_list.campaign_ads_list[0].advertisements.filter (function (d) {                       
                            return d.placement === 4;
                        });

                        if(ads_auto.length > 0) {
                            ads_auto[0].status = 2; //1: Bật quảng cáo tự động, 2: Tắt quảng cáo tự động
                        } else {
                            campaign_ads_list.campaign_ads_list[0].advertisements.push({
                                itemid: item_id_list.item_id_list[0],
                                status: 2, //1: Bật quảng cáo tự động, 2: Tắt quảng cáo tự động
                                placement: 4,
                                campaignid: campaign_ads_list.campaign_ads_list[0].campaign.campaignid
                            });
                        }

                        //Thêm & tắt từ khóa thủ công
                        var ads_manual = campaign_ads_list.campaign_ads_list[0].advertisements.filter (function (d) {                       
                            return d.placement === 0;
                        });

                        if(ads_manual.length > 0) {
                            var ads_key =  ads_manual[0].extinfo.keywords.filter (function (d) {                       
                                return d.keyword === "từ khóa tìm kiếm 2";
                            });
                            if(ads_key.length > 0) {
                                //Điều chỉnh từ khóa
                                ads_key[0].status = 1;
                                ads_key[0].price = 500.00;
                            } else {
                                //Thêm từ khóa
                                ads_manual[0].extinfo.keywords.push({
                                    match_type: 1, //Loại từ khóa (0: Từ khóa chính xác, 1: Từ khóa mở rộng)
                                    status: 1, //Trạng thái (0: Đã xóa, 1: Đang hoạt động)
                                    price: 480.00, //Giá đấu thầu
                                    keyword: "từ khóa tìm kiếm 2", //Từ khóa
                                    algorithm: "kwrcmdv2" //Giá trị mặc định
                                });
                            }
                        } else {
                            campaign_ads_list.campaign_ads_list[0].advertisements.push({
                                itemid: item_id_list.item_id_list[0],
                                status: 1,
                                placement: 0,
                                campaignid: campaign_ads_list.campaign_ads_list[0].campaign.campaignid,
                                extinfo: {
                                    target_roi: 0,
                                    keywords: [ //Danh sách từ khóa
                                      {
                                        match_type: 1, //Loại từ khóa (0: Từ khóa chính xác, 1: Từ khóa mở rộng)
                                        status: 1, //Trạng thái (0: Đã xóa, 1: Đang hoạt động)
                                        price: 480.00, //Giá đấu thầu
                                        keyword: "Từ khóa tìm kiếm", //Từ khóa
                                        algorithm: "kwrcmdv2" //Giá trị mặc định
                                      }
                                    ],
                                    target: {},
                                    shop_customisation: {}
                                }
                            });
                        }


                        campaign_ads_list.campaign_ads_list[0].campaign.status = 2; //Điều chỉnh trạng thái quảng cáo (0: Đã xóa, 1: Hoạt động, 2: Tạm dừng, 3: Kết thúc)                        
                        campaign_ads_list.campaign_ads_list[0].campaign.end_time = 0; //Điều chỉnh thời gian kết thúc
                        
                        console.log(JSON.stringify(campaign_ads_list));
                        //Cập nhật quảng cáo
                        var result_update = await shopeeApi.api_put_marketing_campaign(SPC_CDS, UserAgent, cookie, campaign_ads_list);
                    }
                    else {
                        console.log(JSON.stringify(result_get));
                    }
                } else {
                    //Chưa có quảng cáo tìm kiếm cho sản phẩm này
                    //Khởi tạo quảng cáo mới
                    var campaign_ads_list = {
                            campaign_ads_list: [
                              {
                                campaign: {
                                  campaignid: null, //ID để trống
                                  start_time: 1620752400, //Thời gian bắt đầu (format Unix Timestamp)
                                  end_time: 0, //Thời gian kết thúc (format Unix Timestamp) (0: Không giới hạn thời gian)
                                  daily_quota: 0, //Ngân sách hàng ngày (0: Không giới hạn)
                                  total_quota: 0, //Tổng ngân sách (0: Không giới hạn)
                                  status: 1 //Trạng thái mặc định 1
                                },
                                advertisements: [
                                  {
                                    itemid: item_id_list.item_id_list[0], //Mã sản phẩm
                                    status: 1, //Trạng thái mặc định 1
                                    placement: 4, //Phạm vị từ khóa (4: Tự động, 0: Thủ công)
                                    extinfo: {
                                      target_roi: 0,
                                      /*keywords: [ //Danh sách từ khóa bỏ object này trường hợp từ khóa tự động
                                        {
                                          match_type: 1, //Loại từ khóa (0: Từ khóa chính xác, 1: Từ khóa mở rộng)
                                          status: 1, //Trạng thái (0: Đã xóa, 1: Đang hoạt động)
                                          price: 480.00, //Giá đấu thầu
                                          keyword: "Quần lót ren", //Từ khóa
                                          algorithm: "kwrcmdv2" //Giá trị mặc định
                                        }
                                      ],
                                      target: {},
                                      shop_customisation: {}*/
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

        //Quảng cáo tìm kiếm sản phẩm: Từ khóa gợi ý theo mã sản phẩm
        //var keyword = 'quần lót ren'; //Từ khóa tìm kiếm
        //var count = 20; //Số lượng dòng hiển thị
        //var placement = 0; //Giá trị mặc định
        //var itemid = 4760840499; //Mã sản phẩm
        //result = await shopeeApi.api_get_suggest_keyword(SPC_CDS, UserAgent, cookie, keyword, count, placement, itemid);
        //console.log(JSON.stringify(result));

        //Quảng cáo tìm kiếm sản phẩm: Lấy số liệu thống kê chung
        //var start_time = 1618246800; //Thời gian bắt đầu (format Unix Timestamp)
        //var end_time = 1620838799; //Thời gian kết thúc (format Unix Timestamp)
        //var placement_list = [0,4]; //Giá trị mặc định
        //var agg_interval = 96; //Giá trị mặc định
        //result = await shopeeApi.api_get_shop_report_by_time(SPC_CDS, UserAgent, cookie, start_time, end_time, placement_list, agg_interval);
        //console.log(JSON.stringify(result));
        
        /*Quảng cáo tìm kiếm sản phẩm: Lấy số liệu thống kê chi tiết*/
        //var campaign_type = 'keyword'; /*Giá trị mặc định*/
        //var filter_content = 'all'; /*all: Tất cả, scheduled: Chưa chạy, ongoing: Đang chạy, paused: Tạm dừng, ended: Kết thúc*/

        //var sort_key = 'impression';        
        /*mtime: Ngân sách, impression: Số lượt xem, click: Số lượt click, ctr: Tỷ lệ click, broad_order: Số đơn hàng*/
        /*direct_order: Đơn hàng trực tiếp, broad_order_amount: Sản phẩm đã bán, direct_order_amount: Sản phẩm đã bán trực tiếp*/
        /*broad_gmv: GMV, direct_gmv: GMV trực tiếp, cost: Chi phí, broad_roi: ROI, direct_roi: ROI trực tiếp*/
        /*broad_cir: CIR, direct_cir: CIR trực tiếp*/

        //var sort_direction = 1; //1: Sắp xếp giảm dần, 2: Sắp xếp tăng dần
        //var search_content = ''; //Từ khóa tìm kiếm
        //var start_time = 1618246800; //Thời gian bắt đầu (format Unix Timestamp)
        //var end_time = 1620838799; //Thời gian kết thúc (format Unix Timestamp)
        //var offset = 0; //Bắt đầu sản phẩm thứ n (Phân trang)
        //var limit = 50; //Giới hạn số lượng dòng (Phân trang)
        //result = await shopeeApi.api_get_campaign_statistics(SPC_CDS, UserAgent, cookie, campaign_type, filter_content, sort_key, sort_direction, search_content, start_time, end_time, offset, limit)
        //console.log(JSON.stringify(result));


        //Lấy danh sách tất cả nhóm
        //result = await shopeeApi.api_get_all_category_list(SPC_CDS, UserAgent, cookie, version);
        //console.log(JSON.stringify(result));    

        //Lấy danh sách tất cả nhóm 2
        //result = await shopeeApi.api_get_second_category_list(SPC_CDS, UserAgent, cookie, version);
        //console.log(JSON.stringify(result));
        

        //Lấy danh sách nhóm shop đang sử dụng
        //var page_number = 1; //Trang số (Phân trang)
        //var page_size = 100; //Giới hạn số lượng dòng (Phân trang)
        //result = await shopeeApi.api_get_shopcategory(SPC_CDS, UserAgent, cookie, page_number, page_size);
        //console.log(JSON.stringify(result));

        //Lấy danh sách sản phẩm để chọn
        //var offset = 0; //Bắt đầu sản phẩm thứ n (Phân trang)
        //var limit = 50; //Giới hạn số lượng dòng (Phân trang)
        //var is_ads = 1; //Giá trị mặc định 1
        //var need_brand = 0; //Giá trị mặc định 0
        //var need_item_model = 0; //Giá trị mặc định 0
        //var search_type = null; //0: Tìm theo tên, 1: Tìm theo mã
        //var search_content = null; //Từ khóa tìm kiếm
        //result = await shopeeApi.api_get_product_selector(SPC_CDS, UserAgent, cookie, offset, limit, is_ads, need_brand, need_item_model, search_type, search_content);
        //console.log(JSON.stringify(result));
    }
    else {
        console.log(JSON.stringify(result));
    }

 })();
