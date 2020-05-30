#include "function.h"

void setup() {
  initFunction();
}

void loop() {
  dislayLCD();
  if (ss.available()!=0){
    char temp= ss.read();
    if (temp=='a'){
      sendDataSensor();
    } else {
      String payLoad = "";
      payLoad = temp;
      while(ss.available()!=0){
         temp = ss.read();
         payLoad += temp;
         delay(10);
      }
      Serial.println("Payload: " + payLoad);
      pareJson_Data(payLoad);
    }
  }
  controlDevice_Button();  
  //delay(1000);
  readSensor_DHT();
  readSensor_Soil();
}
