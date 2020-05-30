var mysql = require('mysql'); // Khởi tạo câu lệnh DB
var pool = mysql.createPool({
    connectionLimit: 20,
    host: "localhost", // Host mặc định
  	user: "root", // User mặc định
  	password: "", // Password mặc định
  	dateStrings: true, 
  	database: "mygarden" // Tên database
});

// Các hàm bên dưới sẽ được gọi từ file "server.js"

// Hàm này sẽ truy vấn và trả về các giá trị cảm biến 
exports.queryDisplaySensorsValue = function () {
	return new Promise (function (resolve, reject) {
		pool.query("SELECT * FROM sensor;", function(err, rows, fields) { // Truy vấn
			if (err) reject(err); 
			if(rows.length>0){
				resolve(rows);
			}
			else resolve("queryDisplaySensorsValue-ERROR");
		});
	});
}

// Hàm này sẽ truy vấn và trả về các giá trị trạng thái của các thiết bị
exports.queryDisplayDevicesStt = function () {
	return new Promise (function (resolve, reject) {
		pool.query("SELECT * FROM device;", function(err, rows, fields) { // Truy vấn
			if (err) reject(err); 
			if(rows.length>0){
				resolve(rows);
			}
			else resolve("queryDisplayDevicesStt-ERROR");
		});
	});
}

// Hàm này sẽ cập nhật giá trị trạng thái của các thiết bị
// Đồng thời sẽ đảm nhiệm chức năng đảo trạng thái
exports.queryDevicesControl = function (cmd) {
	var getJSON = JSON.parse(JSON.stringify(cmd)); // Tách JSON
	var getDevicesName = getJSON.getDevicesName; // Lấy tên thiết bị sẽ điều khiển
	var getDevicesStt = !getJSON.getDevicesStt; // Lấy trạng thái thiết bị sẽ điều khiển và đảo trạng thái 
	console.log("getDevicesName = " + getDevicesName + " getDevicesStt = " + getDevicesStt);
	// Kết hợp các tham số thành 1 câu truy vấn hoàn chỉnh
	var combineCMD = "UPDATE device SET stt = " + getDevicesStt + " WHERE name = '" + getDevicesName + "';";
	
	return new Promise (function (resolve, reject) {
		pool.query(combineCMD, function(err, rows, fields) { // Truy vấn
			if (err) reject(err); 
			resolve("queryDevicesControl-OK");
		});
	});
}

// Hàm này sẽ truy vấn và trả về các thông tin cây trồng
exports.queryDisplayPlantAreas = function () {
	return new Promise (function (resolve, reject) {
		pool.query("SELECT * FROM plant;", function(err, rows, fields) { // Truy vấn
			if (err) reject(err); 
			if(rows.length>0){
				resolve(rows);
			}
			else resolve("queryDisplayPlantAreas-ERROR");
		});
	});
}
		
// Hàm này sẽ nhận thông tin cây muốn xoá và cập nhật vào DB
exports.queryDelPlantAreas = function (idPlant) {
	// Kết hợp các tham số thành 1 câu truy vấn hoàn chỉnh
	var cmd = "UPDATE plant SET name = Null, datebegin = Null, dateend = Null,\
		wateringtime1 = Null, wateringtime2 = Null, wateringtime3 = Null, wateringoff = Null\
		WHERE id = '" + idPlant + "';";

	return new Promise (function (resolve, reject) {
		pool.query(cmd, function(err, rows, fields) { // Truy vấn
			if (err) reject(err);
			resolve("queryDelPlantAreas-OK");
		});
	});
}

// Hàm này sẽ nhận thông tin cây muốn chỉnh sửa và cập nhật vào DB
exports.queryEditPlantAreas = function (cmd) {
	var getJSON = JSON.parse(JSON.stringify(cmd)); // Tách JSON

	// Lấy các giá trị 
	var getPlantName = getJSON.name;
	var getDateBegin = getJSON.datebegin;
	var getDateEnd = getJSON.dateend;
	var getWateringTime1 = getJSON.wateringtime1;
	var getWateringTime2 = getJSON.wateringtime2;
	var getWateringTime3 = getJSON.wateringtime3;
	var getWateringOff = getJSON.wateringoff;
	var getidPlant = getJSON.id;

	// Kết hợp các tham số thành 1 câu truy vấn hoàn chỉnh
	var combineCMD = "UPDATE plant SET name = '"+ getPlantName + "',\
	datebegin = '" + getDateBegin + "',\
	dateend = '" + getDateEnd + "',\
	wateringtime1 = '" + getWateringTime1 + "',\
	wateringtime2 = '" + getWateringTime2 + "',\
	wateringtime3 = '" + getWateringTime3 + "',\
	wateringoff = '" + getWateringOff + "' WHERE id = " + getidPlant;

	return new Promise (function (resolve, reject) {
		pool.query(combineCMD, function(err, rows, fields) { // Truy vấn
			if (err) reject(err);
			resolve("queryEditPlantAreas-OK");
		});
	});
}


exports.querySensorsFromHard = function (cmd) {
	var getJSON = JSON.parse(JSON.stringify(cmd));
	var getSensorName = getJSON.getSensorName;
	var getSensorStt = getJSON.getSensorStt; 
	
	var combineCMD = "UPDATE sensor SET value = " + getSensorStt + " WHERE name = '" + getSensorName + "';";
	//console.log(combineCMD);
	return new Promise (function (resolve, reject) {
		pool.query(combineCMD, function(err, rows, fields) { 
			if (err) reject(err); 
			resolve("querySensorsFromHard-OK");
		});
	});
}

// Hai hàm bên dưới đây sẽ hỗ trợ cho việc kiếm tra thời gian tắt mở máy bơm
// Hàm này sẽ truy vấn và trả về thời gian DEMO từ người dùng, các cờ để kiểm tra máy bơm đã bật hay chưa
exports.queryGetWateringTime = function () {
	return new Promise (function (resolve, reject) {
		pool.query("SELECT * FROM wateringtimecheck;", function(err, rows, fields) { // Truy vấn
			if (err) reject(err); 
			if(rows.length>0){
				resolve(rows);
			}
			else resolve("queryGetWateringTime-ERROR");
		});
	});
}

// Hàm này sẽ cập nhật trạng thái các cờ để kiểm tra máy bơm đã bật hay chưa
exports.querySetDoneWateringTime = function (timestt) {
	var getJSON = JSON.parse(JSON.stringify(timestt)); // Tách JSON
	// Lấy giá trị trạng thái của 3 cờ
	var getTime1 = getJSON.time1;
	var getTime2 = getJSON.time2;
	var getTime3 = getJSON.time3;

	// Kết hợp các tham số thành 1 câu truy vấn hoàn chỉnh
	var cmd = "UPDATE wateringtimecheck SET checktime1 = '" + getTime1 + "', checktime2 = '" + getTime2 + "',checktime3 = '" + getTime3 +"'WHERE id = 1";
	return new Promise (function (resolve, reject) {
		pool.query(cmd, function(err, rows, fields) { // Truy vấn
			if (err) reject(err);
			resolve("querySetDoneWateringTime-OK");
		});
	});
}


