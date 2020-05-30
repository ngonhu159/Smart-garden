var plantparse; // Đây là biến lưu chuỗi JSON về thông tin cây

$('#idPlantForm').submit(function () {
	// Thông thường khi ấn SUBMIT trong form thì hệ thống sẽ tự động chuyển đến 1 trang khác
	// Tuy ta sẽ handle việc này bằng cách gọi hàm "EditPlantAreas()" thay vì chuyển sang 1 trang mới.
	EditPlantAreas();
	return false;
});

// Hàm bên dưới đây sẽ thực hiện việc hiển thị thông tin khi người dùng trỏ chuột vào 1 trong các input (tooltip)
(function ($) {
	function RegisterCapcha() {
		// select all desired input fields and attach tooltips to them
		$("#myform :input").tooltip({

			// place tooltip on the right edge
			position: "center right",

			// a little tweaking of the position
			offset: [-2, 10],

			// use the built-in fadeIn/fadeOut effect
			effect: "fade",

			// custom opacity setting
			opacity: 0.7

		});
	}
}(jQuery));

$(document).ready(function () {
	socket.emit("DisplayPlantAreas"); // Gửi yêu cầu lấy thông tin cây đến SERVER thông qua route "DisplayPlantAreas"
	socket.on("PlantAreasData", function (msg) {// Nhận thông tin cây từ SERVER thông qua route "PlantAreasData"
		plantparse = JSON.parse(JSON.stringify(msg));

		// Lấy các giá trị tương ứng
		var plantA = "";
		var checkWateringTime1 = plantparse[0].wateringtime1;
		var checkWateringTime2 = plantparse[0].wateringtime2;
		var checkWateringTime3 = plantparse[0].wateringtime3;

		// Ở đây thực hiện xử lý việc hiển thị hai dấu gạch ngang khi k có thời gian tưới
		// Chúng ta sẽ tự định nghĩa khi k có thời gian tưới thì giá trị được lưu trong DB là -1
		if (checkWateringTime1 == -1)
			checkWateringTime1 = "--/";
		else checkWateringTime1 += "h/";
		if (checkWateringTime2 == -1)
			checkWateringTime2 = "--/";
		else checkWateringTime2 += "h/";
		if (checkWateringTime3 == -1)
			checkWateringTime3 = "--";
		else checkWateringTime3 += "h";


		// Nếu trường "name" = null, tức là cây đã bị xoá -> Hiển thị (TRỐNG)
		if (plantparse[0].name == null) {
			plantA = "Cây Trồng: (Trống) \
			<br>Ngày Trồng: (Trống) \
			<br>Thu Hoạch: (Trống) \
			<br>Tưới: (Trống) \
			<br>Tắt Sau: (Trống)";
		}
		else // Còn k thì sẽ hiển thị thông tin cây
		{
			plantA = "\
			Cây Trồng: " + plantparse[0].name + "\
			<br>Ngày Trồng: " + plantparse[0].datebegin + "\
			<br>Thu Hoạch: " + plantparse[0].dateend + "\
			<br>Tưới: " + checkWateringTime1 + checkWateringTime2 + checkWateringTime3 + "\
			<br>Tắt Sau: " + plantparse[0].wateringoff + "phút";
		}

		document.getElementById("idPlant1").innerHTML = plantA; // Hiển thị
	});
});

// Đây là hàm hiển thị FORM chỉnh sửa thông tin cây khi người dùng nhấn vào khu vực thông tin cây
function ConfigPlant(area) {
	// Hiển thị các thông tin cây hiện tại
	document.getElementById("idplantlable").innerHTML = "THAY ĐỔI THÔNG TIN CÂY";
	document.getElementById("idplantname").value = plantparse[0].name;
	document.getElementById("iddatebegin").value = plantparse[0].datebegin;
	document.getElementById("iddateend").value = plantparse[0].dateend;

	// Nếu giá trị tưới = -1 (tức là trống) thì hiển thị trống bằng cách hiển thị ''
	if (plantparse[0].wateringtime1 == -1)
		document.getElementById("idwateringtime1").value = '';
	else
		document.getElementById("idwateringtime1").value = plantparse[0].wateringtime1;
	if (plantparse[0].wateringtime2 == -1)
		document.getElementById("idwateringtime2").value = '';
	else
		document.getElementById("idwateringtime2").value = plantparse[0].wateringtime2;
	if (plantparse[0].wateringtime3 == -1)
		document.getElementById("idwateringtime3").value = '';
	else
		document.getElementById("idwateringtime3").value = plantparse[0].wateringtime3;

	document.getElementById("idwateringoff").value = plantparse[0].wateringoff;

	document.getElementById('idInputPlantForm').style.display = 'block';
}

// Hàm này được gọi khi người dùng nhấn nút DEL trong FORM chỉnh sửa thông tin cây
function DelPlant() {
	// Vì trước đó có 2 cây nên là sẽ có giá trị 1 và 2, nhưng hiện tại chỉ còn 1 cây thôi
	// Nhưng đây cũng là điều kiện để phân biệt cây nên KHÔNG ĐƯỢC XOÁ
	var idPlant = 1;
	socket.emit("DelPlantAreas", idPlant); // Gửi định danh của cây đến SERVER để thực hiện việc xoá cây
	document.getElementById('idInputPlantForm').style.display = "none"; // Đóng FORM lại
}

// Hàm này sẽ được gọi khi người dùng nhấn vào nút EDIT trong FORM chỉnh sửa thông tin cây
function EditPlantAreas() {
	// Vì trước đó có 2 cây nên là sẽ có giá trị 1 và 2, nhưng hiện tại chỉ còn 1 cây thôi
	// Nhưng đây cũng là điều kiện để phân biệt cây nên KHÔNG ĐƯỢC XOÁ
	var idPlant = 1;
	var combineJSON = new Object();

	// Lấy các giá trị người dùng nhập vào 
	combineJSON.name = document.getElementById("idplantname").value;
	combineJSON.datebegin = document.getElementById("iddatebegin").value;
	combineJSON.dateend = document.getElementById("iddateend").value;

	var checkWateringTime1 = document.getElementById("idwateringtime1").value;
	var checkWateringTime2 = document.getElementById("idwateringtime2").value;
	var checkWateringTime3 = document.getElementById("idwateringtime3").value;

	// Kiểm tra xem các giờ tưới có trùng nhau không
	var checkDuplicateWateringTime = false;
	var checkDuplicateWateringTime = false;
	if (checkWateringTime1 == checkWateringTime2 || checkWateringTime1 == checkWateringTime3) {
		if (checkWateringTime1.length > 0)
			checkDuplicateWateringTime = true;
	}
	else if (checkWateringTime2 == checkWateringTime3) {
		if (checkWateringTime2.length > 0)
			checkDuplicateWateringTime = true;
	}

	if (checkWateringTime1.length == 0)
		combineJSON.wateringtime1 = -1;
	else
		combineJSON.wateringtime1 = checkWateringTime1;

	if (checkWateringTime2.length == 0)
		combineJSON.wateringtime2 = -1;
	else
		combineJSON.wateringtime2 = checkWateringTime2;

	if (checkWateringTime3.length == 0)
		combineJSON.wateringtime3 = -1;
	else
		combineJSON.wateringtime3 = checkWateringTime3;

	combineJSON.wateringoff = document.getElementById("idwateringoff").value;
	combineJSON.id = idPlant;

	// Kiểm tra xem giờ thu hoạch có lớn hơn (sau) ngày trồng không
	var startDate = new Date(combineJSON.datebegin);
	var endDate = new Date(combineJSON.dateend);
	if (startDate <= endDate) {
		if (checkDuplicateWateringTime == false) {
			document.getElementById('idInputPlantForm').style.display = "none"; // Đóng FORM
			socket.emit("EditPlantAreas", combineJSON); // Nếu đạt hết điều kiện thì gửi các thông tin input đến SERVER 
		}
		else
			alert("Watering time must be different!!!");
	}
	else
		alert("EndDate must be greater than StartDate!!!");
}


// Đây là hàm sẽ thực hiện việc đóng cái FORM lại khi người dùng nhấn bất cứ đâu ngoài cái FORM
window.onclick = function (event) {
	if (event.target == document.getElementById('idInputPlantForm')) {
		document.getElementById('idInputPlantForm').style.display = "none";
	}
}
