var express = require("express");
var app = express();
app.use(express.static("public")); // Sử dụng folder public chứa các file của hệ thống 
app.set('view engine', 'ejs'); // Sử dụng view engine là công nghệ để hiển thị web
app.set("views","./views"); // Sử dụng folder views là nơi để chứa giao diện web

var bodyParser = require("body-parser"); // POST
var urlencodedParser = bodyParser.urlencoded({ extended: false });
app.use(bodyParser.json({ type: 'application/json' }));
//app.use(bodyParser.urlencoded({ extended: false })); // POST

var db = require("./db/db"); // Include file db.js để dùng các function truy xuất db (library tự tạo)

var server = require("http").Server(app); // Khởi tạo server HTTP
var io = require("socket.io")(server); // Khởi tạo socket
server.listen(process.env.PORT || 3000, () => { // Server sẽ chạy trên port 3000 trong hệ thống mạng
   console.log('listening on *:3000');
});

// Hàm để lắng nghe sự kiện từ các CLIENTS
io.on("connection", function(socket)
{
  // Xuất ra terminal id của CLIENTS kết nối tới
  console.log("Client connected: " + socket.id);

  // Xuất ra terminal id của CLIENTS vừa ngắt kết nối
  socket.on("disconnect", function() {
    console.log(socket.id + " disconnected");
  });

  // Lắng nghe route "DisplaySensorsValue" từ các CLIENTS
  // Hàm này gửi các giá trị cảm biến cho CLIENT
  socket.on("DisplaySensorsValue",function(){
    async function DisplaySensorsValueFn() {
      result = await db.queryDisplaySensorsValue(); // Truy vấn giá trị cảm biến
      if(result != "queryDisplaySensorsValue-ERROR")
        socket.emit("SensorsData",result); // Gửi giá trị đến CLIENT nào đã gọi route này
      else console.log(result);
    }  
    DisplaySensorsValueFn(); // Thực thi
  });

  // Lắng nghe route "DisplayDevicesStt" từ các CLIENTS
  // Hàm này gửi các giá trị trạng thái của các thiết bị cho CLIENT
  socket.on("DisplayDevicesStt", function() {
    async function DisplayDevicesSttFn() {
      result = await db.queryDisplayDevicesStt(); // Truy vấn giá trị trạng thái
      if(result != "queryDisplayDevicesStt-ERROR")
        socket.emit("DevicesSttData",result); // Gửi giá trị đến CLIENT nào đã gọi route này
      else console.log(result);
    }  
    DisplayDevicesSttFn(); // Thực thi
  });

  // Lắng nghe route "DevicesControl" từ các CLIENTS
  // Hàm này nhận lệnh điều khiển, cập nhật vào DB và gửi các giá trị đó cho TẤT CẢ CLIENTS đang kết nối để hiển thị đồng loạt
  socket.on("DevicesControl", function(msg) {
    console.log(msg);
    async function DevicesControlFn() {
      result = await db.queryDevicesControl(msg); // Cập nhật vào DB
      if(result == "queryDevicesControl-OK")
      {
        result1 = await db.queryDisplayDevicesStt(); // Truy vấn giá trị trạng thái
        if(result1 != "queryDisplayDevicesStt-ERROR")
          io.sockets.emit("DevicesSttData",result1); // Gửi giá trị trạng thái đến TẤT CẢ CLIENTS đang kết nối
        else console.log(result1);
      }
      else console.log(result);
    }  
    DevicesControlFn(); // Thực thi
  });
  socket.on("DevicesControlNodeMCU", function(msg) {
    console.log(msg);
    var str = msg.split('.');
    const obj = {
      getDevicesName: str[0],
      getDevicesStt: Number(str[1])
    };
    async function DevicesControlFn() {
      result = await db.queryDevicesControl(obj); // Cập nhật vào DB
      if(result == "queryDevicesControl-OK")
      {
        result1 = await db.queryDisplayDevicesStt(); // Truy vấn giá trị trạng thái
        if(result1 != "queryDisplayDevicesStt-ERROR")
          io.sockets.emit("DevicesSttData",result1); // Gửi giá trị trạng thái đến TẤT CẢ CLIENTS đang kết nối
        else console.log(result1);
      }
      else console.log(result);
    } 
    DevicesControlFn(); // Thực thi
  });
  socket.on("update-status", function() {
    async function DevicesControlFn() {
      result1 = await db.queryDisplayDevicesStt(); // Truy vấn giá trị trạng thái
      if(result1 != "queryDisplayDevicesStt-ERROR"){
        io.sockets.emit("DevicesSttData",result1); // Gửi giá trị trạng thái đến TẤT CẢ CLIENTS đang kết nối
      }
      else console.log(result1);
    }
    DevicesControlFn(); // Thực thi
  });
  // Lắng nghe route "DisplayPlantAreas" từ các CLIENTS
  // Hàm này gửi các giá trị cây trồng cho CLIENT
  socket.on("DisplayPlantAreas", function() {
    async function DisplayPlantAreasFn() {
      result = await db.queryDisplayPlantAreas(); // Truy vấn giá trị cây trồng
      if(result != "queryDisplayPlantAreas-ERROR")
          socket.emit("PlantAreasData",result); // Gửi giá trị đến CLIENT nào đã gọi route này
      else console.log(result);
    }  
    DisplayPlantAreasFn(); // Thực thi
  });
  
  // Lắng nghe route "DelPlantAreas" từ các CLIENTS
  // Hàm này nhận cây sẽ xoá, cập nhật vào DB và gửi thông tin đó cho TẤT CẢ CLIENTS đang kết nối để hiển thị đồng loạt
  socket.on("DelPlantAreas", function(idPlant) {
    async function DelPlantAreasFn() {
      result = await db.queryDelPlantAreas(idPlant); // Cập nhật vào DB
      if(result == "queryDelPlantAreas-OK")
        {
          result1 = await db.queryDisplayPlantAreas(); // Truy vấn thông tin cây
          if(result1 != "queryDisplayPlantAreas-ERROR")
            io.sockets.emit("PlantAreasData",result1); // Gửi thông tin cây đến TẤT CẢ CLIENTS đang kết nối 
          else console.log(result1);
        }
      else console.log(result);
    }  
    DelPlantAreasFn(); // Thực thi
  });

  // Lắng nghe route "EditPlantAreas" từ các CLIENTS
  // Hàm này nhận cây sẽ sửa, cập nhật vào DB và gửi thông tin đó cho TẤT CẢ CLIENTS đang kết nối để hiển thị đồng loạt
  socket.on("EditPlantAreas", function(cmd) {
    async function EditPlantAreasFn() {
      result = await db.queryEditPlantAreas(cmd); // Cập nhật vào DB
      if(result == "queryEditPlantAreas-OK")
        {
          result1 = await db.queryDisplayPlantAreas(); // Truy vấn thông tin cây
          if(result1 != "queryDisplayPlantAreas-ERROR")
            io.sockets.emit("PlantAreasData",result1); // Gửi thông tin cây đến TẤT CẢ CLIENTS đang kết nối   
          else console.log(result1);
        }
      else console.log(result);
    }  
    EditPlantAreasFn(); // Thực thi
  });

  socket.on("SensorsFromHard", function(cmd) {
    var str = cmd.split('.');
    const obj0 = {
      getSensorName: str[0],
      getSensorStt: (Number(str[1])*1.0/100)
    };
    console.log(obj0);
    const obj1 = {
      getSensorName: str[2],
      getSensorStt: (Number(str[3])*1.0/100)
    };
    console.log(obj1);
    const obj2 = {
      getSensorName: str[4],
      getSensorStt: (Number(str[5])*1.0/100)
    };
    console.log(obj2);
    async function SensorsFromHardFn() {
      result = await db.querySensorsFromHard(obj0);
      if(result == "querySensorsFromHard-OK")
        {
          result = await db.querySensorsFromHard(obj1);
          if(result == "querySensorsFromHard-OK")
          {
            result = await db.querySensorsFromHard(obj2);
            if(result == "querySensorsFromHard-OK")
            {
              result = await db.queryDisplaySensorsValue();
              if(result != "queryDisplaySensorsValue-ERROR")
              {
                io.sockets.emit("SensorsData",result);
                console.log("Thanh congggggggggggggggggggggggggggggg");
              }
            } else console.log(result);
          } else console.log(result);
        } else console.log(result);
    }
    SensorsFromHardFn();
  });
  
  var update; // Biến hỗ trợ update thời gian lặp interval
  var checkTime = false; // Biến hỗ trợ kiểm tra xem đã đến giờ hệ thống phải xử lý hay chưa
  var countStop = 0; // Biến đếm để tắt máy bơm sau khi bật N phút
  var timeInterval = 5000; // Mỗi 5s server sẽ kiểm tra giờ 1 lần, k nên để quá thấp hoặc quá cao.
  var controlPumpJSON = new Object(); // Tạo 1 JSON để cập nhật giá trị trạng thái BẬT/TẮT bơm vào DB
  controlPumpJSON.getDevicesName = "pump1"; // Tên là "pump1"
  clearInterval(update); // Xoá cache 
  var ajax_call = function()
  { 
    // Hai dòng code bên dưới này là để dùng cho demo thời gian thật
    //var date = new Date();
    //var current_hour = date.getHours();

    // Hàm này sẽ xử lý kiểm tra thời gian để bật tắt bơm và cập nhật cờ trạng thái cho 3 khung giờ
    // Cờ trạng thái giúp cho hệ thống biết được đã xử lý và bật máy bơm hay chưa
    // Đồng thời cũng giúp hệ thống không phải gửi câu lệnh bật/tắt quá nhiều lần đến CLIENTS

    async function GetWateringTimeFn() {
      result = await db.queryGetWateringTime(); // 1. Truy vấn giờ DEMO từ người dùng
      if(result != "queryGetWateringTime-ERROR")
      {
        result1 = await db.queryDisplayPlantAreas(); // 2. Truy vấn 3 khung giờ từ người dùng
        if(result1 != "queryDisplayPlantAreas-ERROR")
        {
          var timeJSON = new Object(); // Tạo 1 JSON để hỗ trợ cập nhật cờ trạng thái cho 3 khung giờ

          // Nếu (giờ DEMO == giờ wateringtime1) và đồng thời cờ trạng thái của khung giờ này chưa được set
          if(result[0].time == result1[0].wateringtime1 && result[0].checktime1 == 0)
          {
            timeJSON.time1 = 1; // Set cờ cho wateringtime1 lên
            timeJSON.time2 = 0; // Clear cờ cho wateringtime2 đi
            timeJSON.time3 = 0; // Clear cờ cho wateringtime3 đi
            checkTime = true; // Set biến này thành true(nghĩa là đã đến giờ xử lý)
            countStop++; // Biến này sẽ chạy để kích hoạt dòng if bên dưới, giúp cho hệ thống bắt đầu đếm ngược đến thời gian tắt
          }
          // Tương tự
          else if(result[0].time == result1[0].wateringtime2 && result[0].checktime2 == 0)
          {
            timeJSON.time1 = 0;
            timeJSON.time2 = 1;
            timeJSON.time3 = 0;
            checkTime = true;
            countStop++;
          }
          // Tương tự
          else if(result[0].time == result1[0].wateringtime3 && result[0].checktime3 == 0)
          {
            timeJSON.time1 = 0;
            timeJSON.time2 = 0;
            timeJSON.time3 = 1;  
            checkTime = true;
            countStop++;
          }

          // Nếu đã đến lúc hệ thống phải xử lý
          if(checkTime == true)
          {
            checkTime = false; // Hệ thống chỉ xử lý 1 lần khi đến giờ nên sẽ set biến này về FALSE
            result2 = await db.querySetDoneWateringTime(timeJSON); // Cập nhật các giá trị cờ
            if(result2 == "querySetDoneWateringTime-OK")
            {
              // Cập nhật giá trị BẬT bơm, giá trị này phải là 0 vì bên file "db.js" sẽ hỗ trợ đảo trạng thái
              controlPumpJSON.getDevicesStt = 0; 

              // Hàm này cập nhật vào DB và gửi các giá trị đó cho TẤT CẢ CLIENTS đang kết nối để hiển thị đồng loạt
              async function DevicesControlFn() {
                result = await db.queryDevicesControl(controlPumpJSON); // Cập nhật giá trị trạng thái
                if(result == "queryDevicesControl-OK")
                  {
                    result1 = await db.queryDisplayDevicesStt(); // Truy vấn giá trị trạng thái 
                    if(result1 != "queryDisplayDevicesStt-ERROR")
                      io.sockets.emit("DevicesSttData",result1); // Gửi giá trị trạng thái đến TẤT CẢ CLIENTS đang kết nối
                    else console.log(result1);
                  }
                else console.log(result);
              }  
              DevicesControlFn(); // Thực thi 
              console.log("WATERING ON"); // Xuất ra Terminal để kiểm tra thôi, k có gì
            }
            else console.log(result2);
          }
          
          // Đây là hàm sẽ thực thi việc đếm ngược
          if(countStop != 0)
          {
            countStop++; // Mỗi 5s sẽ tăng giá trị đếm lên 1
            /************ 
            * Ta có các tham số như sau:
            * X: Thời gian tắt (phút) - Lấy từ DB
            * Y: Thời gian interval (s) - Nhưng giá trị điền vào là Y*1000 (Ví dụ muốn 5s thì ta phải điền 5000)
            * Vì đơn vị hiện tại của X đang là phút nên ta phải đổi về giây -> X*60
            * Vì giá trị của Y là hàng ngàn nên ta phải đổi về hàng đơn vị mới có thể tính toán với X -> Y/1000
            * Ở phép tính bên dưới ta lấy (X*60)/(Y/1000) = Z
            * Z chính là hệ số mà ta phải đạt được sau mỗi lần đếm thì hệ thống mới tắt máy bơm
            * 
            * Ví dụ:
            * X: 1(phút) -> X*60 = 60
            * Y: 5000 -> Y/1000 = 5
            * Z = X/Y = 12
            * Thì khi hệ thống đếm lớn hơn hoặc đúng 12 lần sau 5s (tức là 1 phút) thì sẽ tắt máy bơm
            *************/

            if(countStop > (result1[0].wateringoff*60 / (timeInterval/1000)) )
            {
              // Cập nhật giá trị TẮT bơm, giá trị này phải là 1 vì bên file "db.js" sẽ hỗ trợ đảo trạng thái
              controlPumpJSON.getDevicesStt = 1;
              
              async function DevicesControlFn() {
                result = await db.queryDevicesControl(controlPumpJSON); // Cập nhật trạng thái
                if(result == "queryDevicesControl-OK")
                  {
                    result1 = await db.queryDisplayDevicesStt(); // Truy vấn giá trị trạng thái 
                    if(result1 != "queryDisplayDevicesStt-ERROR")
                      io.sockets.emit("DevicesSttData",result1); // Gửi giá trị trạng thái đến TẤT CẢ CLIENTS đang kết nối
                    else console.log(result1);
                  }
                else console.log(result);
              }  
              DevicesControlFn(); // Thực thi
              console.log("WATERING OFF"); // Xuất ra Terminal để kiểm tra thôi, k có gì
              countStop = 0;
            }
            console.log(countStop);
          }
            
        }
        else console.log(result1);
      }
      else console.log(result);
    }  
    GetWateringTimeFn(); // Thực thi

  }
  update = setInterval(ajax_call, timeInterval); // Gọi để lặp lại hàm ajaxcall sau timeInterval (ms)

});

// Khi người dùng truy cập vào url với đường link là '/' thì sẽ hiển thị giao diện trong file "dashboard.js" lên
app.get('/',function(req,res){
   res.render("dashboard");
});