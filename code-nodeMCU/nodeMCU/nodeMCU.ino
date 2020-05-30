#include <ESP8266HTTPClient.h>
#include <ESP8266WiFi.h>
#include <ArduinoJson.h>
#include <Arduino_JSON.h>
#include <SoftwareSerial.h> 
#include <SocketIoClient.h>

SoftwareSerial ss(D5, D1);    //RX - TX

SocketIoClient webSocket;

const char* Host_Socket = "192.168.0.106";
unsigned int Port_Socket=3000;

const String ssid = "MQ_Network";
const String pwdWifi = "1denmuoi1";
int devicesStatus[3] = {0,0,0};
int beginTime = 0;
int endTime = 0;

void setup() {
  Serial.begin(9600);
  ss.begin(9600);

  WiFi.begin(ssid, pwdWifi);

  while (WiFi.status() != WL_CONNECTED)
  {
    delay(500);
    Serial.print(".");
  }  
  webSocket.begin(Host_Socket, Port_Socket, "/socket.io/?transport=websocket");
  Serial.println("Connected");
  webSocket.emit("update-status","");
  webSocket.on("DevicesSttData", sendNano);
  beginTime = millis();
}

void loop() {
  if (endTime - beginTime > 3000) {
    String data = "";
    ss.print('a');
    delay(500);
    if(ss.available()!=0){
      while(ss.available()!=0){
        char temp = ss.read();
        data = data + temp; 
      }
      int len=1;
      while (data[len] != NULL){
        len++;
      }
      char str[len+1];
      data.toCharArray(str, len+1);
      webSocket.emit("SensorsFromHard", str);
    }
    beginTime = millis();
  }
  if (ss.available()>0){
    String data = "";
    int beginTimeSS, endTimeSS = millis();
    while (ss.available()>0){
      char temp = ss.read();
      data = data + temp;
      delay(10);
    }
    int len=1;
    while (data[len] != NULL){
      len++;
    }
    char str[len+1];
    data.toCharArray(str, len+1);
    Serial.print(str);
    webSocket.emit("DevicesControlNodeMCU", str);
  }
  endTime = millis();
  webSocket.loop();
}
void sendNano(const char * payload, size_t length){
  pareJson_Data(payload);
  ss.print("{\"light\":"+(String)devicesStatus[0]+",\"pump\":"+(String)devicesStatus[1]+",\"fan\":"+(String)devicesStatus[2]+"}");
}
void pareJson_Data(String strJson)
{
  if (strJson != "")
  {
    DynamicJsonBuffer jsonBuffer;       // khai báo biến
    JsonArray &root = jsonBuffer.parseArray(strJson);     // chuỗi Json từ nodeMCU truyền qua là dạng chuỗi JsonArray (ví dụ chuỗi có dạng: [{"S1":"1"},{"S2":"0"},{"S3":"0"}]  trong mỗi cặp dấu {} là 1 Object - nghĩa là Array bao gồm nhiều Object - mỗi Object bao gồm định danh và giá trị) nên sẽ pair theo dạng mảng 2 chiều
    if (!root.success()) {
      Serial.println("parseArray() failed");              // vào đây tức là parse thất bại
    } else {
      int A=root.size(); //root[index]["Obj"]             // nếu parse thành công thì sẽ gán 3 trạng thái lấy được trên server thông qua nodeMCU gán vào mảng tạm tempStatus
      devicesStatus[0] = !root[0]["stt"]; 
      devicesStatus[1] = !root[1]["stt"];
      devicesStatus[2] = !root[2]["stt"];                  // sau khi lấy giá trị trạng thái xong thì phải làm sạch chuỗi để chuẩn bị cho lần nhận tiếp theo
    }
  }
}
