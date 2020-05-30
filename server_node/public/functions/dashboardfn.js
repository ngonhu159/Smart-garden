var socket = io(); // Khởi tạo socket

// Các giá trị trạng thái của thiết bị
var sttLight1;
var sttPump1;
var sttFan;

// Các giá trị MAX của cảm biến hiện tại, người dùng có thể thay đổi để phù hợp với giá trị đo được thực tế
var HIGH_TEMP_RANGE = 35;
var HIGH_HUMI_RANGE = 115;
var HIGH_GHUMI_RANGE = 115;


$(document).ready(function() {
	socket.emit("DisplaySensorsValue"); // Gửi yêu cầu lấy dữ liệu cảm biến đến SERVER thông qua route "DisplaySensorsValue"
	socket.on("SensorsData",function(msg){ // Nhận giá trị cảm biến từ SERVER thông qua route "SensorsData"
		var sensorParse = JSON.parse(JSON.stringify(msg)); // Tách JSON
		DisplaySensor(sensorParse); // Hiển thị
	});

	socket.emit("DisplayDevicesStt"); // Gửi yêu cầu lấy dữ liệu các thiết bị đến SERVER thông qua route "DisplayDevicesStt"
	socket.on("DevicesSttData",function(msg){ // Nhận giá trị các thiết bị từ SERVER thông qua route "DevicesSttData"
		var deviceParse = JSON.parse(JSON.stringify(msg)); // Tách JSON

		// Lấy các trạng thái để phục vụ cho việc điều khiển trạng thái ở hàm "DevicesControl()"
		sttLight1 = deviceParse[0].stt; 
		sttPump1 = deviceParse[1].stt;
		sttFan = deviceParse[2].stt;

		for(var i = 0; i < 3; i++)
		{
			DisplayDevices(deviceParse[i].name,deviceParse[i].stt);// Hiển thị
		}
	});
});

// Hàm này sẽ hiển thị giá trị các cảm biến
function DisplaySensor(sensorParse)
{
	// Lấy các giá trị cảm biến từ JSON được truyền vào 
	var getTempValue = sensorParse[0].value;
	var getHumiValue = sensorParse[1].value;
	var getGHumiValue = sensorParse[2].value;

	// Nếu giá trị hiện tại lớn hơn ngưỡng MAX
	if(getTempValue >= HIGH_TEMP_RANGE)
	{
		document.getElementById("TempText").innerHTML = sensorParse[0].value + "°C";
		document.getElementById("TempText").style.color = "#F00D0D"; // Hiển thị màu đỏ
	}
	else if(getTempValue < HIGH_TEMP_RANGE)
	{
		document.getElementById("TempText").innerHTML = sensorParse[0].value + "°C";
		document.getElementById("TempText").style.color = "#0D27F0"; // Hiển thị màu xanh
	}

	// Tương tự
	if(getHumiValue >= HIGH_HUMI_RANGE)
	{
		document.getElementById("HumiText").innerHTML = sensorParse[1].value + "%";
		document.getElementById("HumiText").style.color = "#F00D0D";

	}
	else if(getHumiValue < HIGH_HUMI_RANGE)
	{
		document.getElementById("HumiText").innerHTML = sensorParse[1].value + "%";
		document.getElementById("HumiText").style.color = "#0D27F0";
	}

	// Tương tự
	if(getGHumiValue >= HIGH_GHUMI_RANGE)
	{
		document.getElementById("GHumiText").innerHTML = sensorParse[2].value + "%";
		document.getElementById("GHumiText").style.color = "#F00D0D";

	}
	else if(getGHumiValue < HIGH_GHUMI_RANGE)
	{
		document.getElementById("GHumiText").innerHTML = sensorParse[2].value + "%";
		document.getElementById("GHumiText").style.color = "#0D27F0";
	}

}

// Hàm này sẽ hiển thị trạng thái các thiết bị
function DisplayDevices(devicename,stt)
{
	// Nếu "devicename" truyền vào là gì thì sẽ chạy vào hàm tương ứng và hiển thị trạng thái "stt" tương ứng
	if(devicename == "light1")
	{
		if(stt == true)
		{
			document.getElementById("idBtnLight1").style.backgroundColor = '#5CC007'; // Màu đỏ
			document.getElementById("idBtnLight1").innerHTML = 'ON';
		}
		else
		{
			document.getElementById("idBtnLight1").style.backgroundColor = '#E20505'; // Màu xánh
			document.getElementById("idBtnLight1").innerHTML = 'OFF';
		}
	}

	// Tương tự
	else if(devicename == "pump1")
	{
		if(stt == true)
		{
			document.getElementById("idBtnPump1").style.backgroundColor = '#5CC007';
			document.getElementById("idBtnPump1").innerHTML = 'ON';
		}
		else
		{
			document.getElementById("idBtnPump1").style.backgroundColor = '#E20505';
			document.getElementById("idBtnPump1").innerHTML = 'OFF';
		}
	}

	// Tương tự
	else if (devicename == "fan")
	{
		if(stt == true)
		{
			document.getElementById("idBtnFan").style.backgroundColor = '#5CC007';
			document.getElementById("idBtnFan").innerHTML = 'ON';
		}
		else
		{
			document.getElementById("idBtnFan").style.backgroundColor = '#E20505';
			document.getElementById("idBtnFan").innerHTML = 'OFF';
		}
	}
}

// Hàm này sẽ điều khiển thiết bị
function DevicesControl(devicename){
	var getControlJSON = new Object();
	getControlJSON.getDevicesName = devicename; // Lấy tên thiết bị muốn điều khiển
	getControlJSON.getDevicesStt = null;

	// Lấy trạng thái các thiết bị hiện tại, sau đó gửi để SERVER và SERVER sẽ gửi đến DB
	// ############# LƯU Ý : Đảo trạng thái ở khâu DB chứ k đổi ở đây
	if(devicename == "light1")
	{
		getControlJSON.getDevicesStt = sttLight1; 
	}
	else if(devicename == "pump1")
	{
		getControlJSON.getDevicesStt = sttPump1;
	}

	else if (devicename == "fan")
	{
		getControlJSON.getDevicesStt = sttFan;
	}
	
	socket.emit("DevicesControl",getControlJSON); // Gửi thiết bị và giá trị trạng thái muốn điều khiển đến SERVER
}
