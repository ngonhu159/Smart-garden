#include <SoftwareSerial.h>
#include <LiquidCrystal_I2C.h>
#include "DHT.h"
#include <ArduinoJson.h>
#include <Arduino_JSON.h>
#include <Adafruit_Sensor.h>

SoftwareSerial ss(10,11); // RX, TX

#define pin_dht A3
#define pin_sensorSoil A2

const int DHT_type = DHT22;  //Khai báo loại cảm biến, có 2 loại là DHT11 và DHT22
DHT dht(pin_dht, DHT_type);
LiquidCrystal_I2C lcd(0x27,16,2);

const int button[5] = {9, 12, 13};
const int relay[5] = {4, 5, 6};
int statusRelay[5] = {1,1,1};

float Temp = 0;         // bien nhan gia tri nhiet do tu DHT22
float Humi = 0;         // bien nhan gia tri do am tu DHT22
int sensorSoil = 0;   // bien nhan gia tri do am dat tu cam bien do am dat
bool checkLCD = true;
/*--------------------init function--------------------*/
void initFunction(){
  Serial.begin(9600);
  ss.begin(9600);

  dht.begin();        // Khoi dong DHT22
  
  lcd.init();         //Khởi động màn hình. Bắt đầu cho phép Arduino sử dụng màn hình
  lcd.backlight();    //Bật đèn nền

  for (int i =0; i<5; i++){         // set mode cho cac chan: button - input, relay - output
    pinMode(button[i], INPUT);
    pinMode(relay[i], OUTPUT);
  }
  pinMode(pin_sensorSoil, INPUT);       // set chan input doc analog cho cam bien dat

  for (int i=0; i<5; i++)                             // dieu khien thiet bị nhan tu webserver ve
  {
    digitalWrite(relay[i], statusRelay[i]);
  }
}

/*--------------------ReadSensor function--------------------*/
void readSensor_DHT()     // hàm đọc giá trị nhiệt độ - độ ẩm
{
  Humi = dht.readHumidity();          //Read Humidity
  Temp = dht.readTemperature();       //Read Temperature
  Serial.println("Gia tri nhiet do: " + (String)Humi + " Gia tri do am: " + (String)Temp);
}
void readSensor_Soil(){
  sensorSoil = analogRead(pin_sensorSoil);
  Serial.println("Gia tri do am dat: " + (String)sensorSoil);
}
/*--------------------Controler function--------------------*/
void controlDevice_Button(){
  if (!digitalRead(button[0])){
    while(!digitalRead(button[0])){
      Serial.print("Vao button 0");
    }
    statusRelay[0]=!statusRelay[0];
    digitalWrite(relay[0], statusRelay[0]);
    ss.print("light1."+(String)statusRelay[0]);
    checkLCD=true;
  }
  if (!digitalRead(button[1])){
    while(!digitalRead(button[1])){
      Serial.print("Vao button 1");
    }
    statusRelay[1]=!statusRelay[1];
    digitalWrite(relay[1], statusRelay[1]);
    ss.print("pump1."+(String)statusRelay[1]);
    checkLCD=true;
  }
  if (!digitalRead(button[2])){
    while(!digitalRead(button[2])){
      Serial.print("Vao button 2");
    }
    statusRelay[2]=!statusRelay[2];
    digitalWrite(relay[2], statusRelay[2]);
    ss.print("fan."+(String)statusRelay[2]);  
    checkLCD=true;
  }
} 
/*--------------------sendData function--------------------*/
void sendDataSensor(){
  String T = String(int(Temp*100));
  String H = String(int(Humi*100));
  String S = String(int(sensorSoil));
  Serial.println("T: "+T+" S: "+S+" H: "+H);
  ss.print("temp."+T+".humi."+H+".groundhumi."+S);
}
/*--------------------Parse function--------------------*/
void pareJson_Data(String strJson)
{
  if (strJson != "")
  {
    DynamicJsonBuffer jsonBuffer;       // khai báo biến
    JsonObject &root = jsonBuffer.parseObject(strJson);     // chuỗi Json từ nodeMCU truyền qua là dạng chuỗi JsonArray (ví dụ chuỗi có dạng: [{"S1":"1"},{"S2":"0"},{"S3":"0"}]  trong mỗi cặp dấu {} là 1 Object - nghĩa là Array bao gồm nhiều Object - mỗi Object bao gồm định danh và giá trị) nên sẽ pair theo dạng mảng 2 chiều
    if (!root.success()) {
      Serial.println("parseArray() failed");              // vào đây tức là parse thất bại
    } else {
      int A=root.size(); //root[index]["Obj"]             // nếu parse thành công thì sẽ gán 3 trạng thái lấy được trên server thông qua nodeMCU gán vào mảng tạm tempStatus
      statusRelay[0] = root["light"]; 
      statusRelay[1] = root["pump"];
      statusRelay[2] = root["fan"];     
      strJson = "";                                       // sau khi lấy giá trị trạng thái xong thì phải làm sạch chuỗi để chuẩn bị cho lần nhận tiếp theo
      for (int i=0; i<5; i++)                             // dieu khien thiet bị nhan tu webserver ve
      {
        digitalWrite(relay[i], statusRelay[i]);
      }
      checkLCD=true;
    }
  }
}
void dislayLCD(){
  if (checkLCD) {
    lcd.clear();
    lcd.setCursor(0,1);                       // chon vi tri hien thi bat dau tai cot 4, dong 0
    lcd.print("L:");
    if (statusRelay[0]){
      lcd.print("OFF");
    } else lcd.print("ON");
    lcd.setCursor(6,1);                       // chon vi tri hien thi bat dau tai cot 4, dong 0
    lcd.print("P:");
    if (statusRelay[1]){
      lcd.print("OFF");
    } else lcd.print("ON");
  
    lcd.setCursor(12,1);                       // chon vi tri hien thi bat dau tai cot 4, dong 0
    lcd.print("F:");
    if (statusRelay[2]){
      lcd.print("OFF");
    } else lcd.print("ON");
    checkLCD=false;
  }
  lcd.setCursor(0,0);                       // chon vi tri hien thi bat dau tai cot 4, dong 0
  lcd.print("T:");
  lcd.print((String)((int)Temp));
  
  lcd.setCursor(6,0);                       // chon vi tri hien thi bat dau tai cot 4, dong 0
  lcd.print("H:");
  lcd.print((String)((int)Humi));

  lcd.setCursor(12,0);                       // chon vi tri hien thi bat dau tai cot 4, dong 0
  lcd.print("S:");
  lcd.print((String)((int)sensorSoil/100));
}
